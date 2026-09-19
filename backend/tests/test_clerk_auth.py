import time
import uuid

import jwt
import pytest
from cryptography.hazmat.primitives.asymmetric import rsa
from jwt.algorithms import RSAAlgorithm

from app import clerk_auth

KID = "test-kid-1"
ISSUER = "https://test.clerk.accounts.dev"


def _rsa_keypair():
    import json

    private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
    jwk = json.loads(RSAAlgorithm.to_jwk(private_key.public_key()))
    jwk["kid"] = KID
    jwk["alg"] = "RS256"
    jwk["use"] = "sig"
    return private_key, {"keys": [jwk]}


@pytest.fixture
def jwks_setup(monkeypatch):
    private_key, jwks = _rsa_keypair()
    clerk_auth.reset_jwks_cache()
    monkeypatch.setattr(clerk_auth, "_fetch_jwks", lambda: jwks)
    monkeypatch.setattr(clerk_auth.settings, "clerk_issuer", ISSUER)
    yield private_key
    clerk_auth.reset_jwks_cache()


def _token(private_key, **overrides):
    now = int(time.time())
    payload = {
        "sub": "user_abc123",
        "iss": ISSUER,
        "iat": now,
        "exp": now + 3600,
        "azp": "http://localhost:5173",
        "sid": "sess_" + uuid.uuid4().hex,
    }
    payload.update(overrides)
    return jwt.encode(payload, private_key, algorithm="RS256", headers={"kid": KID})


def test_valid_token_returns_claims(jwks_setup):
    claims = clerk_auth.verify_clerk_token(_token(jwks_setup))
    assert claims["sub"] == "user_abc123"
    assert claims["iss"] == ISSUER


def test_expired_token_rejected(jwks_setup):
    token = _token(jwks_setup, exp=int(time.time()) - 60)
    with pytest.raises(jwt.ExpiredSignatureError):
        clerk_auth.verify_clerk_token(token)


def test_wrong_issuer_rejected(jwks_setup):
    token = _token(jwks_setup, iss="https://evil.example.com")
    with pytest.raises(jwt.InvalidIssuerError):
        clerk_auth.verify_clerk_token(token)


def test_unknown_kid_rejected(jwks_setup):
    now = int(time.time())
    token = jwt.encode(
        {"sub": "user_x", "iss": ISSUER, "iat": now, "exp": now + 60},
        jwks_setup,
        algorithm="RS256",
        headers={"kid": "other-kid"},
    )
    with pytest.raises(jwt.InvalidTokenError):
        clerk_auth.verify_clerk_token(token)


def test_tampered_token_rejected(jwks_setup):
    token = _token(jwks_setup)
    parts = token.split(".")
    parts[1] = parts[1][:-2] + "xx"
    with pytest.raises(jwt.InvalidSignatureError):
        clerk_auth.verify_clerk_token(".".join(parts))


def _clerk_user(email, verified=True):
    return {
        "primary_email_address_id": "e1",
        "email_addresses": [
            {
                "id": "e1",
                "email_address": email,
                "verification": {"status": "verified" if verified else "unverified"},
            }
        ],
    }


def test_primary_email_verified():
    from app.dependencies import _primary_email

    assert _primary_email(_clerk_user("a@b.c"), require_verified=True) == "a@b.c"


def test_primary_email_unverified_rejected():
    from app.dependencies import _primary_email

    assert _primary_email(_clerk_user("a@b.c", verified=False), require_verified=True) is None


class _Profile:
    def __init__(self, clerk_user_id=None):
        self.clerk_user_id = clerk_user_id
        self.saved = False

    def save(self):
        self.saved = True


def _provision_setup(monkeypatch, profile, exists):
    from app import dependencies

    monkeypatch.setattr(
        dependencies, "_fetch_clerk_user", lambda uid: _clerk_user("a@b.c")
    )
    monkeypatch.setattr(dependencies, "_clerk_user_exists", lambda uid: exists)
    monkeypatch.setattr(
        dependencies.UserService,
        "find_by_email",
        staticmethod(lambda email: profile),
    )
    return dependencies


def test_provision_rebinds_deleted_clerk_user(monkeypatch):
    profile = _Profile(clerk_user_id="user_deleted")
    deps = _provision_setup(monkeypatch, profile, exists=False)
    user = deps._provision_profile("user_new")
    assert user is profile
    assert profile.clerk_user_id == "user_new"
    assert profile.saved


def test_provision_conflicts_live_clerk_user(monkeypatch):
    from fastapi import HTTPException

    profile = _Profile(clerk_user_id="user_other")
    deps = _provision_setup(monkeypatch, profile, exists=True)
    with pytest.raises(HTTPException) as exc:
        deps._provision_profile("user_new")
    assert exc.value.status_code == 409
    assert profile.clerk_user_id == "user_other"


def test_provision_claims_unlinked_profile(monkeypatch):
    profile = _Profile(clerk_user_id=None)
    deps = _provision_setup(monkeypatch, profile, exists=True)
    user = deps._provision_profile("user_new")
    assert profile.clerk_user_id == "user_new"
    assert profile.saved

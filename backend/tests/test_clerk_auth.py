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

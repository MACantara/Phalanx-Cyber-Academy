import json
import time

import httpx
import jwt
from jwt.algorithms import RSAAlgorithm

from .config import settings

_JWKS_TTL_SECONDS = 300
_jwks_cache: dict = {"keys": None, "expires_at": 0.0}


def _fetch_jwks() -> dict:
    if not settings.clerk_jwks_url:
        raise RuntimeError("CLERK_JWKS_URL is not configured")
    response = httpx.get(settings.clerk_jwks_url, timeout=10)
    response.raise_for_status()
    return response.json()


def _get_keys() -> list:
    if _jwks_cache["keys"] is None or time.time() >= _jwks_cache["expires_at"]:
        _jwks_cache["keys"] = _fetch_jwks().get("keys", [])
        _jwks_cache["expires_at"] = time.time() + _JWKS_TTL_SECONDS
    return _jwks_cache["keys"]


def _signing_key(kid: str | None):
    keys = _get_keys()
    jwk = next((k for k in keys if k.get("kid") == kid), None)
    if jwk is None:
        # Key may have rotated; force one refresh before giving up.
        _jwks_cache["expires_at"] = 0
        keys = _get_keys()
        jwk = next((k for k in keys if k.get("kid") == kid), None)
    if jwk is None:
        raise jwt.InvalidTokenError("Unknown signing key")
    return RSAAlgorithm.from_jwk(json.dumps(jwk))


def verify_clerk_token(token: str) -> dict:
    header = jwt.get_unverified_header(token)
    key = _signing_key(header.get("kid"))

    options = {"verify_aud": False}
    kwargs: dict = {}
    if settings.clerk_issuer:
        kwargs["issuer"] = settings.clerk_issuer

    return jwt.decode(
        token,
        key,
        algorithms=["RS256"],
        options=options,
        **kwargs,
    )


def reset_jwks_cache() -> None:
    _jwks_cache["keys"] = None
    _jwks_cache["expires_at"] = 0

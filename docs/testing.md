# Testing Guide

## Backend: pytest

Tests live in `backend/tests/`. Run them from `backend/`:

```bash
cd backend
python -m pytest -q          # all tests
python -m pytest tests/test_clerk_auth.py -q   # focused file
```

- `test_clerk_auth.py` signs JWTs with a fixture RSA keypair and serves a mocked JWKS; covers valid/expired/wrong-issuer/unknown-kid/tampered tokens with no network calls.
- `test_xp.py` covers XP calculation logic.
- Auth tests bypass the database by patching profile lookup; anything that needs a DB should use a Neon branch, never the production database.

## Frontend: typecheck & build

There is no JS test runner configured yet; the verification gates are:

```bash
cd frontend
npx tsc --noEmit   # type check
npm run build      # production build
```

## API client (orval)

```bash
cd frontend
npm run api:gen    # dumps backend openapi.json, regenerates src/lib/generated/
```

Regenerate after changing backend routes; the generated client diff is the API drift check.

## Adding New Tests

- Put backend tests in `backend/tests/test_<area>.py`; follow the `test_clerk_auth.py` pattern of mocking external services (JWKS, Clerk API) rather than hitting them.
- Keep tests free of real network calls and real credentials.

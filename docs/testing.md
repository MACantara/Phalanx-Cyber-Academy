# Testing Guide

The repository uses `pytest` and `pytest-flask` for unit, integration, and contract tests.

## Running Tests

Activate the virtual environment and run all tests:

```bash
python -m pytest
```

Run only unit or integration suites:

```bash
python -m pytest tests/unit
python -m pytest tests/integration
python -m pytest tests/contracts
```

## Configuration

- `pytest.ini` sets the test path to `tests/` and adds the project root to `pythonpath`.
- `config.py` has a `TestingConfig` that disables the real Supabase client and suppresses email sending.
- Shared fixtures (`app` and `client`) are defined in `tests/conftest.py`.

## Test Structure

- `tests/unit/` — Pure business-logic tests that do not need a Flask app context or database.
- `tests/integration/` — Flask route tests using the `client` fixture.
- `tests/contracts/` — Response-shape checks that document the current API contract for the future FastAPI migration.

## Adding New Tests

1. Place unit tests in `tests/unit/` and route tests in `tests/integration/`.
2. Use the `client` fixture for any test that exercises HTTP endpoints.
3. Keep unit tests free of Flask request context and real network calls.
4. For contract tests, assert on status codes, content types, and stable response keys.

## Notes for the FastAPI Migration

- Contract tests are the primary migration acceptance criteria.
- When a route is re-implemented in FastAPI, update the corresponding contract test to point to the new backend and compare response shapes.
- Unit tests can be reused directly because they exercise `app/utils/` and `app/models/` without Flask-specific context.

# CyberQuest Automated Testing Suite

Comprehensive automated testing suite for CyberQuest authentication modules using Playwright Python.

## Overview

This testing suite provides end-to-end automated tests for all user authentication flows, security features, accessibility compliance, and UI/UX functionality.

## Test Coverage

### Authentication Tests
- **Login** (`test_auth_login.py`)
  - Valid/invalid credentials
  - Remember me functionality
  - Account lockout
  - Password visibility toggle
  - Redirect when authenticated

- **Signup** (`test_auth_signup.py`)
  - Multi-step form navigation
  - Username/email/password validation
  - Password strength indicator
  - Duplicate username/email detection
  - Timezone selection
  - Complete registration flow

- **Password Reset** (`test_password_reset.py`)
  - Forgot password request
  - Password reset with token
  - Token validation
  - Password strength requirements

- **Email Verification** (`test_email_verification.py`)
  - Verification flow
  - Token validation
  - Resend verification email
  - Verification pending page

### Security Tests (`test_security.py`)
- Account lockout after failed attempts
- CSRF token protection
- Input validation (username, email, password)
- SQL injection prevention
- XSS prevention
- Session security

### User Role Tests (`test_user_roles.py`)
- Admin access privileges
- Regular user restrictions
- Role-based access control
- Admin panel access

### UI/UX Tests
- **Theme Tests** (`test_themes.py`)
  - Light mode
  - Dark mode
  - System preferences
  - Theme persistence
  - Smooth transitions

- **Accessibility Tests** (`test_accessibility.py`)
  - WCAG 2.1 AAA compliance
  - Keyboard navigation
  - Screen reader compatibility
  - Focus indicators
  - Proper labels and ARIA attributes
  - Color contrast ratios
  - Heading hierarchy

## Setup

### Prerequisites

1. Python 3.8 or higher
2. pip package manager

### Installation

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Install Playwright browsers:
```bash
playwright install
```

Or install specific browser:
```bash
playwright install chromium
```

### Configuration

The tests use `pytest.ini` for configuration. Key settings:

- **Browser**: Chromium (default), can be changed to Firefox or WebKit
- **Headless**: True (for CI/CD), set to False for debugging
- **Screenshots**: Captured on failure
- **Videos**: Recorded on failure

## Running Tests

### Run All Tests
```bash
pytest
```

### Run Specific Test Category
```bash
# Authentication tests only
pytest -m auth

# Login tests only
pytest -m login

# Signup tests only
pytest -m signup

# Security tests only
pytest -m security

# Theme tests only
pytest -m theme

# Accessibility tests only
pytest -m accessibility
```

### Run Specific Test File
```bash
pytest tests/test_auth_login.py
pytest tests/test_auth_signup.py
pytest tests/test_security.py
```

### Run Specific Test
```bash
pytest tests/test_auth_login.py::TestLogin::test_login_with_valid_credentials_username
```

### Run with Visible Browser (Headed Mode)
```bash
pytest --headed
```

### Run with Slow Motion (for debugging)
```bash
pytest --slowmo=1000
```

### Run with Specific Browser
```bash
pytest --browser=firefox
pytest --browser=webkit
pytest --browser=chromium
```

### Generate HTML Report
```bash
pytest --html=report.html --self-contained-html
```

## Test Environment

### Environment Variables

Set these in `.env` file or environment:

```bash
# Base URL for tests (default: http://localhost:5000)
BASE_URL=http://localhost:5000

# Flask environment
FLASK_ENV=testing

# Database (use test database)
DATABASE_URL=sqlite:///test.db

# Disable features for testing
HCAPTCHA_ENABLED=False
```

### Test Configuration

Tests use `TestingConfig` from `config.py` which:
- Disables CSRF protection for easier testing
- Disables hCaptcha
- Disables email verification requirements
- Disables login attempt tracking (optional)

### Starting Test Server

Before running tests, start the Flask application:

```bash
# Development server
python run.py

# Or with specific port
flask run --port=5000
```

For automated testing, consider using a test server fixture or CI/CD pipeline.

## Test Data Management

### Test Users

Some tests require existing test users. Create test users before running full suite:

```python
# Example test user creation script
username: testuser
email: testuser@example.com
password: TestPassword123!
```

### Database Reset

For clean test runs, reset the test database between test sessions:

```bash
# SQLite
rm instance/test.db

# Or use database migration tools
```

## Debugging Tests

### Take Screenshots on Failure

Screenshots are automatically saved to `tests/screenshots/` on failure.

### Manual Screenshot
```python
page.screenshot(path="debug_screenshot.png")
```

### Console Logs
```python
page.on("console", lambda msg: print(f"Browser console: {msg.text}"))
```

### Slow Down Execution
```bash
pytest --slowmo=500  # 500ms delay between actions
```

### Headed Mode
```bash
pytest --headed  # See browser UI
```

### Keep Browser Open After Test
```python
# In conftest.py, add:
@pytest.fixture(scope="session")
def browser_context_args(browser_context_args):
    return {**browser_context_args, "devtools": True}
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Playwright Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      - name: Install dependencies
        run: |
          pip install -r requirements.txt
          playwright install --with-deps chromium
      - name: Run tests
        run: pytest
      - name: Upload screenshots
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: test-screenshots
          path: tests/screenshots/
```

## Test Markers

Tests are organized with pytest markers:

- `@pytest.mark.auth` - All authentication tests
- `@pytest.mark.login` - Login tests
- `@pytest.mark.signup` - Signup tests
- `@pytest.mark.password` - Password reset tests
- `@pytest.mark.email` - Email verification tests
- `@pytest.mark.security` - Security tests
- `@pytest.mark.roles` - User role tests
- `@pytest.mark.theme` - Theme tests
- `@pytest.mark.accessibility` - Accessibility tests
- `@pytest.mark.slow` - Slow running tests

## Best Practices

1. **Isolate Tests**: Each test should be independent
2. **Clean Up**: Reset state between tests
3. **Use Fixtures**: Leverage pytest fixtures for common setup
4. **Meaningful Names**: Test names should describe what they test
5. **Assert Clearly**: Use clear assertion messages
6. **Handle Timing**: Use proper waits, not fixed sleeps
7. **Test Real Scenarios**: Test actual user workflows

## Troubleshooting

### Tests Fail with "Target page, context or browser has been closed"
- Increase timeouts
- Check for navigation issues
- Ensure proper wait conditions

### Tests Fail with "Timeout exceeded"
- Server might not be running
- Check BASE_URL configuration
- Increase timeout in pytest.ini

### Browser Not Found
```bash
playwright install
```

### Screenshots Not Saving
- Check `tests/screenshots/` directory exists
- Check write permissions

## Contributing

When adding new tests:

1. Follow existing test structure
2. Add appropriate markers
3. Update this README
4. Ensure tests are independent
5. Add docstrings
6. Handle edge cases

## Resources

- [Playwright Python Documentation](https://playwright.dev/python/)
- [pytest Documentation](https://docs.pytest.org/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Flask Testing](https://flask.palletsprojects.com/en/latest/testing/)

## License

Same as CyberQuest main project.

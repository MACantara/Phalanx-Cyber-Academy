# Authentication Fixture Implementation Guide

This guide explains how to implement authentication fixtures for tests that require logged-in users.

## Overview

Many tests in the suite are marked with `@pytest.mark.skip(reason="Requires authentication")` because they need a logged-in user or admin. This guide shows how to implement the authentication fixtures.

## Understanding the Authentication System

Phalanx Cyber Academy uses a **passwordless authentication** system with email verification codes:

1. User enters email
2. System sends verification code to email
3. User enters code to complete login
4. Session is created

## Implementation Approach

There are two approaches to implement authentication in tests:

### Approach 1: API-Based Authentication (Recommended)

Create authentication by directly calling the backend API or database.

### Approach 2: UI-Based Authentication

Simulate the full login flow through the UI.

## Step-by-Step Implementation

### 1. Update conftest.py with Authentication Helpers

Add these helper functions to `tests/conftest.py`:

```python
import os
from typing import Optional

# Test user credentials
TEST_USER_EMAIL = os.getenv('TEST_USER_EMAIL', 'test@example.com')
TEST_USER_USERNAME = os.getenv('TEST_USER_USERNAME', 'testuser')
TEST_ADMIN_EMAIL = os.getenv('TEST_ADMIN_EMAIL', 'admin@example.com')
TEST_ADMIN_USERNAME = os.getenv('TEST_ADMIN_USERNAME', 'admin')


def create_test_user():
    """
    Create a test user in the database.
    Returns user credentials.
    """
    # TODO: Implement based on your database setup
    # This might involve:
    # 1. Connecting to test database
    # 2. Creating user record
    # 3. Setting email as verified
    # 4. Returning user info
    pass


def login_via_api(page: Page, email: str) -> bool:
    """
    Login user via API/backend instead of UI.
    This is faster and more reliable than UI-based login.
    """
    # TODO: Implement based on your authentication system
    # Options:
    # 1. Set session cookie directly
    # 2. Call login API endpoint
    # 3. Use database to create session
    pass


def login_via_ui(page: Page, base_url: str, email: str) -> bool:
    """
    Login user through the UI flow.
    This simulates real user interaction but is slower.
    """
    # Navigate to login page
    page.goto(f"{base_url}/auth/login")
    
    # Fill in email
    page.fill("input[type='email'], input[name='email']", email)
    
    # Submit form
    page.click("button[type='submit']")
    
    # Wait for verification code page or success
    page.wait_for_load_state("networkidle")
    
    # TODO: Handle verification code
    # In testing, you might:
    # 1. Use a test email service API to fetch the code
    # 2. Have a special test endpoint that returns the code
    # 3. Use a mock email service
    
    return True
```

### 2. Implement Authenticated Page Fixtures

Update the `authenticated_page` and `admin_page` fixtures in `conftest.py`:

```python
@pytest.fixture(scope="function")
def authenticated_page(page: Page, base_url: str):
    """
    Create an authenticated page for tests requiring login.
    """
    # Option 1: API-based authentication (faster)
    if login_via_api(page, TEST_USER_EMAIL):
        yield page
        return
    
    # Option 2: UI-based authentication (fallback)
    if login_via_ui(page, base_url, TEST_USER_EMAIL):
        # Verify we're logged in
        page.goto(f"{base_url}/profile")
        page.wait_for_load_state("networkidle")
        
        # Check if we're on profile page (not redirected to login)
        if "profile" in page.url:
            yield page
            return
    
    pytest.fail("Failed to authenticate user for testing")


@pytest.fixture(scope="function")
def admin_page(page: Page, base_url: str):
    """
    Create an admin-authenticated page for tests requiring admin access.
    """
    # Similar to authenticated_page but with admin credentials
    if login_via_api(page, TEST_ADMIN_EMAIL):
        yield page
        return
    
    if login_via_ui(page, base_url, TEST_ADMIN_EMAIL):
        page.goto(f"{base_url}/admin")
        page.wait_for_load_state("networkidle")
        
        if "admin" in page.url:
            yield page
            return
    
    pytest.fail("Failed to authenticate admin for testing")
```

### 3. Create Test Database Setup

Create a fixture for database setup in `tests/conftest.py`:

```python
@pytest.fixture(scope="session", autouse=True)
def setup_test_database():
    """
    Set up test database with required test users.
    This runs once per test session.
    """
    # TODO: Implement based on your database system
    # 1. Create/reset test database
    # 2. Create test user
    # 3. Create admin user
    # 4. Set up any required test data
    
    yield
    
    # Cleanup after all tests
    # TODO: Clean up test database
```

### 4. Environment Configuration

Update `.env` with test-specific variables:

```bash
# Test Configuration
TEST_BASE_URL=http://localhost:5000
TEST_USER_EMAIL=test@example.com
TEST_USER_USERNAME=testuser
TEST_ADMIN_EMAIL=admin@example.com
TEST_ADMIN_USERNAME=admin

# Test Database (if using separate test DB)
TEST_DATABASE_URL=sqlite:///test_database.db

# Email Service for Testing (if needed)
TEST_EMAIL_SERVICE_API_KEY=your-test-email-api-key
```

### 5. Implement Email Verification Code Handling

For the passwordless system, you need to handle verification codes in tests:

```python
def get_verification_code(email: str) -> Optional[str]:
    """
    Get verification code for testing.
    
    Options:
    1. Use test email service API (Mailinator, Mailtrap, etc.)
    2. Query database directly for the code
    3. Use a special test endpoint that returns codes
    """
    # TODO: Implement based on your email system
    
    # Example using database query:
    # from app.models.email_verification import EmailVerification
    # verification = EmailVerification.query.filter_by(
    #     user_email=email
    # ).order_by(EmailVerification.created_at.desc()).first()
    # return verification.code if verification else None
    
    pass
```

## Example: Complete Authentication Flow

Here's a complete example of implementing authenticated tests:

```python
# In tests/conftest.py

@pytest.fixture(scope="function")
def authenticated_page(page: Page, base_url: str):
    """Authenticated page with test user."""
    
    # 1. Ensure test user exists in database
    # create_test_user_if_not_exists()
    
    # 2. Navigate to login
    page.goto(f"{base_url}/auth/login")
    
    # 3. Enter email
    page.fill("input[type='email']", TEST_USER_EMAIL)
    page.click("button[type='submit']")
    page.wait_for_load_state("networkidle")
    
    # 4. Get and enter verification code
    # code = get_verification_code(TEST_USER_EMAIL)
    # page.fill("input[name='code']", code)
    # page.click("button[type='submit']")
    # page.wait_for_load_state("networkidle")
    
    # 5. Verify login successful
    # assert "dashboard" in page.url or "profile" in page.url
    
    yield page
```

## Testing the Implementation

After implementing authentication fixtures:

```bash
# Run tests that require authentication
pytest tests/profile/test_user_profile.py -v

# Run all authenticated tests
pytest -m "not skip" tests/profile/ -v

# Run admin tests
pytest tests/admin/ -v
```

## Alternative: Mock Authentication

For simpler testing without full authentication flow:

```python
@pytest.fixture
def authenticated_page_mock(page: Page, base_url: str):
    """
    Mock authenticated state by setting session cookie.
    """
    # Set authentication cookie
    page.context.add_cookies([{
        'name': 'session',
        'value': 'mock-session-token',
        'domain': 'localhost',
        'path': '/',
    }])
    
    yield page
```

## Next Steps

1. **Choose Implementation Approach**: API-based or UI-based authentication
2. **Implement Helper Functions**: Create test users, login functions, verification code handling
3. **Update Fixtures**: Complete the authenticated_page and admin_page fixtures
4. **Test Implementation**: Verify authentication works with a simple test
5. **Enable Skipped Tests**: Remove @pytest.mark.skip from authenticated tests
6. **Run Full Suite**: Execute complete test suite with authentication

## Resources

- [Playwright Authentication](https://playwright.dev/python/docs/auth)
- [pytest Fixtures](https://docs.pytest.org/en/stable/fixture.html)
- [Test Database Setup](https://flask.palletsprojects.com/en/2.3.x/testing/)

## Support

If you encounter issues:
1. Check Flask app logs for authentication errors
2. Verify test user exists in database
3. Ensure email verification is working
4. Review session cookie settings
5. Check CSRF token handling

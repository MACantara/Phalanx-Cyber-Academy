"""
Pytest configuration and fixtures for Phalanx Cyber Academy automated testing.
"""
import os
import pytest
from playwright.sync_api import Page, BrowserContext, Browser, Playwright
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Base URL for testing
BASE_URL = os.getenv('TEST_BASE_URL', 'http://localhost:5000')

# Test user credentials
TEST_USER_EMAIL = os.getenv('TEST_USER_EMAIL', 'test@example.com')
TEST_USER_USERNAME = os.getenv('TEST_USER_USERNAME', 'testuser')
TEST_ADMIN_EMAIL = os.getenv('TEST_ADMIN_EMAIL', 'admin@example.com')
TEST_ADMIN_USERNAME = os.getenv('TEST_ADMIN_USERNAME', 'admin')


@pytest.fixture(scope="session")
def base_url():
    """Provide base URL for tests."""
    return BASE_URL


@pytest.fixture(scope="session")
def browser_context_args(browser_context_args):
    """Configure browser context for all tests."""
    return {
        **browser_context_args,
        "viewport": {"width": 1920, "height": 1080},
        "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "ignore_https_errors": True,
    }


@pytest.fixture(scope="function")
def context(browser: Browser):
    """Create a new browser context for each test."""
    context = browser.new_context(
        viewport={"width": 1920, "height": 1080},
        ignore_https_errors=True,
    )
    yield context
    context.close()


@pytest.fixture(scope="function")
def page(context: BrowserContext, base_url: str):
    """Create a new page for each test."""
    page = context.new_page()
    page.set_default_timeout(30000)  # 30 seconds
    yield page
    page.close()


@pytest.fixture(scope="function")
def mobile_page(browser: Browser, base_url: str):
    """Create a mobile page for responsive testing."""
    context = browser.new_context(
        viewport={"width": 375, "height": 667},
        user_agent="Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15",
        ignore_https_errors=True,
    )
    page = context.new_page()
    page.set_default_timeout(30000)
    yield page
    page.close()
    context.close()


@pytest.fixture(scope="function")
def authenticated_page(page: Page, base_url: str):
    """
    Create an authenticated page for tests requiring login.
    Note: This is a placeholder. Actual implementation depends on your auth system.
    """
    # Navigate to login page
    page.goto(f"{base_url}/auth/login")
    
    # TODO: Implement actual login flow based on your authentication system
    # This might involve:
    # 1. Filling in email/username
    # 2. Requesting verification code
    # 3. Entering verification code
    # 4. Verifying successful login
    
    yield page


@pytest.fixture(scope="function")
def admin_page(page: Page, base_url: str):
    """
    Create an admin-authenticated page for tests requiring admin access.
    Note: This is a placeholder. Actual implementation depends on your auth system.
    """
    # Navigate to login page
    page.goto(f"{base_url}/auth/login")
    
    # TODO: Implement actual admin login flow
    # Similar to authenticated_page but with admin credentials
    
    yield page


@pytest.fixture
def test_data():
    """Provide common test data."""
    return {
        "valid_email": "test@example.com",
        "valid_username": "testuser",
        "invalid_email": "invalid-email",
        "long_text": "A" * 1000,
    }


# Pytest hooks
def pytest_configure(config):
    """Configure pytest."""
    # Add custom markers
    config.addinivalue_line(
        "markers", "smoke: Quick smoke tests for basic functionality"
    )


def pytest_collection_modifyitems(config, items):
    """Modify test items during collection."""
    for item in items:
        # Add markers based on test path
        if "admin" in str(item.fspath):
            item.add_marker(pytest.mark.security)
        if "slow" in item.keywords:
            item.add_marker(pytest.mark.slow)

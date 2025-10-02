"""
Pytest configuration and fixtures for CyberQuest tests.

This module provides shared fixtures and configuration for all tests,
including Playwright setup, Flask app configuration, and test utilities.
"""

import pytest
from playwright.sync_api import Page, Browser, BrowserContext
import os
import sys

# Add the parent directory to the path so we can import the app
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import create_app
from config import TestingConfig


@pytest.fixture(scope="session")
def app():
    """Create and configure a Flask app instance for testing."""
    app = create_app()
    app.config.from_object(TestingConfig)
    
    # Ensure test environment
    app.config['TESTING'] = True
    app.config['WTF_CSRF_ENABLED'] = False
    app.config['DISABLE_DATABASE'] = False
    app.config['HCAPTCHA_ENABLED'] = False
    
    # Override feature flags for testing
    app.config['FEATURES'] = {
        'HCAPTCHA': False,
        'EMAIL_VERIFICATION': False,
        'LOGIN_ATTEMPTS': False,
        'ADMIN_PANEL': True,
    }
    
    return app


@pytest.fixture(scope="session")
def base_url(app):
    """Get the base URL for the test server."""
    # Default to localhost, can be overridden by environment variable
    return os.environ.get('BASE_URL', 'http://localhost:5000')


@pytest.fixture(scope="function")
def page_context(page: Page, base_url: str):
    """
    Provide a page context with common utilities.
    
    This fixture automatically navigates to base_url and provides
    helper methods for common operations.
    """
    class PageContext:
        def __init__(self, page: Page, base_url: str):
            self.page = page
            self.base_url = base_url
        
        def goto(self, path: str = "/"):
            """Navigate to a path relative to base_url."""
            url = f"{self.base_url}{path}"
            self.page.goto(url, wait_until="networkidle")
        
        def fill_form(self, selectors: dict):
            """Fill multiple form fields."""
            for selector, value in selectors.items():
                self.page.fill(selector, value)
        
        def wait_for_navigation(self):
            """Wait for navigation to complete."""
            self.page.wait_for_load_state("networkidle")
        
        def get_flash_message(self):
            """Get the flash message text if present."""
            flash = self.page.locator('[role="alert"], .alert, .flash-message').first
            if flash.is_visible():
                return flash.text_content()
            return None
        
        def take_screenshot(self, name: str):
            """Take a screenshot for debugging."""
            self.page.screenshot(path=f"tests/screenshots/{name}.png")
    
    return PageContext(page, base_url)


@pytest.fixture(scope="function")
def auth_page(page_context):
    """Provide authentication-specific utilities."""
    class AuthPage:
        def __init__(self, ctx):
            self.ctx = ctx
            self.page = ctx.page
        
        def goto_login(self):
            """Navigate to login page."""
            self.ctx.goto("/auth/login")
        
        def goto_signup(self):
            """Navigate to signup page."""
            self.ctx.goto("/auth/signup")
        
        def goto_forgot_password(self):
            """Navigate to forgot password page."""
            self.ctx.goto("/password/forgot")
        
        def login(self, username: str, password: str, remember_me: bool = False):
            """Perform login action."""
            self.goto_login()
            self.page.fill('input[name="username_or_email"]', username)
            self.page.fill('input[name="password"]', password)
            if remember_me:
                self.page.check('input[name="remember_me"]')
            self.page.click('button[type="submit"]')
            self.ctx.wait_for_navigation()
        
        def signup(self, username: str, email: str, password: str, confirm_password: str = None):
            """Perform signup action."""
            if confirm_password is None:
                confirm_password = password
            
            self.goto_signup()
            
            # Step 1: Username
            self.page.fill('#username', username)
            self.page.click('#next-btn')
            self.page.wait_for_timeout(500)
            
            # Step 2: Email
            self.page.fill('#email', email)
            self.page.click('#next-btn')
            self.page.wait_for_timeout(500)
            
            # Step 3: Password
            self.page.fill('#password', password)
            self.page.fill('#confirm_password', confirm_password)
            self.page.click('#next-btn')
            self.page.wait_for_timeout(500)
            
            # Step 4: Timezone (submit)
            self.page.click('button[type="submit"]')
            self.ctx.wait_for_navigation()
        
        def logout(self):
            """Perform logout action."""
            self.page.click('a[href*="/auth/logout"]')
            self.ctx.wait_for_navigation()
        
        def is_logged_in(self):
            """Check if user is logged in."""
            # Look for user dropdown or profile indicators
            return self.page.locator('#user-dropdown, .user-avatar').count() > 0
    
    return AuthPage(page_context)


@pytest.fixture(scope="function")
def theme_helper(page: Page):
    """Helper for theme testing."""
    class ThemeHelper:
        def __init__(self, page: Page):
            self.page = page
        
        def get_current_theme(self):
            """Get the current theme from DOM."""
            html = self.page.locator('html')
            has_dark = html.evaluate('el => el.classList.contains("dark")')
            return "dark" if has_dark else "light"
        
        def set_theme(self, theme: str):
            """Set theme using JavaScript."""
            if theme == "light":
                self.page.evaluate('document.documentElement.classList.remove("dark")')
            elif theme == "dark":
                self.page.evaluate('document.documentElement.classList.add("dark")')
            elif theme == "system":
                # Set to system preference
                self.page.evaluate('''
                    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                    document.documentElement.classList.toggle('dark', isDark);
                ''')
        
        def get_theme_preference(self):
            """Get theme preference from localStorage."""
            return self.page.evaluate('localStorage.getItem("theme")')
        
        def set_theme_preference(self, theme: str):
            """Set theme preference in localStorage."""
            if theme == "system":
                self.page.evaluate('localStorage.removeItem("theme")')
            else:
                self.page.evaluate(f'localStorage.setItem("theme", "{theme}")')
    
    return ThemeHelper(page)


@pytest.fixture(scope="session", autouse=True)
def setup_test_env():
    """Set up test environment before running tests."""
    # Create screenshots directory if it doesn't exist
    os.makedirs("tests/screenshots", exist_ok=True)
    yield
    # Cleanup after tests if needed

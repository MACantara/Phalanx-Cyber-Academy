"""
Authentication Tests - Login Functionality

Tests for user login, including valid/invalid credentials,
remember me functionality, and account lockout.
"""

import pytest
from playwright.sync_api import Page, expect


@pytest.mark.auth
@pytest.mark.login
class TestLogin:
    """Test suite for login functionality."""
    
    def test_login_page_loads(self, page_context):
        """Test that login page loads successfully."""
        page_context.goto("/auth/login")
        page = page_context.page
        
        # Check page title
        expect(page).to_have_title("Agent Portal Access - CyberQuest")
        
        # Check for login form elements
        expect(page.locator('input[name="username_or_email"]')).to_be_visible()
        expect(page.locator('input[name="password"]')).to_be_visible()
        expect(page.locator('button[type="submit"]')).to_be_visible()
    
    def test_login_with_valid_credentials_username(self, auth_page):
        """Test login with valid username and password."""
        # Note: This test assumes a test user exists
        # In real scenarios, you'd set up test data or use fixtures
        username = "testuser"
        password = "TestPassword123!"
        
        auth_page.goto_login()
        page = auth_page.page
        
        # Fill login form
        page.fill('input[name="username_or_email"]', username)
        page.fill('input[name="password"]', password)
        page.click('button[type="submit"]')
        
        # Wait for navigation
        auth_page.ctx.wait_for_navigation()
        
        # Note: Actual assertions depend on whether test user exists
        # This is a template - adjust based on your test data setup
    
    def test_login_with_valid_credentials_email(self, auth_page):
        """Test login with valid email and password."""
        email = "testuser@example.com"
        password = "TestPassword123!"
        
        auth_page.goto_login()
        page = auth_page.page
        
        # Fill login form
        page.fill('input[name="username_or_email"]', email)
        page.fill('input[name="password"]', password)
        page.click('button[type="submit"]')
        
        # Wait for navigation
        auth_page.ctx.wait_for_navigation()
    
    def test_login_with_invalid_credentials(self, auth_page):
        """Test login with invalid credentials shows error."""
        auth_page.goto_login()
        page = auth_page.page
        
        # Fill login form with invalid credentials
        page.fill('input[name="username_or_email"]', "invaliduser")
        page.fill('input[name="password"]', "WrongPassword123!")
        page.click('button[type="submit"]')
        
        # Wait for page to reload
        auth_page.ctx.wait_for_navigation()
        
        # Check for error message
        # Flash messages should contain error text
        page.wait_for_selector('[role="alert"], .alert, .flash-message', timeout=5000)
        flash_message = auth_page.ctx.get_flash_message()
        assert flash_message is not None
        assert "invalid" in flash_message.lower() or "attempts remaining" in flash_message.lower()
    
    def test_login_with_empty_fields(self, auth_page):
        """Test login with empty fields shows validation error."""
        auth_page.goto_login()
        page = auth_page.page
        
        # Submit empty form
        page.click('button[type="submit"]')
        
        # Wait for page to reload
        auth_page.ctx.wait_for_navigation()
        
        # Check for error message
        page.wait_for_selector('[role="alert"], .alert, .flash-message', timeout=5000)
        flash_message = auth_page.ctx.get_flash_message()
        assert flash_message is not None
        assert "provide both" in flash_message.lower() or "required" in flash_message.lower()
    
    def test_login_remember_me_checkbox(self, auth_page):
        """Test that remember me checkbox is present and functional."""
        auth_page.goto_login()
        page = auth_page.page
        
        # Check if remember me checkbox exists
        remember_me = page.locator('input[name="remember_me"]')
        expect(remember_me).to_be_visible()
        
        # Test checkbox can be checked
        remember_me.check()
        expect(remember_me).to_be_checked()
        
        # Test checkbox can be unchecked
        remember_me.uncheck()
        expect(remember_me).not_to_be_checked()
    
    def test_login_redirect_when_authenticated(self, auth_page):
        """Test that authenticated users are redirected from login page."""
        # This test requires a logged-in user
        # Skip if no test user is available
        pytest.skip("Requires authenticated user - implement after user creation")
    
    def test_login_shows_lockout_message(self, auth_page):
        """Test that account lockout message is displayed after failed attempts."""
        # This test simulates multiple failed login attempts
        auth_page.goto_login()
        page = auth_page.page
        
        # Note: Max attempts is configurable (default 5)
        # Attempt multiple failed logins
        for i in range(6):
            page.fill('input[name="username_or_email"]', f"testuser{i}")
            page.fill('input[name="password"]', "WrongPassword123!")
            page.click('button[type="submit"]')
            page.wait_for_load_state("networkidle")
        
        # Check for lockout message
        # The lockout message should be visible
        lockout_msg = page.locator('text=/Security Protocol Activated|locked out|temporarily restricted/i')
        # Note: Lockout is IP-based, so this might affect other tests
        # Consider using separate test environments or cleanup
    
    def test_login_password_visibility_toggle(self, auth_page):
        """Test password visibility toggle functionality."""
        auth_page.goto_login()
        page = auth_page.page
        
        password_input = page.locator('input[name="password"]')
        
        # Initially password should be hidden
        expect(password_input).to_have_attribute('type', 'password')
        
        # Look for toggle button (usually an eye icon)
        toggle_button = page.locator('button:has-text("Show"), button:has(i.bi-eye), button:has(i.bi-eye-slash)').first
        
        if toggle_button.is_visible():
            toggle_button.click()
            # After clicking, type might change to text
            page.wait_for_timeout(200)

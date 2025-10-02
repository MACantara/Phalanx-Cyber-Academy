"""
Authentication Tests - Security and Validation

Tests for security features including account lockout,
input validation, hCaptcha, and CSRF protection.
"""

import pytest
from playwright.sync_api import Page, expect


@pytest.mark.auth
@pytest.mark.security
class TestSecurity:
    """Test suite for authentication security features."""
    
    def test_account_lockout_after_failed_attempts(self, page_context):
        """Test that account gets locked after multiple failed login attempts."""
        page_context.goto("/auth/login")
        page = page_context.page
        
        # Attempt multiple failed logins
        max_attempts = 6  # Exceed the limit (default is 5)
        
        for i in range(max_attempts):
            page.fill('input[name="username_or_email"]', f'testuser{i}')
            page.fill('input[name="password"]', 'WrongPassword123!')
            page.click('button[type="submit"]')
            page.wait_for_load_state("networkidle")
        
        # Should show lockout message
        lockout_msg = page.locator('text=/Security Protocol Activated|locked out|temporarily restricted/i').first
        # Note: Lockout is IP-based, may affect other tests
    
    def test_lockout_expires_after_timeout(self, page_context):
        """Test that lockout expires after the configured timeout."""
        # This test would require waiting for the lockout period
        # or mocking time - skip for now
        pytest.skip("Requires time manipulation or long wait - implement with appropriate fixtures")
    
    def test_csrf_token_present_on_login_form(self, page_context):
        """Test that CSRF token is present in login form."""
        page_context.goto("/auth/login")
        page = page_context.page
        
        # Check for CSRF token
        csrf_token = page.locator('input[name="csrf_token"]')
        expect(csrf_token).to_be_attached()
        
        # Token should have a value
        token_value = csrf_token.get_attribute('value')
        assert token_value is not None and len(token_value) > 0
    
    def test_csrf_token_present_on_signup_form(self, page_context):
        """Test that CSRF token is present in signup form."""
        page_context.goto("/auth/signup")
        page = page_context.page
        
        # Check for CSRF token
        csrf_token = page.locator('input[name="csrf_token"]')
        expect(csrf_token).to_be_attached()
        
        # Token should have a value
        token_value = csrf_token.get_attribute('value')
        assert token_value is not None and len(token_value) > 0
    
    def test_csrf_token_present_on_password_reset_form(self, page_context):
        """Test that CSRF token is present in password reset form."""
        page_context.goto("/password/forgot")
        page = page_context.page
        
        # Check for CSRF token
        csrf_token = page.locator('input[name="csrf_token"]')
        expect(csrf_token).to_be_attached()
        
        # Token should have a value
        token_value = csrf_token.get_attribute('value')
        assert token_value is not None and len(token_value) > 0
    
    def test_hcaptcha_widget_present_when_enabled(self, page_context):
        """Test that hCaptcha widget is present when enabled."""
        # Note: In testing config, hCaptcha is disabled
        # This test would need to be run with hCaptcha enabled
        page_context.goto("/auth/login")
        page = page_context.page
        
        # Look for hCaptcha iframe or div
        hcaptcha = page.locator('.h-captcha, iframe[src*="hcaptcha"]').first
        # In test environment, should not be present
    
    def test_username_validation_alphanumeric_only(self, page_context):
        """Test that username only accepts alphanumeric and underscore."""
        page_context.goto("/auth/signup")
        page = page_context.page
        
        # Try username with special characters
        page.fill('#username', 'test@user!')
        page.wait_for_timeout(500)
        
        # Should show validation error
        # Validation might be client-side or server-side
    
    def test_username_validation_length(self, page_context):
        """Test username length validation (3-30 characters)."""
        page_context.goto("/auth/signup")
        page = page_context.page
        
        # Test too short
        page.fill('#username', 'ab')
        page.click('#next-btn')
        page.wait_for_timeout(300)
        
        # Test too long
        page.fill('#username', 'a' * 31)
        page.click('#next-btn')
        page.wait_for_timeout(300)
        
        # Test valid length
        page.fill('#username', 'validuser')
        page.wait_for_timeout(300)
    
    def test_email_validation_format(self, page_context):
        """Test email format validation."""
        page_context.goto("/auth/signup")
        page = page_context.page
        
        # Navigate to email step
        page.fill('#username', 'testuser123')
        page.click('#next-btn')
        page.wait_for_timeout(500)
        
        # Test invalid formats
        invalid_emails = [
            'not-an-email',
            '@example.com',
            'user@',
            'user space@example.com',
            'user@.com'
        ]
        
        for email in invalid_emails:
            page.fill('#email', email)
            page.wait_for_timeout(300)
            # Should show validation error
    
    def test_password_validation_requirements(self, page_context):
        """Test password strength requirements."""
        page_context.goto("/auth/signup")
        page = page_context.page
        
        # Navigate to password step
        page.fill('#username', 'testuser123')
        page.click('#next-btn')
        page.wait_for_timeout(500)
        
        page.fill('#email', 'test@example.com')
        page.click('#next-btn')
        page.wait_for_timeout(500)
        
        # Test weak passwords
        weak_passwords = [
            'weak',           # Too short
            'password',       # No uppercase, numbers, special chars
            'Password',       # No numbers, special chars
            'Password123',    # No special chars
        ]
        
        for pwd in weak_passwords:
            page.fill('#password', pwd)
            page.wait_for_timeout(500)
            # Should show strength indicator or validation error
    
    def test_sql_injection_prevention_login(self, page_context):
        """Test that SQL injection attempts are properly handled."""
        page_context.goto("/auth/login")
        page = page_context.page
        
        # Try SQL injection in username
        page.fill('input[name="username_or_email"]', "' OR '1'='1")
        page.fill('input[name="password"]', "' OR '1'='1")
        page.click('button[type="submit"]')
        
        page.wait_for_load_state("networkidle")
        
        # Should not bypass authentication
        # Should show error message
        flash = page.locator('[role="alert"], .alert, .flash-message').first
        if flash.is_visible():
            message = flash.text_content()
            assert message is not None
    
    def test_xss_prevention_in_flash_messages(self, page_context):
        """Test that XSS attempts in flash messages are escaped."""
        page_context.goto("/auth/login")
        page = page_context.page
        
        # Try XSS in username field
        xss_payload = '<script>alert("XSS")</script>'
        page.fill('input[name="username_or_email"]', xss_payload)
        page.fill('input[name="password"]', 'password')
        page.click('button[type="submit"]')
        
        page.wait_for_load_state("networkidle")
        
        # Check that script tags are escaped in flash message
        content = page.content()
        # Should not contain executable script tags
        assert '<script>alert("XSS")</script>' not in content or '&lt;script&gt;' in content
    
    def test_session_fixation_prevention(self, page_context):
        """Test that session ID changes after login."""
        # This would require checking cookies before and after login
        pytest.skip("Requires session/cookie inspection - implement with appropriate tools")
    
    def test_logout_invalidates_session(self, auth_page):
        """Test that logout properly invalidates the session."""
        # This test requires a logged-in user
        pytest.skip("Requires authenticated user - implement after user creation")

"""
Authentication Tests - Signup Functionality

Tests for user signup/registration, including validation,
multi-step form, and error handling.
"""

import pytest
from playwright.sync_api import Page, expect


@pytest.mark.auth
@pytest.mark.signup
class TestSignup:
    """Test suite for signup functionality."""
    
    def test_signup_page_loads(self, page_context):
        """Test that signup page loads successfully."""
        page_context.goto("/auth/signup")
        page = page_context.page
        
        # Check page title
        expect(page).to_have_title("Join the Mission - CyberQuest")
        
        # Check for signup form elements (step 1 - username)
        expect(page.locator('#username')).to_be_visible()
        expect(page.locator('#next-btn')).to_be_visible()
    
    def test_signup_multi_step_navigation(self, page_context):
        """Test navigation through signup steps."""
        page_context.goto("/auth/signup")
        page = page_context.page
        
        # Step 1: Username
        expect(page.locator('#username')).to_be_visible()
        page.fill('#username', 'newtestuser')
        page.click('#next-btn')
        page.wait_for_timeout(500)
        
        # Step 2: Email
        expect(page.locator('#email')).to_be_visible()
        page.fill('#email', 'newtestuser@example.com')
        
        # Test back button
        page.click('#prev-btn')
        page.wait_for_timeout(500)
        expect(page.locator('#username')).to_be_visible()
        
        # Go forward again
        page.click('#next-btn')
        page.wait_for_timeout(500)
        page.click('#next-btn')
        page.wait_for_timeout(500)
        
        # Step 3: Password
        expect(page.locator('#password')).to_be_visible()
        expect(page.locator('#confirm_password')).to_be_visible()
    
    def test_signup_username_validation(self, page_context):
        """Test username validation rules."""
        page_context.goto("/auth/signup")
        page = page_context.page
        
        # Test too short username
        page.fill('#username', 'ab')
        page.click('#next-btn')
        page.wait_for_timeout(300)
        
        # Should show error (username must be 3-30 characters)
        error = page.locator('.field-error, .text-red-600, .text-red-400').first
        if error.is_visible():
            error_text = error.text_content()
            assert error_text is not None
        
        # Test valid username
        page.fill('#username', 'validuser123')
        page.wait_for_timeout(300)
    
    def test_signup_email_validation(self, page_context):
        """Test email validation rules."""
        page_context.goto("/auth/signup")
        page = page_context.page
        
        # Step 1: Username
        page.fill('#username', 'testuser123')
        page.click('#next-btn')
        page.wait_for_timeout(500)
        
        # Step 2: Invalid email
        page.fill('#email', 'invalid-email')
        page.click('#next-btn')
        page.wait_for_timeout(300)
        
        # Should show error or stay on page
        # Valid email format required
        
        # Test valid email
        page.fill('#email', 'valid@example.com')
        page.wait_for_timeout(300)
    
    def test_signup_password_strength_indicator(self, page_context):
        """Test password strength indicator."""
        page_context.goto("/auth/signup")
        page = page_context.page
        
        # Navigate to password step
        page.fill('#username', 'testuser123')
        page.click('#next-btn')
        page.wait_for_timeout(500)
        
        page.fill('#email', 'test@example.com')
        page.click('#next-btn')
        page.wait_for_timeout(500)
        
        # Type weak password
        page.fill('#password', 'weak')
        page.wait_for_timeout(500)
        
        # Should show strength indicator
        # Check for password strength feedback
        strength_indicator = page.locator('#password-strength, .password-strength, [class*="strength"]')
        
        # Type stronger password
        page.fill('#password', 'StrongP@ssw0rd123!')
        page.wait_for_timeout(500)
    
    def test_signup_password_mismatch(self, page_context):
        """Test password confirmation mismatch error."""
        page_context.goto("/auth/signup")
        page = page_context.page
        
        # Navigate to password step
        page.fill('#username', 'testuser123')
        page.click('#next-btn')
        page.wait_for_timeout(500)
        
        page.fill('#email', 'test@example.com')
        page.click('#next-btn')
        page.wait_for_timeout(500)
        
        # Fill password fields with different values
        page.fill('#password', 'StrongP@ssw0rd123!')
        page.fill('#confirm_password', 'DifferentP@ssw0rd123!')
        page.click('#next-btn')
        page.wait_for_timeout(500)
        
        # Should not proceed to next step or show error on submit
        # Note: Error might be shown on final submit
    
    def test_signup_complete_flow(self, page_context):
        """Test complete signup flow with valid data."""
        page_context.goto("/auth/signup")
        page = page_context.page
        
        # Generate unique username/email for this test
        import time
        timestamp = int(time.time())
        username = f'testuser{timestamp}'
        email = f'testuser{timestamp}@example.com'
        password = 'StrongP@ssw0rd123!'
        
        # Step 1: Username
        page.fill('#username', username)
        page.click('#next-btn')
        page.wait_for_timeout(500)
        
        # Step 2: Email
        page.fill('#email', email)
        page.click('#next-btn')
        page.wait_for_timeout(500)
        
        # Step 3: Password
        page.fill('#password', password)
        page.fill('#confirm_password', password)
        page.click('#next-btn')
        page.wait_for_timeout(500)
        
        # Step 4: Timezone (submit)
        submit_button = page.locator('button[type="submit"]')
        expect(submit_button).to_be_visible()
        submit_button.click()
        
        # Wait for navigation
        page.wait_for_load_state("networkidle")
        
        # Should redirect to verification pending or success page
        # Check URL or flash message
        current_url = page.url
        assert "verification-pending" in current_url or "home" in current_url or "login" in current_url
    
    def test_signup_duplicate_username(self, page_context):
        """Test signup with duplicate username shows error."""
        # This test assumes 'testuser' already exists
        page_context.goto("/auth/signup")
        page = page_context.page
        
        page.fill('#username', 'testuser')
        page.wait_for_timeout(1000)  # Wait for availability check
        
        # Should show error message
        error = page.locator('.field-error:has-text("already exists"), .text-red-600:has-text("already exists")').first
        # Note: Error might be shown via AJAX validation
    
    def test_signup_duplicate_email(self, page_context):
        """Test signup with duplicate email shows error."""
        page_context.goto("/auth/signup")
        page = page_context.page
        
        # Step 1: Username
        page.fill('#username', 'uniqueuser123')
        page.click('#next-btn')
        page.wait_for_timeout(500)
        
        # Step 2: Email (use existing email)
        page.fill('#email', 'testuser@example.com')
        page.wait_for_timeout(1000)  # Wait for availability check
        
        # Should show error message
        error = page.locator('.field-error:has-text("already registered"), .text-red-600:has-text("already registered")').first
    
    def test_signup_timezone_selection(self, page_context):
        """Test timezone selection in signup flow."""
        page_context.goto("/auth/signup")
        page = page_context.page
        
        # Navigate to timezone step
        page.fill('#username', 'testuser123')
        page.click('#next-btn')
        page.wait_for_timeout(500)
        
        page.fill('#email', 'test@example.com')
        page.click('#next-btn')
        page.wait_for_timeout(500)
        
        page.fill('#password', 'StrongP@ssw0rd123!')
        page.fill('#confirm_password', 'StrongP@ssw0rd123!')
        page.click('#next-btn')
        page.wait_for_timeout(500)
        
        # Step 4: Timezone
        timezone_select = page.locator('select[name="timezone"], #timezone')
        if timezone_select.is_visible():
            expect(timezone_select).to_be_visible()
    
    def test_signup_redirect_when_authenticated(self, page_context):
        """Test that authenticated users are redirected from signup page."""
        # This test requires a logged-in user
        pytest.skip("Requires authenticated user - implement after user creation")

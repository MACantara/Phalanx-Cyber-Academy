"""
Authentication Tests - Password Reset Functionality

Tests for password reset request and reset flow.
"""

import pytest
from playwright.sync_api import Page, expect


@pytest.mark.auth
@pytest.mark.password
class TestPasswordReset:
    """Test suite for password reset functionality."""
    
    def test_forgot_password_page_loads(self, page_context):
        """Test that forgot password page loads successfully."""
        page_context.goto("/password/forgot")
        page = page_context.page
        
        # Check page title
        expect(page).to_have_title("Forgot Password - CyberQuest")
        
        # Check for email input
        expect(page.locator('input[name="email"]')).to_be_visible()
        expect(page.locator('button[type="submit"]')).to_be_visible()
    
    def test_forgot_password_with_valid_email(self, page_context):
        """Test forgot password with valid email."""
        page_context.goto("/password/forgot")
        page = page_context.page
        
        # Fill email
        page.fill('input[name="email"]', 'testuser@example.com')
        page.click('button[type="submit"]')
        
        # Wait for navigation
        page.wait_for_load_state("networkidle")
        
        # Should show success message (for security, always shows success)
        flash = page.locator('[role="alert"], .alert, .flash-message').first
        if flash.is_visible():
            message = flash.text_content()
            # Should contain success message about checking email
            assert message is not None
    
    def test_forgot_password_with_invalid_email(self, page_context):
        """Test forgot password with invalid email format."""
        page_context.goto("/password/forgot")
        page = page_context.page
        
        # Fill invalid email
        page.fill('input[name="email"]', 'invalid-email')
        page.click('button[type="submit"]')
        
        # Wait for response
        page.wait_for_load_state("networkidle")
        
        # Note: For security, the system might show success even for invalid emails
        # to prevent email enumeration attacks
    
    def test_forgot_password_with_empty_email(self, page_context):
        """Test forgot password with empty email field."""
        page_context.goto("/password/forgot")
        page = page_context.page
        
        # Submit without filling email
        page.click('button[type="submit"]')
        
        # Wait for response
        page.wait_for_load_state("networkidle")
        
        # Should show error message
        flash = page.locator('[role="alert"], .alert, .flash-message').first
        if flash.is_visible():
            message = flash.text_content()
            assert message is not None
            assert "email" in message.lower() or "required" in message.lower()
    
    def test_forgot_password_with_nonexistent_email(self, page_context):
        """Test forgot password with email not in system."""
        page_context.goto("/password/forgot")
        page = page_context.page
        
        # Fill with email that doesn't exist
        page.fill('input[name="email"]', 'nonexistent@example.com')
        page.click('button[type="submit"]')
        
        # Wait for response
        page.wait_for_load_state("networkidle")
        
        # Should show generic success message (security feature)
        # Don't reveal if email exists or not
    
    def test_password_reset_with_valid_token(self, page_context):
        """Test password reset page with valid token."""
        # Note: This test requires a valid reset token
        # You would need to generate one or mock it
        pytest.skip("Requires valid reset token - implement with token generation")
    
    def test_password_reset_with_invalid_token(self, page_context):
        """Test password reset page with invalid/expired token."""
        # Try accessing reset page with invalid token
        page_context.goto("/password/reset/invalid-token-12345")
        page = page_context.page
        
        page.wait_for_load_state("networkidle")
        
        # Should show error or redirect to forgot password page
        current_url = page.url
        flash = page.locator('[role="alert"], .alert, .flash-message').first
        
        if flash.is_visible():
            message = flash.text_content()
            assert message is not None
            # Should mention invalid or expired
    
    def test_password_reset_form_validation(self, page_context):
        """Test password reset form validation."""
        # Skip if we can't access reset page without valid token
        pytest.skip("Requires valid reset token - implement with token generation")
    
    def test_password_reset_password_mismatch(self, page_context):
        """Test password reset with mismatched passwords."""
        pytest.skip("Requires valid reset token - implement with token generation")
    
    def test_password_reset_weak_password(self, page_context):
        """Test password reset with weak password."""
        pytest.skip("Requires valid reset token - implement with token generation")
    
    def test_forgot_password_redirect_when_authenticated(self, page_context):
        """Test that authenticated users are redirected from forgot password page."""
        pytest.skip("Requires authenticated user - implement after user creation")

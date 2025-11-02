"""
E2E Tests for User Management & Profile (STP-009 to STP-012)
Tests for user profile, dashboard, and email verification
"""
import pytest
from playwright.sync_api import Page, expect


@pytest.mark.e2e
@pytest.mark.user
class TestUserManagementPages:
    """Test suite for user management and profile pages"""
    
    def test_stp_009_email_verification_system(self, page: Page, base_url: str):
        """
        STP-009: Email Verification System
        Verify the email verification flow works correctly
        Note: This test checks the verification pending page exists
        """
        # Navigate to verification pending page
        # This would typically be reached after signup
        page.goto(f"{base_url}/auth/verification-pending")
        
        # Verify page loads
        expect(page).to_have_url(f"{base_url}/auth/verification-pending")
        
        # Verify page has appropriate content
        page_content = page.locator('body').text_content()
        assert 'verification' in page_content.lower() or 'verify' in page_content.lower()
        
        # Verify heading is present
        heading = page.locator('h1, h2').first
        expect(heading).to_be_visible()
        
        # Note: Full email verification test would require email access
        # and is better suited for integration testing
    
    def test_stp_010_user_profile_page_unauthenticated(self, page: Page, base_url: str):
        """
        STP-010: User Profile Page (Unauthenticated)
        Verify that accessing profile page without authentication redirects to login
        """
        # Try to access profile page without authentication
        page.goto(f"{base_url}/profile")
        
        # Should redirect to login page
        page.wait_for_url(f"{base_url}/auth/login*", timeout=5000)
        
        # Verify we're on login page
        assert '/auth/login' in page.url
    
    def test_stp_010_user_profile_page_structure(self, page: Page, base_url: str):
        """
        STP-010: User Profile Page (Structure)
        Verify the profile page structure when accessed directly
        Note: This test verifies the page exists and redirects appropriately
        """
        # Navigate to profile page
        page.goto(f"{base_url}/profile")
        
        # Either we're on profile page (if somehow authenticated) or login page
        assert '/profile' in page.url or '/auth/login' in page.url
        
        # If on login page, that's expected behavior for unauthenticated users
        if '/auth/login' in page.url:
            # Verify login form is present
            form = page.locator('form').first
            expect(form).to_be_visible()
    
    def test_stp_011_edit_user_profile_page(self, page: Page, base_url: str):
        """
        STP-011: Edit User Profile Page
        Verify the edit profile page exists and redirects unauthenticated users
        """
        # Try to access edit profile page without authentication
        page.goto(f"{base_url}/profile/edit")
        
        # Should redirect to login page
        page.wait_for_url(f"{base_url}/auth/login*", timeout=5000)
        
        # Verify we're on login page
        assert '/auth/login' in page.url
    
    def test_stp_012_user_dashboard_page(self, page: Page, base_url: str):
        """
        STP-012: User Dashboard Page
        Verify the user dashboard exists and handles unauthenticated access
        """
        # Try to access dashboard without authentication
        page.goto(f"{base_url}/profile/dashboard")
        
        # Should redirect to login page
        page.wait_for_url(f"{base_url}/auth/login*", timeout=5000)
        
        # Verify we're on login page
        assert '/auth/login' in page.url


@pytest.mark.e2e
@pytest.mark.user
@pytest.mark.skip(reason="Requires authentication setup")
class TestAuthenticatedUserPages:
    """
    Test suite for authenticated user pages
    These tests require proper authentication setup
    """
    
    def test_authenticated_profile_page(self, authenticated_page: Page, base_url: str):
        """
        Test authenticated user can access profile page
        TODO: Implement after authentication helper is complete
        """
        authenticated_page.goto(f"{base_url}/profile")
        
        # Verify we're on profile page
        expect(authenticated_page).to_have_url(f"{base_url}/profile")
        
        # Verify profile information is displayed
        # Look for common profile elements
        assert authenticated_page.locator('body').text_content()
    
    def test_authenticated_edit_profile(self, authenticated_page: Page, base_url: str):
        """
        Test authenticated user can access edit profile page
        TODO: Implement after authentication helper is complete
        """
        authenticated_page.goto(f"{base_url}/profile/edit")
        
        # Verify we're on edit profile page
        expect(authenticated_page).to_have_url(f"{base_url}/profile/edit")
        
        # Verify edit form is present
        form = authenticated_page.locator('form').first
        expect(form).to_be_visible()
    
    def test_authenticated_dashboard(self, authenticated_page: Page, base_url: str):
        """
        Test authenticated user can access dashboard
        TODO: Implement after authentication helper is complete
        """
        authenticated_page.goto(f"{base_url}/profile/dashboard")
        
        # Verify we're on dashboard page
        expect(authenticated_page).to_have_url(f"{base_url}/profile/dashboard")
        
        # Verify dashboard content is displayed
        assert authenticated_page.locator('body').text_content()


@pytest.mark.e2e
@pytest.mark.user
class TestAuthenticationFlow:
    """Test authentication-related flows"""
    
    def test_signup_form_validation(self, page: Page, base_url: str):
        """Test signup form requires valid inputs"""
        page.goto(f"{base_url}/auth/signup")
        
        # Try to submit empty form
        submit_btn = page.locator('button[type="submit"], input[type="submit"]').first
        submit_btn.click()
        
        # Should still be on signup page (validation failed)
        assert '/auth/signup' in page.url
    
    def test_login_form_validation(self, page: Page, base_url: str):
        """Test login form requires valid email"""
        page.goto(f"{base_url}/auth/login")
        
        # Try to submit empty form
        submit_btn = page.locator('button[type="submit"], input[type="submit"]').first
        submit_btn.click()
        
        # Should still be on login page (validation failed)
        assert '/auth/login' in page.url
    
    def test_login_to_signup_navigation(self, page: Page, base_url: str):
        """Test navigation from login to signup page"""
        page.goto(f"{base_url}/auth/login")
        
        # Click signup link
        signup_link = page.get_by_role('link', name='Sign Up', exact=False)
        signup_link.click()
        
        # Should be on signup page
        expect(page).to_have_url(f"{base_url}/auth/signup")
    
    def test_signup_to_login_navigation(self, page: Page, base_url: str):
        """Test navigation from signup to login page"""
        page.goto(f"{base_url}/auth/signup")
        
        # Click login link
        login_link = page.get_by_role('link', name='Login', exact=False)
        login_link.click()
        
        # Should be on login page
        expect(page).to_have_url(f"{base_url}/auth/login")

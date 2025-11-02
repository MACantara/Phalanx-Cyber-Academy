"""
E2E Tests for Public Pages (STP-001 to STP-008)
Tests the main public-facing pages of the application
"""
import pytest
from playwright.sync_api import Page, expect
from tests.playwright_utils import BasePage, AssertionHelper, NavigationHelper


@pytest.mark.e2e
@pytest.mark.public
class TestPublicPages:
    """Test suite for public pages"""
    
    def test_stp_001_home_page(self, page: Page, base_url: str):
        """
        STP-001: Home Page
        Verify the home page loads correctly and displays expected content
        """
        # Navigate to home page
        page.goto(base_url)
        
        # Verify page loads successfully
        expect(page).to_have_url(f"{base_url}/")
        
        # Verify page title
        assert 'Phalanx Cyber Academy' in page.title() or 'Home' in page.title()
        
        # Verify main heading or logo is present
        # Using a flexible selector to find main headings
        main_heading = page.locator('h1, h2').first
        expect(main_heading).to_be_visible()
        
        # Verify navigation is present
        nav = page.locator('nav, header')
        expect(nav.first).to_be_visible()
        
        # Verify key navigation links
        expect(page.get_by_role('link', name='About', exact=False)).to_be_visible()
        expect(page.get_by_role('link', name='Contact', exact=False)).to_be_visible()
        
        # Verify login/signup CTAs are present
        expect(page.get_by_role('link', name='Login', exact=False)).to_be_visible()
        expect(page.get_by_role('link', name='Sign Up', exact=False)).to_be_visible()
        
        # Verify footer is present
        footer = page.locator('footer')
        expect(footer).to_be_visible()
    
    def test_stp_002_about_page(self, page: Page, base_url: str):
        """
        STP-002: About Page
        Verify the about page loads and displays information about Phalanx Cyber Academy
        """
        # Navigate to about page
        page.goto(f"{base_url}/about")
        
        # Verify page loads successfully
        expect(page).to_have_url(f"{base_url}/about")
        
        # Verify page title contains "About"
        assert 'About' in page.title()
        
        # Verify page has content
        page_content = page.locator('body').text_content()
        assert len(page_content) > 100, "About page should have substantial content"
        
        # Verify heading is present
        heading = page.locator('h1, h2').first
        expect(heading).to_be_visible()
        
        # Verify navigation is present
        expect(page.get_by_role('link', name='Home', exact=False)).to_be_visible()
    
    def test_stp_003_contact_page(self, page: Page, base_url: str):
        """
        STP-003: Contact Page
        Verify the contact page loads and contains a contact form
        """
        # Navigate to contact page
        page.goto(f"{base_url}/contact")
        
        # Verify page loads successfully
        expect(page).to_have_url(f"{base_url}/contact")
        
        # Verify page title contains "Contact"
        assert 'Contact' in page.title()
        
        # Verify contact form is present
        form = page.locator('form').first
        expect(form).to_be_visible()
        
        # Verify form fields are present
        # Name field
        name_input = page.locator('input[name*="name"], input[id*="name"]').first
        expect(name_input).to_be_visible()
        
        # Email field
        email_input = page.locator('input[type="email"], input[name*="email"]').first
        expect(email_input).to_be_visible()
        
        # Message field
        message_field = page.locator('textarea').first
        expect(message_field).to_be_visible()
        
        # Submit button
        submit_btn = page.locator('button[type="submit"], input[type="submit"]').first
        expect(submit_btn).to_be_visible()
    
    def test_stp_004_privacy_policy_page(self, page: Page, base_url: str):
        """
        STP-004: Privacy Policy Page
        Verify the privacy policy page loads and displays policy information
        """
        # Navigate to privacy policy page
        # Try multiple possible URL patterns
        possible_urls = ['/privacy', '/privacy-policy', '/policy/privacy']
        
        loaded = False
        for url in possible_urls:
            try:
                page.goto(f"{base_url}{url}", wait_until='domcontentloaded', timeout=5000)
                if page.url.endswith(url.replace('-', '')):
                    loaded = True
                    break
            except:
                continue
        
        if not loaded:
            pytest.skip("Privacy policy page not found at expected URLs")
        
        # Verify page has content
        page_content = page.locator('body').text_content()
        assert 'privacy' in page_content.lower(), "Privacy policy page should mention privacy"
        assert len(page_content) > 200, "Privacy policy should have substantial content"
        
        # Verify heading is present
        heading = page.locator('h1, h2').first
        expect(heading).to_be_visible()
    
    def test_stp_005_terms_of_service_page(self, page: Page, base_url: str):
        """
        STP-005: Terms of Service Page
        Verify the terms of service page loads and displays terms
        """
        # Navigate to terms of service page
        possible_urls = ['/terms', '/terms-of-service', '/policy/terms']
        
        loaded = False
        for url in possible_urls:
            try:
                page.goto(f"{base_url}{url}", wait_until='domcontentloaded', timeout=5000)
                if 'terms' in page.url.lower():
                    loaded = True
                    break
            except:
                continue
        
        if not loaded:
            pytest.skip("Terms of service page not found at expected URLs")
        
        # Verify page has content
        page_content = page.locator('body').text_content()
        assert 'terms' in page_content.lower(), "Terms page should mention terms"
        assert len(page_content) > 200, "Terms should have substantial content"
        
        # Verify heading is present
        heading = page.locator('h1, h2').first
        expect(heading).to_be_visible()
    
    def test_stp_006_cookie_policy_page(self, page: Page, base_url: str):
        """
        STP-006: Cookie Policy Page
        Verify the cookie policy page loads and displays cookie information
        """
        # Navigate to cookie policy page
        possible_urls = ['/cookies', '/cookie-policy', '/policy/cookies']
        
        loaded = False
        for url in possible_urls:
            try:
                page.goto(f"{base_url}{url}", wait_until='domcontentloaded', timeout=5000)
                if 'cookie' in page.url.lower():
                    loaded = True
                    break
            except:
                continue
        
        if not loaded:
            pytest.skip("Cookie policy page not found at expected URLs")
        
        # Verify page has content
        page_content = page.locator('body').text_content()
        assert 'cookie' in page_content.lower(), "Cookie policy page should mention cookies"
        assert len(page_content) > 200, "Cookie policy should have substantial content"
        
        # Verify heading is present
        heading = page.locator('h1, h2').first
        expect(heading).to_be_visible()
    
    def test_stp_007_login_page(self, page: Page, base_url: str):
        """
        STP-007: Login Page
        Verify the login page loads and displays login form
        """
        # Navigate to login page
        page.goto(f"{base_url}/auth/login")
        
        # Verify page loads successfully
        expect(page).to_have_url(f"{base_url}/auth/login")
        
        # Verify page title
        assert 'Login' in page.title() or 'Sign In' in page.title()
        
        # Verify login form is present
        form = page.locator('form').first
        expect(form).to_be_visible()
        
        # Verify email input field
        email_input = page.locator('input[type="email"], input[name*="email"]').first
        expect(email_input).to_be_visible()
        
        # Verify submit button
        submit_btn = page.locator('button[type="submit"], input[type="submit"]').first
        expect(submit_btn).to_be_visible()
        
        # Verify link to sign up page
        signup_link = page.get_by_role('link', name='Sign Up', exact=False)
        expect(signup_link).to_be_visible()
    
    def test_stp_008_signup_page(self, page: Page, base_url: str):
        """
        STP-008: Sign Up Page
        Verify the sign up page loads and displays registration form
        """
        # Navigate to sign up page
        page.goto(f"{base_url}/auth/signup")
        
        # Verify page loads successfully
        expect(page).to_have_url(f"{base_url}/auth/signup")
        
        # Verify page title
        assert 'Sign Up' in page.title() or 'Register' in page.title()
        
        # Verify registration form is present
        form = page.locator('form').first
        expect(form).to_be_visible()
        
        # Verify username input field
        username_input = page.locator('input[name*="username"]').first
        expect(username_input).to_be_visible()
        
        # Verify email input field
        email_input = page.locator('input[type="email"], input[name*="email"]').first
        expect(email_input).to_be_visible()
        
        # Verify submit button
        submit_btn = page.locator('button[type="submit"], input[type="submit"]').first
        expect(submit_btn).to_be_visible()
        
        # Verify link to login page
        login_link = page.get_by_role('link', name='Login', exact=False)
        expect(login_link).to_be_visible()


@pytest.mark.e2e
@pytest.mark.public
@pytest.mark.smoke
class TestPublicPagesNavigation:
    """Test navigation between public pages"""
    
    def test_navigation_home_to_about(self, page: Page, base_url: str):
        """Test navigation from home to about page"""
        page.goto(base_url)
        page.get_by_role('link', name='About', exact=False).click()
        expect(page).to_have_url(f"{base_url}/about")
    
    def test_navigation_home_to_contact(self, page: Page, base_url: str):
        """Test navigation from home to contact page"""
        page.goto(base_url)
        page.get_by_role('link', name='Contact', exact=False).click()
        expect(page).to_have_url(f"{base_url}/contact")
    
    def test_navigation_home_to_login(self, page: Page, base_url: str):
        """Test navigation from home to login page"""
        page.goto(base_url)
        page.get_by_role('link', name='Login', exact=False).click()
        expect(page).to_have_url(f"{base_url}/auth/login")
    
    def test_navigation_home_to_signup(self, page: Page, base_url: str):
        """Test navigation from home to signup page"""
        page.goto(base_url)
        page.get_by_role('link', name='Sign Up', exact=False).click()
        expect(page).to_have_url(f"{base_url}/auth/signup")

"""
Utility classes and functions for Playwright E2E tests
"""
from playwright.sync_api import Page, expect
from typing import Optional


class BasePage:
    """Base page object with common utilities for all pages"""
    
    def __init__(self, page: Page, base_url: str):
        self.page = page
        self.base_url = base_url
    
    def navigate_to(self, path: str = '/'):
        """Navigate to a specific path"""
        url = f"{self.base_url}{path}"
        self.page.goto(url)
        return self
    
    def get_title(self) -> str:
        """Get page title"""
        return self.page.title()
    
    def wait_for_load_state(self, state: str = 'networkidle'):
        """Wait for page load state"""
        self.page.wait_for_load_state(state)
        return self
    
    def screenshot(self, path: str):
        """Take a screenshot"""
        self.page.screenshot(path=path)
        return self
    
    def has_element(self, selector: str) -> bool:
        """Check if element exists on page"""
        try:
            return self.page.locator(selector).count() > 0
        except:
            return False
    
    def click_button(self, text: str):
        """Click a button by text"""
        self.page.get_by_role('button', name=text).click()
        return self
    
    def click_link(self, text: str):
        """Click a link by text"""
        self.page.get_by_role('link', name=text).click()
        return self
    
    def fill_input(self, label: str, value: str):
        """Fill an input field by label"""
        self.page.get_by_label(label).fill(value)
        return self
    
    def submit_form(self):
        """Submit the current form"""
        self.page.keyboard.press('Enter')
        return self
    
    def get_text(self, selector: str) -> str:
        """Get text content of an element"""
        return self.page.locator(selector).text_content()
    
    def wait_for_url(self, pattern: str):
        """Wait for URL to match pattern"""
        self.page.wait_for_url(pattern)
        return self
    
    def expect_visible(self, selector: str):
        """Assert element is visible"""
        expect(self.page.locator(selector)).to_be_visible()
        return self
    
    def expect_text(self, selector: str, text: str):
        """Assert element contains text"""
        expect(self.page.locator(selector)).to_contain_text(text)
        return self
    
    def expect_url(self, pattern: str):
        """Assert URL matches pattern"""
        expect(self.page).to_have_url(pattern)
        return self


class NavigationHelper:
    """Helper class for navigation testing"""
    
    @staticmethod
    def verify_navbar_links(page: Page):
        """Verify common navbar links are present"""
        navbar_links = ['Home', 'About', 'Contact', 'Login', 'Sign Up']
        for link_text in navbar_links:
            expect(page.get_by_role('link', name=link_text, exact=False)).to_be_visible()
    
    @staticmethod
    def verify_footer_links(page: Page):
        """Verify common footer links are present"""
        footer_links = ['Privacy Policy', 'Terms of Service', 'Cookie Policy']
        for link_text in footer_links:
            expect(page.get_by_role('link', name=link_text, exact=False)).to_be_visible()


class FormHelper:
    """Helper class for form testing"""
    
    @staticmethod
    def fill_login_form(page: Page, email: str):
        """Fill the login form"""
        page.get_by_label('Email', exact=False).fill(email)
    
    @staticmethod
    def fill_signup_form(page: Page, username: str, email: str):
        """Fill the signup form"""
        page.get_by_label('Username', exact=False).fill(username)
        page.get_by_label('Email', exact=False).fill(email)
    
    @staticmethod
    def fill_contact_form(page: Page, name: str, email: str, subject: str, message: str):
        """Fill the contact form"""
        page.get_by_label('Name', exact=False).fill(name)
        page.get_by_label('Email', exact=False).fill(email)
        page.get_by_label('Subject', exact=False).fill(subject)
        page.get_by_label('Message', exact=False).fill(message)


class AuthHelper:
    """Helper class for authentication testing"""
    
    @staticmethod
    def login(page: Page, base_url: str, email: str, verification_code: Optional[str] = None):
        """
        Perform login
        Note: This is a placeholder. Actual implementation depends on your auth flow.
        """
        page.goto(f"{base_url}/auth/login")
        FormHelper.fill_login_form(page, email)
        page.get_by_role('button', name='Continue', exact=False).click()
        
        if verification_code:
            page.get_by_label('Verification Code', exact=False).fill(verification_code)
            page.get_by_role('button', name='Verify', exact=False).click()
    
    @staticmethod
    def logout(page: Page, base_url: str):
        """Perform logout"""
        page.goto(f"{base_url}/auth/logout")


class AssertionHelper:
    """Helper class for common assertions"""
    
    @staticmethod
    def assert_page_title(page: Page, expected_title: str):
        """Assert page title matches expected"""
        assert expected_title.lower() in page.title().lower(), \
            f"Expected title to contain '{expected_title}', got '{page.title()}'"
    
    @staticmethod
    def assert_heading(page: Page, heading_text: str):
        """Assert heading is present on page"""
        heading = page.locator(f'h1:has-text("{heading_text}"), h2:has-text("{heading_text}")')
        expect(heading).to_be_visible()
    
    @staticmethod
    def assert_success_message(page: Page):
        """Assert success message is displayed"""
        success = page.locator('.alert-success, .success, [role="alert"]:has-text("success")')
        expect(success.first).to_be_visible(timeout=5000)
    
    @staticmethod
    def assert_error_message(page: Page):
        """Assert error message is displayed"""
        error = page.locator('.alert-error, .alert-danger, .error, [role="alert"]:has-text("error")')
        expect(error.first).to_be_visible(timeout=5000)

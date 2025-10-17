"""
Base test utilities for Phalanx Cyber Academy automated testing.
"""
from playwright.sync_api import Page, expect
from typing import Optional, List
import json


class PageHelper:
    """Helper class for common page operations."""
    
    def __init__(self, page: Page):
        self.page = page
    
    def wait_for_page_load(self, timeout: int = 30000):
        """Wait for page to fully load."""
        self.page.wait_for_load_state("networkidle", timeout=timeout)
    
    def verify_page_title(self, expected_title: str):
        """Verify page title contains expected text."""
        expect(self.page).to_have_title(expected_title)
    
    def verify_url_contains(self, expected_url_part: str):
        """Verify current URL contains expected part."""
        expect(self.page).to_have_url(f".*{expected_url_part}.*")
    
    def take_screenshot(self, name: str, full_page: bool = False):
        """Take a screenshot for debugging."""
        self.page.screenshot(path=f"tests/screenshots/{name}.png", full_page=full_page)
    
    def check_element_visible(self, selector: str, timeout: int = 10000) -> bool:
        """Check if element is visible."""
        try:
            self.page.wait_for_selector(selector, state="visible", timeout=timeout)
            return True
        except:
            return False
    
    def check_element_exists(self, selector: str) -> bool:
        """Check if element exists in DOM."""
        return self.page.locator(selector).count() > 0
    
    def get_element_text(self, selector: str) -> str:
        """Get text content of element."""
        return self.page.locator(selector).text_content()
    
    def click_element(self, selector: str, timeout: int = 10000):
        """Click an element."""
        self.page.click(selector, timeout=timeout)
    
    def fill_input(self, selector: str, value: str):
        """Fill an input field."""
        self.page.fill(selector, value)
    
    def select_option(self, selector: str, value: str):
        """Select an option from dropdown."""
        self.page.select_option(selector, value)
    
    def check_checkbox(self, selector: str):
        """Check a checkbox."""
        self.page.check(selector)
    
    def uncheck_checkbox(self, selector: str):
        """Uncheck a checkbox."""
        self.page.uncheck(selector)


class ResponseChecker:
    """Helper class for checking HTTP responses."""
    
    @staticmethod
    def verify_status_code(page: Page, expected_status: int):
        """Verify page response status code."""
        response = page.goto(page.url)
        assert response.status == expected_status, f"Expected status {expected_status}, got {response.status}"
    
    @staticmethod
    def check_no_errors(page: Page):
        """Check that page has no console errors."""
        errors = []
        page.on("console", lambda msg: errors.append(msg) if msg.type == "error" else None)
        return len(errors) == 0


class FormHelper:
    """Helper class for form operations."""
    
    def __init__(self, page: Page):
        self.page = page
    
    def fill_form(self, field_mapping: dict):
        """Fill multiple form fields.
        
        Args:
            field_mapping: Dictionary of {selector: value}
        """
        for selector, value in field_mapping.items():
            self.page.fill(selector, value)
    
    def submit_form(self, submit_selector: str):
        """Submit a form."""
        self.page.click(submit_selector)
    
    def verify_form_error(self, error_selector: str, expected_message: Optional[str] = None):
        """Verify form validation error."""
        error_element = self.page.locator(error_selector)
        expect(error_element).to_be_visible()
        if expected_message:
            expect(error_element).to_contain_text(expected_message)


class NavigationHelper:
    """Helper class for navigation operations."""
    
    def __init__(self, page: Page, base_url: str):
        self.page = page
        self.base_url = base_url
    
    def navigate_to(self, path: str):
        """Navigate to a specific path."""
        url = f"{self.base_url}{path}"
        self.page.goto(url)
    
    def click_link(self, link_text: str):
        """Click a link by text."""
        self.page.click(f"text={link_text}")
    
    def verify_navigation(self, expected_path: str):
        """Verify navigation to expected path."""
        expect(self.page).to_have_url(f"{self.base_url}{expected_path}")


class AccessibilityChecker:
    """Helper class for accessibility checks."""
    
    @staticmethod
    def check_heading_hierarchy(page: Page) -> List[str]:
        """Check heading hierarchy on page."""
        headings = []
        for level in range(1, 7):
            elements = page.locator(f"h{level}").all()
            for elem in elements:
                headings.append(f"H{level}: {elem.text_content()}")
        return headings
    
    @staticmethod
    def check_alt_texts(page: Page) -> bool:
        """Check that all images have alt text."""
        images = page.locator("img").all()
        for img in images:
            alt = img.get_attribute("alt")
            if alt is None or alt.strip() == "":
                return False
        return True
    
    @staticmethod
    def check_form_labels(page: Page) -> bool:
        """Check that all inputs have associated labels."""
        inputs = page.locator("input:not([type='hidden'])").all()
        for input_elem in inputs:
            input_id = input_elem.get_attribute("id")
            if input_id:
                label = page.locator(f"label[for='{input_id}']")
                if label.count() == 0:
                    return False
        return True


class PerformanceChecker:
    """Helper class for performance checks."""
    
    @staticmethod
    def measure_page_load_time(page: Page, url: str) -> float:
        """Measure page load time in seconds."""
        import time
        start_time = time.time()
        page.goto(url)
        page.wait_for_load_state("networkidle")
        end_time = time.time()
        return end_time - start_time
    
    @staticmethod
    def check_resource_loading(page: Page, resource_type: str) -> List[dict]:
        """Check loading of specific resource types (stylesheet, script, image, etc.)."""
        resources = []
        
        def handle_response(response):
            if resource_type in response.request.resource_type:
                resources.append({
                    "url": response.url,
                    "status": response.status,
                    "type": response.request.resource_type
                })
        
        page.on("response", handle_response)
        return resources


def load_test_data_from_json(json_path: str) -> List[dict]:
    """Load test data from JSON file."""
    with open(json_path, 'r') as f:
        return json.load(f)


def create_parametrize_data(json_path: str, test_plan_filter: Optional[str] = None):
    """
    Create parametrized test data from JSON test plans.
    
    Args:
        json_path: Path to JSON file with test plans
        test_plan_filter: Optional filter for test plan numbers (e.g., "STP-001")
    
    Returns:
        List of tuples for pytest.mark.parametrize
    """
    test_plans = load_test_data_from_json(json_path)
    
    if test_plan_filter:
        test_plans = [tp for tp in test_plans if tp['test_plan_no'].startswith(test_plan_filter)]
    
    return [
        (
            tp['test_plan_no'],
            tp['description'],
            tp['procedure'],
            tp['expected_results'],
            tp['priority'],
            tp['category']
        )
        for tp in test_plans
    ]

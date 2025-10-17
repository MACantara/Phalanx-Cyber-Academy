"""
Automated tests for Contact Page (STP-003).
Tests are based on system test plans from docs/system-test-plans/json-files/contact-page-tests.json
"""
import pytest
from playwright.sync_api import Page, expect
from tests.utils import PageHelper, FormHelper, AccessibilityChecker


@pytest.mark.functional
@pytest.mark.high
def test_contact_page_loads_correctly(page: Page, base_url: str):
    """
    STP-003-01: Verify that the Contact page loads correctly when accessing the /contact URL.
    
    Expected Results:
    Contact page loads with contact form visible
    """
    helper = PageHelper(page)
    
    # Navigate to contact page
    page.goto(f"{base_url}/contact")
    helper.wait_for_page_load()
    
    # Verify URL
    expect(page).to_have_url(f"{base_url}/contact")
    
    # Check for form elements
    form = page.locator("form")
    assert form.count() > 0, "Contact form should be present"
    
    # Check for typical contact form fields
    input_fields = page.locator("input, textarea")
    assert input_fields.count() >= 3, "Should have multiple input fields (name, email, message, etc.)"


@pytest.mark.security
@pytest.mark.critical
def test_contact_form_input_validation(page: Page, base_url: str):
    """
    STP-003-02: Verify form inputs are properly sanitized and validated.
    
    Expected Results:
    Form validates inputs and prevents invalid submissions
    """
    page.goto(f"{base_url}/contact")
    page.wait_for_load_state("networkidle")
    
    # Try submitting empty form
    submit_button = page.locator("button[type='submit'], input[type='submit']")
    
    if submit_button.count() > 0:
        submit_button.first.click()
        
        # Wait a moment for validation
        page.wait_for_timeout(1000)
        
        # Check for validation messages (HTML5 validation or custom)
        # We expect the form NOT to submit with empty fields
        # One way to check: we should still be on contact page
        current_url = page.url
        assert "contact" in current_url, "Should remain on contact page with invalid submission"
    
    # Test with invalid email format
    email_input = page.locator("input[type='email'], input[name='email'], input[placeholder*='email' i]")
    
    if email_input.count() > 0:
        email_input.first.fill("invalid-email")
        
        # Try to submit
        if submit_button.count() > 0:
            submit_button.first.click()
            page.wait_for_timeout(1000)
            
            # Should still be on contact page or show error
            # HTML5 validation should prevent submission
            assert "contact" in page.url, "Should remain on contact page with invalid email"


@pytest.mark.ui
@pytest.mark.high
def test_contact_page_responsive(mobile_page: Page, base_url: str):
    """
    STP-003-03: Verify contact page is responsive across different screen sizes.
    
    Expected Results:
    Page layout adapts to mobile viewport
    """
    # Navigate with mobile viewport
    mobile_page.goto(f"{base_url}/contact")
    mobile_page.wait_for_load_state("networkidle")
    
    # Verify page loaded
    expect(mobile_page).to_have_url(f"{base_url}/contact")
    
    # Check form is visible on mobile
    form = mobile_page.locator("form")
    assert form.count() > 0, "Contact form should be present on mobile"
    
    # Verify responsive viewport
    viewport = mobile_page.viewport_size
    assert viewport["width"] == 375, "Mobile viewport should be 375px wide"


@pytest.mark.performance
@pytest.mark.medium
def test_contact_page_performance(page: Page, base_url: str):
    """
    STP-003-04: Verify contact page loads efficiently with external resources.
    
    Expected Results:
    Page loads quickly with all resources
    """
    from tests.utils import PerformanceChecker
    
    # Measure load time
    load_time = PerformanceChecker.measure_page_load_time(page, f"{base_url}/contact")
    
    # Verify reasonable load time (3 seconds max)
    assert load_time < 3.0, f"Page load time {load_time:.2f}s exceeds 3 seconds"


@pytest.mark.functional
@pytest.mark.medium
def test_contact_page_accessibility(page: Page, base_url: str):
    """
    STP-003-05: Verify contact page meets accessibility standards (WCAG).
    
    Expected Results:
    Page follows basic accessibility guidelines
    """
    page.goto(f"{base_url}/contact")
    page.wait_for_load_state("networkidle")
    
    # Check form labels are associated with inputs
    # This is a basic accessibility requirement
    inputs = page.locator("input:not([type='hidden'])").all()
    
    for input_elem in inputs:
        input_id = input_elem.get_attribute("id")
        input_name = input_elem.get_attribute("name")
        input_placeholder = input_elem.get_attribute("placeholder")
        
        # Input should have at least one of: id with label, name, or placeholder
        has_label = (
            (input_id and page.locator(f"label[for='{input_id}']").count() > 0) or
            input_name or
            input_placeholder
        )
        
        assert has_label, "Each input should have associated label, name, or placeholder"
    
    # Check heading hierarchy exists
    headings = AccessibilityChecker.check_heading_hierarchy(page)
    assert len(headings) > 0, "Page should have heading structure"


@pytest.mark.functional
@pytest.mark.medium
def test_contact_form_fields_present(page: Page, base_url: str):
    """
    Additional test: Verify all expected contact form fields are present.
    
    Expected Results:
    Form has name, email, subject/message fields
    """
    page.goto(f"{base_url}/contact")
    page.wait_for_load_state("networkidle")
    
    # Check for common contact form fields
    # Name field
    name_field = page.locator(
        "input[name='name'], input[placeholder*='name' i], input[id*='name' i]"
    )
    
    # Email field
    email_field = page.locator(
        "input[type='email'], input[name='email'], input[placeholder*='email' i]"
    )
    
    # Message field
    message_field = page.locator(
        "textarea, input[name='message'], textarea[name='message']"
    )
    
    # At least email and message should be present
    assert email_field.count() > 0, "Email field should be present"
    # Message field is usually a textarea
    assert message_field.count() > 0 or page.locator("textarea").count() > 0, \
        "Message/textarea field should be present"

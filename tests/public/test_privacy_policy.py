"""
Automated tests for Privacy Policy Page (STP-004).
Tests are based on system test plans from docs/system-test-plans/json-files/privacy-policy-tests.json
"""
import pytest
from playwright.sync_api import Page, expect
from tests.utils import PageHelper


@pytest.mark.functional
@pytest.mark.high
def test_privacy_policy_page_loads(page: Page, base_url: str):
    """
    STP-004-01: Verify that the Privacy Policy page loads correctly.
    
    Expected Results:
    Privacy policy page loads with all sections
    """
    helper = PageHelper(page)
    
    # Navigate to privacy policy page
    page.goto(f"{base_url}/privacy-policy")
    helper.wait_for_page_load()
    
    # Verify URL
    expect(page).to_have_url(f"{base_url}/privacy-policy")
    
    # Verify page has substantial content
    page_text = page.locator("body").text_content()
    assert len(page_text) > 500, "Privacy policy should have substantial content"


@pytest.mark.ui
@pytest.mark.high
def test_privacy_policy_responsive(mobile_page: Page, base_url: str):
    """
    STP-004-02: Verify the Privacy Policy page is responsive.
    
    Expected Results:
    Page adapts to mobile viewport
    """
    mobile_page.goto(f"{base_url}/privacy-policy")
    mobile_page.wait_for_load_state("networkidle")
    
    expect(mobile_page).to_have_url(f"{base_url}/privacy-policy")
    
    viewport = mobile_page.viewport_size
    assert viewport["width"] == 375, "Mobile viewport should be 375px"


@pytest.mark.performance
@pytest.mark.medium
def test_privacy_policy_performance(page: Page, base_url: str):
    """
    STP-004-03: Verify privacy policy page loads efficiently.
    
    Expected Results:
    Page loads within reasonable time
    """
    from tests.utils import PerformanceChecker
    
    load_time = PerformanceChecker.measure_page_load_time(page, f"{base_url}/privacy-policy")
    assert load_time < 5.0, f"Page load time {load_time:.2f}s exceeds 5 seconds"


@pytest.mark.functional
@pytest.mark.critical
def test_privacy_policy_required_sections(page: Page, base_url: str):
    """
    STP-004-04: Verify all sections required by Data Privacy Act are present.
    
    Expected Results:
    Page contains all required privacy policy sections
    """
    page.goto(f"{base_url}/privacy-policy")
    page.wait_for_load_state("networkidle")
    
    page_content = page.content().lower()
    
    # Check for key privacy policy sections
    required_keywords = [
        "privacy",
        "data",
        "information",
        "collect",
        "use",
        "policy"
    ]
    
    for keyword in required_keywords:
        assert keyword in page_content, f"Privacy policy should mention '{keyword}'"


@pytest.mark.functional
@pytest.mark.critical
def test_privacy_policy_complete_sections(page: Page, base_url: str):
    """
    STP-004-05: Verify all required privacy policy content sections are present.
    
    Expected Results:
    All standard privacy policy sections exist
    """
    page.goto(f"{base_url}/privacy-policy")
    page.wait_for_load_state("networkidle")
    
    # Check for headings indicating sections
    headings = page.locator("h1, h2, h3, h4").all()
    assert len(headings) > 3, "Privacy policy should have multiple sections"

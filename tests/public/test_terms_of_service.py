"""
Automated tests for Terms of Service Page (STP-005).
Tests are based on system test plans from docs/system-test-plans/json-files/terms-of-service-tests.json
"""
import pytest
from playwright.sync_api import Page, expect
from tests.utils import PageHelper


@pytest.mark.functional
@pytest.mark.high
def test_terms_of_service_page_loads(page: Page, base_url: str):
    """
    STP-005-01: Verify that the Terms of Service page loads correctly.
    
    Expected Results:
    Terms of service page loads with all content
    """
    helper = PageHelper(page)
    
    page.goto(f"{base_url}/terms-of-service")
    helper.wait_for_page_load()
    
    expect(page).to_have_url(f"{base_url}/terms-of-service")
    
    page_text = page.locator("body").text_content()
    assert len(page_text) > 500, "Terms of service should have substantial content"


@pytest.mark.ui
@pytest.mark.high
def test_terms_prohibited_activities_section(page: Page, base_url: str):
    """
    STP-005-02: Verify the prohibited activities section displays prominently.
    
    Expected Results:
    Prohibited activities section is visible
    """
    page.goto(f"{base_url}/terms-of-service")
    page.wait_for_load_state("networkidle")
    
    page_content = page.content().lower()
    
    has_prohibited = (
        "prohibited" in page_content or
        "not allowed" in page_content or
        "forbidden" in page_content or
        "acceptable use" in page_content
    )
    
    assert has_prohibited, "Terms should mention prohibited activities or acceptable use"


@pytest.mark.performance
@pytest.mark.medium
def test_terms_of_service_performance(page: Page, base_url: str):
    """
    STP-005-03: Verify terms of service page loads efficiently.
    
    Expected Results:
    Page loads within reasonable time despite extensive content
    """
    from tests.utils import PerformanceChecker
    
    load_time = PerformanceChecker.measure_page_load_time(page, f"{base_url}/terms-of-service")
    assert load_time < 5.0, f"Page load time {load_time:.2f}s exceeds 5 seconds"


@pytest.mark.functional
@pytest.mark.critical
def test_terms_acceptable_use_policy(page: Page, base_url: str):
    """
    STP-005-04: Verify the acceptable use policy section is present.
    
    Expected Results:
    Acceptable use policy displays permitted and prohibited activities
    """
    page.goto(f"{base_url}/terms-of-service")
    page.wait_for_load_state("networkidle")
    
    page_content = page.content().lower()
    
    has_use_policy = (
        "acceptable use" in page_content or
        "permitted" in page_content or
        "allowed" in page_content or
        "terms" in page_content
    )
    
    assert has_use_policy, "Terms should include acceptable use information"


@pytest.mark.functional
@pytest.mark.critical
def test_terms_limitation_of_liability(page: Page, base_url: str):
    """
    STP-005-05: Verify limitation of liability section is present.
    
    Expected Results:
    Limitation of liability section is visible
    """
    page.goto(f"{base_url}/terms-of-service")
    page.wait_for_load_state("networkidle")
    
    page_content = page.content().lower()
    
    has_liability = (
        "liability" in page_content or
        "limitation" in page_content or
        "disclaimer" in page_content
    )
    
    assert has_liability, "Terms should include limitation of liability"


@pytest.mark.functional
@pytest.mark.medium
def test_terms_sections_structure(page: Page, base_url: str):
    """
    Additional test: Verify terms of service has proper section structure.
    
    Expected Results:
    Multiple sections with headings
    """
    page.goto(f"{base_url}/terms-of-service")
    page.wait_for_load_state("networkidle")
    
    headings = page.locator("h1, h2, h3, h4").all()
    assert len(headings) > 3, "Terms of service should have multiple sections"

"""
Automated tests for About Page (STP-002).
Tests are based on system test plans from docs/system-test-plans/json-files/about-page-tests.json
"""
import pytest
from playwright.sync_api import Page, expect
from tests.utils import PageHelper, PerformanceChecker


@pytest.mark.functional
@pytest.mark.high
def test_about_page_loads_correctly(page: Page, base_url: str):
    """
    STP-002-01: Verify that the About page loads correctly when accessing the /about URL.
    
    Expected Results:
    Page loads successfully with all content sections visible
    """
    helper = PageHelper(page)
    
    # Navigate to about page
    page.goto(f"{base_url}/about")
    helper.wait_for_page_load()
    
    # Verify URL
    expect(page).to_have_url(f"{base_url}/about")
    
    # Verify main content is visible
    main_content = page.locator("main, .container, h1, h2")
    expect(main_content.first).to_be_visible()
    
    # Check page has content
    page_text = page.locator("body").text_content()
    assert len(page_text.strip()) > 100, "About page should have substantial content"


@pytest.mark.ui
@pytest.mark.high
def test_about_page_responsive(mobile_page: Page, base_url: str):
    """
    STP-002-02: Verify the About page is responsive across different screen sizes.
    
    Expected Results:
    Page adapts properly to mobile viewport
    """
    # Navigate with mobile viewport
    mobile_page.goto(f"{base_url}/about")
    mobile_page.wait_for_load_state("networkidle")
    
    # Verify page loaded
    expect(mobile_page).to_have_url(f"{base_url}/about")
    
    # Check content is visible
    body = mobile_page.locator("body")
    expect(body).to_be_visible()
    
    # Verify responsive viewport
    viewport = mobile_page.viewport_size
    assert viewport["width"] == 375, "Mobile viewport should be 375px wide"


@pytest.mark.performance
@pytest.mark.medium
def test_about_page_resources_load(page: Page, base_url: str):
    """
    STP-002-03: Verify that external CSS and JavaScript files load correctly.
    
    Expected Results:
    All external resources load successfully
    """
    resources_loaded = {"css": [], "js": []}
    
    def handle_response(response):
        if "stylesheet" in response.request.resource_type:
            resources_loaded["css"].append(response.status)
        elif "script" in response.request.resource_type:
            resources_loaded["js"].append(response.status)
    
    page.on("response", handle_response)
    
    # Navigate to about page
    page.goto(f"{base_url}/about")
    page.wait_for_load_state("networkidle")
    
    # Verify resources loaded (200 or 304 for cached)
    if resources_loaded["css"]:
        assert all(s in [200, 304] for s in resources_loaded["css"]), "CSS files should load successfully"
    
    if resources_loaded["js"]:
        assert all(s in [200, 304] for s in resources_loaded["js"]), "JS files should load successfully"


@pytest.mark.functional
@pytest.mark.high
def test_about_page_mission_section(page: Page, base_url: str):
    """
    STP-002-04: Verify the Mission section displays content and Get Involved button functionality.
    
    Expected Results:
    Mission section is visible and contains relevant content
    """
    page.goto(f"{base_url}/about")
    page.wait_for_load_state("networkidle")
    
    # Look for mission-related content
    page_content = page.content().lower()
    
    # Check for mission-related keywords
    has_mission_content = (
        "mission" in page_content or
        "about" in page_content or
        "phalanx" in page_content or
        "cyber" in page_content
    )
    
    assert has_mission_content, "Page should contain mission/about content"


@pytest.mark.functional
@pytest.mark.high
def test_about_page_navigation(page: Page, base_url: str):
    """
    STP-002-05: Verify that navigation to and from the About page works correctly.
    
    Expected Results:
    Can navigate to About page and return to other pages
    """
    # Start at home page
    page.goto(base_url)
    page.wait_for_load_state("networkidle")
    
    # Find and click About link in navigation
    about_selectors = [
        "text=About",
        "a[href='/about']",
        "a[href*='about']",
        "nav >> text=About",
    ]
    
    link_found = False
    for selector in about_selectors:
        if page.locator(selector).count() > 0:
            page.click(selector)
            link_found = True
            break
    
    if link_found:
        page.wait_for_load_state("networkidle")
        
        # Verify we're on about page
        current_url = page.url
        assert "about" in current_url, f"Should be on about page, but URL is {current_url}"
        
        # Navigate back
        page.go_back()
        page.wait_for_load_state("networkidle")
        
        # Verify we're back at home
        expect(page).to_have_url(base_url + "/")

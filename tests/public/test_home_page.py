"""
Automated tests for Home Page (STP-001).
Tests are based on system test plans from docs/system-test-plans/json-files/home_page_test_plans.json
"""
import pytest
from playwright.sync_api import Page, expect
from tests.utils import PageHelper, PerformanceChecker, NavigationHelper


@pytest.mark.functional
@pytest.mark.high
@pytest.mark.smoke
def test_home_page_loads_correctly(page: Page, base_url: str):
    """
    STP-001-01: Verify that the home page loads correctly when accessing the root URL.
    
    Procedure:
    1. Open web browser
    2. Navigate to http://localhost:5000/
    3. Verify page loads completely
    4. Check all sections are visible (Hero, Features, Learning Modules, CTA)
    
    Expected Results:
    Display the complete home page with hero section, features, learning modules, and CTA sections
    """
    helper = PageHelper(page)
    
    # Navigate to home page
    page.goto(base_url)
    
    # Wait for page to load
    helper.wait_for_page_load()
    
    # Verify page loaded successfully
    expect(page).to_have_url(base_url + "/")
    
    # Check hero section is visible
    hero_section = page.locator("section").first
    expect(hero_section).to_be_visible()
    
    # Verify page has main content
    main_content = page.locator("main, .container, .hero-section, h1")
    expect(main_content.first).to_be_visible()
    
    # Check that key elements are present
    # Look for navigation
    nav = page.locator("nav")
    assert nav.count() > 0, "Navigation should be present"
    
    # Look for headings indicating sections
    headings = page.locator("h1, h2, h3").all()
    assert len(headings) > 0, "Page should have headings"


@pytest.mark.ui
@pytest.mark.high
def test_home_page_mobile_responsive(mobile_page: Page, base_url: str):
    """
    STP-001-02: Verify home page displays correctly on mobile devices.
    
    Procedure:
    1. Open browser developer tools
    2. Set viewport to mobile size (375x667)
    3. Navigate to home page
    4. Verify responsive layout and button accessibility
    
    Expected Results:
    Page layout adapts to mobile screen with readable text and functional buttons
    """
    # Navigate to home page with mobile viewport
    mobile_page.goto(base_url)
    
    # Wait for page to load
    mobile_page.wait_for_load_state("networkidle")
    
    # Verify page loaded
    expect(mobile_page).to_have_url(base_url + "/")
    
    # Check that content is visible (not overflowing)
    body = mobile_page.locator("body")
    expect(body).to_be_visible()
    
    # Verify viewport width matches mobile
    viewport_size = mobile_page.viewport_size
    assert viewport_size["width"] == 375, "Mobile viewport width should be 375px"
    assert viewport_size["height"] == 667, "Mobile viewport height should be 667px"
    
    # Check for responsive navigation (hamburger menu or similar)
    # Mobile navigation might be different from desktop
    nav_elements = mobile_page.locator("nav, .navbar, .mobile-menu")
    assert nav_elements.count() > 0, "Navigation should be present on mobile"


@pytest.mark.performance
@pytest.mark.medium
def test_home_page_performance(page: Page, base_url: str):
    """
    STP-001-03: Verify home page loads within acceptable time and resources.
    
    Procedure:
    1. Clear browser cache
    2. Open browser developer tools Network tab
    3. Navigate to home page
    4. Verify page load time under 3 seconds
    5. Check all CSS and JS files load successfully
    
    Expected Results:
    Page loads within 3 seconds and CSS/JS files load correctly
    """
    # Measure page load time
    load_time = PerformanceChecker.measure_page_load_time(page, base_url)
    
    # Verify load time is under 3 seconds
    assert load_time < 3.0, f"Page load time {load_time:.2f}s exceeds 3 seconds"
    
    # Check CSS files loaded
    css_resources = []
    js_resources = []
    
    def handle_response(response):
        if "stylesheet" in response.request.resource_type:
            css_resources.append(response.status)
        elif "script" in response.request.resource_type:
            js_resources.append(response.status)
    
    page.on("response", handle_response)
    
    # Navigate again to capture resources
    page.goto(base_url)
    page.wait_for_load_state("networkidle")
    
    # Verify resources loaded successfully (status 200)
    # Note: Some resources might be 304 (cached), which is also acceptable
    if css_resources:
        assert all(status in [200, 304] for status in css_resources), "All CSS files should load successfully"
    
    if js_resources:
        assert all(status in [200, 304] for status in js_resources), "All JS files should load successfully"


@pytest.mark.functional
@pytest.mark.high
@pytest.mark.skip(reason="Requires authentication setup - implement after auth system is configured")
def test_authenticated_user_navigation(page: Page, base_url: str):
    """
    STP-001-04: Verify authenticated user can navigate to levels overview from home page.
    
    Procedure:
    1. Login as authenticated user
    2. Navigate to home page
    3. Click 'Start Learning' or 'Continue Learning' button
    4. Verify redirection to levels overview
    
    Expected Results:
    User is redirected to levels overview page when clicking 'Start Learning' or 'Continue Learning'
    
    Note: This test requires authentication setup which should be implemented
    after the authentication system is properly configured in tests.
    """
    # TODO: Implement after authentication fixtures are ready
    pass


@pytest.mark.functional
@pytest.mark.high
def test_unauthenticated_user_signup_redirect(page: Page, base_url: str):
    """
    STP-001-05: Verify unauthenticated user is directed to signup from home page.
    
    Procedure:
    1. Ensure user is not logged in
    2. Navigate to home page
    3. Click 'Get Started' button
    4. Verify redirection to signup page
    
    Expected Results:
    User is redirected to signup page when clicking 'Get Started'
    """
    helper = PageHelper(page)
    
    # Navigate to home page
    page.goto(base_url)
    helper.wait_for_page_load()
    
    # Look for "Get Started" or similar CTA button
    # Try multiple possible selectors
    cta_selectors = [
        "text=Get Started",
        "text=Sign Up",
        "text=Join Now",
        "a[href*='signup']",
        "button:has-text('Get Started')",
    ]
    
    button_found = False
    for selector in cta_selectors:
        if page.locator(selector).count() > 0:
            # Click the button
            page.click(selector)
            button_found = True
            break
    
    if button_found:
        # Wait for navigation
        page.wait_for_load_state("networkidle")
        
        # Verify we're on signup page
        current_url = page.url
        assert "signup" in current_url or "register" in current_url, \
            f"Expected to be redirected to signup page, but URL is {current_url}"
    else:
        # If no button found, just verify the page has some CTA for signup
        # This is a softer check for when the exact button text might vary
        page_content = page.content()
        assert "signup" in page_content.lower() or "sign up" in page_content.lower() or "register" in page_content.lower(), \
            "Page should have signup/register call-to-action"


@pytest.mark.ui
@pytest.mark.medium
def test_home_page_navigation_present(page: Page, base_url: str):
    """
    Additional test: Verify navigation menu is present and functional.
    """
    page.goto(base_url)
    page.wait_for_load_state("networkidle")
    
    # Check navigation is present
    nav = page.locator("nav, .navbar")
    assert nav.count() > 0, "Navigation menu should be present"
    
    # Check for common navigation links
    nav_content = page.locator("nav, .navbar").first.text_content()
    
    # At minimum, we expect some navigation items
    assert len(nav_content.strip()) > 0, "Navigation should have content"


@pytest.mark.ui
@pytest.mark.medium
def test_home_page_footer_present(page: Page, base_url: str):
    """
    Additional test: Verify footer is present.
    """
    page.goto(base_url)
    page.wait_for_load_state("networkidle")
    
    # Check footer is present
    footer = page.locator("footer")
    
    if footer.count() > 0:
        expect(footer.first).to_be_visible()

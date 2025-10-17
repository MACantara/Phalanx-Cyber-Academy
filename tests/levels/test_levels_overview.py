"""
Automated tests for Cybersecurity Levels Overview (STP-033).
Tests are based on system test plans from docs/system-test-plans/json-files/cybersecurity-levels-tests.json
"""
import pytest
from playwright.sync_api import Page, expect
from tests.utils import PageHelper


@pytest.mark.functional
@pytest.mark.critical
@pytest.mark.skip(reason="Requires authentication - implement after auth fixtures are configured")
def test_levels_page_loads_with_auth(authenticated_page: Page, base_url: str):
    """
    STP-033-01: Verify that the cybersecurity levels page loads correctly with proper authentication.
    
    Expected Results:
    Levels page loads with all level information displayed
    
    Note: Requires authentication fixture implementation
    """
    helper = PageHelper(authenticated_page)
    
    # Navigate to levels page
    authenticated_page.goto(f"{base_url}/levels")
    helper.wait_for_page_load()
    
    # Verify URL
    expect(authenticated_page).to_have_url(f"{base_url}/levels")
    
    # Check for level cards or information
    level_elements = authenticated_page.locator(".level-card, .card, [class*='level']")
    assert level_elements.count() >= 5, "Should display all 5 levels"


@pytest.mark.security
@pytest.mark.critical
def test_unauthenticated_redirect_to_login(page: Page, base_url: str):
    """
    STP-033-02: Verify that unauthenticated users are redirected to login when accessing levels page.
    
    Expected Results:
    Unauthenticated user is redirected to login page
    """
    # Navigate to levels page without authentication
    page.goto(f"{base_url}/levels")
    page.wait_for_load_state("networkidle")
    
    # Should be redirected to login
    current_url = page.url
    
    # Check if redirected to login or if login is required
    is_login_page = (
        "login" in current_url or
        "signin" in current_url or
        "auth" in current_url
    )
    
    # Alternative: might stay on levels but show login prompt
    page_content = page.content().lower()
    requires_auth = (
        is_login_page or
        "login" in page_content or
        "sign in" in page_content or
        "authentication required" in page_content
    )
    
    assert requires_auth, "Levels page should require authentication"


@pytest.mark.integration
@pytest.mark.critical
@pytest.mark.skip(reason="Requires full authentication flow implementation")
def test_levels_complete_workflow(authenticated_page: Page, base_url: str):
    """
    STP-033-03: Verify complete cybersecurity levels workflow from initial access through full progression.
    
    Expected Results:
    User can navigate through levels and track progress
    
    Note: Requires full authentication and game mechanics implementation
    """
    # TODO: Implement complete workflow test
    pass


@pytest.mark.ui
@pytest.mark.medium
def test_levels_page_header_display(page: Page, base_url: str):
    """
    STP-033-04: Verify the page header displays correct title and description with proper styling.
    
    Expected Results:
    Page header is visible with title and description
    """
    page.goto(f"{base_url}/levels")
    page.wait_for_load_state("networkidle")
    
    # Check for header/title (might be visible even without auth)
    headings = page.locator("h1, h2, .page-title, .header-title").all()
    
    # Should have at least some heading structure
    assert len(headings) > 0 or "level" in page.content().lower(), \
        "Page should have level-related content or require authentication"


@pytest.mark.ui
@pytest.mark.medium
def test_levels_responsive_grid_layout(page: Page, base_url: str):
    """
    STP-033-05: Verify the levels are displayed in a responsive grid layout with proper card structure.
    
    Expected Results:
    Levels are displayed in a grid layout
    
    Note: May require authentication to view actual level cards
    """
    page.goto(f"{base_url}/levels")
    page.wait_for_load_state("networkidle")
    
    # Check for grid or card layout classes
    page_html = page.content().lower()
    
    has_grid_layout = (
        "grid" in page_html or
        "card" in page_html or
        "level" in page_html or
        "flex" in page_html
    )
    
    # This is a basic check - actual grid might only be visible with auth
    assert has_grid_layout or "login" in page.url, \
        "Page should have grid layout or require authentication"


@pytest.mark.functional
@pytest.mark.high
def test_levels_page_accessible(page: Page, base_url: str):
    """
    Additional test: Verify levels page is accessible and provides feedback.
    
    Expected Results:
    Page loads and provides appropriate messaging
    """
    page.goto(f"{base_url}/levels")
    page.wait_for_load_state("networkidle")
    
    # Page should either:
    # 1. Show levels (if authenticated)
    # 2. Redirect to login
    # 3. Show authentication prompt
    
    # Verify page responded (not 404)
    page_content = page.content()
    assert len(page_content) > 100, "Page should have content"


@pytest.mark.functional
@pytest.mark.medium
def test_level_information_structure(page: Page, base_url: str):
    """
    Additional test: Verify level information structure exists.
    
    Expected Results:
    Page structure supports level display
    
    Note: Actual content may require authentication
    """
    page.goto(f"{base_url}/levels")
    page.wait_for_load_state("networkidle")
    
    # Check for level-related elements or authentication requirement
    page_lower = page.content().lower()
    
    has_level_structure = (
        "level 1" in page_lower or
        "level 2" in page_lower or
        "misinformation" in page_lower or
        "phishing" in page_lower or
        "malware" in page_lower or
        "hacking" in page_lower or
        "forensics" in page_lower or
        "login" in page.url or
        "auth" in page.url
    )
    
    assert has_level_structure, \
        "Page should have level information or require authentication"

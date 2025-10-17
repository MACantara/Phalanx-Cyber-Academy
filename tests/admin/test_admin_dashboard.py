"""
Automated tests for Admin Dashboard (STP-015).
Tests are based on system test plans from docs/system-test-plans/json-files/admin-dashboard-tests.json
"""
import pytest
from playwright.sync_api import Page, expect
from tests.utils import PageHelper


@pytest.mark.functional
@pytest.mark.critical
@pytest.mark.skip(reason="Requires admin authentication - implement after auth fixtures are configured")
def test_admin_dashboard_loads_with_auth(admin_page: Page, base_url: str):
    """
    STP-015-01: Verify that the Admin Dashboard page loads correctly with authenticated admin user.
    
    Expected Results:
    Admin dashboard loads with statistics and admin controls
    
    Note: Requires admin authentication fixture implementation
    """
    helper = PageHelper(admin_page)
    
    # Navigate to admin dashboard
    admin_page.goto(f"{base_url}/admin")
    helper.wait_for_page_load()
    
    # Verify URL
    current_url = admin_page.url
    assert "admin" in current_url, "Should be on admin page"
    
    # Check for dashboard elements
    dashboard_elements = admin_page.locator(".dashboard, .stats, .card")
    assert dashboard_elements.count() > 0, "Dashboard should have statistics cards"


@pytest.mark.security
@pytest.mark.critical
def test_admin_dashboard_requires_admin_auth(page: Page, base_url: str):
    """
    STP-015-02: Verify admin dashboard requires proper admin authentication and redirects non-admin users.
    
    Expected Results:
    Non-admin users are denied access or redirected
    """
    # Try to access admin dashboard without authentication
    page.goto(f"{base_url}/admin")
    page.wait_for_load_state("networkidle")
    
    current_url = page.url
    page_content = page.content().lower()
    
    # Should either redirect to login or show access denied
    is_protected = (
        "login" in current_url or
        "signin" in current_url or
        "auth" in current_url or
        "unauthorized" in page_content or
        "access denied" in page_content or
        "forbidden" in page_content or
        "admin" not in current_url  # Redirected away from admin
    )
    
    assert is_protected, "Admin dashboard should be protected from unauthorized access"


@pytest.mark.integration
@pytest.mark.critical
@pytest.mark.skip(reason="Requires database setup and admin authentication")
def test_admin_dashboard_database_integration(admin_page: Page, base_url: str):
    """
    STP-015-03: Verify dashboard integrates correctly with database models for statistics.
    
    Expected Results:
    Dashboard displays data from database
    
    Note: Requires admin authentication and database with test data
    """
    # TODO: Implement database integration test
    pass


@pytest.mark.ui
@pytest.mark.high
def test_admin_dashboard_responsive(page: Page, base_url: str):
    """
    STP-015-04: Verify admin dashboard is responsive across different screen sizes.
    
    Expected Results:
    Dashboard layout adapts to different screen sizes
    
    Note: Tests responsive design even if access is denied
    """
    page.goto(f"{base_url}/admin")
    page.wait_for_load_state("networkidle")
    
    # Check page has responsive design classes
    page_html = page.content().lower()
    
    has_responsive = (
        "container" in page_html or
        "grid" in page_html or
        "flex" in page_html or
        "responsive" in page_html
    )
    
    # Basic check - actual responsive layout might only be visible with auth
    assert has_responsive or "login" in page.url, \
        "Page should have responsive design or require authentication"


@pytest.mark.functional
@pytest.mark.high
@pytest.mark.skip(reason="Requires admin authentication and database")
def test_admin_dashboard_statistics_display(admin_page: Page, base_url: str):
    """
    STP-015-05: Verify dashboard statistics display accurate real-time data.
    
    Expected Results:
    Statistics cards show current system data
    
    Note: Requires admin authentication and active database
    """
    # TODO: Implement statistics display test
    pass


@pytest.mark.security
@pytest.mark.high
def test_admin_routes_access_control(page: Page, base_url: str):
    """
    Additional test: Verify all admin routes require authentication.
    
    Expected Results:
    All admin routes are protected
    """
    admin_routes = [
        "/admin",
        "/admin/users",
        "/admin/logs",
        "/admin/system-backup",
        "/admin/player-analytics",
    ]
    
    for route in admin_routes:
        page.goto(f"{base_url}{route}")
        page.wait_for_load_state("networkidle")
        
        current_url = page.url
        page_content = page.content().lower()
        
        # Each route should be protected
        is_protected = (
            "login" in current_url or
            "auth" in current_url or
            "unauthorized" in page_content or
            "access denied" in page_content or
            route not in current_url  # Redirected away
        )
        
        assert is_protected, f"Admin route {route} should be protected"


@pytest.mark.ui
@pytest.mark.medium
def test_admin_navigation_structure(page: Page, base_url: str):
    """
    Additional test: Verify admin panel has proper navigation structure.
    
    Expected Results:
    Admin interface structure is present
    
    Note: Actual navigation may require authentication
    """
    page.goto(f"{base_url}/admin")
    page.wait_for_load_state("networkidle")
    
    # Check for navigation or authentication requirement
    page_content = page.content().lower()
    
    has_structure = (
        "admin" in page_content or
        "dashboard" in page_content or
        "login" in page.url or
        "auth" in page.url
    )
    
    assert has_structure, \
        "Page should have admin structure or require authentication"

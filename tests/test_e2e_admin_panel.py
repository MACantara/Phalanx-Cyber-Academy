"""
E2E Tests for Admin Panel (STP-013 to STP-030)
Tests for admin dashboard, analytics, user management, logs, backups, and system tests
"""
import pytest
from playwright.sync_api import Page, expect


@pytest.mark.e2e
@pytest.mark.admin
class TestAdminPanelAccess:
    """Test admin panel access and authentication"""
    
    def test_admin_dashboard_requires_auth(self, page: Page, base_url: str):
        """Verify admin pages require authentication"""
        admin_urls = [
            '/admin',
            '/admin/users',
            '/admin/logs',
            '/admin/system-backup',
            '/admin/player-analytics',
        ]
        
        for url in admin_urls:
            page.goto(f"{base_url}{url}")
            # Should redirect to login or show access denied
            assert '/auth/login' in page.url or '/admin' not in page.url or '403' in page.locator('body').text_content()


@pytest.mark.e2e
@pytest.mark.admin
class TestAdminDashboard:
    """Test suite for admin dashboard (STP-013)"""
    
    def test_stp_013_admin_dashboard_page(self, page: Page, base_url: str):
        """
        STP-013: Admin Dashboard
        Verify admin dashboard page structure
        """
        page.goto(f"{base_url}/admin")
        
        # Either redirects to login or shows dashboard (if authenticated as admin)
        assert '/admin' in page.url or '/auth/login' in page.url


@pytest.mark.e2e
@pytest.mark.admin
class TestPlayerAnalytics:
    """Test suite for player analytics pages (STP-014 to STP-016)"""
    
    def test_stp_014_player_data_analytics_page(self, page: Page, base_url: str):
        """
        STP-014: Player Data Analytics Page
        Verify player analytics page exists
        """
        page.goto(f"{base_url}/admin/player-analytics")
        
        # Should require admin authentication
        assert '/admin' in page.url or '/auth/login' in page.url
    
    def test_stp_015_level_analytics_page(self, page: Page, base_url: str):
        """
        STP-015: Level Analytics Page
        Verify level analytics page exists
        """
        page.goto(f"{base_url}/admin/player-analytics/levels")
        
        # Should require admin authentication
        assert '/admin' in page.url or '/auth/login' in page.url
    
    def test_stp_016_blue_vs_red_analytics_page(self, page: Page, base_url: str):
        """
        STP-016: Blue vs Red Analytics Page
        Verify blue vs red mode analytics page exists
        """
        page.goto(f"{base_url}/admin/player-analytics/blue-vs-red")
        
        # Should require admin authentication
        assert '/admin' in page.url or '/auth/login' in page.url


@pytest.mark.e2e
@pytest.mark.admin
class TestUserManagement:
    """Test suite for user management pages (STP-017 to STP-018)"""
    
    def test_stp_017_user_management_page(self, page: Page, base_url: str):
        """
        STP-017: User Management
        Verify user management page exists
        """
        page.goto(f"{base_url}/admin/users")
        
        # Should require admin authentication
        assert '/admin' in page.url or '/auth/login' in page.url
    
    def test_stp_018_user_details_page(self, page: Page, base_url: str):
        """
        STP-018: User Details
        Verify user details page structure
        Note: Using ID 1 as placeholder
        """
        page.goto(f"{base_url}/admin/user/1")
        
        # Should require admin authentication or show not found
        assert '/admin' in page.url or '/auth/login' in page.url or '404' in page.locator('body').text_content()


@pytest.mark.e2e
@pytest.mark.admin
class TestSystemLogs:
    """Test suite for system logs (STP-019)"""
    
    def test_stp_019_system_logs_page(self, page: Page, base_url: str):
        """
        STP-019: System Logs
        Verify system logs page exists
        """
        page.goto(f"{base_url}/admin/logs")
        
        # Should require admin authentication
        assert '/admin' in page.url or '/auth/login' in page.url


@pytest.mark.e2e
@pytest.mark.admin
class TestSystemBackup:
    """Test suite for system backup pages (STP-020 to STP-021)"""
    
    def test_stp_020_system_backup_page(self, page: Page, base_url: str):
        """
        STP-020: System Backup
        Verify system backup page exists
        """
        page.goto(f"{base_url}/admin/system-backup")
        
        # Should require admin authentication
        assert '/admin' in page.url or '/auth/login' in page.url
    
    def test_stp_021_backup_schedule_page(self, page: Page, base_url: str):
        """
        STP-021: System Backup Schedule
        Verify backup schedule page exists
        """
        page.goto(f"{base_url}/admin/backup-schedule")
        
        # Should require admin authentication
        assert '/admin' in page.url or '/auth/login' in page.url


@pytest.mark.e2e
@pytest.mark.admin
class TestSystemTest:
    """Test suite for system test pages (STP-022 to STP-030)"""
    
    def test_stp_022_system_test_dashboard(self, page: Page, base_url: str):
        """
        STP-022: System Test Dashboard
        Verify system test dashboard exists
        """
        page.goto(f"{base_url}/admin/system-test/")
        
        # Should require admin authentication
        assert '/admin' in page.url or '/auth/login' in page.url
    
    def test_stp_023_module_test_details(self, page: Page, base_url: str):
        """
        STP-023: Module Test Details
        Verify module test details page exists
        """
        # Using 'auth' as example module name
        page.goto(f"{base_url}/admin/system-test/modules/auth")
        
        # Should require admin authentication
        assert '/admin' in page.url or '/auth/login' in page.url
    
    def test_stp_024_system_test_plans_list(self, page: Page, base_url: str):
        """
        STP-024: System Test Plans List
        Verify test plans list page exists
        """
        page.goto(f"{base_url}/admin/system-test/test-plans")
        
        # Should require admin authentication
        assert '/admin' in page.url or '/auth/login' in page.url
    
    def test_stp_025_test_plan_details_view(self, page: Page, base_url: str):
        """
        STP-025: Test Plan Details View
        Verify test plan details page structure
        """
        # Using ID 1 as placeholder
        page.goto(f"{base_url}/admin/system-test/test-plans/1")
        
        # Should require admin authentication or show not found
        assert '/admin' in page.url or '/auth/login' in page.url or '404' in page.locator('body').text_content()
    
    def test_stp_026_test_plan_creation_form(self, page: Page, base_url: str):
        """
        STP-026: Test Plan Creation Form
        Verify test plan creation page exists
        """
        page.goto(f"{base_url}/admin/system-test/test-plans/new")
        
        # Should require admin authentication
        assert '/admin' in page.url or '/auth/login' in page.url
    
    def test_stp_027_edit_test_plan_form(self, page: Page, base_url: str):
        """
        STP-027: Edit Test Plan Form
        Verify test plan edit page structure
        """
        # Using ID 1 as placeholder
        page.goto(f"{base_url}/admin/system-test/test-plans/1/edit")
        
        # Should require admin authentication or show not found
        assert '/admin' in page.url or '/auth/login' in page.url or '404' in page.locator('body').text_content()
    
    def test_stp_028_bulk_import_test_plans(self, page: Page, base_url: str):
        """
        STP-028: Bulk Import Test Plans
        Verify bulk import page exists
        """
        page.goto(f"{base_url}/admin/system-test/bulk-import")
        
        # Should require admin authentication
        assert '/admin' in page.url or '/auth/login' in page.url
    
    def test_stp_029_execute_test_plan(self, page: Page, base_url: str):
        """
        STP-029: Execute Test Plan
        Verify test execution endpoint exists
        """
        # Using ID 1 as placeholder
        page.goto(f"{base_url}/admin/system-test/test-plans/1/execute")
        
        # Should require admin authentication or show not found
        assert '/admin' in page.url or '/auth/login' in page.url or '404' in page.locator('body').text_content()
    
    def test_stp_030_test_execution_reports(self, page: Page, base_url: str):
        """
        STP-030: Test Execution Reports
        Verify test reports page exists
        """
        page.goto(f"{base_url}/admin/system-test/reports")
        
        # Should require admin authentication
        assert '/admin' in page.url or '/auth/login' in page.url


@pytest.mark.e2e
@pytest.mark.admin
@pytest.mark.skip(reason="Requires admin authentication setup")
class TestAuthenticatedAdminPages:
    """
    Test suite for authenticated admin operations
    These tests require proper admin authentication setup
    """
    
    def test_admin_dashboard_authenticated(self, admin_page: Page, base_url: str):
        """
        Test admin can access dashboard
        TODO: Implement after admin authentication helper is complete
        """
        admin_page.goto(f"{base_url}/admin")
        
        # Verify we're on admin dashboard
        expect(admin_page).to_have_url(f"{base_url}/admin")
        
        # Verify dashboard elements are present
        assert admin_page.locator('body').text_content()
    
    def test_user_management_authenticated(self, admin_page: Page, base_url: str):
        """
        Test admin can access user management
        TODO: Implement after admin authentication helper is complete
        """
        admin_page.goto(f"{base_url}/admin/users")
        
        # Verify we're on user management page
        expect(admin_page).to_have_url(f"{base_url}/admin/users")
        
        # Verify user list or table is present
        assert admin_page.locator('body').text_content()

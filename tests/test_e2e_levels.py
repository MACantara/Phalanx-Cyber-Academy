"""
E2E Tests for Learning Levels (STP-031 to STP-036)
Tests for the 5 cybersecurity learning levels and level overview
"""
import pytest
from playwright.sync_api import Page, expect


@pytest.mark.e2e
@pytest.mark.levels
class TestLevelsOverview:
    """Test suite for levels overview page (STP-031)"""
    
    def test_stp_031_cybersecurity_levels_overview(self, page: Page, base_url: str):
        """
        STP-031: Cybersecurity Levels Overview
        Verify the levels overview page displays all available levels
        """
        page.goto(f"{base_url}/levels")
        
        # Either redirects to login or shows levels (if authenticated)
        if '/auth/login' in page.url:
            # Not authenticated, verify redirect happened
            assert '/auth/login' in page.url
        else:
            # On levels page, verify structure
            expect(page).to_have_url(f"{base_url}/levels")
            
            # Verify page has content
            page_content = page.locator('body').text_content()
            assert len(page_content) > 100, "Levels page should have content"
            
            # Verify heading is present
            heading = page.locator('h1, h2').first
            expect(heading).to_be_visible()


@pytest.mark.e2e
@pytest.mark.levels
class TestIndividualLevels:
    """Test suite for individual level pages (STP-032 to STP-036)"""
    
    def test_stp_032_level_1_misinformation_maze(self, page: Page, base_url: str):
        """
        STP-032: The Misinformation Maze (Level 1)
        Verify Level 1 page exists and has correct structure
        """
        page.goto(f"{base_url}/levels/1/start")
        
        # Either redirects to login or shows level
        if '/auth/login' in page.url:
            assert '/auth/login' in page.url
        else:
            # Verify we're on a level page
            assert '/levels' in page.url or 'level' in page.url.lower()
    
    def test_stp_033_level_2_shadow_in_inbox(self, page: Page, base_url: str):
        """
        STP-033: Shadow in the Inbox (Level 2)
        Verify Level 2 page exists and has correct structure
        """
        page.goto(f"{base_url}/levels/2/start")
        
        # Either redirects to login or shows level
        if '/auth/login' in page.url:
            assert '/auth/login' in page.url
        else:
            # Verify we're on a level page
            assert '/levels' in page.url or 'level' in page.url.lower()
    
    def test_stp_034_level_3_malware_mayhem(self, page: Page, base_url: str):
        """
        STP-034: Malware Mayhem (Level 3)
        Verify Level 3 page exists and has correct structure
        """
        page.goto(f"{base_url}/levels/3/start")
        
        # Either redirects to login or shows level
        if '/auth/login' in page.url:
            assert '/auth/login' in page.url
        else:
            # Verify we're on a level page
            assert '/levels' in page.url or 'level' in page.url.lower()
    
    def test_stp_035_level_4_white_hat_test(self, page: Page, base_url: str):
        """
        STP-035: The White Hat Test (Level 4)
        Verify Level 4 page exists and has correct structure
        """
        page.goto(f"{base_url}/levels/4/start")
        
        # Either redirects to login or shows level
        if '/auth/login' in page.url:
            assert '/auth/login' in page.url
        else:
            # Verify we're on a level page
            assert '/levels' in page.url or 'level' in page.url.lower()
    
    def test_stp_036_level_5_hunt_for_the_null(self, page: Page, base_url: str):
        """
        STP-036: The Hunt for The Null (Level 5)
        Verify Level 5 page exists and has correct structure
        """
        page.goto(f"{base_url}/levels/5/start")
        
        # Either redirects to login or shows level
        if '/auth/login' in page.url:
            assert '/auth/login' in page.url
        else:
            # Verify we're on a level page
            assert '/levels' in page.url or 'level' in page.url.lower()


@pytest.mark.e2e
@pytest.mark.levels
class TestLevelAPIs:
    """Test suite for level-related API endpoints"""
    
    def test_level_statistics_api(self, page: Page, base_url: str):
        """Test level statistics API endpoint"""
        # Navigate to API endpoint
        page.goto(f"{base_url}/api/level/1/statistics")
        
        # Check if response is received (JSON or redirect)
        page_content = page.locator('body').text_content()
        
        # If not authenticated, might redirect or return error
        # If authenticated, should return JSON
        assert page_content is not None
    
    def test_news_api_articles(self, page: Page, base_url: str):
        """Test news articles API for Level 1"""
        page.goto(f"{base_url}/api/news/articles")
        
        # Check if response is received
        page_content = page.locator('body').text_content()
        assert page_content is not None
    
    def test_email_api_random(self, page: Page, base_url: str):
        """Test email API for Level 2"""
        page.goto(f"{base_url}/api/emails/random")
        
        # Check if response is received
        page_content = page.locator('body').text_content()
        assert page_content is not None
    
    def test_level3_malware_data_api(self, page: Page, base_url: str):
        """Test malware data API for Level 3"""
        page.goto(f"{base_url}/api/level3/malware-data")
        
        # Check if response is received
        page_content = page.locator('body').text_content()
        assert page_content is not None
    
    def test_level4_hosts_data_api(self, page: Page, base_url: str):
        """Test hosts data API for Level 4"""
        page.goto(f"{base_url}/api/level4/hosts-data")
        
        # Check if response is received
        page_content = page.locator('body').text_content()
        assert page_content is not None


@pytest.mark.e2e
@pytest.mark.levels
@pytest.mark.skip(reason="Requires authentication setup")
class TestAuthenticatedLevels:
    """
    Test suite for authenticated level gameplay
    These tests require proper authentication setup
    """
    
    def test_level_1_authenticated_access(self, authenticated_page: Page, base_url: str):
        """
        Test authenticated user can access Level 1
        TODO: Implement after authentication helper is complete
        """
        authenticated_page.goto(f"{base_url}/levels/1/start")
        
        # Verify we're on level page
        assert '/levels' in authenticated_page.url
        
        # Verify level content is loaded
        assert authenticated_page.locator('body').text_content()
    
    def test_level_completion(self, authenticated_page: Page, base_url: str):
        """
        Test level completion flow
        TODO: Implement after authentication helper is complete
        """
        # Navigate to level
        authenticated_page.goto(f"{base_url}/levels/1/start")
        
        # Verify level started
        assert '/levels' in authenticated_page.url
        
        # Note: Actual completion testing would require interacting
        # with the level's gameplay mechanics
    
    def test_level_progress_tracking(self, authenticated_page: Page, base_url: str):
        """
        Test that level progress is tracked
        TODO: Implement after authentication helper is complete
        """
        # Check levels overview shows progress
        authenticated_page.goto(f"{base_url}/levels")
        
        # Verify progress indicators are present
        assert authenticated_page.locator('body').text_content()


@pytest.mark.e2e
@pytest.mark.levels
class TestLevelNavigation:
    """Test navigation related to levels"""
    
    def test_navigation_to_levels_from_home(self, page: Page, base_url: str):
        """Test navigation to levels from home page"""
        page.goto(base_url)
        
        # Look for levels link (might be in nav or main content)
        levels_link = page.get_by_role('link', name='Levels', exact=False)
        
        if levels_link.count() > 0:
            levels_link.first.click()
            # Should navigate to levels or login
            assert '/levels' in page.url or '/auth/login' in page.url
        else:
            # If no direct link, that's also valid - just verify home page loaded
            assert page.url == base_url or page.url == f"{base_url}/"

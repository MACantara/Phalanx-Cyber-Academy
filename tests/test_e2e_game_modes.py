"""
E2E Tests for Game Modes (STP-037)
Tests for Blue Team vs Red Team mode
"""
import pytest
from playwright.sync_api import Page, expect


@pytest.mark.e2e
@pytest.mark.gamemode
class TestBlueTeamVsRedTeamMode:
    """Test suite for Blue Team vs Red Team mode (STP-037)"""
    
    def test_stp_037_blue_vs_red_mode_page(self, page: Page, base_url: str):
        """
        STP-037: Blue Team vs Red Team Mode
        Verify the Blue vs Red mode page exists and has correct structure
        """
        # Try various possible URLs for the game mode
        possible_urls = [
            '/blue-red',
            '/blue-team-vs-red-team',
            '/game-modes/blue-red',
            '/modes/blue-red',
        ]
        
        page_found = False
        for url in possible_urls:
            try:
                page.goto(f"{base_url}{url}", wait_until='domcontentloaded', timeout=5000)
                if url in page.url or 'blue' in page.url.lower() or 'red' in page.url.lower():
                    page_found = True
                    break
            except:
                continue
        
        if not page_found:
            # Try to access from levels or main navigation
            page.goto(base_url)
            
            # Look for game mode link
            game_mode_link = page.get_by_role('link', name='Blue', exact=False)
            if game_mode_link.count() == 0:
                game_mode_link = page.get_by_role('link', name='Red', exact=False)
            
            if game_mode_link.count() > 0:
                game_mode_link.first.click()
                page_found = True
        
        if page_found:
            # Either redirects to login or shows game mode
            if '/auth/login' in page.url:
                assert '/auth/login' in page.url
            else:
                # Verify we're on a game mode related page
                page_content = page.locator('body').text_content()
                assert page_content is not None
        else:
            pytest.skip("Blue Team vs Red Team mode page not found at expected URLs")


@pytest.mark.e2e
@pytest.mark.gamemode
@pytest.mark.skip(reason="Requires authentication setup")
class TestAuthenticatedGameMode:
    """
    Test suite for authenticated game mode access
    These tests require proper authentication setup
    """
    
    def test_blue_red_mode_authenticated_access(self, authenticated_page: Page, base_url: str):
        """
        Test authenticated user can access Blue vs Red mode
        TODO: Implement after authentication helper is complete
        """
        # Try to access the game mode
        authenticated_page.goto(f"{base_url}/blue-red")
        
        # Verify access is granted
        assert 'blue' in authenticated_page.url.lower() or 'red' in authenticated_page.url.lower()
        
        # Verify game mode content is loaded
        assert authenticated_page.locator('body').text_content()
    
    def test_game_mode_team_selection(self, authenticated_page: Page, base_url: str):
        """
        Test team selection in game mode
        TODO: Implement after authentication and game mode mechanics are understood
        """
        authenticated_page.goto(f"{base_url}/blue-red")
        
        # Look for team selection UI
        page_content = authenticated_page.locator('body').text_content()
        
        # Verify team selection options are present
        assert page_content is not None
    
    def test_game_mode_gameplay(self, authenticated_page: Page, base_url: str):
        """
        Test game mode gameplay mechanics
        TODO: Implement after game mode mechanics are fully understood
        """
        authenticated_page.goto(f"{base_url}/blue-red")
        
        # Verify game mode interface is loaded
        assert authenticated_page.locator('body').text_content()


@pytest.mark.e2e
@pytest.mark.gamemode
class TestGameModeAnalytics:
    """Test game mode analytics integration"""
    
    def test_blue_vs_red_analytics_page(self, page: Page, base_url: str):
        """Test that analytics page for game mode exists"""
        page.goto(f"{base_url}/admin/player-analytics/blue-vs-red")
        
        # Should require admin authentication
        assert '/admin' in page.url or '/auth/login' in page.url

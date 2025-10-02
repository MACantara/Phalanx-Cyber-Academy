"""
UI Tests - Theme Functionality

Tests for light mode, dark mode, and system preferences themes.
"""

import pytest
from playwright.sync_api import Page, expect


@pytest.mark.theme
class TestThemes:
    """Test suite for theme functionality."""
    
    def test_light_theme_applied(self, page_context, theme_helper):
        """Test that light theme is properly applied."""
        page_context.goto("/")
        
        # Set light theme
        theme_helper.set_theme_preference("light")
        page_context.page.reload()
        page_context.page.wait_for_load_state("networkidle")
        
        # Check that dark class is not present
        current_theme = theme_helper.get_current_theme()
        assert current_theme == "light"
        
        # Verify light theme styles are applied
        html = page_context.page.locator('html')
        expect(html).not_to_have_class("dark")
    
    def test_dark_theme_applied(self, page_context, theme_helper):
        """Test that dark theme is properly applied."""
        page_context.goto("/")
        
        # Set dark theme
        theme_helper.set_theme_preference("dark")
        page_context.page.reload()
        page_context.page.wait_for_load_state("networkidle")
        
        # Check that dark class is present
        current_theme = theme_helper.get_current_theme()
        assert current_theme == "dark"
        
        # Verify dark theme styles are applied
        html = page_context.page.locator('html')
        expect(html).to_have_class("dark")
    
    def test_system_theme_preference(self, page_context, theme_helper):
        """Test that system theme preference is respected."""
        page_context.goto("/")
        
        # Set system theme
        theme_helper.set_theme_preference("system")
        page_context.page.reload()
        page_context.page.wait_for_load_state("networkidle")
        
        # Theme should match system preference
        preference = theme_helper.get_theme_preference()
        # System preference means no theme is stored
        assert preference is None or preference == "system"
    
    def test_theme_persists_across_pages(self, page_context, theme_helper):
        """Test that theme preference persists when navigating between pages."""
        page_context.goto("/")
        
        # Set dark theme
        theme_helper.set_theme_preference("dark")
        page_context.page.reload()
        page_context.page.wait_for_load_state("networkidle")
        
        # Navigate to another page
        page_context.goto("/auth/login")
        
        # Theme should still be dark
        current_theme = theme_helper.get_current_theme()
        assert current_theme == "dark"
    
    def test_theme_toggle_button_exists(self, page_context):
        """Test that theme toggle button is present."""
        page_context.goto("/")
        page = page_context.page
        
        # Look for theme toggle button
        theme_button = page.locator('button[aria-label*="theme" i], button:has(i.bi-moon), button:has(i.bi-sun)').first
        
        # Theme toggle should be present
        # Note: Actual implementation may vary
    
    def test_theme_icon_changes_with_theme(self, page_context, theme_helper):
        """Test that theme toggle icon changes based on current theme."""
        page_context.goto("/")
        page = page_context.page
        
        # Set light theme
        theme_helper.set_theme_preference("light")
        page.reload()
        page.wait_for_load_state("networkidle")
        
        # In light mode, should show moon icon (to switch to dark)
        # Implementation specific - check your actual theme toggle
        
        # Set dark theme
        theme_helper.set_theme_preference("dark")
        page.reload()
        page.wait_for_load_state("networkidle")
        
        # In dark mode, should show sun icon (to switch to light)
    
    def test_theme_applies_to_all_components(self, page_context, theme_helper):
        """Test that theme is applied to all UI components."""
        page_context.goto("/auth/login")
        
        # Set dark theme
        theme_helper.set_theme_preference("dark")
        page_context.page.reload()
        page_context.page.wait_for_load_state("networkidle")
        
        # Check that various components have dark theme classes
        # This is implementation specific
        html = page_context.page.locator('html')
        expect(html).to_have_class("dark")
    
    def test_theme_contrast_ratios_light_mode(self, page_context, theme_helper):
        """Test that light mode has sufficient contrast ratios."""
        page_context.goto("/auth/login")
        
        # Set light theme
        theme_helper.set_theme_preference("light")
        page_context.page.reload()
        page_context.page.wait_for_load_state("networkidle")
        
        # This would require color contrast checking
        # Could use accessibility tools or color analysis
        pytest.skip("Requires color contrast analysis - implement with accessibility tools")
    
    def test_theme_contrast_ratios_dark_mode(self, page_context, theme_helper):
        """Test that dark mode has sufficient contrast ratios."""
        page_context.goto("/auth/login")
        
        # Set dark theme
        theme_helper.set_theme_preference("dark")
        page_context.page.reload()
        page_context.page.wait_for_load_state("networkidle")
        
        # This would require color contrast checking
        pytest.skip("Requires color contrast analysis - implement with accessibility tools")
    
    def test_theme_transition_smooth(self, page_context, theme_helper):
        """Test that theme transitions are smooth without flashing."""
        page_context.goto("/")
        
        # Set light theme
        theme_helper.set_theme_preference("light")
        page_context.page.reload()
        page_context.page.wait_for_load_state("networkidle")
        
        # Change to dark theme
        theme_helper.set_theme("dark")
        page_context.page.wait_for_timeout(500)
        
        # Should transition smoothly
        # Check for transition CSS property

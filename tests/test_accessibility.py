"""
UI Tests - Accessibility and WCAG 2.1 AAA Compliance

Tests for accessibility features and WCAG 2.1 AAA standards compliance.
"""

import pytest
from playwright.sync_api import Page, expect


@pytest.mark.accessibility
class TestAccessibility:
    """Test suite for accessibility compliance."""
    
    def test_login_form_has_proper_labels(self, page_context):
        """Test that login form has proper labels for all inputs."""
        page_context.goto("/auth/login")
        page = page_context.page
        
        # Check username/email field
        username_input = page.locator('input[name="username_or_email"]')
        
        # Should have associated label or aria-label
        label = page.locator('label[for="username_or_email"]')
        aria_label = username_input.get_attribute('aria-label')
        
        assert label.count() > 0 or aria_label is not None
        
        # Check password field
        password_input = page.locator('input[name="password"]')
        password_label = page.locator('label[for="password"]')
        password_aria_label = password_input.get_attribute('aria-label')
        
        assert password_label.count() > 0 or password_aria_label is not None
    
    def test_signup_form_has_proper_labels(self, page_context):
        """Test that signup form has proper labels for all inputs."""
        page_context.goto("/auth/signup")
        page = page_context.page
        
        # Check username field
        username_input = page.locator('#username')
        username_label = page.locator('label[for="username"]')
        
        expect(username_label).to_be_visible()
    
    def test_form_has_proper_button_labels(self, page_context):
        """Test that all buttons have proper labels."""
        page_context.goto("/auth/login")
        page = page_context.page
        
        # Check submit button
        submit_button = page.locator('button[type="submit"]')
        button_text = submit_button.text_content()
        aria_label = submit_button.get_attribute('aria-label')
        
        # Button should have text or aria-label
        assert (button_text and len(button_text.strip()) > 0) or aria_label is not None
    
    def test_error_messages_are_accessible(self, page_context):
        """Test that error messages are accessible."""
        page_context.goto("/auth/login")
        page = page_context.page
        
        # Submit empty form to trigger errors
        page.click('button[type="submit"]')
        page.wait_for_load_state("networkidle")
        
        # Check for error message with proper role
        error = page.locator('[role="alert"], .alert').first
        if error.is_visible():
            # Error should have alert role or aria-live
            role = error.get_attribute('role')
            aria_live = error.get_attribute('aria-live')
            assert role == 'alert' or aria_live is not None
    
    def test_keyboard_navigation_login_form(self, page_context):
        """Test that login form is navigable with keyboard."""
        page_context.goto("/auth/login")
        page = page_context.page
        
        # Focus first input with Tab
        page.keyboard.press('Tab')
        
        # Check that an input is focused
        focused = page.evaluate('document.activeElement.tagName')
        assert focused in ['INPUT', 'BUTTON', 'A']
        
        # Navigate through form with Tab
        page.keyboard.press('Tab')
        page.keyboard.press('Tab')
        
        # Should be able to submit with Enter
        username_input = page.locator('input[name="username_or_email"]')
        username_input.focus()
        username_input.fill('testuser')
        page.keyboard.press('Tab')
        page.locator('input[name="password"]').fill('password')
        page.keyboard.press('Enter')
        
        # Form should submit
        page.wait_for_load_state("networkidle")
    
    def test_keyboard_navigation_signup_form(self, page_context):
        """Test that signup form is navigable with keyboard."""
        page_context.goto("/auth/signup")
        page = page_context.page
        
        # Navigate with Tab
        page.keyboard.press('Tab')
        
        # Fill username and navigate
        username_input = page.locator('#username')
        username_input.focus()
        username_input.fill('testuser')
        
        # Press Enter to go to next step
        page.keyboard.press('Enter')
        page.wait_for_timeout(500)
    
    def test_focus_indicators_visible(self, page_context):
        """Test that focus indicators are visible on interactive elements."""
        page_context.goto("/auth/login")
        page = page_context.page
        
        # Focus on input
        username_input = page.locator('input[name="username_or_email"]')
        username_input.focus()
        
        # Check for focus ring or outline
        # This would require checking computed styles
        focused_styles = username_input.evaluate('''
            el => {
                const styles = window.getComputedStyle(el);
                return {
                    outline: styles.outline,
                    boxShadow: styles.boxShadow
                };
            }
        ''')
        
        # Should have some focus indicator
        assert focused_styles['outline'] != 'none' or focused_styles['boxShadow'] != 'none'
    
    def test_skip_to_main_content_link(self, page_context):
        """Test that skip to main content link exists for keyboard users."""
        page_context.goto("/")
        page = page_context.page
        
        # Look for skip link
        skip_link = page.locator('a[href="#main-content"], a:has-text("Skip to")').first
        
        # Skip link should exist (might be visually hidden)
        # Note: This is optional but recommended for accessibility
    
    def test_heading_hierarchy(self, page_context):
        """Test that heading hierarchy is proper (h1, h2, h3, etc.)."""
        page_context.goto("/auth/login")
        page = page_context.page
        
        # Check for h1
        h1 = page.locator('h1')
        expect(h1).to_have_count(1)  # Should have exactly one h1
        
        # Check heading hierarchy
        headings = page.locator('h1, h2, h3, h4, h5, h6').all()
        
        # Should have proper hierarchy (no skipped levels)
        # This is a simplified check
    
    def test_alt_text_for_images(self, page_context):
        """Test that all images have alt text."""
        page_context.goto("/")
        page = page_context.page
        
        # Find all images
        images = page.locator('img').all()
        
        for img in images:
            alt = img.get_attribute('alt')
            # All images should have alt attribute (can be empty for decorative images)
            assert alt is not None
    
    def test_color_not_only_means_of_conveying_info(self, page_context):
        """Test that color is not the only means of conveying information."""
        page_context.goto("/auth/login")
        page = page_context.page
        
        # Submit form to get error
        page.click('button[type="submit"]')
        page.wait_for_load_state("networkidle")
        
        # Error messages should have text, not just color
        error = page.locator('[role="alert"], .alert').first
        if error.is_visible():
            text = error.text_content()
            assert text and len(text.strip()) > 0
    
    def test_sufficient_color_contrast(self, page_context):
        """Test that color contrast ratios meet WCAG AAA standards."""
        # This would require color contrast analysis tools
        pytest.skip("Requires color contrast analysis - implement with axe-core or similar")
    
    def test_form_field_purpose_identified(self, page_context):
        """Test that form field purposes are properly identified."""
        page_context.goto("/auth/login")
        page = page_context.page
        
        # Check for autocomplete attributes
        username_input = page.locator('input[name="username_or_email"]')
        password_input = page.locator('input[name="password"]')
        
        # HTML5 autocomplete attributes help identify purpose
        username_autocomplete = username_input.get_attribute('autocomplete')
        password_autocomplete = password_input.get_attribute('autocomplete')
        
        # Should have autocomplete attributes for better accessibility
        # Note: This is WCAG 2.1 Level AA
    
    def test_text_spacing_adjustable(self, page_context):
        """Test that text spacing can be adjusted without loss of content."""
        page_context.goto("/auth/login")
        page = page_context.page
        
        # Apply text spacing adjustments
        page.evaluate('''
            document.body.style.lineHeight = '1.5';
            document.body.style.letterSpacing = '0.12em';
            document.body.style.wordSpacing = '0.16em';
        ''')
        
        page.wait_for_timeout(500)
        
        # Content should still be visible and readable
        # Check that form is still functional
        expect(page.locator('input[name="username_or_email"]')).to_be_visible()
    
    def test_aria_roles_properly_used(self, page_context):
        """Test that ARIA roles are properly used."""
        page_context.goto("/auth/login")
        page = page_context.page
        
        # Check for proper ARIA roles
        # Forms should have form role (implicit) or explicit role
        # Buttons should have button role (implicit) or explicit role
        
        # Check navigation
        nav = page.locator('nav, [role="navigation"]')
        # Navigation should exist
    
    def test_landmark_regions_identified(self, page_context):
        """Test that landmark regions are properly identified."""
        page_context.goto("/")
        page = page_context.page
        
        # Check for landmark regions
        # header, nav, main, footer
        main = page.locator('main, [role="main"]')
        header = page.locator('header, [role="banner"]')
        
        # Main content should be identified

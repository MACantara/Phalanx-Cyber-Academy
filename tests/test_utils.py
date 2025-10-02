"""
Utility functions and helpers for tests.

This module provides common utilities used across multiple test files.
"""

import time
import string
import random


def generate_unique_username(prefix="testuser"):
    """Generate a unique username for testing."""
    timestamp = int(time.time())
    random_suffix = ''.join(random.choices(string.ascii_lowercase + string.digits, k=4))
    return f"{prefix}_{timestamp}_{random_suffix}"


def generate_unique_email(prefix="testuser"):
    """Generate a unique email for testing."""
    timestamp = int(time.time())
    random_suffix = ''.join(random.choices(string.ascii_lowercase + string.digits, k=4))
    return f"{prefix}_{timestamp}_{random_suffix}@example.com"


def generate_strong_password():
    """Generate a strong password that meets all requirements."""
    # Password with uppercase, lowercase, numbers, and special characters
    password = "StrongP@ssw0rd"
    timestamp = str(int(time.time()))[-4:]
    return f"{password}{timestamp}!"


def wait_for_element(page, selector, timeout=5000):
    """Wait for an element to be visible."""
    try:
        page.wait_for_selector(selector, timeout=timeout, state="visible")
        return True
    except Exception:
        return False


def get_element_text(page, selector):
    """Get text content of an element."""
    element = page.locator(selector).first
    if element.is_visible():
        return element.text_content()
    return None


def is_element_visible(page, selector):
    """Check if an element is visible."""
    element = page.locator(selector).first
    return element.is_visible() if element.count() > 0 else False


def fill_form_fields(page, fields_dict):
    """
    Fill multiple form fields.
    
    Args:
        page: Playwright page object
        fields_dict: Dictionary of {selector: value}
    """
    for selector, value in fields_dict.items():
        page.fill(selector, value)


def click_and_wait(page, selector, wait_for='networkidle'):
    """Click element and wait for navigation or load."""
    page.click(selector)
    page.wait_for_load_state(wait_for)


def take_test_screenshot(page, name):
    """Take a screenshot for test debugging."""
    import os
    screenshot_dir = "tests/screenshots"
    os.makedirs(screenshot_dir, exist_ok=True)
    timestamp = int(time.time())
    filename = f"{screenshot_dir}/{name}_{timestamp}.png"
    page.screenshot(path=filename)
    return filename


def get_computed_style(page, selector, property_name):
    """Get computed CSS style property of an element."""
    return page.locator(selector).first.evaluate(
        f'el => window.getComputedStyle(el).{property_name}'
    )


def check_contrast_ratio(page, selector):
    """
    Check color contrast ratio of an element.
    Returns the contrast ratio between foreground and background.
    """
    # This is a simplified version - full implementation would require color parsing
    result = page.locator(selector).first.evaluate('''
        el => {
            const styles = window.getComputedStyle(el);
            return {
                color: styles.color,
                backgroundColor: styles.backgroundColor
            };
        }
    ''')
    return result


def clear_local_storage(page):
    """Clear browser localStorage."""
    page.evaluate('localStorage.clear()')


def clear_session_storage(page):
    """Clear browser sessionStorage."""
    page.evaluate('sessionStorage.clear()')


def clear_all_storage(page):
    """Clear all browser storage."""
    clear_local_storage(page)
    clear_session_storage(page)


def get_cookie(page, name):
    """Get a specific cookie by name."""
    cookies = page.context.cookies()
    for cookie in cookies:
        if cookie['name'] == name:
            return cookie
    return None


def delete_all_cookies(page):
    """Delete all cookies."""
    page.context.clear_cookies()


def simulate_mobile_viewport(page):
    """Set viewport to mobile dimensions."""
    page.set_viewport_size({"width": 375, "height": 667})


def simulate_tablet_viewport(page):
    """Set viewport to tablet dimensions."""
    page.set_viewport_size({"width": 768, "height": 1024})


def simulate_desktop_viewport(page):
    """Set viewport to desktop dimensions."""
    page.set_viewport_size({"width": 1920, "height": 1080})


def check_responsive_element(page, selector):
    """
    Check if an element is responsive across different viewports.
    Returns dict with visibility status for each viewport.
    """
    results = {}
    
    # Check mobile
    simulate_mobile_viewport(page)
    page.wait_for_timeout(500)
    results['mobile'] = is_element_visible(page, selector)
    
    # Check tablet
    simulate_tablet_viewport(page)
    page.wait_for_timeout(500)
    results['tablet'] = is_element_visible(page, selector)
    
    # Check desktop
    simulate_desktop_viewport(page)
    page.wait_for_timeout(500)
    results['desktop'] = is_element_visible(page, selector)
    
    return results


def check_element_focusable(page, selector):
    """Check if an element is focusable."""
    element = page.locator(selector).first
    element.focus()
    focused_selector = page.evaluate('document.activeElement.outerHTML')
    element_html = element.evaluate('el => el.outerHTML')
    return focused_selector == element_html


def get_aria_attributes(page, selector):
    """Get all aria-* attributes of an element."""
    return page.locator(selector).first.evaluate('''
        el => {
            const attrs = {};
            for (let attr of el.attributes) {
                if (attr.name.startsWith('aria-')) {
                    attrs[attr.name] = attr.value;
                }
            }
            return attrs;
        }
    ''')


def check_wcag_aa_contrast(foreground_rgb, background_rgb):
    """
    Calculate WCAG contrast ratio.
    Returns True if meets WCAG AA standards (4.5:1 for normal text).
    
    This is a simplified version - full implementation would parse RGB values
    and calculate relative luminance.
    """
    # Placeholder - implement full contrast calculation
    # Based on WCAG formula: https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html
    pass


def check_wcag_aaa_contrast(foreground_rgb, background_rgb):
    """
    Calculate WCAG contrast ratio for AAA level.
    Returns True if meets WCAG AAA standards (7:1 for normal text).
    """
    # Placeholder - implement full contrast calculation
    pass

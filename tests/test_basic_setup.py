"""
Basic sanity tests that don't require browser
"""
import pytest


@pytest.mark.unit
class TestBasicSetup:
    """Basic tests to verify test infrastructure"""
    
    def test_pytest_works(self):
        """Verify pytest is working"""
        assert True
    
    def test_imports(self):
        """Verify required imports work"""
        from playwright.sync_api import sync_playwright, Page, expect
        assert sync_playwright is not None
        assert Page is not None
        assert expect is not None
    
    def test_utils_import(self):
        """Verify test utilities can be imported"""
        from tests.playwright_utils import BasePage, NavigationHelper, FormHelper, AuthHelper, AssertionHelper
        assert BasePage is not None
        assert NavigationHelper is not None
        assert FormHelper is not None
        assert AuthHelper is not None
        assert AssertionHelper is not None

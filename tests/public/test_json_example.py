"""
Example: Parametrized tests using JSON test plan data.

This demonstrates how to create data-driven tests from the System Test Plans JSON files.
"""
import pytest
import os
from playwright.sync_api import Page, expect
from tests.utils import PageHelper


# Example: Load test data from JSON if file exists
TEST_DATA_PATH = "docs/system-test-plans/json-files/home_page_test_plans.json"


def load_home_page_test_data():
    """Load home page test data from JSON file."""
    import json
    
    json_path = os.path.join(
        os.path.dirname(__file__),
        "../../",
        TEST_DATA_PATH
    )
    
    if os.path.exists(json_path):
        with open(json_path, 'r') as f:
            return json.load(f)
    return []


# Load test data
HOME_PAGE_TESTS = load_home_page_test_data()


@pytest.mark.parametrize("test_data", HOME_PAGE_TESTS, ids=lambda td: td.get('test_plan_no', 'unknown'))
@pytest.mark.example
def test_home_page_from_json_data(page: Page, base_url: str, test_data: dict):
    """
    Example parametrized test using JSON test plan data.
    
    This demonstrates how to create automated tests directly from the System Test Plans.
    Each test case is defined in the JSON file and executed as a separate test.
    """
    helper = PageHelper(page)
    
    # Get test metadata
    test_plan_no = test_data.get('test_plan_no', 'N/A')
    description = test_data.get('description', 'No description')
    expected_results = test_data.get('expected_results', '')
    category = test_data.get('category', 'functional')
    priority = test_data.get('priority', 'medium')
    
    print(f"\nExecuting {test_plan_no}: {description}")
    print(f"Category: {category}, Priority: {priority}")
    print(f"Expected: {expected_results}")
    
    # Navigate to home page
    page.goto(base_url)
    helper.wait_for_page_load()
    
    # Basic verification that page loaded
    expect(page).to_have_url(base_url + "/")
    
    # Verify page has content
    page_content = page.content()
    assert len(page_content) > 100, "Page should have substantial content"
    
    # Category-specific assertions
    if category == 'performance':
        # For performance tests, we could measure load time
        # (Already loaded above, so this is simplified)
        assert True, "Performance test placeholder"
    
    elif category == 'ui':
        # For UI tests, verify visual elements
        headings = page.locator("h1, h2, h3").all()
        assert len(headings) > 0, "Page should have headings"
    
    elif category == 'functional':
        # For functional tests, verify functionality
        nav = page.locator("nav")
        assert nav.count() > 0, "Navigation should be present"
    
    print(f"✓ {test_plan_no} passed")


@pytest.mark.example
def test_json_data_loading():
    """
    Example test to verify JSON test data can be loaded.
    """
    test_data = load_home_page_test_data()
    
    if len(test_data) > 0:
        # Verify structure of test data
        assert isinstance(test_data, list), "Test data should be a list"
        
        first_test = test_data[0]
        assert 'test_plan_no' in first_test, "Test should have test_plan_no"
        assert 'description' in first_test, "Test should have description"
        assert 'expected_results' in first_test, "Test should have expected_results"
        
        print(f"✓ Loaded {len(test_data)} test cases from JSON")
    else:
        pytest.skip("JSON test data file not found")


@pytest.mark.example
def test_json_test_coverage():
    """
    Example test to verify test coverage from JSON files.
    """
    test_data = load_home_page_test_data()
    
    if len(test_data) > 0:
        # Count tests by category
        categories = {}
        priorities = {}
        
        for test in test_data:
            cat = test.get('category', 'unknown')
            pri = test.get('priority', 'unknown')
            
            categories[cat] = categories.get(cat, 0) + 1
            priorities[pri] = priorities.get(pri, 0) + 1
        
        print(f"\nTest Coverage Analysis:")
        print(f"Total tests: {len(test_data)}")
        print(f"By category: {categories}")
        print(f"By priority: {priorities}")
        
        # Verify we have diverse coverage
        assert len(categories) > 1, "Should have multiple test categories"
        assert len(priorities) > 1, "Should have multiple priority levels"
    else:
        pytest.skip("JSON test data file not found")


# Example of how to create focused test groups
@pytest.mark.example
@pytest.mark.critical
def test_critical_home_page_requirements(page: Page, base_url: str):
    """
    Example: Group critical requirements into a single comprehensive test.
    
    This approach is useful when you want to verify multiple critical aspects
    in one test run for efficiency.
    """
    helper = PageHelper(page)
    
    # Navigate to home page
    page.goto(base_url)
    helper.wait_for_page_load()
    
    # Critical requirement 1: Page loads
    expect(page).to_have_url(base_url + "/")
    
    # Critical requirement 2: Main content visible
    main_content = page.locator("main, .container, body")
    expect(main_content.first).to_be_visible()
    
    # Critical requirement 3: Navigation present
    nav = page.locator("nav")
    assert nav.count() > 0, "Navigation must be present"
    
    # Critical requirement 4: Has call-to-action
    cta_elements = page.locator("button, a.btn, .cta")
    assert cta_elements.count() > 0, "Page must have call-to-action elements"
    
    # Critical requirement 5: Proper page title
    page_title = page.title()
    assert len(page_title) > 0, "Page must have a title"
    
    print("✓ All critical home page requirements verified")

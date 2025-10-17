# Automated Testing with Playwright

This directory contains automated tests for Phalanx Cyber Academy using the Playwright Python library.

## Overview

The test suite implements automated testing for all 37 modules/pages of the system based on the System Test Plans (STP) documented in `docs/system-test-plans/`.

### Test Coverage

- **Public Pages** (8 modules): Home, About, Contact, Privacy Policy, Terms of Service, Cookie Policy, Login, Sign Up
- **Authentication** (3 modules): Email Verification, Login, Sign Up
- **User Profile** (3 modules): Profile View, Edit Profile, User Dashboard
- **Admin Panel** (18 modules): Dashboard, Analytics, User Management, System Logs, Backup, Test Management
- **Learning Levels** (5 modules): Levels 1-5 (Misinformation Maze, Shadow Inbox, Malware Mayhem, White Hat Test, Hunt for The Null)

## Installation

### 1. Install Python Dependencies

```bash
pip install -r requirements.txt
```

### 2. Install Playwright Browsers

```bash
playwright install
```

Or install specific browser:

```bash
playwright install chromium  # Recommended for testing
```

## Running Tests

### Basic Usage

```bash
# Run all tests
pytest

# Run with verbose output
pytest -v

# Run specific test file
pytest tests/public/test_home_page.py

# Run specific test function
pytest tests/public/test_home_page.py::test_home_page_loads_correctly
```

### Using the Test Runner Script

```bash
# Run all tests
python run_tests.py

# Run smoke tests (quick validation)
python run_tests.py --smoke

# Run tests for specific module
python run_tests.py --public    # Public pages
python run_tests.py --auth      # Authentication
python run_tests.py --admin     # Admin panel
python run_tests.py --levels    # Learning levels

# Run tests with specific marker
python run_tests.py -m functional
python run_tests.py -m security
python run_tests.py -m critical

# Run tests matching keyword
python run_tests.py -k "login"
python run_tests.py -k "home_page"

# Verbose output and stop on first failure
python run_tests.py -v -x

# Run with coverage report
python run_tests.py --cov
```

### Test Markers

Tests are categorized using pytest markers:

**Priority Markers:**
- `critical` - Critical priority tests
- `high` - High priority tests
- `medium` - Medium priority tests
- `low` - Low priority tests

**Category Markers:**
- `functional` - Functional tests
- `ui` - UI/visual tests
- `security` - Security tests
- `integration` - Integration tests
- `performance` - Performance tests
- `smoke` - Quick smoke tests

**Example:**

```bash
# Run only critical tests
pytest -m critical

# Run functional and UI tests
pytest -m "functional or ui"

# Run high priority security tests
pytest -m "high and security"
```

## Configuration

### Environment Variables

Create a `.env` file (or use `.env.template`) with test configuration:

```bash
# Test Configuration
TEST_BASE_URL=http://localhost:5000
TEST_USER_EMAIL=test@example.com
TEST_USER_USERNAME=testuser
TEST_ADMIN_EMAIL=admin@example.com
TEST_ADMIN_USERNAME=admin
```

### Pytest Configuration

Test configuration is in `pytest.ini`. Key settings:

- Test discovery patterns
- Markers
- Output options
- Timeout settings

## Test Structure

```
tests/
├── conftest.py              # Pytest configuration and fixtures
├── utils/                   # Test utilities and helpers
│   ├── __init__.py
│   └── test_helpers.py      # Helper classes (PageHelper, FormHelper, etc.)
├── public/                  # Public pages tests
│   ├── test_home_page.py
│   ├── test_about_page.py
│   └── test_contact_page.py
├── auth/                    # Authentication tests
│   ├── test_login_page.py
│   └── test_signup_page.py
├── profile/                 # User profile tests
│   └── test_user_profile.py
├── admin/                   # Admin panel tests
│   ├── test_admin_dashboard.py
│   └── test_user_management.py
└── levels/                  # Learning levels tests
    ├── test_level_1.py
    └── test_levels_overview.py
```

## Writing Tests

### Basic Test Example

```python
import pytest
from playwright.sync_api import Page, expect
from tests.utils import PageHelper

@pytest.mark.functional
@pytest.mark.high
def test_example(page: Page, base_url: str):
    """Test description."""
    helper = PageHelper(page)
    
    # Navigate to page
    page.goto(f"{base_url}/example")
    helper.wait_for_page_load()
    
    # Verify page loaded
    expect(page).to_have_url(f"{base_url}/example")
    
    # Test assertions
    assert helper.check_element_visible("h1")
```

### Available Fixtures

- `page` - Standard browser page
- `mobile_page` - Mobile viewport page (375x667)
- `authenticated_page` - Page with user authenticated
- `admin_page` - Page with admin authenticated
- `base_url` - Base URL for testing
- `test_data` - Common test data

### Helper Classes

- `PageHelper` - Common page operations
- `FormHelper` - Form interactions
- `NavigationHelper` - Navigation utilities
- `AccessibilityChecker` - Accessibility validation
- `PerformanceChecker` - Performance measurements

## Best Practices

1. **Use Descriptive Test Names**: Test names should clearly indicate what is being tested
2. **Add Markers**: Tag tests with appropriate markers for easy filtering
3. **Use Fixtures**: Leverage pytest fixtures for setup/teardown
4. **Wait for Elements**: Always wait for elements before interacting
5. **Add Comments**: Include STP reference numbers in test docstrings
6. **Handle Failures Gracefully**: Use try-except where appropriate
7. **Keep Tests Independent**: Each test should be able to run standalone

## Continuous Integration

### GitHub Actions Example

```yaml
name: Automated Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Set up Python
      uses: actions/setup-python@v2
      with:
        python-version: '3.12'
    
    - name: Install dependencies
      run: |
        pip install -r requirements.txt
        playwright install chromium
    
    - name: Run tests
      run: pytest -v -m smoke
    
    - name: Upload test results
      if: always()
      uses: actions/upload-artifact@v2
      with:
        name: test-results
        path: test-results/
```

## Troubleshooting

### Common Issues

**Issue: Browser not installed**
```bash
playwright install chromium
```

**Issue: Tests timing out**
- Increase timeout in `conftest.py`
- Check application is running on correct port
- Verify `TEST_BASE_URL` environment variable

**Issue: Authentication tests failing**
- Implement authentication fixtures in `conftest.py`
- Ensure test user credentials are configured
- Check email verification system is working

**Issue: Slow test execution**
```bash
# Run tests in parallel
pytest -n 4
```

## Screenshots and Artifacts

Test screenshots and artifacts are saved in:
- `tests/screenshots/` - Test screenshots
- `test-results/` - Test execution results
- `htmlcov/` - Coverage reports (when using --cov)

## Resources

- [Playwright Python Documentation](https://playwright.dev/python/)
- [Pytest Documentation](https://docs.pytest.org/)
- [System Test Plans](../docs/system-test-plans/)

## Contributing

When adding new tests:

1. Follow the existing test structure
2. Use appropriate markers
3. Reference STP numbers in docstrings
4. Update this README if adding new test categories
5. Ensure tests are independent and repeatable

## Support

For issues or questions about testing:
- Check existing test examples
- Review Playwright documentation
- Open an issue on GitHub

# Automated Testing with Playwright

This directory contains automated end-to-end (E2E) tests for the Phalanx Cyber Academy using Playwright Python library.

## Overview

The test suite covers all 37 modules/pages of the system as defined in the System Test Plans (STP-001 through STP-037):

### Test Categories

- **Public Pages** (STP-001 to STP-008): Home, About, Contact, Privacy, Terms, Cookies, Login, Sign Up
- **User Management & Profile** (STP-009 to STP-012): Email verification, Profile, Edit Profile, Dashboard
- **Admin Panel** (STP-013 to STP-030): Admin dashboard, Analytics, User management, Logs, Backups, System tests
- **Learning Levels** (STP-031 to STP-036): Level overview and all 5 cybersecurity levels
- **Game Modes** (STP-037): Blue Team vs Red Team mode

## Installation

### 1. Install Python Dependencies

```bash
pip install -r requirements.txt
```

### 2. Install Playwright Browsers

After installing the Python packages, you need to install the Playwright browsers:

```bash
playwright install
```

Or install specific browsers:

```bash
playwright install chromium
playwright install firefox
playwright install webkit
```

For CI/CD environments, you may also need system dependencies:

```bash
playwright install-deps
```

## Running Tests

### Run All Tests

```bash
pytest tests/
```

### Run Specific Test Categories

```bash
# Run only public page tests
pytest tests/ -m public

# Run only admin tests
pytest tests/ -m admin

# Run only level tests
pytest tests/ -m levels

# Run only user management tests
pytest tests/ -m user

# Run only game mode tests
pytest tests/ -m gamemode

# Run smoke tests
pytest tests/ -m smoke
```

### Run Specific Test Files

```bash
# Run public pages tests
pytest tests/test_e2e_public_pages.py

# Run user management tests
pytest tests/test_e2e_user_management.py

# Run admin panel tests
pytest tests/test_e2e_admin_panel.py

# Run level tests
pytest tests/test_e2e_levels.py

# Run game mode tests
pytest tests/test_e2e_game_modes.py
```

### Run With Verbose Output

```bash
pytest tests/ -v
pytest tests/ -vv  # Extra verbose
```

### Run Tests in Headed Mode (See Browser)

By default, tests run in headless mode. To see the browser:

Edit `tests/conftest.py` and change:

```python
'headless': False  # Change from True to False
```

Or use the Playwright debug mode:

```bash
PWDEBUG=1 pytest tests/test_e2e_public_pages.py
```

### Run Specific Test

```bash
pytest tests/test_e2e_public_pages.py::TestPublicPages::test_stp_001_home_page
```

## Test Structure

### Test Files

- `test_e2e_public_pages.py` - Tests for public-facing pages (STP-001 to STP-008)
- `test_e2e_user_management.py` - Tests for user management and profiles (STP-009 to STP-012)
- `test_e2e_admin_panel.py` - Tests for admin panel features (STP-013 to STP-030)
- `test_e2e_levels.py` - Tests for learning levels (STP-031 to STP-036)
- `test_e2e_game_modes.py` - Tests for game modes (STP-037)

### Utility Files

- `conftest.py` - Pytest configuration and fixtures for Playwright
- `playwright_utils.py` - Utility classes and helper functions for tests
- `test_auth_persistence.py` - Unit tests for authentication persistence

## Test Configuration

### pytest.ini

The `pytest.ini` file contains test configuration including:

- Test discovery patterns
- Test markers for categorization
- Logging configuration
- Default command-line options

### Browser Configuration

Browser configuration is in `tests/conftest.py`:

- **Headless mode**: Set to `True` by default for CI/CD
- **Viewport**: 1920x1080
- **Timeout**: 30 seconds default
- **Screenshots**: Automatically captured on test failure

## Writing New Tests

### Basic Test Structure

```python
import pytest
from playwright.sync_api import Page, expect

@pytest.mark.e2e
@pytest.mark.public  # Use appropriate marker
class TestMyFeature:
    
    def test_feature_name(self, page: Page, base_url: str):
        """Test description"""
        # Navigate to page
        page.goto(f"{base_url}/my-page")
        
        # Perform actions
        page.get_by_role('button', name='Click Me').click()
        
        # Make assertions
        expect(page).to_have_url(f"{base_url}/result")
        expect(page.locator('h1')).to_contain_text('Success')
```

### Using Helper Classes

```python
from tests.playwright_utils import BasePage, AssertionHelper

def test_with_helpers(page: Page, base_url: str):
    # Use BasePage for common operations
    base_page = BasePage(page, base_url)
    base_page.navigate_to('/about')
    base_page.expect_visible('h1')
    
    # Use AssertionHelper for common assertions
    AssertionHelper.assert_page_title(page, 'About')
    AssertionHelper.assert_heading(page, 'About Us')
```

## Continuous Integration

### GitHub Actions Example

Create `.github/workflows/playwright-tests.yml`:

```yaml
name: Playwright Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.11'
    
    - name: Install dependencies
      run: |
        python -m pip install --upgrade pip
        pip install -r requirements.txt
    
    - name: Install Playwright browsers
      run: playwright install --with-deps chromium
    
    - name: Run tests
      run: pytest tests/ -m "e2e and smoke"
      env:
        SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
        SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
    
    - name: Upload test results
      if: always()
      uses: actions/upload-artifact@v3
      with:
        name: playwright-report
        path: test-results/
```

## Debugging Tests

### View Screenshots on Failure

Screenshots are automatically saved to `test-results/screenshots/` when tests fail.

### Record Videos

Enable video recording in `tests/conftest.py`:

```python
'record_video_dir': 'test-results/videos/'
```

### Playwright Inspector

Use the Playwright Inspector for debugging:

```bash
PWDEBUG=1 pytest tests/test_e2e_public_pages.py::TestPublicPages::test_stp_001_home_page
```

### Trace Viewer

Enable traces in `tests/conftest.py` and view them:

```bash
playwright show-trace trace.zip
```

## Best Practices

1. **Use Specific Selectors**: Prefer `get_by_role()`, `get_by_label()`, `get_by_text()` over CSS selectors
2. **Wait for Elements**: Use Playwright's auto-waiting; add explicit waits only when needed
3. **Independent Tests**: Each test should be independent and not rely on other tests
4. **Clean Test Data**: Use fixtures to set up and tear down test data
5. **Descriptive Names**: Use clear, descriptive test names that explain what is being tested
6. **Page Objects**: Use the Page Object pattern for complex page interactions
7. **Markers**: Tag tests with appropriate markers for easy filtering

## Troubleshooting

### Tests Fail Due to Timeouts

- Increase timeout in `tests/conftest.py`
- Check if the Flask server is starting correctly
- Verify database connections

### Browser Not Found

Run:

```bash
playwright install
```

### Port Already in Use

Change the port in `tests/conftest.py` if port 5000 is already in use.

### Database Issues

Ensure environment variables are set correctly:

```bash
export SUPABASE_URL=your_supabase_url
export SUPABASE_SERVICE_ROLE_KEY=your_key
```

## Resources

- [Playwright Python Documentation](https://playwright.dev/python/)
- [Pytest Documentation](https://docs.pytest.org/)
- [Playwright Best Practices](https://playwright.dev/python/docs/best-practices)
- [System Test Plans Documentation](../docs/SYSTEM_TESTS.md)

## Contributing

When adding new tests:

1. Follow the existing test structure and naming conventions
2. Add appropriate markers (`@pytest.mark.e2e`, `@pytest.mark.public`, etc.)
3. Include docstrings with test descriptions
4. Update this README if adding new test categories
5. Ensure tests pass locally before committing

## Support

For issues or questions:

- Check the troubleshooting section above
- Review Playwright documentation
- Open an issue on GitHub
- Contact the development team

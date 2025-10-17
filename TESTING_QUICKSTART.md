# Playwright Automated Testing - Quick Start Guide

This guide will help you get started with running automated tests for Phalanx Cyber Academy.

## Prerequisites

1. Python 3.8 or higher installed
2. Application running locally (default: http://localhost:5000)
3. All dependencies installed from requirements.txt

## Installation Steps

### Step 1: Install Dependencies

```bash
# Install Python dependencies including Playwright
pip install -r requirements.txt
```

### Step 2: Install Playwright Browsers

```bash
# Install Chromium browser for testing
playwright install chromium

# Or install all browsers (optional)
playwright install
```

### Step 3: Configure Test Environment

Create or update `.env` file with test configuration:

```bash
# Copy from template
cp .env.template .env

# Add test-specific variables
echo "TEST_BASE_URL=http://localhost:5000" >> .env
echo "TEST_USER_EMAIL=test@example.com" >> .env
echo "TEST_ADMIN_EMAIL=admin@example.com" >> .env
```

## Running Your First Tests

### Quick Smoke Test

Run quick smoke tests to verify basic functionality:

```bash
# Using pytest directly
pytest -m smoke -v

# Using test runner script
python run_tests.py --smoke
```

Expected output:
```
tests/public/test_home_page.py::test_home_page_loads_correctly PASSED
tests/auth/test_login_page.py::test_login_page_loads_correctly PASSED
...
```

### Run All Public Pages Tests

```bash
python run_tests.py --public
```

### Run Specific Test File

```bash
pytest tests/public/test_home_page.py -v
```

### Run Single Test

```bash
pytest tests/public/test_home_page.py::test_home_page_loads_correctly -v
```

## Understanding Test Results

### Successful Test Output

```
tests/public/test_home_page.py::test_home_page_loads_correctly PASSED [100%]

========================= 1 passed in 2.34s =========================
```

### Failed Test Output

```
tests/public/test_home_page.py::test_home_page_loads_correctly FAILED [100%]

========================= FAILURES =========================
_________________________ test_home_page_loads_correctly _________________________

E   AssertionError: Navigation should be present
...
========================= 1 failed in 2.34s =========================
```

## Common Test Categories

### 1. Functional Tests

Test core functionality:
```bash
pytest -m functional -v
```

### 2. Security Tests

Test security measures:
```bash
pytest -m security -v
```

### 3. UI Tests

Test user interface:
```bash
pytest -m ui -v
```

### 4. Performance Tests

Test page load times:
```bash
pytest -m performance -v
```

## Test Priority Levels

### Critical Tests Only

```bash
pytest -m critical -v
```

### High Priority Tests

```bash
pytest -m high -v
```

## Advanced Usage

### Stop on First Failure

```bash
pytest -x
```

### Verbose Output

```bash
pytest -vv
```

### Run Tests in Parallel

```bash
pytest -n 4  # Run with 4 workers
```

### Generate Coverage Report

```bash
pytest --cov=app --cov-report=html
# Open htmlcov/index.html in browser
```

## Troubleshooting

### Issue: "Playwright not found"

**Solution:**
```bash
playwright install chromium
```

### Issue: "Connection refused"

**Solution:** Ensure application is running:
```bash
python run.py
# In another terminal, run tests
pytest
```

### Issue: Tests timeout

**Solution:** Increase timeout in conftest.py or check if app is slow to respond

### Issue: Browser doesn't close

**Solution:** Playwright will handle this automatically. If needed:
```bash
pkill -f playwright
```

## Best Practices for Running Tests

1. **Start Fresh**: Clear browser cache and restart app before major test runs
2. **Check Application**: Ensure application is running and accessible
3. **Review Failures**: Look at test output carefully to understand failures
4. **Run Incrementally**: Test one module at a time when debugging
5. **Use Markers**: Leverage test markers to run relevant test subsets

## Next Steps

1. Review `tests/README.md` for comprehensive documentation
2. Examine existing test files in `tests/` directory
3. Run full test suite: `pytest -v`
4. Check test coverage: `pytest --cov=app`
5. Write additional tests following the established patterns

## Getting Help

- Check `tests/README.md` for detailed documentation
- Review Playwright docs: https://playwright.dev/python/
- Examine example tests in `tests/` directory
- Run with `-v` flag for more detailed output

## Example Test Workflow

```bash
# 1. Start application
python run.py

# 2. In another terminal, run smoke tests
python run_tests.py --smoke

# 3. Run full public pages suite
python run_tests.py --public

# 4. Run authentication tests
python run_tests.py --auth

# 5. Run all tests with coverage
pytest --cov=app --cov-report=html -v

# 6. View coverage report
open htmlcov/index.html  # macOS
xdg-open htmlcov/index.html  # Linux
start htmlcov/index.html  # Windows
```

## Continuous Testing During Development

Use pytest-watch for automatic test runs on file changes:

```bash
# Install pytest-watch
pip install pytest-watch

# Watch and run tests automatically
ptw tests/public/ -v
```

---

**Happy Testing! 🚀**

For more information, see `tests/README.md`

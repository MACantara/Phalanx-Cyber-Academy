# Playwright Testing - Quick Start Guide

## Prerequisites

- Python 3.11 or higher
- pip (Python package installer)
- Git

## Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/MACantara/Phalanx-Cyber-Academy.git
cd Phalanx-Cyber-Academy
```

### 2. Create and Activate Virtual Environment

**On Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

**On macOS/Linux:**
```bash
python -m venv venv
source venv/bin/activate
```

### 3. Install Python Dependencies

```bash
pip install -r requirements.txt
```

This will install all required packages including:
- Flask and related packages
- pytest and pytest-flask
- playwright and pytest-playwright
- All other application dependencies

### 4. Install Playwright Browsers

After installing the Python packages, install the Playwright browsers:

```bash
playwright install chromium
```

If you're on a CI/CD system or need all browser dependencies:

```bash
playwright install-deps
playwright install chromium
```

**Note:** If you encounter download issues, try:
```bash
# Alternative approach
python -m playwright install chromium

# Or install all browsers
python -m playwright install
```

### 5. Set Up Environment Variables

Copy the `.env.template` file to `.env`:

```bash
# On Windows
copy .env.template .env

# On macOS/Linux
cp .env.template .env
```

Edit `.env` and add your configuration:

```bash
FLASK_ENV=testing
SUPABASE_URL=your_supabase_url_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**For testing without database:**
The tests will use mock values if Supabase credentials are not provided.

## Running Tests

### Basic Test Run

Run all basic setup tests:
```bash
pytest tests/test_basic_setup.py -v
```

### Run Unit Tests Only (No Browser Required)

```bash
pytest tests/ -m unit -v
```

### Run E2E Tests (Requires Browser)

Make sure Playwright browsers are installed first!

```bash
# Run all E2E tests
pytest tests/ -m e2e -v

# Run specific category
pytest tests/ -m public -v    # Public pages
pytest tests/ -m admin -v     # Admin panel
pytest tests/ -m levels -v    # Learning levels
pytest tests/ -m user -v      # User management
```

### Run Smoke Tests

```bash
pytest tests/ -m smoke -v
```

### Run Specific Test File

```bash
pytest tests/test_e2e_public_pages.py -v
```

### Run in Headed Mode (See Browser)

To watch the tests run in a visible browser window:

1. Edit `tests/conftest.py`
2. Change `'headless': True` to `'headless': False`
3. Run tests normally

Or use Playwright debug mode:
```bash
PWDEBUG=1 pytest tests/test_e2e_public_pages.py::TestPublicPages::test_stp_001_home_page -v
```

## Verification

To verify your installation:

```bash
# 1. Check Python version
python --version  # Should be 3.11+

# 2. Check pytest installation
pytest --version

# 3. Check Playwright installation
playwright --version

# 4. Run basic tests
pytest tests/test_basic_setup.py -v

# 5. Check if browsers are installed
playwright --version  # Shows installed browsers
```

## Troubleshooting

### Issue: "ModuleNotFoundError: No module named 'flask'"

**Solution:** Install dependencies
```bash
pip install -r requirements.txt
```

### Issue: "playwright: command not found"

**Solution:** Install playwright
```bash
pip install playwright
playwright install
```

### Issue: Browser download fails

**Solution:** Try alternative installation
```bash
# Clear cache
rm -rf ~/.cache/ms-playwright/

# Reinstall
python -m playwright install chromium

# Or use system browser
playwright install chromium --with-deps
```

### Issue: "Address already in use" (Port 5000)

**Solution:** Either:
1. Kill process using port 5000:
   ```bash
   # On Linux/Mac
   lsof -ti:5000 | xargs kill -9
   
   # On Windows
   netstat -ano | findstr :5000
   taskkill /PID <PID> /F
   ```
2. Or change port in `tests/conftest.py`

### Issue: Tests timeout

**Solution:**
1. Increase timeout in `tests/conftest.py`
2. Ensure Flask server starts successfully
3. Check internet connection for external resources

### Issue: Database connection errors

**Solution:**
Tests will use mock database if Supabase is not configured. To use real database:
```bash
export SUPABASE_URL=your_url
export SUPABASE_SERVICE_ROLE_KEY=your_key
```

## Next Steps

1. **Read Full Documentation:** See `tests/README.md` for detailed testing guide
2. **Write Tests:** Follow examples in existing test files
3. **Configure CI/CD:** Use `.github/workflows/playwright-tests.yml` as template
4. **Review Test Reports:** Check `test-results/` directory after test runs

## Quick Commands Reference

```bash
# Install everything
pip install -r requirements.txt && playwright install chromium

# Run basic tests
pytest tests/test_basic_setup.py -v

# Run public page tests
pytest tests/test_e2e_public_pages.py -v

# Run with verbose output
pytest tests/ -vv

# Run specific test
pytest tests/test_e2e_public_pages.py::TestPublicPages::test_stp_001_home_page -v

# Generate HTML report
pytest tests/ --html=report.html --self-contained-html

# Run in debug mode
PWDEBUG=1 pytest tests/test_e2e_public_pages.py -v
```

## Resources

- [Playwright Documentation](https://playwright.dev/python/)
- [pytest Documentation](https://docs.pytest.org/)
- [Project README](../README.md)
- [Full Test Documentation](README.md)

## Support

If you encounter issues:
1. Check this guide's troubleshooting section
2. Review the full documentation in `tests/README.md`
3. Check GitHub Issues
4. Contact the development team

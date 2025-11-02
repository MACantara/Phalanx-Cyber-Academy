"""
Pytest configuration and fixtures for Playwright E2E testing
"""
import pytest
import os
import subprocess
import time
from playwright.sync_api import sync_playwright
from threading import Thread
from app import create_app


# Global variables for Flask app server
flask_process = None
flask_app = None


@pytest.fixture(scope='session', autouse=True)
def setup_test_env():
    """Set up test environment variables before tests run"""
    # Store original values
    original_flask_env = os.environ.get('FLASK_ENV')
    original_supabase_url = os.environ.get('SUPABASE_URL')
    original_supabase_key = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')
    
    # Set test values
    os.environ['FLASK_ENV'] = 'testing'
    os.environ['SUPABASE_URL'] = os.environ.get('SUPABASE_URL', 'https://mock.supabase.co')
    os.environ['SUPABASE_SERVICE_ROLE_KEY'] = os.environ.get('SUPABASE_SERVICE_ROLE_KEY', 'mock-key-for-testing-only')
    
    yield
    
    # Restore original values after all tests complete
    if original_flask_env:
        os.environ['FLASK_ENV'] = original_flask_env
    else:
        os.environ.pop('FLASK_ENV', None)
        
    if original_supabase_url:
        os.environ['SUPABASE_URL'] = original_supabase_url
    else:
        os.environ.pop('SUPABASE_URL', None)
        
    if original_supabase_key:
        os.environ['SUPABASE_SERVICE_ROLE_KEY'] = original_supabase_key
    else:
        os.environ.pop('SUPABASE_SERVICE_ROLE_KEY', None)


@pytest.fixture(scope='session')
def flask_app():
    """Create Flask application for testing"""
    app = create_app('testing')
    app.config['TESTING'] = True
    app.config['WTF_CSRF_ENABLED'] = False
    app.config['SERVER_NAME'] = 'localhost:5000'
    
    return app


@pytest.fixture(scope='session')
def base_url():
    """Base URL for the Flask application"""
    return 'http://localhost:5000'


@pytest.fixture(scope='session', autouse=True)
def start_flask_server(flask_app, base_url):
    """Start Flask development server for E2E tests"""
    # Run Flask in a separate thread
    def run_app():
        flask_app.run(host='0.0.0.0', port=5000, debug=False, use_reloader=False)
    
    thread = Thread(target=run_app, daemon=True)
    thread.start()
    
    # Wait for server to be ready
    max_retries = 30
    for i in range(max_retries):
        try:
            import requests
            response = requests.get(base_url, timeout=1)
            if response.status_code:
                break
        except:
            time.sleep(1)
    else:
        pytest.fail("Flask server failed to start within timeout")
    
    yield
    
    # Server will stop when pytest exits (daemon thread)


@pytest.fixture(scope='session')
def browser_type_launch_args():
    """Configure browser launch arguments"""
    return {
        'headless': True,  # Set to False for debugging
        'slow_mo': 100,  # Slow down operations by 100ms for stability
        'args': [
            '--disable-blink-features=AutomationControlled',
            '--disable-dev-shm-usage',
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-gpu',
        ]
    }


@pytest.fixture(scope='session')
def browser_context_args():
    """Configure browser context arguments"""
    return {
        'viewport': {'width': 1920, 'height': 1080},
        'user_agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'ignore_https_errors': True,
        'record_video_dir': None,  # Set to a directory path to record videos
    }


@pytest.fixture(scope='function')
def context(browser_context_args, playwright):
    """Create a new browser context for each test"""
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context(**browser_context_args)
    yield context
    context.close()
    browser.close()


@pytest.fixture(scope='function')
def page(context, base_url):
    """Create a new page for each test"""
    page = context.new_page()
    page.set_default_timeout(30000)  # 30 seconds default timeout
    yield page
    page.close()


# Helper fixtures for common test scenarios
@pytest.fixture
def authenticated_page(page, base_url):
    """
    Create a page with an authenticated user session
    Note: This is a placeholder. You'll need to implement actual authentication
    based on your app's authentication mechanism.
    """
    # TODO: Implement authentication logic
    # For now, just return the page
    return page


@pytest.fixture
def admin_page(page, base_url):
    """
    Create a page with an authenticated admin user session
    Note: This is a placeholder. You'll need to implement actual admin authentication
    """
    # TODO: Implement admin authentication logic
    # For now, just return the page
    return page


# Utility fixtures
@pytest.fixture
def screenshot_on_failure(request, page):
    """Take a screenshot on test failure"""
    yield
    
    if request.node.rep_call.failed:
        screenshot_dir = 'test-results/screenshots'
        os.makedirs(screenshot_dir, exist_ok=True)
        screenshot_path = f'{screenshot_dir}/{request.node.name}.png'
        page.screenshot(path=screenshot_path)
        print(f'\nScreenshot saved to: {screenshot_path}')


@pytest.hookimpl(tryfirst=True, hookwrapper=True)
def pytest_runtest_makereport(item, call):
    """
    Hook to capture test execution result for screenshot on failure
    """
    outcome = yield
    rep = outcome.get_result()
    setattr(item, f'rep_{rep.when}', rep)

#!/usr/bin/env python3
"""
Test validation script to check Playwright test setup.

This script validates that the test environment is properly configured
and can run basic tests.
"""

import sys
import os
import subprocess
from pathlib import Path


def print_header(text):
    """Print a formatted header."""
    print("\n" + "=" * 60)
    print(f"  {text}")
    print("=" * 60)


def check_python_version():
    """Check if Python version is compatible."""
    print_header("Checking Python Version")
    
    version = sys.version_info
    print(f"Python version: {version.major}.{version.minor}.{version.micro}")
    
    if version.major == 3 and version.minor >= 8:
        print("✓ Python version is compatible")
        return True
    else:
        print("✗ Python 3.8+ is required")
        return False


def check_dependencies():
    """Check if required dependencies are installed."""
    print_header("Checking Dependencies")
    
    required_packages = [
        'pytest',
        'playwright',
        'flask',
    ]
    
    all_installed = True
    for package in required_packages:
        try:
            __import__(package)
            print(f"✓ {package} is installed")
        except ImportError:
            print(f"✗ {package} is not installed")
            all_installed = False
    
    return all_installed


def check_playwright_browsers():
    """Check if Playwright browsers are installed."""
    print_header("Checking Playwright Browsers")
    
    try:
        result = subprocess.run(
            ['playwright', '--version'],
            capture_output=True,
            text=True,
            timeout=10
        )
        
        if result.returncode == 0:
            print(f"✓ Playwright CLI is available")
            print(f"  Version: {result.stdout.strip()}")
            
            # Try to check if chromium is installed
            # Note: There's no direct command to check, but we can try
            print("\nNote: Run 'playwright install chromium' to install browsers")
            return True
        else:
            print("✗ Playwright CLI not found")
            return False
    except Exception as e:
        print(f"✗ Error checking Playwright: {e}")
        return False


def check_test_structure():
    """Check if test directory structure is correct."""
    print_header("Checking Test Structure")
    
    required_files = [
        'pytest.ini',
        'tests/__init__.py',
        'tests/conftest.py',
        'tests/README.md',
        'tests/test_auth_login.py',
        'tests/test_auth_signup.py',
        'tests/test_password_reset.py',
        'tests/test_email_verification.py',
        'tests/test_security.py',
        'tests/test_user_roles.py',
        'tests/test_logout_session.py',
        'tests/test_themes.py',
        'tests/test_accessibility.py',
        'tests/test_utils.py',
    ]
    
    all_exist = True
    for file_path in required_files:
        full_path = Path(file_path)
        if full_path.exists():
            print(f"✓ {file_path}")
        else:
            print(f"✗ {file_path} not found")
            all_exist = False
    
    return all_exist


def check_flask_app():
    """Check if Flask app can be imported."""
    print_header("Checking Flask Application")
    
    try:
        # Add parent directory to path
        sys.path.insert(0, os.path.abspath('.'))
        
        from app import create_app
        app = create_app()
        
        print("✓ Flask app can be imported")
        print(f"  Debug mode: {app.config.get('DEBUG')}")
        print(f"  Testing mode: {app.config.get('TESTING')}")
        return True
    except Exception as e:
        print(f"✗ Error importing Flask app: {e}")
        return False


def count_tests():
    """Count total number of tests."""
    print_header("Counting Tests")
    
    try:
        result = subprocess.run(
            ['pytest', '--collect-only', '-q'],
            capture_output=True,
            text=True,
            timeout=30
        )
        
        if result.returncode == 0:
            lines = result.stdout.strip().split('\n')
            # Last line usually contains the count
            for line in reversed(lines):
                if 'test' in line.lower():
                    print(f"✓ Test collection successful")
                    print(f"  {line}")
                    return True
            print("✓ Tests collected (count not parsed)")
            return True
        else:
            print(f"✗ Error collecting tests:")
            print(result.stderr)
            return False
    except Exception as e:
        print(f"✗ Error counting tests: {e}")
        return False


def check_test_markers():
    """Check if test markers are properly configured."""
    print_header("Checking Test Markers")
    
    try:
        result = subprocess.run(
            ['pytest', '--markers'],
            capture_output=True,
            text=True,
            timeout=10
        )
        
        if result.returncode == 0:
            print("✓ Test markers are configured:")
            markers = ['auth', 'login', 'signup', 'password', 'email', 
                      'security', 'roles', 'theme', 'accessibility']
            
            for marker in markers:
                if marker in result.stdout:
                    print(f"  ✓ {marker}")
                else:
                    print(f"  ✗ {marker} (not found)")
            return True
        else:
            print("✗ Error checking markers")
            return False
    except Exception as e:
        print(f"✗ Error checking markers: {e}")
        return False


def run_dry_run():
    """Run a dry run of tests."""
    print_header("Running Test Dry Run")
    
    print("Running pytest with --collect-only (no actual test execution)...")
    
    try:
        result = subprocess.run(
            ['pytest', '--collect-only', '--verbose'],
            capture_output=True,
            text=True,
            timeout=30
        )
        
        if result.returncode == 0:
            print("✓ Test collection successful")
            return True
        else:
            print("✗ Test collection failed:")
            print(result.stderr)
            return False
    except Exception as e:
        print(f"✗ Error during dry run: {e}")
        return False


def main():
    """Main validation function."""
    print("\n" + "=" * 60)
    print("  CyberQuest Playwright Test Validation")
    print("=" * 60)
    
    checks = [
        ("Python Version", check_python_version),
        ("Dependencies", check_dependencies),
        ("Playwright Browsers", check_playwright_browsers),
        ("Test Structure", check_test_structure),
        ("Flask Application", check_flask_app),
        ("Test Count", count_tests),
        ("Test Markers", check_test_markers),
        ("Dry Run", run_dry_run),
    ]
    
    results = []
    for name, check_func in checks:
        try:
            result = check_func()
            results.append((name, result))
        except Exception as e:
            print(f"\n✗ Unexpected error in {name}: {e}")
            results.append((name, False))
    
    # Summary
    print_header("Validation Summary")
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for name, result in results:
        status = "✓ PASS" if result else "✗ FAIL"
        print(f"{status:8} {name}")
    
    print(f"\n{passed}/{total} checks passed")
    
    if passed == total:
        print("\n✓ All checks passed! Ready to run tests.")
        print("\nNext steps:")
        print("  1. Start Flask server: python run.py")
        print("  2. Run tests: pytest")
        return 0
    else:
        print("\n✗ Some checks failed. Please fix the issues above.")
        print("\nTo install missing dependencies:")
        print("  pip install -r requirements.txt")
        print("  playwright install chromium")
        return 1


if __name__ == '__main__':
    sys.exit(main())

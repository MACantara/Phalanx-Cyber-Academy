# Playwright Testing Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                   Phalanx Cyber Academy                         │
│                    Web Application                               │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ├─ Public Pages (8 modules)
                       ├─ Authentication (3 modules)
                       ├─ User Profile (3 modules)
                       ├─ Admin Panel (18 modules)
                       └─ Learning Levels (5 modules)
                       
                       │ Tested by
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│              Playwright Automated Test Suite                    │
│                     (70+ Tests)                                 │
└──────────────────────┬──────────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
        ▼              ▼              ▼
   [Public Tests]  [Auth Tests]  [Admin Tests]
   (No Auth)       (Needs Auth)  (Needs Admin)
```

## Test Flow Architecture

```
┌──────────────┐
│   pytest     │  ← Test Runner
└──────┬───────┘
       │
       ├─→ pytest.ini          (Configuration)
       ├─→ conftest.py         (Fixtures & Setup)
       │
       ├─→ tests/public/       (Public Page Tests)
       │   ├─ test_home_page.py
       │   ├─ test_about_page.py
       │   └─ test_contact_page.py
       │
       ├─→ tests/auth/         (Authentication Tests)
       │   ├─ test_login_page.py
       │   └─ test_signup_page.py
       │
       ├─→ tests/profile/      (Profile Tests)
       │   └─ test_user_profile.py
       │
       ├─→ tests/admin/        (Admin Tests)
       │   └─ test_admin_dashboard.py
       │
       └─→ tests/levels/       (Level Tests)
           └─ test_levels_overview.py
```

## Test Execution Flow

```
┌─────────────────┐
│  Start Test Run │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────┐
│  Load conftest.py           │
│  - Setup fixtures           │
│  - Configure Playwright     │
│  - Initialize browser       │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  For Each Test:             │
│  1. Create browser context  │
│  2. Create new page         │
│  3. Apply fixtures          │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  Execute Test Function      │
│  - Navigate to URL          │
│  - Perform actions          │
│  - Assert expectations      │
└────────┬────────────────────┘
         │
         ├─ PASS → Continue
         └─ FAIL → Log error, screenshot
         │
         ▼
┌─────────────────────────────┐
│  Cleanup                    │
│  - Close page               │
│  - Close context            │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  Generate Report            │
│  - Test results             │
│  - Coverage stats           │
│  - Screenshots (if failed)  │
└─────────────────────────────┘
```

## Fixture Hierarchy

```
┌──────────────────────┐
│  Session Fixtures    │  (Once per test session)
│  - base_url          │
│  - setup_test_db     │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  Function Fixtures   │  (Once per test function)
│  - browser           │
└──────────┬───────────┘
           │
           ├─→ context (Browser context)
           │   │
           │   ├─→ page (Standard page)
           │   ├─→ mobile_page (Mobile viewport)
           │   ├─→ authenticated_page (Logged in user)
           │   └─→ admin_page (Logged in admin)
           │
           └─→ test_data (Common test data)
```

## Helper Classes Architecture

```
┌────────────────────────────────────────────┐
│           test_helpers.py                  │
└────────────────────────────────────────────┘
              │
              ├─→ PageHelper
              │   ├─ wait_for_page_load()
              │   ├─ verify_page_title()
              │   ├─ check_element_visible()
              │   └─ take_screenshot()
              │
              ├─→ FormHelper
              │   ├─ fill_form()
              │   ├─ submit_form()
              │   └─ verify_form_error()
              │
              ├─→ NavigationHelper
              │   ├─ navigate_to()
              │   ├─ click_link()
              │   └─ verify_navigation()
              │
              ├─→ AccessibilityChecker
              │   ├─ check_heading_hierarchy()
              │   ├─ check_alt_texts()
              │   └─ check_form_labels()
              │
              └─→ PerformanceChecker
                  ├─ measure_page_load_time()
                  └─ check_resource_loading()
```

## Test Categories & Markers

```
                    ┌─────────────┐
                    │  All Tests  │
                    │   (70+)     │
                    └──────┬──────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
   [By Category]      [By Priority]     [By Status]
        │                  │                  │
        ├─ functional     ├─ critical        ├─ smoke (3)
        ├─ ui             ├─ high            ├─ skip (9)
        ├─ security       ├─ medium          └─ active (61)
        ├─ integration    └─ low
        └─ performance
```

## CI/CD Pipeline

```
┌──────────────────┐
│  GitHub Actions  │
└────────┬─────────┘
         │
         ├─→ On Push/PR
         │
         ▼
┌─────────────────────────────┐
│  Job: Smoke Tests           │
│  - Install dependencies     │
│  - Install Playwright       │
│  - Start Flask app          │
│  - Run smoke tests          │
└────────┬────────────────────┘
         │
         ├─ PASS → Continue
         └─ FAIL → Notify
         │
         ▼
┌─────────────────────────────┐
│  Job: Public Tests          │
│  - Run all public tests     │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  Job: Auth Tests            │
│  - Run auth tests           │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  Job: Coverage Report       │
│  - Generate coverage        │
│  - Upload artifacts         │
└─────────────────────────────┘
```

## Test Data Flow

```
┌──────────────────────────────┐
│  System Test Plans (JSON)   │
│  - 37 modules                │
│  - 185 test cases            │
└──────────┬───────────────────┘
           │
           ├─→ Manual Implementation
           │   (Current tests)
           │
           └─→ Parametrized Tests
               (test_json_example.py)
               │
               ▼
           ┌─────────────────────┐
           │  Load JSON file     │
           │  Parse test data    │
           └─────────┬───────────┘
                     │
                     ▼
           ┌─────────────────────┐
           │  Generate tests     │
           │  with pytest.mark   │
           │  .parametrize       │
           └─────────┬───────────┘
                     │
                     ▼
           ┌─────────────────────┐
           │  Execute each test  │
           │  case from JSON     │
           └─────────────────────┘
```

## Authentication Flow

```
┌──────────────────────┐
│  authenticated_page  │  ← Fixture
└──────────┬───────────┘
           │
           ▼
   ┌─ Approach 1: API Auth (Fast)
   │  └─→ Set session cookie directly
   │
   └─ Approach 2: UI Auth (Realistic)
      ├─→ Navigate to /auth/login
      ├─→ Fill email
      ├─→ Submit form
      ├─→ Get verification code
      ├─→ Enter code
      └─→ Verify login success
      
      ▼
   ┌─────────────────────────┐
   │  Return authenticated   │
   │  page to test           │
   └─────────────────────────┘
```

## Test Tools Workflow

```
┌─────────────────────────────┐
│  Developer wants new test   │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│  generate_test_template.py  │
│  Input: JSON test plan      │
│  Output: Python test file   │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│  Customize generated test   │
│  - Add specific assertions  │
│  - Implement procedures     │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│  Run tests with:            │
│  - pytest                   │
│  - run_tests.py             │
└─────────────────────────────┘
```

## Directory Structure

```
Phalanx-Cyber-Academy/
│
├── tests/                         ← Test root
│   │
│   ├── conftest.py               ← Fixtures & configuration
│   ├── README.md                 ← Testing documentation
│   ├── AUTH_FIXTURE_GUIDE.md    ← Auth implementation guide
│   │
│   ├── utils/                    ← Test utilities
│   │   ├── __init__.py
│   │   └── test_helpers.py      ← Helper classes
│   │
│   ├── public/                   ← Public page tests
│   │   ├── test_home_page.py
│   │   ├── test_about_page.py
│   │   └── ...
│   │
│   ├── auth/                     ← Authentication tests
│   ├── profile/                  ← Profile tests
│   ├── admin/                    ← Admin tests
│   └── levels/                   ← Level tests
│
├── .github/workflows/
│   └── playwright-tests.yml     ← CI/CD configuration
│
├── pytest.ini                    ← Pytest configuration
├── run_tests.py                 ← Test runner
├── generate_test_template.py   ← Template generator
│
└── Documentation
    ├── TESTING_QUICKSTART.md
    └── TESTING_IMPLEMENTATION_SUMMARY.md
```

## Test Execution Modes

```
┌──────────────────┐
│  Run All Tests   │
└────────┬─────────┘
         │
         ├─→ pytest -v                    (All 70 tests)
         ├─→ pytest -m smoke              (3 smoke tests)
         ├─→ pytest -m "high or critical" (50+ priority tests)
         ├─→ pytest -m "not skip"         (61 active tests)
         ├─→ python run_tests.py --smoke  (Smoke via runner)
         └─→ python run_tests.py --public (Public tests only)
```

## Key Features

1. **Modular Design**: Tests organized by application module
2. **Reusable Fixtures**: DRY principle for test setup
3. **Helper Classes**: Common operations abstracted
4. **Markers**: Flexible test selection
5. **CI/CD Ready**: GitHub Actions integration
6. **Documentation**: Comprehensive guides
7. **Extensible**: Easy to add new tests
8. **Parametrized**: Data-driven testing support

## Benefits

- ✅ Automated quality assurance
- ✅ Fast feedback on changes
- ✅ Consistent test execution
- ✅ Easy to maintain and extend
- ✅ Well documented
- ✅ CI/CD integrated
- ✅ Multiple test execution modes
- ✅ Comprehensive coverage

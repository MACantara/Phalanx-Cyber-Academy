# System Test Plan Template

| **Test Plan No:** | STP-XXX |
|-------------------|---------|
| **Screen Design Ref No** | Figure X.X: [Screen/Page Name] |
| **Description / Scenario** | [Brief description of what is being tested and the scenario] |
| **Expected Results** | [What should happen when the test is executed] |
| **Procedure** | 1. [Step 1 - e.g., Open Google Chrome] <br> 2. [Step 2 - e.g., Type in URL on browser: http://phalanx-cyber-academy.vercel.app/page] <br> 3. [Step 3 - e.g., Display target page] <br> 4. [Step 4 - e.g., Enter specific data or perform actions] <br> 5. [Additional steps as needed] |
| **Remarks** | [Test result: Passed/Failed/Pending] |

## Instructions for Use:
1. Copy this template for each new test case
2. Replace `STP-XXX` with the actual test plan number (e.g., STP-001, STP-002)
3. Fill in all fields with appropriate test information
4. Update the procedure steps to match your specific test scenario
5. Record the test results in the Remarks section

## Database-Driven System Test Management

For efficient management of system test plans, the application includes a comprehensive admin interface that uses JSON format for bulk imports and database storage. This allows for better organization, tracking, and reporting of test executions.

### JSON Format for Bulk Import

The admin system supports bulk import of test plans using JSON format. Each test plan should be formatted as follows:

```json
[
  {
    "test_plan_no": "STP-001-01",
    "module_name": "Home Page",
    "screen_design_ref": "Figure 2.1: Home Page",
    "description": "Verify that the home page loads correctly when accessing the root URL",
    "scenario": "User navigates to the home page by typing the URL and expecting to see all content sections",
    "expected_results": "Display the complete home page with hero section, features, learning modules, and CTA sections",
    "procedure": "1. Open web browser\n2. Navigate to http://localhost:5000/\n3. Verify page loads completely\n4. Check all sections are visible (Hero, Features, Learning Modules, CTA)",
    "test_status": "pending",
    "priority": "high",
    "category": "functional"
  }
]
```

### Required Fields:
- `test_plan_no`: Unique identifier (e.g., STP-001-01)
- `module_name`: Name of the module being tested
- `description`: Brief description of the test
- `expected_results`: What should happen when the test passes
- `procedure`: Step-by-step test instructions (use \n for line breaks)

### Optional Fields:
- `screen_design_ref`: Reference to design documentation
- `scenario`: Test scenario description
- `test_status`: Current status (pending/passed/failed/skipped)
- `priority`: Test priority (low/medium/high/critical)
- `category`: Test category (functional/ui/performance/security/integration)

### Admin Interface Features:
- **Dashboard**: Overview of test status across all modules
- **Test Execution**: Interactive test execution with timer and failure tracking
- **Bulk Import**: Upload JSON files to import multiple test plans
- **Search & Filter**: Find tests by module, status, priority, or category
- **Reporting**: Generate comprehensive test reports

### Access the System Test Management:
Navigate to `/admin/system-test/dashboard` (requires admin privileges) to access the complete test management interface.

## Example Test Plan:

| **Test Plan No.** | STP-001 |
|---------------------------|------------------------|
| **Screen Design Ref No** | Figure 4.1: Login Page |
| **Description / Scenario** | First Page seen by User by typing in the URL and logging in |
| **Expected Results** | Display the Login page and logging in |
| **Procedure** | 1. Open Google Chrome <br> 2. Type in URL on browser: `http://bmis.000.pe/login` <br> 3. Display login page <br> 4. Enter Username `admin1@test.com` and password `Testing123` |
| **Remarks** | Passed |

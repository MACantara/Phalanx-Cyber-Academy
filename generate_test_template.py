#!/usr/bin/env python3
"""
Test Template Generator

This script generates test file templates from System Test Plan JSON files.
It creates a basic test structure that can be customized for each module.

Usage:
    python generate_test_template.py <json-file-path> [output-file-path]

Example:
    python generate_test_template.py docs/system-test-plans/json-files/cookie-policy-tests.json tests/public/test_cookie_policy.py
"""

import sys
import json
import os
from pathlib import Path


def load_test_plans(json_path: str) -> list:
    """Load test plans from JSON file."""
    with open(json_path, 'r') as f:
        return json.load(f)


def generate_test_file(test_plans: list, module_name: str, stp_number: str) -> str:
    """Generate test file content from test plans."""
    
    # Get first test plan for metadata
    first_plan = test_plans[0] if test_plans else {}
    module_name_display = first_plan.get('module_name', module_name).replace('-', ' ').title()
    
    # Generate file header
    content = f'''"""
Automated tests for {module_name_display} ({stp_number}).
Tests are based on system test plans from docs/system-test-plans/json-files/*.json
"""
import pytest
from playwright.sync_api import Page, expect
from tests.utils import PageHelper


'''
    
    # Generate test functions
    for i, plan in enumerate(test_plans, 1):
        test_no = plan.get('test_plan_no', f'{stp_number}-{i:02d}')
        description = plan.get('description', 'No description')
        expected_results = plan.get('expected_results', '')
        priority = plan.get('priority', 'medium')
        category = plan.get('category', 'functional')
        procedure = plan.get('procedure', '')
        
        # Determine if test needs authentication
        needs_auth = 'auth' in description.lower() or 'login' in description.lower()
        needs_admin = 'admin' in description.lower()
        
        # Generate test function
        test_name = f"test_{test_no.lower().replace('-', '_')}"
        
        # Markers
        markers = [f"@pytest.mark.{category}"]
        if priority:
            markers.append(f"@pytest.mark.{priority}")
        
        # Add skip marker if needs authentication
        if needs_auth or needs_admin:
            markers.append('@pytest.mark.skip(reason="Requires authentication - implement after auth fixtures are configured")')
        
        # Page fixture
        if needs_admin:
            page_fixture = "admin_page"
        elif needs_auth:
            page_fixture = "authenticated_page"
        else:
            page_fixture = "page"
        
        content += '\n'.join(markers) + '\n'
        content += f'def {test_name}({page_fixture}: Page, base_url: str):\n'
        content += f'    """\n'
        content += f'    {test_no}: {description}\n'
        content += f'    \n'
        content += f'    Expected Results:\n'
        content += f'    {expected_results}\n'
        if needs_auth or needs_admin:
            content += f'    \n'
            content += f'    Note: Requires {"admin " if needs_admin else ""}authentication fixture implementation\n'
        content += f'    """\n'
        content += f'    helper = PageHelper({page_fixture})\n'
        content += f'    \n'
        content += f'    # TODO: Implement test based on procedure:\n'
        for line in procedure.split('\n'):
            content += f'    # {line}\n'
        content += f'    \n'
        content += f'    # Navigate to page\n'
        content += f'    {page_fixture}.goto(f"{{base_url}}/your-path-here")\n'
        content += f'    helper.wait_for_page_load()\n'
        content += f'    \n'
        content += f'    # Add test assertions here\n'
        content += f'    assert True, "Test not yet implemented"\n'
        content += f'\n\n'
    
    return content


def main():
    """Main function."""
    if len(sys.argv) < 2:
        print("Usage: python generate_test_template.py <json-file-path> [output-file-path]")
        sys.exit(1)
    
    json_path = sys.argv[1]
    
    # Check if JSON file exists
    if not os.path.exists(json_path):
        print(f"Error: JSON file not found: {json_path}")
        sys.exit(1)
    
    # Load test plans
    try:
        test_plans = load_test_plans(json_path)
    except Exception as e:
        print(f"Error loading JSON file: {e}")
        sys.exit(1)
    
    # Get module name and STP number from first test plan
    if not test_plans:
        print("Error: No test plans found in JSON file")
        sys.exit(1)
    
    first_plan = test_plans[0]
    module_name = first_plan.get('module_name', 'Unknown')
    stp_number = first_plan.get('test_plan_no', 'STP-000').split('-')[0] + '-' + first_plan.get('test_plan_no', 'STP-000').split('-')[1]
    
    # Generate test file content
    content = generate_test_file(test_plans, module_name, stp_number)
    
    # Determine output path
    if len(sys.argv) >= 3:
        output_path = sys.argv[2]
    else:
        # Auto-generate output path
        module_slug = module_name.lower().replace(' ', '_').replace('-', '_')
        output_path = f"tests/test_{module_slug}.py"
    
    # Write to file
    try:
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        with open(output_path, 'w') as f:
            f.write(content)
        print(f"✓ Generated test file: {output_path}")
        print(f"  Tests generated: {len(test_plans)}")
        print(f"  Module: {module_name}")
        print(f"  STP: {stp_number}")
    except Exception as e:
        print(f"Error writing output file: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""
Script to reduce system test plans to 5 high-quality tests per module.
Selects tests based on priority (critical > high > medium > low) and ensures
good category coverage (functional, security, ui, etc.)
"""

import json
import os
import sys
from pathlib import Path

# Add project root to path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

def select_top_tests(test_plans, count=5):
    """
    Select top 5 high-quality test plans based on:
    1. Priority (critical > high > medium > low)
    2. Category diversity (functional, security, ui, etc.)
    3. Keep the first test (usually page load test)
    """
    if len(test_plans) <= count:
        return test_plans
    
    # Priority weights
    priority_weights = {
        'critical': 4,
        'high': 3,
        'medium': 2,
        'low': 1
    }
    
    # Always keep the first test (usually the basic page load test)
    selected = [test_plans[0]]
    remaining = test_plans[1:]
    
    # Sort remaining by priority
    remaining_sorted = sorted(
        remaining,
        key=lambda x: priority_weights.get(x.get('priority', 'medium'), 2),
        reverse=True
    )
    
    # Try to get diversity in categories
    categories_seen = {test_plans[0].get('category', 'functional')}
    
    for test in remaining_sorted:
        if len(selected) >= count:
            break
        
        # Prefer tests with different categories for diversity
        test_category = test.get('category', 'functional')
        if test_category not in categories_seen or len(selected) >= count - 1:
            selected.append(test)
            categories_seen.add(test_category)
    
    # If we still need more tests, add remaining high-priority ones
    if len(selected) < count:
        for test in remaining_sorted:
            if test not in selected:
                selected.append(test)
                if len(selected) >= count:
                    break
    
    return selected[:count]


def process_test_file(file_path, output_path):
    """Process a single test file and reduce to 5 test plans."""
    with open(file_path, 'r', encoding='utf-8') as f:
        test_plans = json.load(f)
    
    if not isinstance(test_plans, list):
        print(f"Warning: {file_path.name} does not contain a list of test plans")
        return 0
    
    original_count = len(test_plans)
    
    # Select top 5 tests
    selected_tests = select_top_tests(test_plans, count=5)
    
    # Renumber the test plans to be sequential (STP-XXX-01 through STP-XXX-05)
    for i, test in enumerate(selected_tests, 1):
        # Keep the base test plan number but update the sequence
        if 'test_plan_no' in test and '-' in test['test_plan_no']:
            parts = test['test_plan_no'].split('-')
            if len(parts) >= 2:
                parts[-1] = f"{i:02d}"
                test['test_plan_no'] = '-'.join(parts)
    
    # Write the reduced test plans to output
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(selected_tests, f, indent=2, ensure_ascii=False)
    
    reduced_count = len(selected_tests)
    print(f"✓ {file_path.name}: {original_count} → {reduced_count} tests")
    
    return original_count - reduced_count


def main():
    """Main function to process all test files."""
    json_dir = project_root / 'docs' / 'system-test-plans' / 'json-files'
    
    if not json_dir.exists():
        print(f"Error: Directory not found: {json_dir}")
        sys.exit(1)
    
    # Files to exclude (password-related ones for passwordless auth)
    exclude_files = {
        'password-recovery-tests.json',
        'password-reset-tests.json'
    }
    
    total_original = 0
    total_reduced = 0
    files_processed = 0
    
    print("Reducing test plans to 5 high-quality tests per module...")
    print("=" * 70)
    
    # Process each JSON file
    for json_file in sorted(json_dir.glob('*.json')):
        if json_file.name in exclude_files:
            print(f"⊗ {json_file.name}: Skipped (excluded)")
            continue
        
        removed = process_test_file(json_file, json_file)
        total_reduced += removed
        files_processed += 1
    
    # Now remove the excluded files
    for excluded_file in exclude_files:
        file_path = json_dir / excluded_file
        if file_path.exists():
            original_count = len(json.load(open(file_path)))
            file_path.unlink()
            total_reduced += original_count
            print(f"✗ {excluded_file}: Removed ({original_count} tests)")
    
    print("=" * 70)
    print(f"Processing complete!")
    print(f"Files processed: {files_processed}")
    print(f"Files removed: {len(exclude_files)}")
    print(f"Total tests reduced: {total_reduced}")
    print(f"Remaining modules: {files_processed}")
    print(f"Expected remaining tests: {files_processed * 5}")


if __name__ == '__main__':
    main()

#!/usr/bin/env python3
"""
Script to replace spaces in module_name fields within JSON test plan files.

This script processes all JSON files in the docs/system-test-plans/json-files directory
and replaces spaces in the "module_name" field with underscores to ensure consistency
and avoid potential issues with systems that don't handle spaces well.

Usage:
    python scripts/fix_module_names.py

Author: Phalanx Cyber Academy Development Team
Date: August 28, 2025
"""

import json
import os
import glob
from pathlib import Path


def fix_module_names_in_file(file_path, replacement_char='_', dry_run=False):
    """
    Fix module names in a single JSON file by replacing spaces.
    
    Args:
        file_path (str): Path to the JSON file
        replacement_char (str): Character to replace spaces with (default: '_')
        dry_run (bool): If True, only show what would be changed without making changes
    
    Returns:
        tuple: (success, changes_made, error_message)
    """
    try:
        # Read the JSON file
        with open(file_path, 'r', encoding='utf-8') as file:
            data = json.load(file)
        
        changes_made = []
        
        # Process each test plan in the file
        if isinstance(data, list):
            for i, test_plan in enumerate(data):
                if isinstance(test_plan, dict) and 'module_name' in test_plan:
                    original_name = test_plan['module_name']
                    if ' ' in original_name:
                        new_name = original_name.replace(' ', replacement_char)
                        changes_made.append({
                            'index': i,
                            'original': original_name,
                            'new': new_name
                        })
                        
                        if not dry_run:
                            test_plan['module_name'] = new_name
        
        # Write back the changes if not a dry run
        if changes_made and not dry_run:
            with open(file_path, 'w', encoding='utf-8') as file:
                json.dump(data, file, indent=2, ensure_ascii=False)
        
        return True, changes_made, None
        
    except json.JSONDecodeError as e:
        return False, [], f"JSON decode error: {e}"
    except Exception as e:
        return False, [], f"Error processing file: {e}"


def main():
    """Main function to process all JSON files in the test plans directory."""
    
    # Configuration
    REPLACEMENT_CHAR = '_'  # Character to replace spaces with
    DRY_RUN = False  # Set to True to see what would be changed without making changes
    
    # Define the directory containing the JSON files
    script_dir = Path(__file__).parent
    project_root = script_dir.parent
    json_files_dir = project_root / 'docs' / 'system-test-plans' / 'json-files'
    
    print("🔧 Phalanx Cyber Academy Module Name Fixer")
    print("=" * 50)
    print(f"📁 Processing directory: {json_files_dir}")
    print(f"🔄 Replacement character: '{REPLACEMENT_CHAR}'")
    print(f"🧪 Dry run mode: {'ON' if DRY_RUN else 'OFF'}")
    print("=" * 50)
    
    # Check if directory exists
    if not json_files_dir.exists():
        print(f"❌ Error: Directory not found: {json_files_dir}")
        return
    
    # Find all JSON files
    json_files = list(json_files_dir.glob('*.json'))
    
    if not json_files:
        print(f"❌ No JSON files found in {json_files_dir}")
        return
    
    print(f"📋 Found {len(json_files)} JSON files to process")
    print()
    
    total_files_processed = 0
    total_changes_made = 0
    files_with_errors = []
    
    # Process each JSON file
    for file_path in sorted(json_files):
        print(f"🔍 Processing: {file_path.name}")
        
        success, changes, error = fix_module_names_in_file(
            str(file_path), 
            REPLACEMENT_CHAR, 
            DRY_RUN
        )
        
        if not success:
            print(f"   ❌ Error: {error}")
            files_with_errors.append(file_path.name)
            continue
        
        total_files_processed += 1
        
        if changes:
            total_changes_made += len(changes)
            print(f"   ✅ {len(changes)} module name(s) updated:")
            for change in changes:
                print(f"      • '{change['original']}' → '{change['new']}'")
        else:
            print(f"   ℹ️  No changes needed")
        
        print()
    
    # Summary
    print("=" * 50)
    print("📊 SUMMARY")
    print("=" * 50)
    print(f"✅ Files processed successfully: {total_files_processed}")
    print(f"🔄 Total module names updated: {total_changes_made}")
    
    if files_with_errors:
        print(f"❌ Files with errors: {len(files_with_errors)}")
        for error_file in files_with_errors:
            print(f"   • {error_file}")
    
    if DRY_RUN:
        print()
        print("🧪 DRY RUN MODE - No files were actually modified")
        print("   Set DRY_RUN = False in the script to apply changes")
    elif total_changes_made > 0:
        print()
        print("✅ All changes have been applied successfully!")
        print("   Remember to commit these changes to version control")
    
    print()
    print("🎉 Module name fixing complete!")


if __name__ == "__main__":
    main()

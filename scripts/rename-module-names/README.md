# Module Name Fixing Scripts

This directory contains Python scripts to fix module names in JSON test plan files by replacing spaces with underscores or other characters.

## Scripts Available

### 1. `fix_module_names.py` (Full-featured)
A comprehensive script with detailed output and error handling.

**Features:**
- Detailed progress reporting
- Error handling and summary
- Configurable replacement character
- Dry-run mode for previewing changes
- Processes all JSON files in `docs/system-test-plans/json-files/`

**Usage:**
```bash
python scripts/rename-module-names/fix_module_names.py
```

**Configuration:**
Edit the script to modify:
- `REPLACEMENT_CHAR = '_'` - Character to replace spaces with
- `DRY_RUN = False` - Set to True to preview changes

### 2. `simple_fix_module_names.py` (Command-line)
A streamlined version with command-line options.

**Usage:**
```bash
# Basic usage - replace spaces with hyphens
python scripts/rename-module-names/simple_fix_module_names.py

# Preview changes without applying them
python scripts/rename-module-names/simple_fix_module_names.py --dry-run

# Use hyphens instead of hyphens
python scripts/rename-module-names/simple_fix_module_names.py --replacement-char "-"

# Combine options
python scripts/rename-module-names/simple_fix_module_names.py --dry-run --replacement-char "-"
```

## What These Scripts Do

Both scripts process JSON files in the `docs/system-test-plans/json-files/` directory and:

1. **Find all JSON files** in the test plans directory
2. **Parse each JSON file** and look for objects with `module_name` fields
3. **Replace spaces** in module names with the specified replacement character
4. **Save the updated files** back to disk (unless in dry-run mode)

## Example Changes

**Before:**
```json
{
  "module_name": "Home Page",
  "test_plan_no": "STP-001-01",
  ...
}
```

**After:**
```json
{
  "module_name": "Home_Page",
  "test_plan_no": "STP-001-01",
  ...
}
```

## Safety Features

- **Dry-run mode**: Preview changes before applying them
- **Error handling**: Scripts continue processing even if individual files fail
- **Backup recommendation**: Always commit your changes to version control before running
- **UTF-8 encoding**: Properly handles international characters

## Requirements

- Python 3.6 or higher
- No external dependencies (uses only standard library)

## Best Practices

1. **Always run in dry-run mode first** to preview changes
2. **Commit your current work** to version control before running
3. **Review the output** to ensure changes are as expected
4. **Test your application** after making changes to ensure nothing breaks

## Example Output

```
🔧 Phalanx Cyber Academy Module Name Fixer
==================================================
📁 Processing directory: docs/system-test-plans/json-files
🔄 Replacement character: '_'
🧪 Dry run mode: OFF
==================================================
📋 Found 38 JSON files to process

🔍 Processing: home_page_test_plans.json
   ✅ 15 module name(s) updated:
      • 'Home Page' → 'Home_Page'

🔍 Processing: cybersecurity-levels-tests.json
   ✅ 12 module name(s) updated:
      • 'Cybersecurity Levels' → 'Cybersecurity_Levels'

==================================================
📊 SUMMARY
==================================================
✅ Files processed successfully: 38
🔄 Total module names updated: 156
✅ All changes have been applied successfully!
```

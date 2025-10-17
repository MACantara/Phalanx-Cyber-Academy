"""
STP Renumbering Script - Removes gaps in test plan numbering
"""
import os
import json
from pathlib import Path

# Base path for test files
base_path = Path(r"E:\Projects\Programming-projects\Work-in-Progress\Phalanx-Cyber-Academy\docs\system-test-plans\json-files")

# Mapping of old to new STP numbers
mappings = {
    "011": "009",
    "012": "010",
    "013": "011",
    "014": "012",
    "015": "013",
    "016": "014",
    "017": "015",
    "018": "016",
    "019": "017",
    "020": "018",
    "021": "019",
    "022": "020",
    "023": "021",
    "024": "022",
    "025": "023",
    "026": "024",
    "027": "025",
    "028": "026",
    "029": "027",
    "030": "028",
    "031": "029",
    "032": "030",
    "033": "031",
    "034": "032",
    "035": "033",
    "036": "034",
    "037": "035",
    "038": "036",
    "039": "037",
}

print("=" * 70)
print("STP Renumbering Script")
print("=" * 70)
print(f"Directory: {base_path}")
print()

# Process each JSON file
json_files = list(base_path.glob("*.json"))
files_processed = 0
files_modified = 0

for json_file in json_files:
    print(f"Processing: {json_file.name}")
    
    try:
        # Read file content
        with open(json_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        modified = False
        
        # Replace each old STP number with new one
        for old_num, new_num in mappings.items():
            if f"STP-{old_num}-" in content:
                content = content.replace(f"STP-{old_num}-", f"STP-{new_num}-")
                modified = True
                print(f"  ✓ STP-{old_num} → STP-{new_num}")
        
        # Write back if modified
        if modified:
            with open(json_file, 'w', encoding='utf-8') as f:
                f.write(content)
            files_modified += 1
            print(f"  File updated!")
        else:
            print(f"  No changes needed")
        
        files_processed += 1
        
    except Exception as e:
        print(f"  ✗ Error: {e}")
    
    print()

print("=" * 70)
print(f"Complete!")
print(f"Files Processed: {files_processed}")
print(f"Files Modified: {files_modified}")
print("=" * 70)
print()
print("New Sequential STP Order:")
print("STP-001 to STP-008: Unchanged")
print("STP-009: Email Verification (was STP-011)")
print("STP-010 to STP-037: Sequentially renumbered")
print()

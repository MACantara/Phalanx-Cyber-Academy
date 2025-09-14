#!/usr/bin/env python3
"""
__pycache__ Cleaner Script
Recursively finds and removes all __pycache__ directories from the project.
"""

import os
import shutil
import sys
from pathlib import Path
from typing import List, Tuple


def find_pycache_dirs(root_path: str) -> List[Path]:
    """
    Recursively find all __pycache__ directories starting from root_path.

    Args:
        root_path: The root directory to start searching from

    Returns:
        List of Path objects pointing to __pycache__ directories
    """
    pycache_dirs = []
    root = Path(root_path)

    # Walk through all directories recursively
    for dirpath in root.rglob('__pycache__'):
        if dirpath.is_dir():
            pycache_dirs.append(dirpath)

    return pycache_dirs


def get_cache_info(pycache_dirs: List[Path]) -> Tuple[int, int]:
    """
    Get information about cache files in __pycache__ directories.

    Args:
        pycache_dirs: List of __pycache__ directory paths

    Returns:
        Tuple of (total_dirs, total_files)
    """
    total_files = 0

    for pycache_dir in pycache_dirs:
        if pycache_dir.exists():
            # Count .pyc files in this directory
            pyc_files = list(pycache_dir.glob('*.pyc'))
            total_files += len(pyc_files)

    return len(pycache_dirs), total_files


def delete_pycache_dirs(pycache_dirs: List[Path]) -> Tuple[int, int]:
    """
    Delete all __pycache__ directories in the list.

    Args:
        pycache_dirs: List of __pycache__ directory paths to delete

    Returns:
        Tuple of (deleted_dirs, deleted_files)
    """
    deleted_dirs = 0
    deleted_files = 0

    for pycache_dir in pycache_dirs:
        if pycache_dir.exists():
            try:
                # Count files before deletion
                pyc_files = list(pycache_dir.glob('*.pyc'))
                file_count = len(pyc_files)

                # Remove the entire directory
                shutil.rmtree(pycache_dir)
                deleted_dirs += 1
                deleted_files += file_count

                print(f"✓ Deleted: {pycache_dir} ({file_count} files)")

            except Exception as e:
                print(f"✗ Failed to delete {pycache_dir}: {e}")

    return deleted_dirs, deleted_files


def main():
    """Main function to run the __pycache__ cleaner."""

    # Get the project root directory (parent of scripts folder)
    script_dir = Path(__file__).parent
    project_root = script_dir.parent

    print("🧹 __pycache__ Cleaner")
    print("=" * 50)
    print(f"Project root: {project_root}")
    print()

    # Find all __pycache__ directories
    print("🔍 Scanning for __pycache__ directories...")
    pycache_dirs = find_pycache_dirs(str(project_root))

    if not pycache_dirs:
        print("✅ No __pycache__ directories found!")
        return

    # Get cache information
    total_dirs, total_files = get_cache_info(pycache_dirs)

    print(f"📁 Found {total_dirs} __pycache__ directories")
    print(f"📄 Containing approximately {total_files} .pyc files")
    print()

    # Show directories that will be deleted
    print("📂 Directories to be deleted:")
    for i, pycache_dir in enumerate(pycache_dirs, 1):
        print(f"  {i}. {pycache_dir}")
    print()

    # Ask for confirmation
    while True:
        try:
            response = input("⚠️  Are you sure you want to delete all these directories? (y/N): ").strip().lower()
            if response in ['y', 'yes']:
                break
            elif response in ['n', 'no', '']:
                print("❌ Operation cancelled.")
                return
            else:
                print("Please enter 'y' for yes or 'n' for no.")
        except KeyboardInterrupt:
            print("\n❌ Operation cancelled.")
            return
        except EOFError:
            print("\n❌ Operation cancelled.")
            return

    print()
    print("🗑️  Deleting __pycache__ directories...")

    # Delete the directories
    deleted_dirs, deleted_files = delete_pycache_dirs(pycache_dirs)

    print()
    print("✅ Cleanup completed!")
    print(f"📁 Deleted {deleted_dirs} directories")
    print(f"📄 Removed {deleted_files} .pyc files")

    # Verify cleanup
    remaining_dirs = find_pycache_dirs(str(project_root))
    if remaining_dirs:
        print(f"⚠️  Warning: {len(remaining_dirs)} directories could not be deleted")
    else:
        print("🎉 All __pycache__ directories successfully removed!")


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)

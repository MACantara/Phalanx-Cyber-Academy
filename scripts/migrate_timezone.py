#!/usr/bin/env python3
"""
Database migration script to add timezone support to users table.
This script adds the timezone column to the users table for timezone-aware datetime display.
"""

import os
import sys

# Add the project root directory to the Python path
project_root = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, project_root)

from app.database import get_supabase_client

def run_migration():
    """Run the timezone migration on the database."""
    try:
        # Initialize database connection
        client = get_supabase_client()
        
        print("Running timezone migration...")
        
        # Read migration SQL
        migration_path = os.path.join(project_root, 'migrations', 'add_timezone_to_users.sql')
        with open(migration_path, 'r') as f:
            migration_sql = f.read()
        
        # Split into individual statements and execute each
        statements = [stmt.strip() for stmt in migration_sql.split(';') if stmt.strip()]
        
        for i, statement in enumerate(statements, 1):
            if statement:
                print(f"Executing statement {i}/{len(statements)}...")
                try:
                    # Use rpc to execute raw SQL
                    result = client.rpc('sql', {'query': statement}).execute()
                    print(f"✓ Statement {i} executed successfully")
                except Exception as e:
                    print(f"✗ Error executing statement {i}: {e}")
                    print(f"Statement: {statement}")
                    return False
        
        print("✅ Migration completed successfully!")
        print("Users table now has timezone support.")
        return True
        
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        return False

if __name__ == "__main__":
    success = run_migration()
    sys.exit(0 if success else 1)
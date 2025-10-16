# Timezone Settings Implementation

This document describes the timezone settings feature implementation for Phalanx Cyber Academy, allowing users to set their preferred timezone for date and time display.

## Overview

The timezone settings feature allows users to:
- Set their preferred timezone in their profile
- View all dates and times in their selected timezone
- Choose from a curated list of common timezones
- Have timestamps automatically converted throughout the application

## Technical Implementation

### 1. Database Changes

#### Users Table
Added `timezone` column to the users table:
```sql
ALTER TABLE users 
ADD COLUMN timezone VARCHAR(50) DEFAULT 'UTC';
```

#### Migration
- Migration file: `migrations/add_timezone_to_users.sql`
- Migration script: `scripts/migrate_timezone.py`
- Updated schema: `supabase_schema.sql`

### 2. Backend Changes

#### User Model (`app/models/user.py`)
- Added `timezone` field to User model
- Updated `__init__`, `save`, and `create` methods to handle timezone
- Default timezone is 'UTC' for new users

#### Timezone Utilities (`app/utils/timezone_utils.py`)
New functions added:
- `format_for_user_timezone()` - Format datetime in user's timezone
- `format_for_user_timezone_with_tz()` - Format with timezone abbreviation
- `get_common_timezones()` - List of common timezones for selection

#### Profile Routes (`app/routes/profile.py`)
- Updated edit profile route to handle timezone selection
- Added timezone validation
- Passes timezone list to templates

### 3. Frontend Changes

#### Profile Templates
- **`profile.html`**: Added timezone display and user timezone formatting for dates
- **`edit-profile.html`**: Added timezone selection dropdown with common timezones

#### Dashboard Template (`profile/dashboard.html`)
- Updated date displays to use user timezone formatting
- Applied timezone-aware formatting to recent completions and XP history

#### Admin Templates
- **`admin/dashboard/components/recent-users.html`**: User creation dates in admin's timezone
- **`admin/dashboard/components/login-activity.html`**: Login timestamps in admin's timezone

### 4. Template Filters

#### Jinja2 Filters (`app/__init__.py`)
Added custom template filters:
- `format_user_timezone` - Format datetime for user's timezone
- `format_user_timezone_with_tz` - Format with timezone abbreviation

## Usage Examples

### In Templates
```html
<!-- Format date in user's timezone -->
{{ user.created_at|format_user_timezone(user.timezone, '%B %d, %Y') }}

<!-- Format with timezone abbreviation -->
{{ user.last_login|format_user_timezone_with_tz(user.timezone) }}
```

### In Python Code
```python
from app.utils.timezone_utils import format_for_user_timezone

# Format datetime for user's timezone
formatted_date = format_for_user_timezone(
    datetime_obj, 
    user.timezone, 
    '%Y-%m-%d %H:%M:%S'
)
```

## Timezone List

The application provides a curated list of common timezones including:
- UTC
- US timezones (Eastern, Central, Mountain, Pacific, Alaska, Hawaii)
- European timezones (London, Paris, Berlin, Rome, etc.)
- Asian timezones (Tokyo, Shanghai, Hong Kong, Singapore, etc.)
- Australian timezones (Sydney, Melbourne, Perth)
- Canadian timezones
- Other major world timezones

## Database Migration

To apply the timezone feature to an existing database:

1. **Using the migration script:**
   ```bash
   python scripts/migrate_timezone.py
   ```

2. **Manual SQL execution:**
   ```sql
   -- Run the contents of migrations/add_timezone_to_users.sql
   ```

## Backward Compatibility

- Existing users without timezone preference default to 'UTC'
- All datetime operations remain timezone-aware
- Legacy code continues to work with UTC timestamps

## Configuration

No additional configuration is required. The feature works with existing:
- Supabase database setup
- Flask application configuration
- User authentication system

## Testing

To test the timezone feature:

1. Create a user account
2. Navigate to Profile → Edit Profile
3. Select a different timezone
4. Verify dates and times display in the selected timezone throughout the app
5. Check admin dashboard shows dates in admin user's timezone

## Files Modified

### Core Files
- `app/models/user.py` - User model with timezone support
- `app/utils/timezone_utils.py` - Timezone formatting utilities
- `app/routes/profile.py` - Profile management with timezone
- `app/__init__.py` - Jinja2 template filters

### Templates
- `app/templates/profile/profile.html` - Profile display
- `app/templates/profile/edit-profile.html` - Profile editing
- `app/templates/profile/dashboard.html` - User dashboard
- `app/templates/admin/dashboard/components/recent-users.html` - Admin panel
- `app/templates/admin/dashboard/components/login-activity.html` - Admin panel

### Database
- `supabase_schema.sql` - Updated schema
- `migrations/add_timezone_to_users.sql` - Migration SQL
- `scripts/migrate_timezone.py` - Migration script

## Future Enhancements

Potential improvements for the timezone feature:
- Automatic timezone detection based on browser
- More granular timezone handling (e.g., DST transitions)
- Timezone-aware date pickers in forms
- Bulk timezone updates for admin users
- Export/import functionality with timezone preservation
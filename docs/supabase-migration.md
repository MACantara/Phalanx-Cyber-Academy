# Phalanx Cyber Academy - Supabase Migration

This document outlines the migration from SQLAlchemy/SQLite to Supabase (PostgreSQL) for the Phalanx Cyber Academy application.

## Migration Overview

The Phalanx Cyber Academy application has been migrated from using SQLAlchemy ORM with SQLite to using Supabase as the database backend. This migration provides better scalability, reliability, and production readiness.

### What Changed

1. **Database Layer**: Replaced SQLAlchemy ORM with direct Supabase client calls
2. **Models**: Updated all model classes to use Supabase operations instead of SQLAlchemy
3. **Routes**: Modified all route handlers to use the new model methods
4. **Initialization**: Updated Flask app initialization to connect to Supabase

### Files Modified

#### Core Database Files
- `app/database.py` - New Supabase client configuration and utilities
- `app/__init__.py` - Updated Flask app initialization
- `requirements.txt` - Removed SQLAlchemy dependencies, kept supabase

#### Model Files
- `app/models/user.py` - Complete rewrite for Supabase
- `app/models/contact.py` - Updated for Supabase operations
- `app/models/login_attempt.py` - Migrated to Supabase
- `app/models/email_verification.py` - Updated for Supabase

#### Route Files
- `app/routes/auth.py` - Updated database operations
- `app/routes/contact.py` - Migrated to new Contact model
- `app/routes/profile.py` - Updated user operations
- `app/routes/admin.py` - Major updates for admin functionality
- `app/routes/login_attempts.py` - Updated for new LoginAttempt model
- `app/routes/email_verification.py` - Updated for new EmailVerification model

#### Database Schema
- `supabase_schema.sql` - Complete database schema for Supabase

## Setup Instructions

### 1. Supabase Setup

1. Create a new Supabase project at [https://supabase.com](https://supabase.com)
2. Go to the SQL editor in your Supabase dashboard
3. Run the SQL script from `supabase_schema.sql` to create all required tables
4. Note your project URL and anon key from the project settings

### 2. Environment Variables

Add these environment variables to your `.env` file:

```bash
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_anon_key
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Run the Application

```bash
python run.py
```

## Database Schema

The Supabase database includes the following tables:

### users
- Primary user account information
- Includes username, email, password hash, admin status

### contact_submissions
- Contact form submissions from the website
- Includes name, email, subject, message, and read status

### login_attempts
- Security tracking for login attempts
- Includes IP address, success status, timestamps

### email_verifications
- Email verification tokens and status
- Links to users table for verification workflow

### password_reset_tokens
- Password reset tokens for account recovery
- Includes expiration and usage tracking

## Key Features

### 1. Authentication & Security
- Argon2 password hashing
- Login attempt tracking and IP lockout
- Email verification system
- Admin user management

### 2. Contact Management
- Contact form submissions
- Email notifications
- Admin dashboard for managing contacts

### 3. User Management
- User registration and profile management
- Admin panel for user administration
- Account activation/deactivation

### 4. Analytics Ready
- Player data analytics infrastructure
- Admin dashboard with statistics
- Blue team vs red team mode support

## Migration Benefits

1. **Scalability**: PostgreSQL handles concurrent users better than SQLite
2. **Reliability**: Supabase provides automatic backups and high availability
3. **Real-time**: Supabase supports real-time subscriptions (future enhancement)
4. **Security**: Row Level Security (RLS) policies for data protection
5. **Performance**: Better indexing and query optimization
6. **Production Ready**: No file-based database limitations

## Development Notes

### Error Handling
All database operations now use try-catch blocks with `DatabaseError` exceptions for consistent error handling.

### Pagination
Pagination is implemented using Supabase's `range()` method instead of SQLAlchemy's pagination.

### Relationships
Foreign key relationships are maintained in the database schema but handled manually in the application code.

### Transaction Management
Supabase handles transactions automatically for single operations. Complex operations may need manual transaction handling.

## Troubleshooting

### Common Issues

1. **Connection Issues**: Verify SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are correct
2. **Table Not Found**: Ensure the schema script was run successfully
3. **Permission Errors**: Check Row Level Security policies if enabled
4. **Performance**: Add appropriate indexes for frequently queried columns

### Debugging

Enable debug logging to see Supabase operations:

```python
import logging
logging.getLogger('supabase').setLevel(logging.DEBUG)
```

## Future Enhancements

1. **Real-time Features**: Implement real-time notifications using Supabase subscriptions
2. **File Storage**: Use Supabase Storage for user uploads
3. **Advanced Analytics**: Leverage PostgreSQL's analytical capabilities
4. **Caching**: Implement Redis caching for frequently accessed data
5. **Supabase Auth**: Consider migrating to Supabase Auth for enhanced security

## Support

For issues related to this migration, check:

1. Supabase documentation: [https://supabase.com/docs](https://supabase.com/docs)
2. PostgreSQL documentation for advanced queries
3. Application logs for specific error messages

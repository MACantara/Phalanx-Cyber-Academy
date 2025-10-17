# Phalanx Cyber Academy - System Modules Documentation

**Train. Coordinate. Defend.**

This document provides a comprehensive overview of all modules, features, and components within the Phalanx Cyber Academy platform.

---

## Table of Contents

1. [Core Application Modules](#core-application-modules)
2. [Authentication & User Management](#authentication--user-management)
3. [Learning & Gamification Modules](#learning--gamification-modules)
4. [Admin Panel Modules](#admin-panel-modules)
5. [API Endpoints](#api-endpoints)
6. [Cybersecurity Learning Levels](#cybersecurity-learning-levels)
7. [Database Models](#database-models)
8. [Utility Modules](#utility-modules)
9. [Frontend Components](#frontend-components)
10. [System Test Plans Coverage](#system-test-plans-coverage)

---

## Core Application Modules

### Main Application (`app/__init__.py`)
- **Factory Pattern**: Flask application factory with environment-based configuration
- **Extensions Initialization**: Mail, Login Manager, CSRF Protection
- **Error Handlers**: Comprehensive HTTP error handling (400, 401, 403, 404, 405, 408, 413, 429, 500, 502, 503, 504)
- **Template Filters**: Custom Jinja2 filters for formatting
- **Context Processors**: Global template context injection

### Main Routes (`app/routes/main.py`)
- **Blueprint**: `main_bp`
- **Routes**:
  - `/` - Home page
  - `/about` - About Phalanx Cyber Academy
  - `/contact` - Contact page

---

## Authentication & User Management

### Authentication System (`app/routes/auth.py`)
- **Blueprint**: `auth_bp` (URL prefix: `/auth`)
- **Features**:
  - User registration with email verification
  - Passwordless login with email verification codes
  - Email verification system
  - Account lockout protection (5 failed attempts = 15-minute lockout)
  - Session management

**Routes**:
- `/auth/signup` - User registration
- `/auth/login` - Passwordless login (email code verification)
- `/auth/verify-code` - Verify login code
- `/auth/logout` - User logout
- `/auth/verification-pending` - Email verification pending page
- `/auth/verify-email/<token>` - Email verification endpoint

### User Profile Management (`app/routes/profile.py`)
- **Blueprint**: `profile_bp` (URL prefix: `/profile`)
- **Features**:
  - User profile viewing
  - Profile editing
  - User dashboard with progress tracking
  - Timezone preferences

**Routes**:
- `/profile` - View user profile
- `/profile/edit` - Edit user profile
- `/profile/dashboard` - User learning dashboard

### Login Attempts Tracking (`app/routes/login_attempts.py`)
- **Blueprint**: `login_attempts_bp`
- **Features**:
  - IP-based login attempt tracking
  - Failed login monitoring
  - Account lockout enforcement

---

## Learning & Gamification Modules

### Cybersecurity Levels (`app/routes/levels.py`)
- **Blueprint**: `levels_bp` (URL prefix: `/levels`)
- **Features**:
  - 5 progressive cybersecurity learning levels
  - Level unlocking based on completion
  - Session tracking
  - Progress monitoring
  - XP rewards system

**Routes**:
- `/levels` - Levels overview page
- `/levels/<int:level_id>/start` - Start specific level
- `/levels/<int:level_id>/complete` - Mark level as complete
- `/api/level/<int:level_id>/statistics` - Get level statistics

### Cybersecurity Levels Detail

#### Level 1: The Misinformation Maze
- **Category**: Information Literacy
- **Difficulty**: Beginner
- **XP Reward**: 100
- **Skills**: Critical Thinking, Source Verification, Fact Checking
- **Estimated Time**: 15 minutes
- **Objective**: Debunk fake news and stop misinformation from influencing an election

#### Level 2: Shadow in the Inbox
- **Category**: Email Security
- **Difficulty**: Beginner
- **XP Reward**: 150
- **Skills**: Phishing Detection, Email Analysis, Social Engineering Awareness
- **Estimated Time**: 20 minutes
- **Objective**: Spot phishing attempts and practice safe email protocols

#### Level 3: Malware Mayhem
- **Category**: Malware Detection
- **Difficulty**: Intermediate
- **XP Reward**: 200
- **Skills**: Malware Identification, System Analysis, Threat Response
- **Estimated Time**: 25 minutes
- **Objective**: Isolate infections and perform digital cleanup during a gaming tournament

#### Level 4: The White Hat Test
- **Category**: Ethical Hacking
- **Difficulty**: Advanced
- **XP Reward**: 300
- **Skills**: Penetration Testing, Vulnerability Assessment, Ethical Hacking
- **Estimated Time**: 35 minutes
- **Objective**: Practice ethical hacking and responsible vulnerability disclosure

#### Level 5: The Hunt for The Null
- **Category**: Digital Forensics
- **Difficulty**: Expert
- **XP Reward**: 500
- **Skills**: Digital Forensics, Investigation, Evidence Analysis
- **Estimated Time**: 40 minutes
- **Objective**: Use advanced digital forensics to expose The Null's identity

### XP & Progress Tracking (`app/utils/xp.py`)
- XP calculation and management
- Level progression system
- Achievement tracking
- XP history management

### Streak Tracking (`app/utils/streak_tracker.py`, `app/utils/streak_helpers.py`)
- Daily login streak tracking
- Streak maintenance and rewards
- Streak recovery mechanics

---

## Admin Panel Modules

### Admin Core (`app/routes/admin/admin_core.py`)
- **Blueprint**: `admin_bp` (URL prefix: `/admin`)
- **Features**:
  - Admin dashboard with statistics
  - User management (activate/deactivate, admin privileges)
  - User details and activity logs
  - Security monitoring

**Routes**:
- `/admin` - Admin dashboard
- `/admin/users` - User management list
- `/admin/user/<int:user_id>` - User details
- `/admin/user/<int:user_id>/toggle-active` - Toggle user active status
- `/admin/user/<int:user_id>/toggle-admin` - Toggle admin privileges

### System Logs (`app/routes/admin/logs.py`)
- **Blueprint**: `admin_logs_bp` (URL prefix: `/admin`)
- **Features**:
  - Login attempts monitoring
  - Email verification logs
  - System activity tracking
  - Log filtering and pagination

**Routes**:
- `/admin/logs` - System logs dashboard

### System Backup (`app/routes/admin/system_backup.py`)
- **Blueprint**: `system_backup_bp` (URL prefix: `/admin`)
- **Features**:
  - Database backup creation
  - Backup restoration
  - Backup scheduling
  - Backup history management

**Routes**:
- `/admin/system-backup` - Backup management page
- `/admin/backup-schedule` - Backup schedule configuration
- `/admin/backup/create` - Create new backup
- `/admin/backup/restore/<int:backup_id>` - Restore from backup

### System Test Management (`app/routes/admin/system_test.py`)
- **Blueprint**: `system_test_bp` (URL prefix: `/admin/system-test`)
- **Features**:
  - Test plan creation and management
  - Test execution and results tracking
  - Module-based test organization
  - Test reporting and analytics
  - Bulk import functionality

**Routes**:
- `/admin/system-test/` - System test dashboard
- `/admin/system-test/test-plans` - Test plans list
- `/admin/system-test/test-plans/new` - Create new test plan
- `/admin/system-test/test-plans/<int:test_plan_id>` - View test plan details
- `/admin/system-test/test-plans/<int:test_plan_id>/edit` - Edit test plan
- `/admin/system-test/test-plans/<int:test_plan_id>/execute` - Execute test plan
- `/admin/system-test/reports` - Test execution reports
- `/admin/system-test/modules/<module_name>` - Module-specific tests
- `/admin/system-test/bulk-import` - Bulk import test plans

### Player Analytics (`app/routes/admin/data_analytics.py`)
- **Blueprint**: `data_analytics_bp` (URL prefix: `/admin`)
- **Features**:
  - Player engagement metrics
  - Learning progress analytics
  - Level-specific analytics
  - Blue Team vs Red Team mode analytics
  - Retention and completion rates

**Routes**:
- `/admin/player-analytics` - Player data analytics dashboard
- `/admin/player-analytics/levels` - Level-specific analytics
- `/admin/player-analytics/blue-vs-red` - Blue vs Red mode analytics

---

## API Endpoints

### Core API (`app/routes/api.py`)
- **Blueprint**: `api_bp` (URL prefix: `/api`)
- General API utilities and endpoints

### CSRF API (`app/routes/csrf_api.py`)
- **Blueprint**: `csrf_api_bp` (URL prefix: `/api`)
- CSRF token generation and validation

### Email API (`app/routes/email_api.py`)
- **Blueprint**: `email_api_bp` (URL prefix: `/api/emails`)
- **Features**:
  - Phishing email data
  - Legitimate email data
  - Email filtering for Level 2

**Routes**:
- `/api/emails/random` - Get random mix of emails
- `/api/emails/phishing` - Get phishing emails
- `/api/emails/legitimate` - Get legitimate emails

### News API (`app/routes/news_api.py`)
- **Blueprint**: `news_api_bp` (URL prefix: `/api/news`)
- **Features**:
  - News articles for misinformation detection
  - Fake vs real news classification
  - Article filtering for Level 1

**Routes**:
- `/api/news/articles` - Get news articles
- `/api/news/articles/fake` - Get fake news articles
- `/api/news/articles/real` - Get real news articles

### Level 3 API (`app/routes/level3_api.py`)
- **Blueprint**: `level3_api_bp` (URL prefix: `/api/level3`)
- **Features**:
  - Malware data for detection exercises
  - Process monitoring data
  - System analysis scenarios

**Routes**:
- `/api/level3/malware-data` - Get malware detection data
- `/api/level3/process-data` - Get process monitoring data

### Level 4 API (`app/routes/level4_api.py`)
- **Blueprint**: `level4_api_bp` (URL prefix: `/api/level4`)
- **Features**:
  - CTF (Capture The Flag) file system data
  - Ethical hacking scenarios
  - Flag-based filtering
  - Network scanning data

**Routes**:
- `/api/level4/hosts-data` - Get CTF file system data
- `/api/level4/select-flags` - Select flags for scenario
- `/api/level4/get-selected-flags` - Get currently selected flags

### Level 5 API (`app/routes/level5_api.py`)
- **Blueprint**: `level5_api_bp` (URL prefix: `/api/level5`)
- **Features**:
  - Digital forensics scenarios
  - Evidence tracking
  - Investigation data

### XP API (`app/routes/xp_api.py`)
- **Blueprint**: `xp_api_bp` (URL prefix: `/api`)
- **Features**:
  - XP award management
  - Level progression tracking
  - XP history retrieval

**Routes**:
- `/api/award-xp` - Award XP to user
- `/api/user/xp` - Get user XP and level info

### Blue Team vs Red Team Mode (`app/routes/blue_team_vs_red_team_mode/`)
- **Blueprint**: `blue_red_bp`
- Competitive multiplayer cybersecurity mode

---

## Database Models

### User Model (`app/models/user.py`)
- **Table**: `users`
- **Fields**:
  - User credentials (username, email)
  - Profile information
  - Admin status
  - Email verification status
  - Onboarding completion
  - Timezone preferences
  - Account active status
  - Created/updated timestamps

### Session Model (`app/models/session.py`)
- **Table**: `sessions`
- **Fields**:
  - User ID
  - Level ID
  - Start time
  - End time
  - Duration
  - Completion status
  - Performance metrics

### Level Model (`app/models/level.py`)
- **Table**: `levels`
- **Fields**:
  - Level ID
  - Name
  - Description
  - Difficulty
  - XP reward
  - Icon
  - Category
  - Estimated time
  - Skills taught
  - Prerequisites

### XP History Model (`app/models/xp_history.py`)
- **Table**: `xp_history`
- **Fields**:
  - User ID
  - Amount
  - Reason/source
  - Timestamp

### Email Verification Model (`app/models/email_verification.py`)
- **Table**: `email_verifications`
- **Fields**:
  - User ID
  - Token
  - Expiration
  - Verified status
  - Created timestamp

### Login Attempt Model (`app/models/login_attempt.py`)
- **Table**: `login_attempts`
- **Fields**:
  - Username/email
  - IP address
  - Success status
  - Timestamp

### Contact Model (`app/models/contact.py`)
- **Table**: `contacts`
- **Fields**:
  - Name
  - Email
  - Subject
  - Message
  - Timestamp
  - Status

### System Test Plan Model (`app/models/system_test_plan.py`)
- **Table**: `system_test_plans`
- **Fields**:
  - Test plan number
  - Module name
  - Description
  - Procedure
  - Expected results
  - Test status
  - Priority
  - Category
  - Execution records

---

## Utility Modules

### Database (`app/database.py`)
- Supabase client initialization
- Database connection management
- Error handling

### Email Service (`app/utils/email_service.py`)
- Email sending functionality
- Template rendering for emails
- Verification email sending
- Login verification code email sending

### Timezone Utilities (`app/utils/timezone_utils.py`)
- Timezone conversion
- User timezone formatting
- DateTime formatting utilities

### Breadcrumb Utilities (`app/utils/breadcrumb_utils.py`)
- Navigation breadcrumb generation
- Context-aware breadcrumb data

### Player Analytics (`app/utils/player_analytics.py`)
- Analytics data aggregation
- Performance metrics calculation
- Learning progress analysis

---

## Frontend Components

### JavaScript Modules

#### Core
- `main.js` - Main application initialization
- `theme-initializator.js` - Theme system initialization
- `auth-state-validator.js` - Authentication state validation
- `toast.js` - Toast notification system

#### Simulated PC System
- `main.js` - SimulatedPC main controller
- `level-manager.js` - Dynamic level loading and management
- `desktop.js` - Desktop environment
- `app-manager.js` - Application management
- `dialogue-manager.js` - Dialogue system
- `file-system.js` - Virtual file system

#### Level-Specific Modules
- **Level 1**: News article analysis, fact-checking tools
- **Level 2**: Email client, phishing detection
- **Level 3**: Malware scanner, process monitor
- **Level 4**: Terminal emulator, network scanner
- **Level 5**: Evidence tracker, forensics tools

### CSS Styling
- Tailwind CSS for utility-first styling
- Custom component styles
- Dark mode support
- Responsive design

---

## System Test Plans Coverage

### Public Pages (STP-001 to STP-008)
- **STP-001**: Home Page
- **STP-002**: About Page
- **STP-003**: Contact Page
- **STP-004**: Privacy Policy Page
- **STP-005**: Terms of Service Page
- **STP-006**: Cookie Policy Page
- **STP-007**: Login Page
- **STP-008**: Sign Up Page

### User Management & Profile (STP-009 to STP-012)
- **STP-009**: Email Verification System
- **STP-010**: User Profile Page
- **STP-011**: Edit User Profile Page
- **STP-012**: User Dashboard Page

### Admin Panel (STP-013 to STP-030)
- **STP-013**: Admin Dashboard
- **STP-014**: Player Data Analytics Page
- **STP-015**: Level Analytics Page
- **STP-016**: Blue vs Red Analytics Page
- **STP-017**: User Management
- **STP-018**: User Details
- **STP-019**: System Logs
- **STP-020**: System Backup
- **STP-021**: System Backup Schedule
- **STP-022**: System Test Dashboard
- **STP-023**: Module Test Details
- **STP-024**: System Test Plans List
- **STP-025**: Test Plan Details View
- **STP-026**: Test Plan Creation Form
- **STP-027**: Edit Test Plan Form
- **STP-028**: Bulk Import Test Plans
- **STP-029**: Execute Test Plan
- **STP-030**: Test Execution Reports

### Learning Levels (STP-031 to STP-036)
- **STP-031**: Cybersecurity Levels Overview
- **STP-032**: The Misinformation Maze (Level 1)
- **STP-033**: Shadow in the Inbox (Level 2)
- **STP-034**: Malware Mayhem (Level 3)
- **STP-035**: The White Hat Test (Level 4)
- **STP-036**: The Hunt for The Null (Level 5)

### Game Modes (STP-037)
- **STP-037**: Blue Team vs Red Team Mode

---

## Technology Stack

### Backend
- **Framework**: Flask (Python)
- **Database**: Supabase (PostgreSQL)
- **ORM**: SQLAlchemy
- **Authentication**: Flask-Login
- **Email**: Flask-Mailman
- **Security**: Passwordless Authentication through Email Verification Codes, CSRF protection

### Frontend
- **CSS Framework**: Tailwind CSS
- **Icons**: Bootstrap Icons
- **JavaScript**: Vanilla ES6+ (modular)
- **Templating**: Jinja2

### Deployment
- **Serverless**: Vercel
- **Traditional**: VPS/dedicated server support
- **Database**: Supabase cloud

---

## Security Features

1. **Authentication Security**
   - Passwordless authentication via email verification codes
   - Email verification required
   - Session management with secure cookies
   - CSRF protection on all forms

2. **Account Protection**
   - IP-based login attempt tracking
   - Account lockout after 5 failed attempts
   - 15-minute lockout duration
   - Time-limited verification codes (10 minutes)

3. **Data Protection**
   - SQL injection prevention
   - XSS protection
   - HTTPS enforcement in production
   - Secure headers

4. **Admin Security**
   - Role-based access control
   - Admin-only routes protection
   - Activity logging
   - Audit trails

---

## Configuration

### Environment Variables
- `FLASK_ENV` - Application environment (development/production)
- `SECRET_KEY` - Flask secret key for sessions
- `DATABASE_URL` - Supabase database URL
- `SUPABASE_URL` - Supabase API URL
- `SUPABASE_KEY` - Supabase API key
- `MAIL_SERVER` - SMTP server
- `MAIL_PORT` - SMTP port
- `MAIL_USERNAME` - Email username
- `MAIL_PASSWORD` - Email password
- `MAX_LOGIN_ATTEMPTS` - Maximum login attempts before lockout
- `LOGIN_LOCKOUT_MINUTES` - Lockout duration in minutes

---

## File Structure

```
Phalanx-Cyber-Academy/
├── app/
│   ├── __init__.py              # Application factory
│   ├── database.py              # Database connection
│   ├── models/                  # Database models
│   ├── routes/                  # Route blueprints
│   │   ├── admin/              # Admin panel routes
│   │   ├── blue_team_vs_red_team_mode/  # Game mode
│   │   ├── auth.py             # Authentication
│   │   ├── levels.py           # Learning levels
│   │   ├── profile.py          # User profiles
│   │   ├── *_api.py            # API endpoints
│   │   └── ...
│   ├── static/                  # Static files
│   │   ├── css/                # Stylesheets
│   │   ├── js/                 # JavaScript
│   │   │   ├── simulated-pc/  # Simulated PC system
│   │   │   ├── components/    # Reusable components
│   │   │   └── utils/         # Utility functions
│   │   └── images/            # Images and assets
│   ├── templates/              # Jinja2 templates
│   │   ├── admin/             # Admin panel templates
│   │   ├── auth/              # Authentication templates
│   │   ├── levels/            # Level templates
│   │   ├── partials/          # Reusable template parts
│   │   └── ...
│   └── utils/                  # Utility modules
├── docs/                       # Documentation
│   └── system-test-plans/     # Test plan documentation
├── scripts/                    # Utility scripts
├── tests/                      # Test files
├── config.py                   # Configuration
├── run.py                      # Application entry point
├── requirements.txt            # Python dependencies
├── README.md                   # Project README
└── MODULES.md                  # This file
```

---

## Development Workflow

### Setting Up Development Environment
1. Clone repository
2. Create virtual environment
3. Install dependencies from `requirements.txt`
4. Configure environment variables in `.env`
5. Initialize database
6. Run development server

### Adding New Modules
1. Create model in `app/models/`
2. Create routes in `app/routes/`
3. Register blueprint in `app/routes/__init__.py`
4. Create templates in `app/templates/`
5. Add JavaScript if needed in `app/static/js/`
6. Create system test plans in `docs/system-test-plans/`

### Testing
- System test plans for all modules
- Manual testing procedures documented
- Automated testing framework support

---

## Future Enhancements

### Planned Features
- AI-powered adaptive difficulty
- Virtual mentors and guides
- Community forums and discussions
- Competitive tournaments
- User-generated scenarios
- Mobile application
- Advanced analytics dashboard
- Integration with learning management systems

### Roadmap
1. **Phase 1**: Core platform and 5 levels ✅
2. **Phase 2**: Admin panel and analytics ✅
3. **Phase 3**: Blue Team vs Red Team mode (In Progress)
4. **Phase 4**: AI mentoring system
5. **Phase 5**: Community features
6. **Phase 6**: Mobile platform

---

## Support and Resources

### Documentation
- User Guide: `/docs/`
- API Documentation: `/docs/api/`
- System Test Plans: `/docs/system-test-plans/`
- Deployment Guide: `/docs/deployment.md`

### Contact
- Email: Contact form in application
- GitHub: Issues and pull requests welcome
- Website: Phalanx Cyber Academy

---

**Version**: 1.0.0  
**Last Updated**: October 17, 2025  
**Maintained by**: Phalanx Cyber Academy Team

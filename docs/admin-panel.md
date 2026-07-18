# Admin Panel Documentation

This template includes a powerful admin panel for comprehensive site management.

## 🛡️ Admin Features

### User Management
- **User Overview**: View all registered users with search and filtering
- **User Actions**: Activate/deactivate users, grant/revoke admin privileges
- **User Details**: Detailed user information with activity history
- **Bulk Operations**: Manage multiple users efficiently

### System Monitoring
- **Real-time Dashboard**: Live statistics and activity monitoring
- **Security Logs**: Monitor login attempts, account lockouts, and security events
- **Email Verification Tracking**: Monitor email verification status and history
- **Contact Form Management**: View and manage contact form submissions

### Data Management
- **Automated Cleanup**: Remove old logs and expired tokens
- **Database Maintenance**: Built-in tools for system optimization
- **Backup Monitoring**: Track system health and performance

## 📊 Admin Dashboard

### Real-time Statistics
- **User Metrics**: Total users, active accounts, recent registrations
- **Activity Monitoring**: Recent login attempts, failed logins, security events
- **User Analytics**: Registration trends, verification rates, account status distribution
- **System Health**: Database status, email service status, security alerts

### Quick Actions
- **User Management**: Quick access to user creation and management
- **System Cleanup**: One-click cleanup of old data
- **Security Tools**: Immediate access to security logs and lockout management
- **Maintenance**: Database optimization and system health checks

## 🔐 Admin Access

### Default Admin Account
- **Username**: `admin`
- **Email**: `admin@example.com`
- **Authentication**: Passwordless — the first login uses an email verification code
- **⚠️ Security Warning**: Change the default admin email to a real, verified address in production!

### Security Features
- **Role-based Access**: Admin-only routes with decorator protection
- **IP-based Protection**: Integrated with the lockout system
- **Session Management**: Secure admin session handling
- **Audit Trail**: All admin actions are logged for security

## 📋 Comprehensive Logging

### Login Attempts
- **Success/Failure Tracking**: Monitor all login attempts with timestamps
- **IP Address Logging**: Track login sources for security analysis
- **User Agent Recording**: Browser/device information for forensics
- **Geographic Data**: IP-based location tracking (if configured)

### User Registrations
- **Registration Timeline**: Track new account creation patterns
- **Verification Status**: Monitor email verification completion rates
- **Source Tracking**: Identify registration sources and trends
- **Activation Monitoring**: Track account activation patterns

### Email Verifications
- **Verification Requests**: Monitor email verification attempts
- **Completion Rates**: Track successful verification statistics
- **Failed Attempts**: Identify verification issues and patterns
- **Resend Tracking**: Monitor verification email resend requests

### Contact Submissions
- **Form Submissions**: Complete contact form submission history
- **Response Tracking**: Monitor admin responses to inquiries
- **Spam Detection**: Identify potential spam or abuse patterns
- **Follow-up Management**: Track communication threads

### Automated Maintenance
- **Scheduled Cleanup**: Automatic removal of old logs (configurable retention)
- **Token Expiration**: Cleanup of expired password reset and verification tokens
- **Performance Optimization**: Regular database optimization tasks
- **Storage Management**: Monitor and manage database storage usage

## 🎯 Admin Routes

### Main Routes
- `/admin/` - Main dashboard with statistics and recent activity
- `/admin/users` - User management with advanced search and filtering
- `/admin/user/<id>` - Detailed user information and comprehensive activity history
- `/admin/logs` - System logs with powerful filtering and pagination
- `/admin/cleanup` - Database cleanup and maintenance tools

### API Endpoints
- `/admin/api/stats` - Real-time statistics API
- `/admin/api/users/search` - User search API
- `/admin/api/logs/filter` - Log filtering API
- `/admin/api/cleanup/status` - Cleanup status monitoring

## 🔧 Configuration

### Admin Settings
```python
# Admin panel configuration
ADMIN_PANEL_ENABLED = True
ADMIN_SESSION_TIMEOUT = 3600  # 1 hour
ADMIN_LOG_RETENTION_DAYS = 90
ADMIN_CLEANUP_INTERVAL = 24  # hours
```

### Security Configuration
```python
# Admin security settings
ADMIN_IP_WHITELIST = []  # Empty for no restriction
ADMIN_REQUIRE_2FA = False  # Future feature
ADMIN_AUDIT_ALL_ACTIONS = True
```

### Performance Settings
```python
# Admin panel performance
ADMIN_PAGINATION_SIZE = 50
ADMIN_MAX_SEARCH_RESULTS = 1000
ADMIN_CACHE_TIMEOUT = 300  # 5 minutes
```

## 🚀 Best Practices

### Security
1. **Set a Real Admin Email**: Update the default `admin@example.com` account to a verified, monitored email
2. **Restrict Admin Access**: Consider IP whitelisting or VPN requirements for the admin panel
3. **Monitor Access**: Regularly review admin access logs
4. **IP Restrictions**: Consider IP whitelisting for admin access
5. **Regular Audits**: Perform regular security audits

### Maintenance
1. **Regular Cleanup**: Schedule regular database cleanup
2. **Monitor Performance**: Keep an eye on dashboard performance metrics
3. **Backup Strategy**: Implement regular backup procedures
4. **Update Procedures**: Follow proper update and maintenance procedures

### User Management
1. **Regular Reviews**: Periodically review user accounts
2. **Inactive Cleanup**: Remove or deactivate inactive accounts
3. **Role Management**: Carefully manage admin role assignments
4. **Activity Monitoring**: Watch for suspicious user activity

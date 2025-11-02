# Authentication System Documentation

This template includes a complete passwordless user authentication system with advanced security features and email verification.

## 🔐 Core Authentication Features

### User Registration
- **Secure Signup**: Username and email-based registration
- **Email Verification**: Mandatory email verification before account activation
- **Passwordless Security**: No passwords to remember or store
- **Input Validation**: Comprehensive form validation and sanitization
- **Duplicate Prevention**: Prevents duplicate usernames and emails

### User Login
- **Passwordless Login**: Login via email verification codes
- **6-Digit Codes**: Time-limited verification codes sent to email
- **Remember Me**: Optional persistent login sessions
- **Session Management**: Secure session handling with configurable timeouts
- **Real-time Feedback**: Immediate feedback on login attempts
- **Graceful Handling**: User-friendly error messages and guidance

### Email Verification System
- **Mandatory Verification**: Users must verify email before accessing the system
- **Secure Tokens**: Time-limited verification tokens (24-hour expiration)
- **Verification Pending Page**: Dedicated page with clear instructions
- **Resend Functionality**: Easy verification email resending
- **Auto-refresh Checking**: Automatic verification status checking
- **Login Attempt Blocking**: Prevents login until email is verified

## 🔑 Passwordless Authentication

### Login Verification Codes
- **Email-based Authentication**: Secure login via email verification codes
- **Time-Limited Codes**: 10-minute expiration on verification codes
- **Code Validation**: Comprehensive code validation and security checks
- **User Guidance**: Clear instructions and feedback throughout the process

### Authentication Security
- **No Password Storage**: Eliminates password-related vulnerabilities
- **Code Generation**: Cryptographically secure 6-digit codes
- **Single-Use Codes**: Codes invalidated after successful verification
- **Rate Limiting**: Protection against brute force code attempts

## 🛡️ Advanced Security Features

### Account Lockout System
- **IP-based Protection**: Tracks failed attempts by IP address
- **Configurable Limits**: Customizable maximum login attempts (default: 5)
- **Lockout Duration**: Configurable lockout time (default: 15 minutes)
- **Real-time Feedback**: Shows remaining attempts and lockout countdown
- **Automatic Recovery**: Accounts unlock automatically after timeout
- **Bypass Prevention**: IP-based tracking prevents account switching circumvention

### Security Monitoring
- **Login Attempt Logging**: Comprehensive logging of all login attempts
- **User Agent Tracking**: Records browser/device information
- **IP Address Logging**: Tracks login sources for security analysis
- **Geographic Tracking**: Optional IP-based location tracking
- **Failed Attempt Analysis**: Detailed analysis of failed login patterns

### Session Security
- **HTTPOnly Cookies**: Prevents XSS attacks on session cookies
- **SameSite Protection**: CSRF protection via SameSite cookie attributes
- **Secure Cookies**: HTTPS-only cookie transmission in production
- **Session Rotation**: Automatic session ID rotation on login
- **Configurable Timeouts**: Customizable session expiration times

## 📧 Email Verification Details

### Verification Flow
1. **User Registration**: User completes registration form
2. **Account Creation**: Account created but marked as unverified
3. **Email Sent**: Verification email sent to registered address
4. **Verification Pending**: User redirected to verification pending page
5. **Email Verification**: User clicks link in email to verify
6. **Account Activation**: Account marked as verified and fully activated
7. **Login Access**: User can now log in normally

### Verification Pending Page Features
- **Dynamic Content**: Different content for registration vs login attempts
- **Clear Instructions**: Step-by-step verification process
- **Email Information**: Shows the email address that needs verification
- **Resend Functionality**: Easy verification email resending
- **Auto-refresh**: Automatic checking for verification completion
- **Navigation Options**: Clear paths to login or home page

### Email Templates
- **HTML Templates**: Rich HTML email templates for better presentation
- **Plain Text Fallback**: Plain text versions for compatibility
- **Branded Design**: Consistent branding with the main application
- **Clear CTAs**: Prominent verification links and buttons

## 🔒 Security Implementation Details

### Verification Code Generation
```python
# Secure 6-digit code generation
import secrets
verification_code = ''.join([str(secrets.randbelow(10)) for _ in range(6)])
CODE_EXPIRATION_MINUTES = 10
```

### Session Configuration
```python
# Session security settings
SESSION_COOKIE_SECURE = True  # HTTPS only
SESSION_COOKIE_HTTPONLY = True  # No JS access
SESSION_COOKIE_SAMESITE = 'Lax'  # CSRF protection
PERMANENT_SESSION_LIFETIME = timedelta(days=30)
```

### Account Lockout Configuration
```python
# Lockout settings
MAX_LOGIN_ATTEMPTS = 5
LOGIN_LOCKOUT_MINUTES = 15
LOCKOUT_CLEANUP_DAYS = 30
```

## 📧 Email Configuration

### SMTP Settings
```bash
# Gmail SMTP (recommended)
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USE_TLS=true
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
```

### Email Templates Location
- `app/templates/emails/verification_email.html`
- `app/templates/emails/verification_email.txt`
- `app/templates/emails/login_code.html`
- `app/templates/emails/login_code.txt`

## 🚀 Setup Instructions

### 1. Environment Variables
```bash
# Authentication settings
MAX_LOGIN_ATTEMPTS=5
LOGIN_LOCKOUT_MINUTES=15
PERMANENT_SESSION_LIFETIME=30

# Email settings
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USE_TLS=true
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
```

### 2. Database Migration
```bash
flask db migrate -m "Add authentication tables"
flask db upgrade
```

### 3. Create Admin User
```python
from app import create_app, db
from app.models.user import User

app = create_app()
with app.app_context():
    admin = User(username='admin', email='admin@example.com')
    admin.is_admin = True
    admin.email_verified = True
    db.session.add(admin)
    db.session.commit()
```

## 🔧 Usage Examples

### Check Authentication in Templates
```html
{% if session.user_id %}
    <!-- Authenticated user content -->
    <p>Welcome, {{ session.username }}!</p>
{% else %}
    <!-- Anonymous user content -->
    <a href="{{ url_for('auth.login') }}">Login</a>
{% endif %}
```

### Protect Routes
```python
from app.routes.auth import login_required

@app.route('/protected')
@login_required
def protected_route():
    return render_template('protected.html')
```

### Monitor Login Attempts
```python
from app.models.login_attempt import LoginAttempt

# Check if IP is locked
is_locked = LoginAttempt.is_ip_locked('192.168.1.1')

# Get failed attempt count
failed_count = LoginAttempt.get_failed_attempts_count('192.168.1.1')
```

## 🚨 Security Considerations

### Production Deployment
1. **HTTPS Required**: Always use HTTPS in production
2. **Secure Cookies**: Enable secure cookie settings
3. **Email Security**: Use app-specific passwords for Gmail
4. **Database Security**: Use proper database credentials
5. **Environment Variables**: Never commit sensitive data to version control

### Regular Maintenance
1. **Log Monitoring**: Regularly review authentication logs
2. **Failed Attempt Analysis**: Monitor for brute force attacks
3. **User Account Audits**: Regular review of user accounts
4. **Security Updates**: Keep dependencies updated
5. **Backup Strategy**: Regular backup of user data

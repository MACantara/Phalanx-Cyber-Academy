# CSRF Token Implementation for Vercel Deployment

## Overview

This document describes the CSRF (Cross-Site Request Forgery) token implementation that has been added to Phalanx Cyber Academy to ensure secure form submissions and API requests, particularly in the Vercel serverless deployment environment.

## Problem Solved

The original implementation was experiencing CSRF token validation failures when deployed to Vercel due to:

1. **Stateless serverless functions**: Each request might be handled by a different function instance
2. **Session inconsistency**: Session data wasn't being maintained consistently across requests
3. **SSL/TLS configuration issues**: CSRF protection has specific requirements for secure environments
4. **Time limit issues**: Default CSRF token expiration was too long for serverless environments

## Implementation Details

### 1. Environment-Specific Configuration

#### File: `config.py`

Added a `VercelConfig` class with serverless-optimized settings:

```python
class VercelConfig(Config):
    WTF_CSRF_ENABLED = True
    WTF_CSRF_TIME_LIMIT = 3600  # Shorter time limit for serverless
    WTF_CSRF_SSL_STRICT = False  # Vercel handles SSL termination
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'
    
    def __init__(self):
        super().__init__()
        # Ensure consistent SECRET_KEY in serverless environment
        if not self.SECRET_KEY:
            self.SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-key-change-in-production')
```

### 2. Automatic Environment Detection

#### File: `config.py`

Added automatic environment detection:

```python
def get_config():
    """Get configuration class based on environment"""
    if os.environ.get('VERCEL'):
        return VercelConfig()
    elif os.environ.get('FLASK_ENV') == 'development':
        return DevelopmentConfig()
    else:
        return ProductionConfig()
```

### 3. Enhanced Error Handling

#### File: `app/__init__.py`

Added comprehensive CSRF error handling:

```python
@app.errorhandler(400)
def handle_csrf_error(e):
    # Check if this is a CSRF error  
    if 'csrf' in str(e).lower() or 'security validation' in str(e).lower():
        app.logger.error(f"CSRF error: {e}")
        if app.config.get('IS_VERCEL'):
            app.logger.error(f"Vercel CSRF error - Headers: {dict(request.headers)}")
            app.logger.error(f"Request form: {request.form}")
            app.logger.error(f"Session: {dict(session)}")
        return "Security validation failed. Please refresh the page and try again.", 400
    return str(e), 400
```

### 4. JavaScript CSRF Utilities

#### File: `app/static/js/utils/csrf-utils.js`

Created a comprehensive JavaScript utility for handling CSRF tokens:

- **Automatic token injection**: Automatically adds CSRF tokens to all AJAX requests
- **Token refresh capability**: Can fetch fresh tokens from the server
- **jQuery integration**: Works with existing jQuery AJAX calls
- **Fetch API override**: Automatically handles modern fetch requests
- **Error recovery**: Attempts to recover from CSRF validation failures

Key features:
```javascript
// Automatic token injection for all non-GET requests
window.fetch = function(url, options = {}) {
    if (!['GET', 'HEAD', 'OPTIONS', 'TRACE'].includes(options.method?.toUpperCase())) {
        const token = csrfUtils.getToken();
        if (token) {
            options.headers = options.headers || {};
            options.headers['X-CSRFToken'] = token;
        }
    }
    return originalFetch(url, options);
};
```

### 5. CSRF Token API Endpoint

#### File: `app/routes/csrf_api.py`

Added a dedicated API endpoint for refreshing CSRF tokens:

```python
@csrf_api_bp.route('/csrf-token', methods=['GET'])
def csrf_token():
    """Endpoint to get a fresh CSRF token"""
    try:
        token = generate_csrf()
        return jsonify({
            'csrf_token': token,
            'status': 'success'
        })
    except Exception as e:
        return jsonify({
            'error': 'Failed to generate CSRF token',
            'status': 'error'
        }), 500
```

### 6. Template Integration

#### File: `app/templates/base.html`

Added CSRF token meta tag for JavaScript access:

```html
<!-- CSRF Token for JavaScript -->
<meta name="csrf-token" content="{{ csrf_token() }}">
```

## Usage

### For Forms

All existing forms already include CSRF tokens via Flask-WTF:
```html
<form method="POST">
    {{ form.hidden_tag() }}
    <!-- form fields -->
</form>
```

### For AJAX Requests

The JavaScript utility automatically handles CSRF tokens:

```javascript
// This automatically includes CSRF token
fetch('/api/endpoint', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
        'Content-Type': 'application/json'
    }
});

// Manual token access if needed
const token = csrfUtils.getToken();
```

### For Manual Token Refresh

```javascript
// Refresh token from server
await csrfUtils.refreshToken();
```

## Configuration Variables

### Environment Variables (Vercel)

Set these in your Vercel environment:

- `SECRET_KEY`: A secure random string for session encryption
- `VERCEL`: Automatically set by Vercel (used for environment detection)

### Local Development

The application will automatically use development configuration when `FLASK_ENV=development`.

## Security Considerations

1. **Token Expiration**: Vercel configuration uses shorter token expiration (1 hour vs 2 hours)
2. **SSL Handling**: Vercel handles SSL termination, so `WTF_CSRF_SSL_STRICT` is disabled
3. **Session Security**: Maintains secure session cookies with HttpOnly and SameSite protection
4. **Error Logging**: Comprehensive logging for debugging CSRF issues in production

## Testing

The implementation has been tested with:

1. **Local Development**: Full CSRF protection enabled
2. **Vercel Environment**: Serverless-optimized settings
3. **Form Submissions**: All existing forms work correctly
4. **AJAX Requests**: Automatic token injection works
5. **Token Refresh**: API endpoint for token refresh functional

## Troubleshooting

### Common Issues

1. **"CSRF token missing"**: Ensure forms include `{{ form.hidden_tag() }}`
2. **"CSRF token expired"**: Tokens expire after 1 hour in Vercel, refresh the page
3. **AJAX failures**: Ensure `csrf-utils.js` is imported and initialized

### Debug Information

CSRF errors in Vercel include debug information in logs:
- Request headers
- Form data
- Session information
- Configuration values

## Files Modified

1. `config.py` - Added VercelConfig and environment detection
2. `app/__init__.py` - Enhanced error handling and configuration loading
3. `app/routes/__init__.py` - Registered CSRF API blueprint
4. `app/routes/csrf_api.py` - New CSRF token API endpoints
5. `app/static/js/utils/csrf-utils.js` - New JavaScript CSRF utilities
6. `app/static/js/main.js` - Import and initialize CSRF utilities
7. `app/templates/base.html` - Added CSRF token meta tag

## Future Enhancements

1. **Token rotation**: Implement automatic token rotation for long-running sessions
2. **Rate limiting**: Add rate limiting to CSRF token generation endpoint
3. **Monitoring**: Add metrics for CSRF validation success/failure rates

from flask import Flask, session, request, jsonify, render_template
from flask_mailman import Mail
from config import config, get_config
from flask_login import LoginManager
from flask_wtf.csrf import CSRFProtect
import os

# Initialize extensions
mail = Mail()
login_manager = LoginManager()
csrf = CSRFProtect()

def create_app(config_name=None):
    app = Flask(__name__)
    
    # Load configuration - use get_config() for automatic environment detection
    if config_name:
        app.config.from_object(config[config_name])
    else:
        app.config.from_object(get_config())

    # Ensure URL generation configuration is set for Flask url_for with _external=True
    # Use centralized config from config.py
    app.config['SERVER_NAME'] = app.config.get('SERVER_NAME')
    app.config['APPLICATION_ROOT'] = app.config.get('APPLICATION_ROOT')
    app.config['PREFERRED_URL_SCHEME'] = app.config.get('PREFERRED_URL_SCHEME')
    app.logger.info(f"URL generation config - SERVER_NAME: {app.config.get('SERVER_NAME')}, "
                    f"APPLICATION_ROOT: {app.config.get('APPLICATION_ROOT')}, "
                    f"PREFERRED_URL_SCHEME: {app.config.get('PREFERRED_URL_SCHEME')}")

    # Initialize Supabase
    from app.database import init_supabase
    try:
        init_supabase()
        app.logger.info("Supabase client initialized successfully")
    except Exception as e:
        app.logger.error(f"Failed to initialize Supabase: {e}")
        if not app.config.get('DISABLE_DATABASE', False):
            raise  # Re-raise if database is not explicitly disabled
    
    # Initialize Flask-Mail
    mail.init_app(app)

    # Initialize Flask-Login
    login_manager.init_app(app)
    login_manager.login_view = 'auth.login'
    login_manager.login_message = 'Please log in to access this page.'
    login_manager.login_message_category = 'info'
    
    @login_manager.user_loader
    def load_user(user_id):
        from app.models.user import User
        try:
            return User.find_by_id(int(user_id))
        except Exception as e:
            app.logger.error(f"Error loading user {user_id}: {e}")
            return None

    # Initialize CSRF protection
    csrf.init_app(app)
    
    # Enhanced CSRF error handling with Vercel debugging
    from flask_wtf.csrf import ValidationError
    
    @app.errorhandler(ValidationError)
    def handle_csrf_validation_error(e):
        app.logger.error(f"CSRF ValidationError: {e}")
        if app.config.get('IS_VERCEL'):
            app.logger.error(f"Vercel CSRF debug info:")
            app.logger.error(f"  - Headers: {dict(request.headers)}")
            app.logger.error(f"  - Form data: {request.form}")
            app.logger.error(f"  - Session: {dict(session)}")
            app.logger.error(f"  - SECRET_KEY set: {bool(app.config.get('SECRET_KEY'))}")
            app.logger.error(f"  - CSRF enabled: {app.config.get('WTF_CSRF_ENABLED')}")
            app.logger.error(f"  - SSL strict: {app.config.get('WTF_CSRF_SSL_STRICT')}")
        
        return jsonify({
            'error': 'CSRF token validation failed',
            'message': 'Security validation failed. Please refresh the page and try again.',
            'debug': str(e) if app.debug else None
        }), 400
    
    @app.errorhandler(400)
    def handle_400_error(e):
        # Check if this is a CSRF-related 400 error
        error_str = str(e).lower()
        if any(term in error_str for term in ['csrf', 'security validation', 'token']):
            app.logger.error(f"400 error (CSRF-related): {e}")
            if app.config.get('IS_VERCEL'):
                app.logger.error(f"Vercel 400 debug - Method: {request.method}, Endpoint: {request.endpoint}")
            
            return jsonify({
                'error': 'Security validation failed',
                'message': 'Please refresh the page and try again.'
            }), 400
        
        # For other 400 errors, return normally
        return str(e), 400

    # Register blueprints
    from app.routes import register_blueprints
    register_blueprints(app)
    
    # Exempt specific API endpoints from CSRF protection
    from app.routes.api import check_password_strength
    csrf.exempt(check_password_strength)

    # Create default admin user if it doesn't exist (only if database is not disabled)
    with app.app_context():
        if not app.config.get('DISABLE_DATABASE', False):
            try:
                from app.models.user import User
                from app.models.email_verification import EmailVerification
                from app.database import DatabaseError
                
                # Check if admin user exists
                admin_user = User.find_by_username('admin')
                if not admin_user:
                    admin_user = User.create(
                        username='admin',
                        email='admin@example.com',
                        password='admin123'  # Change this in production!
                    )
                    admin_user.is_admin = True
                    admin_user.save()
                    
                    # Create verified email verification for admin
                    admin_verification = EmailVerification.create_verification(
                        admin_user.id,
                        admin_user.email
                    )
                    admin_verification.verify()
                    
                    app.logger.info("Default admin user created: admin/admin123 (email verified)")
                else:
                    # Ensure existing admin has verified email
                    if not EmailVerification.is_email_verified(admin_user.id, admin_user.email):
                        admin_verification = EmailVerification.create_verification(
                            admin_user.id,
                            admin_user.email
                        )
                        admin_verification.verify()
                        app.logger.info("Admin email verification created and verified")
                    
            except DatabaseError as e:
                app.logger.warning(f"Database initialization failed: {e}")
            except Exception as e:
                app.logger.warning(f"Admin user setup failed: {e}")

        # Add current year and date to template context
        @app.context_processor
        def inject_current_date():
            from datetime import datetime
            current_date = datetime.now()
            
            return {
                'current_year': current_date.year,
                'current_date': current_date,
            }
        
        # Add breadcrumb context processor
        @app.context_processor
        def inject_breadcrumb_context():
            from app.utils.breadcrumb_utils import get_breadcrumb_data
            return {
                'breadcrumb_data': get_breadcrumb_data()
            }

    # Custom Jinja2 filters
    @app.template_filter('format_module_name')
    def format_module_name(name):
        """Format module name by capitalizing and removing hyphens"""
        if not name:
            return name
        # Replace hyphens and underscores with spaces, then capitalize each word
        formatted = name.replace('-', ' ').replace('_', ' ')
        return ' '.join(word.capitalize() for word in formatted.split())

    @app.template_filter('format_display_name')
    def format_display_name(name):
        """Format session and level names by replacing hyphens with spaces"""
        if not name:
            return name
        # Replace hyphens and underscores with spaces, preserve original capitalization
        formatted = name.replace('-', ' ').replace('_', ' ')
        return formatted

    @app.template_filter('format_user_timezone')
    def format_user_timezone_filter(dt, user_timezone='UTC', format_string='%Y-%m-%d %H:%M:%S'):
        """Format datetime for user's timezone in templates"""
        if not dt:
            return ""
        
        try:
            from app.utils.timezone_utils import format_for_user_timezone
            return format_for_user_timezone(dt, user_timezone, format_string)
        except Exception as e:
            # Fallback to string representation if formatting fails
            return str(dt) if dt else ""

    @app.template_filter('format_user_timezone_with_tz')
    def format_user_timezone_with_tz_filter(dt, user_timezone='UTC'):
        """Format datetime for user's timezone with timezone abbreviation in templates"""
        if not dt:
            return ""
        
        try:
            from app.utils.timezone_utils import format_for_user_timezone_with_tz
            return format_for_user_timezone_with_tz(dt, user_timezone)
        except Exception as e:
            # Fallback to string representation if formatting fails
            return str(dt) if dt else ""

    @app.template_filter('format_duration')
    def format_duration_filter(seconds):
        """Format duration from seconds to HH:MM:SS or MM:SS format with text labels"""
        if not seconds or seconds <= 0:
            return "0s"
        
        try:
            # Convert to integer if it's a float
            total_seconds = int(seconds)
            
            hours = total_seconds // 3600
            minutes = (total_seconds % 3600) // 60
            seconds = total_seconds % 60
            
            if hours > 0:
                return f"{hours}h {minutes}m {seconds}s"
            elif minutes > 0:
                return f"{minutes}m {seconds}s"
            else:
                return f"{seconds}s"
        except (ValueError, TypeError):
            return "0s"

    @app.template_filter('format_number')
    def format_number_filter(number):
        """Format large numbers with K, M, B suffixes"""
        if not number:
            return "0"
        
        try:
            # Convert to float for calculations
            num = float(number)
            
            if abs(num) >= 1_000_000_000:  # Billions
                return f"{num / 1_000_000_000:.1f}B".rstrip('0').rstrip('.')
            elif abs(num) >= 1_000_000:  # Millions
                return f"{num / 1_000_000:.1f}M".rstrip('0').rstrip('.')
            elif abs(num) >= 1_000:  # Thousands
                return f"{num / 1_000:.1f}K".rstrip('0').rstrip('.')
            else:
                return str(int(num))  # Return as integer for smaller numbers
        except (ValueError, TypeError):
            return str(number) if number else "0"
    
    # Error handlers
    @app.errorhandler(400)
    def bad_request(error):
        return render_template('error.html', 
                             error_code=400, 
                             error_title='Bad Request'), 400
    
    @app.errorhandler(401)
    def unauthorized(error):
        return render_template('error.html', 
                             error_code=401, 
                             error_title='Unauthorized'), 401
    
    @app.errorhandler(403)
    def forbidden(error):
        return render_template('error.html', 
                             error_code=403, 
                             error_title='Forbidden'), 403
    
    @app.errorhandler(404)
    def not_found(error):
        return render_template('error.html', 
                             error_code=404, 
                             error_title='Page Not Found'), 404
    
    @app.errorhandler(405)
    def method_not_allowed(error):
        return render_template('error.html', 
                             error_code=405, 
                             error_title='Method Not Allowed'), 405
    
    @app.errorhandler(408)
    def request_timeout(error):
        return render_template('error.html', 
                             error_code=408, 
                             error_title='Request Timeout'), 408
    
    @app.errorhandler(413)
    def payload_too_large(error):
        return render_template('error.html', 
                             error_code=413, 
                             error_title='Payload Too Large'), 413
    
    @app.errorhandler(429)
    def rate_limit_exceeded(error):
        return render_template('error.html', 
                             error_code=429, 
                             error_title='Too Many Requests'), 429
    
    @app.errorhandler(500)
    def internal_server_error(error):
        app.logger.error(f'Server Error: {error}')
        return render_template('error.html', 
                             error_code=500, 
                             error_title='Internal Server Error'), 500
    
    @app.errorhandler(502)
    def bad_gateway(error):
        return render_template('error.html', 
                             error_code=502, 
                             error_title='Bad Gateway'), 502
    
    @app.errorhandler(503)
    def service_unavailable(error):
        return render_template('error.html', 
                             error_code=503, 
                             error_title='Service Unavailable'), 503
    
    @app.errorhandler(504)
    def gateway_timeout(error):
        return render_template('error.html', 
                             error_code=504, 
                             error_title='Gateway Timeout'), 504
    
    return app

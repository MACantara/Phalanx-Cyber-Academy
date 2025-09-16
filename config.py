import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Base configuration class."""
    # Check if running on Vercel
    IS_VERCEL = os.environ.get('VERCEL') == '1'
    
    # Generate a secure secret key - use a fallback string for Vercel consistency
    if IS_VERCEL:
        # For Vercel, we need a consistent SECRET_KEY across all function instances
        SECRET_KEY = os.environ.get('SECRET_KEY', 'vercel-fallback-key-change-in-production-123456789')
    else:
        # For local development, use random key if not set
        SECRET_KEY = os.environ.get('SECRET_KEY') or os.urandom(24)
    
    if IS_VERCEL:
        # In Vercel, enable database functionality with supabase credentials
        SUPABASE_URL = os.environ.get('SUPABASE_URL')
        SUPABASE_SERVICE_ROLE_KEY = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')
        SQLALCHEMY_TRACK_MODIFICATIONS = False
        DISABLE_DATABASE = False
    else:
        # Local development with SQLite and supabase
        basedir = os.path.abspath(os.path.dirname(__file__))
        SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
            'sqlite:///' + os.path.join(basedir, 'instance', 'app.db')
        SUPABASE_URL = os.environ.get('SUPABASE_URL')
        SUPABASE_SERVICE_ROLE_KEY = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')
        SQLALCHEMY_TRACK_MODIFICATIONS = False
        DISABLE_DATABASE = False
    
    # CSRF Configuration for serverless compatibility
    WTF_CSRF_ENABLED = True
    WTF_CSRF_CHECK_DEFAULT = True
    WTF_CSRF_TIME_LIMIT = 3600  # 1 hour token validity
    WTF_CSRF_SSL_STRICT = False  # Allow CSRF over HTTP for development
    
    # Email configuration (required for password reset)
    MAIL_SERVER = os.environ.get('MAIL_SERVER')
    MAIL_PORT = int(os.environ.get('MAIL_PORT') or 587)
    MAIL_USE_TLS = os.environ.get('MAIL_USE_TLS', 'true').lower() in ['true', 'on', '1']
    MAIL_USERNAME = os.environ.get('MAIL_USERNAME')
    MAIL_PASSWORD = os.environ.get('MAIL_PASSWORD')
    MAIL_DEFAULT_SENDER = os.environ.get('MAIL_DEFAULT_SENDER')
    MAIL_USE_SSL = os.environ.get('MAIL_USE_SSL', 'false').lower() in ['true', 'on', '1']
    MAIL_DEBUG = os.environ.get('MAIL_DEBUG', 'false').lower() in ['true', 'on', '1']
    MAIL_SUPPRESS_SEND = os.environ.get('MAIL_SUPPRESS_SEND', 'false').lower() in ['true', 'on', '1']
    
    # Session configuration for serverless compatibility
    PERMANENT_SESSION_LIFETIME = timedelta(days=int(os.environ.get('PERMANENT_SESSION_LIFETIME', 7)))  # Shorter for serverless
    SESSION_COOKIE_SECURE = IS_VERCEL  # True for Vercel (HTTPS), False for local dev
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'
    SESSION_COOKIE_NAME = 'cyberquest_session'
    
    # Serverless-specific session settings
    if IS_VERCEL:
        # More permissive CSRF settings for serverless
        WTF_CSRF_SSL_STRICT = False
        # Shorter session lifetime for serverless
        PERMANENT_SESSION_LIFETIME = timedelta(hours=2)
    
    # Application settings
    POSTS_PER_PAGE = int(os.environ.get('POSTS_PER_PAGE', 10))
    UPLOAD_FOLDER = os.environ.get('UPLOAD_FOLDER', 'app/static/uploads')
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file upload

    # Login security settings
    MAX_LOGIN_ATTEMPTS = int(os.environ.get('MAX_LOGIN_ATTEMPTS', 5))
    LOGIN_LOCKOUT_MINUTES = int(os.environ.get('LOGIN_LOCKOUT_MINUTES', 15))
    
    # Feature flags
    FEATURES = {
        'HCAPTCHA': True,  # Enable/disable hCaptcha globally
        'EMAIL_VERIFICATION': True,  # Enable/disable email verification
        'LOGIN_ATTEMPTS': True,  # Enable/disable login attempt tracking
        'ADMIN_PANEL': True,  # Enable/disable admin panel
    }
    
    # hCaptcha Configuration
    HCAPTCHA_ENABLED = True  # Master switch for hCaptcha
    HCAPTCHA_SITE_KEY = os.environ.get('HCAPTCHA_SITE_KEY', '')
    HCAPTCHA_SECRET_KEY = os.environ.get('HCAPTCHA_SECRET_KEY', '')

class DevelopmentConfig(Config):
    """Development configuration."""
    DEBUG = True
    TESTING = False
    
    # Development-specific CSRF settings
    WTF_CSRF_SSL_STRICT = False
    SESSION_COOKIE_SECURE = False
    
    # Override feature flags for development
    FEATURES = {
        'HCAPTCHA': False,  # Disable hCaptcha in development
        'EMAIL_VERIFICATION': True,
        'LOGIN_ATTEMPTS': True,
        'ADMIN_PANEL': True,
    }
    
    HCAPTCHA_ENABLED = False  # Disable for easier development

class ProductionConfig(Config):
    """Production configuration."""
    DEBUG = False
    TESTING = False
    
    # Production-specific CSRF settings
    WTF_CSRF_SSL_STRICT = not Config.IS_VERCEL  # Strict SSL for non-Vercel production
    WTF_CSRF_TIME_LIMIT = 7200  # 2 hours for production
    
    # Use more secure settings in production
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'
    
    # Ensure SECRET_KEY is set from environment in production
    SECRET_KEY = os.environ.get('SECRET_KEY', os.urandom(24))

class VercelConfig(ProductionConfig):
    """Vercel-specific production configuration."""
    DEBUG = False
    TESTING = False
    
    # Ensure consistent SECRET_KEY for Vercel - this is critical for CSRF
    SECRET_KEY = os.environ.get('SECRET_KEY', 'vercel-csrf-fallback-key-please-set-env-var-123456789')
    
    # Vercel-optimized CSRF settings
    WTF_CSRF_SSL_STRICT = False  # Vercel handles SSL termination
    WTF_CSRF_TIME_LIMIT = 3600  # 1 hour for serverless
    WTF_CSRF_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE']
    
    # Serverless-optimized session settings
    SESSION_COOKIE_SECURE = True  # Vercel uses HTTPS
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'
    SESSION_COOKIE_NAME = 'cyberquest_session'
    PERMANENT_SESSION_LIFETIME = timedelta(hours=2)  # Shorter for serverless
    
    # Enable database functionality with supabase credentials (for Vercel)
    DISABLE_DATABASE = False
    SUPABASE_URL = os.environ.get('SUPABASE_URL')
    SUPABASE_SERVICE_ROLE_KEY = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')
    SQLALCHEMY_TRACK_MODIFICATIONS = False

class RenderConfig(ProductionConfig):
    """Render.com-specific production configuration."""
    DEBUG = False
    TESTING = False
    
    # Production-ready settings for Render
    SECRET_KEY = os.environ.get('SECRET_KEY')
    
    # Render CSRF settings
    WTF_CSRF_SSL_STRICT = True  # Render provides proper SSL
    WTF_CSRF_TIME_LIMIT = 3600  # 1 hour
    WTF_CSRF_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE']
    
    # Render session settings
    SESSION_COOKIE_SECURE = True  # Render uses HTTPS
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'
    SESSION_COOKIE_NAME = 'cyberquest_session'
    PERMANENT_SESSION_LIFETIME = timedelta(days=7)  # Full server can handle longer sessions
    
    # Enable database functionality with supabase credentials
    DISABLE_DATABASE = False
    SUPABASE_URL = os.environ.get('SUPABASE_URL')
    SUPABASE_SERVICE_ROLE_KEY = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')
    SQLALCHEMY_TRACK_MODIFICATIONS = False

class TestingConfig(Config):
    """Testing configuration."""
    DEBUG = True
    TESTING = True
    WTF_CSRF_ENABLED = False
    DISABLE_DATABASE = False
    
    # Override feature flags for testing
    FEATURES = {
        'HCAPTCHA': False,  # Disable hCaptcha in testing
        'EMAIL_VERIFICATION': False,  # Disable email verification in testing
        'LOGIN_ATTEMPTS': False,  # Disable login attempts in testing
        'ADMIN_PANEL': True,
    }
    
    HCAPTCHA_ENABLED = False  # Disable for testing

# Configuration dictionary
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'vercel': VercelConfig,
    'render': RenderConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}

def get_config():
    """Get the appropriate configuration based on environment."""
    if os.environ.get('VERCEL') == '1':
        return VercelConfig
    elif os.environ.get('RENDER') == '1':
        return RenderConfig
    elif os.environ.get('FLASK_ENV') == 'production':
        return ProductionConfig
    elif os.environ.get('FLASK_ENV') == 'testing':
        return TestingConfig
    else:
        return DevelopmentConfig

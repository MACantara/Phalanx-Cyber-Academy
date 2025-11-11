from flask import current_app
from .main import main_bp
from .auth import auth_bp
from .contact import contact_bp
from .login_attempts import login_attempts_bp
from .profile import profile_bp
from .admin import admin_bp, data_analytics_bp, system_backup_bp, admin_logs_bp, system_test_bp
from .levels import levels_bp
from .api import api_bp
from .csrf_api import csrf_api_bp
from .news_api import news_api_bp
from .email_api import email_api_bp
from .level3_api import level3_api_bp
from .level4_api import level4_api_bp
from .level5_api import level5_api_bp
from .xp_api import xp_api_bp
from .blue_team_vs_red_team_mode import blue_team_vs_red_team as blue_red_bp
from .red_team_nlp_api import red_team_nlp_api

def register_blueprints(app):
    """Register all blueprints with the Flask app."""
    app.register_blueprint(main_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(contact_bp)
    app.register_blueprint(login_attempts_bp)
    app.register_blueprint(profile_bp)
    
    # Register admin module blueprints
    app.register_blueprint(admin_bp)
    app.register_blueprint(data_analytics_bp)
    app.register_blueprint(system_backup_bp)
    app.register_blueprint(admin_logs_bp)
    app.register_blueprint(system_test_bp)
    
    app.register_blueprint(levels_bp)
    app.register_blueprint(api_bp)
    app.register_blueprint(csrf_api_bp)
    app.register_blueprint(news_api_bp)
    app.register_blueprint(email_api_bp)
    app.register_blueprint(level3_api_bp)
    app.register_blueprint(level4_api_bp)
    app.register_blueprint(level5_api_bp)
    app.register_blueprint(xp_api_bp)
    app.register_blueprint(blue_red_bp)
    app.register_blueprint(red_team_nlp_api)  # NLP-enhanced Red Team AI API
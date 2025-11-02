from flask import Blueprint, render_template
from datetime import datetime, timedelta
from app.utils.timezone_utils import utc_now

main_bp = Blueprint('main', __name__)

def get_policy_dates():
    """Helper function to get consistent policy dates across all policy pages."""
    date_updated = datetime(2025, 11, 3)   # Date format: (YYYY, MM, DD)
    date_effective = date_updated + timedelta(days=14)  # 14 days after update
    return date_updated, date_effective

@main_bp.route('/')
def home():
    """Home page route."""
    return render_template('home.html')

@main_bp.route('/csrf-test')
def csrf_test():
    """CSRF debugging and testing page."""
    return render_template('csrf-test.html')

@main_bp.route('/about')
def about():
    """About page route."""
    return render_template('about.html')

# Policy Pages
@main_bp.route('/privacy-policy')
def privacy_policy():
    """Privacy Policy page route."""
    date_updated, date_effective = get_policy_dates()
    return render_template('policy-pages/privacy-policy.html', 
                         date_updated=date_updated, 
                         date_effective=date_effective)

@main_bp.route('/terms-of-service')
def terms_of_service():
    """Terms of Service page route."""
    date_updated, date_effective = get_policy_dates()
    return render_template('policy-pages/terms-of-service.html',
                         date_updated=date_updated,
                         date_effective=date_effective)

@main_bp.route('/cookie-policy')
def cookie_policy():
    """Cookie Policy page route."""
    date_updated, date_effective = get_policy_dates()
    return render_template('policy-pages/cookie-policy.html',
                         date_updated=date_updated,
                         date_effective=date_effective)

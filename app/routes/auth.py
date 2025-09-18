from flask import Blueprint, render_template, request, redirect, url_for, flash, current_app, jsonify
from flask_login import login_user, logout_user, login_required, current_user
from app.models.user import User
from app.models.email_verification import EmailVerification
from app.routes.login_attempts import check_ip_lockout, record_login_attempt, get_remaining_attempts, is_lockout_triggered
from app.routes.email_verification import create_and_send_verification, check_email_verification_status
from app.utils.hcaptcha_utils import verify_hcaptcha
from app.utils.password_validator import PasswordValidator
from app.utils.timezone_utils import get_timezones
from app.database import DatabaseError
from argon2.exceptions import HashingError
import re
from urllib.parse import unquote

auth_bp = Blueprint('auth', __name__, url_prefix='/auth')

def is_valid_email(email):
    """Validate email format."""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def is_valid_username(username):
    """Validate username format."""
    # Username must be 3-30 characters, alphanumeric and underscores only
    pattern = r'^[a-zA-Z0-9_]{3,30}$'
    return re.match(pattern, username) is not None

@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    # Redirect if already logged in
    if current_user.is_authenticated:
        next_page = request.args.get('next')
        return redirect(next_page if next_page else url_for('main.home'))
    
    # Handle flash messages from auth state validator - only process once
    auth_expired = request.args.get('auth_expired')
    flash_message = request.args.get('flash_message')
    flash_category = request.args.get('flash_category', 'warning')
    
    # Only show auth expired message if not already processing a POST request
    if auth_expired and request.method == 'GET':
        if flash_message:
            # Decode the URL-encoded message
            try:
                decoded_message = unquote(flash_message)
                flash(decoded_message, flash_category)
            except Exception:
                flash('Your session has expired. Please log in again to continue.', 'warning')
        else:
            flash('Your session has expired. Please log in again to continue.', 'warning')
    
    # Check if IP is locked out
    locked_out, minutes_remaining = check_ip_lockout()
    if locked_out:
        return render_template('auth/login.html', locked_out=True, minutes_remaining=minutes_remaining)
    
    if request.method == 'POST':
        username_or_email = request.form.get('username_or_email', '').strip().lower()
        password = request.form.get('password')
        remember_me = request.form.get('remember_me') == 'on'
        
        if not username_or_email or not password:
            flash('Please provide both username/email and password.', 'error')
            return render_template('auth/login.html')
        
        # Verify hCaptcha only if enabled
        from app.utils.hcaptcha_utils import is_hcaptcha_enabled
        if is_hcaptcha_enabled() and not verify_hcaptcha():
            flash('Please complete the captcha verification.', 'error')
            return render_template('auth/login.html')
        
        # Check if database is disabled (Vercel environment)
        if current_app.config.get('DISABLE_DATABASE', False):
            flash('Authentication is not available in this deployment environment.', 'warning')
            return render_template('auth/login.html')
        
        # Double-check IP lockout before processing
        locked_out, minutes_remaining = check_ip_lockout()
        if locked_out:
            return render_template('auth/login.html', locked_out=True, minutes_remaining=minutes_remaining)
        
        # Find user by username or email first
        user = User.find_by_username_or_email(username_or_email)
        
        # Check if user exists and is active
        if user and user.is_active:
            # Check email verification status FIRST before validating password
            is_verified, user_id, user_email = check_email_verification_status(user)
            if not is_verified:
                # Don't record failed login attempt - this is not an authentication failure
                # Just redirect to verification pending page
                return redirect(url_for('email_verification.verification_pending',
                                      user_id=user_id,
                                      user_email=user_email,
                                      login_attempt='true'))
            
            # Now check password only if email is verified
            if user.check_password(password):
                # Successful login - record success
                record_login_attempt(username_or_email, success=True)
                
                login_user(user, remember=remember_me)
                user.update_last_login()
                
                flash(f'Welcome back, {user.username}!', 'success')
                next_page = request.args.get('next')
                return redirect(next_page) if next_page else redirect(url_for('main.home'))
            else:
                # Wrong password - record failure
                record_login_attempt(username_or_email, success=False)
        else:
            # User doesn't exist or is inactive - record failure
            record_login_attempt(username_or_email, success=False)
        
        # Check if this failure causes a lockout
        if is_lockout_triggered():
            lockout_minutes = current_app.config.get('LOGIN_LOCKOUT_MINUTES', 15)
            return render_template('auth/login.html', locked_out=True, minutes_remaining=lockout_minutes)
        else:
            attempts_remaining = get_remaining_attempts()
            flash(f'Invalid username/email or password. {attempts_remaining} attempts remaining.', 'error')
    
    return render_template('auth/login.html')

@auth_bp.route('/signup', methods=['GET', 'POST'])
def signup():
    # Redirect if already logged in
    if current_user.is_authenticated:
        return redirect(url_for('main.home'))
    
    if request.method == 'POST':
        username = request.form.get('username', '').strip().lower()
        email = request.form.get('email', '').strip().lower()
        password = request.form.get('password')
        confirm_password = request.form.get('confirm_password')
        timezone = request.form.get('timezone', 'UTC').strip()  # Get detected timezone
        
        # Check if database is disabled (Vercel environment)
        if current_app.config.get('DISABLE_DATABASE', False):
            flash('User registration is not available in this deployment environment.', 'warning')
            return render_template('auth/signup.html')
        
        # Verify hCaptcha only if enabled
        from app.utils.hcaptcha_utils import is_hcaptcha_enabled
        if is_hcaptcha_enabled() and not verify_hcaptcha():
            flash('Please complete the captcha verification.', 'error')
            return render_template('auth/signup.html')
        
        # Validation
        errors = []
        
        if not username:
            errors.append('Username is required.')
        elif not is_valid_username(username):
            errors.append('Username must be 3-30 characters long and contain only letters, numbers, and underscores.')
        elif User.find_by_username(username):
            errors.append('Username already exists.')
        
        if not email:
            errors.append('Email is required.')
        elif not is_valid_email(email):
            errors.append('Please provide a valid email address.')
        elif User.find_by_email(email):
            errors.append('Email already registered.')
        
        if not password:
            errors.append('Password is required.')
        else:
            # Use zxcvbn validation with user inputs
            user_inputs = [username, email.split('@')[0]] if email else [username]
            is_valid, password_errors, _ = PasswordValidator.validate_password(password, user_inputs)
            if not is_valid:
                errors.extend(password_errors)
        
        if password != confirm_password:
            errors.append('Passwords do not match.')
        
        # Validate timezone - ensure it's a valid IANA timezone
        if timezone:
            try:
                valid_timezones = get_timezones()
                if timezone not in valid_timezones:
                    # If provided timezone is invalid, fall back to UTC
                    timezone = 'UTC'
                    current_app.logger.warning(f"Invalid timezone '{timezone}' provided during signup, falling back to UTC")
            except Exception as e:
                current_app.logger.warning(f"Timezone validation failed: {e}, falling back to UTC")
                timezone = 'UTC'
        else:
            timezone = 'UTC'
        
        if errors:
            for error in errors:
                flash(error, 'error')
            return render_template('auth/signup.html')
        
        try:
            # Create new user with detected timezone
            user = User.create(username=username, email=email, password=password, timezone=timezone)
            
            # Log successful timezone detection (for analytics)
            if timezone != 'UTC':
                current_app.logger.info(f"User {username} registered with timezone: {timezone}")
            
            # Create verification and send email
            verification, email_sent = create_and_send_verification(user)
            
            # Redirect to verification pending page
            if email_sent:
                return redirect(url_for('email_verification.verification_pending', 
                                      user_id=user.id, 
                                      user_email=user.email,
                                      email_sent='true'))
            else:
                return redirect(url_for('email_verification.verification_pending', 
                                      user_id=user.id, 
                                      user_email=user.email,
                                      email_sent='false'))
            
        except HashingError:
            flash('Error creating account. Please try again.', 'error')
        except DatabaseError as e:
            current_app.logger.error(f"Database error during signup: {e}")
            flash('Error creating account. Please try again.', 'error')
        except Exception as e:
            current_app.logger.error(f"Signup error: {e}")
            flash('Error creating account. Please try again.', 'error')
    
    return render_template('auth/signup.html')

@auth_bp.route('/logout')
@login_required
def logout():
    logout_user()
    flash('You have been logged out successfully.', 'success')
    return redirect(url_for('main.home'))

@auth_bp.route('/check-availability', methods=['POST'])
def check_availability():
    """Check if username or email is available."""
    try:
        data = request.get_json()
        field = data.get('field')
        value = data.get('value', '').strip().lower()
        
        if not field or not value:
            return jsonify({'error': 'Invalid request'}), 400
        
        # Check if database is disabled (Vercel environment)
        if current_app.config.get('DISABLE_DATABASE', False):
            # In disabled database mode, always return available
            return jsonify({'available': True})
        
        available = True
        
        if field == 'username':
            if not is_valid_username(value):
                available = False
            else:
                existing_user = User.find_by_username(value)
                available = existing_user is None
                
        elif field == 'email':
            if not is_valid_email(value):
                available = False
            else:
                existing_user = User.find_by_email(value)
                available = existing_user is None
        else:
            return jsonify({'error': 'Invalid field'}), 400
        
        return jsonify({'available': available})
        
    except Exception as e:
        current_app.logger.error(f"Availability check error: {e}")
        # On error, return available=true to not block user experience
        return jsonify({'available': True})

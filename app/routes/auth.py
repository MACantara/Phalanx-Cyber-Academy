from flask import Blueprint, render_template, request, redirect, url_for, flash, current_app, jsonify, session
from flask_login import login_user, logout_user, login_required, current_user
from app.models.user import User
from app.models.email_verification import EmailVerification
from app.routes.login_attempts import check_ip_lockout, record_login_attempt, get_remaining_attempts, is_lockout_triggered
from app.utils.email_service import EmailService
from app.utils.timezone_utils import get_timezones
from app.database import DatabaseError
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
        email = request.form.get('email', '').strip().lower()
        
        if not email:
            flash('Please provide your email address.', 'error')
            return render_template('auth/login.html')
        
        if not is_valid_email(email):
            flash('Please provide a valid email address.', 'error')
            return render_template('auth/login.html')
        
        # Check if database is disabled (Vercel environment)
        if current_app.config.get('DISABLE_DATABASE', False):
            flash('Authentication is not available in this deployment environment.', 'warning')
            return render_template('auth/login.html')
        
        # Double-check IP lockout before processing
        locked_out, minutes_remaining = check_ip_lockout()
        if locked_out:
            return render_template('auth/login.html', locked_out=True, minutes_remaining=minutes_remaining)
        
        # Find user by email
        user = User.find_by_email(email)
        
        if not user or not user.is_active:
            # Don't reveal if user exists - security best practice
            flash('If an account exists with this email, a verification code will be sent.', 'info')
            # Still record as failed attempt
            record_login_attempt(email, success=False)
            return render_template('auth/login.html')
        
        try:
            # Create login verification code
            verification = EmailVerification.create_verification(
                user_id=user.id,
                email=email,
                code_type='login'
            )
            
            # Send verification code email
            email_sent = EmailService.send_login_verification_code(email, verification)
            
            if email_sent:
                # Store email in session for code verification
                session['login_email'] = email
                session['verification_id'] = verification.id
                
                # Redirect to code entry page
                return redirect(url_for('auth.verify_code'))
            else:
                flash('Failed to send verification code. Please try again.', 'error')
                current_app.logger.error(f"Failed to send login code to {email}")
                
        except Exception as e:
            current_app.logger.error(f"Login error for {email}: {e}")
            flash('An error occurred. Please try again.', 'error')
    
    return render_template('auth/login.html')

@auth_bp.route('/verify-code', methods=['GET', 'POST'])
def verify_code():
    # Check if email is in session
    email = session.get('login_email')
    verification_id = session.get('verification_id')
    
    if not email or not verification_id:
        flash('Session expired. Please start login again.', 'error')
        return redirect(url_for('auth.login'))
    
    if request.method == 'POST':
        code = request.form.get('code', '').strip()
        
        if not code:
            flash('Please enter the verification code.', 'error')
            return render_template('auth/verify_code.html', email=email, code_type='login')
        
        # Check if database is disabled
        if current_app.config.get('DISABLE_DATABASE', False):
            flash('Authentication is not available in this deployment environment.', 'warning')
            return redirect(url_for('auth.login'))
        
        try:
            # Get verification by code
            verification = EmailVerification.get_by_code(email, code, 'login')
            
            if not verification:
                flash('Invalid verification code.', 'error')
                return render_template('auth/verify_code.html', email=email, code_type='login')
            
            # Check if expired
            if verification.is_expired():
                flash('Verification code has expired. Please request a new one.', 'error')
                # Clear session
                session.pop('login_email', None)
                session.pop('verification_id', None)
                return redirect(url_for('auth.login'))
            
            # Check max attempts
            if verification.is_max_attempts_reached():
                flash('Too many failed attempts. Please request a new code.', 'error')
                session.pop('login_email', None)
                session.pop('verification_id', None)
                return redirect(url_for('auth.login'))
            
            # Verify code matches
            if verification.verification_code != code:
                verification.increment_attempts()
                remaining = 5 - verification.attempts
                flash(f'Invalid code. {remaining} attempts remaining.', 'error')
                return render_template('auth/verify_code.html', email=email, code_type='login')
            
            # Mark as verified
            verification.verify()
            
            # Get user
            user = User.find_by_email(email)
            if not user:
                flash('User not found.', 'error')
                return redirect(url_for('auth.login'))
            
            # Record successful login
            record_login_attempt(email, success=True)
            
            # Log in user with persistent session
            remember_me = session.get('remember_me', True)  # Default to True for persistence
            login_user(user, remember=remember_me)
            session.permanent = True  # Make session persistent across browser restarts
            user.update_last_login()
            
            # Clear session data
            session.pop('login_email', None)
            session.pop('verification_id', None)
            session.pop('remember_me', None)
            
            # Check if user needs onboarding
            if user.needs_onboarding():
                flash('Welcome! Please complete your profile setup.', 'info')
                return redirect(url_for('auth.onboarding'))
            
            flash(f'Welcome back, {user.username}!', 'success')
            next_page = request.args.get('next')
            return redirect(next_page) if next_page else redirect(url_for('levels.levels_overview'))
            
        except Exception as e:
            current_app.logger.error(f"Code verification error: {e}")
            flash('An error occurred. Please try again.', 'error')
    
    return render_template('auth/verify_code.html', email=email, code_type='login')

@auth_bp.route('/signup', methods=['GET', 'POST'])
def signup():
    # Redirect if already logged in
    if current_user.is_authenticated:
        return redirect(url_for('main.home'))
    
    if request.method == 'POST':
        email = request.form.get('email', '').strip().lower()
        timezone = request.form.get('timezone', 'UTC').strip()  # Get detected timezone
        
        # Check if database is disabled (Vercel environment)
        if current_app.config.get('DISABLE_DATABASE', False):
            flash('User registration is not available in this deployment environment.', 'warning')
            return render_template('auth/signup.html')
        
        # Validation
        errors = []
        
        if not email:
            errors.append('Email is required.')
        elif not is_valid_email(email):
            errors.append('Please provide a valid email address.')
        elif User.find_by_email(email):
            errors.append('Email already registered. Please login instead.')
        
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
            # Create new user without username (will be set during onboarding)
            user = User.create(email=email, timezone=timezone)
            
            # Log successful timezone detection (for analytics)
            if timezone != 'UTC':
                current_app.logger.info(f"New user registered with timezone: {timezone}")
            
            # Create verification and send email
            verification = EmailVerification.create_verification(
                user_id=user.id,
                email=email,
                code_type='signup'
            )
            
            # Send verification code email
            email_sent = EmailService.send_login_verification_code(email, verification)
            
            if email_sent:
                # Store email and user_id in session
                session['signup_email'] = email
                session['signup_user_id'] = user.id
                flash('Verification code sent to your email!', 'success')
                return redirect(url_for('auth.verify_signup_code'))
            else:
                flash('Error sending verification email. Please try again.', 'error')
                current_app.logger.error(f"Failed to send signup verification to {email}")
            
        except DatabaseError as e:
            current_app.logger.error(f"Database error during signup: {e}")
            flash('Error creating account. Please try again.', 'error')
        except Exception as e:
            current_app.logger.error(f"Signup error: {e}")
            flash('Error creating account. Please try again.', 'error')
    
    return render_template('auth/signup.html')

@auth_bp.route('/verify-signup-code', methods=['GET', 'POST'])
def verify_signup_code():
    # Check if email is in session
    email = session.get('signup_email')
    user_id = session.get('signup_user_id')
    
    if not email or not user_id:
        flash('Session expired. Please start signup again.', 'error')
        return redirect(url_for('auth.signup'))
    
    if request.method == 'POST':
        code = request.form.get('code', '').strip()
        
        if not code:
            flash('Please enter the verification code.', 'error')
            return render_template('auth/verify_code.html', email=email, code_type='signup')
        
        try:
            # Get verification by code
            verification = EmailVerification.get_by_code(email, code, 'signup')
            
            if not verification:
                flash('Invalid verification code.', 'error')
                return render_template('auth/verify_code.html', email=email, code_type='signup')
            
            # Check if expired
            if verification.is_expired():
                flash('Verification code has expired. Please request a new one.', 'error')
                session.pop('signup_email', None)
                session.pop('signup_user_id', None)
                return redirect(url_for('auth.signup'))
            
            # Check max attempts
            if verification.is_max_attempts_reached():
                flash('Too many failed attempts. Please request a new code.', 'error')
                session.pop('signup_email', None)
                session.pop('signup_user_id', None)
                return redirect(url_for('auth.signup'))
            
            # Verify code matches
            if verification.verification_code != code:
                verification.increment_attempts()
                remaining = 5 - verification.attempts
                flash(f'Invalid code. {remaining} attempts remaining.', 'error')
                return render_template('auth/verify_code.html', email=email, code_type='signup')
            
            # Mark as verified
            verification.verify()
            
            # Get user and mark as verified
            user = User.find_by_id(user_id)
            if user:
                user.is_verified = True
                user.save()
            
            # Clear session data
            session.pop('signup_email', None)
            session.pop('signup_user_id', None)
            
            # Log in user with persistent session
            login_user(user, remember=True)
            session.permanent = True  # Make session persistent across browser restarts
            user.update_last_login()
            
            # Redirect to onboarding
            flash('Email verified! Please complete your profile.', 'success')
            return redirect(url_for('auth.onboarding'))
            
        except Exception as e:
            current_app.logger.error(f"Signup code verification error: {e}")
            flash('An error occurred. Please try again.', 'error')
    
    return render_template('auth/verify_code.html', email=email, code_type='signup')

@auth_bp.route('/onboarding', methods=['GET', 'POST'])
@login_required
def onboarding():
    # Check if user already completed onboarding
    if current_user.onboarding_completed and current_user.username:
        return redirect(url_for('levels.levels_overview'))
    
    if request.method == 'POST':
        username = request.form.get('username', '').strip().lower()
        experience = request.form.get('experience', '').strip()
        
        # Validation
        errors = []
        
        if not username:
            errors.append('Username is required.')
        elif not is_valid_username(username):
            errors.append('Username must be 3-30 characters long and contain only letters, numbers, and underscores.')
        elif User.find_by_username(username):
            errors.append('Username already taken. Please choose another.')
        
        if not experience or experience not in ['beginner', 'intermediate', 'advanced']:
            errors.append('Please select your cybersecurity experience level.')
        
        if errors:
            for error in errors:
                flash(error, 'error')
            return render_template('auth/onboarding.html')
        
        try:
            # Complete onboarding
            current_user.complete_onboarding(username, experience)
            
            flash(f'Welcome to Phalanx Cyber Academy, {username}! Your journey begins now.', 'success')
            return redirect(url_for('levels.levels_overview'))
            
        except Exception as e:
            current_app.logger.error(f"Onboarding error: {e}")
            flash('Error completing setup. Please try again.', 'error')
    
    return render_template('auth/onboarding.html')

@auth_bp.route('/logout')
@login_required
def logout():
    logout_user()
    session.clear()  # Explicitly clear all session data
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

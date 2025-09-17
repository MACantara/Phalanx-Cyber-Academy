from flask import Blueprint, render_template, request, redirect, url_for, flash, current_app
from flask_login import current_user
from app.models.user import User, PasswordResetToken
from app.utils.hcaptcha_utils import verify_hcaptcha
from app.utils.password_validator import PasswordValidator
from app.utils.email_service import EmailService
from app.database import DatabaseError
from argon2.exceptions import HashingError
import re

password_reset_bp = Blueprint('password_reset', __name__, url_prefix='/password')

def send_reset_email(user, token):
    """Send password reset email."""
    return EmailService.send_password_reset_email(user, token)

@password_reset_bp.route('/forgot', methods=['GET', 'POST'])
def forgot_password():
    # Redirect if already logged in
    if current_user.is_authenticated:
        return redirect(url_for('main.home'))
    
    if request.method == 'POST':
        email = request.form.get('email', '').strip().lower()
        
        if not email:
            flash('Please provide your email address.', 'error')
            return render_template('password/forgot-password.html')
        
        # Verify hCaptcha only if enabled
        from app.utils.hcaptcha_utils import is_hcaptcha_enabled
        if is_hcaptcha_enabled() and not verify_hcaptcha():
            flash('Please complete the captcha verification.', 'error')
            return render_template('password/forgot-password.html')
        
        # Check if database is disabled (Vercel environment)
        if current_app.config.get('DISABLE_DATABASE', False):
            flash('Password reset is not available in this deployment environment.', 'warning')
            return render_template('password/forgot-password.html')
        
        # Always show success message for security (don't reveal if email exists)
        flash('If an account with that email exists, we\'ve sent password reset instructions.', 'info')
        
        user = User.find_by_email(email)
        if user and user.is_active:
            try:
                token = user.generate_reset_token()
                if send_reset_email(user, token):
                    current_app.logger.info(f"Password reset email sent to {email}")
                else:
                    current_app.logger.error(f"Failed to send password reset email to {email}")
            except Exception as e:
                current_app.logger.error(f"Error generating reset token for {email}: {e}")
        
        return redirect(url_for('auth.login'))
    
    return render_template('password/forgot-password.html')

@password_reset_bp.route('/reset/<token>', methods=['GET', 'POST'])
def reset_password(token):
    # Redirect if already logged in
    if current_user.is_authenticated:
        return redirect(url_for('main.home'))
    
    # Check if database is disabled (Vercel environment)
    if current_app.config.get('DISABLE_DATABASE', False):
        flash('Password reset is not available in this deployment environment.', 'warning')
        return redirect(url_for('main.home'))
    
    reset_token = PasswordResetToken.find_valid_token(token)
    if not reset_token:
        flash('Invalid or expired reset link.', 'error')
        return redirect(url_for('password_reset.forgot-password'))
    
    if request.method == 'POST':
        password = request.form.get('password')
        confirm_password = request.form.get('confirm_password')
        
        # Verify hCaptcha only if enabled
        from app.utils.hcaptcha_utils import is_hcaptcha_enabled
        if is_hcaptcha_enabled() and not verify_hcaptcha():
            flash('Please complete the captcha verification.', 'error')
            return render_template('password/reset-password.html', token=token)
        
        errors = []
        
        if not password:
            errors.append('Password is required.')
        else:
            # Use zxcvbn validation with user context
            user = reset_token.user
            user_inputs = [user.username, user.email.split('@')[0]] if user.email else [user.username]
            is_valid, password_errors, _ = PasswordValidator.validate_password(password, user_inputs)
            if not is_valid:
                errors.extend(password_errors)
        
        if password != confirm_password:
            errors.append('Passwords do not match.')
        
        if errors:
            for error in errors:
                flash(error, 'error')
            return render_template('password/reset-password.html', token=token)
        
        try:
            # Update user password
            user = reset_token.user
            user.set_password(password)
            reset_token.use_token()
            user.save()  # Save the user with new password
            
            flash('Your password has been reset successfully! Please log in with your new password.', 'success')
            return redirect(url_for('auth.login'))
            
        except HashingError:
            flash('Error resetting password. Please try again.', 'error')
        except DatabaseError as e:
            current_app.logger.error(f"Database error during password reset: {e}")
            flash('Error resetting password. Please try again.', 'error')
        except Exception as e:
            current_app.logger.error(f"Password reset error: {e}")
            flash('Error resetting password. Please try again.', 'error')
    
    return render_template('password/reset-password.html', token=token)

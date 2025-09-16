from flask import Blueprint, render_template, request, redirect, url_for, flash, current_app
from flask_login import current_user
from flask_mailman import EmailMessage
from app import mail
from app.models.user import User, PasswordResetToken
from app.utils.hcaptcha_utils import verify_hcaptcha
from app.utils.password_validator import PasswordValidator
from app.database import DatabaseError
from argon2.exceptions import HashingError
import re

password_reset_bp = Blueprint('password_reset', __name__, url_prefix='/password')

def send_reset_email(user, token):
    """Send password reset email."""
    if not current_app.config.get('MAIL_SERVER'):
        current_app.logger.warning("Email server not configured")
        return False
    
    try:
        reset_url = url_for('password_reset.reset_password', token=token, _external=True)
        
        current_app.logger.info(f"Attempting to send password reset email to: {user.email}")
        current_app.logger.info(f"Using MAIL_SERVER: {current_app.config.get('MAIL_SERVER')}")
        current_app.logger.info(f"Using MAIL_DEFAULT_SENDER: {current_app.config.get('MAIL_DEFAULT_SENDER')}")
        
        msg = EmailMessage(
            subject='Password Reset Request - CyberQuest',
            body=f"""Hello {user.username},

You requested a password reset for your CyberQuest account.

Click the link below to reset your password:
{reset_url}

This link will expire in 1 hour.

If you didn't request this password reset, please ignore this email.

Best regards,
CyberQuest Team
""",
            from_email=current_app.config.get('MAIL_DEFAULT_SENDER'),
            to=[user.email],
            headers={
                'X-Mailer': 'CyberQuest Application',
                'X-Priority': '2',
                'Message-ID': f'<password-reset-{token}@cyberquest.app>',
                'List-Unsubscribe': '<mailto:unsubscribe@cyberquest.app>',
                'Precedence': 'bulk'
            }
        )
        
        msg.content_subtype = 'html'
        msg.body = f"""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset - CyberQuest</title>
    <style>
        body {{
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #374151;
            background: linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%);
        }}
        .container {{
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }}
        .header {{
            background: linear-gradient(135deg, #f59e0b 0%, #ef4444 50%, #dc2626 100%);
            padding: 40px 30px;
            text-align: center;
            position: relative;
            overflow: hidden;
        }}
        .header::before {{
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="20" cy="20" r="2" fill="rgba(255,255,255,0.1)"/><circle cx="80" cy="30" r="1.5" fill="rgba(255,255,255,0.1)"/><circle cx="60" cy="70" r="1" fill="rgba(255,255,255,0.1)"/></svg>');
            animation: float 6s ease-in-out infinite;
        }}
        .logo {{
            width: 64px;
            height: 64px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 50%;
            display: block;
            margin: 0 auto 16px auto;
            backdrop-filter: blur(10px);
            border: 2px solid rgba(255, 255, 255, 0.3);
            text-align: center;
            line-height: 60px;
            position: relative;
        }}
        .logo-icon {{
            font-size: 28px;
            color: white;
            display: inline-block;
            vertical-align: middle;
            line-height: normal;
        }}
        .header h1 {{
            color: white;
            margin: 0;
            font-size: 28px;
            font-weight: 700;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }}
        .header .subtitle {{
            color: rgba(255, 255, 255, 0.9);
            margin: 8px 0 0 0;
            font-size: 16px;
        }}
        .content {{
            padding: 40px 30px;
        }}
        .greeting {{
            font-size: 20px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 16px;
        }}
        .message {{
            font-size: 16px;
            color: #6b7280;
            margin-bottom: 32px;
            line-height: 1.7;
        }}
        .cta-container {{
            text-align: center;
            margin: 40px 0;
        }}
        .cta-button {{
            display: inline-block;
            background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%);
            color: white !important;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 12px;
            font-weight: 600;
            font-size: 16px;
            box-shadow: 0 10px 15px -3px rgba(245, 158, 11, 0.4), 0 4px 6px -2px rgba(245, 158, 11, 0.05);
            transition: all 0.3s ease;
            border: none;
            cursor: pointer;
        }}
        .cta-button:hover {{
            transform: translateY(-2px);
            box-shadow: 0 20px 25px -5px rgba(245, 158, 11, 0.4), 0 10px 10px -5px rgba(245, 158, 11, 0.1);
        }}
        .link-fallback {{
            background: #f3f4f6;
            border: 2px dashed #d1d5db;
            border-radius: 8px;
            padding: 16px;
            margin: 24px 0;
            font-family: 'Courier New', monospace;
            font-size: 14px;
            color: #4b5563;
            word-break: break-all;
        }}
        .security-notice {{
            background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
            border-left: 4px solid #ef4444;
            padding: 16px;
            border-radius: 8px;
            margin: 24px 0;
        }}
        .security-notice .icon {{
            display: inline-block;
            margin-right: 8px;
            font-size: 16px;
        }}
        .footer {{
            background: #f9fafb;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
        }}
        .footer-text {{
            color: #6b7280;
            font-size: 14px;
            margin: 0;
        }}
        @keyframes float {{
            0%, 100% {{ transform: translateY(0px); }}
            50% {{ transform: translateY(-10px); }}
        }}
        @media only screen and (max-width: 600px) {{
            .container {{
                margin: 10px;
                border-radius: 12px;
            }}
            .header, .content, .footer {{
                padding: 24px 20px;
            }}
            .header h1 {{
                font-size: 24px;
            }}
            .cta-button {{
                display: block;
                margin: 0 auto;
                width: 100%;
                max-width: 280px;
            }}
        }}
    </style>
</head>
<body>
    <div style="padding: 20px 0; background: linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%); min-height: 100vh;">
        <div class="container">
            <!-- Header -->
            <div class="header">
                <div class="logo">
                    <span class="logo-icon">🔐</span>
                </div>
                <h1>Password Reset Request</h1>
                <p class="subtitle">Secure Access Recovery</p>
            </div>
            
            <!-- Content -->
            <div class="content">
                <div class="greeting">Hello, <strong>{user.username}</strong>! 🔑</div>
                
                <div class="message">
                    We received a request to reset the password for your <strong>CyberQuest</strong> account. If you made this request, you can reset your password by clicking the secure button below.
                </div>
                
                <div class="message">
                    This will take you to a secure page where you can create a new password for your account.
                </div>
                
                <!-- CTA Button -->
                <div class="cta-container">
                    <a href="{reset_url}" class="cta-button">
                        🔐 Reset Your Password
                    </a>
                </div>
                
                <!-- Link Fallback -->
                <div class="link-fallback">
                    <strong>Alternative access:</strong><br>
                    If the button doesn't work, copy and paste this link:<br>
                    <a href="{reset_url}" style="color: #3b82f6;">{reset_url}</a>
                </div>
                
                <!-- Security Notice -->
                <div class="security-notice">
                    <span class="icon">⚠️</span>
                    <strong>Security Notice:</strong> This password reset link will expire in 1 hour for your protection. If you didn't request this password reset, you can safely ignore this email - your account remains secure.
                </div>
                
                <div class="message">
                    <strong>Why did you receive this email?</strong>
                    <ul style="color: #4b5563; margin-top: 12px;">
                        <li>🔒 Someone requested a password reset for your account</li>
                        <li>⏰ This link expires in 1 hour for security</li>
                        <li>🛡️ Your account is safe if you didn't request this</li>
                        <li>❓ Contact support if you have concerns</li>
                    </ul>
                </div>
            </div>
            
            <!-- Footer -->
            <div class="footer">
                <p class="footer-text">
                    Best regards,<br>
                    <strong>The CyberQuest Security Team</strong>
                </p>
                <p class="footer-text" style="margin-top: 16px; font-size: 12px;">
                    © 2025 CyberQuest. All rights reserved.
                </p>
            </div>
        </div>
    </div>
</body>
</html>
"""

        msg.send()
        current_app.logger.info(f"Password reset email sent successfully to: {user.email}")
        return True
        
    except Exception as e:
        current_app.logger.error(f"Failed to send password reset email to {user.email}: {e}")
        current_app.logger.error(f"Exception type: {type(e).__name__}")
        
        # Log more details about the error
        import traceback
        current_app.logger.error(f"Full traceback: {traceback.format_exc()}")
        
        # Check if it's an SMTP-related error
        if hasattr(e, 'smtp_code'):
            current_app.logger.error(f"SMTP error code: {e.smtp_code}")
        if hasattr(e, 'smtp_error'):
            current_app.logger.error(f"SMTP error message: {e.smtp_error}")
            
        return False

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

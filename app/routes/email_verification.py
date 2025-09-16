from flask import Blueprint, render_template, request, redirect, url_for, flash, current_app, jsonify
from flask_login import current_user
from flask_mailman import EmailMessage
from flask_wtf.csrf import validate_csrf
from app import mail
from app.models.user import User
from app.models.email_verification import EmailVerification
from app.database import DatabaseError

email_verification_bp = Blueprint('email_verification', __name__, url_prefix='/auth')

def send_verification_email(user, verification):
    """Send email verification email to user."""
    if not current_app.config.get('MAIL_SERVER'):
        current_app.logger.warning("Email server not configured for verification")
        return False
    
    try:
        verification_url = url_for('email_verification.verify_email', token=verification.token, _external=True)
        
        current_app.logger.info(f"Attempting to send verification email to: {user.email}")
        current_app.logger.info(f"Using MAIL_SERVER: {current_app.config.get('MAIL_SERVER')}")
        current_app.logger.info(f"Using MAIL_DEFAULT_SENDER: {current_app.config.get('MAIL_DEFAULT_SENDER')}")
        
        msg = EmailMessage(
            subject='Verify Your Email Address - CyberQuest',
            body=f"""Hello {user.username},

Thank you for registering with CyberQuest! To complete your registration, please verify your email address by clicking the link below:

{verification_url}

This verification link will expire in 24 hours.

If you didn't create an account, you can safely ignore this email.

Best regards,
CyberQuest Team
""",
            from_email=current_app.config.get('MAIL_DEFAULT_SENDER'),
            to=[user.email],
            headers={
                'X-Mailer': 'CyberQuest Application',
                'X-Priority': '3',
                'Message-ID': f'<verification-{verification.token}@cyberquest.app>',
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
    <title>Verify Your Email - CyberQuest</title>
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
            background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #06b6d4 100%);
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
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white !important;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 12px;
            font-weight: 600;
            font-size: 16px;
            box-shadow: 0 10px 15px -3px rgba(16, 185, 129, 0.4), 0 4px 6px -2px rgba(16, 185, 129, 0.05);
            transition: all 0.3s ease;
            border: none;
            cursor: pointer;
        }}
        .cta-button:hover {{
            transform: translateY(-2px);
            box-shadow: 0 20px 25px -5px rgba(16, 185, 129, 0.4), 0 10px 10px -5px rgba(16, 185, 129, 0.1);
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
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
            border-left: 4px solid #f59e0b;
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
                    <span class="logo-icon">🛡️</span>
                </div>
                <h1>Welcome to CyberQuest!</h1>
                <p class="subtitle">Secure Your Digital Journey</p>
            </div>
            
            <!-- Content -->
            <div class="content">
                <div class="greeting">Hello, <strong>{user.username}</strong>! 👋</div>
                
                <div class="message">
                    Thank you for joining <strong>CyberQuest</strong>! You're about to embark on an exciting journey to master cybersecurity through interactive challenges and gamified learning.
                </div>
                
                <div class="message">
                    To activate your agent credentials and begin your missions, please verify your email address by clicking the secure button below:
                </div>
                
                <!-- CTA Button -->
                <div class="cta-container">
                    <a href="{verification_url}" class="cta-button">
                        🔐 Verify Email Address
                    </a>
                </div>
                
                <!-- Link Fallback -->
                <div class="link-fallback">
                    <strong>Alternative access:</strong><br>
                    If the button doesn't work, copy and paste this link:<br>
                    <a href="{verification_url}" style="color: #3b82f6;">{verification_url}</a>
                </div>
                
                <!-- Security Notice -->
                <div class="security-notice">
                    <span class="icon">⚠️</span>
                    <strong>Security Notice:</strong> This verification link will expire in 24 hours for your protection. If you didn't create this account, you can safely ignore this email.
                </div>
                
                <div class="message">
                    Once verified, you'll gain access to:
                    <ul style="color: #4b5563; margin-top: 12px;">
                        <li>🎮 Interactive cybersecurity challenges</li>
                        <li>🏆 Achievement system and progress tracking</li>
                        <li>🛡️ Real-world security simulations</li>
                    </ul>
                </div>
            </div>
            
            <!-- Footer -->
            <div class="footer">
                <p class="footer-text">
                    Best regards,<br>
                    <strong>The CyberQuest Team</strong>
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
        current_app.logger.info(f"Verification email sent successfully to: {user.email}")
        return True
        
    except Exception as e:
        current_app.logger.error(f"Failed to send verification email to {user.email}: {e}")
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

def create_and_send_verification(user):
    """Create verification token and send email."""
    try:
        # Create verification record
        verification = EmailVerification.create_verification(user.id, user.email)
        
        # Send verification email
        email_sent = send_verification_email(user, verification)
        
        return verification, email_sent
        
    except Exception as e:
        current_app.logger.error(f"Error creating verification for user {user.id}: {e}")
        return None, False

def check_email_verification_status(user_or_identifier):
    """
    Check if a user's email is verified.
    
    Args:
        user_or_identifier: User object, user ID, or username/email string
        
    Returns:
        tuple: (is_verified, user_id, user_email) or (False, None, None) if user not found
    """
    user = None
    
    if isinstance(user_or_identifier, User):
        user = user_or_identifier
    elif isinstance(user_or_identifier, (int, str)) and str(user_or_identifier).isdigit():
        # User ID
        user = User.find_by_id(int(user_or_identifier))
    else:
        # Username or email
        user = User.find_by_username_or_email(user_or_identifier)
    
    if not user:
        return False, None, None
    
    is_verified = EmailVerification.is_email_verified(user.id, user.email)
    return is_verified, user.id, user.email

@email_verification_bp.route('/verify-email/<token>')
def verify_email(token):
    """Handle email verification."""
    verification = EmailVerification.get_by_token(token)
    
    if not verification:
        flash('Invalid verification token.', 'error')
        return redirect(url_for('auth.login'))
    
    if verification.is_expired():
        flash('Verification token has expired. Please request a new one.', 'error')
        return redirect(url_for('auth.login'))
    
    if verification.is_verified:
        flash('Email address has already been verified. You can now log in.', 'info')
        return redirect(url_for('auth.login'))
    
    # Verify the email
    verification.verify()
    flash('Email address verified successfully! You can now log in.', 'success')
    return redirect(url_for('auth.login'))

@email_verification_bp.route('/check-verification-status', methods=['POST'])
def check_verification_status():
    """Check if user's email has been verified (AJAX endpoint)."""
    data = request.get_json()
    user_id = data.get('user_id')
    user_email = data.get('user_email')
    
    if not user_id or not user_email:
        return jsonify({'verified': False, 'error': 'Invalid request'})
    
    try:
        # Check if email is verified
        is_verified = EmailVerification.is_email_verified(user_id, user_email)
        return jsonify({'verified': is_verified})
    except Exception as e:
        current_app.logger.error(f"Error checking verification status: {e}")
        return jsonify({'verified': False, 'error': 'Check failed'})

@email_verification_bp.route('/resend-verification', methods=['POST'])
def resend_verification():
    """Resend verification email."""
    try:
        # Validate CSRF token
        validate_csrf(request.form.get('csrf_token'))
    except Exception as e:
        current_app.logger.error(f"CSRF validation failed: {e}")
        flash('Invalid request. Please try again.', 'error')
        return redirect(url_for('auth.login'))
    
    user_id = request.form.get('user_id')
    user_email = request.form.get('user_email')
    
    if not user_id or not user_email:
        flash('Invalid request.', 'error')
        return redirect(url_for('auth.login'))
    
    user = User.find_by_id(user_id)
    if not user or user.email != user_email:
        flash('Invalid request.', 'error')
        return redirect(url_for('auth.login'))
    
    # Check if already verified
    if EmailVerification.is_email_verified(user.id, user.email):
        flash('Email address is already verified. You can now log in.', 'info')
        return redirect(url_for('auth.login'))
    
    # Create new verification
    verification, email_sent = create_and_send_verification(user)
    
    # Clear any existing flash messages by redirecting to a clean verification pending page
    if email_sent:
        return redirect(url_for('email_verification.verification_pending', 
                              user_id=user.id, 
                              user_email=user.email,
                              resent='true'))
    else:
        return redirect(url_for('email_verification.verification_pending', 
                              user_id=user.id, 
                              user_email=user.email,
                              resent='false'))

@email_verification_bp.route('/verification-pending', methods=['GET', 'POST']) # POST for resend verification button
def verification_pending():
    """Show verification pending page after signup."""
    user_id = request.args.get('user_id')
    user_email = request.args.get('user_email')
    email_sent = request.args.get('email_sent', 'true') == 'true'
    resent = request.args.get('resent')
    login_attempt = request.args.get('login_attempt')
    
    # Show appropriate flash message based on context
    if login_attempt == 'true':
        flash('Please verify your email address before logging in. Check your email and click the verification link.', 'warning')
    elif resent == 'true':
        flash('Verification email sent! Please check your email and click the verification link.', 'success')
    elif resent == 'false':
        flash('Could not send verification email. Please try again later.', 'error')
    elif email_sent:
        flash('Account created successfully! Please check your email and click the verification link before logging in.', 'success')
    else:
        flash('Account created successfully! However, we could not send the verification email. Please contact support.', 'warning')
    
    return render_template('auth/verification-pending.html', 
                         user_id=user_id, 
                         user_email=user_email,
                         email_sent=email_sent)

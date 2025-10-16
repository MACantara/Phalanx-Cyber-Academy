"""
Centralized Email Service for [Web Site Name] Application

This module provides a centralized email service that handles all email sending
functionality throughout the application, including templates, error handling,
and logging.
"""

import os
import traceback
from typing import List, Dict, Any, Optional, Union
from flask import current_app, url_for, render_template_string
from flask_mailman import EmailMessage


class EmailService:
    """
    Centralized email service for sending various types of emails.
    
    This service handles:
    - Email template rendering
    - SMTP configuration validation
    - Error handling and logging
    - Common email headers
    - URL generation for external links
    """
    
    @staticmethod
    def is_email_configured() -> bool:
        """Check if email is properly configured."""
        return bool(current_app.config.get('MAIL_SERVER'))
    
    @staticmethod
    def _log_email_attempt(email_type: str, recipient: str) -> None:
        """Log email sending attempt."""
        current_app.logger.info(f"Attempting to send {email_type} email to: {recipient}")
        current_app.logger.info(f"Using MAIL_SERVER: {current_app.config.get('MAIL_SERVER')}")
        current_app.logger.info(f"Using MAIL_DEFAULT_SENDER: {current_app.config.get('MAIL_DEFAULT_SENDER')}")
    
    @staticmethod
    def _log_email_success(email_type: str, recipient: str) -> None:
        """Log successful email sending."""
        current_app.logger.info(f"{email_type} email sent successfully to: {recipient}")
    
    @staticmethod
    def _log_email_error(email_type: str, recipient: str, error: Exception) -> None:
        """Log email sending error with detailed information."""
        current_app.logger.error(f"Failed to send {email_type} email to {recipient}: {error}")
        current_app.logger.error(f"Exception type: {type(error).__name__}")
        current_app.logger.error(f"Full traceback: {traceback.format_exc()}")
        
        # Check if it's an SMTP-related error
        if hasattr(error, 'smtp_code'):
            current_app.logger.error(f"SMTP error code: {error.smtp_code}")
        if hasattr(error, 'smtp_error'):
            current_app.logger.error(f"SMTP error message: {error.smtp_error}")
    
    @staticmethod
    def _load_template(template_name: str) -> str:
        """Load email template from file."""
        template_path = os.path.join(
            current_app.root_path, 
            'templates', 
            'emails', 
            template_name
        )
        
        try:
            with open(template_path, 'r', encoding='utf-8') as f:
                return f.read()
        except FileNotFoundError:
            current_app.logger.error(f"Email template not found: {template_path}")
            raise
        except Exception as e:
            current_app.logger.error(f"Error loading email template {template_path}: {e}")
            raise
    
    @staticmethod
    def _render_template(template_name: str, **context) -> str:
        """Render email template with context variables."""
        template_content = EmailService._load_template(template_name)
        return render_template_string(template_content, **context)
    
    @staticmethod
    def _ensure_url_config() -> None:
        """Ensure URL generation configuration is set."""
        current_app.config['SERVER_NAME'] = current_app.config.get('SERVER_NAME')
        current_app.config['APPLICATION_ROOT'] = current_app.config.get('APPLICATION_ROOT')
        current_app.config['PREFERRED_URL_SCHEME'] = current_app.config.get('PREFERRED_URL_SCHEME')
    
    @staticmethod
    def _create_email_message(
        subject: str,
        body: str,
        to_emails: List[str],
        from_email: Optional[str] = None,
        reply_to: Optional[List[str]] = None,
        headers: Optional[Dict[str, str]] = None
    ) -> EmailMessage:
        """Create EmailMessage instance with common configuration."""
        
        # Use default sender if not specified
        if from_email is None:
            from_email = current_app.config.get('MAIL_DEFAULT_SENDER')
        
        # Create base message
        msg = EmailMessage(
            subject=subject,
            body=body,
            from_email=from_email,
            to=to_emails,
            reply_to=reply_to
        )
        
        # Set HTML content type
        msg.content_subtype = 'html'
        
        # Add headers if provided
        if headers:
            for key, value in headers.items():
                msg.extra_headers[key] = value
        
        return msg
    
    @staticmethod
    def send_email(
        email_type: str,
        template_name: str,
        subject: str,
        to_emails: Union[str, List[str]],
        template_context: Dict[str, Any],
        from_email: Optional[str] = None,
        reply_to: Optional[Union[str, List[str]]] = None,
        headers: Optional[Dict[str, str]] = None
    ) -> bool:
        """
        Send an email using a template.
        
        Args:
            email_type: Type of email for logging (e.g., 'contact_notification')
            template_name: Name of the template file (e.g., 'contact_notification.html')
            subject: Email subject
            to_emails: Recipient email(s)
            template_context: Variables to pass to the template
            from_email: Sender email (uses default if None)
            reply_to: Reply-to email(s)
            headers: Additional email headers
            
        Returns:
            bool: True if email was sent successfully, False otherwise
        """
        
        # Check if email is configured
        if not EmailService.is_email_configured():
            current_app.logger.warning("Email server not configured")
            return False
        
        # Normalize to_emails to list
        if isinstance(to_emails, str):
            to_emails = [to_emails]
        
        # Normalize reply_to to list
        if isinstance(reply_to, str):
            reply_to = [reply_to]
        
        # Log attempt
        recipients_str = ', '.join(to_emails)
        EmailService._log_email_attempt(email_type, recipients_str)
        
        try:
            # Ensure URL configuration
            EmailService._ensure_url_config()
            
            # Render template
            body = EmailService._render_template(template_name, **template_context)
            
            # Create and send email
            msg = EmailService._create_email_message(
                subject=subject,
                body=body,
                to_emails=to_emails,
                from_email=from_email,
                reply_to=reply_to,
                headers=headers
            )
            
            msg.send()
            
            # Log success
            EmailService._log_email_success(email_type, recipients_str)
            return True
            
        except Exception as e:
            # Log error
            EmailService._log_email_error(email_type, recipients_str, e)
            return False
    
    @staticmethod
    def send_contact_notification(contact_submission) -> bool:
        """Send admin notification for contact form submission."""
        return EmailService.send_email(
            email_type='contact_notification',
            template_name='contact_notification.html',
            subject=f'[Contact Form Submission] {contact_submission.subject}',
            to_emails=[current_app.config.get('MAIL_DEFAULT_SENDER')],
            template_context={
                'contact': contact_submission
            },
            reply_to=[contact_submission.email],
            headers={
                'X-Mailer': '[Web Site Name] Application',
                'X-Priority': '2',
                'Message-ID': f'<contact-{contact_submission.id if hasattr(contact_submission, "id") else "temp"}@example.com>',
                'List-Unsubscribe': '<mailto:unsubscribe@example.com>',
                'Precedence': 'bulk'
            }
        )
    
    @staticmethod
    def send_contact_auto_reply(contact_submission) -> bool:
        """Send auto-reply to user for contact form submission."""
        return EmailService.send_email(
            email_type='contact_auto_reply',
            template_name='contact_auto_reply.html',
            subject='Thank you for contacting us - [Web Site Name]',
            to_emails=[contact_submission.email],
            template_context={
                'contact': contact_submission
            },
            headers={
                'X-Mailer': '[Web Site Name] Application',
                'X-Priority': '3',
                'Message-ID': f'<contact-reply-{contact_submission.id if hasattr(contact_submission, "id") else "temp"}@example.com>',
                'List-Unsubscribe': '<mailto:unsubscribe@example.com>',
                'Precedence': 'bulk'
            }
        )
    
    @staticmethod
    def send_password_reset_email(user, token: str) -> bool:
        """Send password reset email."""
        # Ensure URL configuration
        EmailService._ensure_url_config()
        
        # Generate reset URL
        reset_url = url_for('password_reset.reset_password', token=token, _external=True)
        
        return EmailService.send_email(
            email_type='password_reset',
            template_name='password_reset.html',
            subject='Password Reset Request - [Web Site Name]',
            to_emails=[user.email],
            template_context={
                'user': user,
                'reset_url': reset_url,
                'token': token
            },
            headers={
                'X-Mailer': '[Web Site Name] Application',
                'X-Priority': '2',
                'Message-ID': f'<password-reset-{token}@example.com>',
                'List-Unsubscribe': '<mailto:unsubscribe@example.com>',
                'Precedence': 'bulk'
            }
        )
    
    @staticmethod
    def send_email_verification(user, verification) -> bool:
        """Send email verification email."""
        # Ensure URL configuration
        EmailService._ensure_url_config()
        
        # Generate verification URL
        verification_url = url_for('email_verification.verify_email', token=verification.token, _external=True)
        
        return EmailService.send_email(
            email_type='email_verification',
            template_name='email_verification.html',
            subject='Verify Your Email Address - [Web Site Name]',
            to_emails=[user.email],
            template_context={
                'user': user,
                'verification': verification,
                'verification_url': verification_url
            },
            headers={
                'X-Mailer': '[Web Site Name] Application',
                'X-Priority': '3',
                'Message-ID': f'<verification-{verification.token}@example.com>',
                'List-Unsubscribe': '<mailto:unsubscribe@example.com>',
                'Precedence': 'bulk'
            }
        )
"""
Centralized Email Service for Phalanx Cyber Academy Application

This module provides a centralized email service that handles all email sending
functionality throughout the application, including templates, error handling,
and logging.
"""

import os
import traceback
from typing import List, Dict, Any, Optional, Union
from flask import current_app, render_template_string
from brevo import Brevo
from brevo.transactional_emails import (
    SendTransacEmailRequestSender,
    SendTransacEmailRequestToItem,
)


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
        return bool(current_app.config.get('BREVO_API_KEY') and current_app.config.get('BREVO_DEFAULT_SENDER_EMAIL'))
    
    @staticmethod
    def _log_email_attempt(email_type: str, recipient: str) -> None:
        """Log email sending attempt."""
        current_app.logger.info(f"Attempting to send {email_type} email to: {recipient}")
        current_app.logger.info(f"Using BREVO_DEFAULT_SENDER_EMAIL: {current_app.config.get('BREVO_DEFAULT_SENDER_EMAIL')}")
    
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
    def _create_email_message(
        subject: str,
        body: str,
        to_emails: List[str],
        from_email: Optional[str] = None,
        reply_to: Optional[List[str]] = None,
        headers: Optional[Dict[str, str]] = None
    ) -> Dict[str, Any]:
        """Build the payload for a Brevo transactional email."""
        # Use default sender if not specified
        if from_email is None:
            from_email = current_app.config.get('BREVO_DEFAULT_SENDER_EMAIL')
        sender_name = current_app.config.get('BREVO_DEFAULT_SENDER_NAME', 'Phalanx Cyber Academy')

        to = [SendTransacEmailRequestToItem(email=e) for e in to_emails]
        sender = SendTransacEmailRequestSender(email=from_email, name=sender_name)

        payload: Dict[str, Any] = {
            'subject': subject,
            'html_content': body,
            'sender': sender,
            'to': to,
        }

        if headers:
            payload['headers'] = headers

        if reply_to:
            reply_email = reply_to[0] if isinstance(reply_to, list) else reply_to
            payload['reply_to'] = {'email': reply_email}

        return payload
    
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

        # Suppress sending during tests or when explicitly disabled
        if current_app.config.get('BREVO_SUPPRESS_SEND'):
            current_app.logger.info(f"Suppressed {email_type} email to {to_emails}")
            return True

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
            # Render template
            body = EmailService._render_template(template_name, **template_context)

            # Build payload and send via Brevo
            payload = EmailService._create_email_message(
                subject=subject,
                body=body,
                to_emails=to_emails,
                from_email=from_email,
                reply_to=reply_to,
                headers=headers
            )

            client = Brevo(api_key=current_app.config.get('BREVO_API_KEY'))
            client.transactional_emails.send_transac_email(**payload)

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
            to_emails=[current_app.config.get('BREVO_DEFAULT_SENDER_EMAIL')],
            template_context={
                'contact': contact_submission
            },
            reply_to=[contact_submission.email],
            headers={
                'X-Mailer': 'Phalanx Cyber Academy Application',
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
            subject='Thank you for contacting us - Phalanx Cyber Academy',
            to_emails=[contact_submission.email],
            template_context={
                'contact': contact_submission
            },
            headers={
                'X-Mailer': 'Phalanx Cyber Academy Application',
                'X-Priority': '3',
                'Message-ID': f'<contact-reply-{contact_submission.id if hasattr(contact_submission, "id") else "temp"}@example.com>',
                'List-Unsubscribe': '<mailto:unsubscribe@example.com>',
                'Precedence': 'bulk'
            }
        )
    
    @staticmethod
    def send_login_verification_code(email: str, verification) -> bool:
        """Send login verification code email."""
        return EmailService.send_email(
            email_type='login_verification',
            template_name='login_verification.html',
            subject='Your Login Verification Code - Phalanx Cyber Academy',
            to_emails=[email],
            template_context={
                'email': email,
                'verification_code': verification.verification_code,
                'expires_minutes': 15
            },
            headers={
                'X-Mailer': 'Phalanx Cyber Academy Application',
                'X-Priority': '1',
                'Message-ID': f'<login-verification-{verification.token}@phalanxcyberacademy.com>',
                'Precedence': 'bulk'
            }
        )
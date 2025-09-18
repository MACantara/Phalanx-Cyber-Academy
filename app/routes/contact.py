from flask import Blueprint, render_template, request, redirect, url_for, flash, current_app
from app.models.contact import Contact
from app.utils.hcaptcha_utils import verify_hcaptcha
from app.utils.email_service import EmailService
from app.database import DatabaseError
from app.utils.timezone_utils import utc_now
import re

contact_bp = Blueprint('contact', __name__)

def is_valid_email(email):
    """Validate email format."""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def send_contact_notification(contact_submission):
    """Send email notification for new contact form submission."""
    # Send admin notification
    admin_sent = EmailService.send_contact_notification(contact_submission)
    
    # Send user auto-reply
    user_sent = EmailService.send_contact_auto_reply(contact_submission)
    
    # Return True if at least one email was sent successfully
    return admin_sent or user_sent

@contact_bp.route('/contact', methods=['GET', 'POST'])
def contact_page():
    """Contact page with form handling."""
    if request.method == 'POST':
        name = request.form.get('name', '').strip()
        email = request.form.get('email', '').strip().lower()
        subject = request.form.get('subject', '').strip()
        message = request.form.get('message', '').strip()
        
        # Verify hCaptcha only if enabled
        from app.utils.hcaptcha_utils import is_hcaptcha_enabled
        if is_hcaptcha_enabled() and not verify_hcaptcha():
            flash('Please complete the captcha verification.', 'error')
            return redirect(url_for('contact.contact_page'))
        
        # Validation
        errors = []
        
        if not name or len(name) < 2:
            errors.append('Please provide a valid name (at least 2 characters).')
        elif len(name) > 100:
            errors.append('Name must be less than 100 characters.')
        
        if not email:
            errors.append('Email address is required.')
        elif not is_valid_email(email):
            errors.append('Please provide a valid email address.')
        elif len(email) > 120:
            errors.append('Email address is too long.')
        
        if not subject or len(subject) < 3:
            errors.append('Please provide a subject (at least 3 characters).')
        elif len(subject) > 200:
            errors.append('Subject must be less than 200 characters.')
        
        if not message or len(message) < 10:
            errors.append('Please provide a message (at least 10 characters).')
        elif len(message) > 2000:
            errors.append('Message must be less than 2000 characters.')
        
        if errors:
            for error in errors:
                flash(error, 'error')
            return redirect(url_for('contact.contact_page'))
        
        # Check if database is disabled (Vercel environment)
        if current_app.config.get('DISABLE_DATABASE', False):
            # Log the submission instead of saving to database
            current_app.logger.info(f"Contact form submission (DB disabled): {name} <{email}> - {subject}")
            flash('Thank you for your message! We have received your inquiry and will get back to you soon.', 'success')
            
            # Still try to send email notification if configured
            if EmailService.is_email_configured():
                try:
                    # Create a temporary contact object for email
                    temp_contact = type('Contact', (), {
                        'name': name,
                        'email': email,
                        'subject': subject,
                        'message': message,
                        'created_at': utc_now()
                    })()
                    send_contact_notification(temp_contact)
                except Exception as e:
                    current_app.logger.error(f"Failed to send email in Vercel mode: {e}")
            
            return redirect(url_for('contact.contact_page'))
        
        try:
            # Save to database
            contact_submission = Contact.create(
                name=name,
                email=email,
                subject=subject,
                message=message
            )
            
            # Send email notifications
            email_sent = send_contact_notification(contact_submission)
            
            if email_sent:
                flash('Thank you for your message! We have received your inquiry and sent you a confirmation email.', 'success')
            else:
                flash('Thank you for your message! We have received your inquiry and will get back to you soon.', 'success')
            
            current_app.logger.info(f"Contact form submission saved: {name} <{email}> - {subject}")
            return redirect(url_for('contact.contact_page'))
            
        except DatabaseError as e:
            current_app.logger.error(f"Database error during contact submission: {e}")
            flash('There was an error submitting your message. Please try again.', 'error')
            return redirect(url_for('contact.contact_page'))
        except Exception as e:
            current_app.logger.error(f"Contact form submission error: {e}")
            flash('There was an error submitting your message. Please try again.', 'error')
            return redirect(url_for('contact.contact_page'))
    
    return render_template('contact.html')

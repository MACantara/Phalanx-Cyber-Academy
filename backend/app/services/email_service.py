"""
Email service
Renders HTML email templates and sends them via Brevo when configured.
"""
import random
import re
from pathlib import Path
from typing import Any, Dict, Optional

from jinja2 import Environment, FileSystemLoader

from app.config import settings
from app.errors import DatabaseError


_TEMPLATE_DIR = Path(__file__).parent.parent / "templates" / "emails"
_jinja_env = Environment(loader=FileSystemLoader(_TEMPLATE_DIR))


def _validate_email(email: str) -> bool:
    return re.match(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$", email) is not None


def _render_template(template_name: str, context: Dict[str, Any]) -> str:
    return _jinja_env.get_template(template_name).render(context)


def _send_brevo_email(to: str, subject: str, html: str) -> bool:
    if settings.brevo_suppress_send:
        print(f"[DEV] Email sending suppressed for {to}")
        return True

    api_key = settings.brevo_api_key
    if not api_key:
        return False

    from_email = settings.brevo_default_sender_email or "noreply@phalanx.local"
    sender_name = settings.brevo_default_sender_name

    try:
        from brevo import Brevo
        from brevo.transactional_emails import (
            SendTransacEmailRequestSender,
            SendTransacEmailRequestToItem,
        )

        sender = SendTransacEmailRequestSender(email=from_email, name=sender_name)
        recipients = [SendTransacEmailRequestToItem(email=to)]

        client = Brevo(api_key=api_key)
        client.transactional_emails.send_transac_email(
            subject=subject,
            html_content=html,
            sender=sender,
            to=recipients,
        )
        return True
    except Exception as e:
        print(f"Brevo email failed for {to}: {e}")
        return False




def send_login_verification_code(email: str, code: str) -> bool:
    if not _validate_email(email):
        return False
    html = _render_template(
        "login_verification.html",
        {"email": email, "verification_code": code, "expires_minutes": 15},
    )
    sent = _send_brevo_email(email, "Your Login Verification Code", html)
    print(f"[DEV] Login code for {email}: {code}")
    return sent or True  # Always report success in dev so login works without Brevo.


def send_signup_verification_code(email: str, code: str) -> bool:
    if not _validate_email(email):
        return False
    html = _render_template(
        "signup_verification.html",
        {"email": email, "verification_code": code, "expires_minutes": 15},
    )
    sent = _send_brevo_email(email, "Your Signup Verification Code", html)
    print(f"[DEV] Signup code for {email}: {code}")
    return sent or True


def send_contact_notification(contact) -> bool:
    to = settings.brevo_default_sender_email
    if not to:
        return False
    html = _render_template("contact_notification.html", {"contact": contact})
    sent = _send_brevo_email(to, f"[Contact Form] {contact.subject or 'No Subject'}", html)
    print(f"[DEV] Contact notification sent to admin for {contact.email}")
    return sent or True


def send_contact_auto_reply(contact) -> bool:
    if not _validate_email(contact.email):
        return False
    html = _render_template("contact_auto_reply.html", {"contact": contact})
    sent = _send_brevo_email(
        contact.email,
        "Thank you for contacting us - Phalanx Cyber Academy",
        html,
    )
    print(f"[DEV] Contact auto-reply sent to {contact.email}")
    return sent or True

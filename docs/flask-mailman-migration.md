# Flask-Mailman Migration Notes

## What Changed

We've migrated from Flask-Mail to Flask-Mailman for better email handling. This provides:

- **Better Django-style email API**: More intuitive EmailMessage class
- **Improved attachment handling**: Simpler way to add attachments
- **Better template support**: Easier integration with Jinja2 templates
- **Modern email features**: Better support for HTML emails and modern email standards

## Files Updated

### 1. `app/__init__.py`
- Changed import from `flask_mail` to `flask_mailman`
- Updated Mail() initialization

### 2. `requirements.txt`
- Replaced `Flask-Mail` with `Flask-Mailman`

### 3. Email Route Files Updated:

#### `app/routes/contact.py`
- Replaced `Message` with `EmailMessage`
- Updated email creation syntax:
  - `sender=` → `from_email=`
  - `recipients=` → `to=`
  - `msg.html =` → `msg.content_subtype = 'html'; msg.body =`
  - `mail.send(msg)` → `msg.send()`

#### `app/routes/password_reset.py`
- Same updates as contact.py
- Maintained all rich HTML email templates

#### `app/routes/email_verification.py`
- Same updates as above
- Preserved beautiful verification email templates

## New Flask-Mailman Syntax

### Before (Flask-Mail):
```python
from flask_mail import Message
from app import mail

msg = Message(
    subject='Hello',
    sender='from@example.com',
    recipients=['to@example.com']
)
msg.body = 'Text content'
msg.html = '<p>HTML content</p>'
mail.send(msg)
```

### After (Flask-Mailman):
```python
from flask_mailman import EmailMessage

msg = EmailMessage(
    subject='Hello',
    body='Text content',
    from_email='from@example.com',
    to=['to@example.com']
)
msg.content_subtype = 'html'
msg.body = '<p>HTML content</p>'
msg.send()
```

## Benefits

1. **Django-like API**: More familiar for developers coming from Django
2. **Simpler syntax**: Less verbose email creation
3. **Better type hints**: Better IDE support and type checking
4. **Modern features**: Better support for modern email features
5. **Active maintenance**: Flask-Mailman is more actively maintained


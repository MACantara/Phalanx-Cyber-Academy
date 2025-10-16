# Deployment Documentation

This guide covers deployment options for the Phalanx Cyber Academy platform, including Vercel, traditional hosting, and production considerations.

## 🚀 Vercel Deployment (Serverless)

### Features in Vercel Environment
- **Serverless Function**: Runs as a Vercel serverless function
- **Automatic Database Handling**: SQLite database creation automatically disabled
- **Modified Authentication**: Authentication features adapted for serverless environment
- **Contact Form Adaptation**: Contact form logs submissions instead of database storage
- **Environment Variables**: Easy configuration via Vercel dashboard

### Quick Deploy to Vercel

1. **Prepare Repository**
   ```bash
   git clone <your-repository-url>
   cd flask-website-template
   ```

2. **Connect to Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel automatically detects the Flask application

3. **Configure Environment Variables** (Optional)
   Set in Vercel project settings:
   ```
   MAIL_SERVER=smtp.gmail.com
   MAIL_USERNAME=your-email@gmail.com
   MAIL_PASSWORD=your-app-password
   ```

4. **Deploy**
   - Click "Deploy" in Vercel
   - Access your app at `https://your-project.vercel.app`

### Vercel Configuration
The project includes `vercel.json` for proper configuration:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "run.py",
      "use": "@vercel/python"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "run.py"
    }
  ]
}
```

### Environment Detection
The application automatically detects Vercel environment:

```python
# Automatic Vercel detection
VERCEL_ENV = os.environ.get('VERCEL_ENV')
IS_VERCEL = VERCEL_ENV is not None

if IS_VERCEL:
    # Disable database features
    SQLALCHEMY_DATABASE_URI = None
    # Adapt authentication system
    # Log contact submissions instead of storing
```

## 🖥️ Traditional Hosting

### VPS/Dedicated Server Deployment

#### 1. Server Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Python and dependencies
sudo apt install python3 python3-pip python3-venv nginx supervisor -y

# Install PostgreSQL (recommended for production)
sudo apt install postgresql postgresql-contrib -y
```

#### 2. Application Setup
```bash
# Clone repository
git clone <your-repository-url>
cd flask-website-template

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
pip install gunicorn psycopg2-binary  # For PostgreSQL
```

#### 3. Database Setup (PostgreSQL)
```bash
# Create database and user
sudo -u postgres psql

postgres=# CREATE DATABASE flask_website;
postgres=# CREATE USER flask_user WITH PASSWORD 'secure_password';
postgres=# GRANT ALL PRIVILEGES ON DATABASE flask_website TO flask_user;
postgres=# \q
```

#### 4. Environment Configuration
```bash
# Create production .env file
cp .env.template .env

# Edit with production values
nano .env
```

Production `.env` example:
```bash
FLASK_ENV=production
DEBUG=False
DATABASE_URL=postgresql://flask_user:secure_password@localhost/flask_website
SECRET_KEY=your-secret-key-here

# Email configuration
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USE_TLS=true
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password

# Security settings
MAX_LOGIN_ATTEMPTS=5
LOGIN_LOCKOUT_MINUTES=15
```

#### 5. Database Migration
```bash
export FLASK_APP=run.py
flask db upgrade
```

#### 6. Gunicorn Configuration
Create `gunicorn.conf.py`:

```python
# gunicorn.conf.py
bind = "127.0.0.1:8000"
workers = 3
worker_class = "sync"
worker_connections = 1000
timeout = 30
keepalive = 2
max_requests = 1000
max_requests_jitter = 100
preload_app = True
```

#### 7. Supervisor Configuration
Create `/etc/supervisor/conf.d/flask-website.conf`:

```ini
[program:flask-website]
directory=/path/to/flask-website-template
command=/path/to/flask-website-template/venv/bin/gunicorn -c gunicorn.conf.py run:app
user=www-data
autostart=true
autorestart=true
redirect_stderr=true
stdout_logfile=/var/log/flask-website.log
```

#### 8. Nginx Configuration
Create `/etc/nginx/sites-available/flask-website`:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /static {
        alias /path/to/flask-website-template/app/static;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

#### 9. SSL Certificate (Let's Encrypt)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtain certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Shared Hosting Deployment

#### Requirements
- Python 3.7+ support
- Access to pip and virtual environments
- Database access (MySQL/PostgreSQL)
- File upload capabilities

#### Basic Setup
1. Upload files via FTP/SFTP
2. Create virtual environment in hosting control panel
3. Install dependencies via pip
4. Configure database through hosting panel
5. Set environment variables in hosting control panel

## 🔒 Production Security Checklist

### Essential Security Measures

#### 1. Environment Variables
- [ ] Never commit sensitive data to version control
- [ ] Use strong, unique secret keys
- [ ] Configure secure database credentials
- [ ] Set up proper email authentication

#### 2. HTTPS Configuration
- [ ] Obtain and install SSL certificate
- [ ] Configure HTTPS redirects
- [ ] Set secure cookie flags
- [ ] Enable HSTS headers

#### 3. Database Security
- [ ] Use strong database passwords
- [ ] Limit database user permissions
- [ ] Enable database connection encryption
- [ ] Regular database backups

#### 4. Application Security
- [ ] Change default admin credentials
- [ ] Enable rate limiting
- [ ] Configure proper CORS settings
- [ ] Set up security headers

#### 5. Server Security
- [ ] Keep server software updated
- [ ] Configure firewall rules
- [ ] Disable unnecessary services
- [ ] Set up intrusion detection

### Security Headers Configuration

#### Nginx Security Headers
```nginx
# Add to nginx server block
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
```

#### Flask Security Configuration
```python
# config.py
class ProductionConfig(Config):
    # Session security
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'
    
    # CSRF protection
    WTF_CSRF_ENABLED = True
    WTF_CSRF_TIME_LIMIT = 3600
    
    # Rate limiting
    RATELIMIT_ENABLED = True
    RATELIMIT_STORAGE_URL = 'redis://localhost:6379'
```

## 📊 Monitoring and Maintenance

### Application Monitoring

#### 1. Error Tracking
```python
# Set up error logging
import logging
from logging.handlers import RotatingFileHandler

if not app.debug:
    file_handler = RotatingFileHandler('logs/flask-website.log', maxBytes=10240, backupCount=10)
    file_handler.setFormatter(logging.Formatter(
        '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
    ))
    file_handler.setLevel(logging.INFO)
    app.logger.addHandler(file_handler)
```

#### 2. Performance Monitoring
- Monitor response times
- Track database query performance
- Monitor memory and CPU usage
- Set up alerting for critical issues

#### 3. Security Monitoring
- Monitor failed login attempts
- Track unusual access patterns
- Review security logs regularly
- Set up alerts for security events

### Backup Strategy

#### 1. Database Backups
```bash
# PostgreSQL backup script
#!/bin/bash
BACKUP_DIR="/backups/database"
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump flask_website > "$BACKUP_DIR/backup_$DATE.sql"

# Keep only last 30 days
find $BACKUP_DIR -name "backup_*.sql" -mtime +30 -delete
```

#### 2. Application Backups
```bash
# Application backup script
#!/bin/bash
BACKUP_DIR="/backups/application"
DATE=$(date +%Y%m%d_%H%M%S)
tar -czf "$BACKUP_DIR/app_backup_$DATE.tar.gz" /path/to/flask-website-template

# Keep only last 7 days
find $BACKUP_DIR -name "app_backup_*.tar.gz" -mtime +7 -delete
```

#### 3. Automated Backups
```bash
# Add to crontab
# Daily database backup at 2 AM
0 2 * * * /path/to/db-backup.sh

# Weekly application backup on Sunday at 3 AM
0 3 * * 0 /path/to/app-backup.sh
```

## 🔧 Troubleshooting

### Common Issues

#### 1. Database Connection Issues
```bash
# Check PostgreSQL service
sudo systemctl status postgresql

# Check database connectivity
psql -h localhost -U flask_user -d flask_website

# Review database logs
sudo tail -f /var/log/postgresql/postgresql-*.log
```

#### 2. Application Errors
```bash
# Check application logs
tail -f /var/log/flask-website.log

# Check Gunicorn status
sudo supervisorctl status flask-website

# Restart application
sudo supervisorctl restart flask-website
```

#### 3. Nginx Issues
```bash
# Test Nginx configuration
sudo nginx -t

# Check Nginx status
sudo systemctl status nginx

# Review Nginx logs
sudo tail -f /var/log/nginx/error.log
```

### Performance Optimization

#### 1. Database Optimization
- Create proper indexes
- Optimize query performance
- Configure connection pooling
- Regular database maintenance

#### 2. Application Optimization
- Enable compression
- Optimize static file serving
- Configure caching headers
- Use CDN for static assets

#### 3. Server Optimization
- Configure proper worker processes
- Optimize memory settings
- Enable gzip compression
- Configure keep-alive settings

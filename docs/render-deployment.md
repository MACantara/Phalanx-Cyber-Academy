# Phalanx Cyber Academy Render.com Deployment Guide

This guide will help you deploy your Phalanx Cyber Academy Flask application to Render.com.

## Prerequisites

1. A Render.com account (free tier available)
2. Your GitHub repository pushed to GitHub
3. Environment variables ready (Supabase, email credentials)

## Deployment Steps

### 1. Connect to Render

1. Go to [render.com](https://render.com) and sign in
2. Click "New +" and select "Web Service"
3. Connect your GitHub account and select your Phalanx Cyber Academy repository
4. Choose the branch you want to deploy (e.g., `main` or current branch)

### 2. Configure Service Settings

**Basic Settings:**
- **Name**: `Phalanx Cyber Academy` (or your preferred name)
- **Environment**: `Python 3`
- **Region**: Choose the closest to your users
- **Branch**: Your main branch
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `gunicorn -w 4 -b 0.0.0.0:$PORT run:app`

**Advanced Settings:**
- **Runtime**: Python 3.12 (will be auto-detected from runtime.txt)
- **Health Check Path**: `/` (optional)

### 3. Environment Variables

Add these environment variables in Render dashboard:

**Required Variables:**
```
RENDER=1
FLASK_ENV=production
SECRET_KEY=[Render will auto-generate this]
```

**Database (Supabase):**
```
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

**Email Configuration:**
```
MAIL_SERVER=your_smtp_server
MAIL_PORT=587
MAIL_USE_TLS=true
MAIL_USERNAME=your_email_username
MAIL_PASSWORD=your_email_password
```

**Optional Configuration:**
```
WTF_CSRF_TIME_LIMIT=3600
PERMANENT_SESSION_LIFETIME=30
MAX_LOGIN_ATTEMPTS=5
LOGIN_LOCKOUT_MINUTES=15
```

### 4. Deploy

1. Click "Create Web Service"
2. Render will automatically build and deploy your application
3. Monitor the build logs for any issues
4. Once deployed, you'll get a URL like `https://phalanxcyberacademy.onrender.com`

## Files Added for Render Deployment

- `render.yaml`: Render service configuration (optional, for Infrastructure as Code)
- `runtime.txt`: Specifies Python version
- `start.sh`: Custom startup script (optional)
- Updated `config.py`: Added RenderConfig class

## Key Configuration Changes

### RenderConfig Class
Added a new configuration class optimized for Render.com:
- Proper SSL/HTTPS settings
- Production-ready CSRF configuration
- Longer session timeouts (compared to serverless)
- Database integration with Supabase

### Entry Point
Your `run.py` file is already perfect as the entry point:
```python
from app import create_app
app = create_app()
if __name__ == '__main__':
    app.run(debug=app.config.get('DEBUG', True))
```

## Troubleshooting

### Common Issues:

1. **Build Failures:**
   - Check that all dependencies in `requirements.txt` are available
   - Ensure Python version compatibility

2. **Database Connection Issues:**
   - Verify Supabase credentials are correct
   - Check that Supabase allows connections from Render IPs

3. **CSRF Token Issues:**
   - Ensure `SECRET_KEY` is set and consistent
   - Check that your domain is properly configured

4. **Static Files:**
   - Render serves static files automatically from `/static`
   - No additional configuration needed for your Flask static files

### Logs and Debugging:

- Check Render logs in the dashboard
- Use `app.logger` statements in your code for debugging
- Monitor the Events tab for deployment status

## Performance Optimization

### Recommended Render Plan:
- **Starter Plan ($7/month)**: Good for low to moderate traffic
- **Standard Plan**: For higher traffic and better performance

### Gunicorn Configuration:
The start command uses optimized Gunicorn settings:
```bash
gunicorn -w 4 -b 0.0.0.0:$PORT --timeout 120 --keep-alive 2 --max-requests 1000 --max-requests-jitter 100 run:app
```

## Security Considerations

1. **Environment Variables**: Never commit sensitive data to Git
2. **HTTPS**: Render provides automatic HTTPS
3. **CSRF Protection**: Enabled and configured for production
4. **Session Security**: Secure cookies enabled for HTTPS

## Monitoring and Maintenance

1. **Health Checks**: Render automatically monitors your service
2. **Auto-deploys**: Set up automatic deployments on git push
3. **Scaling**: Render can auto-scale based on traffic
4. **Backups**: Ensure your Supabase database is backed up

## Next Steps After Deployment

1. Test all functionality on the live site
2. Configure your domain name (if you have one)
3. Set up monitoring and alerts
4. Consider CDN for better performance globally

## Support

- Render Documentation: https://render.com/docs
- Render Community: https://community.render.com
- Flask Documentation: https://flask.palletsprojects.com

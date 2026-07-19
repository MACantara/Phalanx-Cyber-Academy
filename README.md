# Phalanx Cyber Academy

**Train. Coordinate. Defend.**

Phalanx Cyber Academy is a game-based learning platform designed to enhance digital literacy, cybersecurity awareness, and ethical online behavior through interactive gamification. Players engage in realistic scenarios, earn XP, and unlock achievements to master essential digital safety skills.

## ✨ Key Features

### 🎮 Gamified Digital Literacy Training
- **🎯 Interactive Scenarios**: Mini-games and simulations covering essential digital skills
- **🏆 Achievement System**: XP, badges, and level progression for demonstrating correct online practices
- **📈 Progress Tracking**: Comprehensive dashboards showing learning advancement
- **🎪 Role-Playing**: Immersive scenarios for practical skill application


### 🛡️ Cybersecurity Awareness Simulations
- **🌐 Network Defense**: Virtual network protection from simulated cyber-attacks
- **🎣 Phishing Detection**: Interactive exercises for recognizing social engineering tactics
- **🔍 Digital Forensics**: Team-based investigation of online scams and fraud
- **💳 Safe Practice Training**: Secure online banking, email, and social media habits

###  Technical Features
- **🏗️ Modern Architecture**: Flask factory pattern with blueprints
- **🎨 Responsive Design**: Tailwind CSS with Bootstrap Icons
- **🔐 Complete Authentication**: Registration, passwordless login with email codes, email verification
- **👥 Admin Panel**: User management, system monitoring, security logs
- **🛡️ Advanced Security**: Account lockout, rate limiting, CSRF protection
- **🌓 Theme System**: Light/Dark/System modes with persistent preferences
- **📧 Email Integration**: Contact forms, login verification codes, verification emails
- **📋 Legal Compliance**: Privacy policy, terms of service, cookie policy
- **🚀 Deployment Ready**: Vercel and traditional hosting support

## 🎯 Learning Modules

### 📰 Misinformation & Fact-Checking
- Interactive exercises for identifying fake news and misinformation
- Real-world scenario practice with immediate AI feedback
- Source verification techniques and critical thinking skills

### 🎣 Phishing & Social Engineering Defense
- Realistic phishing email simulations and detection training
- Social media manipulation recognition exercises
- Phone and text-based scam identification scenarios

### 🔒 Data Privacy & Digital Citizenship
- Passwordless authentication best practices
- Privacy settings optimization across platforms
- Ethical social media behavior and digital footprint awareness

### 💰 Online Financial Security
- Secure online banking and payment practices
- E-commerce safety and fraud prevention
- Cryptocurrency and investment scam awareness

### 🏴‍☠️ Ethical Hacking Simulations
- Controlled penetration testing scenarios
- Vulnerability assessment training
- White-hat hacking principles and ethics

## 🚀 Quick Start

### 1. Clone Repository
```bash
git clone <repository-url>
cd Phalanx-Cyber-Academy
```

### 2. Create Virtual Environment
```bash
python -m venv venv
```

### 3. Activate Virtual Environment
```bash
# On Windows
venv\Scripts\activate

# On macOS/Linux
source venv/bin/activate
```

### 4. Install Dependencies
```bash
pip install -r requirements.txt
```

### 5. Configuration
```bash
# On Windows
copy .env.template .env

# On MacOS/Linux
cp .env.template .env
```

Edit .env with your settings

### 6. Initialize Database
```bash
flask db init
flask db migrate -m "Initial migration"
flask db upgrade
```

### 7. Run Application
```bash
python run.py
```

Visit `http://localhost:5000` to start your cybersecurity learning journey.

## 🚀 Run the New Stack (React + FastAPI)

The project now has a FastAPI backend in `backend/` and a React + Vite frontend in `frontend/`. You can run them together with Docker Compose or manually.

### Option 1: Docker Compose (recommended)

```bash
docker compose up --build
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000

### Option 2: Manual commands

#### Backend

```bash
cd backend

# create and activate a virtual environment
python -m venv venv
source venv/bin/activate    # On Windows: venv\Scripts\activate

# create an .env from the template
cp .env.template .env       # On Windows: copy .env.template .env
# Edit .env and set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY

# install the package and its dependencies
pip install -e .

# start the FastAPI server
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend

Open a second terminal:

```bash
cd frontend

# create an .env from the template (optional; Vite proxy already points to localhost:8000)
cp .env.template .env       # On Windows: copy .env.template .env

# install dependencies
npm install

# start the dev server
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000 (proxied through Vite)

## 🎮 How to Play

1. **Register & Verify**: Create your account and verify your email
2. **Complete Assessment**: Take the initial skills assessment for personalized learning paths
3. **Choose Your Path**: Select from beginner, intermediate, or advanced cybersecurity tracks
4. **Engage with Scenarios**: Complete interactive challenges and simulations
5. **Earn Rewards**: Gain XP, unlock achievements, and level up your cybersecurity skills
6. **Track Progress**: Monitor your advancement through comprehensive dashboards

## 📚 Documentation

### Core Documentation
- **[Authentication System](docs/authentication.md)** - Passwordless authentication with email verification
- **[Admin Panel](docs/admin-panel.md)** - User management and system monitoring
- **[Deployment Guide](docs/deployment.md)** - Vercel and production deployment

### Technical Features Overview

#### 🔐 Authentication & Security
- User registration with mandatory email verification
- Passwordless login with email verification codes
- Account lockout protection (IP-based)
- Time-limited verification codes (10 minutes)
- Session management with security headers

#### 👥 Admin Panel
- **Access**: Login via passwordless authentication with your admin email
- User management (activate/deactivate, admin privileges)
- Real-time dashboard with statistics
- Security logs and monitoring
- Automated cleanup tools
- Contact form management

#### 🛡️ Security Features
- **Account Lockout**: 5 failed attempts = 15-minute lockout (configurable)
- **Rate Limiting**: IP-based request limiting
- **CSRF Protection**: Built-in CSRF protection
- **Secure Headers**: Security headers for production

#### 📧 Email Verification System
- **Verification Pending Page**: Clear instructions and status
- **Auto-refresh**: Automatic verification status checking
- **Resend Functionality**: Easy verification email resending
- **Login Blocking**: Prevents login until email verified
- **24-hour Expiration**: Secure, time-limited tokens

#### 🌓 Theme System
- **Light Mode**: Clean, bright interface
- **Dark Mode**: Modern dark theme
- **System Mode**: Follows OS theme preference
- **Persistent Settings**: Saved in localStorage
- **Smooth Transitions**: Elegant theme switching

## 🔧 Environment Configuration

### Required Variables
```bash
# Core Settings
FLASK_ENV=development
SECRET_KEY=your-secret-key

# Database (SQLite for local dev; Supabase for Vercel)
DATABASE_URL=sqlite:///cyberquest.db
SUPABASE_URL=your-supabase-project-url
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Email Configuration
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USE_TLS=true
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password

# Security Settings
MAX_LOGIN_ATTEMPTS=5
LOGIN_LOCKOUT_MINUTES=15
PERMANENT_SESSION_LIFETIME=30
```

## 📁 Project Structure

```
Phalanx Cyber Academy/
├── app/                          # Main application package
│   ├── models/                   # Database models
│   ├── routes/                   # Application routes
│   ├── static/                   # Static files (CSS, JS, images)
│   │   ├── css/                  # CSS files
│   │   ├── images/               # Image files
│   │   └── js/                   # JavaScript files
│   │       ├── components/       # Reusable JavaScript components
│   │       ├── utils/            # Utility JavaScript files
│   │       │   ├── pagination/   # Pagination utilities
│   │       │   └── theme/        # Theme utilities
│   │       └── main.js           # Main JavaScript file
│   ├── templates/                # HTML templates
│   │   ├── admin/                # Admin panel templates
│   │   ├── auth/                 # Authentication templates
│   │   ├── partials/             # Reusable template components
│   │   │   ├── admin/            # Admin panel components
│   │   │   │   ├── dashboard/    # Admin dashboard components
│   │   │   │   ├── logs/         # Admin logs components
│   │   │   │   ├── user-details/ # User details components
│   │   │   │   └── users/        # User management components
│   │   │   ├── shared/           # Shared components
│   │   │   ├── footer.html       # Footer component
│   │   │   └── navbar.html       # Navbar component
│   │   ├── emails/               # Email templates for verification codes
│   │   ├── policy-pages/         # Policy page templates
│   │   ├── profile/              # Profile templates
│   │   ├── about.html            # About page template
│   │   ├── base.html             # Base template
│   │   ├── contact.html          # Contact page template
│   │   └── home.html             # Home page template
│   ├── utils/                    # Utility modules
│   └── __init__.py               # Application factory
├── docs/                         # Documentation files
├── instance/                     # Instance-specific files
├── migrations/                   # Database migrations
├── .env.template                 # Environment variables template
├── .gitignore                    # Git ignore file
├── .vercelignore                 # Vercel ignore file
├── config.py                     # Configuration
├── LICENSE                       # MIT License file
├── README.md                     # Project README
├── requirements.txt              # Dependencies
├── run.py                        # Application entry point
└── vercel.json                   # Vercel deployment config
```

## 🚀 Deployment Options

### Vercel (Serverless)
- **One-click Deploy**: Automatic detection and deployment
- **Environment Adaptation**: Auto-disables database features
- **Contact Form**: Logs submissions instead of database storage
- **Zero Configuration**: Works out of the box

### Traditional Hosting
- **Full Features**: Complete database and authentication
- **VPS/Dedicated**: Full control and customization
- **Shared Hosting**: Basic hosting compatibility

See the [Deployment Guide](docs/DEPLOYMENT.md) for detailed instructions.

## 🛡️ Security in Production

### Essential Steps
1. **Verify Admin Access**: Ensure admin email is properly configured
2. **Configure HTTPS**: Essential for secure cookies and authentication
3. **Set Strong Secret Key**: Use a cryptographically secure secret
4. **Configure Email**: Set up production email service
5. **Monitor Logs**: Regular review of security and access logs

### Production Checklist
- [ ] HTTPS configured with valid SSL certificate
- [ ] Environment variables secured
- [ ] Default admin credentials changed
- [ ] Database credentials secured
- [ ] Email service configured
- [ ] Security headers configured
- [ ] Backup strategy implemented
- [ ] Monitoring and alerting set up

## 🔨 Technologies

- **Backend**: Python Flask, SQLAlchemy, Flask-Migrate
- **Frontend**: Tailwind CSS, Bootstrap Icons, Vanilla JavaScript
- **Database**: SQLite (dev), PostgreSQL/MySQL (production)
- **Security**: Argon2, Flask-WTF, CSRF Protection
- **Email**: Flask-Mailman with SMTP support
- **Deployment**: Vercel, traditional hosting

## 🎓 Educational Impact

Phalanx Cyber Academy addresses critical digital literacy gaps through:

- **Practical Application**: Real-world scenario practice with immediate feedback
- **Retention Enhancement**: Gamification increases knowledge retention by 75%
- **Skill Transfer**: Scenarios designed for real-world application
- **Inclusive Learning**: Multiple learning styles and accessibility support
- **Measurable Outcomes**: Comprehensive progress tracking and assessment

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

- **Documentation**: Check the [docs/](docs/) directory for detailed guides
- **Issues**: Open an issue on GitHub for bug reports or feature requests
- **Email**: Contact form available in the application

*Making cybersecurity education engaging, accessible, and effective for everyone.*
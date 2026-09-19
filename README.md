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
- **🏗️ Modern Architecture**: FastAPI + SQLAlchemy 2 backend, React 18 + TypeScript frontend
- **🎨 Responsive Design**: Tailwind CSS 4 with shadcn/ui components and Lucide icons
- **🔐 Complete Authentication**: Clerk-hosted sign-in/sign-up with email verification
- **👥 Admin Panel**: User management, system monitoring, security logs
- **🛡️ Advanced Security**: JWT/JWKS-verified API access, admin role checks
- **🌓 Theme System**: Light/Dark/System modes with persistent preferences
- **📋 Legal Compliance**: Privacy policy, terms of service, cookie policy
- **🚀 Deployment Ready**: Vercel with Dockerized backend

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

### 2. Configure Environment

```bash
# backend/.env — Neon + Clerk values (see backend/.env.example)
cd backend && cp .env.example .env    # On Windows: copy .env.example .env
cd ..

# frontend/.env.local — Clerk publishable key
cd frontend && clerk env pull && cd ..
```

### 3. Run with Docker Compose (recommended)

```bash
docker compose up --build
```

- Requires Docker Desktop running
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000

### Manual Setup (alternative)

Backend:

```bash
cd backend

python -m venv venv
source venv/bin/activate    # On Windows: venv\Scripts\activate

pip install -e .
alembic upgrade head
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Frontend, in a second terminal:

```bash
cd frontend
npm install
npm run dev               # http://localhost:5173 (proxies /api → localhost:8000)
```

## 🎮 How to Play

1. **Register & Verify**: Create your account and verify your email
2. **Complete Assessment**: Take the initial skills assessment for personalized learning paths
3. **Choose Your Path**: Select from beginner, intermediate, or advanced cybersecurity tracks
4. **Engage with Scenarios**: Complete interactive challenges and simulations
5. **Earn Rewards**: Gain XP, unlock achievements, and level up your cybersecurity skills
6. **Track Progress**: Monitor your advancement through comprehensive dashboards

## 📚 Documentation

### Core Documentation
- **[Admin Panel](docs/admin-panel.md)** - User management and system monitoring
- **[Deployment Guide](docs/deployment.md)** - Vercel and production deployment

### Technical Features Overview

#### 🔐 Authentication & Security
- Clerk-hosted sign-in/sign-up with mandatory email verification
- Backend JWT verification via Clerk JWKS on every protected route
- Local profiles linked by `clerk_user_id`, provisioned on first login
- Bearer-token API access — no cookies, no client-supplied identity headers

#### 👥 Admin Panel
- **Access**: Sign in with an admin-flagged account
- User management (activate/deactivate, admin privileges)
- Real-time dashboard with statistics
- Security logs and monitoring
- Automated cleanup tools
- Contact form management

#### 🛡️ Security Features
- **Token Verification**: RS256 signature, issuer, and expiry checks on every request
- **Role Checks**: `is_admin`/`is_active` enforced server-side per request
- **Secure Headers**: Security headers for production

#### 🌓 Theme System
- **Light Mode**: Clean, bright interface
- **Dark Mode**: Modern dark theme
- **System Mode**: Follows OS theme preference
- **Persistent Settings**: Saved in localStorage
- **Smooth Transitions**: Elegant theme switching

## 🔧 Environment Configuration

### Required Variables
`backend/.env` (see `backend/.env.example`):
```bash
# Database — Neon Postgres (pooled for app, direct for Alembic)
DATABASE_URL=postgresql+psycopg://user:pass@host-pooler.region.aws.neon.tech/db?sslmode=require
DATABASE_URL_UNPOOLED=postgresql+psycopg://user:pass@host.region.aws.neon.tech/db?sslmode=require

# Auth — Clerk (backend verification + frontend publishable key)
CLERK_SECRET_KEY=sk_test_...
CLERK_ISSUER=https://<app>.clerk.accounts.dev
CLERK_JWKS_URL=https://<app>.clerk.accounts.dev/.well-known/jwks.json
```

`frontend/.env.local` (written by `clerk env pull`):
```bash
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
```

## 📁 Project Structure

```
Phalanx Cyber Academy/
├── backend/                      # FastAPI backend
│   ├── app/
│   │   ├── models/               # SQLAlchemy models
│   │   ├── routers/              # API route modules
│   │   ├── services/             # Business logic
│   │   ├── clerk_auth.py         # Clerk JWKS/JWT verification
│   │   ├── dependencies.py       # get_current_user / optional_current_user
│   │   └── utils/                # Timezone, formatting helpers
│   ├── alembic/                  # Database migrations
│   ├── tests/                    # pytest suite
│   └── .env.example              # Backend env template
├── frontend/                     # React + Vite frontend
│   ├── src/
│   │   ├── components/           # Shared UI, ProtectedRoute, AuthBridge
│   │   ├── context/              # AuthContext (Clerk-backed), ToastContext
│   │   ├── lib/                  # api.ts, utils.ts, generated/
│   │   ├── pages/                # Route pages
│   │   └── features/             # Simulated PC game components
│   └── .env.example              # Frontend env template
├── docs/                         # Documentation files
├── docker-compose.yml            # Full-stack dev compose
├── LICENSE                       # MIT License file
├── README.md                     # Project README
└── vercel.json                   # Vercel deployment config
```

## 🚀 Deployment

- **Vercel**: static frontend + containerized backend (`backend/Dockerfile`), orchestrated by `vercel.json`
- **Env vars**: set the backend (`DATABASE_URL`, `CLERK_*`) and frontend (`VITE_CLERK_PUBLISHABLE_KEY`) variables in the Vercel dashboard

See the [Deployment Guide](docs/deployment.md) for detailed instructions.

## 🛡️ Security in Production

### Essential Steps
1. **Verify Admin Access**: Ensure an admin-flagged account exists
2. **Configure HTTPS**: Essential for secure authentication
3. **Protect Secrets**: `CLERK_SECRET_KEY` and `DATABASE_URL` stay server-side only
4. **Monitor Logs**: Regular review of security and access logs

### Production Checklist
- [ ] HTTPS configured with valid SSL certificate
- [ ] Environment variables secured
- [ ] Admin access verified
- [ ] Database credentials secured
- [ ] Security headers configured
- [ ] Backup strategy implemented
- [ ] Monitoring and alerting set up

## 🔨 Technologies

- **Backend**: Python FastAPI, SQLAlchemy 2, Alembic
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS 4, shadcn/ui, React Router 7
- **Database**: Neon Postgres
- **Auth**: Clerk (`@clerk/react` + backend JWKS verification)
- **Deployment**: Vercel, Docker

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
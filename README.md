# Phalanx Cyber Academy

**Train. Coordinate. Defend.**

Phalanx Cyber Academy is a game-based learning platform for digital literacy and cybersecurity awareness. Learners work through level-based scenarios inside a simulated PC (mail, browser, files, reader, and case apps sharing one environment) and earn XP, badges, and marks for correct calls.

## Features

### Scenario gameplay

- A simulated work environment per level: mail, browser, files, reader, and case apps communicate over a shared event bus, and objectives gate completion
- Phishing detection, misinformation, malware response, ethical hacking, and digital forensics scenarios
- XP, badges, streaks, level progression, and a leaderboard
- Per-scenario verdicts and scoring, ending in a session report
- Workstation and handset shells that adapt to the player's screen size

### Platform

- Clerk-hosted authentication with email verification
- Admin panel for user management, a reusable content library, and level content editing
- Light and dark themes
- FastAPI + SQLAlchemy 2 backend, React 18 + TypeScript + Vite frontend, Neon Postgres
- Vercel deployment with a Dockerized backend

## Scenarios

- **Misinformation**: classify articles as credible or fake in a reader app (The Misinformation Maze)
- **Phishing**: judge emails in a simulated inbox (Shadow in the Inbox)
- **Malware response**: work a branching incident through the case apps (Malware Mayhem)
- **Ethical hacking**: a controlled penetration-testing scenario (The White Hat Test)
- **Digital forensics**: investigate the evidence to identify The Null (The Hunt for The Null)

## Quick Start

### 1. Clone Repository
```bash
git clone <repository-url>
cd Phalanx-Cyber-Academy
```

### 2. Configure Environment

```bash
# backend/.env: Neon + Clerk values (see backend/.env.example)
cd backend && cp .env.example .env    # On Windows: copy .env.example .env
cd ..

# frontend/.env.local: Clerk publishable key
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
npm run dev               # http://localhost:5173 (proxies /api to localhost:8000)
```

## How to Play

1. Sign up and verify your email
2. Complete onboarding (username, experience level, timezone)
3. Pick an unlocked level and play its scenario inside the simulated PC
4. Earn XP, badges, and streaks; check your standing on the leaderboard

## Documentation

- **[Admin Panel](docs/admin-panel.md)**: user management and system monitoring
- **[Deployment Guide](docs/deployment.md)**: Vercel and production deployment
- **[docs/](docs/)**: full index of platform, level, and systems documentation

### Technical Features Overview

#### Authentication & Security
- Clerk-hosted sign-in/sign-up with mandatory email verification
- Backend JWT verification via Clerk JWKS on every protected route
- Local profiles linked by `clerk_user_id`, provisioned on first login
- Bearer-token API access; no cookies, no client-supplied identity headers

#### Admin Panel
- **Access**: sign in with an admin-flagged account
- User management (activate/deactivate, admin privileges)
- Content library and level content editor with Zod validation
- Security logs and monitoring
- Automated cleanup tools
- Contact form management

#### Security Features
- **Token Verification**: RS256 signature, issuer, and expiry checks on every request
- **Role Checks**: `is_admin`/`is_active` enforced server-side per request
- **Secure Headers**: security headers for production

#### Theme System
- Light, dark, and system modes
- Preference saved in localStorage

## Environment Configuration

### Required Variables
`backend/.env` (see `backend/.env.example`):
```bash
# Database: Neon Postgres (pooled for app, direct for Alembic)
DATABASE_URL=postgresql+psycopg://user:pass@host-pooler.region.aws.neon.tech/db?sslmode=require
DATABASE_URL_UNPOOLED=postgresql+psycopg://user:pass@host.region.aws.neon.tech/db?sslmode=require

# Auth: Clerk (backend verification + frontend publishable key)
CLERK_SECRET_KEY=sk_test_...
CLERK_ISSUER=https://<app>.clerk.accounts.dev
CLERK_JWKS_URL=https://<app>.clerk.accounts.dev/.well-known/jwks.json
```

`frontend/.env.local` (written by `clerk env pull`):
```bash
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
```

## Project Structure

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

## Deployment

- **Vercel**: static frontend + containerized backend (`backend/Dockerfile`), orchestrated by `vercel.json`
- **Env vars**: set the backend (`DATABASE_URL`, `CLERK_*`) and frontend (`VITE_CLERK_PUBLISHABLE_KEY`) variables in the Vercel dashboard

See the [Deployment Guide](docs/deployment.md) for detailed instructions.

## Security in Production

1. Verify an admin-flagged account exists
2. Configure HTTPS
3. Keep `CLERK_SECRET_KEY` and `DATABASE_URL` server-side only
4. Review security and access logs regularly

### Production Checklist
- [ ] HTTPS configured with valid SSL certificate
- [ ] Environment variables secured
- [ ] Admin access verified
- [ ] Database credentials secured
- [ ] Security headers configured
- [ ] Backup strategy implemented
- [ ] Monitoring and alerting set up

## Technologies

- **Backend**: Python FastAPI, SQLAlchemy 2, Alembic
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS 4, shadcn/ui, React Router 7
- **Database**: Neon Postgres
- **Auth**: Clerk (`@clerk/react` + backend JWKS verification)
- **Deployment**: Vercel, Docker

## License

MIT License; see [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

- **Documentation**: check the [docs/](docs/) directory for detailed guides
- **Issues**: open an issue on GitHub for bug reports or feature requests
- **Email**: contact form available in the application

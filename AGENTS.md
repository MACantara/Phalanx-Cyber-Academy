# AGENTS.md — Phalanx Cyber Academy

## Project

Phalanx Cyber Academy is a game-based learning platform for digital literacy and cybersecurity awareness. The project is currently being migrated from a legacy Flask/Vanilla JS stack to a new **FastAPI + React + TypeScript** stack while keeping the legacy application runnable for reference.

- **Public-facing rewrite**: React/TypeScript frontend in `frontend/`.
- **New backend**: FastAPI in `backend/app/`.
- **Legacy reference**: Flask in `app/` — do not modify except for critical bug fixes.

## Stack

- **Backend**: Python 3.12, FastAPI, Uvicorn, SQLAlchemy 2 (sync, `psycopg3`), Alembic, Pydantic Settings.
- **Frontend**: React 18, TypeScript, Vite, React Router v7, Tailwind CSS 4 (`@tailwindcss/vite`), shadcn/ui (`components.json`, `cn()` in `src/lib/utils.ts`), `lucide-react`, `axios`.
- **Database**: Neon Postgres — schema in `backend/alembic/versions/` (baseline `0001_baseline.py`); `supabase_schema.sql` kept as historical reference.
- **Auth**: Clerk — `@clerk/react` on the frontend, JWT/JWKS verification on the backend.
- **Styling**: Tailwind CSS 4 with `dark:` class-mode theme (`@custom-variant dark` in `index.css`). See `DESIGN.md` for the design system.

## Architecture

```
c:\Projects\Phalanx-Cyber-Academy
├── app/                          # Legacy Flask application (reference only)
├── backend/
│   ├── app/
│   │   ├── main.py               # FastAPI app + router registration
│   │   ├── config.py             # Pydantic settings (Neon, Clerk, Brevo, CORS)
│   │   ├── db.py                 # SQLAlchemy engine + session_scope()
│   │   ├── clerk_auth.py         # Clerk JWKS/JWT verification
│   │   ├── models/               # SQLAlchemy declarative models (all tables)
│   │   ├── routers/              # API route modules
│   │   ├── services/             # Business logic (SQLAlchemy-backed)
│   │   ├── dependencies.py       # get_current_user / optional_current_user
│   │   └── utils/                # Timezone, formatting helpers
│   ├── alembic/                  # Migration env + versions
│   └── pyproject.toml            # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/           # Shared UI (Layout, Navbar, Footer, Toast, ProtectedRoute, AuthBridge)
│   │   ├── context/              # AuthContext (Clerk-backed), ToastContext
│   │   ├── hooks/                # useTheme
│   │   ├── lib/                  # api.ts (axios + Clerk token bridge), utils.ts (cn)
│   │   ├── pages/                # Route pages (Home, About, Contact, Privacy, Terms, Cookies, Login, Signup, Onboarding, Profile, EditProfile, Dashboard, Levels, Level, Leaderboard)
│   │   ├── features/simulated-pc/# Simulated PC game components
│   │   └── App.tsx               # Routes + providers (ClerkProvider lives in main.tsx)
│   └── components.json           # shadcn/ui config
├── docs/                         # Legacy and migration docs
├── supabase_schema.sql           # Historical schema reference
└── .windsurf/plans/              # Migration plan files
```

### Auth flow

Clerk-hosted authentication (email OTP, OAuth, etc. configured in the Clerk dashboard):

1. `<SignIn>`/`<SignUp>` components on `/login` and `/signup` issue a Clerk session.
2. `AuthBridge` registers Clerk's `getToken` with the axios instance; every API call sends `Authorization: Bearer <clerk-jwt>`.
3. Backend `get_current_user` verifies the JWT against Clerk JWKS (`CLERK_JWKS_URL`/`CLERK_ISSUER`), then resolves the local `profiles` row by `clerk_user_id` — provisioning it just-in-time on first login (claims existing rows by verified email).
4. `ProtectedRoute` gates signed-in pages; `optional_current_user` personalizes public endpoints (e.g. `/levels`).

## Conventions

### Always

- Run `npx tsc --noEmit` and `npm run build` from `frontend/` before considering a frontend task complete.
- Run `python -m compileall -q app` from `backend/` after Python changes.
- Use `session_scope()` from `app/db.py` for all database access; never instantiate engine/session per call.
- Use Tailwind CSS for styling; avoid custom CSS except for keyframe animations in `index.css`.
- Use `lucide-react` icons; never add Bootstrap Icons in new components.
- Keep the legacy `app/` directory unchanged. Do not delete, rename, or edit legacy files for the rewrite.
- Add all imports at the top of a file; never insert imports mid-file.

### Ask first

- Adding or removing npm/Python dependencies.
- Changing the database schema — Alembic migrations are the only path (`alembic revision --autogenerate`, then `alembic upgrade head`); do not hand-edit `supabase_schema.sql`.
- Modifying legacy `app/` files.
- Creating new top-level files or directories outside `frontend/` or `backend/`.

### Never

- Commit `.env`, `.env.local`, or real API keys (`CLERK_SECRET_KEY` is backend-only; only `VITE_CLERK_PUBLISHABLE_KEY` belongs in frontend env).
- Trust client-supplied identity headers — `X-User-Id` is retired; identity comes only from the verified Clerk JWT.
- Use `console.log` in production code; use toast notifications or proper logging.
- Leave stub UI on public pages; match legacy content and design where parity is requested.
- Use `any` types in new TypeScript code unless absolutely unavoidable.

## Build & Test

### Frontend

```bash
cd frontend
npm install
clerk env pull        # writes .env.local (VITE_CLERK_PUBLISHABLE_KEY)
npm run dev           # http://localhost:5173
npx tsc --noEmit      # type check
npm run build         # production build
```

### Backend

```bash
cd backend
# backend/.env provides DATABASE_URL, DATABASE_URL_UNPOOLED, CLERK_* — see backend/.env.example
pip install -e .
alembic upgrade head
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
python -m pytest -q   # tests
```

### Full Stack (Docker)

```bash
docker compose up --build
```

## Environment

- Backend reads `backend/.env` (canonical; falls back to repo-root `.env`) through `app/config.py`. Repo-root `.env` holds legacy Flask keys only.
- Frontend Vite proxy forwards `/api` to `http://localhost:8000`.
- Neon: pooled `DATABASE_URL` for the app, `DATABASE_URL_UNPOOLED` for Alembic/dumps. Manage branches via the Neon CLI.
- Clerk: `clerk env pull` writes `frontend/.env.local`; `CLERK_SECRET_KEY`/`CLERK_ISSUER`/`CLERK_JWKS_URL` belong in `backend/.env` only.
- For Brevo email, set `BREVO_API_KEY`; otherwise messages are suppressed/logged in development.

## Gotchas

- `profiles.id` is a local UUID distinct from `clerk_user_id` (a `user_…` string) — always join on `clerk_user_id`, never assume they match.
- `optional_current_user` returns `None` for anonymous/bad-token requests; use it only on endpoints that are safe without auth.
- `api.ts` gets tokens through `setAuthTokenGetter` (wired by `AuthBridge`) — don't import Clerk hooks outside React components.
- Tailwind 4: no `tailwind.config.ts`; theme/custom utilities live in `index.css` via `@theme`/`@utility`.
- Dark mode is toggled by a `dark` class on `<html>` (`@custom-variant dark`).
- `lucide-react` does not include every Bootstrap icon; check `lucide-react` exports before using a new icon name.

## Links

- [Design System](DESIGN.md)
- [README](README.md)
- [Supabase Schema](supabase_schema.sql) (historical reference)

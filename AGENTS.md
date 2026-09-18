# AGENTS.md — Phalanx Cyber Academy

## Project

Phalanx Cyber Academy is a game-based learning platform for digital literacy and cybersecurity awareness. The project is currently being migrated from a legacy Flask/Vanilla JS stack to a new **FastAPI + React + TypeScript** stack while keeping the legacy application runnable for reference.

- **Public-facing rewrite**: React/TypeScript frontend in `frontend/`.
- **New backend**: FastAPI in `backend/app/`.
- **Legacy reference**: Flask in `app/` — do not modify except for critical bug fixes.

## Stack

- **Backend**: Python 3.12, FastAPI, Uvicorn, Supabase (PostgREST), Pydantic Settings.
- **Frontend**: React 18, TypeScript, Vite, React Router v7, Tailwind CSS, `lucide-react`, `axios`.
- **Database**: Supabase with schema in `supabase_schema.sql`.
- **Styling**: Tailwind CSS with `dark:` class-mode theme. See `DESIGN.md` for the design system.

## Architecture

```
c:\Projects\Phalanx-Cyber-Academy
├── app/                          # Legacy Flask application (reference only)
├── backend/
│   ├── app/
│   │   ├── main.py               # FastAPI app + router registration
│   │   ├── routers/              # API route modules
│   │   ├── services/             # Business logic (database, email, sessions)
│   │   ├── dependencies.py       # get_current_user dependency
│   │   └── utils/                # Timezone, formatting helpers
│   └── pyproject.toml            # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/           # Shared UI (Layout, Navbar, Footer, Toast, Policy helpers)
│   │   ├── context/              # AuthContext, ToastContext
│   │   ├── hooks/                # useTheme
│   │   ├── lib/                  # api.ts, dates.ts
│   │   ├── pages/                # Route pages (Home, About, Contact, Privacy, Terms, Cookies, Login, Signup, Profile, EditProfile, Dashboard, Levels, Level, Leaderboard)
│   │   ├── features/simulated-pc/# Simulated PC game components
│   │   └── App.tsx               # Router + providers
│   └── tailwind.config.ts
├── docs/                         # Legacy and migration docs
├── supabase_schema.sql           # Database schema
└── .windsurf/plans/              # Migration plan files
```

### Auth flow

Passwordless email-code authentication:

1. `POST /api/auth/login` or `POST /api/auth/signup` sends a 6-digit code.
2. `POST /api/auth/verify` (login) or `POST /api/auth/verify-signup` validates the code and returns the user.
3. Frontend stores `cyberquest_user` in `localStorage` and sends `X-User-Id` header via `api.ts` interceptor for protected routes.

## Conventions

### Always

- Run `npx tsc --noEmit` and `npm run build` from `frontend/` before considering a frontend task complete.
- Run `python -m compileall -q app backend\app` after Python changes.
- Use Tailwind CSS for styling; avoid custom CSS except for keyframe animations in `index.css`.
- Use `lucide-react` icons; never add Bootstrap Icons in new components.
- Keep the legacy `app/` directory unchanged. Do not delete, rename, or edit legacy files for the rewrite.
- Add all imports at the top of a file; never insert imports mid-file.

### Ask first

- Adding or removing npm/Python dependencies.
- Changing the Supabase schema or `supabase_schema.sql`.
- Modifying legacy `app/` files.
- Creating new top-level files or directories outside `frontend/` or `backend/`.

### Never

- Commit `.env` files or real API keys.
- Use `console.log` in production code; use toast notifications or proper logging.
- Leave stub UI on public pages; match legacy content and design where parity is requested.
- Use `any` types in new TypeScript code unless absolutely unavoidable.

## Build & Test

### Frontend

```bash
cd frontend
npm install
npm run dev          # http://localhost:5173
npx tsc --noEmit     # type check
npm run build        # production build
```

### Backend

```bash
cd backend
cp .env.template .env    # Windows: copy .env.template .env
# Edit .env with SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
pip install -e .
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Full Stack (Docker)

```bash
docker compose up --build
```

## Environment

- Backend reads `.env` through `app/config.py`.
- Frontend Vite proxy forwards `/api` to `http://localhost:8000`.
- For Brevo email, set `BREVO_API_KEY`; otherwise email codes are printed to the console in development.

## Gotchas

- `api.ts` reads `cyberquest_user` from `localStorage` (not `user_id`) for the `X-User-Id` header.
- `backend/app/dependencies.py` expects `X-User-Id` as an integer header.
- `supabase_schema.sql` defines the `users`, `email_verifications`, `login_attempts`, `contact_submissions`, `levels`, and `sessions`/`session_scores` tables.
- `frontend/tailwind.config.ts` uses `darkMode: 'class'`, so theme is toggled by a `dark` class on `<html>`.
- `lucide-react` does not include every Bootstrap icon; check `lucide-react` exports before using a new icon name.

## Links

- [Design System](DESIGN.md)
- [README](README.md)
- [Supabase Schema](supabase_schema.sql)

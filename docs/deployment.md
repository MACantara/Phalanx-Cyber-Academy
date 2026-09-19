# Deployment Documentation

Deployment model: **Vercel** serves the static frontend and runs the FastAPI backend as a container (`backend/Dockerfile`), orchestrated by `vercel.json`. The database is **Neon Postgres** and auth is **Clerk** — both managed services, so there is nothing else to host.

## Vercel Deployment

### Architecture

- **Frontend service** — `frontend/` builds with `npm run build`, output `dist/` (static Vite site).
- **Backend service** — `backend/` runs as a Vercel container from `backend/Dockerfile`. Startup runs `alembic upgrade head` then `uvicorn`.
- **Rewrites** — `/api/(.*)` routes to the backend container; everything else to the frontend (see `vercel.json`).

### Steps

1. **Link the repo** — `vercel` from the repo root and accept the project link (already done once; `.vercel/` is gitignored).
2. **Set environment variables** in the Vercel dashboard (or `vercel env add`):

   | Scope | Variables |
   |---|---|
   | Backend | `DATABASE_URL` (pooled Neon), `DATABASE_URL_UNPOOLED`, `CLERK_SECRET_KEY`, `CLERK_ISSUER`, `CLERK_JWKS_URL`, `CORS_ALLOWED_ORIGINS` |
   | Frontend (build-time) | `VITE_CLERK_PUBLISHABLE_KEY`, `VITE_API_URL` (e.g. `/api`) |

   Never put `CLERK_SECRET_KEY` in frontend env vars — only `VITE_`-prefixed values reach the client bundle.

3. **Deploy** — `vercel --prod`, or push to the connected Git branch.

### Database

- App traffic uses the **pooled** Neon connection (`DATABASE_URL`).
- Migrations at container start use `DATABASE_URL_UNPOOLED` (direct endpoint) — Alembic does not work reliably through the pooler.
- Create feature branches with the Neon CLI (`neon branches create`) to test migrations safely; run `alembic upgrade head` against the branch before merging.

## Local Docker Compose

`docker-compose.yml` builds the same images for local dev:

```bash
docker compose up --build
```

- Requires Docker Desktop running.
- Frontend: http://localhost:5173 · Backend: http://localhost:8000
- Env files: `backend/.env` (see `backend/.env.example`), `frontend/.env.local` (written by `clerk env pull`).

## Production Checklist

- [ ] `VITE_CLERK_PUBLISHABLE_KEY` set as a frontend build var; Clerk secret vars set backend-side only
- [ ] `DATABASE_URL` points at the pooled Neon host; `DATABASE_URL_UNPOOLED` at the direct host
- [ ] `CORS_ALLOWED_ORIGINS` lists the production frontend origin
- [ ] Clerk instance switched from test keys (`*_test_*`) to live keys (`*_live_*`)
- [ ] `alembic upgrade head` applied to the production branch (runs automatically at container start)
- [ ] HTTPS in force (Vercel handles TLS)
- [ ] Neon backup/branching strategy reviewed

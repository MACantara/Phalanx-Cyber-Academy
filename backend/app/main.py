from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .routers import admin, auth, backup, blue_vs_red, contact, content, levels, reports, sessions, users, xp
from .utils.security import RateLimitMiddleware, SecurityHeadersMiddleware

app = FastAPI(title=settings.app_name, debug=settings.debug)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in settings.cors_allowed_origins.split(",") if o.strip()],
    allow_credentials=True,
    allow_methods=[m.strip() for m in settings.cors_allowed_methods.split(",") if m.strip()],
    allow_headers=[h.strip() for h in settings.cors_allowed_headers.split(",") if h.strip()],
)

app.add_middleware(
    RateLimitMiddleware,
    max_requests=100,
    window_seconds=60,
    strict_paths={
        "/api/auth/": (10, 60),
        "/api/contact": (5, 60),
        "/api/admin/": (50, 60),
    },
)

app.add_middleware(SecurityHeadersMiddleware)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])
app.include_router(reports.router, prefix="/api/admin/reports", tags=["reports"])
app.include_router(backup.router, prefix="/api/admin/backups", tags=["backup"])
app.include_router(contact.router, prefix="/api/contact", tags=["contact"])
app.include_router(levels.router, prefix="/api/levels", tags=["levels"])
app.include_router(content.router, prefix="/api/levels", tags=["content"])
app.include_router(sessions.router, prefix="/api/sessions", tags=["sessions"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(xp.router, prefix="/api/xp", tags=["xp"])
app.include_router(blue_vs_red.router, prefix="/api/blue-vs-red", tags=["blue-vs-red"])


@app.get("/health")
def health_check():
    return {"status": "ok"}

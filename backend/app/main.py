from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .routers import admin, auth, backup, blue_vs_red, contact, content, levels, reports, sessions, users, xp

app = FastAPI(title=settings.app_name, debug=settings.debug)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

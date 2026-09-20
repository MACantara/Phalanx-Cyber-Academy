import csv
import io
import logging
import secrets
import uuid
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional

import httpx
from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import func, select
from sqlalchemy.exc import SQLAlchemyError

from app.config import settings
from app.db import session_scope
from app.dependencies import get_current_user
from app.errors import DatabaseError
from app.models import AdminAuditLog, ContactSubmission, Level, Profile, Session
from app.services.user_service import User as UserService
from app.utils.timezone_utils import utc_now

logger = logging.getLogger(__name__)

router = APIRouter(tags=["admin"])

CLERK_API_BASE = "https://api.clerk.com/v1"


async def require_admin(user: Dict[str, Any] = Depends(get_current_user)):
    if not user.get("is_admin"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin required")
    return user


def _clerk_delete_user(clerk_user_id: str) -> None:
    """Delete a Clerk user via the Backend API. Raises on failure."""
    if not settings.clerk_secret_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Delete failed: CLERK_SECRET_KEY is not configured",
        )
    response = httpx.delete(
        f"{CLERK_API_BASE}/users/{clerk_user_id}",
        headers={"Authorization": f"Bearer {settings.clerk_secret_key}"},
        timeout=10,
    )
    response.raise_for_status()


def _log_admin_action(
    admin_id: str,
    action: str,
    target_type: str | None = None,
    target_id: int | None = None,
    details: Dict[str, Any] | None = None,
) -> None:
    """Best-effort insertion of an admin audit log entry."""
    try:
        with session_scope() as session:
            session.add(
                AdminAuditLog(
                    admin_id=uuid.UUID(str(admin_id)) if admin_id else None,
                    action=action,
                    target_type=target_type,
                    target_id=target_id,
                    details=details or {},
                    created_at=utc_now(),
                )
            )
    except Exception as exc:
        logger.warning("Failed to log admin action %s: %s", action, exc)


@router.get("/stats")
def get_stats(user: Dict[str, Any] = Depends(require_admin)):
    try:
        with session_scope() as session:
            unread_contacts = session.execute(
                select(func.count())
                .select_from(ContactSubmission)
                .where(ContactSubmission.is_read.is_(False))
            ).scalar() or 0
            recent_contacts = session.execute(
                select(func.count())
                .select_from(ContactSubmission)
                .where(ContactSubmission.created_at >= utc_now() - timedelta(days=30))
            ).scalar() or 0
            total_levels = session.execute(
                select(func.count()).select_from(Level)
            ).scalar() or 0
            available_levels = session.execute(
                select(func.count())
                .select_from(Level)
                .where(Level.coming_soon.is_(False))
            ).scalar() or 0
    except SQLAlchemyError as e:
        raise DatabaseError(f"Failed to get admin stats: {e}")

    return {
        "users": {
            "total": UserService.count_all(),
            "active": UserService.count_active(),
            "recent_30d": UserService.count_recent_registrations(days=30),
        },
        "contacts": {
            "unread": unread_contacts,
            "recent_30d": recent_contacts,
        },
        "levels": {
            "total": total_levels,
            "available": available_levels,
        },
    }


def _safe(query) -> List[Any]:
    """Run a SELECT and return its rows, or [] on failure (best-effort)."""
    try:
        with session_scope() as session:
            return list(session.execute(query).scalars().all())
    except Exception as exc:
        logger.warning("Database query failed in _safe: %s", exc)
        return []


def _get_logs(limit: int = 100) -> List[Dict[str, Any]]:
    contacts = _safe(
        select(ContactSubmission).order_by(ContactSubmission.created_at.desc()).limit(limit)
    )
    sessions = _safe(
        select(Session).order_by(Session.start_time.desc()).limit(limit)
    )
    users = _safe(
        select(Profile).order_by(Profile.created_at.desc()).limit(limit)
    )

    logs = []
    for c in contacts:
        logs.append({
            "id": f"contact_{c.id}",
            "type": "contact",
            "timestamp": c.created_at.isoformat() if c.created_at else None,
            "message": f"Contact submission from {c.name} <{c.email}>",
            "status": "read" if c.is_read else "unread",
            "details": c.subject,
        })
    for s in sessions:
        logs.append({
            "id": f"session_{s.id}",
            "type": "session",
            "timestamp": s.start_time.isoformat() if s.start_time else None,
            "message": f"Session '{s.session_name}' started for level {s.level_id}",
            "status": "completed" if s.end_time else "active",
            "details": f"score={s.score} profile_id={s.profile_id}",
        })
    for u in users:
        logs.append({
            "id": f"user_{u.id}",
            "type": "registration",
            "timestamp": u.created_at.isoformat() if u.created_at else None,
            "message": f"New user registered: {u.email}",
            "status": "active" if u.is_active else "inactive",
            "details": f"admin={u.is_admin} onboarding_completed={u.onboarding_completed}",
        })

    logs.sort(key=lambda x: x.get("timestamp") or "", reverse=True)
    return logs[:limit]


def _filter_logs(logs: List[Dict[str, Any]], search: str | None, event_type: str | None) -> List[Dict[str, Any]]:
    if event_type:
        logs = [l for l in logs if l.get("type") == event_type]
    if search:
        search_lower = search.lower()
        logs = [l for l in logs if search_lower in l.get("message", "").lower() or search_lower in str(l.get("details", "")).lower()]
    return logs


@router.get("/logs")
def get_logs(
    page: int = 1,
    per_page: int = 25,
    search: str | None = None,
    event_type: str | None = None,
    user: Dict[str, Any] = Depends(require_admin),
):
    logs = _get_logs(limit=page * per_page)
    logs = _filter_logs(logs, search, event_type)
    total = len(logs)
    start = (page - 1) * per_page
    end = start + per_page
    return {"logs": logs[start:end], "total": total}


@router.get("/logs/export")
def export_logs(
    search: str | None = None,
    event_type: str | None = None,
    user: Dict[str, Any] = Depends(require_admin),
):
    logs = _get_logs(limit=10000)
    logs = _filter_logs(logs, search, event_type)
    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=["id", "type", "timestamp", "message", "status", "details"])
    writer.writeheader()
    for log in logs:
        writer.writerow({k: str(log.get(k, "")) for k in ["id", "type", "timestamp", "message", "status", "details"]})
    output.seek(0)
    filename = f"phalanx_logs_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.csv"
    return StreamingResponse(
        output,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )


@router.get("/analytics/dashboard")
def get_analytics_dashboard(user: Dict[str, Any] = Depends(require_admin)):
    total_users = UserService.count_all()
    cutoff = utc_now() - timedelta(days=30)
    try:
        with session_scope() as session:
            recent_signups_count = session.execute(
                select(func.count())
                .select_from(Profile)
                .where(Profile.created_at >= cutoff)
            ).scalar() or 0
    except Exception:
        recent_signups_count = 0
    try:
        with session_scope() as session:
            sessions = session.execute(select(Session)).scalars().all()
    except Exception:
        sessions = []
    completed_sessions = [s for s in sessions if s.end_time is not None]
    avg_score = sum(s.score or 0 for s in completed_sessions) / len(completed_sessions) if completed_sessions else 0
    return {
        "total_users": total_users,
        "recent_signups": recent_signups_count,
        "total_sessions": len(sessions),
        "completed_sessions": len(completed_sessions),
        "average_score": round(avg_score, 1),
    }


@router.get("/analytics/levels")
def get_analytics_levels(user: Dict[str, Any] = Depends(require_admin)):
    try:
        with session_scope() as session:
            sessions = session.execute(select(Session)).scalars().all()
    except Exception:
        sessions = []
    level_stats: Dict[int, Dict[str, Any]] = {}
    for s in sessions:
        lid = s.level_id
        if lid is None:
            continue
        if lid not in level_stats:
            level_stats[lid] = {"sessions": 0, "completed": 0, "total_score": 0, "scores": []}
        level_stats[lid]["sessions"] += 1
        if s.end_time is not None:
            level_stats[lid]["completed"] += 1
        level_stats[lid]["total_score"] += s.score or 0
        level_stats[lid]["scores"].append(s.score or 0)
    result = []
    for level_id, stats in level_stats.items():
        result.append({
            "level_id": level_id,
            "sessions": stats["sessions"],
            "completed": stats["completed"],
            "average_score": round(stats["total_score"] / len(stats["scores"]), 1) if stats["scores"] else 0,
        })
    return {"levels": sorted(result, key=lambda x: x["level_id"])}


@router.get("/analytics/blue-vs-red")
def get_analytics_blue_vs_red(user: Dict[str, Any] = Depends(require_admin)):
    return {"matches": [], "message": "Blue-vs-red data is not collected yet; placeholder returned."}


class UserActionPayload(BaseModel):
    action: str = Field(..., pattern=r"^(toggle_active|toggle_admin|delete)$")  # toggle_active, toggle_admin, delete


class CreateUserPayload(BaseModel):
    email: EmailStr
    username: str | None = Field(None, max_length=30)
    timezone: str = Field("UTC", max_length=50)
    is_admin: bool = False


class XPGrantPayload(BaseModel):
    amount: int = Field(..., gt=0)


@router.post("/users")
def create_user(payload: CreateUserPayload, user: Dict[str, Any] = Depends(require_admin)):
    if not payload.email or "@" not in payload.email:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid email address")

    existing = UserService.find_by_email(payload.email)
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="User already exists")

    if not settings.clerk_secret_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create auth user: CLERK_SECRET_KEY is not configured",
        )

    temp_password = secrets.token_urlsafe(16)
    clerk_body = {
        "email_address": [payload.email],
        "password": temp_password,
        "public_metadata": {
            "username": payload.username,
            "timezone": payload.timezone,
        },
    }
    if payload.username:
        clerk_body["username"] = payload.username
    try:
        auth_response = httpx.post(
            f"{CLERK_API_BASE}/users",
            headers={"Authorization": f"Bearer {settings.clerk_secret_key}"},
            json=clerk_body,
            timeout=10,
        )
        auth_response.raise_for_status()
        clerk_user = auth_response.json()
    except httpx.HTTPError as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create auth user: {exc}",
        ) from exc

    clerk_user_id = clerk_user.get("id")
    try:
        with session_scope() as session:
            row = Profile(
                clerk_user_id=clerk_user_id,
                username=payload.username,
                email=payload.email,
                timezone=payload.timezone,
                is_admin=payload.is_admin,
            )
            session.add(row)
            session.flush()
            new_id = str(row.id)
    except SQLAlchemyError as e:
        # Best-effort rollback so no orphaned Clerk account remains.
        if clerk_user_id:
            try:
                _clerk_delete_user(clerk_user_id)
            except Exception:
                logger.warning("Failed to roll back Clerk user %s", clerk_user_id)
        raise DatabaseError(f"Failed to create user profile: {e}")

    _log_admin_action(
        admin_id=user["id"],
        action="create_user",
        target_type="user",
        target_id=None,
        details={"email": payload.email, "username": payload.username, "is_admin": payload.is_admin, "user_id": new_id},
    )

    new_profile = UserService.find_by_id(new_id)
    return {"success": True, "user": new_profile.to_dict() if new_profile else {"id": new_id}}


@router.post("/users/{user_id}/xp")
def grant_xp(
    user_id: str,
    payload: XPGrantPayload,
    user: Dict[str, Any] = Depends(require_admin),
):
    if payload.amount <= 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="XP amount must be positive")
    target = UserService.find_by_id(user_id)
    if not target:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    target.total_xp = (target.total_xp or 0) + payload.amount
    target.save()
    _log_admin_action(
        admin_id=user["id"],
        action="grant_xp",
        target_type="user",
        target_id=None,
        details={"amount": payload.amount, "total_xp": target.total_xp, "user_id": user_id},
    )
    return {"success": True, "user": target.to_dict()}


@router.put("/users/{user_id}/actions")
def perform_user_action(
    user_id: str,
    payload: UserActionPayload,
    user: Dict[str, Any] = Depends(require_admin),
):
    target = UserService.find_by_id(user_id)
    if not target:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if payload.action == "toggle_active":
        target.is_active = not target.is_active
        target.save()
        _log_admin_action(
            admin_id=user["id"],
            action="toggle_active",
            target_type="user",
            target_id=None,
            details={"is_active": target.is_active, "user_id": user_id},
        )
    elif payload.action == "toggle_admin":
        target.is_admin = not target.is_admin
        target.save()
        _log_admin_action(
            admin_id=user["id"],
            action="toggle_admin",
            target_type="user",
            target_id=None,
            details={"is_admin": target.is_admin, "user_id": user_id},
        )
    elif payload.action == "delete":
        if target.clerk_user_id:
            try:
                _clerk_delete_user(target.clerk_user_id)
            except httpx.HTTPError as e:
                raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Delete failed: {e}")
        try:
            with session_scope() as session:
                row = session.get(Profile, uuid.UUID(str(user_id)))
                if row is not None:
                    session.delete(row)
        except SQLAlchemyError as e:
            raise DatabaseError(f"Delete failed: {e}")
        _log_admin_action(
            admin_id=user["id"],
            action="delete_user",
            target_type="user",
            target_id=None,
            details={"email": target.email, "user_id": user_id},
        )
        return {"success": True, "message": "User deleted"}
    else:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unknown action")

    return {"success": True, "user": target.to_dict()}


def _session_to_dict(s: Session) -> Dict[str, Any]:
    return {
        "id": s.id,
        "profile_id": str(s.profile_id),
        "session_name": s.session_name,
        "level_id": s.level_id,
        "score": s.score,
        "start_time": s.start_time.isoformat() if s.start_time else None,
        "end_time": s.end_time.isoformat() if s.end_time else None,
        "created_at": s.created_at.isoformat() if s.created_at else None,
    }


@router.get("/users/{user_id}/activity")
def get_user_activity(
    user_id: str,
    user: Dict[str, Any] = Depends(require_admin),
):
    target = UserService.find_by_id(user_id)
    if not target:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    def safe(query):
        try:
            with session_scope() as session:
                return [_session_to_dict(s) for s in session.execute(query).scalars().all()]
        except Exception:
            return []

    return {
        "sessions": safe(
            select(Session)
            .where(Session.profile_id == uuid.UUID(str(user_id)))
            .order_by(Session.start_time.desc())
        ),
    }


# ---------------------------------------------------------------------------
# Content platform — shared content library + level content authoring
# ---------------------------------------------------------------------------

CONTENT_KINDS = ("emails", "articles", "files", "sites", "scenes", "evidence")


class ContentItemIn(BaseModel):
    kind: str = Field(pattern="^[a-z_]+$")
    key: str = Field(min_length=1, max_length=120, pattern="^[A-Za-z0-9_-]+$")
    data: Dict[str, Any]


class ContentItemUpdate(BaseModel):
    data: Dict[str, Any]


class LevelContentIn(BaseModel):
    content: Dict[str, Any]


@router.get("/content-items")
def list_content_items(
    kind: Optional[str] = Query(default=None),
    user: Dict[str, Any] = Depends(require_admin),
):
    from app.services import content_service

    return {"items": content_service.list_items(kind)}


@router.post("/content-items", status_code=status.HTTP_201_CREATED)
def upsert_content_item(
    body: ContentItemIn,
    user: Dict[str, Any] = Depends(require_admin),
):
    from app.services import content_service

    if body.kind not in CONTENT_KINDS:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Unknown content kind '{body.kind}'. Known kinds: {', '.join(CONTENT_KINDS)}",
        )
    item = content_service.upsert_item(body.kind, body.key, body.data)
    _log_admin_action(user.get("id"), "content_item_upsert", "content_item", None, {"kind": body.kind, "key": body.key})
    return item


@router.put("/content-items/{item_id}")
def update_content_item(
    item_id: str,
    body: ContentItemUpdate,
    user: Dict[str, Any] = Depends(require_admin),
):
    from app.services import content_service

    item = content_service.update_item(item_id, body.data)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Content item not found")
    _log_admin_action(user.get("id"), "content_item_update", "content_item", None, {"item_id": item_id})
    return item


@router.delete("/content-items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_content_item(
    item_id: str,
    user: Dict[str, Any] = Depends(require_admin),
):
    from app.services import content_service

    if not content_service.delete_item(item_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Content item not found")
    _log_admin_action(user.get("id"), "content_item_delete", "content_item", None, {"item_id": item_id})


@router.get("/levels/{level_id}/content")
def get_level_content_admin(
    level_id: int,
    user: Dict[str, Any] = Depends(require_admin),
):
    """Raw (unresolved) level content for editing."""
    with session_scope() as s:
        row = s.execute(select(Level).where(Level.level_id == level_id)).scalar_one_or_none()
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Level not found")
    return {"level_id": level_id, "content": row.content}


@router.put("/levels/{level_id}/content")
def put_level_content(
    level_id: int,
    body: LevelContentIn,
    user: Dict[str, Any] = Depends(require_admin),
):
    """Save a level's environment/content payload (the publish step)."""
    with session_scope() as s:
        row = s.execute(select(Level).where(Level.level_id == level_id)).scalar_one_or_none()
        if not row:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Level not found")
        row.content = body.content
        row.updated_at = utc_now()
    _log_admin_action(user.get("id"), "level_content_update", "level", level_id, None)
    return {"level_id": level_id, "content": body.content}

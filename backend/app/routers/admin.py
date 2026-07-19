import csv
import io
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from app.dependencies import get_current_user
from app.errors import DatabaseError, handle_supabase_error
from app.supabase_client import get_supabase
from app.services.user_service import User as UserService
from app.services.contact_service import Contact
from app.services.level_service import Level
from app.utils.timezone_utils import utc_now

router = APIRouter(tags=["admin"])


async def require_admin(user: Dict[str, Any] = Depends(get_current_user)):
    if not user.get("is_admin"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin required")
    return user


def _log_admin_action(
    admin_id: int,
    action: str,
    target_type: str | None = None,
    target_id: int | None = None,
    details: Dict[str, Any] | None = None,
) -> None:
    """Best-effort insertion of an admin audit log entry."""
    try:
        supabase = get_supabase()
        supabase.table("admin_audit_logs").insert({
            "admin_id": admin_id,
            "action": action,
            "target_type": target_type,
            "target_id": target_id,
            "details": details or {},
            "created_at": utc_now().isoformat(),
        }).execute()
    except Exception:
        pass


@router.get("/stats")
def get_stats(user: Dict[str, Any] = Depends(require_admin)):
    return {
        "users": {
            "total": UserService.count_all(),
            "active": UserService.count_active(),
            "recent_30d": UserService.count_recent_registrations(days=30),
            "verified": UserService.count_verified_emails(),
        },
        "contacts": {
            "unread": Contact.get_unread_count(),
            "recent_30d": Contact.count_recent_submissions(days=30),
        },
        "levels": {
            "total": len(Level.get_all_levels()),
            "available": len(Level.get_available_levels()),
        },
    }


def _safe(query, default=None):
    try:
        return handle_supabase_error(query.execute()) or default
    except Exception:
        return default


def _get_logs(supabase, limit: int = 100) -> List[Dict[str, Any]]:
    attempts = _safe(supabase.table("login_attempts").select("*").order("attempted_at", desc=True).limit(limit), [])
    verifications = _safe(supabase.table("email_verifications").select("*").order("created_at", desc=True).limit(limit), [])
    contacts = _safe(supabase.table("contact_submissions").select("*").order("created_at", desc=True).limit(limit), [])
    sessions = _safe(supabase.table("sessions").select("*").order("start_time", desc=True).limit(limit), [])
    users = _safe(supabase.table("users").select("*").order("created_at", desc=True).limit(limit), [])

    logs = []
    for a in attempts:
        logs.append({
            "id": f"login_{a.get('id')}",
            "type": "login",
            "timestamp": a.get("attempted_at"),
            "message": f"Login attempt from {a.get('ip_address')} as {a.get('username_or_email') or 'unknown'}",
            "status": "success" if a.get("success") else "failed",
            "details": a.get("user_agent"),
        })
    for v in verifications:
        logs.append({
            "id": f"verification_{v.get('id')}",
            "type": "verification",
            "timestamp": v.get("created_at"),
            "message": f"Verification code sent to {v.get('email')}",
            "status": "verified" if v.get("verified_at") else "pending",
            "details": v.get("code_type"),
        })
    for c in contacts:
        logs.append({
            "id": f"contact_{c.get('id')}",
            "type": "contact",
            "timestamp": c.get("created_at"),
            "message": f"Contact submission from {c.get('name')} <{c.get('email')}>",
            "status": "read" if c.get("is_read") else "unread",
            "details": c.get("subject"),
        })
    for s in sessions:
        logs.append({
            "id": f"session_{s.get('id')}",
            "type": "session",
            "timestamp": s.get("start_time"),
            "message": f"Session '{s.get('session_name')}' started for level {s.get('level_id')}",
            "status": "completed" if s.get("end_time") else "active",
            "details": f"score={s.get('score')} user_id={s.get('user_id')}",
        })
    for u in users:
        logs.append({
            "id": f"user_{u.get('id')}",
            "type": "registration",
            "timestamp": u.get("created_at"),
            "message": f"New user registered: {u.get('email')}",
            "status": "active" if u.get("is_active") else "inactive",
            "details": f"admin={u.get('is_admin')} verified={u.get('is_verified')}",
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
    supabase = get_supabase()
    logs = _get_logs(supabase, limit=page * per_page)
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
    supabase = get_supabase()
    logs = _get_logs(supabase, limit=10000)
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
    supabase = get_supabase()
    total_users = UserService.count_all()
    cutoff = (datetime.utcnow() - timedelta(days=30)).isoformat()
    try:
        recent_signups = handle_supabase_error(supabase.table("users").select("created_at", count="exact").gte("created_at", cutoff).execute())
        recent_signups_count = recent_signups[0].get("count") if isinstance(recent_signups, list) and recent_signups else 0
    except Exception:
        recent_signups_count = 0
    try:
        sessions = handle_supabase_error(supabase.table("sessions").select("*").execute()) or []
    except Exception:
        sessions = []
    completed_sessions = [s for s in sessions if s.get("end_time") is not None]
    avg_score = sum(s.get("score", 0) or 0 for s in completed_sessions) / len(completed_sessions) if completed_sessions else 0
    return {
        "total_users": total_users,
        "recent_signups": recent_signups_count,
        "total_sessions": len(sessions),
        "completed_sessions": len(completed_sessions),
        "average_score": round(avg_score, 1),
    }


@router.get("/analytics/levels")
def get_analytics_levels(user: Dict[str, Any] = Depends(require_admin)):
    supabase = get_supabase()
    try:
        sessions = handle_supabase_error(supabase.table("sessions").select("*").execute()) or []
    except Exception:
        sessions = []
    level_stats: Dict[int, Dict[str, Any]] = {}
    for s in sessions:
        lid = s.get("level_id")
        if lid is None:
            continue
        if lid not in level_stats:
            level_stats[lid] = {"sessions": 0, "completed": 0, "total_score": 0, "scores": []}
        level_stats[lid]["sessions"] += 1
        if s.get("end_time") is not None:
            level_stats[lid]["completed"] += 1
        level_stats[lid]["total_score"] += s.get("score", 0) or 0
        level_stats[lid]["scores"].append(s.get("score", 0) or 0)
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
    action: str  # toggle_active, toggle_admin, delete


class CreateUserPayload(BaseModel):
    email: str
    username: str | None = None
    timezone: str = "UTC"
    is_admin: bool = False


class XPGrantPayload(BaseModel):
    amount: int


@router.post("/users")
def create_user(payload: CreateUserPayload, user: Dict[str, Any] = Depends(require_admin)):
    if not payload.email or "@" not in payload.email:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid email address")

    existing = UserService.find_by_email(payload.email)
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="User already exists")

    new_user = UserService.create(
        email=payload.email,
        username=payload.username,
        timezone=payload.timezone,
        is_admin=payload.is_admin,
    )
    _log_admin_action(
        admin_id=user["id"],
        action="create_user",
        target_type="user",
        target_id=new_user.id,
        details={"email": payload.email, "username": payload.username, "is_admin": payload.is_admin},
    )
    return {"success": True, "user": new_user.to_dict()}


@router.post("/users/{user_id}/xp")
def grant_xp(
    user_id: int,
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
        target_id=user_id,
        details={"amount": payload.amount, "total_xp": target.total_xp},
    )
    return {"success": True, "user": target.to_dict()}


@router.put("/users/{user_id}/actions")
def perform_user_action(
    user_id: int,
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
            target_id=user_id,
            details={"is_active": target.is_active},
        )
    elif payload.action == "toggle_admin":
        target.is_admin = not target.is_admin
        target.save()
        _log_admin_action(
            admin_id=user["id"],
            action="toggle_admin",
            target_type="user",
            target_id=user_id,
            details={"is_admin": target.is_admin},
        )
    elif payload.action == "delete":
        _log_admin_action(
            admin_id=user["id"],
            action="delete_user",
            target_type="user",
            target_id=user_id,
            details={"email": target.email},
        )
        supabase = get_supabase()
        try:
            handle_supabase_error(supabase.table("users").delete().eq("id", user_id).execute())
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Delete failed: {e}")
        return {"success": True, "message": "User deleted"}
    else:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unknown action")

    return {"success": True, "user": target.to_dict()}


@router.get("/users/{user_id}/activity")
def get_user_activity(
    user_id: int,
    user: Dict[str, Any] = Depends(require_admin),
):
    supabase = get_supabase()
    target = UserService.find_by_id(user_id)
    if not target:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    def safe(query):
        try:
            return handle_supabase_error(query.execute()) or []
        except Exception:
            return []

    return {
        "sessions": safe(supabase.table("sessions").select("*").eq("user_id", user_id).order("start_time", desc=True)),
        "login_attempts": safe(supabase.table("login_attempts").select("*").ilike("username_or_email", f"%{target.email}%").order("attempted_at", desc=True).limit(20)),
        "email_verifications": safe(supabase.table("email_verifications").select("*").eq("user_id", user_id).order("created_at", desc=True).limit(20)),
    }

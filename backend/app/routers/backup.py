from datetime import datetime, timedelta
from typing import Any, Dict, List

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from app.dependencies import get_current_user

router = APIRouter(tags=["backup"])


async def require_admin(user: Dict[str, Any] = Depends(get_current_user)):
    if not user.get("is_admin"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin required")
    return user


# In-memory store for demonstration; replace with persistent metadata storage.
_fake_backups: List[Dict[str, Any]] = [
    {
        "id": "daily-20250717",
        "name": "Daily Backup",
        "created_at": (datetime.utcnow() - timedelta(days=1)).isoformat(),
        "size": "4.2 MB",
        "status": "completed",
    }
]

_fake_schedule = {
    "enabled": True,
    "frequency": "daily",
    "time": "02:00",
    "retention_days": 7,
    "next_run": (datetime.utcnow() + timedelta(days=1)).replace(hour=2, minute=0, second=0).isoformat(),
}


class CreateBackupPayload(BaseModel):
    name: str


class SchedulePayload(BaseModel):
    enabled: bool
    frequency: str
    time: str
    retention_days: int


@router.get("/backups")
def list_backups(user: Dict[str, Any] = Depends(require_admin)):
    return {"backups": _fake_backups}


@router.post("/backups")
def create_backup(payload: CreateBackupPayload, user: Dict[str, Any] = Depends(require_admin)):
    backup = {
        "id": f"manual-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}",
        "name": payload.name,
        "created_at": datetime.utcnow().isoformat(),
        "size": "4.2 MB",
        "status": "completed",
    }
    _fake_backups.insert(0, backup)
    return {"success": True, "backup": backup}


@router.post("/backups/{backup_id}/restore")
def restore_backup(backup_id: str, user: Dict[str, Any] = Depends(require_admin)):
    for b in _fake_backups:
        if b["id"] == backup_id:
            return {"success": True, "message": f"Restored {b['name']}"}
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Backup not found")


@router.delete("/backups/{backup_id}")
def delete_backup(backup_id: str, user: Dict[str, Any] = Depends(require_admin)):
    global _fake_backups
    original = len(_fake_backups)
    _fake_backups = [b for b in _fake_backups if b["id"] != backup_id]
    if len(_fake_backups) == original:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Backup not found")
    return {"success": True, "message": "Backup deleted"}


@router.get("/schedule")
def get_schedule(user: Dict[str, Any] = Depends(require_admin)):
    return {"schedule": _fake_schedule}


@router.put("/schedule")
def update_schedule(payload: SchedulePayload, user: Dict[str, Any] = Depends(require_admin)):
    _fake_schedule.update(payload.dict())
    _fake_schedule["next_run"] = (datetime.utcnow() + timedelta(days=1)).replace(hour=2, minute=0, second=0).isoformat()
    return {"success": True, "schedule": _fake_schedule}

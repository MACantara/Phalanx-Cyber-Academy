from typing import Any, Dict
from fastapi import APIRouter, Depends, HTTPException, status

from app.dependencies import get_current_user
from app.services.session_service import Session

router = APIRouter()


@router.post("/start")
def start_session(
    payload: Dict[str, Any],
    user: Dict[str, Any] = Depends(get_current_user),
):
    session_name = payload.get("session_name")
    level_id = payload.get("level_id")
    if not session_name:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="session_name is required")

    session = Session.start_session(
        user_id=user["id"],
        session_name=session_name,
        level_id=level_id,
    )
    return {"success": True, "session": session.to_dict()}


@router.post("/{session_id}/end")
def end_session(
    session_id: int,
    payload: Dict[str, Any],
    user: Dict[str, Any] = Depends(get_current_user),
):
    score = payload.get("score")
    session = Session.end_session(session_id=session_id, score=score)
    return {"success": True, "session": session.to_dict()}


@router.get("/")
def get_user_sessions(
    user: Dict[str, Any] = Depends(get_current_user),
    limit: int = 20,
    offset: int = 0,
):
    sessions = Session.get_user_sessions(user_id=user["id"], limit=limit, offset=offset)
    return {"sessions": [s.to_dict() for s in sessions]}


@router.get("/progress")
def get_progress(user: Dict[str, Any] = Depends(get_current_user)):
    progress = Session.get_user_progress_summary(user_id=user["id"])
    progress["total_xp"] = user.get("total_xp", 0)
    progress["profile_id"] = user["id"]
    return progress

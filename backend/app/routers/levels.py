import json
from pathlib import Path
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, status

from app.dependencies import get_current_user, optional_current_user
from app.services.level_service import Level
from app.services.session_service import Session

router = APIRouter()


def _level_content_path(level_id: int) -> Path:
    return Path(__file__).resolve().parent.parent / "data" / "level_content" / f"level_{level_id}" / "data.json"


def _compute_unlocked(levels: List[Level], completed_level_ids: set) -> List[Dict[str, Any]]:
    completed = set(completed_level_ids)
    result = []
    for level in levels:
        data = level.to_dict()
        data["unlocked"] = bool(not level.coming_soon)
        data["completed"] = level.level_id in completed
        result.append(data)
    return result


@router.get("/")
def list_levels(user: Optional[Dict[str, Any]] = Depends(optional_current_user)):
    """List all levels. Levels that are not coming soon are marked as unlocked."""
    levels = Level.get_all_levels()
    completed_level_ids = set()
    if user is not None:
        try:
            summary = Session.get_user_progress_summary(user["id"])
            completed_level_ids = set(summary.get("completed_level_ids", []))
        except Exception:
            pass
    return {"levels": _compute_unlocked(levels, completed_level_ids)}


@router.get("/available")
def list_available_levels():
    """List unlocked, available levels."""
    levels = Level.get_available_levels()
    return {"levels": [level.to_dict() for level in levels]}


@router.get("/{level_id}")
def get_level(level_id: int, user: Dict[str, Any] = Depends(get_current_user)):
    """Get a single level by level_id."""
    level = Level.get_by_level_id(level_id)
    if not level:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Level not found",
        )
    return level.to_dict()


@router.get("/{level_id}/content")
def get_level_content(level_id: int, user: Dict[str, Any] = Depends(get_current_user)):
    """Get the interactive content bundle for a level."""
    level = Level.get_by_level_id(level_id)
    if not level:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Level not found",
        )
    content_path = _level_content_path(level_id)
    if not content_path.is_file():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Level content not found",
        )
    try:
        data = json.loads(content_path.read_text(encoding="utf-8"))
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to read level content: {exc}",
        )
    return data

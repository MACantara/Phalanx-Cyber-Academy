import json
from pathlib import Path
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, Header, HTTPException, status

from app.dependencies import get_current_user
from app.services.level_service import Level
from app.services.session_service import Session

router = APIRouter()


def _level_content_path(level_id: int) -> Path:
    return Path(__file__).resolve().parent.parent / "data" / "level_content" / f"level_{level_id}" / "data.json"


def _compute_unlocked(levels: List[Level], completed_level_ids: set) -> List[Dict[str, Any]]:
    completed = set(completed_level_ids)
    result = []
    for level in levels:
        is_first = level.level_id == 1
        previous_completed = level.level_id is not None and (level.level_id - 1) in completed
        is_unlocked = bool(
            level.unlocked and not level.coming_soon and (is_first or previous_completed or level.level_id in completed)
        )
        data = level.to_dict()
        data["unlocked"] = is_unlocked
        data["completed"] = level.level_id in completed
        result.append(data)
    return result


@router.get("/")
def list_levels(x_user_id: Optional[int] = Header(None)):
    """List all levels. If X-User-Id is provided, levels are unlocked sequentially based on completed sessions."""
    levels = Level.get_all_levels()
    completed_level_ids = set()
    if x_user_id is not None:
        try:
            summary = Session.get_user_progress_summary(x_user_id)
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

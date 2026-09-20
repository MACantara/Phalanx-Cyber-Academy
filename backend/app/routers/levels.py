import json
from pathlib import Path
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, status

from app.dependencies import get_current_user, optional_current_user
from app.services.content_service import resolve_content_refs
from app.services import level_content_service
from app.services.level_service import Level

router = APIRouter()


def _level_content_path(level_id: int) -> Path:
    return Path(__file__).resolve().parent.parent / "data" / "level_content" / f"level_{level_id}" / "data.json"


def _compute_unlocked(levels: List[Level], progress_map: Dict[int, Dict[str, Any]]) -> List[Dict[str, Any]]:
    result = []
    for level in levels:
        data = level.to_dict()
        progress = progress_map.get(level.level_id)
        data["unlocked"] = bool(not level.coming_soon)
        data["completed"] = progress is not None and progress["completed_at"] is not None
        data["progress"] = progress
        result.append(data)
    return result


@router.get("/")
def list_levels(user: Optional[Dict[str, Any]] = Depends(optional_current_user)):
    """List all levels with per-user lesson progress when signed in."""
    from app.services import level_progress_service

    levels = Level.get_all_levels()
    progress_map: Dict[int, Dict[str, Any]] = {}
    if user is not None:
        try:
            progress_map = level_progress_service.get_map_for_user(user["id"])
        except Exception:
            pass
    return {"levels": _compute_unlocked(levels, progress_map)}


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
    """Get the interactive content bundle for a level.

    Content comes from the published `level_content.payload` when present
    (the authored source of truth), falling back to the bundled data.json
    for unseeded rows. Any `lib:kind:key` refs are resolved against the
    content library."""
    level = Level.get_by_level_id(level_id)
    if not level:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Level not found",
        )

    data = level_content_service.get_payload(level_id)

    if data is None:
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

    try:
        return resolve_content_refs(data)
    except Exception:
        # Resolution failure should not take the level down — serve unresolved
        return data

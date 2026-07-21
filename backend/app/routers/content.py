import json
import os
from typing import Any, Dict
from fastapi import APIRouter, Depends, HTTPException, status

from app.dependencies import get_current_user

router = APIRouter()

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "level_content")


def _load_json(path: str) -> Dict[str, Any]:
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content not found",
        )
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Invalid content data",
        )


@router.get("/{level_id}/content")
def get_level_content(level_id: int, user: dict = Depends(get_current_user)):
    """Return the full simulated-PC content for a level."""
    level_dir = os.path.join(DATA_DIR, f"level_{level_id}")
    if not os.path.isdir(level_dir):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Content for level {level_id} not found",
        )

    config = _load_json(os.path.join(level_dir, "config.json"))
    dialogues = _load_json(os.path.join(level_dir, "dialogues.json"))
    data = _load_json(os.path.join(level_dir, "data.json"))

    return {
        "level_id": level_id,
        "config": config,
        "dialogues": dialogues,
        "data": data,
    }


@router.get("/blue-vs-red/content")
def get_bvr_content(user: dict = Depends(get_current_user)):
    """Return the Blue vs Red mode content (placeholder until migrated)."""
    path = os.path.join(DATA_DIR, "bvr_content.json")
    if not os.path.exists(path):
        return {
            "status": "not_migrated",
            "message": "Blue vs Red content migration is in progress.",
        }
    return _load_json(path)

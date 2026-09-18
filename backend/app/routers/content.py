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

from typing import Any, Dict, List
from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field

from app.dependencies import get_current_user
from app.errors import DatabaseError, handle_supabase_error
from app.services.user_service import User
from app.services.xp_service import calculate_level_xp, get_user_level_info
from app.services.xp_award import XPManager
from app.services.xp_history_service import XPHistory
from app.supabase_client import get_supabase

router = APIRouter()


class XPCalculatePayload(BaseModel):
    level_id: int = Field(..., ge=1)
    score: int | None = Field(None, ge=0, le=100)
    time_spent: int | None = Field(None, ge=0)
    difficulty: str = "medium"


@router.post("/calculate")
def calculate_xp(
    payload: XPCalculatePayload,
    user: Dict[str, Any] = Depends(get_current_user),
):
    """Preview XP calculation for a given performance."""
    result = calculate_level_xp(
        level_id=payload.level_id,
        score=payload.score,
        time_spent=payload.time_spent,
        difficulty=payload.difficulty,
    )
    return {"calculation": result}


@router.get("/user-level/{total_xp}")
def user_level(total_xp: int, user: Dict[str, Any] = Depends(get_current_user)):
    """Get user level information from total XP."""
    return get_user_level_info(total_xp)


class XPAwardPayload(BaseModel):
    level_id: int = Field(..., ge=1)
    score: int | None = Field(None, ge=0, le=100)
    time_spent: int | None = Field(None, ge=0)
    difficulty: str = "medium"
    session_id: int | None = None
    reason: str = "level_completion"


@router.post("/award")
def award_xp(payload: XPAwardPayload, user: Dict[str, Any] = Depends(get_current_user)):
    """Award XP for a level completion."""
    result = XPManager.award_xp(
        user_id=user["id"],
        level_id=payload.level_id,
        score=payload.score,
        time_spent=payload.time_spent,
        difficulty=payload.difficulty,
        session_id=payload.session_id,
        reason=payload.reason,
    )
    return {"success": True, "award": result}


@router.get("/leaderboard")
def xp_leaderboard(limit: int = 10):
    """Get top users by XP."""
    return {"leaderboard": XPManager.get_leaderboard(limit)}


@router.get("/history")
def xp_history(limit: int = 20, user: Dict[str, Any] = Depends(get_current_user)):
    """Get the current user's XP history."""
    entries = XPHistory.get_by_user_id(user["id"], limit)
    return {"history": [entry.to_dict() for entry in entries]}


@router.get("/config")
def xp_config():
    """Return the public XP calculation constants used by the frontend."""
    from app.services.xp_service import XPCalculator

    return {
        "base_xp": XPCalculator.BASE_XP,
        "score_multipliers": XPCalculator.SCORE_MULTIPLIERS,
        "time_bonus_thresholds": XPCalculator.TIME_BONUS_THRESHOLDS,
        "base_times": XPCalculator.BASE_TIMES,
    }


@router.post("/recalculate")
def recalculate_xp(user: Dict[str, Any] = Depends(get_current_user)):
    """Recalculate the current user's total XP from session history and persist it."""
    total = XPHistory.calculate_user_total_xp(user["id"])
    target = User.find_by_id(user["id"])
    if not target:
        return {"success": False, "error": "User not found"}
    target.total_xp = total
    target.save()
    return {"success": True, "total_xp": total}


@router.get("/badges")
def xp_badges(user: Dict[str, Any] = Depends(get_current_user)):
    """Return the current user's earned badges alongside the badge catalog."""
    try:
        supabase = get_supabase()
        badges_data = handle_supabase_error(supabase.table("badges").select("*").execute()) or []
        user_badges_data = handle_supabase_error(
            supabase.table("user_badges").select("*").eq("user_id", user["id"]).execute()
        ) or []
        earned_ids = {ub["badge_id"] for ub in user_badges_data}
        return {
            "user_id": user["id"],
            "badges": [
                {"id": b["id"], "name": b["name"], "description": b["description"], "icon": b.get("icon"), "category": b.get("category"), "earned": b["id"] in earned_ids}
                for b in badges_data
            ],
        }
    except Exception as e:
        raise DatabaseError(f"Failed to load badges: {e}")


@router.get("/streak")
def xp_streak(user: Dict[str, Any] = Depends(get_current_user)):
    """Return the current user's daily login streak."""
    try:
        supabase = get_supabase()
        response = supabase.table("user_streaks").select("*").eq("user_id", user["id"]).execute()
        data = handle_supabase_error(response)
        if data:
            streak = data[0]
        else:
            streak = {
                "user_id": user["id"],
                "current_streak": 0,
                "longest_streak": 0,
                "last_login_date": None,
            }
        return {"user_id": user["id"], "streak": streak}
    except Exception as e:
        raise DatabaseError(f"Failed to load streak: {e}")

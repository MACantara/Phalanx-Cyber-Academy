"""
XP award manager
Wraps XPCalculator and persists XP awards to user totals and history
"""
from typing import Any, Dict, List, Optional
from app.errors import DatabaseError, handle_supabase_error
from app.services.xp_service import XPCalculator
from app.services.user_service import User
from app.services.xp_history_service import XPHistory
from app.supabase_client import get_supabase


class XPManager:
    """Manages XP operations for users"""

    @classmethod
    def award_xp(
        cls,
        user_id: int,
        level_id: int,
        score: Optional[int] = None,
        time_spent: Optional[int] = None,
        difficulty: str = "medium",
        session_id: Optional[int] = None,
        reason: str = "level_completion",
    ) -> Dict[str, Any]:
        try:
            xp_calculation = XPCalculator.calculate_level_xp(
                level_id, score, time_spent, difficulty
            )
            xp_earned = xp_calculation["xp_earned"]

            user = User.find_by_id(user_id)
            if not user:
                raise ValueError(f"User {user_id} not found")

            old_total = user.total_xp or 0
            new_total = old_total + xp_earned

            user.total_xp = new_total
            user.save()

            xp_entry = XPHistory.create_entry(
                xp_change=xp_earned,
                reason=reason,
                balance_before=old_total,
                balance_after=new_total,
                session_id=session_id,
            )

            awarded_badges = cls._sync_badges(user_id, new_total)

            return {
                "xp_awarded": xp_earned,
                "old_total": old_total,
                "new_total": new_total,
                "calculation_details": xp_calculation,
                "history_entry_id": xp_entry.id,
                "awarded_badges": awarded_badges,
            }
        except Exception as e:
            raise DatabaseError(f"Failed to award XP: {str(e)}")

    @classmethod
    def award_session_xp(
        cls,
        user_id: int,
        session_name: str,
        score: Optional[int] = None,
        time_spent: Optional[int] = None,
        level_id: Optional[int] = None,
        session_id: Optional[int] = None,
        reason: str = "session_completion",
    ) -> Dict[str, Any]:
        try:
            if level_id is not None:
                from app.services.level_service import Level
                level = Level.get_by_level_id(level_id)
                difficulty = level.difficulty if level else "medium"
                xp_calculation = XPCalculator.calculate_level_xp(
                    level_id, score, time_spent, difficulty
                )
            else:
                base_xp = 50
                if score is not None:
                    multiplier = cls._get_score_multiplier_for_session(score)
                    xp_earned = int(base_xp * multiplier)
                else:
                    xp_earned = base_xp
                    multiplier = 1.0

                xp_calculation = {
                    "xp_earned": xp_earned,
                    "breakdown": {
                        "base_xp": base_xp,
                        "score_multiplier": multiplier,
                        "total_xp": xp_earned,
                    },
                    "calculation_details": {
                        "session_type": "non_level",
                        "session_name": session_name,
                        "score": score,
                    },
                }

            xp_earned = xp_calculation["xp_earned"]

            user = User.find_by_id(user_id)
            if not user:
                raise ValueError(f"User {user_id} not found")

            old_total = user.total_xp or 0
            new_total = old_total + xp_earned

            user.total_xp = new_total
            user.save()

            xp_entry = XPHistory.create_entry(
                xp_change=xp_earned,
                reason=reason,
                balance_before=old_total,
                balance_after=new_total,
                session_id=session_id,
            )

            awarded_badges = cls._sync_badges(user_id, new_total)

            return {
                "xp_awarded": xp_earned,
                "old_total": old_total,
                "new_total": new_total,
                "calculation_details": xp_calculation,
                "history_entry_id": xp_entry.id,
                "awarded_badges": awarded_badges,
            }
        except Exception as e:
            raise DatabaseError(f"Failed to award session XP: {str(e)}")

    @classmethod
    def recalculate_user_total_xp(cls, user_id: int) -> Dict[str, Any]:
        try:
            total_xp = XPHistory.calculate_user_total_xp(user_id)
            user = User.find_by_id(user_id)
            if not user:
                raise ValueError(f"User {user_id} not found")

            old_total = user.total_xp or 0
            user.total_xp = total_xp
            user.save()

            awarded_badges = cls._sync_badges(user_id, total_xp)

            return {
                "user_id": user_id,
                "old_total": old_total,
                "new_total": total_xp,
                "difference": total_xp - old_total,
                "awarded_badges": awarded_badges,
            }
        except Exception as e:
            raise DatabaseError(f"Failed to recalculate user XP: {str(e)}")

    @classmethod
    def get_leaderboard(cls, limit: int = 10) -> List[Dict[str, Any]]:
        try:
            leaderboard_data = XPHistory.get_xp_leaderboard_data(limit)
            leaderboard = []
            for entry in leaderboard_data:
                user = User.find_by_id(entry["user_id"])
                if user:
                    level_info = XPCalculator.get_user_level(entry["total_xp"])
                    leaderboard.append({
                        "rank": entry["rank"],
                        "user_id": entry["user_id"],
                        "username": user.username,
                        "total_xp": entry["total_xp"],
                        "level": level_info["level"],
                    })
            return leaderboard
        except Exception as e:
            raise DatabaseError(f"Failed to get leaderboard: {str(e)}")

    @classmethod
    def _sync_badges(cls, user_id: int, total_xp: int) -> List[int]:
        """Award any badges whose xp_threshold the user has now crossed."""
        try:
            supabase = get_supabase()
            badges_response = supabase.table("badges").select("*").lte("xp_threshold", total_xp).execute()
            badges = handle_supabase_error(badges_response) or []
            if not badges:
                return []

            user_badges_response = (
                supabase.table("user_badges")
                .select("badge_id")
                .eq("user_id", user_id)
                .execute()
            )
            earned = {ub["badge_id"] for ub in handle_supabase_error(user_badges_response) or []}

            awarded: List[int] = []
            for badge in badges:
                badge_id = badge["id"]
                if badge_id in earned:
                    continue
                insert_response = supabase.table("user_badges").insert({
                    "user_id": user_id,
                    "badge_id": badge_id,
                }).execute()
                if handle_supabase_error(insert_response):
                    awarded.append(badge_id)
            return awarded
        except Exception:
            # Badge sync is best-effort; do not block XP awarding.
            return []

    @classmethod
    def _get_score_multiplier_for_session(cls, score: int) -> float:
        if score >= 90:
            return 1.5
        elif score >= 80:
            return 1.2
        elif score >= 70:
            return 1.0
        elif score >= 60:
            return 0.9
        else:
            return 0.8


def award_user_xp(
    user_id: int,
    level_id: int,
    score: Optional[int] = None,
    time_spent: Optional[int] = None,
    difficulty: str = "medium",
) -> Dict[str, Any]:
    return XPManager.award_xp(
        user_id=user_id,
        level_id=level_id,
        score=score,
        time_spent=time_spent,
        difficulty=difficulty,
        reason="level_completion",
    )

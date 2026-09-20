"""
XP award manager
Wraps XPCalculator and persists XP awards to user totals and history
"""
import uuid
from typing import Any, Dict, List, Optional

from sqlalchemy import select

from app.db import session_scope
from app.errors import DatabaseError
from app.models import Badge, UserBadge
from app.services.xp_service import XPCalculator
from app.services.user_service import User
from app.services.xp_history_service import XPHistory


class XPManager:
    """Manages XP operations for users"""

    @classmethod
    def award_xp(
        cls,
        user_id: str,
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
                user_id=user_id,
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
        user_id: str,
        session_name: str,
        score: Optional[int] = None,
        time_spent: Optional[int] = None,
        level_id: Optional[int] = None,
        session_id: Optional[int] = None,
        reason: str = "session_completion",
        breakdown: Optional[Dict[str, Any]] = None,
        first_clear: bool = False,
    ) -> Dict[str, Any]:
        try:
            if level_id is not None:
                from app.services.level_service import Level
                level = Level.get_by_level_id(level_id)
                difficulty = level.difficulty if level else "medium"
                xp_calculation = XPCalculator.calculate_level_xp(
                    level_id, score, time_spent, difficulty,
                    breakdown=breakdown, first_clear=first_clear,
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
                user_id=user_id,
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
    def award_lesson_xp(
        cls,
        user_id: str,
        level_id: int,
        session_id: int,
        lesson_index: int,
        lessons_total: int,
        competence: Optional[float] = None,
    ) -> Dict[str, Any]:
        """Award XP for one banked lesson. Idempotent — the
        uq_xp_lesson_award index plus this pre-check mean re-awarding the
        same lesson is a no-op returning already_awarded."""
        try:
            uuid.UUID(str(user_id))
        except (ValueError, AttributeError):
            raise DatabaseError(f"Failed to award lesson XP: invalid user_id {user_id}")

        from app.services.level_service import Level
        from app.models import XPHistory as XPHistoryRow

        level = Level.get_by_level_id(level_id)
        difficulty = level.difficulty if level else "medium"
        xp_calculation = XPCalculator.calculate_lesson_xp(
            difficulty, lessons_total, competence
        )
        xp_earned = xp_calculation["xp_earned"]

        try:
            with session_scope() as session:
                already = session.execute(
                    select(XPHistoryRow.id).where(
                        XPHistoryRow.session_id == session_id,
                        XPHistoryRow.lesson_index == lesson_index,
                        XPHistoryRow.reason == "lesson_completion",
                    )
                ).scalar_one_or_none()
        except SQLAlchemyError as e:
            raise DatabaseError(f"Failed to check lesson award: {e}")
        if already is not None:
            return {
                "xp_awarded": 0,
                "already_awarded": True,
                "calculation_details": xp_calculation,
            }

        try:
            user = User.find_by_id(user_id)
            if not user:
                raise ValueError(f"User {user_id} not found")
            old_total = user.total_xp or 0
            new_total = old_total + xp_earned
            user.total_xp = new_total
            user.save()

            xp_entry = XPHistory.create_entry(
                xp_change=xp_earned,
                reason="lesson_completion",
                balance_before=old_total,
                balance_after=new_total,
                session_id=session_id,
                user_id=user_id,
                lesson_index=lesson_index,
            )
            awarded_badges = cls._sync_badges(user_id, new_total)
            return {
                "xp_awarded": xp_earned,
                "already_awarded": False,
                "old_total": old_total,
                "new_total": new_total,
                "calculation_details": xp_calculation,
                "history_entry_id": xp_entry.id,
                "awarded_badges": awarded_badges,
            }
        except Exception as e:
            # Unique-index race: another request banked this lesson first.
            if "uq_xp_lesson_award" in str(e):
                return {
                    "xp_awarded": 0,
                    "already_awarded": True,
                    "calculation_details": xp_calculation,
                }
            raise DatabaseError(f"Failed to award lesson XP: {e}")

    @classmethod
    def award_first_clear_bonus(
        cls,
        user_id: str,
        level_id: int,
        session_id: Optional[int] = None,
    ) -> Dict[str, Any]:
        """One-time first-clear bonus for lesson-tracked sessions — the
        per-lesson awards already banked the base XP, so level completion
        adds only this bonus. `first_clear` in level_progress is set once
        per (profile, level), which gates repeat awards."""
        from app.services.level_service import Level

        level = Level.get_by_level_id(level_id)
        difficulty = level.difficulty if level else "medium"
        base_xp = XPCalculator.BASE_XP.get(difficulty.lower(), XPCalculator.BASE_XP["medium"])
        xp_earned = int(round(base_xp * XPCalculator.FIRST_CLEAR_RATIO))

        user = User.find_by_id(user_id)
        if not user:
            raise ValueError(f"User {user_id} not found")
        old_total = user.total_xp or 0
        new_total = old_total + xp_earned
        user.total_xp = new_total
        user.save()

        xp_entry = XPHistory.create_entry(
            xp_change=xp_earned,
            reason="first_clear",
            balance_before=old_total,
            balance_after=new_total,
            session_id=session_id,
            user_id=user_id,
        )
        awarded_badges = cls._sync_badges(user_id, new_total)
        return {
            "xp_awarded": xp_earned,
            "old_total": old_total,
            "new_total": new_total,
            "calculation_details": {"first_clear_bonus": xp_earned, "base_xp": base_xp},
            "history_entry_id": xp_entry.id,
            "awarded_badges": awarded_badges,
        }

    @classmethod
    def recalculate_user_total_xp(cls, user_id: str) -> Dict[str, Any]:
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
                "profile_id": user_id,
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
    def _sync_badges(cls, user_id: str, total_xp: int) -> List[int]:
        """Award any badges whose xp_threshold the user has now crossed."""
        try:
            uid = uuid.UUID(str(user_id))
        except (ValueError, AttributeError):
            return []
        try:
            with session_scope() as session:
                badges = session.execute(
                    select(Badge).where(Badge.xp_threshold <= total_xp)
                ).scalars().all()
                if not badges:
                    return []

                earned = set(
                    session.execute(
                        select(UserBadge.badge_id).where(UserBadge.profile_id == uid)
                    ).scalars().all()
                )

                awarded: List[int] = []
                for badge in badges:
                    if badge.id in earned:
                        continue
                    session.add(UserBadge(profile_id=uid, badge_id=badge.id))
                    session.flush()
                    awarded.append(badge.id)
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
    user_id: str,
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

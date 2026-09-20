"""
XP calculation service
Handles XP calculations and user-level logic
"""
from typing import Any, Dict, Optional
import math


class XPCalculator:
    """Handles XP calculations based on level completion"""

    BASE_XP = {
        "easy": 50,
        "medium": 100,
        "intermediate": 150,
        "hard": 200,
        "expert": 300,
    }

    # Competence blend: verdict accuracy weighs more than evidence precision —
    # getting the call right matters most, but citing the evidence is what
    # proves it wasn't a guess.
    VERDICT_WEIGHT = 0.6
    EVIDENCE_WEIGHT = 0.4

    FIRST_CLEAR_RATIO = 0.25

    @classmethod
    def calculate_level_xp(
        cls,
        level_id: int,
        score: Optional[int] = None,
        time_spent: Optional[int] = None,
        difficulty: str = "medium",
        breakdown: Optional[Dict[str, Any]] = None,
        first_clear: bool = False,
    ) -> Dict[str, Any]:
        """XP for completing a level.

        Competence replaces the old score×time multiplier stack: the sim
        reports verdict/evidence accuracy in `breakdown`; legacy callers send
        only `score` (0–100), which maps to competence directly. Time is not
        rewarded — speed bonuses train the click-through behavior the
        mechanics are designed to remove.
        """
        try:
            base_xp = cls.BASE_XP.get(difficulty.lower(), cls.BASE_XP["medium"])

            breakdown = breakdown or {}
            verdict_acc = breakdown.get("verdict_acc")
            evidence_acc = breakdown.get("evidence_acc")
            if verdict_acc is not None and evidence_acc is not None:
                competence = (
                    cls.VERDICT_WEIGHT * float(verdict_acc)
                    + cls.EVIDENCE_WEIGHT * float(evidence_acc)
                )
            elif breakdown.get("max_score"):
                competence = float(score or 0) / float(breakdown["max_score"])
            else:
                competence = float(score or 0) / 100.0
            competence = max(0.0, min(1.0, competence))

            first_clear_bonus = int(base_xp * cls.FIRST_CLEAR_RATIO) if first_clear else 0
            total_xp = int(round(base_xp * competence)) + first_clear_bonus

            return {
                "xp_earned": total_xp,
                "breakdown": {
                    "base_xp": base_xp,
                    "competence": round(competence, 3),
                    "verdict_acc": verdict_acc,
                    "evidence_acc": evidence_acc,
                    "first_clear_bonus": first_clear_bonus,
                    "total_xp": total_xp,
                },
                "calculation_details": {
                    "difficulty": difficulty,
                    "score": score,
                    "time_spent": time_spent,
                },
            }
        except Exception as e:
            raise ValueError(f"Failed to calculate XP: {str(e)}")

    @classmethod
    def _get_first_time_bonus(cls, level_id: int) -> int:
        return 25

    @classmethod
    def calculate_lesson_xp(
        cls,
        difficulty: str,
        lessons_total: int,
        competence: Optional[float] = None,
    ) -> Dict[str, Any]:
        """Per-lesson award for chunked environment levels.

        The level's base XP is split evenly across its lessons and scaled by
        competence (0..1) — the composite accuracy the sim reports. No time
        multiplier: speed is not the skill being trained."""
        try:
            base_xp = cls.BASE_XP.get(difficulty.lower(), cls.BASE_XP["medium"])
            comp = 1.0 if competence is None else max(0.0, min(1.0, competence))
            total = max(1, lessons_total)
            xp_earned = int(round(base_xp * comp / total))
            return {
                "xp_earned": xp_earned,
                "breakdown": {
                    "base_xp": base_xp,
                    "competence": comp,
                    "lessons_total": total,
                    "total_xp": xp_earned,
                },
            }
        except Exception as e:
            raise ValueError(f"Failed to calculate lesson XP: {str(e)}")

    @classmethod
    def get_user_level(cls, total_xp: int) -> Dict[str, Any]:
        """Calculate user level based on total XP."""
        if total_xp < 0:
            return {"level": 0, "xp_for_next": 100, "xp_in_current": 0, "progress_percent": 0}

        level = int(math.sqrt(total_xp / 100))
        current_level_xp = level * level * 100
        next_level_xp = (level + 1) * (level + 1) * 100
        xp_in_current = total_xp - current_level_xp
        xp_for_next = next_level_xp - total_xp
        progress_percent = (xp_in_current / (next_level_xp - current_level_xp)) * 100

        return {
            "level": level,
            "xp_for_next": xp_for_next,
            "xp_in_current": xp_in_current,
            "progress_percent": round(progress_percent, 1),
            "current_level_total_xp": next_level_xp - current_level_xp,
        }


def calculate_level_xp(
    level_id: int,
    score: Optional[int] = None,
    time_spent: Optional[int] = None,
    difficulty: str = "medium",
) -> Dict[str, Any]:
    return XPCalculator.calculate_level_xp(level_id, score, time_spent, difficulty)


def get_user_level_info(total_xp: int) -> Dict[str, Any]:
    return XPCalculator.get_user_level(total_xp)

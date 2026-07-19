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

    SCORE_MULTIPLIERS = {
        "perfect": 2.0,
        "excellent": 1.5,
        "good": 1.2,
        "average": 1.0,
        "below_average": 0.8,
    }

    TIME_BONUS_THRESHOLDS = {
        "lightning": 1.5,
        "fast": 1.2,
        "normal": 1.0,
        "slow": 0.9,
    }

    BASE_TIMES = {
        "easy": 300,
        "medium": 600,
        "hard": 900,
        "expert": 1200,
    }

    @classmethod
    def calculate_level_xp(
        cls,
        level_id: int,
        score: Optional[int] = None,
        time_spent: Optional[int] = None,
        difficulty: str = "medium",
    ) -> Dict[str, Any]:
        try:
            base_xp = cls.BASE_XP.get(difficulty.lower(), cls.BASE_XP["medium"])

            score_multiplier = cls._get_score_multiplier(score)
            time_multiplier = cls._get_time_multiplier(level_id, time_spent, difficulty)
            first_time_bonus = cls._get_first_time_bonus(level_id)

            xp_from_score = base_xp * score_multiplier
            xp_from_time = xp_from_score * time_multiplier
            total_xp = int(xp_from_time + first_time_bonus)

            return {
                "xp_earned": total_xp,
                "breakdown": {
                    "base_xp": base_xp,
                    "score_multiplier": score_multiplier,
                    "time_multiplier": time_multiplier,
                    "first_time_bonus": first_time_bonus,
                    "score_xp": int(xp_from_score),
                    "time_xp": int(xp_from_time),
                    "total_xp": total_xp,
                },
                "calculation_details": {
                    "difficulty": difficulty,
                    "score": score,
                    "time_spent": time_spent,
                    "score_category": cls._get_score_category(score),
                    "time_category": cls._get_time_category(level_id, time_spent, difficulty),
                },
            }
        except Exception as e:
            raise ValueError(f"Failed to calculate XP: {str(e)}")

    @classmethod
    def _get_score_multiplier(cls, score: Optional[int]) -> float:
        if score is None:
            return 1.0
        if score >= 100:
            return cls.SCORE_MULTIPLIERS["perfect"]
        elif score >= 90:
            return cls.SCORE_MULTIPLIERS["excellent"]
        elif score >= 80:
            return cls.SCORE_MULTIPLIERS["good"]
        elif score >= 70:
            return cls.SCORE_MULTIPLIERS["average"]
        else:
            return cls.SCORE_MULTIPLIERS["below_average"]

    @classmethod
    def _get_score_category(cls, score: Optional[int]) -> str:
        if score is None:
            return "unknown"
        if score >= 100:
            return "perfect"
        elif score >= 90:
            return "excellent"
        elif score >= 80:
            return "good"
        elif score >= 70:
            return "average"
        else:
            return "below_average"

    @classmethod
    def _get_time_multiplier(cls, level_id: int, time_spent: Optional[int], difficulty: str) -> float:
        if time_spent is None:
            return 1.0
        expected_time = cls._get_expected_time(level_id, difficulty)
        if time_spent <= expected_time * 0.5:
            return cls.TIME_BONUS_THRESHOLDS["lightning"]
        elif time_spent <= expected_time * 0.75:
            return cls.TIME_BONUS_THRESHOLDS["fast"]
        elif time_spent <= expected_time * 1.5:
            return cls.TIME_BONUS_THRESHOLDS["normal"]
        else:
            return cls.TIME_BONUS_THRESHOLDS["slow"]

    @classmethod
    def _get_time_category(cls, level_id: int, time_spent: Optional[int], difficulty: str) -> str:
        if time_spent is None:
            return "unknown"
        expected_time = cls._get_expected_time(level_id, difficulty)
        if time_spent <= expected_time * 0.5:
            return "lightning"
        elif time_spent <= expected_time * 0.75:
            return "fast"
        elif time_spent <= expected_time * 1.5:
            return "normal"
        else:
            return "slow"

    @classmethod
    def _get_expected_time(cls, level_id: int, difficulty: str) -> int:
        return cls.BASE_TIMES.get(difficulty.lower(), cls.BASE_TIMES["medium"])

    @classmethod
    def _get_first_time_bonus(cls, level_id: int) -> int:
        return 25

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

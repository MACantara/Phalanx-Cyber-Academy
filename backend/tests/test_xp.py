import pytest
from app.services.xp_service import XPCalculator, calculate_level_xp


def test_calculate_level_xp_with_perfect_score():
    result = calculate_level_xp(level_id=1, score=100, time_spent=300, difficulty="easy")
    assert result["xp_earned"] > 0
    assert result["breakdown"]["score_multiplier"] == 2.0


def test_calculate_level_xp_default_multiplier():
    result = calculate_level_xp(level_id=1, difficulty="medium")
    assert result["xp_earned"] == 125  # base 100 + first time bonus 25


def test_get_user_level():
    info = XPCalculator.get_user_level(0)
    assert info["level"] == 0

    info = XPCalculator.get_user_level(500)
    assert info["level"] == 2

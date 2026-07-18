"""
Unit tests for XP calculation and user level logic.
"""
from app.utils.xp import XPCalculator, XPManager


def test_xp_calculator_defaults():
    """XP calculation with default difficulty medium and no score/time."""
    result = XPCalculator.calculate_level_xp(level_id=1)
    assert result['xp_earned'] > 0
    assert result['breakdown']['base_xp'] == 100
    assert result['breakdown']['score_multiplier'] == 1.0
    assert result['breakdown']['time_multiplier'] == 1.0


def test_xp_calculator_perfect_score():
    """Perfect score on an easy level returns max multiplier."""
    result = XPCalculator.calculate_level_xp(
        level_id=1,
        score=100,
        time_spent=60,
        difficulty='easy'
    )
    assert result['breakdown']['score_multiplier'] == 2.0
    assert result['calculation_details']['score_category'] == 'perfect'


def test_xp_calculator_below_average_score():
    """Low score returns reduced multiplier."""
    result = XPCalculator.calculate_level_xp(
        level_id=1,
        score=50,
        difficulty='medium'
    )
    assert result['breakdown']['score_multiplier'] == 0.8
    assert result['calculation_details']['score_category'] == 'below_average'


def test_xp_calculator_time_bonus():
    """Lightning completion time applies 1.5x time multiplier."""
    result = XPCalculator.calculate_level_xp(
        level_id=1,
        score=80,
        time_spent=150,  # 50% of expected 300s for easy
        difficulty='easy'
    )
    assert result['breakdown']['time_multiplier'] == 1.5
    assert result['calculation_details']['time_category'] == 'lightning'


def test_user_level_zero_xp():
    """User with zero XP is at level 0."""
    info = XPManager.get_user_level(0)
    assert info['level'] == 0
    assert info['xp_for_next'] == 100


def test_user_level_exact_threshold():
    """100 XP maps exactly to level 1."""
    info = XPManager.get_user_level(100)
    assert info['level'] == 1
    assert info['xp_in_current'] == 0


def test_user_level_between_thresholds():
    """500 XP falls between level 2 (400) and level 3 (900)."""
    info = XPManager.get_user_level(500)
    assert info['level'] == 2
    assert info['xp_in_current'] == 100
    assert 0 < info['progress_percent'] <= 100

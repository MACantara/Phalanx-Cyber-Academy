"""
Quick streak utilities for simple streak checks throughout the application
"""
from typing import Dict, Any
from datetime import datetime, timedelta
from app.models.xp_history import XPHistory
from app.models.level_completion import LevelCompletion


def has_active_streak(user_id: int) -> bool:
    """
    Quick check if user has an active learning streak.
    
    Returns True if the user has activity (XP history or level completion) 
    in the last 2 days (today or yesterday).
    
    This is a lightweight version for simple boolean checks.
    """
    try:
        today = datetime.utcnow().date()
        yesterday = today - timedelta(days=1)
        
        # Check for recent XP activity
        recent_xp = XPHistory.get_user_history(user_id, limit=5)
        for entry in recent_xp:
            if entry.created_at:
                entry_date = datetime.fromisoformat(entry.created_at.replace('Z', '+00:00')).date()
                if entry_date >= yesterday:
                    return True
        
        # Check for recent level completions
        recent_completions = LevelCompletion.get_user_completions(user_id, limit=5)
        for completion in recent_completions:
            if completion.created_at:
                completion_date = datetime.fromisoformat(completion.created_at.replace('Z', '+00:00')).date()
                if completion_date >= yesterday:
                    return True
        
        return False
        
    except Exception:
        # Return False if there's any error - safe default
        return False


def get_simple_streak_count(user_id: int) -> int:
    """
    Get a simple streak count for display purposes.
    
    Returns 0 if no active streak, otherwise returns the current streak length.
    This is a lightweight version for basic display needs.
    """
    try:
        from app.utils.streak_tracker import get_user_learning_streak
        streak_info = get_user_learning_streak(user_id)
        return streak_info.get('current_streak', 0) if streak_info.get('is_active', False) else 0
    except Exception:
        return 0


def is_streak_at_risk(user_id: int) -> bool:
    """
    Check if the user's streak is at risk (no activity today, but had activity yesterday).
    
    Returns True if the streak can still be saved by activity today.
    """
    try:
        from app.utils.streak_tracker import get_user_learning_streak
        streak_info = get_user_learning_streak(user_id)
        return streak_info.get('status') == 'at_risk'
    except Exception:
        return False


def get_streak_status_emoji(user_id: int) -> str:
    """
    Get an emoji representing the current streak status.
    
    Returns appropriate emoji for display in UI elements.
    """
    try:
        from app.utils.streak_tracker import get_user_learning_streak
        streak_info = get_user_learning_streak(user_id)
        status = streak_info.get('status', 'unknown')
        
        status_emojis = {
            'active': '🔥',
            'at_risk': '⚠️',
            'broken': '💔',
            'starting': '🌟',
            'no_activity': '📚',
            'unknown': '❓'
        }
        
        return status_emojis.get(status, '📚')
        
    except Exception:
        return '📚'


def get_streak_message_brief(user_id: int) -> str:
    """
    Get a brief streak message for compact display areas.
    
    Returns a short, friendly message about the user's streak status.
    """
    try:
        from app.utils.streak_tracker import get_user_learning_streak
        streak_info = get_user_learning_streak(user_id)
        current_streak = streak_info.get('current_streak', 0)
        status = streak_info.get('status', 'unknown')
        
        if status == 'active' and current_streak > 0:
            return f"{current_streak} day streak!"
        elif status == 'at_risk':
            return "Streak at risk!"
        elif status == 'starting':
            return "Start your streak!"
        elif status == 'broken':
            return "Start fresh!"
        else:
            return "Begin learning!"
            
    except Exception:
        return "Learn today!"
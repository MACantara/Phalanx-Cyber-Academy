"""
XP Calculation and Management Utilities
Handles XP calculations, user total updates, and XP-related business logic
"""
from typing import Dict, Any, Optional, List
from sqlalchemy import func
from app.database import db, DatabaseError


class XPCalculator:
    """Handles XP calculations based on level completion"""
    
    # Base XP values by difficulty
    BASE_XP = {
        'easy': 50,
        'medium': 100,
        'hard': 200,
        'expert': 300
    }
    
    # Multipliers for different completion criteria
    SCORE_MULTIPLIERS = {
        'perfect': 2.0,     # 100% score
        'excellent': 1.5,   # 90-99% score
        'good': 1.2,        # 80-89% score
        'average': 1.0,     # 70-79% score
        'below_average': 0.8  # <70% score
    }
    
    TIME_BONUS_THRESHOLDS = {
        'lightning': 1.5,   # Completed very quickly
        'fast': 1.2,        # Completed quickly
        'normal': 1.0,      # Normal completion time
        'slow': 0.9         # Took longer than expected
    }

    @classmethod
    def calculate_level_xp(cls, level_id: int, score: Optional[int] = None, 
                          time_spent: Optional[int] = None, difficulty: str = 'medium',
                          metadata: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Calculate XP earned for a level completion
        
        Args:
            level_id: The completed level ID
            score: Score achieved (0-100)
            time_spent: Time in seconds
            difficulty: Level difficulty
            metadata: Additional completion data
            
        Returns:
            Dict with xp_earned, breakdown, and calculation details
        """
        try:
            # Get base XP for difficulty
            base_xp = cls.BASE_XP.get(difficulty.lower(), cls.BASE_XP['medium'])
            
            # Calculate score multiplier
            score_multiplier = cls._get_score_multiplier(score)
            
            # Calculate time bonus
            time_multiplier = cls._get_time_multiplier(level_id, time_spent, difficulty)
            
            # Apply first-time completion bonus
            first_time_bonus = cls._get_first_time_bonus(level_id)
            
            # Calculate final XP
            xp_from_score = base_xp * score_multiplier
            xp_from_time = xp_from_score * time_multiplier
            total_xp = int(xp_from_time + first_time_bonus)
            
            return {
                'xp_earned': total_xp,
                'breakdown': {
                    'base_xp': base_xp,
                    'score_multiplier': score_multiplier,
                    'time_multiplier': time_multiplier,
                    'first_time_bonus': first_time_bonus,
                    'score_xp': int(xp_from_score),
                    'time_xp': int(xp_from_time),
                    'total_xp': total_xp
                },
                'calculation_details': {
                    'difficulty': difficulty,
                    'score': score,
                    'time_spent': time_spent,
                    'score_category': cls._get_score_category(score),
                    'time_category': cls._get_time_category(level_id, time_spent, difficulty)
                }
            }
            
        except Exception as e:
            raise ValueError(f"Failed to calculate XP: {str(e)}")

    @classmethod
    def _get_score_multiplier(cls, score: Optional[int]) -> float:
        """Get score-based multiplier"""
        if score is None:
            return 1.0
        
        if score >= 100:
            return cls.SCORE_MULTIPLIERS['perfect']
        elif score >= 90:
            return cls.SCORE_MULTIPLIERS['excellent']
        elif score >= 80:
            return cls.SCORE_MULTIPLIERS['good']
        elif score >= 70:
            return cls.SCORE_MULTIPLIERS['average']
        else:
            return cls.SCORE_MULTIPLIERS['below_average']

    @classmethod
    def _get_score_category(cls, score: Optional[int]) -> str:
        """Get score category for display"""
        if score is None:
            return 'unknown'
        
        if score >= 100:
            return 'perfect'
        elif score >= 90:
            return 'excellent'
        elif score >= 80:
            return 'good'
        elif score >= 70:
            return 'average'
        else:
            return 'below_average'

    @classmethod
    def _get_time_multiplier(cls, level_id: int, time_spent: Optional[int], difficulty: str) -> float:
        """Get time-based multiplier"""
        if time_spent is None:
            return 1.0
        
        # Get expected time for this level/difficulty
        expected_time = cls._get_expected_time(level_id, difficulty)
        
        if time_spent <= expected_time * 0.5:
            return cls.TIME_BONUS_THRESHOLDS['lightning']
        elif time_spent <= expected_time * 0.75:
            return cls.TIME_BONUS_THRESHOLDS['fast']
        elif time_spent <= expected_time * 1.5:
            return cls.TIME_BONUS_THRESHOLDS['normal']
        else:
            return cls.TIME_BONUS_THRESHOLDS['slow']

    @classmethod
    def _get_time_category(cls, level_id: int, time_spent: Optional[int], difficulty: str) -> str:
        """Get time category for display"""
        if time_spent is None:
            return 'unknown'
        
        expected_time = cls._get_expected_time(level_id, difficulty)
        
        if time_spent <= expected_time * 0.5:
            return 'lightning'
        elif time_spent <= expected_time * 0.75:
            return 'fast'
        elif time_spent <= expected_time * 1.5:
            return 'normal'
        else:
            return 'slow'

    @classmethod
    def _get_expected_time(cls, level_id: int, difficulty: str) -> int:
        """Get expected completion time in seconds"""
        # Base times by difficulty (in seconds)
        base_times = {
            'easy': 300,    # 5 minutes
            'medium': 600,  # 10 minutes
            'hard': 900,    # 15 minutes
            'expert': 1200  # 20 minutes
        }
        
        return base_times.get(difficulty.lower(), base_times['medium'])

    @classmethod
    def _get_first_time_bonus(cls, level_id: int) -> int:
        """Get first-time completion bonus"""
        # Check if this is the user's first completion of this level
        # This would typically check the database, but for now return a fixed bonus
        return 25  # Flat 25 XP bonus for first completion


class XPManager:
    """Manages XP operations for users"""
    
    @classmethod
    def award_xp(cls, user_id: int, level_id: int, score: Optional[int] = None,
                 time_spent: Optional[int] = None, difficulty: str = 'medium',
                 metadata: Optional[Dict[str, Any]] = None, 
                 reason: str = 'level_completion') -> Dict[str, Any]:
        """
        Award XP to a user and create history entry
        
        Returns:
            Dict with xp_awarded, new_total, calculation_details
        """
        try:
            from app.models.user import User
            from app.models.xp_history import XPHistory
            from app.database import get_supabase, handle_supabase_error
            
            # Calculate XP earned
            xp_calculation = XPCalculator.calculate_level_xp(
                level_id, score, time_spent, difficulty, metadata
            )
            xp_earned = xp_calculation['xp_earned']
            
            # Get user
            user = User.find_by_id(user_id)
            if not user:
                raise ValueError(f"User {user_id} not found")
            
            # Update user's total XP
            old_total = getattr(user, 'total_xp', None) or 0
            new_total = old_total + xp_earned
            
            # Update user's total_xp in database
            supabase = get_supabase()
            response = supabase.table('users').update({'total_xp': new_total}).eq('id', user_id).execute()
            handle_supabase_error(response)
            
            # Create XP history entry
            xp_entry = XPHistory.create_entry(
                user_id=user_id,
                xp_change=xp_earned,
                reason=reason,
                level_id=level_id,
                metadata={
                    **xp_calculation,
                    'score': score,
                    'time_spent': time_spent,
                    'difficulty': difficulty
                }
            )
            
            return {
                'xp_awarded': xp_earned,
                'old_total': old_total,
                'new_total': new_total,
                'calculation_details': xp_calculation,
                'history_entry_id': xp_entry.id
            }
            
        except Exception as e:
            raise DatabaseError(f"Failed to award XP: {str(e)}")

    @classmethod
    def get_user_level(cls, total_xp: int) -> Dict[str, Any]:
        """Calculate user level based on total XP"""
        try:
            # Level calculation: level = sqrt(total_xp / 100)
            # This means level 1 = 100 XP, level 2 = 400 XP, level 3 = 900 XP, etc.
            import math
            
            if total_xp < 0:
                return {'level': 0, 'xp_for_next': 100, 'xp_in_current': 0, 'progress_percent': 0}
            
            level = int(math.sqrt(total_xp / 100))
            
            # Calculate XP required for current and next level
            current_level_xp = level * level * 100
            next_level_xp = (level + 1) * (level + 1) * 100
            
            xp_in_current_level = total_xp - current_level_xp
            xp_for_next_level = next_level_xp - total_xp
            progress_percent = (xp_in_current_level / (next_level_xp - current_level_xp)) * 100
            
            return {
                'level': level,
                'xp_for_next': xp_for_next_level,
                'xp_in_current': xp_in_current_level,
                'progress_percent': round(progress_percent, 1),
                'current_level_total_xp': next_level_xp - current_level_xp
            }
            
        except Exception as e:
            raise ValueError(f"Failed to calculate user level: {str(e)}")

    @classmethod
    def recalculate_user_total_xp(cls, user_id: int) -> Dict[str, Any]:
        """Recalculate user's total XP from history"""
        try:
            from app.models.user import User
            from app.models.xp_history import XPHistory
            from app.database import get_supabase, handle_supabase_error
            
            # Sum all XP changes for the user
            total_xp = XPHistory.calculate_user_total_xp(user_id)
            
            # Update user record
            user = User.find_by_id(user_id)
            if not user:
                raise ValueError(f"User {user_id} not found")
            
            old_total = getattr(user, 'total_xp', None) or 0
            
            # Update user's total_xp in database
            supabase = get_supabase()
            response = supabase.table('users').update({'total_xp': total_xp}).eq('id', user_id).execute()
            handle_supabase_error(response)
            
            return {
                'user_id': user_id,
                'old_total': old_total,
                'new_total': total_xp,
                'difference': total_xp - old_total
            }
            
        except Exception as e:
            raise DatabaseError(f"Failed to recalculate user XP: {str(e)}")

    @classmethod
    def get_leaderboard(cls, limit: int = 10) -> List[Dict[str, Any]]:
        """Get top users by XP (if leaderboards are re-enabled)"""
        try:
            # Use XP history leaderboard instead of user table
            from app.models.xp_history import XPHistory
            
            leaderboard_data = XPHistory.get_xp_leaderboard_data(limit)
            
            # Get usernames for the leaderboard
            from app.models.user import User
            leaderboard = []
            for entry in leaderboard_data:
                user = User.find_by_id(entry['user_id'])
                if user:
                    level_info = cls.get_user_level(entry['total_xp'])
                    leaderboard.append({
                        'rank': entry['rank'],
                        'user_id': entry['user_id'],
                        'username': user.username,
                        'total_xp': entry['total_xp'],
                        'level': level_info['level']
                    })
            
            return leaderboard
            
        except Exception as e:
            raise DatabaseError(f"Failed to get leaderboard: {str(e)}")


# Convenience functions for easy imports
def calculate_level_xp(level_id: int, score: Optional[int] = None, 
                      time_spent: Optional[int] = None, difficulty: str = 'medium',
                      metadata: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """Convenience function to calculate XP for level completion"""
    return XPCalculator.calculate_level_xp(level_id, score, time_spent, difficulty, metadata)


def award_user_xp(user_id: int, level_id: int, score: Optional[int] = None,
                  time_spent: Optional[int] = None, difficulty: str = 'medium',
                  metadata: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """Convenience function to award XP to a user"""
    return XPManager.award_xp(user_id, level_id, score, time_spent, difficulty, metadata)


def get_user_level_info(total_xp: int) -> Dict[str, Any]:
    """Convenience function to get user level information"""
    return XPManager.get_user_level(total_xp)
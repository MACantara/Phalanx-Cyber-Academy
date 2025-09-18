"""
Learning Streak Tracking Utility
Tracks user learning streaks based on XP history and session records
"""
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, List
from app.models.xp_history import XPHistory
from app.models.session import Session
from app.database import DatabaseError
from app.utils.timezone_utils import utc_now


class LearningStreakTracker:
    """Utility class for tracking and calculating learning streaks"""
    
    @staticmethod
    def get_user_learning_streak(user_id: int) -> Dict[str, Any]:
        """
        Calculate the current learning streak for a user based on daily activity.
        
        A streak is maintained if the user has either:
        - XP history records (any XP change)
        - Session records (learning sessions)
        
        Returns streak information including current streak, longest streak, and last activity.
        """
        try:
            # Get recent XP history and sessions
            xp_history = XPHistory.get_user_history(user_id, limit=100)
            sessions = Session.get_user_sessions(user_id, limit=100)
            
            # Combine and sort all activity by date
            activity_dates = set()
            
            # Add XP history dates
            for entry in xp_history:
                if entry.created_at:
                    # created_at is already a datetime object from the model
                    if isinstance(entry.created_at, str):
                        activity_date = datetime.fromisoformat(entry.created_at.replace('Z', '+00:00')).date()
                    else:
                        activity_date = entry.created_at.date()
                    activity_dates.add(activity_date)
            
            # Add session dates
            for session in sessions:
                if session.created_at:
                    # created_at is already a datetime object from the model
                    if isinstance(session.created_at, str):
                        activity_date = datetime.fromisoformat(session.created_at.replace('Z', '+00:00')).date()
                    else:
                        activity_date = session.created_at.date()
                    activity_dates.add(activity_date)
            
            if not activity_dates:
                return {
                    'current_streak': 0,
                    'longest_streak': 0,
                    'last_activity_date': None,
                    'is_active_today': False,
                    'days_since_last_activity': 0,
                    'streak_status': 'no_activity'
                }
            
            # Sort dates in descending order (most recent first)
            sorted_dates = sorted(activity_dates, reverse=True)
            today = utc_now().date()
            
            # Check if there's activity today
            is_active_today = sorted_dates[0] == today
            
            # Calculate current streak
            current_streak = LearningStreakTracker._calculate_current_streak(sorted_dates, today)
            
            # Calculate longest streak
            longest_streak = LearningStreakTracker._calculate_longest_streak(sorted_dates)
            
            # Calculate days since last activity
            days_since_last = (today - sorted_dates[0]).days
            
            # Determine streak status
            streak_status = LearningStreakTracker._determine_streak_status(current_streak, is_active_today, days_since_last)
            
            return {
                'current_streak': current_streak,
                'longest_streak': longest_streak,
                'last_activity_date': sorted_dates[0].isoformat(),
                'is_active_today': is_active_today,
                'days_since_last_activity': days_since_last,
                'streak_status': streak_status
            }
            
        except Exception as e:
            raise DatabaseError(f"Failed to calculate learning streak for user {user_id}: {str(e)}")
    
    @staticmethod
    def _calculate_current_streak(sorted_dates: List, today: datetime.date) -> int:
        """Calculate the current active streak"""
        if not sorted_dates:
            return 0
        
        current_streak = 0
        expected_date = today
        
        # If the most recent activity is not today or yesterday, streak is broken
        if sorted_dates[0] < today - timedelta(days=1):
            return 0
        
        # Start from today and work backwards
        for activity_date in sorted_dates:
            if activity_date == expected_date:
                current_streak += 1
                expected_date -= timedelta(days=1)
            elif activity_date == expected_date + timedelta(days=1):
                # Handle the case where we're checking yesterday and found today
                continue
            else:
                # Gap in streak, stop counting
                break
        
        return current_streak
    
    @staticmethod
    def _calculate_longest_streak(sorted_dates: List) -> int:
        """Calculate the longest streak ever achieved"""
        if not sorted_dates:
            return 0
        
        # Sort in ascending order for easier processing
        dates = sorted(sorted_dates)
        longest_streak = 1
        current_streak = 1
        
        for i in range(1, len(dates)):
            # Check if this date is consecutive to the previous
            if dates[i] == dates[i-1] + timedelta(days=1):
                current_streak += 1
                longest_streak = max(longest_streak, current_streak)
            else:
                current_streak = 1
        
        return longest_streak
    
    @staticmethod
    def _determine_streak_status(current_streak: int, is_active_today: bool, days_since_last: int) -> str:
        """Determine the status of the learning streak"""
        if current_streak == 0:
            if days_since_last == 0:
                return 'starting'  # Activity today but no streak yet
            elif days_since_last == 1:
                return 'at_risk'   # Activity yesterday, can still continue today
            else:
                return 'broken'    # No recent activity
        else:
            if is_active_today:
                return 'active'    # Current streak with activity today
            elif days_since_last == 0:
                return 'active'    # Activity today continues streak
            elif days_since_last == 1:
                return 'at_risk'   # Streak can continue if activity today
            else:
                return 'broken'    # Streak is broken
    
    @staticmethod
    def get_streak_encouragement_message(streak_data: Dict[str, Any]) -> str:
        """Generate an encouraging message based on streak status"""
        current_streak = streak_data['current_streak']
        status = streak_data['streak_status']
        
        if status == 'active':
            if current_streak == 1:
                return "🔥 Great start! You've begun your learning streak. Keep it going!"
            elif current_streak < 7:
                return f"🔥 Amazing! {current_streak} days strong. You're building a great habit!"
            elif current_streak < 30:
                return f"🔥 Incredible! {current_streak} day streak! You're on fire!"
            else:
                return f"🔥 Legendary! {current_streak} day streak! You're a cybersecurity learning champion!"
        
        elif status == 'at_risk':
            return f"⚠️ Your {current_streak} day streak is at risk! Complete a level today to keep it going."
        
        elif status == 'broken':
            longest = streak_data['longest_streak']
            if longest > 0:
                return f"💪 Ready for a fresh start? Your longest streak was {longest} days - you can beat that!"
            else:
                return "🚀 Start your learning journey today! Complete your first level to begin your streak."
        
        elif status == 'starting':
            return "🌟 You're active today! Complete another level tomorrow to start a streak!"
        
        else:
            return "📚 Ready to learn? Complete a cybersecurity level to start tracking your progress!"
    
    @staticmethod
    def get_weekly_activity_summary(user_id: int) -> Dict[str, Any]:
        """Get a summary of learning activity for the past week"""
        try:
            end_date = utc_now().date()
            start_date = end_date - timedelta(days=6)  # Last 7 days including today
            
            # Get activity for the past week
            xp_history = XPHistory.get_user_history(user_id, limit=50)
            sessions = Session.get_user_sessions(user_id, limit=50)
            
            # Track daily activity
            daily_activity = {}
            
            # Initialize all days with zero activity
            for i in range(7):
                date = start_date + timedelta(days=i)
                daily_activity[date] = {
                    'date': date.isoformat(),
                    'xp_gained': 0,
                    'sessions_completed': 0,
                    'has_activity': False
                }
            
            # Add XP history
            for entry in xp_history:
                if entry.created_at:
                    # created_at is already a datetime object from the model
                    if isinstance(entry.created_at, str):
                        entry_date = datetime.fromisoformat(entry.created_at.replace('Z', '+00:00')).date()
                    else:
                        entry_date = entry.created_at.date()
                    if start_date <= entry_date <= end_date:
                        if entry_date in daily_activity:
                            daily_activity[entry_date]['xp_gained'] += entry.xp_change
                            daily_activity[entry_date]['has_activity'] = True
            
            # Add completed sessions
            for session in sessions:
                if session.created_at and session.end_time:  # Only count completed sessions
                    # created_at is already a datetime object from the model
                    if isinstance(session.created_at, str):
                        session_date = datetime.fromisoformat(session.created_at.replace('Z', '+00:00')).date()
                    else:
                        session_date = session.created_at.date()
                    if start_date <= session_date <= end_date:
                        if session_date in daily_activity:
                            daily_activity[session_date]['sessions_completed'] += 1
                            daily_activity[session_date]['has_activity'] = True
            
            # Convert to list and sort by date
            activity_list = list(daily_activity.values())
            activity_list.sort(key=lambda x: x['date'])
            
            # Calculate summary stats
            total_xp = sum(day['xp_gained'] for day in activity_list)
            total_sessions = sum(day['sessions_completed'] for day in activity_list)
            active_days = sum(1 for day in activity_list if day['has_activity'])
            
            return {
                'daily_activity': activity_list,
                'total_xp_week': total_xp,
                'total_sessions_week': total_sessions,
                'active_days_week': active_days,
                'consistency_percentage': round((active_days / 7) * 100, 1)
            }
            
        except Exception as e:
            raise DatabaseError(f"Failed to get weekly activity summary for user {user_id}: {str(e)}")


def get_user_learning_streak(user_id: int) -> Dict[str, Any]:
    """
    Convenience function to get user learning streak information.
    Returns simplified streak data for easy integration.
    """
    try:
        streak_data = LearningStreakTracker.get_user_learning_streak(user_id)
        
        return {
            'current_streak': streak_data['current_streak'],
            'longest_streak': streak_data['longest_streak'],
            'is_active': streak_data['streak_status'] in ['active', 'starting'],
            'status': streak_data['streak_status'],
            'message': LearningStreakTracker.get_streak_encouragement_message(streak_data),
            'days_since_last_activity': streak_data['days_since_last_activity']
        }
        
    except Exception as e:
        # Return safe defaults if there's an error
        return {
            'current_streak': 0,
            'longest_streak': 0,
            'is_active': False,
            'status': 'unknown',
            'message': 'Unable to load streak information.',
            'days_since_last_activity': 0
        }
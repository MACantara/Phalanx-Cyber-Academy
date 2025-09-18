"""
XP History Model
Tracks XP changes for users with detailed audit trail
"""
from datetime import datetime
from typing import Dict, Any, Optional, List
from app.database import get_supabase, DatabaseError, handle_supabase_error
from app.utils.timezone_utils import utc_now, parse_datetime_aware


class XPHistory:
    """XP history model for tracking XP changes and audit trail"""
    
    def __init__(self, data: Dict[str, Any]):
        """Initialize XPHistory from Supabase data"""
        self.id = data.get('id')
        self.user_id = data.get('user_id')
        self.xp_change = data.get('xp_change')
        self.balance_before = data.get('balance_before')
        self.balance_after = data.get('balance_after')
        self.reason = data.get('reason')
        self.session_id = data.get('session_id')
        self.created_at = data.get('created_at')
        
        # Parse datetime fields
        if self.created_at and isinstance(self.created_at, str):
            self.created_at = parse_datetime_aware(self.created_at)

    def __repr__(self):
        return f'<XPHistory {self.user_id}: {self.xp_change:+d} XP ({self.reason})>'

    def to_dict(self):
        """Convert to dictionary for JSON serialization"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'xp_change': self.xp_change,
            'balance_before': self.balance_before,
            'balance_after': self.balance_after,
            'reason': self.reason,
            'session_id': self.session_id,
            'created_at': self.created_at
        }

    @classmethod
    def create_entry(cls, user_id: int, xp_change: int, reason: str = 'manual_adjustment', 
                    balance_before: int = None, balance_after: int = None, session_id: int = None) -> 'XPHistory':
        """Create a new XP history entry with automatic or provided balance calculation"""
        try:
            # If balance values are not provided, calculate them from user data
            if balance_before is None or balance_after is None:
                # Get user's current XP balance
                from app.models.user import User
                user = User.find_by_id(user_id)
                if not user:
                    raise ValueError(f"User {user_id} not found")
                
                balance_before = user.total_xp or 0
                balance_after = balance_before + xp_change
            
            # Create the entry
            supabase = get_supabase()
            entry_data = {
                'user_id': user_id,
                'xp_change': xp_change,
                'balance_before': balance_before,
                'balance_after': balance_after,
                'reason': reason,
                'session_id': session_id,
                'created_at': utc_now().isoformat()
            }
            
            response = supabase.table('xp_history').insert(entry_data).execute()
            data = handle_supabase_error(response)
            
            if data and len(data) > 0:
                return cls(data[0])
            raise DatabaseError("No data returned from XP history creation")
            
        except Exception as e:
            raise DatabaseError(f"Failed to create XP history entry: {str(e)}")
            
            response = supabase.table('xp_history').insert(entry_data).execute()
            data = handle_supabase_error(response)
            
            if data and len(data) > 0:
                return cls(data[0])
            raise DatabaseError("No data returned from XP history creation")
            
        except Exception as e:
            raise DatabaseError(f"Failed to create XP history entry: {str(e)}")

    @classmethod
    def get_user_history(cls, user_id: int, limit: int = 50, offset: int = 0) -> List['XPHistory']:
        """Get XP history for a user with pagination"""
        try:
            supabase = get_supabase()
            response = (supabase.table('xp_history')
                       .select('*')
                       .eq('user_id', user_id)
                       .order('created_at', desc=True)
                       .range(offset, offset + limit - 1)
                       .execute())
            data = handle_supabase_error(response)
            
            return [cls(entry_data) for entry_data in data] if data else []
        except Exception as e:
            raise DatabaseError(f"Failed to get user XP history: {str(e)}")

    @classmethod
    def get_user_xp_summary(cls, user_id: int) -> Dict[str, Any]:
        """Get XP summary for a user"""
        try:
            supabase = get_supabase()
            
            # Get all XP entries for user
            response = (supabase.table('xp_history')
                       .select('xp_change, reason, created_at')
                       .eq('user_id', user_id)
                       .order('created_at', desc=False)
                       .execute())
            data = handle_supabase_error(response)
            
            if not data:
                return {
                    'total_xp': 0,
                    'total_entries': 0,
                    'xp_gained': 0,
                    'xp_lost': 0,
                    'by_reason': {},
                    'first_entry': None,
                    'last_entry': None
                }
            
            # Calculate statistics
            total_xp = sum(entry['xp_change'] for entry in data)
            xp_gained = sum(entry['xp_change'] for entry in data if entry['xp_change'] > 0)
            xp_lost = abs(sum(entry['xp_change'] for entry in data if entry['xp_change'] < 0))
            
            # Group by reason
            by_reason = {}
            for entry in data:
                reason = entry['reason']
                if reason not in by_reason:
                    by_reason[reason] = {'count': 0, 'total_xp': 0}
                by_reason[reason]['count'] += 1
                by_reason[reason]['total_xp'] += entry['xp_change']
            
            return {
                'total_xp': total_xp,
                'total_entries': len(data),
                'xp_gained': xp_gained,
                'xp_lost': xp_lost,
                'by_reason': by_reason,
                'first_entry': data[0]['created_at'] if data else None,
                'last_entry': data[-1]['created_at'] if data else None
            }
            
        except Exception as e:
            raise DatabaseError(f"Failed to get user XP summary: {str(e)}")

    @classmethod
    def get_recent_activity(cls, limit: int = 20) -> List['XPHistory']:
        """Get recent XP activity across all users"""
        try:
            supabase = get_supabase()
            response = (supabase.table('xp_history')
                       .select('*')
                       .order('created_at', desc=True)
                       .limit(limit)
                       .execute())
            data = handle_supabase_error(response)
            
            return [cls(entry_data) for entry_data in data] if data else []
        except Exception as e:
            raise DatabaseError(f"Failed to get recent XP activity: {str(e)}")

    @classmethod
    def calculate_user_total_xp(cls, user_id: int) -> int:
        """Calculate user's total XP from history entries"""
        try:
            supabase = get_supabase()
            response = (supabase.table('xp_history')
                       .select('xp_change')
                       .eq('user_id', user_id)
                       .execute())
            data = handle_supabase_error(response)
            
            if not data:
                return 0
            
            return sum(entry['xp_change'] for entry in data)
            
        except Exception as e:
            raise DatabaseError(f"Failed to calculate user total XP: {str(e)}")

    @classmethod
    def get_by_session(cls, session_id: int, limit: int = 50) -> List['XPHistory']:
        """Get XP history entries for a specific session"""
        try:
            supabase = get_supabase()
            response = (supabase.table('xp_history')
                       .select('*')
                       .eq('session_id', session_id)
                       .order('created_at', desc=True)
                       .limit(limit)
                       .execute())
            data = handle_supabase_error(response)
            
            return [cls(entry_data) for entry_data in data] if data else []
        except Exception as e:
            raise DatabaseError(f"Failed to get XP history for session {session_id}: {str(e)}")

    @classmethod
    def get_by_reason(cls, reason: str, limit: int = 50) -> List['XPHistory']:
        """Get XP history entries by reason"""
        try:
            supabase = get_supabase()
            response = (supabase.table('xp_history')
                       .select('*')
                       .eq('reason', reason)
                       .order('created_at', desc=True)
                       .limit(limit)
                       .execute())
            data = handle_supabase_error(response)
            
            return [cls(entry_data) for entry_data in data] if data else []
        except Exception as e:
            raise DatabaseError(f"Failed to get XP history for reason {reason}: {str(e)}")

    def save(self) -> bool:
        """Save XP history entry to database"""
        try:
            supabase = get_supabase()
            entry_data = {
                'user_id': self.user_id,
                'xp_change': self.xp_change,
                'balance_before': self.balance_before,
                'balance_after': self.balance_after,
                'reason': self.reason,
                'session_id': self.session_id
            }
            
            if self.id:
                # Update existing entry
                response = supabase.table('xp_history').update(entry_data).eq('id', self.id).execute()
                handle_supabase_error(response)
            else:
                # Create new entry
                entry_data['created_at'] = utc_now().isoformat()
                response = supabase.table('xp_history').insert(entry_data).execute()
                data = handle_supabase_error(response)
                if data and len(data) > 0:
                    self.id = data[0]['id']
                    self.created_at = data[0]['created_at']
            
            return True
        except Exception as e:
            raise DatabaseError(f"Failed to save XP history entry: {str(e)}")

    def delete(self) -> bool:
        """Delete XP history entry from database"""
        try:
            if not self.id:
                raise ValueError("Cannot delete XP history entry without ID")
            
            supabase = get_supabase()
            response = supabase.table('xp_history').delete().eq('id', self.id).execute()
            handle_supabase_error(response)
            return True
        except Exception as e:
            raise DatabaseError(f"Failed to delete XP history entry: {str(e)}")

    @classmethod
    def get_by_id(cls, entry_id: int) -> Optional['XPHistory']:
        """Get XP history entry by ID"""
        try:
            supabase = get_supabase()
            response = supabase.table('xp_history').select('*').eq('id', entry_id).execute()
            data = handle_supabase_error(response)
            
            if data and len(data) > 0:
                return cls(data[0])
            return None
        except Exception as e:
            raise DatabaseError(f"Failed to get XP history entry {entry_id}: {str(e)}")

    @classmethod
    def get_xp_leaderboard_data(cls, limit: int = 10) -> List[Dict[str, Any]]:
        """Get leaderboard data based on XP history"""
        try:
            supabase = get_supabase()
            
            # Get total XP by user
            response = (supabase.table('xp_history')
                       .select('user_id, xp_change')
                       .execute())
            data = handle_supabase_error(response)
            
            if not data:
                return []
            
            # Calculate totals by user
            user_totals = {}
            for entry in data:
                user_id = entry['user_id']
                if user_id not in user_totals:
                    user_totals[user_id] = 0
                user_totals[user_id] += entry['xp_change']
            
            # Sort and limit
            sorted_users = sorted(user_totals.items(), key=lambda x: x[1], reverse=True)[:limit]
            
            # Format results
            leaderboard = []
            for rank, (user_id, total_xp) in enumerate(sorted_users, 1):
                leaderboard.append({
                    'rank': rank,
                    'user_id': user_id,
                    'total_xp': total_xp
                })
            
            return leaderboard
            
        except Exception as e:
            raise DatabaseError(f"Failed to get XP leaderboard data: {str(e)}")
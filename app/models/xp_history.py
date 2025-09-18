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
        return f'<XPHistory {self.xp_change:+d} XP ({self.reason}) - Session {self.session_id}>'

    def to_dict(self):
        """Convert to dictionary for JSON serialization"""
        return {
            'id': self.id,
            'xp_change': self.xp_change,
            'balance_before': self.balance_before,
            'balance_after': self.balance_after,
            'reason': self.reason,
            'session_id': self.session_id,
            'created_at': self.created_at
        }

    @classmethod
    def create_entry(cls, xp_change: int, reason: str = 'manual_adjustment', 
                    balance_before: int = None, balance_after: int = None, 
                    session_id: int = None, user_id: int = None) -> 'XPHistory':
        """
        Create a new XP history entry with automatic or provided balance calculation
        
        Args:
            xp_change: The XP change amount
            reason: Reason for XP change
            balance_before: User's XP before this change (calculated if None)
            balance_after: User's XP after this change (calculated if None)
            session_id: Session ID if this XP is tied to a session
            user_id: User ID (required if session_id is None for manual adjustments)
        """
        try:
            # Get user_id from session if provided, otherwise use the provided user_id
            if session_id is not None:
                # Get user_id from session
                from app.models.session import Session
                session = Session.get_by_id(session_id)
                if not session:
                    raise ValueError(f"Session {session_id} not found")
                actual_user_id = session.user_id
            elif user_id is not None:
                # Use provided user_id for manual adjustments
                actual_user_id = user_id
            else:
                raise ValueError("Either session_id or user_id must be provided")
            
            # If balance values are not provided, calculate them from user data
            if balance_before is None or balance_after is None:
                # Get user's current XP balance
                from app.models.user import User
                user = User.find_by_id(actual_user_id)
                if not user:
                    raise ValueError(f"User {actual_user_id} not found")
                
                balance_before = user.total_xp or 0
                balance_after = balance_before + xp_change
            
            # Create the entry
            supabase = get_supabase()
            entry_data = {
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

    @classmethod
    def create_manual_adjustment(cls, user_id: int, xp_change: int, reason: str = 'manual_adjustment', 
                                balance_before: int = None, balance_after: int = None) -> 'XPHistory':
        """
        Create a manual XP adjustment that's not tied to a session
        
        Args:
            user_id: The user receiving the XP adjustment
            xp_change: The XP change amount (can be negative)
            reason: Reason for the adjustment
            balance_before: User's XP before this change (calculated if None)
            balance_after: User's XP after this change (calculated if None)
        """
        try:
            # For manual adjustments, we don't have a session_id, so we need to handle this specially
            # We'll use the user_id parameter but not store it directly in the XP history
            
            # If balance values are not provided, calculate them from user data
            if balance_before is None or balance_after is None:
                from app.models.user import User
                user = User.find_by_id(user_id)
                if not user:
                    raise ValueError(f"User {user_id} not found")
                
                balance_before = user.total_xp or 0
                balance_after = balance_before + xp_change
            
            # Create the entry without user_id (since it's a manual adjustment)
            supabase = get_supabase()
            entry_data = {
                'xp_change': xp_change,
                'balance_before': balance_before,
                'balance_after': balance_after,
                'reason': reason,
                'session_id': None,  # No session for manual adjustments
                'created_at': utc_now().isoformat()
            }
            
            response = supabase.table('xp_history').insert(entry_data).execute()
            data = handle_supabase_error(response)
            
            if data and len(data) > 0:
                # Also update the user's total XP
                from app.models.user import User
                
                supabase = get_supabase()
                response = supabase.table('users').update({'total_xp': balance_after}).eq('id', user_id).execute()
                handle_supabase_error(response)
                
                return cls(data[0])
            raise DatabaseError("No data returned from XP history creation")
            
        except Exception as e:
            raise DatabaseError(f"Failed to create manual XP adjustment: {str(e)}")

    @classmethod
    def get_user_history(cls, user_id: int, limit: int = 50, offset: int = 0) -> List['XPHistory']:
        """Get XP history for a user with pagination (joins with sessions to filter by user_id)"""
        try:
            supabase = get_supabase()
            # Join with sessions table to filter by user_id
            response = (supabase.table('xp_history')
                       .select('xp_history.*, sessions.user_id')
                       .join('sessions', 'xp_history.session_id', 'sessions.id', join_type='left')
                       .or_(f'sessions.user_id.eq.{user_id},and(xp_history.session_id.is.null,xp_history.reason.like.%manual%)')
                       .order('xp_history.created_at', desc=True)
                       .range(offset, offset + limit - 1)
                       .execute())
            data = handle_supabase_error(response)
            
            # Filter results to only include entries for this user
            # Note: This includes both session-based entries and manual adjustments
            filtered_data = []
            for entry in (data or []):
                # Include if it's a session-based entry for this user, or a manual entry
                if (entry.get('user_id') == user_id or 
                    (entry.get('session_id') is None and 'manual' in entry.get('reason', '').lower())):
                    # Remove the joined user_id field before creating XPHistory object
                    entry_data = {k: v for k, v in entry.items() if k != 'user_id'}
                    filtered_data.append(entry_data)
            
            return [cls(entry_data) for entry_data in filtered_data]
        except Exception as e:
            raise DatabaseError(f"Failed to get user XP history: {str(e)}")
            
    @classmethod
    def get_user_history_direct(cls, user_id: int, limit: int = 50, offset: int = 0) -> List['XPHistory']:
        """
        Alternative method: Get XP history by querying sessions first, then XP history
        This approach may be more reliable for complex queries
        """
        try:
            supabase = get_supabase()
            
            # First, get all session IDs for this user
            sessions_response = (supabase.table('sessions')
                               .select('id')
                               .eq('user_id', user_id)
                               .execute())
            sessions_data = handle_supabase_error(sessions_response)
            
            if not sessions_data:
                return []
            
            session_ids = [s['id'] for s in sessions_data]
            
            # Then get XP history for those sessions
            response = (supabase.table('xp_history')
                       .select('*')
                       .in_('session_id', session_ids)
                       .order('created_at', desc=True)
                       .range(offset, offset + limit - 1)
                       .execute())
            data = handle_supabase_error(response)
            
            return [cls(entry_data) for entry_data in data] if data else []
        except Exception as e:
            raise DatabaseError(f"Failed to get user XP history (direct): {str(e)}")

    @classmethod
    def get_user_xp_summary(cls, user_id: int) -> Dict[str, Any]:
        """Get XP summary for a user (joins with sessions to filter by user_id)"""
        try:
            supabase = get_supabase()
            
            # Get all XP entries for user through sessions
            response = (supabase.table('xp_history')
                       .select('xp_history.xp_change, xp_history.reason, xp_history.created_at, sessions.user_id')
                       .join('sessions', 'xp_history.session_id', 'sessions.id', join_type='left')
                       .or_(f'sessions.user_id.eq.{user_id},and(xp_history.session_id.is.null,xp_history.reason.like.%manual%)')
                       .order('xp_history.created_at', desc=False)
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
            
            # Filter for this user's entries
            user_entries = []
            for entry in data:
                if (entry.get('user_id') == user_id or 
                    (entry.get('session_id') is None and 'manual' in entry.get('reason', '').lower())):
                    user_entries.append(entry)
            
            # Calculate statistics
            total_xp = sum(entry['xp_change'] for entry in user_entries)
            xp_gained = sum(entry['xp_change'] for entry in user_entries if entry['xp_change'] > 0)
            xp_lost = abs(sum(entry['xp_change'] for entry in user_entries if entry['xp_change'] < 0))
            
            # Group by reason
            by_reason = {}
            for entry in user_entries:
                reason = entry['reason']
                if reason not in by_reason:
                    by_reason[reason] = {'count': 0, 'total_xp': 0}
                by_reason[reason]['count'] += 1
                by_reason[reason]['total_xp'] += entry['xp_change']
            
            return {
                'total_xp': total_xp,
                'total_entries': len(user_entries),
                'xp_gained': xp_gained,
                'xp_lost': xp_lost,
                'by_reason': by_reason,
                'first_entry': user_entries[0]['created_at'] if user_entries else None,
                'last_entry': user_entries[-1]['created_at'] if user_entries else None
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
        """Calculate user's total XP from history entries (joins with sessions to filter by user_id)"""
        try:
            supabase = get_supabase()
            
            # Get all XP changes for user through sessions
            response = (supabase.table('xp_history')
                       .select('xp_history.xp_change, sessions.user_id')
                       .join('sessions', 'xp_history.session_id', 'sessions.id', join_type='left')
                       .or_(f'sessions.user_id.eq.{user_id},and(xp_history.session_id.is.null,xp_history.reason.like.%manual%)')
                       .execute())
            data = handle_supabase_error(response)
            
            if not data:
                return 0
            
            # Filter and sum XP changes for this user
            total_xp = 0
            for entry in data:
                if (entry.get('user_id') == user_id or 
                    (entry.get('session_id') is None and 'manual' in entry.get('reason', '').lower())):
                    total_xp += entry['xp_change']
            
            return total_xp
            
        except Exception as e:
            raise DatabaseError(f"Failed to calculate user total XP: {str(e)}")

    def get_user_id(self) -> Optional[int]:
        """Get the user_id for this XP history entry by looking up the session"""
        if self.session_id:
            try:
                from app.models.session import Session
                session = Session.get_by_id(self.session_id)
                return session.user_id if session else None
            except Exception:
                return None
        return None

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
        """Get leaderboard data based on XP history (joins with sessions to get user_id)"""
        try:
            supabase = get_supabase()
            
            # Get total XP by user through sessions
            response = (supabase.table('xp_history')
                       .select('xp_history.xp_change, sessions.user_id')
                       .join('sessions', 'xp_history.session_id', 'sessions.id', join_type='left')
                       .execute())
            data = handle_supabase_error(response)
            
            if not data:
                return []
            
            # Calculate totals by user
            user_totals = {}
            for entry in data:
                user_id = entry.get('user_id')
                if user_id:  # Only include entries with valid user_id from sessions
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
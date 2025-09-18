"""
Session Model
Tracks user learning sessions for both levels and Blue Team vs Red Team Mode
"""
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, List
import uuid
from app.database import get_supabase, DatabaseError, handle_supabase_error
from app.utils.timezone_utils import utc_now, parse_datetime_aware


class Session:
    """Session model for tracking user learning sessions"""
    
    def __init__(self, data: Dict[str, Any]):
        """Initialize Session from Supabase data"""
        self.id = data.get('id')
        self.user_id = data.get('user_id')
        self.session_name = data.get('session_name')
        self.level_id = data.get('level_id')
        self.score = data.get('score')
        self.start_time = data.get('start_time')
        self.end_time = data.get('end_time')
        self.created_at = data.get('created_at')
        
        # Parse datetime fields
        if self.start_time and isinstance(self.start_time, str):
            self.start_time = parse_datetime_aware(self.start_time)
        if self.end_time and isinstance(self.end_time, str):
            self.end_time = parse_datetime_aware(self.end_time)
        if self.created_at and isinstance(self.created_at, str):
            self.created_at = parse_datetime_aware(self.created_at)

    def __repr__(self):
        return f'<Session {self.user_id}: {self.session_name} ({self.score})>'

    @property
    def time_spent(self) -> int:
        """Calculate time spent in seconds based on start_time and end_time"""
        if self.start_time and self.end_time:
            delta = self.end_time - self.start_time
            return int(delta.total_seconds())
        return 0

    def to_dict(self):
        """Convert to dictionary for JSON serialization"""
        result = {
            'id': self.id,
            'user_id': self.user_id,
            'session_name': self.session_name,
            'level_id': self.level_id,
            'score': self.score,
            'start_time': self.start_time,
            'end_time': self.end_time,
            'time_spent': self.time_spent,
            'created_at': self.created_at
        }
        
        # Include XP information if available (from recent completion)
        if hasattr(self, '_xp_awarded'):
            result['xp_awarded'] = self._xp_awarded
        if hasattr(self, '_xp_calculation'):
            result['xp_calculation'] = self._xp_calculation
            
        return result

    def get_xp_awarded(self) -> int:
        """Get XP awarded for this session (if available from recent creation)"""
        return getattr(self, '_xp_awarded', 0)
    
    def get_xp_calculation_details(self) -> dict:
        """Get XP calculation details for this session (if available from recent creation)"""
        return getattr(self, '_xp_calculation', {})

    @classmethod
    def start_session(cls, user_id: int, session_name: str, level_id: int = None) -> 'Session':
        """Start a new learning session"""
        try:
            supabase = get_supabase()
            session_data = {
                'user_id': user_id,
                'session_name': session_name,
                'level_id': level_id,
                'start_time': utc_now().isoformat(),
                'created_at': utc_now().isoformat()
            }
            
            response = supabase.table('sessions').insert(session_data).execute()
            data = handle_supabase_error(response)
            
            if data and len(data) > 0:
                return cls(data[0])
            raise DatabaseError("No data returned from session creation")
            
        except Exception as e:
            raise DatabaseError(f"Failed to start session: {str(e)}")

    @classmethod
    def end_session(cls, session_id: int, score: int = None) -> 'Session':
        """End an existing session and optionally award XP"""
        try:
            supabase = get_supabase()
            
            # First get the session
            response = supabase.table('sessions').select('*').eq('id', session_id).execute()
            data = handle_supabase_error(response)
            
            if not data or len(data) == 0:
                raise ValueError(f"Session {session_id} not found")
            
            session = cls(data[0])
            
            # Update session with end time and score
            update_data = {
                'end_time': utc_now().isoformat(),
                'score': score
            }
            
            response = supabase.table('sessions').update(update_data).eq('id', session_id).execute()
            updated_data = handle_supabase_error(response)
            
            if updated_data and len(updated_data) > 0:
                updated_session = cls(updated_data[0])
                
                # Award XP if session completed successfully
                if score is not None and score > 0:
                    try:
                        from app.utils.xp import XPManager
                        xp_result = XPManager.award_session_xp(
                            user_id=session.user_id,
                            session_name=session.session_name,
                            score=score,
                            time_spent=updated_session.time_spent,
                            level_id=session.level_id,
                            session_id=updated_session.id,
                            reason='session_completion'
                        )
                        # Store XP info for reference
                        updated_session._xp_awarded = xp_result['xp_awarded']
                    except Exception as xp_error:
                        # Log XP error but don't fail the session end
                        print(f"Warning: Failed to award XP for session: {xp_error}")
                        updated_session._xp_awarded = 0
                
                return updated_session
            raise DatabaseError("No data returned from session update")
            
        except Exception as e:
            raise DatabaseError(f"Failed to end session: {str(e)}")

    @classmethod
    def get_user_sessions(cls, user_id: int, limit: int = 50, offset: int = 0) -> List['Session']:
        """Get sessions for a user with pagination"""
        try:
            supabase = get_supabase()
            response = (supabase.table('sessions')
                       .select('*')
                       .eq('user_id', user_id)
                       .order('created_at', desc=True)
                       .range(offset, offset + limit - 1)
                       .execute())
            data = handle_supabase_error(response)
            
            return [cls(session_data) for session_data in data] if data else []
        except Exception as e:
            raise DatabaseError(f"Failed to get user sessions: {str(e)}")

    @classmethod
    def get_user_progress_summary(cls, user_id: int) -> Dict[str, Any]:
        """Get user's session progress summary"""
        try:
            supabase = get_supabase()
            
            # Get total available levels
            from app.models.level import Level
            total_levels = len(Level.get_available_levels())
            
            # Get user's completed sessions with level_id
            response = (supabase.table('sessions')
                       .select('level_id, session_name, score')
                       .eq('user_id', user_id)
                       .not_.is_('end_time', 'null')  # Only completed sessions
                       .execute())
            session_data = handle_supabase_error(response)
            
            # Count unique completed levels based on level_id (excluding null level_ids which are for Blue Team vs Red Team Mode)
            completed_level_ids = set()
            if session_data:
                for session in session_data:
                    level_id = session.get('level_id')
                    if level_id is not None:  # Only count sessions with actual level_id
                        completed_level_ids.add(level_id)
            
            completed_levels = len(completed_level_ids)
            
            # Get user's best scores per session type
            best_scores = {}
            if session_data:
                session_names = list(set([s['session_name'] for s in session_data]))
                for session_name in session_names:
                    session_response = (supabase.table('sessions')
                                       .select('score, start_time, end_time')
                                       .eq('user_id', user_id)
                                       .eq('session_name', session_name)
                                       .not_.is_('end_time', 'null')
                                       .order('score', desc=True)
                                       .limit(1)
                                       .execute())
                    session_best_data = handle_supabase_error(session_response)
                    if session_best_data and len(session_best_data) > 0:
                        session_info = session_best_data[0]
                        start_time = parse_datetime_aware(session_info['start_time'])
                        end_time = parse_datetime_aware(session_info['end_time'])
                        time_spent = int((end_time - start_time).total_seconds()) if start_time and end_time else 0
                        
                        best_scores[session_name] = {
                            'score': session_info['score'],
                            'time': time_spent
                        }
            
            return {
                'total_levels': total_levels,
                'completed_levels': completed_levels,
                'completion_percentage': round(completed_levels / total_levels * 100, 1) if total_levels > 0 else 0,
                'best_scores': best_scores
            }
            
        except Exception as e:
            raise DatabaseError(f"Failed to get user progress summary: {str(e)}")

    @classmethod
    def get_session_statistics(cls, session_name: str) -> Dict[str, Any]:
        """Get statistics for a specific session type"""
        try:
            supabase = get_supabase()
            
            # Get all completed sessions for this session type
            response = (supabase.table('sessions')
                       .select('score, start_time, end_time')
                       .eq('session_name', session_name)
                       .not_.is_('end_time', 'null')
                       .execute())
            data = handle_supabase_error(response)
            
            if not data:
                return {
                    'session_name': session_name,
                    'total_sessions': 0,
                    'avg_score': 0,
                    'max_score': 0,
                    'avg_time': 0,
                    'min_time': 0
                }
            
            scores = [s['score'] for s in data if s['score'] is not None]
            times = []
            for s in data:
                if s['start_time'] and s['end_time']:
                    start = parse_datetime_aware(s['start_time'])
                    end = parse_datetime_aware(s['end_time'])
                    time_spent = int((end - start).total_seconds())
                    times.append(time_spent)
            
            return {
                'session_name': session_name,
                'total_sessions': len(data),
                'avg_score': round(sum(scores) / len(scores), 1) if scores else 0,
                'max_score': max(scores) if scores else 0,
                'avg_time': round(sum(times) / len(times), 1) if times else 0,
                'min_time': min(times) if times else 0
            }
            
        except Exception as e:
            raise DatabaseError(f"Failed to get session statistics: {str(e)}")

    def save(self) -> bool:
        """Save session to database"""
        try:
            supabase = get_supabase()
            session_data = {
                'user_id': self.user_id,
                'session_name': self.session_name,
                'level_id': self.level_id,
                'score': self.score,
                'start_time': self.start_time.isoformat() if self.start_time else None,
                'end_time': self.end_time.isoformat() if self.end_time else None
            }
            
            if self.id:
                # Update existing session
                response = supabase.table('sessions').update(session_data).eq('id', self.id).execute()
                handle_supabase_error(response)
            else:
                # Create new session
                session_data['created_at'] = utc_now().isoformat()
                response = supabase.table('sessions').insert(session_data).execute()
                data = handle_supabase_error(response)
                if data and len(data) > 0:
                    self.id = data[0]['id']
                    self.created_at = data[0]['created_at']
            
            return True
        except Exception as e:
            raise DatabaseError(f"Failed to save session: {str(e)}")

    def delete(self) -> bool:
        """Delete session from database"""
        try:
            if not self.id:
                raise ValueError("Cannot delete session without ID")
            
            supabase = get_supabase()
            response = supabase.table('sessions').delete().eq('id', self.id).execute()
            handle_supabase_error(response)
            return True
        except Exception as e:
            raise DatabaseError(f"Failed to delete session: {str(e)}")

    @classmethod
    def get_by_id(cls, session_id: int) -> Optional['Session']:
        """Get session by ID"""
        try:
            supabase = get_supabase()
            response = supabase.table('sessions').select('*').eq('id', session_id).execute()
            data = handle_supabase_error(response)
            
            if data and len(data) > 0:
                return cls(data[0])
            return None
        except Exception as e:
            raise DatabaseError(f"Failed to get session {session_id}: {str(e)}")

    @classmethod
    def get_recent_sessions(cls, limit: int = 20) -> List['Session']:
        """Get recent sessions across all users"""
        try:
            supabase = get_supabase()
            response = (supabase.table('sessions')
                       .select('*')
                       .order('created_at', desc=True)
                       .limit(limit)
                       .execute())
            data = handle_supabase_error(response)
            
            return [cls(session_data) for session_data in data] if data else []
        except Exception as e:
            raise DatabaseError(f"Failed to get recent sessions: {str(e)}")

    @classmethod
    def get_active_session(cls, user_id: int) -> Optional['Session']:
        """Get active session for a user (session without end_time)"""
        try:
            supabase = get_supabase()
            response = (supabase.table('sessions')
                       .select('*')
                       .eq('user_id', user_id)
                       .is_('end_time', 'null')
                       .order('created_at', desc=True)
                       .limit(1)
                       .execute())
            data = handle_supabase_error(response)
            
            if data and len(data) > 0:
                return cls(data[0])
            return None
        except Exception as e:
            raise DatabaseError(f"Failed to get active session: {str(e)}")
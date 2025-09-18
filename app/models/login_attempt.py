from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
from app.database import get_supabase, Tables, handle_supabase_error, DatabaseError
from app.utils.timezone_utils import parse_datetime_aware, utc_now

class LoginAttempt:
    def __init__(self, data: Dict[str, Any]):
        """Initialize LoginAttempt from Supabase data."""
        self.id = data.get('id')
        self.ip_address = data.get('ip_address')
        self.username_or_email = data.get('username_or_email')
        self.success = data.get('success', False)
        self.attempted_at = data.get('attempted_at')
        self.user_agent = data.get('user_agent')
        
        # Convert string timestamp to datetime object if needed
        if isinstance(self.attempted_at, str):
            self.attempted_at = parse_datetime_aware(self.attempted_at)
    
    def save(self):
        """Save login attempt to database."""
        supabase = get_supabase()
        try:
            attempt_data = {
                'ip_address': self.ip_address,
                'username_or_email': self.username_or_email,
                'success': self.success,
                'attempted_at': self.attempted_at.isoformat() if self.attempted_at else utc_now().isoformat(),
                'user_agent': self.user_agent
            }
            
            if self.id:
                # Update existing attempt
                response = supabase.table(Tables.LOGIN_ATTEMPTS).update(attempt_data).eq('id', self.id).execute()
                handle_supabase_error(response)
            else:
                # Create new attempt
                response = supabase.table(Tables.LOGIN_ATTEMPTS).insert(attempt_data).execute()
                data = handle_supabase_error(response)
                if data and len(data) > 0:
                    self.id = data[0]['id']
        except Exception as e:
            raise DatabaseError(f"Failed to save login attempt: {e}")
    
    def __repr__(self):
        return f'<LoginAttempt {self.ip_address} at {self.attempted_at}>'
    
    @classmethod
    def get_failed_attempts_count(cls, ip_address: str, time_window_minutes: Optional[int] = None) -> int:
        """Get count of failed login attempts for an IP within time window."""
        if time_window_minutes is None:
            time_window_minutes = 15  # Default lockout time
        
        supabase = get_supabase()
        try:
            cutoff_time = (utc_now() - timedelta(minutes=time_window_minutes)).isoformat()
            response = supabase.table(Tables.LOGIN_ATTEMPTS).select("*", count='exact').eq('ip_address', ip_address).eq('success', False).gte('attempted_at', cutoff_time).execute()
            return response.count if hasattr(response, 'count') else 0
        except Exception as e:
            raise DatabaseError(f"Failed to count failed attempts: {e}")
    
    @classmethod
    def is_ip_locked(cls, ip_address: str, max_attempts: Optional[int] = None, lockout_minutes: Optional[int] = None) -> bool:
        """Check if IP is locked out based on failed attempts."""
        if max_attempts is None:
            max_attempts = 5  # Default max attempts
        if lockout_minutes is None:
            lockout_minutes = 15  # Default lockout time
        
        failed_count = cls.get_failed_attempts_count(ip_address, lockout_minutes)
        return failed_count >= max_attempts
    
    @classmethod
    def get_lockout_time_remaining(cls, ip_address: str, lockout_minutes: Optional[int] = None) -> Optional[timedelta]:
        """Get remaining lockout time for an IP address."""
        if lockout_minutes is None:
            lockout_minutes = 15  # Default lockout time
        
        supabase = get_supabase()
        try:
            cutoff_time = (utc_now() - timedelta(minutes=lockout_minutes)).isoformat()
            response = supabase.table(Tables.LOGIN_ATTEMPTS).select("*").eq('ip_address', ip_address).eq('success', False).gte('attempted_at', cutoff_time).order('attempted_at', desc=True).limit(1).execute()
            data = handle_supabase_error(response)
            
            if data and len(data) > 0:
                last_failed = cls(data[0])
                unlock_time = last_failed.attempted_at + timedelta(minutes=lockout_minutes)
                current_time = utc_now()
                if unlock_time > current_time:
                    return unlock_time - current_time
            return None
        except Exception as e:
            raise DatabaseError(f"Failed to get lockout time remaining: {e}")
    
    @classmethod
    def record_attempt(cls, ip_address: str, username_or_email: Optional[str] = None, success: bool = False, user_agent: Optional[str] = None) -> 'LoginAttempt':
        """Record a login attempt."""
        attempt_data = {
            'ip_address': ip_address,
            'username_or_email': username_or_email,
            'success': success,
            'attempted_at': utc_now(),
            'user_agent': user_agent
        }
        attempt = cls(attempt_data)
        attempt.save()
        return attempt
    
    @classmethod
    def cleanup_old_attempts(cls, days_old: int = 30) -> int:
        """Clean up old login attempts (for maintenance)."""
        supabase = get_supabase()
        try:
            cutoff_date = (utc_now() - timedelta(days=days_old)).isoformat()
            response = supabase.table(Tables.LOGIN_ATTEMPTS).delete().lt('attempted_at', cutoff_date).execute()
            data = handle_supabase_error(response)
            return len(data) if data else 0
        except Exception as e:
            raise DatabaseError(f"Failed to cleanup old attempts: {e}")
    
    @classmethod
    def get_recent_attempts(cls, limit: int = 10) -> List['LoginAttempt']:
        """Get recent login attempts."""
        supabase = get_supabase()
        try:
            response = supabase.table(Tables.LOGIN_ATTEMPTS).select("*").order('attempted_at', desc=True).limit(limit).execute()
            data = handle_supabase_error(response)
            return [cls(attempt_data) for attempt_data in data]
        except Exception as e:
            raise DatabaseError(f"Failed to get recent attempts: {e}")
    
    @classmethod
    def count_recent_attempts(cls, hours: int = 24) -> int:
        """Count recent login attempts."""
        supabase = get_supabase()
        try:
            cutoff_time = (utc_now() - timedelta(hours=hours)).isoformat()
            response = supabase.table(Tables.LOGIN_ATTEMPTS).select("*", count='exact').gte('attempted_at', cutoff_time).execute()
            return response.count if hasattr(response, 'count') else 0
        except Exception as e:
            raise DatabaseError(f"Failed to count recent attempts: {e}")
    
    @classmethod
    def count_failed_attempts(cls, hours: int = 24) -> int:
        """Count failed login attempts."""
        supabase = get_supabase()
        try:
            cutoff_time = (utc_now() - timedelta(hours=hours)).isoformat()
            response = supabase.table(Tables.LOGIN_ATTEMPTS).select("*", count='exact').eq('success', False).gte('attempted_at', cutoff_time).execute()
            return response.count if hasattr(response, 'count') else 0
        except Exception as e:
            raise DatabaseError(f"Failed to count failed attempts: {e}")

"""
Login attempt tracking and IP lockout service.
"""
from datetime import datetime, timedelta
from typing import Optional

from app.errors import DatabaseError, handle_supabase_error
from app.supabase_client import get_supabase
from app.utils.timezone_utils import parse_datetime_aware, utc_now


class LoginAttempt:
    def __init__(self, data: dict):
        self.id = data.get("id")
        self.ip_address = data.get("ip_address")
        self.username_or_email = data.get("username_or_email")
        self.success = data.get("success", False)
        self.attempted_at = data.get("attempted_at")
        self.user_agent = data.get("user_agent")

        if isinstance(self.attempted_at, str):
            self.attempted_at = parse_datetime_aware(self.attempted_at)

    def save(self):
        supabase = get_supabase()
        try:
            attempt_data = {
                "ip_address": self.ip_address,
                "username_or_email": self.username_or_email,
                "success": self.success,
                "attempted_at": self.attempted_at.isoformat() if self.attempted_at else utc_now().isoformat(),
                "user_agent": self.user_agent,
            }

            if self.id:
                response = supabase.table("login_attempts").update(attempt_data).eq("id", self.id).execute()
                handle_supabase_error(response)
            else:
                response = supabase.table("login_attempts").insert(attempt_data).execute()
                data = handle_supabase_error(response)
                if data and len(data) > 0:
                    self.id = data[0]["id"]
        except Exception as e:
            raise DatabaseError(f"Failed to save login attempt: {e}")

    @classmethod
    def get_failed_attempts_count(cls, ip_address: str, time_window_minutes: int = 15) -> int:
        supabase = get_supabase()
        try:
            cutoff_time = (utc_now() - timedelta(minutes=time_window_minutes)).isoformat()
            response = supabase.table("login_attempts").select("*", count="exact").eq("ip_address", ip_address).eq("success", False).gte("attempted_at", cutoff_time).execute()
            return response.count if hasattr(response, "count") else 0
        except Exception as e:
            raise DatabaseError(f"Failed to count failed attempts: {e}")

    @classmethod
    def is_ip_locked(cls, ip_address: str, max_attempts: int = 5, lockout_minutes: int = 15) -> bool:
        failed_count = cls.get_failed_attempts_count(ip_address, lockout_minutes)
        return failed_count >= max_attempts

    @classmethod
    def get_lockout_time_remaining(cls, ip_address: str, lockout_minutes: int = 15) -> Optional[timedelta]:
        supabase = get_supabase()
        try:
            cutoff_time = (utc_now() - timedelta(minutes=lockout_minutes)).isoformat()
            response = supabase.table("login_attempts").select("*").eq("ip_address", ip_address).eq("success", False).gte("attempted_at", cutoff_time).order("attempted_at", desc=True).limit(1).execute()
            data = handle_supabase_error(response)

            if data and len(data) > 0:
                last_failed = cls(data[0])
                if isinstance(last_failed.attempted_at, datetime):
                    unlock_time = last_failed.attempted_at + timedelta(minutes=lockout_minutes)
                    if unlock_time > utc_now():
                        return unlock_time - utc_now()
            return None
        except Exception as e:
            raise DatabaseError(f"Failed to get lockout time remaining: {e}")

    @classmethod
    def record_attempt(cls, ip_address: str, username_or_email: Optional[str] = None, success: bool = False, user_agent: Optional[str] = None) -> "LoginAttempt":
        attempt_data = {
            "ip_address": ip_address,
            "username_or_email": username_or_email,
            "success": success,
            "attempted_at": utc_now(),
            "user_agent": user_agent,
        }
        attempt = cls(attempt_data)
        attempt.save()
        return attempt

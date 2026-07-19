from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional, Tuple
from app.supabase_client import get_supabase
from app.errors import DatabaseError, handle_supabase_error
from app.utils.timezone_utils import parse_datetime_aware, utc_now


class User:
    def __init__(self, data: Dict[str, Any]):
        """Initialize User from Supabase data."""
        self.id = data.get("id")
        self.username = data.get("username")
        self.email = data.get("email")
        self._is_active = data.get("is_active", True)
        self.created_at = data.get("created_at")
        self.last_login = data.get("last_login")
        self.is_admin = data.get("is_admin", False)
        self.is_verified = data.get("is_verified", False)
        self.total_xp = data.get("total_xp", 0)
        self.timezone = data.get("timezone", "UTC")
        self.cybersecurity_experience = data.get("cybersecurity_experience")
        self.onboarding_completed = data.get("onboarding_completed", False)

        if isinstance(self.created_at, str):
            self.created_at = parse_datetime_aware(self.created_at)
        if isinstance(self.last_login, str):
            self.last_login = parse_datetime_aware(self.last_login)

    @property
    def is_active(self):
        return self._is_active

    @is_active.setter
    def is_active(self, value):
        self._is_active = bool(value)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "is_active": self.is_active,
            "is_admin": self.is_admin,
            "is_verified": self.is_verified,
            "total_xp": self.total_xp,
            "timezone": self.timezone,
            "cybersecurity_experience": self.cybersecurity_experience,
            "onboarding_completed": self.onboarding_completed,
            "created_at": self.created_at,
            "last_login": self.last_login,
        }

    def save(self):
        supabase = get_supabase()
        try:
            user_data = {
                "username": self.username,
                "email": self.email,
                "is_active": self.is_active,
                "is_admin": self.is_admin,
                "is_verified": self.is_verified,
                "total_xp": self.total_xp,
                "timezone": self.timezone,
                "cybersecurity_experience": self.cybersecurity_experience,
                "onboarding_completed": self.onboarding_completed,
                "last_login": self.last_login.isoformat() if self.last_login else None,
            }

            if self.id:
                response = supabase.table("users").update(user_data).eq("id", self.id).execute()
                handle_supabase_error(response)
            else:
                user_data["created_at"] = utc_now().isoformat()
                response = supabase.table("users").insert(user_data).execute()
                data = handle_supabase_error(response)
                if data and len(data) > 0:
                    self.id = data[0]["id"]
                    self.created_at = parse_datetime_aware(data[0]["created_at"])
        except Exception as e:
            raise DatabaseError(f"Failed to save user: {e}")

    def update_last_login(self):
        self.last_login = utc_now()
        self.save()

    def verify_email(self):
        self.is_verified = True
        self.save()

    @classmethod
    def create(cls, email: str, timezone: str = "UTC", username: str = None, is_admin: bool = False) -> "User":
        user_data = {
            "username": username,
            "email": email,
            "is_active": True,
            "is_admin": is_admin,
            "is_verified": False,
            "total_xp": 0,
            "timezone": timezone,
            "cybersecurity_experience": None,
            "onboarding_completed": bool(username),
            "created_at": utc_now(),
            "last_login": None,
        }
        user = cls(user_data)
        user.save()
        return user

    @classmethod
    def find_by_id(cls, user_id: int) -> Optional["User"]:
        supabase = get_supabase()
        try:
            response = supabase.table("users").select("*").eq("id", user_id).execute()
            data = handle_supabase_error(response)
            if data and len(data) > 0:
                return cls(data[0])
            return None
        except Exception as e:
            raise DatabaseError(f"Failed to find user by ID: {e}")

    @classmethod
    def find_by_username(cls, username: str) -> Optional["User"]:
        supabase = get_supabase()
        try:
            response = supabase.table("users").select("*").eq("username", username).execute()
            data = handle_supabase_error(response)
            if data and len(data) > 0:
                return cls(data[0])
            return None
        except Exception as e:
            raise DatabaseError(f"Failed to find user by username: {e}")

    @classmethod
    def find_by_email(cls, email: str) -> Optional["User"]:
        supabase = get_supabase()
        try:
            response = supabase.table("users").select("*").eq("email", email).execute()
            data = handle_supabase_error(response)
            if data and len(data) > 0:
                return cls(data[0])
            return None
        except Exception as e:
            raise DatabaseError(f"Failed to find user by email: {e}")

    @classmethod
    def find_by_username_or_email(cls, identifier: str) -> Optional["User"]:
        supabase = get_supabase()
        try:
            response = (
                supabase.table("users")
                .select("*")
                .or_(f"username.eq.{identifier},email.eq.{identifier}")
                .execute()
            )
            data = handle_supabase_error(response)
            if data and len(data) > 0:
                return cls(data[0])
            return None
        except Exception as e:
            raise DatabaseError(f"Failed to find user by username or email: {e}")

    @classmethod
    def get_all_users(
        cls,
        page: int = 1,
        per_page: int = 25,
        search: Optional[str] = None,
        status_filter: str = "all",
    ) -> Tuple[List["User"], int]:
        supabase = get_supabase()
        try:
            query = supabase.table("users").select("*", count="exact")

            if search:
                query = query.or_(f"username.ilike.%{search}%,email.ilike.%{search}%")

            if status_filter == "active":
                query = query.eq("is_active", True)
            elif status_filter == "inactive":
                query = query.eq("is_active", False)
            elif status_filter == "admin":
                query = query.eq("is_admin", True)

            offset = (page - 1) * per_page
            response = (
                query.order("created_at", desc=True)
                .range(offset, offset + per_page - 1)
                .execute()
            )
            data = handle_supabase_error(response)
            total_count = response.count if hasattr(response, "count") else len(data)
            return [cls(user_data) for user_data in data], total_count
        except Exception as e:
            raise DatabaseError(f"Failed to get users: {e}")

    @classmethod
    def count_all(cls) -> int:
        supabase = get_supabase()
        try:
            response = supabase.table("users").select("*", count="exact").execute()
            return response.count if hasattr(response, "count") else 0
        except Exception as e:
            raise DatabaseError(f"Failed to count users: {e}")

    @classmethod
    def count_active(cls) -> int:
        supabase = get_supabase()
        try:
            response = (
                supabase.table("users")
                .select("*", count="exact")
                .eq("is_active", True)
                .execute()
            )
            return response.count if hasattr(response, "count") else 0
        except Exception as e:
            raise DatabaseError(f"Failed to count active users: {e}")

    @classmethod
    def count_recent_registrations(cls, days: int = 30) -> int:
        supabase = get_supabase()
        try:
            cutoff_date = (utc_now() - timedelta(days=days)).isoformat()
            response = (
                supabase.table("users")
                .select("*", count="exact")
                .gte("created_at", cutoff_date)
                .execute()
            )
            return response.count if hasattr(response, "count") else 0
        except Exception as e:
            raise DatabaseError(f"Failed to count recent registrations: {e}")

    @classmethod
    def count_verified_emails(cls) -> int:
        supabase = get_supabase()
        try:
            response = (
                supabase.table("users")
                .select("*", count="exact")
                .eq("is_verified", True)
                .execute()
            )
            return response.count if hasattr(response, "count") else 0
        except Exception as e:
            raise DatabaseError(f"Failed to count verified emails: {e}")

    def __repr__(self):
        return f"<User {self.username}>"

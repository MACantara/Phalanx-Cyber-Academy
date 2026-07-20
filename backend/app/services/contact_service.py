"""
Contact service
Manages contact form submissions
"""
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional, Tuple
from app.supabase_client import get_supabase
from app.errors import DatabaseError, handle_supabase_error
from app.utils.timezone_utils import parse_datetime_aware, utc_now


class Contact:
    """Contact form submission service"""

    def __init__(self, data: Dict[str, Any]):
        self.id = data.get("id")
        self.name = data.get("name")
        self.email = data.get("email")
        self.subject = data.get("subject")
        self.message = data.get("message")
        self.created_at = data.get("created_at")
        self.is_read = data.get("is_read", False)

        if isinstance(self.created_at, str):
            self.created_at = parse_datetime_aware(self.created_at)

    def save(self):
        supabase = get_supabase()
        try:
            contact_data = {
                "name": self.name,
                "email": self.email,
                "subject": self.subject,
                "message": self.message,
                "is_read": self.is_read,
            }

            if self.id:
                response = (
                    supabase.table("contact_submissions")
                    .update(contact_data)
                    .eq("id", self.id)
                    .execute()
                )
                handle_supabase_error(response)
            else:
                contact_data["created_at"] = utc_now().isoformat()
                response = supabase.table("contact_submissions").insert(contact_data).execute()
                data = handle_supabase_error(response)
                if data and len(data) > 0:
                    self.id = data[0]["id"]
                    self.created_at = parse_datetime_aware(data[0]["created_at"])
        except Exception as e:
            raise DatabaseError(f"Failed to save contact: {e}")

    def mark_as_read(self):
        self.is_read = True
        self.save()

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "subject": self.subject,
            "message": self.message,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "is_read": self.is_read,
        }

    @classmethod
    def create(cls, name: str, email: str, subject: str, message: str) -> "Contact":
        contact = cls(
            {
                "name": name,
                "email": email,
                "subject": subject,
                "message": message,
                "is_read": False,
            }
        )
        contact.save()
        return contact

    @classmethod
    def get_unread_count(cls) -> int:
        supabase = get_supabase()
        try:
            response = (
                supabase.table("contact_submissions")
                .select("*", count="exact")
                .eq("is_read", False)
                .execute()
            )
            return response.count if hasattr(response, "count") else 0
        except Exception as e:
            raise DatabaseError(f"Failed to count unread contacts: {e}")

    @classmethod
    def get_recent_submissions(cls, limit: int = 10) -> List["Contact"]:
        supabase = get_supabase()
        try:
            response = (
                supabase.table("contact_submissions")
                .select("*")
                .order("created_at", desc=True)
                .limit(limit)
                .execute()
            )
            data = handle_supabase_error(response)
            return [cls(contact_data) for contact_data in data]
        except Exception as e:
            raise DatabaseError(f"Failed to get recent submissions: {e}")

    @classmethod
    def get_all_submissions(
        cls,
        page: int = 1,
        per_page: int = 25,
        search: Optional[str] = None,
        status_filter: str = "all",
    ) -> Tuple[List["Contact"], int]:
        supabase = get_supabase()
        try:
            query = supabase.table("contact_submissions").select("*", count="exact")

            if search:
                query = query.or_(
                    f"name.ilike.%{search}%,email.ilike.%{search}%,subject.ilike.%{search}%"
                )

            if status_filter == "read":
                query = query.eq("is_read", True)
            elif status_filter == "unread":
                query = query.eq("is_read", False)

            offset = (page - 1) * per_page
            response = (
                query.order("created_at", desc=True)
                .range(offset, offset + per_page - 1)
                .execute()
            )
            data = handle_supabase_error(response)
            total_count = response.count if hasattr(response, "count") else len(data)
            return [cls(contact_data) for contact_data in data], total_count
        except Exception as e:
            raise DatabaseError(f"Failed to get contact submissions: {e}")

    @classmethod
    def count_recent_submissions(cls, days: int = 30) -> int:
        supabase = get_supabase()
        try:
            cutoff_date = (utc_now() - timedelta(days=days)).isoformat()
            response = (
                supabase.table("contact_submissions")
                .select("*", count="exact")
                .gte("created_at", cutoff_date)
                .execute()
            )
            return response.count if hasattr(response, "count") else 0
        except Exception as e:
            raise DatabaseError(f"Failed to count recent submissions: {e}")

    @classmethod
    def cleanup_old_submissions(cls, days_old: int = 365) -> int:
        supabase = get_supabase()
        try:
            cutoff_date = (utc_now() - timedelta(days=days_old)).isoformat()
            response = (
                supabase.table("contact_submissions")
                .delete()
                .lt("created_at", cutoff_date)
                .execute()
            )
            data = handle_supabase_error(response)
            return len(data) if data else 0
        except Exception as e:
            raise DatabaseError(f"Failed to cleanup old submissions: {e}")

    def __repr__(self):
        return f"<Contact {self.name} - {self.subject}>"

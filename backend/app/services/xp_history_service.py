"""
XP History service
Tracks XP changes for users with a detailed audit trail
"""
from typing import Any, Dict, List, Optional
from app.supabase_client import get_supabase
from app.errors import DatabaseError, handle_supabase_error
from app.utils.timezone_utils import utc_now, parse_datetime_aware


class XPHistory:
    """XP history service for tracking XP changes and audit trail"""

    def __init__(self, data: Dict[str, Any]):
        self.id = data.get("id")
        self.xp_change = data.get("xp_change")
        self.balance_before = data.get("balance_before")
        self.balance_after = data.get("balance_after")
        self.reason = data.get("reason")
        self.session_id = data.get("session_id")
        self.created_at = data.get("created_at")

        if self.created_at and isinstance(self.created_at, str):
            self.created_at = parse_datetime_aware(self.created_at)

    def __repr__(self):
        return f"<XPHistory {self.xp_change:+d} XP ({self.reason}) - Session {self.session_id}>"

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "xp_change": self.xp_change,
            "balance_before": self.balance_before,
            "balance_after": self.balance_after,
            "reason": self.reason,
            "session_id": self.session_id,
            "created_at": self.created_at,
        }

    @classmethod
    def create_entry(
        cls,
        xp_change: int,
        reason: str = "manual_adjustment",
        balance_before: Optional[int] = None,
        balance_after: Optional[int] = None,
        session_id: Optional[int] = None,
        user_id: Optional[int] = None,
    ) -> "XPHistory":
        try:
            if session_id is not None:
                from app.services.session_service import Session
                session = Session.get_by_id(session_id)
                if not session:
                    raise ValueError(f"Session {session_id} not found")
                actual_user_id = session.user_id
            elif user_id is not None:
                actual_user_id = user_id
            else:
                raise ValueError("Either session_id or user_id must be provided")

            if balance_before is None or balance_after is None:
                from app.services.user_service import User
                user = User.find_by_id(actual_user_id)
                if not user:
                    raise ValueError(f"User {actual_user_id} not found")
                if balance_before is None:
                    balance_before = user.total_xp or 0
                if balance_after is None:
                    balance_after = balance_before + xp_change

            supabase = get_supabase()
            entry_data = {
                "xp_change": xp_change,
                "balance_before": balance_before,
                "balance_after": balance_after,
                "reason": reason,
                "session_id": session_id,
                "created_at": utc_now().isoformat(),
            }
            response = supabase.table("xp_history").insert(entry_data).execute()
            data = handle_supabase_error(response)

            if data and len(data) > 0:
                return cls(data[0])
            raise DatabaseError("No data returned from XP history creation")
        except Exception as e:
            raise DatabaseError(f"Failed to create XP history entry: {str(e)}")

    @classmethod
    def create_manual_adjustment(
        cls,
        user_id: str,
        xp_change: int,
        reason: str = "manual_adjustment",
        balance_before: Optional[int] = None,
        balance_after: Optional[int] = None,
    ) -> "XPHistory":
        try:
            if balance_before is None or balance_after is None:
                from app.services.user_service import User
                user = User.find_by_id(user_id)
                if not user:
                    raise ValueError(f"User {user_id} not found")
                if balance_before is None:
                    balance_before = user.total_xp or 0
                if balance_after is None:
                    balance_after = balance_before + xp_change

            supabase = get_supabase()
            entry_data = {
                "xp_change": xp_change,
                "balance_before": balance_before,
                "balance_after": balance_after,
                "reason": reason,
                "session_id": None,
                "created_at": utc_now().isoformat(),
            }
            response = supabase.table("xp_history").insert(entry_data).execute()
            data = handle_supabase_error(response)

            if data and len(data) > 0:
                from app.services.user_service import User
                supabase.table("profiles").update({"total_xp": balance_after}).eq("id", user_id).execute()
                return cls(data[0])
            raise DatabaseError("No data returned from XP history creation")
        except Exception as e:
            raise DatabaseError(f"Failed to create manual XP adjustment: {str(e)}")

    @classmethod
    def get_by_id(cls, entry_id: int) -> Optional["XPHistory"]:
        try:
            supabase = get_supabase()
            response = supabase.table("xp_history").select("*").eq("id", entry_id).execute()
            data = handle_supabase_error(response)
            if data and len(data) > 0:
                return cls(data[0])
            return None
        except Exception as e:
            raise DatabaseError(f"Failed to get XP history entry {entry_id}: {str(e)}")

    @classmethod
    def get_by_session(cls, session_id: int, limit: int = 50) -> List["XPHistory"]:
        try:
            supabase = get_supabase()
            response = (
                supabase.table("xp_history")
                .select("*")
                .eq("session_id", session_id)
                .order("created_at", desc=True)
                .limit(limit)
                .execute()
            )
            data = handle_supabase_error(response)
            return [cls(entry) for entry in data] if data else []
        except Exception as e:
            raise DatabaseError(f"Failed to get XP history for session {session_id}: {str(e)}")

    @classmethod
    def get_by_user_id(cls, user_id: str, limit: int = 20) -> List["XPHistory"]:
        try:
            supabase = get_supabase()
            sessions_response = (
                supabase.table("sessions").select("id").eq("profile_id", user_id).execute()
            )
            sessions_data = handle_supabase_error(sessions_response)
            session_ids = [s["id"] for s in sessions_data] if sessions_data else []

            response = (
                supabase.table("xp_history")
                .select("*")
                .in_("session_id", session_ids)
                .order("created_at", desc=True)
                .limit(limit)
                .execute()
            )
            data = handle_supabase_error(response)
            return [cls(entry) for entry in data] if data else []
        except Exception as e:
            raise DatabaseError(f"Failed to get XP history for user {user_id}: {str(e)}")

    @classmethod
    def get_recent_activity(cls, limit: int = 20) -> List["XPHistory"]:
        try:
            supabase = get_supabase()
            response = (
                supabase.table("xp_history")
                .select("*")
                .order("created_at", desc=True)
                .limit(limit)
                .execute()
            )
            data = handle_supabase_error(response)
            return [cls(entry) for entry in data] if data else []
        except Exception as e:
            raise DatabaseError(f"Failed to get recent XP activity: {str(e)}")

    @classmethod
    def calculate_user_total_xp(cls, user_id: str) -> int:
        try:
            supabase = get_supabase()
            sessions_response = supabase.table("sessions").select("id").eq("profile_id", user_id).execute()
            sessions_data = handle_supabase_error(sessions_response)
            session_ids = [s["id"] for s in sessions_data] if sessions_data else []

            if not session_ids:
                return 0

            response = (
                supabase.table("xp_history")
                .select("xp_change")
                .in_("session_id", session_ids)
                .execute()
            )
            data = handle_supabase_error(response)
            if not data:
                return 0

            return sum(entry["xp_change"] for entry in data)
        except Exception as e:
            raise DatabaseError(f"Failed to calculate user total XP: {str(e)}")

    @classmethod
    def get_xp_leaderboard_data(cls, limit: int = 10) -> List[Dict[str, Any]]:
        try:
            supabase = get_supabase()
            sessions_response = supabase.table("sessions").select("id, user_id").execute()
            sessions_data = handle_supabase_error(sessions_response)
            session_to_user = {s["id"]: s["profile_id"] for s in sessions_data} if sessions_data else {}

            response = supabase.table("xp_history").select("xp_change, session_id, reason").execute()
            data = handle_supabase_error(response)
            if not data:
                return []

            user_totals: Dict[int, int] = {}
            for entry in data:
                user_id = None
                if entry.get("session_id"):
                    user_id = session_to_user.get(entry["session_id"])
                elif "manual" in entry.get("reason", "").lower():
                    continue

                if user_id:
                    user_totals[user_id] = user_totals.get(user_id, 0) + entry["xp_change"]

            sorted_users = sorted(user_totals.items(), key=lambda x: x[1], reverse=True)[:limit]
            return [
                {"rank": rank, "profile_id": user_id, "total_xp": total_xp}
                for rank, (user_id, total_xp) in enumerate(sorted_users, 1)
            ]
        except Exception as e:
            raise DatabaseError(f"Failed to get XP leaderboard data: {str(e)}")

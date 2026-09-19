"""
XP History service
Tracks XP changes for users with a detailed audit trail
"""
import uuid
from typing import Any, Dict, List, Optional

from sqlalchemy import func, select
from sqlalchemy.exc import SQLAlchemyError

from app.db import session_scope
from app.errors import DatabaseError
from app.models import Profile, XPHistory as XPHistoryRow
from app.utils.timezone_utils import utc_now, parse_datetime_aware


def _xp_history_to_dict(row: XPHistoryRow) -> Dict[str, Any]:
    return {
        "id": row.id,
        "profile_id": str(row.profile_id),
        "xp_change": row.xp_change,
        "balance_before": row.balance_before,
        "balance_after": row.balance_after,
        "reason": row.reason,
        "session_id": row.session_id,
        "created_at": row.created_at,
    }


def _profile_uuid(user_id: Any) -> Optional[uuid.UUID]:
    try:
        return uuid.UUID(str(user_id))
    except (ValueError, AttributeError):
        return None


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

    @classmethod
    def _from_row(cls, row: XPHistoryRow) -> "XPHistory":
        return cls(_xp_history_to_dict(row))

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
                game_session = Session.get_by_id(session_id)
                if not game_session:
                    raise ValueError(f"Session {session_id} not found")
                actual_user_id = game_session.user_id
            elif user_id is not None:
                actual_user_id = user_id
            else:
                raise ValueError("Either session_id or user_id must be provided")

            profile_id = _profile_uuid(actual_user_id)
            if profile_id is None:
                raise ValueError(f"User {actual_user_id} not found")

            if balance_before is None or balance_after is None:
                from app.services.user_service import User
                user = User.find_by_id(actual_user_id)
                if not user:
                    raise ValueError(f"User {actual_user_id} not found")
                if balance_before is None:
                    balance_before = user.total_xp or 0
                if balance_after is None:
                    balance_after = balance_before + xp_change

            with session_scope() as session:
                row = XPHistoryRow(
                    profile_id=profile_id,
                    xp_change=xp_change,
                    balance_before=balance_before,
                    balance_after=balance_after,
                    reason=reason,
                    session_id=session_id,
                    created_at=utc_now(),
                )
                session.add(row)
                session.flush()
                return cls._from_row(row)
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

            profile_id = _profile_uuid(user_id)
            if profile_id is None:
                raise ValueError(f"User {user_id} not found")

            with session_scope() as session:
                row = XPHistoryRow(
                    profile_id=profile_id,
                    xp_change=xp_change,
                    balance_before=balance_before,
                    balance_after=balance_after,
                    reason=reason,
                    session_id=None,
                    created_at=utc_now(),
                )
                session.add(row)

                profile = session.get(Profile, profile_id)
                if profile is not None:
                    profile.total_xp = balance_after

                session.flush()
                return cls._from_row(row)
        except Exception as e:
            raise DatabaseError(f"Failed to create manual XP adjustment: {str(e)}")

    @classmethod
    def get_by_id(cls, entry_id: int) -> Optional["XPHistory"]:
        try:
            with session_scope() as session:
                row = session.get(XPHistoryRow, entry_id)
                return cls._from_row(row) if row else None
        except SQLAlchemyError as e:
            raise DatabaseError(f"Failed to get XP history entry {entry_id}: {str(e)}")

    @classmethod
    def get_by_session(cls, session_id: int, limit: int = 50) -> List["XPHistory"]:
        try:
            with session_scope() as session:
                rows = session.execute(
                    select(XPHistoryRow)
                    .where(XPHistoryRow.session_id == session_id)
                    .order_by(XPHistoryRow.created_at.desc())
                    .limit(limit)
                ).scalars().all()
                return [cls._from_row(row) for row in rows]
        except SQLAlchemyError as e:
            raise DatabaseError(f"Failed to get XP history for session {session_id}: {str(e)}")

    @classmethod
    def get_by_user_id(cls, user_id: str, limit: int = 20) -> List["XPHistory"]:
        profile_id = _profile_uuid(user_id)
        if profile_id is None:
            return []
        try:
            with session_scope() as session:
                rows = session.execute(
                    select(XPHistoryRow)
                    .where(XPHistoryRow.profile_id == profile_id)
                    .order_by(XPHistoryRow.created_at.desc())
                    .limit(limit)
                ).scalars().all()
                return [cls._from_row(row) for row in rows]
        except SQLAlchemyError as e:
            raise DatabaseError(f"Failed to get XP history for user {user_id}: {str(e)}")

    @classmethod
    def get_recent_activity(cls, limit: int = 20) -> List["XPHistory"]:
        try:
            with session_scope() as session:
                rows = session.execute(
                    select(XPHistoryRow)
                    .order_by(XPHistoryRow.created_at.desc())
                    .limit(limit)
                ).scalars().all()
                return [cls._from_row(row) for row in rows]
        except SQLAlchemyError as e:
            raise DatabaseError(f"Failed to get recent XP activity: {str(e)}")

    @classmethod
    def calculate_user_total_xp(cls, user_id: str) -> int:
        profile_id = _profile_uuid(user_id)
        if profile_id is None:
            return 0
        try:
            with session_scope() as session:
                total = session.execute(
                    select(func.coalesce(func.sum(XPHistoryRow.xp_change), 0))
                    .where(XPHistoryRow.profile_id == profile_id)
                ).scalar()
                return int(total or 0)
        except SQLAlchemyError as e:
            raise DatabaseError(f"Failed to calculate user total XP: {str(e)}")

    @classmethod
    def get_xp_leaderboard_data(cls, limit: int = 10) -> List[Dict[str, Any]]:
        try:
            total_xp = func.sum(XPHistoryRow.xp_change).label("total_xp")
            with session_scope() as session:
                rows = session.execute(
                    select(XPHistoryRow.profile_id, total_xp)
                    .where(XPHistoryRow.session_id.is_not(None))
                    .group_by(XPHistoryRow.profile_id)
                    .order_by(total_xp.desc())
                    .limit(limit)
                ).all()

            return [
                {"rank": rank, "user_id": str(row.profile_id), "total_xp": row.total_xp}
                for rank, row in enumerate(rows, 1)
            ]
        except SQLAlchemyError as e:
            raise DatabaseError(f"Failed to get XP leaderboard data: {str(e)}")

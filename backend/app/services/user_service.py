import uuid
from datetime import timedelta
from typing import Any, Dict, List, Optional, Tuple

from sqlalchemy import func, or_, select, update
from sqlalchemy.exc import SQLAlchemyError

from app.db import session_scope
from app.errors import DatabaseError
from app.models import Profile
from app.utils.timezone_utils import parse_datetime_aware, utc_now


def _profile_to_dict(row: Profile) -> Dict[str, Any]:
    return {
        "id": str(row.id),
        "clerk_user_id": row.clerk_user_id,
        "username": row.username,
        "email": row.email,
        "is_active": row.is_active,
        "is_admin": row.is_admin,
        "total_xp": row.total_xp,
        "timezone": row.timezone,
        "cybersecurity_experience": row.cybersecurity_experience,
        "onboarding_completed": row.onboarding_completed,
        "created_at": row.created_at,
        "last_login": row.last_login,
    }


class User:
    def __init__(self, data: Dict[str, Any]):
        """Initialize User from a profile dict."""
        self.id = data.get("id")
        self.clerk_user_id = data.get("clerk_user_id")
        self.username = data.get("username")
        self.email = data.get("email")
        self._is_active = data.get("is_active", True)
        self.created_at = data.get("created_at")
        self.last_login = data.get("last_login")
        self.is_admin = data.get("is_admin", False)
        self.total_xp = data.get("total_xp", 0)
        self.timezone = data.get("timezone", "UTC")
        self.cybersecurity_experience = data.get("cybersecurity_experience")
        self.onboarding_completed = data.get("onboarding_completed", False)

        if isinstance(self.created_at, str):
            self.created_at = parse_datetime_aware(self.created_at)
        if isinstance(self.last_login, str):
            self.last_login = parse_datetime_aware(self.last_login)

    @classmethod
    def _from_row(cls, row: Profile) -> "User":
        return cls(_profile_to_dict(row))

    @property
    def is_active(self):
        return self._is_active

    @is_active.setter
    def is_active(self, value):
        self._is_active = bool(value)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "clerk_user_id": self.clerk_user_id,
            "username": self.username,
            "email": self.email,
            "is_active": self.is_active,
            "is_admin": self.is_admin,
            "total_xp": self.total_xp,
            "timezone": self.timezone,
            "cybersecurity_experience": self.cybersecurity_experience,
            "onboarding_completed": self.onboarding_completed,
            "created_at": self.created_at,
            "last_login": self.last_login,
        }

    def save(self):
        try:
            with session_scope() as session:
                if self.id:
                    row = session.get(Profile, uuid.UUID(str(self.id)))
                    if row is None:
                        raise DatabaseError(f"Profile {self.id} not found")
                    for field in (
                        "clerk_user_id",
                        "username",
                        "email",
                        "is_active",
                        "is_admin",
                        "total_xp",
                        "timezone",
                        "cybersecurity_experience",
                        "onboarding_completed",
                    ):
                        setattr(row, field, getattr(self, field))
                    row.is_active = self.is_active
                    row.last_login = self.last_login
                else:
                    row = Profile(
                        clerk_user_id=self.clerk_user_id,
                        username=self.username,
                        email=self.email,
                        is_active=self.is_active,
                        is_admin=self.is_admin,
                        total_xp=self.total_xp,
                        timezone=self.timezone,
                        cybersecurity_experience=self.cybersecurity_experience,
                        onboarding_completed=self.onboarding_completed,
                        last_login=self.last_login,
                    )
                    session.add(row)
                    session.flush()
                    self.id = str(row.id)
                    self.created_at = row.created_at
        except SQLAlchemyError as e:
            raise DatabaseError(f"Failed to save user: {e}")

    def touch_last_login(self, min_interval_minutes: int = 15):
        """Update last_login at most once per interval (JWT auth has no login event)."""
        now = utc_now()
        if self.last_login and (now - self.last_login) < timedelta(
            minutes=min_interval_minutes
        ):
            return
        self.last_login = now
        try:
            with session_scope() as session:
                session.execute(
                    update(Profile)
                    .where(Profile.id == uuid.UUID(str(self.id)))
                    .values(last_login=now)
                )
        except SQLAlchemyError:
            pass

    @classmethod
    def find_by_id(cls, user_id: str) -> Optional["User"]:
        try:
            uid = uuid.UUID(str(user_id))
        except (ValueError, AttributeError):
            return None
        try:
            with session_scope() as session:
                row = session.get(Profile, uid)
                return cls._from_row(row) if row else None
        except SQLAlchemyError as e:
            raise DatabaseError(f"Failed to find user by ID: {e}")

    @classmethod
    def find_by_clerk_user_id(cls, clerk_user_id: str) -> Optional["User"]:
        try:
            with session_scope() as session:
                row = session.execute(
                    select(Profile).where(Profile.clerk_user_id == clerk_user_id)
                ).scalar_one_or_none()
                return cls._from_row(row) if row else None
        except SQLAlchemyError as e:
            raise DatabaseError(f"Failed to find user by Clerk ID: {e}")

    @classmethod
    def find_by_username(cls, username: str) -> Optional["User"]:
        try:
            with session_scope() as session:
                row = session.execute(
                    select(Profile).where(Profile.username == username)
                ).scalar_one_or_none()
                return cls._from_row(row) if row else None
        except SQLAlchemyError as e:
            raise DatabaseError(f"Failed to find user by username: {e}")

    @classmethod
    def find_by_email(cls, email: str) -> Optional["User"]:
        try:
            with session_scope() as session:
                row = session.execute(
                    select(Profile).where(Profile.email == email)
                ).scalar_one_or_none()
                return cls._from_row(row) if row else None
        except SQLAlchemyError as e:
            raise DatabaseError(f"Failed to find user by email: {e}")

    @classmethod
    def find_by_username_or_email(cls, identifier: str) -> Optional["User"]:
        try:
            with session_scope() as session:
                row = session.execute(
                    select(Profile).where(
                        or_(Profile.username == identifier, Profile.email == identifier)
                    )
                ).scalar_one_or_none()
                return cls._from_row(row) if row else None
        except SQLAlchemyError as e:
            raise DatabaseError(f"Failed to find user by username or email: {e}")

    @classmethod
    def get_all_users(
        cls,
        page: int = 1,
        per_page: int = 25,
        search: Optional[str] = None,
        status_filter: str = "all",
    ) -> Tuple[List["User"], int]:
        try:
            with session_scope() as session:
                query = select(Profile)
                count_query = select(func.count()).select_from(Profile)

                if search:
                    pattern = f"%{search}%"
                    cond = or_(
                        Profile.username.ilike(pattern), Profile.email.ilike(pattern)
                    )
                    query = query.where(cond)
                    count_query = count_query.where(cond)

                if status_filter == "active":
                    query = query.where(Profile.is_active.is_(True))
                    count_query = count_query.where(Profile.is_active.is_(True))
                elif status_filter == "inactive":
                    query = query.where(Profile.is_active.is_(False))
                    count_query = count_query.where(Profile.is_active.is_(False))
                elif status_filter == "admin":
                    query = query.where(Profile.is_admin.is_(True))
                    count_query = count_query.where(Profile.is_admin.is_(True))

                total_count = session.execute(count_query).scalar() or 0
                rows = session.execute(
                    query.order_by(Profile.created_at.desc())
                    .offset((page - 1) * per_page)
                    .limit(per_page)
                ).scalars().all()
                return [cls._from_row(r) for r in rows], total_count
        except SQLAlchemyError as e:
            raise DatabaseError(f"Failed to get users: {e}")

    @classmethod
    def count_all(cls) -> int:
        try:
            with session_scope() as session:
                return session.execute(select(func.count()).select_from(Profile)).scalar() or 0
        except SQLAlchemyError as e:
            raise DatabaseError(f"Failed to count users: {e}")

    @classmethod
    def count_active(cls) -> int:
        try:
            with session_scope() as session:
                return session.execute(
                    select(func.count())
                    .select_from(Profile)
                    .where(Profile.is_active.is_(True))
                ).scalar() or 0
        except SQLAlchemyError as e:
            raise DatabaseError(f"Failed to count active users: {e}")

    @classmethod
    def count_recent_registrations(cls, days: int = 30) -> int:
        try:
            cutoff = utc_now() - timedelta(days=days)
            with session_scope() as session:
                return session.execute(
                    select(func.count())
                    .select_from(Profile)
                    .where(Profile.created_at >= cutoff)
                ).scalar() or 0
        except SQLAlchemyError as e:
            raise DatabaseError(f"Failed to count recent registrations: {e}")

    def __repr__(self):
        return f"<User {self.username}>"

"""
Contact service
Manages contact form submissions
"""
from datetime import timedelta
from typing import Any, Dict, List, Optional, Tuple

from sqlalchemy import delete, func, or_, select
from sqlalchemy.exc import SQLAlchemyError

from app.db import session_scope
from app.errors import DatabaseError
from app.models import ContactSubmission
from app.utils.timezone_utils import parse_datetime_aware, utc_now


def _contact_to_dict(row: ContactSubmission) -> Dict[str, Any]:
    return {
        "id": row.id,
        "name": row.name,
        "email": row.email,
        "subject": row.subject,
        "message": row.message,
        "created_at": row.created_at,
        "is_read": row.is_read,
    }


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

    @classmethod
    def _from_row(cls, row: ContactSubmission) -> "Contact":
        return cls(_contact_to_dict(row))

    def save(self):
        try:
            with session_scope() as session:
                if self.id:
                    row = session.get(ContactSubmission, int(self.id))
                    if row is None:
                        raise DatabaseError(f"Contact submission {self.id} not found")
                    for field in ("name", "email", "subject", "message", "is_read"):
                        setattr(row, field, getattr(self, field))
                else:
                    row = ContactSubmission(
                        name=self.name,
                        email=self.email,
                        subject=self.subject,
                        message=self.message,
                        is_read=self.is_read,
                        created_at=utc_now(),
                    )
                    session.add(row)
                    session.flush()
                    self.id = row.id
                    self.created_at = row.created_at
        except SQLAlchemyError as e:
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
        try:
            with session_scope() as session:
                return session.execute(
                    select(func.count())
                    .select_from(ContactSubmission)
                    .where(ContactSubmission.is_read.is_(False))
                ).scalar() or 0
        except SQLAlchemyError as e:
            raise DatabaseError(f"Failed to count unread contacts: {e}")

    @classmethod
    def get_recent_submissions(cls, limit: int = 10) -> List["Contact"]:
        try:
            with session_scope() as session:
                rows = session.execute(
                    select(ContactSubmission)
                    .order_by(ContactSubmission.created_at.desc())
                    .limit(limit)
                ).scalars().all()
                return [cls._from_row(r) for r in rows]
        except SQLAlchemyError as e:
            raise DatabaseError(f"Failed to get recent submissions: {e}")

    @classmethod
    def get_all_submissions(
        cls,
        page: int = 1,
        per_page: int = 25,
        search: Optional[str] = None,
        status_filter: str = "all",
    ) -> Tuple[List["Contact"], int]:
        try:
            with session_scope() as session:
                query = select(ContactSubmission)
                count_query = select(func.count()).select_from(ContactSubmission)

                if search:
                    pattern = f"%{search}%"
                    cond = or_(
                        ContactSubmission.name.ilike(pattern),
                        ContactSubmission.email.ilike(pattern),
                        ContactSubmission.subject.ilike(pattern),
                    )
                    query = query.where(cond)
                    count_query = count_query.where(cond)

                if status_filter == "read":
                    query = query.where(ContactSubmission.is_read.is_(True))
                    count_query = count_query.where(ContactSubmission.is_read.is_(True))
                elif status_filter == "unread":
                    query = query.where(ContactSubmission.is_read.is_(False))
                    count_query = count_query.where(ContactSubmission.is_read.is_(False))

                total_count = session.execute(count_query).scalar() or 0
                rows = session.execute(
                    query.order_by(ContactSubmission.created_at.desc())
                    .offset((page - 1) * per_page)
                    .limit(per_page)
                ).scalars().all()
                return [cls._from_row(r) for r in rows], total_count
        except SQLAlchemyError as e:
            raise DatabaseError(f"Failed to get contact submissions: {e}")

    @classmethod
    def count_recent_submissions(cls, days: int = 30) -> int:
        try:
            cutoff = utc_now() - timedelta(days=days)
            with session_scope() as session:
                return session.execute(
                    select(func.count())
                    .select_from(ContactSubmission)
                    .where(ContactSubmission.created_at >= cutoff)
                ).scalar() or 0
        except SQLAlchemyError as e:
            raise DatabaseError(f"Failed to count recent submissions: {e}")

    @classmethod
    def cleanup_old_submissions(cls, days_old: int = 365) -> int:
        try:
            cutoff = utc_now() - timedelta(days=days_old)
            with session_scope() as session:
                result = session.execute(
                    delete(ContactSubmission).where(
                        ContactSubmission.created_at < cutoff
                    )
                )
                return result.rowcount or 0
        except SQLAlchemyError as e:
            raise DatabaseError(f"Failed to cleanup old submissions: {e}")

    def __repr__(self):
        return f"<Contact {self.name} - {self.subject}>"

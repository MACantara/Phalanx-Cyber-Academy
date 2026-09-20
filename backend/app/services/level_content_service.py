"""
Level content service — per-level payload storage with draft/publish.

`level_content` is the editable source of truth for what a level serves.
`payload` is live; `draft` holds unpublished edits until publish promotes it.
The file fallback (data/level_content/level_N/data.json) stays in the read
path in the router for levels with no row — this service only knows the table.
"""
import uuid
from typing import Any, Dict, Optional

from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError

from app.db import session_scope
from app.errors import DatabaseError
from app.models import LevelContent
from app.utils.timezone_utils import utc_now


def _to_dict(row: LevelContent) -> Dict[str, Any]:
    return {
        "id": row.id,
        "level_id": row.level_id,
        "payload": row.payload,
        "draft": row.draft,
        "schema_version": row.schema_version,
        "revision": row.revision,
        "updated_by": str(row.updated_by) if row.updated_by else None,
        "created_at": row.created_at,
        "updated_at": row.updated_at,
        "published_at": row.published_at,
    }


def _user_uuid(user_id: Any) -> Optional[uuid.UUID]:
    try:
        return uuid.UUID(str(user_id))
    except (ValueError, AttributeError):
        return None


def get_payload(level_id: int) -> Optional[Dict[str, Any]]:
    """The live payload for a level, or None (caller falls back to file)."""
    try:
        with session_scope() as s:
            return s.execute(
                select(LevelContent.payload).where(LevelContent.level_id == level_id)
            ).scalar_one_or_none()
    except SQLAlchemyError as e:
        raise DatabaseError(f"Failed to get content for level {level_id}: {e}")


def get_admin_view(level_id: int) -> Optional[Dict[str, Any]]:
    """Editor view: draft wins over payload, plus revision/publish metadata."""
    try:
        with session_scope() as s:
            row = s.execute(
                select(LevelContent).where(LevelContent.level_id == level_id)
            ).scalar_one_or_none()
        if row is None:
            return None
        d = _to_dict(row)
        d["content"] = row.draft if row.draft is not None else row.payload
        d["has_draft"] = row.draft is not None
        return d
    except SQLAlchemyError as e:
        raise DatabaseError(f"Failed to get admin content for level {level_id}: {e}")


def save_draft(level_id: int, draft: Dict[str, Any], user_id: Any = None) -> Dict[str, Any]:
    try:
        with session_scope() as s:
            row = s.execute(
                select(LevelContent).where(LevelContent.level_id == level_id)
            ).scalar_one_or_none()
            if row is None:
                row = LevelContent(level_id=level_id)
                s.add(row)
            row.draft = draft
            row.updated_by = _user_uuid(user_id)
            row.updated_at = utc_now()
            s.flush()
            return _to_dict(row)
    except SQLAlchemyError as e:
        raise DatabaseError(f"Failed to save draft for level {level_id}: {e}")


def publish(level_id: int, user_id: Any = None) -> Optional[Dict[str, Any]]:
    """Promote draft → payload. Returns None when the level has no row,
    raises DatabaseError when there is nothing to publish."""
    try:
        with session_scope() as s:
            row = s.execute(
                select(LevelContent).where(LevelContent.level_id == level_id)
            ).scalar_one_or_none()
            if row is None:
                return None
            if row.draft is None:
                raise DatabaseError(f"Level {level_id} has no draft to publish")
            row.payload = row.draft
            row.draft = None
            row.revision = (row.revision or 0) + 1
            row.updated_by = _user_uuid(user_id)
            row.updated_at = utc_now()
            row.published_at = utc_now()
            s.flush()
            return _to_dict(row)
    except SQLAlchemyError as e:
        raise DatabaseError(f"Failed to publish content for level {level_id}: {e}")


def upsert_payload(level_id: int, payload: Dict[str, Any], user_id: Any = None) -> Dict[str, Any]:
    """Direct publish — used by seeds/imports where no draft cycle applies."""
    try:
        with session_scope() as s:
            row = s.execute(
                select(LevelContent).where(LevelContent.level_id == level_id)
            ).scalar_one_or_none()
            if row is None:
                row = LevelContent(level_id=level_id)
                s.add(row)
            row.payload = payload
            row.updated_by = _user_uuid(user_id)
            row.updated_at = utc_now()
            row.published_at = utc_now()
            s.flush()
            return _to_dict(row)
    except SQLAlchemyError as e:
        raise DatabaseError(f"Failed to upsert content for level {level_id}: {e}")

"""
Level progress service — one row per (profile, level), upserted on
checkpoint and completion. Feeds the levels list (partial progress),
cross-session resume (resume_session_id), and per-level leaderboards.
"""
import uuid
from typing import Any, Dict, List, Optional

from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError

from app.db import session_scope
from app.errors import DatabaseError
from app.models import LevelProgress, Profile
from app.utils.timezone_utils import utc_now


def _uuid(user_id: Any) -> Optional[uuid.UUID]:
    try:
        return uuid.UUID(str(user_id))
    except (ValueError, AttributeError):
        return None


def _to_dict(row: LevelProgress) -> Dict[str, Any]:
    return {
        "level_id": row.level_id,
        "lessons_done": row.lessons_done,
        "lessons_total": row.lessons_total,
        "best_score": row.best_score,
        "best_accuracy": row.best_accuracy,
        "resume_session_id": row.resume_session_id,
        "completed_at": row.completed_at,
        "updated_at": row.updated_at,
    }


def upsert_progress(
    profile_id: uuid.UUID,
    level_id: int,
    *,
    lessons_done: Optional[int] = None,
    lessons_total: Optional[int] = None,
    score: Optional[int] = None,
    accuracy: Optional[float] = None,
    resume_session_id: Optional[int] = None,
    clear_resume: bool = False,
    completed: bool = False,
) -> Dict[str, Any]:
    """Idempotent rollup write. Only provided fields change; bests only
    improve. `completed` stamps completed_at once (first clear wins)."""
    try:
        with session_scope() as s:
            row = s.execute(
                select(LevelProgress).where(
                    LevelProgress.profile_id == profile_id,
                    LevelProgress.level_id == level_id,
                )
            ).scalar_one_or_none()
            if row is None:
                row = LevelProgress(profile_id=profile_id, level_id=level_id)
                s.add(row)

            if lessons_done is not None:
                row.lessons_done = max(row.lessons_done or 0, lessons_done)
            if lessons_total is not None:
                row.lessons_total = lessons_total
            if score is not None and (row.best_score is None or score > row.best_score):
                row.best_score = score
            if accuracy is not None and (
                row.best_accuracy is None or accuracy > row.best_accuracy
            ):
                row.best_accuracy = accuracy
            if resume_session_id is not None:
                row.resume_session_id = resume_session_id
            if clear_resume:
                row.resume_session_id = None
            if completed and row.completed_at is None:
                row.completed_at = utc_now()
                first_clear = True
            else:
                first_clear = False
            row.updated_at = utc_now()
            s.flush()
            d = _to_dict(row)
            d["first_clear"] = first_clear
            return d
    except SQLAlchemyError as e:
        raise DatabaseError(f"Failed to upsert progress for level {level_id}: {e}")


def get_map_for_user(user_id: Any) -> Dict[int, Dict[str, Any]]:
    """{level_id: progress} for the levels list."""
    pid = _uuid(user_id)
    if pid is None:
        return {}
    try:
        with session_scope() as s:
            rows = s.execute(
                select(LevelProgress).where(LevelProgress.profile_id == pid)
            ).scalars().all()
        return {r.level_id: _to_dict(r) for r in rows}
    except SQLAlchemyError as e:
        raise DatabaseError(f"Failed to get progress for user: {e}")


def leaderboard_for_level(level_id: int, limit: int = 10) -> List[Dict[str, Any]]:
    """Per-level board: best score, tie-broken by earliest completion."""
    try:
        with session_scope() as s:
            rows = s.execute(
                select(LevelProgress, Profile.username)
                .join(Profile, Profile.id == LevelProgress.profile_id)
                .where(LevelProgress.level_id == level_id)
                .where(LevelProgress.completed_at.is_not(None))
                .order_by(
                    LevelProgress.best_score.desc().nulls_last(),
                    LevelProgress.completed_at.asc(),
                )
                .limit(limit)
            ).all()
        return [
            {
                "rank": i,
                "username": username,
                "best_score": p.best_score,
                "best_accuracy": p.best_accuracy,
                "completed_at": p.completed_at,
            }
            for i, (p, username) in enumerate(rows, 1)
        ]
    except SQLAlchemyError as e:
        raise DatabaseError(f"Failed to get leaderboard for level {level_id}: {e}")

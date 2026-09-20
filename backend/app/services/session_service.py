"""
Session service
Tracks user learning sessions for levels and other game modes
"""
import logging
import uuid
from typing import Any, Dict, List, Optional

from sqlalchemy import delete, select
from sqlalchemy.exc import SQLAlchemyError

from app.db import session_scope
from app.errors import DatabaseError
from app.models import Session as SessionModel
from app.utils.timezone_utils import utc_now, parse_datetime_aware


logger = logging.getLogger(__name__)


def _session_to_dict(row: SessionModel) -> Dict[str, Any]:
    return {
        "id": row.id,
        "profile_id": str(row.profile_id),
        "session_name": row.session_name,
        "level_id": row.level_id,
        "score": row.score,
        "state": row.state,
        "lessons_completed": row.lessons_completed,
        "lessons_total": row.lessons_total,
        "start_time": row.start_time,
        "end_time": row.end_time,
        "created_at": row.created_at,
    }


def _profile_uuid(user_id: Any) -> Optional[uuid.UUID]:
    try:
        return uuid.UUID(str(user_id))
    except (ValueError, AttributeError):
        return None


class Session:
    """Session service for tracking user learning sessions"""

    def __init__(self, data: Dict[str, Any]):
        self.id = data.get("id")
        self.user_id = data.get("profile_id")
        self.session_name = data.get("session_name")
        self.level_id = data.get("level_id")
        self.score = data.get("score")
        self.start_time = data.get("start_time")
        self.end_time = data.get("end_time")
        self.state = data.get("state")
        self.lessons_completed = data.get("lessons_completed", 0)
        self.lessons_total = data.get("lessons_total")
        self.created_at = data.get("created_at")

        if self.start_time and isinstance(self.start_time, str):
            self.start_time = parse_datetime_aware(self.start_time)
        if self.end_time and isinstance(self.end_time, str):
            self.end_time = parse_datetime_aware(self.end_time)
        if self.created_at and isinstance(self.created_at, str):
            self.created_at = parse_datetime_aware(self.created_at)

    @classmethod
    def _from_row(cls, row: SessionModel) -> "Session":
        return cls(_session_to_dict(row))

    def __repr__(self):
        return f"<Session {self.user_id}: {self.session_name} ({self.score})>"

    @property
    def time_spent(self) -> int:
        if self.start_time and self.end_time:
            delta = self.end_time - self.start_time
            return int(delta.total_seconds())
        return 0

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "profile_id": self.user_id,
            "session_name": self.session_name,
            "level_id": self.level_id,
            "score": self.score,
            "state": self.state,
            "lessons_completed": self.lessons_completed,
            "lessons_total": self.lessons_total,
            "start_time": self.start_time,
            "end_time": self.end_time,
            "time_spent": self.time_spent,
            "created_at": self.created_at,
        }

    @classmethod
    def start_session(cls, user_id: str, session_name: str, level_id: Optional[int] = None) -> "Session":
        profile_id = _profile_uuid(user_id)
        if profile_id is None:
            raise DatabaseError(f"Failed to start session: invalid user_id {user_id}")
        try:
            with session_scope() as session:
                row = SessionModel(
                    profile_id=profile_id,
                    session_name=session_name,
                    level_id=level_id,
                    start_time=utc_now(),
                    created_at=utc_now(),
                )
                session.add(row)
                session.flush()
                return cls._from_row(row)
        except SQLAlchemyError as e:
            raise DatabaseError(f"Failed to start session: {str(e)}")

    @classmethod
    def end_session(
        cls,
        session_id: int,
        score: Optional[int] = None,
        user_id: Optional[str] = None,
        breakdown: Optional[Dict[str, Any]] = None,
    ) -> "Session":
        if score is not None and not (0 <= score <= 100):
            raise ValueError("Score must be between 0 and 100")

        profile_id = _profile_uuid(user_id) if user_id is not None else None
        if user_id is not None and profile_id is None:
            raise ValueError(f"Session {session_id} not found")

        try:
            with session_scope() as session:
                query = select(SessionModel).where(SessionModel.id == session_id)
                if profile_id is not None:
                    query = query.where(SessionModel.profile_id == profile_id)
                row = session.execute(query).scalar_one_or_none()
                if row is None:
                    raise ValueError(f"Session {session_id} not found")

                row.end_time = utc_now()
                row.score = score
                session.flush()
                updated_session = cls._from_row(row)
        except SQLAlchemyError as e:
            raise DatabaseError(f"Failed to end session: {str(e)}")

        first_clear = False
        if updated_session.level_id is not None and profile_id is not None:
            try:
                from app.services import level_progress_service
                progress = level_progress_service.upsert_progress(
                    profile_id,
                    updated_session.level_id,
                    lessons_done=updated_session.lessons_completed,
                    score=score,
                    accuracy=(breakdown or {}).get("evidence_acc"),
                    clear_resume=True,
                    completed=True,
                )
                first_clear = bool(progress.get("first_clear"))
            except Exception:
                logger.warning("Failed to upsert level progress", exc_info=True)

        if score is not None and score > 0:
            try:
                from app.services.xp_award import XPManager
                xp_result = XPManager.award_session_xp(
                    user_id=updated_session.user_id,
                    session_name=updated_session.session_name,
                    score=score,
                    time_spent=updated_session.time_spent,
                    level_id=updated_session.level_id,
                    session_id=updated_session.id,
                    reason="session_completion",
                    breakdown=breakdown,
                    first_clear=first_clear,
                )
                updated_session._xp_awarded = xp_result["xp_awarded"]
                updated_session._xp_calculation = xp_result.get("calculation_details", {})
                updated_session._new_total_xp = xp_result.get("new_total", 0)
            except Exception as xp_error:
                logger.warning("Failed to award session XP: %s", xp_error)
                updated_session._xp_awarded = 0
                updated_session._xp_calculation = {}
                updated_session._new_total_xp = 0

        return updated_session

    @classmethod
    def checkpoint(
        cls,
        session_id: int,
        user_id: str,
        state: Dict[str, Any],
        lessons_completed: Optional[int] = None,
        lessons_total: Optional[int] = None,
    ) -> "Session":
        """Bank lesson progress on an open session and mark it as the
        level's resume anchor. Overwrites state — latest checkpoint wins."""
        profile_id = _profile_uuid(user_id)
        if profile_id is None:
            raise ValueError(f"Session {session_id} not found")
        try:
            with session_scope() as session:
                row = session.execute(
                    select(SessionModel)
                    .where(SessionModel.id == session_id)
                    .where(SessionModel.profile_id == profile_id)
                    .where(SessionModel.end_time.is_(None))
                ).scalar_one_or_none()
                if row is None:
                    raise ValueError(f"Session {session_id} not found or already ended")
                row.state = state
                if lessons_completed is not None:
                    row.lessons_completed = lessons_completed
                if lessons_total is not None:
                    row.lessons_total = lessons_total
                session.flush()
                updated = cls._from_row(row)
        except SQLAlchemyError as e:
            raise DatabaseError(f"Failed to checkpoint session {session_id}: {e}")

        if updated.level_id is not None:
            from app.services import level_progress_service
            level_progress_service.upsert_progress(
                profile_id,
                updated.level_id,
                lessons_done=lessons_completed,
                lessons_total=lessons_total,
                resume_session_id=session_id,
            )
        return updated

    @classmethod
    def award_lesson(
        cls,
        session_id: int,
        user_id: str,
        lesson_index: int,
        lessons_total: int,
        competence: Optional[float] = None,
    ) -> Dict[str, Any]:
        """Award XP for a banked lesson — validates the session is the
        caller's and still open, then delegates to XPManager (idempotent)."""
        profile_id = _profile_uuid(user_id)
        if profile_id is None:
            raise ValueError(f"Session {session_id} not found")
        try:
            with session_scope() as session:
                row = session.execute(
                    select(SessionModel)
                    .where(SessionModel.id == session_id)
                    .where(SessionModel.profile_id == profile_id)
                ).scalar_one_or_none()
                if row is None or row.level_id is None:
                    raise ValueError(f"Session {session_id} not found")
                level_id = row.level_id
        except SQLAlchemyError as e:
            raise DatabaseError(f"Failed to award lesson: {e}")

        from app.services.xp_award import XPManager
        return XPManager.award_lesson_xp(
            user_id=user_id,
            level_id=level_id,
            session_id=session_id,
            lesson_index=lesson_index,
            lessons_total=lessons_total,
            competence=competence,
        )

    @classmethod
    def get_active_session_for_level(cls, user_id: str, level_id: int) -> Optional["Session"]:
        """The caller's open session on a specific level — the resume anchor."""
        profile_id = _profile_uuid(user_id)
        if profile_id is None:
            return None
        try:
            with session_scope() as session:
                row = session.execute(
                    select(SessionModel)
                    .where(SessionModel.profile_id == profile_id)
                    .where(SessionModel.level_id == level_id)
                    .where(SessionModel.end_time.is_(None))
                    .order_by(SessionModel.created_at.desc())
                    .limit(1)
                ).scalar_one_or_none()
                if row is None:
                    return None
                return cls._from_row(row)
        except SQLAlchemyError as e:
            raise DatabaseError(f"Failed to get active session for level {level_id}: {e}")

    @classmethod
    def get_user_sessions(cls, user_id: str, limit: int = 50, offset: int = 0) -> List["Session"]:
        profile_id = _profile_uuid(user_id)
        if profile_id is None:
            return []
        try:
            with session_scope() as session:
                rows = session.execute(
                    select(SessionModel)
                    .where(SessionModel.profile_id == profile_id)
                    .order_by(SessionModel.created_at.desc())
                    .offset(offset)
                    .limit(limit)
                ).scalars().all()
                return [cls._from_row(row) for row in rows]
        except SQLAlchemyError as e:
            raise DatabaseError(f"Failed to get user sessions: {str(e)}")

    @classmethod
    def get_user_progress_summary(cls, user_id: str) -> Dict[str, Any]:
        try:
            from app.services.level_service import Level

            total_levels = len(Level.get_available_levels())
            profile_id = _profile_uuid(user_id)

            with session_scope() as session:
                session_rows = []
                if profile_id is not None:
                    session_rows = session.execute(
                        select(
                            SessionModel.level_id,
                            SessionModel.session_name,
                            SessionModel.score,
                        )
                        .where(SessionModel.profile_id == profile_id)
                        .where(SessionModel.end_time.is_not(None))
                    ).all()

                completed_level_ids = set()
                for row in session_rows:
                    if row.level_id is not None:
                        completed_level_ids.add(row.level_id)
                completed_levels = len(completed_level_ids)

                best_scores = {}
                session_names = list(set(r.session_name for r in session_rows))
                for session_name in session_names:
                    best = session.execute(
                        select(
                            SessionModel.score,
                            SessionModel.start_time,
                            SessionModel.end_time,
                        )
                        .where(SessionModel.profile_id == profile_id)
                        .where(SessionModel.session_name == session_name)
                        .where(SessionModel.end_time.is_not(None))
                        .order_by(SessionModel.score.desc())
                        .limit(1)
                    ).first()
                    if best:
                        start_time = best.start_time
                        end_time = best.end_time
                        time_spent = int((end_time - start_time).total_seconds()) if start_time and end_time else 0
                        best_scores[session_name] = {
                            "score": best.score,
                            "time": time_spent,
                        }

            return {
                "total_levels": total_levels,
                "completed_levels": completed_levels,
                "completion_percentage": round(completed_levels / total_levels * 100, 1)
                if total_levels > 0
                else 0,
                "best_scores": best_scores,
                "completed_level_ids": list(completed_level_ids),
            }
        except SQLAlchemyError as e:
            raise DatabaseError(f"Failed to get user progress summary: {str(e)}")

    @classmethod
    def get_session_statistics(cls, session_name: str) -> Dict[str, Any]:
        try:
            with session_scope() as session:
                rows = session.execute(
                    select(
                        SessionModel.score,
                        SessionModel.start_time,
                        SessionModel.end_time,
                    )
                    .where(SessionModel.session_name == session_name)
                    .where(SessionModel.end_time.is_not(None))
                ).all()

            if not rows:
                return {
                    "session_name": session_name,
                    "total_sessions": 0,
                    "avg_score": 0,
                    "max_score": 0,
                    "avg_time": 0,
                    "min_time": 0,
                }

            scores = [r.score for r in rows if r.score is not None]
            times = []
            for r in rows:
                if r.start_time and r.end_time:
                    time_spent = int((r.end_time - r.start_time).total_seconds())
                    times.append(time_spent)

            return {
                "session_name": session_name,
                "total_sessions": len(rows),
                "avg_score": round(sum(scores) / len(scores), 1) if scores else 0,
                "max_score": max(scores) if scores else 0,
                "avg_time": round(sum(times) / len(times), 1) if times else 0,
                "min_time": min(times) if times else 0,
            }
        except SQLAlchemyError as e:
            raise DatabaseError(f"Failed to get session statistics: {str(e)}")

    def save(self) -> bool:
        profile_id = _profile_uuid(self.user_id)
        if profile_id is None:
            raise DatabaseError(f"Failed to save session: invalid user_id {self.user_id}")
        try:
            with session_scope() as session:
                if self.id:
                    row = session.get(SessionModel, self.id)
                    if row is not None:
                        row.profile_id = profile_id
                        row.session_name = self.session_name
                        row.level_id = self.level_id
                        row.score = self.score
                        row.start_time = self.start_time
                        row.end_time = self.end_time
                else:
                    row = SessionModel(
                        profile_id=profile_id,
                        session_name=self.session_name,
                        level_id=self.level_id,
                        score=self.score,
                        start_time=self.start_time,
                        end_time=self.end_time,
                        created_at=utc_now(),
                    )
                    session.add(row)
                    session.flush()
                    self.id = row.id
                    self.created_at = row.created_at
            return True
        except SQLAlchemyError as e:
            raise DatabaseError(f"Failed to save session: {str(e)}")

    def delete(self) -> bool:
        if not self.id:
            raise ValueError("Cannot delete session without ID")
        try:
            with session_scope() as session:
                session.execute(
                    delete(SessionModel).where(SessionModel.id == self.id)
                )
            return True
        except SQLAlchemyError as e:
            raise DatabaseError(f"Failed to delete session: {str(e)}")

    @classmethod
    def get_by_id(cls, session_id: int) -> Optional["Session"]:
        try:
            with session_scope() as session:
                row = session.get(SessionModel, session_id)
                return cls._from_row(row) if row else None
        except SQLAlchemyError as e:
            raise DatabaseError(f"Failed to get session {session_id}: {str(e)}")

    @classmethod
    def get_active_session(cls, user_id: str) -> Optional["Session"]:
        profile_id = _profile_uuid(user_id)
        if profile_id is None:
            return None
        try:
            with session_scope() as session:
                row = session.execute(
                    select(SessionModel)
                    .where(SessionModel.profile_id == profile_id)
                    .where(SessionModel.end_time.is_(None))
                    .order_by(SessionModel.created_at.desc())
                    .limit(1)
                ).scalar_one_or_none()
                return cls._from_row(row) if row else None
        except SQLAlchemyError as e:
            raise DatabaseError(f"Failed to get active session: {str(e)}")

    @classmethod
    def get_latest_completed_sessions_per_level(cls, user_id: str) -> Dict[int, "Session"]:
        profile_id = _profile_uuid(user_id)
        if profile_id is None:
            return {}
        try:
            with session_scope() as session:
                rows = session.execute(
                    select(SessionModel)
                    .where(SessionModel.profile_id == profile_id)
                    .where(SessionModel.end_time.is_not(None))
                    .where(SessionModel.level_id.is_not(None))
                    .order_by(SessionModel.created_at.desc())
                ).scalars().all()

            session_lookup = {}
            for row in rows:
                level_id = row.level_id
                if level_id is not None:
                    try:
                        normalized_level_id = int(level_id)
                    except (ValueError, TypeError):
                        normalized_level_id = level_id

                    if normalized_level_id not in session_lookup:
                        session_lookup[normalized_level_id] = cls._from_row(row)

            return session_lookup
        except SQLAlchemyError as e:
            raise DatabaseError(f"Failed to get latest completed sessions per level: {str(e)}")

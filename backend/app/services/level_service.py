"""
Level service
Represents level metadata and configuration for Phalanx Cyber Academy
"""
from typing import Any, Dict, List, Optional

from sqlalchemy import delete, select, update
from sqlalchemy.exc import SQLAlchemyError

from app.db import session_scope
from app.errors import DatabaseError
from app.models import Level as LevelRow
from app.utils.timezone_utils import utc_now, parse_datetime_aware


def _level_to_dict(row: LevelRow) -> Dict[str, Any]:
    return {
        "id": row.id,
        "level_id": row.level_id,
        "name": row.name,
        "description": row.description,
        "category": row.category,
        "icon": row.icon,
        "estimated_time": row.estimated_time,
        "xp_reward": row.xp_reward,
        "skills": row.skills,
        "difficulty": row.difficulty,
        "unlocked": row.unlocked,
        "coming_soon": row.coming_soon,
        "created_at": row.created_at,
        "updated_at": row.updated_at,
    }


class Level:
    """Level service for managing level metadata and configuration"""

    def __init__(self, data: Dict[str, Any]):
        self.id = data.get("id")
        self.level_id = data.get("level_id")
        self.name = data.get("name")
        self.description = data.get("description")
        self.category = data.get("category")
        self.icon = data.get("icon")
        self.estimated_time = data.get("estimated_time")
        self.xp_reward = data.get("xp_reward", 0)
        self.skills = data.get("skills", [])
        self.difficulty = data.get("difficulty", "medium")
        self.unlocked = data.get("unlocked", True)
        self.coming_soon = data.get("coming_soon", False)
        self.created_at = data.get("created_at")
        self.updated_at = data.get("updated_at")

        if self.created_at and isinstance(self.created_at, str):
            self.created_at = parse_datetime_aware(self.created_at)
        if self.updated_at and isinstance(self.updated_at, str):
            self.updated_at = parse_datetime_aware(self.updated_at)

    @classmethod
    def _from_row(cls, row: LevelRow) -> "Level":
        return cls(_level_to_dict(row))

    def __repr__(self):
        return f"<Level {self.level_id}: {self.name}>"

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "level_id": self.level_id,
            "name": self.name,
            "description": self.description,
            "category": self.category,
            "icon": self.icon,
            "estimated_time": self.estimated_time,
            "xp_reward": self.xp_reward,
            "skills": self.skills,
            "difficulty": self.difficulty,
            "unlocked": self.unlocked,
            "coming_soon": self.coming_soon,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
        }

    @classmethod
    def get_by_level_id(cls, level_id: int) -> Optional["Level"]:
        try:
            with session_scope() as session:
                row = session.execute(
                    select(LevelRow).where(LevelRow.level_id == level_id)
                ).scalar_one_or_none()
                return cls._from_row(row) if row else None
        except SQLAlchemyError as e:
            raise DatabaseError(f"Failed to get level {level_id}: {e}")

    @classmethod
    def get_by_category(cls, category: str) -> List["Level"]:
        try:
            with session_scope() as session:
                rows = session.execute(
                    select(LevelRow).where(LevelRow.category == category)
                ).scalars().all()
                return [cls._from_row(r) for r in rows]
        except SQLAlchemyError as e:
            raise DatabaseError(f"Failed to get levels for category {category}: {e}")

    @classmethod
    def get_available_levels(cls) -> List["Level"]:
        try:
            with session_scope() as session:
                rows = session.execute(
                    select(LevelRow).where(LevelRow.coming_soon.is_(False))
                ).scalars().all()
                return [cls._from_row(r) for r in rows]
        except SQLAlchemyError as e:
            raise DatabaseError(f"Failed to get available levels: {e}")

    @classmethod
    def get_all_levels(cls) -> List["Level"]:
        try:
            with session_scope() as session:
                rows = session.execute(
                    select(LevelRow).order_by(LevelRow.level_id)
                ).scalars().all()
                return [cls._from_row(r) for r in rows]
        except SQLAlchemyError as e:
            raise DatabaseError(f"Failed to get all levels: {e}")

    @classmethod
    def create_level(
        cls,
        level_id: int,
        name: str,
        description: str = "",
        category: str = "",
        difficulty: str = "medium",
        icon: str = "",
        estimated_time: str = "",
        xp_reward: int = 0,
        skills: List[str] = None,
        unlocked: bool = True,
        coming_soon: bool = False,
    ) -> "Level":
        try:
            with session_scope() as session:
                row = LevelRow(
                    level_id=level_id,
                    name=name,
                    description=description,
                    category=category,
                    difficulty=difficulty,
                    icon=icon,
                    estimated_time=estimated_time,
                    xp_reward=xp_reward,
                    skills=skills or [],
                    unlocked=unlocked,
                    coming_soon=coming_soon,
                    created_at=utc_now(),
                    updated_at=utc_now(),
                )
                session.add(row)
                session.flush()
                return cls._from_row(row)
        except SQLAlchemyError as e:
            raise DatabaseError(f"Failed to create level: {e}")

    def save(self) -> bool:
        try:
            with session_scope() as session:
                values = {
                    "name": self.name,
                    "description": self.description,
                    "category": self.category,
                    "icon": self.icon,
                    "estimated_time": self.estimated_time,
                    "xp_reward": self.xp_reward,
                    "skills": self.skills,
                    "difficulty": self.difficulty,
                    "unlocked": self.unlocked,
                    "coming_soon": self.coming_soon,
                    "updated_at": utc_now(),
                }

                if self.id:
                    session.execute(
                        update(LevelRow)
                        .where(LevelRow.id == self.id)
                        .values(**values)
                    )
                else:
                    row = LevelRow(
                        level_id=self.level_id,
                        created_at=utc_now(),
                        **values,
                    )
                    session.add(row)
                    session.flush()
                    self.id = row.id
                    self.created_at = row.created_at

            return True
        except SQLAlchemyError as e:
            raise DatabaseError(f"Failed to save level: {e}")

    def delete(self) -> bool:
        try:
            if not self.id:
                raise DatabaseError("Cannot delete level without ID")

            with session_scope() as session:
                session.execute(delete(LevelRow).where(LevelRow.id == self.id))
            return True
        except SQLAlchemyError as e:
            raise DatabaseError(f"Failed to delete level: {e}")

    @classmethod
    def validate_level_exists(cls, level_id: int) -> bool:
        try:
            level = cls.get_by_level_id(level_id)
            return level is not None
        except Exception:
            return False

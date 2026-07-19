"""
Level service
Represents level metadata and configuration for Phalanx Cyber Academy
"""
from typing import Any, Dict, List, Optional
from app.supabase_client import get_supabase
from app.errors import DatabaseError, handle_supabase_error
from app.utils.timezone_utils import utc_now, parse_datetime_aware


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
            supabase = get_supabase()
            response = supabase.table("levels").select("*").eq("level_id", level_id).execute()
            data = handle_supabase_error(response)

            if data and len(data) > 0:
                return cls(data[0])
            return None
        except Exception as e:
            raise DatabaseError(f"Failed to get level {level_id}: {str(e)}")

    @classmethod
    def get_by_category(cls, category: str) -> List["Level"]:
        try:
            supabase = get_supabase()
            response = supabase.table("levels").select("*").eq("category", category).execute()
            data = handle_supabase_error(response)
            return [cls(level_data) for level_data in data] if data else []
        except Exception as e:
            raise DatabaseError(f"Failed to get levels for category {category}: {str(e)}")

    @classmethod
    def get_available_levels(cls) -> List["Level"]:
        try:
            supabase = get_supabase()
            response = (
                supabase.table("levels")
                .select("*")
                .eq("unlocked", True)
                .eq("coming_soon", False)
                .execute()
            )
            data = handle_supabase_error(response)
            return [cls(level_data) for level_data in data] if data else []
        except Exception as e:
            raise DatabaseError(f"Failed to get available levels: {str(e)}")

    @classmethod
    def get_all_levels(cls) -> List["Level"]:
        try:
            supabase = get_supabase()
            response = supabase.table("levels").select("*").order("level_id").execute()
            data = handle_supabase_error(response)
            return [cls(level_data) for level_data in data] if data else []
        except Exception as e:
            raise DatabaseError(f"Failed to get all levels: {str(e)}")

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
            supabase = get_supabase()
            level_data = {
                "level_id": level_id,
                "name": name,
                "description": description,
                "category": category,
                "difficulty": difficulty,
                "icon": icon,
                "estimated_time": estimated_time,
                "xp_reward": xp_reward,
                "skills": skills or [],
                "unlocked": unlocked,
                "coming_soon": coming_soon,
                "created_at": utc_now().isoformat(),
                "updated_at": utc_now().isoformat(),
            }

            response = supabase.table("levels").insert(level_data).execute()
            data = handle_supabase_error(response)

            if data and len(data) > 0:
                return cls(data[0])
            raise DatabaseError("No data returned from level creation")
        except Exception as e:
            raise DatabaseError(f"Failed to create level: {str(e)}")

    def save(self) -> bool:
        try:
            supabase = get_supabase()
            level_data = {
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
                "updated_at": utc_now().isoformat(),
            }

            if self.id:
                response = supabase.table("levels").update(level_data).eq("id", self.id).execute()
                handle_supabase_error(response)
            else:
                level_data["level_id"] = self.level_id
                level_data["created_at"] = utc_now().isoformat()
                response = supabase.table("levels").insert(level_data).execute()
                data = handle_supabase_error(response)
                if data and len(data) > 0:
                    self.id = data[0]["id"]
                    self.created_at = data[0]["created_at"]

            return True
        except Exception as e:
            raise DatabaseError(f"Failed to save level: {str(e)}")

    def delete(self) -> bool:
        try:
            if not self.id:
                raise ValueError("Cannot delete level without ID")

            supabase = get_supabase()
            response = supabase.table("levels").delete().eq("id", self.id).execute()
            handle_supabase_error(response)
            return True
        except Exception as e:
            raise DatabaseError(f"Failed to delete level: {str(e)}")

    @classmethod
    def validate_level_exists(cls, level_id: int) -> bool:
        try:
            level = cls.get_by_level_id(level_id)
            return level is not None
        except Exception:
            return False

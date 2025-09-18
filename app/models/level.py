"""
Level Model
Represents level metadata and configuration for the CyberQuest system
"""
from datetime import datetime
from typing import Dict, Any, List, Optional
from app.database import get_supabase, DatabaseError, handle_supabase_error
from app.utils.timezone_utils import utc_now


class Level:
    """Level model for managing level metadata and configuration"""
    
    def __init__(self, data: Dict[str, Any]):
        """Initialize Level from Supabase data"""
        self.id = data.get('id')
        self.level_id = data.get('level_id')
        self.name = data.get('name')
        self.description = data.get('description')
        self.category = data.get('category')
        self.icon = data.get('icon')
        self.estimated_time = data.get('estimated_time')
        self.expected_time_seconds = data.get('expected_time_seconds')
        self.xp_reward = data.get('xp_reward', 0)
        self.skills = data.get('skills')
        self.difficulty = data.get('difficulty', 'medium')
        self.unlocked = data.get('unlocked', True)
        self.coming_soon = data.get('coming_soon', False)
        self.requirements = data.get('requirements')
        self.created_at = data.get('created_at')
        self.updated_at = data.get('updated_at')

    def __repr__(self):
        return f'<Level {self.level_id}: {self.name}>'

    def to_dict(self):
        """Convert to dictionary for JSON serialization"""
        return {
            'id': self.id,
            'level_id': self.level_id,
            'name': self.name,
            'description': self.description,
            'category': self.category,
            'icon': self.icon,
            'estimated_time': self.estimated_time,
            'expected_time_seconds': self.expected_time_seconds,
            'xp_reward': self.xp_reward,
            'skills': self.skills,
            'difficulty': self.difficulty,
            'unlocked': self.unlocked,
            'coming_soon': self.coming_soon,
            'requirements': self.requirements,
            'created_at': self.created_at,
            'updated_at': self.updated_at
        }

    @classmethod
    def get_by_level_id(cls, level_id: int) -> Optional['Level']:
        """Get level by level_id"""
        try:
            supabase = get_supabase()
            response = supabase.table('levels').select('*').eq('level_id', level_id).execute()
            data = handle_supabase_error(response)
            
            if data and len(data) > 0:
                return cls(data[0])
            return None
        except Exception as e:
            raise DatabaseError(f"Failed to get level {level_id}: {str(e)}")

    @classmethod
    def get_by_category(cls, category: str) -> List['Level']:
        """Get levels by category"""
        try:
            supabase = get_supabase()
            response = supabase.table('levels').select('*').eq('category', category).execute()
            data = handle_supabase_error(response)
            
            return [cls(level_data) for level_data in data] if data else []
        except Exception as e:
            raise DatabaseError(f"Failed to get levels for category {category}: {str(e)}")

    @classmethod
    def get_available_levels(cls) -> List['Level']:
        """Get all available (unlocked and not coming soon) levels"""
        try:
            supabase = get_supabase()
            response = (supabase.table('levels')
                       .select('*')
                       .eq('unlocked', True)
                       .eq('coming_soon', False)
                       .execute())
            data = handle_supabase_error(response)
            
            return [cls(level_data) for level_data in data] if data else []
        except Exception as e:
            raise DatabaseError(f"Failed to get available levels: {str(e)}")

    @classmethod
    def get_all_levels(cls) -> List['Level']:
        """Get all levels"""
        try:
            supabase = get_supabase()
            response = supabase.table('levels').select('*').order('level_id').execute()
            data = handle_supabase_error(response)
            
            return [cls(level_data) for level_data in data] if data else []
        except Exception as e:
            raise DatabaseError(f"Failed to get all levels: {str(e)}")

    @classmethod
    def create_level(cls, level_id: int, name: str, description: str = None, 
                    category: str = None, difficulty: str = 'medium', 
                    unlocked: bool = True, coming_soon: bool = False,
                    requirements: Dict[str, Any] = None, 
                    metadata: Dict[str, Any] = None) -> 'Level':
        """Create a new level"""
        try:
            supabase = get_supabase()
            level_data = {
                'level_id': level_id,
                'name': name,
                'description': description,
                'category': category,
                'difficulty': difficulty,
                'unlocked': unlocked,
                'coming_soon': coming_soon,
                'requirements': requirements,
                'metadata': metadata,
                'created_at': utc_now().isoformat(),
                'updated_at': utc_now().isoformat()
            }
            
            response = supabase.table('levels').insert(level_data).execute()
            data = handle_supabase_error(response)
            
            if data and len(data) > 0:
                return cls(data[0])
            raise DatabaseError("No data returned from level creation")
        except Exception as e:
            raise DatabaseError(f"Failed to create level: {str(e)}")

    def save(self) -> bool:
        """Save level to database"""
        try:
            supabase = get_supabase()
            level_data = {
                'name': self.name,
                'description': self.description,
                'category': self.category,
                'icon': self.icon,
                'estimated_time': self.estimated_time,
                'expected_time_seconds': self.expected_time_seconds,
                'xp_reward': self.xp_reward,
                'skills': self.skills,
                'difficulty': self.difficulty,
                'unlocked': self.unlocked,
                'coming_soon': self.coming_soon,
                'requirements': self.requirements,
                'updated_at': utc_now().isoformat()
            }
            
            if self.id:
                # Update existing level
                response = supabase.table('levels').update(level_data).eq('id', self.id).execute()
                handle_supabase_error(response)
            else:
                # Create new level
                level_data['level_id'] = self.level_id
                level_data['created_at'] = utc_now().isoformat()
                response = supabase.table('levels').insert(level_data).execute()
                data = handle_supabase_error(response)
                if data and len(data) > 0:
                    self.id = data[0]['id']
                    self.created_at = data[0]['created_at']
            
            return True
        except Exception as e:
            raise DatabaseError(f"Failed to save level: {str(e)}")

    def delete(self) -> bool:
        """Delete level from database"""
        try:
            if not self.id:
                raise ValueError("Cannot delete level without ID")
            
            supabase = get_supabase()
            response = supabase.table('levels').delete().eq('id', self.id).execute()
            handle_supabase_error(response)
            return True
        except Exception as e:
            raise DatabaseError(f"Failed to delete level: {str(e)}")

    @classmethod
    def populate_from_routes(cls) -> int:
        """
        Populate levels table from fallback data in routes/levels.py
        This is primarily used for initial database seeding.
        Once levels are in the database, they become the source of truth.
        """
        try:
            from app.routes.levels import get_levels_from_db
            
            # Force get_levels_from_db to use fallback data for initial population
            # by temporarily clearing the global cache
            from app.routes.levels import CYBERSECURITY_LEVELS
            original_levels = CYBERSECURITY_LEVELS.copy()
            
            # If CYBERSECURITY_LEVELS is empty or populated from DB, use fallback
            if not CYBERSECURITY_LEVELS or any(level.get('auto_populated') for level in CYBERSECURITY_LEVELS):
                # Use hardcoded fallback for initial seeding
                fallback_levels = [
                    {
                        'id': 1,
                        'name': 'The Misinformation Maze',
                        'description': 'Debunk fake news and stop misinformation from influencing an election.',
                        'difficulty': 'Beginner',
                        'xp_reward': 100,
                        'icon': 'bi-newspaper',
                        'category': 'Information Literacy',
                        'estimated_time': '15 minutes',
                        'skills': ['Critical Thinking', 'Source Verification', 'Fact Checking'],
                        'unlocked': True,
                        'coming_soon': False
                    },
                    # Add more fallback levels as needed
                ]
                levels_to_populate = fallback_levels
            else:
                levels_to_populate = CYBERSECURITY_LEVELS
            
            created_count = 0
            for level_data in levels_to_populate:
                existing = cls.get_by_level_id(level_data['id'])
                if not existing:
                    cls.create_level(
                        level_id=level_data['id'],
                        name=level_data['name'],
                        description=level_data.get('description', ''),
                        category=level_data.get('category', 'cybersecurity'),
                        difficulty=level_data.get('difficulty', 'medium'),
                        unlocked=level_data.get('unlocked', True),
                        coming_soon=level_data.get('comingSoon', False),
                        requirements=level_data.get('requirements'),
                        metadata={
                            'original_data': level_data,
                            'auto_populated': True,
                            'populated_at': utc_now().isoformat()
                        }
                    )
                    created_count += 1
            
            return created_count
        except Exception as e:
            raise DatabaseError(f"Failed to populate levels: {str(e)}")

    @classmethod
    def validate_level_exists(cls, level_id: int) -> bool:
        """Check if a level exists"""
        try:
            level = cls.get_by_level_id(level_id)
            return level is not None
        except Exception:
            return False
"""
Level Completion Model
Tracks level completions for users with scores, time spent, and metadata
"""
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, List
import uuid
from app.database import get_supabase, DatabaseError, handle_supabase_error


class LevelCompletion:
    """Level completion model for tracking user progress"""
    
    def __init__(self, data: Dict[str, Any]):
        """Initialize LevelCompletion from Supabase data"""
        self.id = data.get('id')
        self.user_id = data.get('user_id')
        self.level_id = data.get('level_id')
        self.level_type = data.get('level_type', 'simulation')
        self.score = data.get('score')
        self.time_spent = data.get('time_spent')
        self.difficulty = data.get('difficulty')
        self.source = data.get('source', 'web')
        self.created_at = data.get('created_at')

    def __repr__(self):
        return f'<LevelCompletion {self.user_id}: Level {self.level_id} ({self.score})>'

    def to_dict(self):
        """Convert to dictionary for JSON serialization"""
        result = {
            'id': self.id,
            'user_id': self.user_id,
            'level_id': self.level_id,
            'level_type': self.level_type,
            'score': self.score,
            'time_spent': self.time_spent,
            'difficulty': self.difficulty,
            'source': self.source,
            'created_at': self.created_at
        }
        
        # Include XP information if available (from recent completion)
        if hasattr(self, '_xp_awarded'):
            result['xp_awarded'] = self._xp_awarded
        if hasattr(self, '_xp_calculation'):
            result['xp_calculation'] = self._xp_calculation
            
        return result

    def get_xp_awarded(self) -> int:
        """Get XP awarded for this completion (if available from recent creation)"""
        return getattr(self, '_xp_awarded', 0)
    
    def get_xp_calculation_details(self) -> dict:
        """Get XP calculation details for this completion (if available from recent creation)"""
        return getattr(self, '_xp_calculation', {})

    @classmethod
    def check_duplicate(cls, user_id: int, level_id: int) -> Optional['LevelCompletion']:
        """Check for duplicate completion based on recent submission"""
        try:
            supabase = get_supabase()
            
            # Check for recent completion (within last 5 minutes)
            recent_threshold = (datetime.utcnow() - timedelta(minutes=5)).isoformat()
            
            response = (supabase.table('level_completions')
                       .select('*')
                       .eq('user_id', user_id)
                       .eq('level_id', level_id)
                       .gte('created_at', recent_threshold)
                       .order('created_at', desc=True)
                       .limit(1)
                       .execute())
            data = handle_supabase_error(response)
            
            if data and len(data) > 0:
                return cls(data[0])
            return None
            
        except Exception as e:
            raise DatabaseError(f"Failed to check for duplicate completion: {str(e)}")

    @classmethod
    def create_completion(cls, user_id: int, level_id: int, score: int = None, time_spent: int = None, 
                         difficulty: str = None, source: str = 'web') -> tuple['LevelCompletion', bool]:
        """Create a new level completion with idempotency checking and automatic XP calculation"""
        try:
            # Check for duplicates
            existing = cls.check_duplicate(user_id, level_id)
            if existing:
                return existing, False  # Return existing completion and is_new=False
            
            # Validate level exists
            from app.models.level import Level
            level = Level.get_by_level_id(level_id)
            if not level:
                raise ValueError(f"Level {level_id} not found")
            
            # Calculate XP for this completion
            from app.utils.xp import XPCalculator, XPManager
            difficulty_used = difficulty or level.difficulty
            xp_calculation = XPCalculator.calculate_level_xp(
                level_id=level_id,
                score=score,
                time_spent=time_spent,
                difficulty=difficulty_used
            )
            xp_earned = xp_calculation['xp_earned']
            
            # Create new completion
            supabase = get_supabase()
            completion_data = {
                'user_id': user_id,
                'level_id': level_id,
                'score': score,
                'time_spent': time_spent,
                'difficulty': difficulty_used,
                'source': source,
                'created_at': datetime.utcnow().isoformat()
            }
            
            response = supabase.table('level_completions').insert(completion_data).execute()
            data = handle_supabase_error(response)
            
            if data and len(data) > 0:
                completion = cls(data[0])
                
                # Award XP and create history entry
                try:
                    xp_result = XPManager.award_xp(
                        user_id=user_id,
                        level_id=level_id,
                        score=score,
                        time_spent=time_spent,
                        difficulty=difficulty_used,
                        reason='level_completion'
                    )
                    # Store XP info for reference (though not in database)
                    completion._xp_awarded = xp_result['xp_awarded']
                    completion._xp_calculation = xp_calculation
                except Exception as xp_error:
                    # Log XP error but don't fail the completion
                    print(f"Warning: Failed to award XP for completion: {xp_error}")
                    completion._xp_awarded = 0
                    completion._xp_calculation = None
                
                return completion, True  # Return new completion and is_new=True
            raise DatabaseError("No data returned from completion creation")
            
        except Exception as e:
            raise DatabaseError(f"Failed to create completion: {str(e)}")

    def calculate_and_award_xp(self) -> dict:
        """Calculate and award XP for an existing completion (useful for historical data)"""
        try:
            from app.utils.xp import XPCalculator, XPManager
            
            # Calculate XP based on completion data
            xp_calculation = XPCalculator.calculate_level_xp(
                level_id=self.level_id,
                score=self.score,
                time_spent=self.time_spent,
                difficulty=self.difficulty
            )
            
            # Award XP and create history entry
            xp_result = XPManager.award_xp(
                user_id=self.user_id,
                level_id=self.level_id,
                score=self.score,
                time_spent=self.time_spent,
                difficulty=self.difficulty,
                reason='level_completion_recalculation'
            )
            
            # Store XP info for reference
            self._xp_awarded = xp_result['xp_awarded']
            self._xp_calculation = xp_calculation
            
            return {
                'xp_awarded': xp_result['xp_awarded'],
                'calculation_details': xp_calculation,
                'new_total_xp': xp_result['new_total']
            }
            
        except Exception as e:
            raise DatabaseError(f"Failed to calculate and award XP for completion: {str(e)}")

    @classmethod
    def get_user_completions(cls, user_id: int, limit: int = 50, offset: int = 0) -> List['LevelCompletion']:
        """Get completions for a user with pagination"""
        try:
            supabase = get_supabase()
            response = (supabase.table('level_completions')
                       .select('*')
                       .eq('user_id', user_id)
                       .order('created_at', desc=True)
                       .range(offset, offset + limit - 1)
                       .execute())
            data = handle_supabase_error(response)
            
            return [cls(completion_data) for completion_data in data] if data else []
        except Exception as e:
            raise DatabaseError(f"Failed to get user completions: {str(e)}")

    @classmethod
    def get_user_progress_summary(cls, user_id: int) -> Dict[str, Any]:
        """Get user's completion progress summary"""
        try:
            supabase = get_supabase()
            
            # Get total available levels
            from app.models.level import Level
            total_levels = len(Level.get_available_levels())
            
            # Get user's completed levels (distinct level_ids)
            response = (supabase.table('level_completions')
                       .select('level_id')
                       .eq('user_id', user_id)
                       .execute())
            completion_data = handle_supabase_error(response)
            
            completed_level_ids = list(set([comp['level_id'] for comp in completion_data])) if completion_data else []
            completed_levels = len(completed_level_ids)
            
            # Get user's best scores per level
            best_scores = {}
            for level_id in completed_level_ids:
                level_response = (supabase.table('level_completions')
                                 .select('score, time_spent')
                                 .eq('user_id', user_id)
                                 .eq('level_id', level_id)
                                 .order('score', desc=True)
                                 .order('time_spent', desc=False)
                                 .limit(1)
                                 .execute())
                level_data = handle_supabase_error(level_response)
                if level_data and len(level_data) > 0:
                    best_scores[level_id] = {
                        'score': level_data[0]['score'],
                        'time': level_data[0]['time_spent']
                    }
            
            return {
                'total_levels': total_levels,
                'completed_levels': completed_levels,
                'completion_percentage': round(completed_levels / total_levels * 100, 1) if total_levels > 0 else 0,
                'best_scores': best_scores
            }
            
        except Exception as e:
            raise DatabaseError(f"Failed to get user progress summary: {str(e)}")

    @classmethod
    def get_level_statistics(cls, level_id: int) -> Dict[str, Any]:
        """Get statistics for a specific level"""
        try:
            supabase = get_supabase()
            
            # Get all completions for this level
            response = (supabase.table('level_completions')
                       .select('score, time_spent')
                       .eq('level_id', level_id)
                       .execute())
            data = handle_supabase_error(response)
            
            if not data:
                return {
                    'level_id': level_id,
                    'total_completions': 0,
                    'avg_score': 0,
                    'max_score': 0,
                    'avg_time': 0,
                    'min_time': 0
                }
            
            scores = [comp['score'] for comp in data if comp['score'] is not None]
            times = [comp['time_spent'] for comp in data if comp['time_spent'] is not None]
            
            return {
                'level_id': level_id,
                'total_completions': len(data),
                'avg_score': round(sum(scores) / len(scores), 1) if scores else 0,
                'max_score': max(scores) if scores else 0,
                'avg_time': round(sum(times) / len(times), 1) if times else 0,
                'min_time': min(times) if times else 0
            }
            
        except Exception as e:
            raise DatabaseError(f"Failed to get level statistics: {str(e)}")

    def save(self) -> bool:
        """Save completion to database"""
        try:
            supabase = get_supabase()
            completion_data = {
                'user_id': self.user_id,
                'level_id': self.level_id,
                'level_type': self.level_type,
                'score': self.score,
                'time_spent': self.time_spent,
                'difficulty': self.difficulty,
                'source': self.source
            }
            
            if self.id:
                # Update existing completion
                response = supabase.table('level_completions').update(completion_data).eq('id', self.id).execute()
                handle_supabase_error(response)
            else:
                # Create new completion
                completion_data['created_at'] = datetime.utcnow().isoformat()
                response = supabase.table('level_completions').insert(completion_data).execute()
                data = handle_supabase_error(response)
                if data and len(data) > 0:
                    self.id = data[0]['id']
                    self.created_at = data[0]['created_at']
            
            return True
        except Exception as e:
            raise DatabaseError(f"Failed to save completion: {str(e)}")

    def delete(self) -> bool:
        """Delete completion from database"""
        try:
            if not self.id:
                raise ValueError("Cannot delete completion without ID")
            
            supabase = get_supabase()
            response = supabase.table('level_completions').delete().eq('id', self.id).execute()
            handle_supabase_error(response)
            return True
        except Exception as e:
            raise DatabaseError(f"Failed to delete completion: {str(e)}")

    @classmethod
    def get_by_id(cls, completion_id: int) -> Optional['LevelCompletion']:
        """Get completion by ID"""
        try:
            supabase = get_supabase()
            response = supabase.table('level_completions').select('*').eq('id', completion_id).execute()
            data = handle_supabase_error(response)
            
            if data and len(data) > 0:
                return cls(data[0])
            return None
        except Exception as e:
            raise DatabaseError(f"Failed to get completion {completion_id}: {str(e)}")

    @classmethod
    def get_recent_completions(cls, limit: int = 20) -> List['LevelCompletion']:
        """Get recent completions across all users"""
        try:
            supabase = get_supabase()
            response = (supabase.table('level_completions')
                       .select('*')
                       .order('created_at', desc=True)
                       .limit(limit)
                       .execute())
            data = handle_supabase_error(response)
            
            return [cls(completion_data) for completion_data in data] if data else []
        except Exception as e:
            raise DatabaseError(f"Failed to get recent completions: {str(e)}")
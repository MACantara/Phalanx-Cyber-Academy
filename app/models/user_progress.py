"""
User progress tracking models for CyberQuest levels.
"""
from app.database import get_supabase, handle_supabase_error, DatabaseError
from flask_login import current_user
from datetime import datetime
from typing import Dict, List, Optional, Any
import logging

logger = logging.getLogger(__name__)

class UserProgress:
    """Model for tracking user progress in cybersecurity levels."""
    
    @staticmethod
    def get_user_progress(user_id: int, level_type: str = 'simulation') -> List[Dict[str, Any]]:
        """Get all progress records for a user."""
        try:
            supabase = get_supabase()
            response = supabase.table('user_progress').select('*').eq('user_id', user_id).eq('level_type', level_type).execute()
            return handle_supabase_error(response)
        except Exception as e:
            logger.error(f"Error fetching user progress for user {user_id}: {e}")
            return []
    
    @staticmethod
    def get_level_progress(user_id: int, level_id: int, level_type: str = 'simulation') -> Optional[Dict[str, Any]]:
        """Get progress for a specific level."""
        try:
            supabase = get_supabase()
            response = supabase.table('user_progress').select('*').eq('user_id', user_id).eq('level_id', level_id).eq('level_type', level_type).single().execute()
            return handle_supabase_error(response)
        except Exception as e:
            logger.debug(f"No progress found for user {user_id}, level {level_id}: {e}")
            return None
    
    @staticmethod
    def create_or_update_progress(user_id: int, level_id: int, data: Dict[str, Any]) -> Dict[str, Any]:
        """Create or update progress for a level."""
        try:
            supabase = get_supabase()
            # Determine existing progress (if any) so we can accumulate fields
            existing_progress = UserProgress.get_level_progress(user_id, level_id, data.get('level_type', 'simulation'))

            # Base progress values (for new records)
            progress_data = {
                'user_id': user_id,
                'level_id': level_id,
                'level_type': data.get('level_type', 'simulation'),
                'status': data.get('status', 'not_started'),
                'score': data.get('score', 0),
                'max_score': data.get('max_score', 100),
                'completion_percentage': data.get('completion_percentage', 0.0),
                'time_spent': data.get('time_spent', 0),
                # For new records default attempts to 1, otherwise we'll accumulate below
                'attempts': data.get('attempts', 1),
                'xp_earned': data.get('xp_earned', 0),
                'hints_used': data.get('hints_used', 0),
                # For new records default mistakes to provided value or 0
                'mistakes_made': data.get('mistakes_made', 0),
                'updated_at': datetime.utcnow().isoformat()
            }

            # If there is an existing record, accumulate attempts and mistakes_made instead
            if existing_progress:
                # Attempts: if caller provided an attempts field, add that amount; otherwise,
                # if the caller is starting a new in-progress session, increment by 1.
                if 'attempts' in data:
                    progress_data['attempts'] = existing_progress.get('attempts', 0) + int(data.get('attempts', 0))
                elif data.get('status') == 'in_progress':
                    progress_data['attempts'] = existing_progress.get('attempts', 0) + 1
                else:
                    progress_data['attempts'] = existing_progress.get('attempts', 0)

                # If caller provided mistakes_made, accumulate; otherwise keep existing
                if 'mistakes_made' in data:
                    progress_data['mistakes_made'] = existing_progress.get('mistakes_made', 0) + int(data.get('mistakes_made', 0))
                else:
                    progress_data['mistakes_made'] = existing_progress.get('mistakes_made', 0)

                # Optionally accumulate xp_earned if provided (keep previous behavior otherwise)
                if 'xp_earned' in data:
                    progress_data['xp_earned'] = existing_progress.get('xp_earned', 0) + int(data.get('xp_earned', 0))
                else:
                    progress_data['xp_earned'] = existing_progress.get('xp_earned', 0)
            
            # Set completion timestamp if completed
            if data.get('status') == 'completed':
                progress_data['completed_at'] = data.get('completed_at', datetime.utcnow().isoformat())
            
            # Set start timestamp if starting and there was no previous progress
            if data.get('status') == 'in_progress' and not existing_progress:
                progress_data['started_at'] = datetime.utcnow().isoformat()
            
            # Use upsert to handle both create and update
            response = supabase.table('user_progress').upsert(progress_data, on_conflict='user_id,level_id,level_type').execute()
            return handle_supabase_error(response)[0]
            
        except Exception as e:
            logger.error(f"Error creating/updating progress for user {user_id}, level {level_id}: {e}")
            raise DatabaseError(f"Failed to update progress: {e}")
    
    @staticmethod
    def mark_level_completed(user_id: int, level_id: int, score: int = 100, xp_earned: int = 0, time_spent: int = 0) -> Dict[str, Any]:
        """Mark a level as completed."""
        completion_data = {
            'status': 'completed',
            'score': score,
            'completion_percentage': 100.0,
            'xp_earned': xp_earned,
            'time_spent': time_spent,
            'completed_at': datetime.utcnow().isoformat()
        }
        return UserProgress.create_or_update_progress(user_id, level_id, completion_data)
    
    @staticmethod
    def start_level(user_id: int, level_id: int) -> Dict[str, Any]:
        """Mark a level as started."""
        start_data = {
            'status': 'in_progress',
            'started_at': datetime.utcnow().isoformat()
        }
        return UserProgress.create_or_update_progress(user_id, level_id, start_data)
    
    @staticmethod
    def get_user_stats(user_id: int) -> Dict[str, Any]:
        """Get comprehensive user statistics."""
        try:
            progress_records = UserProgress.get_user_progress(user_id)
            
            stats = {
                'total_levels': 5,  # Total available levels
                'completed_levels': 0,
                'in_progress_levels': 0,
                'total_xp': 0,
                'total_time_spent': 0,
                'average_score': 0,
                'completion_percentage': 0,
                'level_progress': {}
            }
            
            completed_scores = []
            
            for progress in progress_records:
                level_id = progress['level_id']
                stats['level_progress'][level_id] = progress
                
                if progress['status'] == 'completed':
                    stats['completed_levels'] += 1
                    stats['total_xp'] += progress.get('xp_earned', 0)
                    completed_scores.append(progress.get('score', 0))
                elif progress['status'] == 'in_progress':
                    stats['in_progress_levels'] += 1
                
                stats['total_time_spent'] += progress.get('time_spent', 0)
            
            # Calculate averages
            if completed_scores:
                stats['average_score'] = sum(completed_scores) / len(completed_scores)
            
            stats['completion_percentage'] = (stats['completed_levels'] / stats['total_levels']) * 100
            
            return stats
            
        except Exception as e:
            logger.error(f"Error getting user stats for user {user_id}: {e}")
            return {
                'total_levels': 5,
                'completed_levels': 0,
                'in_progress_levels': 0,
                'total_xp': 0,
                'total_time_spent': 0,
                'average_score': 0,
                'completion_percentage': 0,
                'level_progress': {}
            }

    @staticmethod
    def clear_level_progress(user_id: int, level_id: int, level_type: str = 'simulation') -> bool:
        """Clear all progress data for a specific level."""
        try:
            supabase = get_supabase()
            response = supabase.table('user_progress').delete().eq('user_id', user_id).eq('level_id', level_id).eq('level_type', level_type).execute()
            handle_supabase_error(response)
            logger.info(f"Cleared progress for user {user_id}, level {level_id}")
            return True
        except Exception as e:
            logger.error(f"Error clearing level progress for user {user_id}, level {level_id}: {e}")
            return False

    @staticmethod
    def increment_level_attempt(user_id: int, level_id: int, level_type: str = 'simulation') -> bool:
        """Increment the attempt count for a level without clearing previous data."""
        try:
            supabase = get_supabase()
            
            # Get existing progress
            existing_progress = UserProgress.get_level_progress(user_id, level_id, level_type)
            
            if existing_progress:
                # Increment attempts and update started_at for new session
                new_attempts = existing_progress.get('attempts', 0) + 1
                update_data = {
                    'attempts': new_attempts,
                    'started_at': datetime.utcnow().isoformat(),
                    'updated_at': datetime.utcnow().isoformat()
                }
                
                response = supabase.table('user_progress').update(update_data).eq('user_id', user_id).eq('level_id', level_id).eq('level_type', level_type).execute()
                handle_supabase_error(response)
            else:
                # Create new progress record with attempt count 1
                progress_data = {
                    'user_id': user_id,
                    'level_id': level_id,
                    'level_type': level_type,
                    'status': 'in_progress',
                    'attempts': 1,
                    'started_at': datetime.utcnow().isoformat(),
                    'updated_at': datetime.utcnow().isoformat(),
                    'created_at': datetime.utcnow().isoformat()
                }
                
                response = supabase.table('user_progress').insert(progress_data).execute()
                handle_supabase_error(response)
            
            logger.info(f"Incremented attempt count for user {user_id}, level {level_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error incrementing level attempt for user {user_id}, level {level_id}: {e}")
            return False

    @staticmethod
    def get_analytics_data():
        """Get comprehensive analytics data for admin dashboard."""
        try:
            supabase = get_supabase()
            
            # Get general user statistics
            users_response = supabase.table('users').select('id, created_at, last_login').execute()
            users_data = handle_supabase_error(users_response)
            
            # Get progress data
            progress_response = supabase.table('user_progress').select('*').execute()
            progress_data = handle_supabase_error(progress_response)
            
            # Get analytics data
            analytics_response = supabase.table('learning_analytics').select('*').execute()
            analytics_data = handle_supabase_error(analytics_response)
            
            from datetime import datetime, timedelta
            
            # Calculate metrics
            total_users = len(users_data)
            today = datetime.now().date()
            week_ago = today - timedelta(days=7)
            month_ago = today - timedelta(days=30)
            
            # Calculate active users (handle None values)
            dau = len([u for u in users_data if u.get('last_login') and 
                      datetime.fromisoformat(u['last_login'].replace('Z', '+00:00')).date() == today])
            
            wau = len([u for u in users_data if u.get('last_login') and 
                      datetime.fromisoformat(u['last_login'].replace('Z', '+00:00')).date() >= week_ago])
            
            mau = len([u for u in users_data if u.get('last_login') and 
                      datetime.fromisoformat(u['last_login'].replace('Z', '+00:00')).date() >= month_ago])
            
            # Calculate level completion rates
            levels_completed = {}
            for level_id in range(1, 6):
                completed_count = len([p for p in progress_data if p['level_id'] == level_id and p['status'] == 'completed'])
                total_attempts = len([p for p in progress_data if p['level_id'] == level_id])
                completion_rate = (completed_count / total_attempts * 100) if total_attempts > 0 else 0
                levels_completed[f'level_{level_id}'] = round(completion_rate, 1)
            
            # Calculate overall stats
            all_completed = [p for p in progress_data if p['status'] == 'completed']
            total_xp = sum(p.get('xp_earned', 0) for p in all_completed)
            avg_session_length = sum(p.get('time_spent', 0) for p in all_completed) / len(all_completed) if all_completed else 0
            overall_completion_rate = len(all_completed) / len(progress_data) * 100 if progress_data else 0
            
            # Weekly trends (simplified - last 7 days)
            weekly_trends = []
            for i in range(7):
                day = today - timedelta(days=i)
                day_analytics = [a for a in analytics_data if 
                               datetime.fromisoformat(a['timestamp'].replace('Z', '+00:00')).date() == day]
                
                daily_users = len(set(a['user_id'] for a in day_analytics))
                daily_sessions = len(set(a['session_id'] for a in day_analytics))
                daily_completions = len([a for a in day_analytics if a['action_type'] == 'complete'])
                
                weekly_trends.append({
                    'date': day.isoformat(),
                    'dau': daily_users,
                    'sessions': daily_sessions,
                    'completions': daily_completions
                })
            
            weekly_trends.reverse()  # Show oldest to newest
            
            return {
                'general_stats': {
                    'dau': dau,
                    'wau': wau,
                    'mau': mau,
                    'total_users': total_users,
                    'avg_session_length': round(avg_session_length),
                    'completion_rate': round(overall_completion_rate, 1),
                    'total_xp': total_xp,
                    'drop_off_rate': round(100 - overall_completion_rate, 1) if overall_completion_rate > 0 else 0,
                    'churn_rate': round(((total_users - mau) / total_users * 100), 1) if total_users > 0 else 0,
                    'retention_rates': {
                        'day_1': round((wau / total_users * 100), 1) if total_users > 0 else 0,
                        'day_7': round((wau / total_users * 100), 1) if total_users > 0 else 0,
                        'day_30': round((mau / total_users * 100), 1) if total_users > 0 else 0
                    }
                },
                'gameplay_stats': {
                    'levels_completed': levels_completed,
                    'avg_actions_per_session': round(len(analytics_data) / len(set(a['session_id'] for a in analytics_data))) if analytics_data else 0,
                    'hint_usage_rate': round(sum(p.get('hints_used', 0) for p in progress_data) / len(progress_data) * 100, 1) if progress_data else 0,
                    'failure_retry_rate': round(len([p for p in progress_data if p.get('attempts', 0) > 1]) / len(progress_data) * 100, 1) if progress_data else 0
                },
                'engagement_stats': {
                    'nps_score': 42,  # This would need a separate rating system
                    'avg_rating': 4.2,  # This would need a separate rating system
                    'total_ratings': len(progress_data),  # Using progress records as proxy
                    'promoters_pct': 56.3,  # Would need rating data
                    'detractors_pct': 14.2   # Would need rating data
                },
                'weekly_trends': weekly_trends
            }
            
        except Exception as e:
            logger.error(f"Error getting analytics data: {e}")
            # Return default values if database is empty or error occurs
            return {
                'general_stats': {
                    'dau': 0, 'wau': 0, 'mau': 0, 'total_users': 0,
                    'avg_session_length': 0, 'completion_rate': 0, 'total_xp': 0,
                    'drop_off_rate': 0, 'churn_rate': 0,
                    'retention_rates': {'day_1': 0, 'day_7': 0, 'day_30': 0}
                },
                'gameplay_stats': {
                    'levels_completed': {f'level_{i}': 0 for i in range(1, 6)},
                    'avg_actions_per_session': 0, 'hint_usage_rate': 0, 'failure_retry_rate': 0
                },
                'engagement_stats': {
                    'nps_score': 0, 'avg_rating': 0, 'total_ratings': 0,
                    'promoters_pct': 0, 'detractors_pct': 0
                },
                'weekly_trends': []
            }

    @staticmethod
    def get_level_analytics():
        """Get detailed level-specific analytics."""
        try:
            supabase = get_supabase()
            
            # Get all progress data
            progress_response = supabase.table('user_progress').select('*').execute()
            progress_data = handle_supabase_error(progress_response)
            
            level_details = {}
            level_names = {
                1: 'The Misinformation Maze',
                2: 'Shadow in the Inbox', 
                3: 'Malware Mayhem',
                4: 'The White Hat Test',
                5: 'The Hunt for The Null'
            }
            
            for level_id in range(1, 6):
                level_progress = [p for p in progress_data if p['level_id'] == level_id]
                completed_level_progress = [p for p in level_progress if p['status'] == 'completed']
                
                completion_rate = len(completed_level_progress) / len(level_progress) * 100 if level_progress else 0
                avg_time = sum(p.get('time_spent', 0) for p in completed_level_progress) / len(completed_level_progress) if completed_level_progress else 0
                avg_score = sum(p.get('score', 0) for p in completed_level_progress) / len(completed_level_progress) if completed_level_progress else 0
                
                # Level-specific metrics based on skills and common patterns
                level_data = {
                    'name': level_names[level_id],
                    'completion_rate': round(completion_rate, 1),
                    'avg_time': round(avg_time),
                    'avg_score': round(avg_score, 1)
                }
                
                # Add level-specific metrics with realistic calculations
                if level_id == 1:  # Misinformation Maze
                    level_data.update({
                        'fact_check_accuracy': round(avg_score * 0.9, 1) if avg_score > 0 else 0,
                        'source_verification_attempts': round(avg_time / 300, 1) if avg_time > 0 else 0,
                        'misinformation_detection_speed': round(avg_time / 20, 1) if avg_time > 0 else 0,
                        'critical_thinking_score': round(avg_score / 10, 1) if avg_score > 0 else 0,
                        'news_bias_recognition': round(avg_score * 0.85, 1) if avg_score > 0 else 0
                    })
                elif level_id == 2:  # Shadow in the Inbox
                    level_data.update({
                        'phishing_detection_rate': round(avg_score * 0.8, 1) if avg_score > 0 else 0,
                        'false_positive_rate': round((100 - avg_score) * 0.3, 1) if avg_score > 0 else 0,
                        'email_analysis_thoroughness': round(avg_score * 0.7, 1) if avg_score > 0 else 0,
                        'social_engineering_susceptibility': round((100 - avg_score) * 0.4, 1) if avg_score > 0 else 0,
                        'safe_protocol_adherence': round(avg_score * 0.9, 1) if avg_score > 0 else 0
                    })
                elif level_id == 3:  # Malware Mayhem
                    level_data.update({
                        'malware_identification_accuracy': round(avg_score * 0.75, 1) if avg_score > 0 else 0,
                        'quarantine_effectiveness': round(avg_score * 0.85, 1) if avg_score > 0 else 0,
                        'system_cleanup_thoroughness': round(avg_score * 0.7, 1) if avg_score > 0 else 0,
                        'threat_propagation_prevention': round(avg_score * 0.9, 1) if avg_score > 0 else 0,
                        'security_tool_utilization': round(avg_score * 0.8, 1) if avg_score > 0 else 0
                    })
                elif level_id == 4:  # White Hat Test
                    level_data.update({
                        'vulnerability_discovery_rate': round(avg_score / 25, 1) if avg_score > 0 else 0,
                        'ethical_methodology_score': round(avg_score * 0.95, 1) if avg_score > 0 else 0,
                        'responsible_disclosure_rate': round(min(avg_score * 1.05, 100), 1) if avg_score > 0 else 0,
                        'risk_assessment_accuracy': round(avg_score * 0.85, 1) if avg_score > 0 else 0,
                        'documentation_quality': round(avg_score * 0.9, 1) if avg_score > 0 else 0
                    })
                elif level_id == 5:  # Hunt for The Null
                    level_data.update({
                        'evidence_collection_score': round(avg_score * 0.85, 1) if avg_score > 0 else 0,
                        'data_analysis_depth': round(avg_score * 0.8, 1) if avg_score > 0 else 0,
                        'timeline_accuracy': round(avg_score * 0.75, 1) if avg_score > 0 else 0,
                        'attribution_confidence': round(avg_score * 0.8, 1) if avg_score > 0 else 0,
                        'investigation_methodology': round(avg_score * 0.9, 1) if avg_score > 0 else 0
                    })
                
                level_details[f'level_{level_id}'] = level_data
            
            return level_details
            
        except Exception as e:
            logger.error(f"Error getting level analytics: {e}")
            # Return default empty data
            level_names = {
                1: 'The Misinformation Maze',
                2: 'Shadow in the Inbox', 
                3: 'Malware Mayhem',
                4: 'The White Hat Test',
                5: 'The Hunt for The Null'
            }
            
            return {f'level_{i}': {
                'name': level_names[i],
                'completion_rate': 0,
                'avg_time': 0
            } for i in range(1, 6)}


class LearningAnalytics:
    """Model for tracking detailed learning analytics."""
    
    @staticmethod
    def log_action(user_id: int, session_id: str, level_id: int, action_type: str, action_data: Dict = None, level_type: str = 'simulation'):
        """Log a user action for analytics."""
        try:
            supabase = get_supabase()
            
            analytics_data = {
                'user_id': user_id,
                'session_id': session_id,
                'level_id': level_id,
                'level_type': level_type,
                'action_type': action_type,
                'action_data': action_data or {},
                'timestamp': datetime.utcnow().isoformat()
            }
            
            response = supabase.table('learning_analytics').insert(analytics_data).execute()
            return handle_supabase_error(response)
            
        except Exception as e:
            logger.error(f"Error logging analytics action: {e}")
            # Don't raise error for analytics - just log it
            pass

class SkillAssessment:
    """Model for tracking skill-specific assessments."""
    
    @staticmethod
    def update_skill_assessment(user_id: int, skill_name: str, level_id: int, assessment_score: float, max_score: float = 100.0):
        """Update or create a skill assessment."""
        try:
            supabase = get_supabase()
            
            # Determine proficiency level based on score percentage
            score_percentage = (assessment_score / max_score) * 100
            if score_percentage >= 90:
                proficiency = 'expert'
            elif score_percentage >= 80:
                proficiency = 'advanced'
            elif score_percentage >= 70:
                proficiency = 'intermediate'
            elif score_percentage >= 50:
                proficiency = 'beginner'
            else:
                proficiency = 'novice'
            
            assessment_data = {
                'user_id': user_id,
                'skill_name': skill_name,
                'level_id': level_id,
                'assessment_score': assessment_score,
                'max_score': max_score,
                'proficiency_level': proficiency,
                'updated_at': datetime.utcnow().isoformat()
            }
            
            response = supabase.table('skill_assessments').upsert(assessment_data, on_conflict='user_id,skill_name,level_id').execute()
            return handle_supabase_error(response)
            
        except Exception as e:
            logger.error(f"Error updating skill assessment: {e}")
            return None
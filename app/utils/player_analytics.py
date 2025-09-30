"""
Centralized Player Analytics Engine for CyberQuest
Handles data collection, processing, and storage for all game modes and levels
"""

import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple
from collections import defaultdict
from app.database import get_supabase, DatabaseError

logger = logging.getLogger(__name__)

class PlayerAnalytics:
    """Core analytics engine for collecting and analyzing player data"""
    
    def __init__(self):
        self.supabase = get_supabase()
        
    # ======================
    # LEVEL ANALYTICS (1-5)
    # ======================
    
    async def get_level_analytics(self) -> Dict[str, Any]:
        """Get comprehensive analytics for levels 1-5"""
        try:
            # Get user progress data for all levels
            user_progress = self.supabase.table("user_progress").select("*").execute()
            
            if not user_progress.data:
                return self._get_mock_level_data()
                
            level_data = {}
            
            for level_id in range(1, 6):
                level_data[f"level_{level_id}"] = await self._analyze_level(level_id, user_progress.data)
                
            return level_data
            
        except Exception as e:
            logger.error(f"Error getting level analytics: {e}")
            return self._get_mock_level_data()
    
    async def _analyze_level(self, level_id: int, progress_data: List[Dict]) -> Dict[str, Any]:
        """Analyze data for a specific level"""
        level_progress = [p for p in progress_data if p.get('level_id') == level_id]
        
        if not level_progress:
            return await self._get_empty_level_data(level_id)
            
        total_attempts = len(level_progress)
        completed = len([p for p in level_progress if p.get('completed', False)])
        completion_rate = (completed / total_attempts * 100) if total_attempts > 0 else 0
        
        # Calculate average metrics
        scores = [p.get('final_score', 0) for p in level_progress if p.get('final_score')]
        avg_score = sum(scores) / len(scores) if scores else 0
        
        completion_times = [p.get('completion_time_seconds', 0) for p in level_progress if p.get('completion_time_seconds')]
        avg_completion_time = sum(completion_times) / len(completion_times) if completion_times else 0
        
        # Calculate attempts to complete
        attempts_per_user = defaultdict(int)
        completed_users = set()
        for p in level_progress:
            user_id = p.get('user_id')
            attempts_per_user[user_id] += 1
            if p.get('completed'):
                completed_users.add(user_id)
        
        avg_attempts_to_complete = 0
        if completed_users:
            total_attempts_for_completed = sum(attempts_per_user[user] for user in completed_users)
            avg_attempts_to_complete = total_attempts_for_completed / len(completed_users)
        
        # Level-specific metrics based on level type
        level_specific = await self._get_level_specific_metrics(level_id, level_progress)
        
        return {
            'name': self._get_level_name(level_id),
            'description': self._get_level_description(level_id),
            'total_attempts': total_attempts,
            'completed_sessions': completed,
            'completion_rate': round(completion_rate, 1),
            'average_score': round(avg_score, 1),
            'average_completion_time': round(avg_completion_time / 60, 1),  # Convert to minutes
            'avg_time_seconds': round(avg_completion_time),
            'attempts_to_complete': round(avg_attempts_to_complete, 1),
            'difficulty_rating': self._calculate_difficulty(completion_rate, avg_completion_time),
            'player_count': len(set(p.get('user_id') for p in level_progress)),
            'recent_activity': await self._get_recent_level_activity(level_id),
            **level_specific
        }
    
    async def _get_level_specific_metrics(self, level_id: int, progress_data: List[Dict]) -> Dict[str, Any]:
        """Get metrics specific to each level's gameplay mechanics"""
        
        if level_id == 1:  # Misinformation Maze
            return {
                'articles_analyzed': sum(p.get('articles_analyzed', 0) for p in progress_data),
                'accuracy_rate': self._calculate_accuracy_rate(progress_data, 'correct_classifications'),
                'fake_news_detected': sum(p.get('fake_news_detected', 0) for p in progress_data),
                'critical_thinking_score': self._calculate_avg_metric(progress_data, 'critical_thinking_score'),
                'fact_check_accuracy': self._calculate_accuracy_rate(progress_data, 'correct_fact_checks'),
                'misinformation_detection_speed': self._calculate_avg_metric(progress_data, 'avg_detection_time'),
                'source_verification_attempts': self._calculate_avg_metric(progress_data, 'source_verification_count'),
                'news_bias_recognition': self._calculate_accuracy_rate(progress_data, 'bias_recognition_correct')
            }
        elif level_id == 2:  # Shadow in the Inbox
            return {
                'emails_processed': sum(p.get('emails_processed', 0) for p in progress_data),
                'phishing_detected': sum(p.get('phishing_detected', 0) for p in progress_data),
                'false_positives': sum(p.get('false_positives', 0) for p in progress_data),
                'security_awareness_score': self._calculate_avg_metric(progress_data, 'security_awareness_score'),
                'phishing_detection_rate': self._calculate_accuracy_rate(progress_data, 'phishing_correctly_identified'),
                'false_positive_rate': self._calculate_false_positive_rate(progress_data),
                'email_analysis_thoroughness': self._calculate_avg_metric(progress_data, 'analysis_thoroughness'),
                'social_engineering_susceptibility': 100 - self._calculate_accuracy_rate(progress_data, 'social_engineering_resisted'),
                'safe_protocol_adherence': self._calculate_avg_metric(progress_data, 'protocol_adherence')
            }
        elif level_id == 3:  # Malware Mayhem
            return {
                'threats_neutralized': sum(p.get('threats_neutralized', 0) for p in progress_data),
                'systems_cleaned': sum(p.get('systems_cleaned', 0) for p in progress_data),
                'response_time': self._calculate_avg_metric(progress_data, 'avg_response_time'),
                'cleanup_efficiency': self._calculate_avg_metric(progress_data, 'cleanup_efficiency'),
                'malware_identification_accuracy': self._calculate_accuracy_rate(progress_data, 'malware_correctly_identified'),
                'quarantine_effectiveness': self._calculate_avg_metric(progress_data, 'quarantine_success_rate'),
                'system_cleanup_thoroughness': self._calculate_avg_metric(progress_data, 'cleanup_thoroughness'),
                'threat_propagation_prevention': self._calculate_avg_metric(progress_data, 'propagation_prevention_score'),
                'security_tool_utilization': self._calculate_avg_metric(progress_data, 'tool_usage_efficiency')
            }
        elif level_id == 4:  # White Hat Test
            return {
                'vulnerabilities_found': sum(p.get('vulnerabilities_found', 0) for p in progress_data),
                'ethical_score': self._calculate_avg_metric(progress_data, 'ethical_score'),
                'documentation_quality': self._calculate_avg_metric(progress_data, 'documentation_quality'),
                'responsible_disclosure': sum(p.get('responsible_disclosure', 0) for p in progress_data),
                'vulnerability_discovery_rate': self._calculate_avg_metric(progress_data, 'discovery_success_rate'),
                'reporting_accuracy': self._calculate_avg_metric(progress_data, 'report_accuracy'),
                'ethical_compliance_score': self._calculate_avg_metric(progress_data, 'ethical_compliance'),
                'technical_skill_demonstration': self._calculate_avg_metric(progress_data, 'technical_skill_score'),
                'ethical_methodology_score': self._calculate_avg_metric(progress_data, 'methodology_score'),
                'responsible_disclosure_rate': self._calculate_accuracy_rate(progress_data, 'proper_disclosure'),
                'risk_assessment_accuracy': self._calculate_avg_metric(progress_data, 'risk_assessment_score')
            }
        elif level_id == 5:  # Hunt for The Null
            return {
                'evidence_collected': sum(p.get('evidence_collected', 0) for p in progress_data),
                'forensic_accuracy': self._calculate_avg_metric(progress_data, 'forensic_accuracy'),
                'timeline_accuracy': self._calculate_avg_metric(progress_data, 'timeline_accuracy'),
                'investigation_thoroughness': self._calculate_avg_metric(progress_data, 'investigation_thoroughness'),
                'digital_forensics_proficiency': self._calculate_avg_metric(progress_data, 'forensics_proficiency'),
                'investigation_methodology': self._calculate_avg_metric(progress_data, 'methodology_score'),
                'evidence_chain_preservation': self._calculate_avg_metric(progress_data, 'chain_preservation_score'),
                'case_resolution_efficiency': self._calculate_avg_metric(progress_data, 'resolution_efficiency'),
                'evidence_collection_score': self._calculate_avg_metric(progress_data, 'collection_score'),
                'data_analysis_depth': self._calculate_avg_metric(progress_data, 'analysis_depth'),
                'attribution_confidence': self._calculate_avg_metric(progress_data, 'attribution_confidence')
            }
        
        return {}
    
    # =====================================
    # BLUE TEAM VS RED TEAM ANALYTICS
    # =====================================
    
    async def get_blue_vs_red_analytics(self) -> Dict[str, Any]:
        """Get comprehensive analytics for Blue vs Red Team mode"""
        try:
            # Get blue team vs red team session data
            sessions = self.supabase.table("blue_red_sessions").select("*").execute()
            
            if not sessions.data:
                return self._get_mock_blue_vs_red_data()
                
            return await self._analyze_blue_vs_red_sessions(sessions.data)
            
        except Exception as e:
            logger.error(f"Error getting blue vs red analytics: {e}")
            return self._get_mock_blue_vs_red_data()
    
    async def _analyze_blue_vs_red_sessions(self, sessions: List[Dict]) -> Dict[str, Any]:
        """Analyze blue vs red team session data"""
        total_sessions = len(sessions)
        
        if total_sessions == 0:
            return await self._get_empty_blue_vs_red_data()
        
        # Basic metrics
        completed_sessions = len([s for s in sessions if s.get('completed', False)])
        avg_session_duration = self._calculate_avg_metric(sessions, 'duration_minutes')
        avg_xp_earned = self._calculate_avg_metric(sessions, 'total_xp_earned')
        
        # Defensive action analysis
        defensive_stats = await self._analyze_defensive_actions(sessions)
        
        # AI performance analysis
        ai_stats = await self._analyze_ai_performance(sessions)
        
        # Asset protection analysis
        asset_stats = await self._analyze_asset_protection(sessions)
        
        # Performance metrics
        performance_stats = await self._analyze_performance_metrics(sessions)
        
        # Attack pattern analysis
        attack_patterns = await self._analyze_attack_patterns(sessions)
        
        # Recent activity
        recent_activity = await self._get_recent_blue_vs_red_activity()
        
        # Calculate additional overview metrics
        player_wins = len([s for s in sessions if s.get('player_won', False)])
        player_win_rate = (player_wins / total_sessions * 100) if total_sessions > 0 else 0
        
        # Calculate asset protection rate
        total_assets = 4 * total_sessions  # 4 assets per session
        assets_protected = sum(s.get('assets_protected', 0) for s in sessions)
        asset_protection_rate = (assets_protected / total_assets * 100) if total_assets > 0 else 0
        
        return {
            'overview': {
                'total_games': total_sessions,
                'total_sessions': total_sessions,
                'completed_sessions': completed_sessions,
                'completion_rate': round((completed_sessions / total_sessions) * 100, 1),
                'avg_game_duration': round(avg_session_duration * 60),  # Convert to seconds
                'avg_session_duration': round(avg_session_duration, 1),
                'avg_xp_earned': round(avg_xp_earned, 1),
                'active_players': len(set(s.get('user_id') for s in sessions)),
                'player_win_rate': round(player_win_rate, 1),
                'asset_protection_rate': round(asset_protection_rate, 1)
            },
            'performance_metrics': performance_stats,
            'defensive_actions': defensive_stats,
            'ai_performance': ai_stats,
            'asset_protection': asset_stats,
            'attack_patterns': attack_patterns,
            'recent_activity': recent_activity
        }
    
    async def _analyze_defensive_actions(self, sessions: List[Dict]) -> Dict[str, Any]:
        """Analyze defensive action performance"""
        total_isolations = sum(s.get('asset_isolations', 0) for s in sessions)
        correct_isolations = sum(s.get('correct_isolations', 0) for s in sessions)
        total_patches = sum(s.get('vulnerability_patches', 0) for s in sessions)
        correct_patches = sum(s.get('correct_patches', 0) for s in sessions)
        total_resets = sum(s.get('credential_resets', 0) for s in sessions)
        correct_resets = sum(s.get('correct_resets', 0) for s in sessions)
        
        return {
            'asset_isolation': {
                'total_attempts': total_isolations,
                'correct_actions': correct_isolations,
                'accuracy_rate': round((correct_isolations / total_isolations * 100) if total_isolations > 0 else 0, 1),
                'avg_per_session': round(total_isolations / len(sessions), 1)
            },
            'vulnerability_patching': {
                'total_attempts': total_patches,
                'correct_actions': correct_patches,
                'accuracy_rate': round((correct_patches / total_patches * 100) if total_patches > 0 else 0, 1),
                'avg_per_session': round(total_patches / len(sessions), 1)
            },
            'credential_resets': {
                'total_attempts': total_resets,
                'correct_actions': correct_resets,
                'accuracy_rate': round((correct_resets / total_resets * 100) if total_resets > 0 else 0, 1),
                'avg_per_session': round(total_resets / len(sessions), 1)
            }
        }
    
    async def _analyze_ai_performance(self, sessions: List[Dict]) -> Dict[str, Any]:
        """Analyze AI adversary performance"""
        total_attacks = sum(s.get('ai_attacks_launched', 0) for s in sessions)
        successful_attacks = sum(s.get('ai_attacks_successful', 0) for s in sessions)
        detected_attacks = sum(s.get('ai_attacks_detected', 0) for s in sessions)
        
        return {
            'attacks_launched': total_attacks,
            'successful_attacks': successful_attacks,
            'detected_attacks': detected_attacks,
            'success_rate': round((successful_attacks / total_attacks * 100) if total_attacks > 0 else 0, 1),
            'detection_rate': round((detected_attacks / total_attacks * 100) if total_attacks > 0 else 0, 1),
            'avg_attacks_per_session': round(total_attacks / len(sessions), 1),
            'difficulty_adaptation': self._calculate_avg_metric(sessions, 'ai_difficulty_level')
        }
    
    async def _analyze_asset_protection(self, sessions: List[Dict]) -> Dict[str, Any]:
        """Analyze asset protection effectiveness"""
        assets = ['academy-server', 'student-db', 'research-files', 'learning-platform']
        asset_stats = {}
        
        for asset in assets:
            asset_key = asset.replace('-', '_')
            compromised = sum(s.get(f'{asset_key}_compromised', 0) for s in sessions)
            protected = len(sessions) - compromised
            
            asset_stats[asset] = {
                'total_sessions': len(sessions),
                'times_compromised': compromised,
                'times_protected': protected,
                'protection_rate': round((protected / len(sessions) * 100), 1)
            }
        
        return asset_stats
    
    # ======================
    # GENERAL ANALYTICS
    # ======================
    
    async def get_general_analytics(self) -> Dict[str, Any]:
        """Get general analytics across all game modes"""
        try:
            # Get user data
            users = self.supabase.table("users").select("id, created_at, last_login").execute()
            
            # Get all session data
            level_sessions = self.supabase.table("user_progress").select("*").execute()
            blue_red_sessions = self.supabase.table("blue_red_sessions").select("*").execute()
            
            return await self._analyze_general_metrics(users.data, level_sessions.data, blue_red_sessions.data)
            
        except Exception as e:
            logger.error(f"Error getting general analytics: {e}")
            return self._get_mock_general_data()
    
    async def _analyze_general_metrics(self, users: List[Dict], level_sessions: List[Dict], 
                                     blue_red_sessions: List[Dict]) -> Dict[str, Any]:
        """Analyze general platform metrics"""
        total_users = len(users) if users else 0
        
        # Calculate active users (logged in within last 7 days)
        week_ago = datetime.now() - timedelta(days=7)
        day_ago = datetime.now() - timedelta(days=1)
        month_ago = datetime.now() - timedelta(days=30)
        
        active_users = 0
        daily_active_users = 0
        monthly_active_users = 0
        
        if users:
            active_users = len([u for u in users if u.get('last_login') and 
                              datetime.fromisoformat(u['last_login'].replace('Z', '+00:00')) > week_ago])
            daily_active_users = len([u for u in users if u.get('last_login') and 
                                    datetime.fromisoformat(u['last_login'].replace('Z', '+00:00')) > day_ago])
            monthly_active_users = len([u for u in users if u.get('last_login') and 
                                      datetime.fromisoformat(u['last_login'].replace('Z', '+00:00')) > month_ago])
        
        # Calculate engagement metrics
        total_sessions = len(level_sessions) + len(blue_red_sessions) if level_sessions and blue_red_sessions else 0
        
        # Calculate session duration in seconds
        all_durations = []
        if level_sessions:
            all_durations.extend([s.get('completion_time_seconds', 0) for s in level_sessions if s.get('completion_time_seconds')])
        if blue_red_sessions:
            all_durations.extend([s.get('duration_minutes', 0) * 60 for s in blue_red_sessions if s.get('duration_minutes')])
        
        avg_session_duration_seconds = sum(all_durations) / len(all_durations) if all_durations else 0
        avg_completion_time_minutes = avg_session_duration_seconds / 60 if avg_session_duration_seconds else 0
        
        # Calculate retention rates
        retention_rates = await self._calculate_retention_rates(users)
        
        # Calculate level completion rates
        level_completion_rates = await self._calculate_level_completion_rates(level_sessions)
        
        # Weekly trends
        weekly_trends = await self._generate_weekly_trends(users, level_sessions, blue_red_sessions)
        
        return {
            'total_users': total_users,
            'active_users': active_users,
            'daily_active_users': daily_active_users,
            'weekly_active_users': active_users,
            'monthly_active_users': monthly_active_users,
            'total_sessions': total_sessions,
            'completion_rate': self._calculate_overall_completion_rate(level_sessions, blue_red_sessions),
            'average_score': self._calculate_overall_average_score(level_sessions, blue_red_sessions),
            'average_session_duration_seconds': round(avg_session_duration_seconds),
            'average_completion_time_minutes': round(avg_completion_time_minutes, 1),
            'retry_rate': await self._calculate_retry_rate(level_sessions, blue_red_sessions),
            'hint_usage_rate': await self._calculate_hint_usage_rate(level_sessions),
            'drop_off_rate': 100 - self._calculate_overall_completion_rate(level_sessions, blue_red_sessions),
            'churn_rate': await self._calculate_churn_rate(users),
            'retention_day_1': retention_rates.get('day_1', 0),
            'retention_day_7': retention_rates.get('day_7', 0),
            'retention_day_30': retention_rates.get('day_30', 0),
            'weekly_trends': weekly_trends,
            'user_engagement': await self._calculate_user_engagement(users, level_sessions, blue_red_sessions),
            **level_completion_rates
        }
    
    # ======================
    # UTILITY METHODS
    # ======================
    
    def _calculate_accuracy_rate(self, data: List[Dict], metric: str) -> float:
        """Calculate accuracy rate for a specific metric"""
        correct = sum(d.get(metric, 0) for d in data)
        total = sum(d.get('total_attempts', 1) for d in data)
        return round((correct / total * 100) if total > 0 else 0, 1)
    
    def _calculate_avg_metric(self, data: List[Dict], metric: str) -> float:
        """Calculate average for a specific metric"""
        values = [d.get(metric, 0) for d in data if d.get(metric) is not None]
        return sum(values) / len(values) if values else 0
    
    def _calculate_difficulty(self, completion_rate: float, avg_time: float) -> str:
        """Calculate difficulty rating based on completion rate and time"""
        if completion_rate > 80 and avg_time < 1800:  # 30 minutes
            return "Easy"
        elif completion_rate > 60 and avg_time < 3600:  # 60 minutes
            return "Medium"
        elif completion_rate > 40:
            return "Hard"
        else:
            return "Very Hard"
    
    async def _get_recent_level_activity(self, level_id: int) -> List[Dict]:
        """Get recent activity for a specific level"""
        try:
            recent = self.supabase.table("user_progress").select(
                "*, users(username)"
            ).eq('level_id', level_id).order(
                'created_at', desc=True
            ).limit(5).execute()
            
            return recent.data if recent.data else []
        except Exception as e:
            logger.error(f"Error getting recent activity for level {level_id}: {e}")
            return []
    
    async def _get_recent_blue_vs_red_activity(self) -> List[Dict]:
        """Get recent blue vs red team activity"""
        try:
            recent = self.supabase.table("blue_red_sessions").select(
                "*, users(username)"
            ).order('created_at', desc=True).limit(5).execute()
            
            return recent.data if recent.data else []
        except Exception as e:
            logger.error(f"Error getting recent blue vs red activity: {e}")
            return []
    
    async def _generate_weekly_trends(self, users: List[Dict], level_sessions: List[Dict], 
                                    blue_red_sessions: List[Dict]) -> List[Dict]:
        """Generate weekly trend data from actual user and session data"""
        weeks = []
        
        for i in range(8):
            week_start = datetime.now() - timedelta(weeks=8-i)
            week_end = week_start + timedelta(weeks=1)
            
            # Count sessions in this week
            week_level_sessions = [s for s in (level_sessions or []) 
                                 if s.get('created_at') and 
                                 week_start <= datetime.fromisoformat(s['created_at'].replace('Z', '+00:00')) < week_end]
            
            week_blue_red_sessions = [s for s in (blue_red_sessions or []) 
                                    if s.get('created_at') and 
                                    week_start <= datetime.fromisoformat(s['created_at'].replace('Z', '+00:00')) < week_end]
            
            # Count new users in this week
            week_new_users = [u for u in (users or []) 
                            if u.get('created_at') and 
                            week_start <= datetime.fromisoformat(u['created_at'].replace('Z', '+00:00')) < week_end]
            
            # Count DAU for this week (approximate)
            week_active_users = [u for u in (users or []) 
                               if u.get('last_login') and 
                               week_start <= datetime.fromisoformat(u['last_login'].replace('Z', '+00:00')) < week_end]
            
            total_sessions = len(week_level_sessions) + len(week_blue_red_sessions)
            completions = len([s for s in week_level_sessions if s.get('completed')]) + \
                         len([s for s in week_blue_red_sessions if s.get('completed')])
            
            weeks.append({
                'date': week_start.strftime('%Y-%m-%d'),
                'week': week_start.strftime('%Y-W%U'),
                'sessions': total_sessions,
                'completions': completions,
                'new_users': len(week_new_users),
                'dau': len(week_active_users)
            })
        
        return weeks
    
    async def _calculate_retention_rates(self, users: List[Dict]) -> Dict[str, float]:
        """Calculate user retention rates for 1, 7, and 30 days"""
        if not users:
            return {'day_1': 0, 'day_7': 0, 'day_30': 0}
        
        now = datetime.now()
        day_1_ago = now - timedelta(days=1)
        day_7_ago = now - timedelta(days=7)
        day_30_ago = now - timedelta(days=30)
        
        # Users who registered at least X days ago
        users_1_day_ago = [u for u in users if u.get('created_at') and 
                          datetime.fromisoformat(u['created_at'].replace('Z', '+00:00')) <= day_1_ago]
        users_7_days_ago = [u for u in users if u.get('created_at') and 
                           datetime.fromisoformat(u['created_at'].replace('Z', '+00:00')) <= day_7_ago]
        users_30_days_ago = [u for u in users if u.get('created_at') and 
                            datetime.fromisoformat(u['created_at'].replace('Z', '+00:00')) <= day_30_ago]
        
        # Users who have been active since registration
        retained_1_day = [u for u in users_1_day_ago if u.get('last_login') and 
                         datetime.fromisoformat(u['last_login'].replace('Z', '+00:00')) >= day_1_ago]
        retained_7_days = [u for u in users_7_days_ago if u.get('last_login') and 
                          datetime.fromisoformat(u['last_login'].replace('Z', '+00:00')) >= day_7_ago]
        retained_30_days = [u for u in users_30_days_ago if u.get('last_login') and 
                           datetime.fromisoformat(u['last_login'].replace('Z', '+00:00')) >= day_30_ago]
        
        return {
            'day_1': round((len(retained_1_day) / len(users_1_day_ago) * 100), 1) if users_1_day_ago else 0,
            'day_7': round((len(retained_7_days) / len(users_7_days_ago) * 100), 1) if users_7_days_ago else 0,
            'day_30': round((len(retained_30_days) / len(users_30_days_ago) * 100), 1) if users_30_days_ago else 0
        }
    
    async def _calculate_level_completion_rates(self, level_sessions: List[Dict]) -> Dict[str, float]:
        """Calculate completion rates for each level"""
        level_rates = {}
        
        for level_id in range(1, 6):
            level_progress = [s for s in (level_sessions or []) if s.get('level_id') == level_id]
            if level_progress:
                completed = len([s for s in level_progress if s.get('completed')])
                completion_rate = (completed / len(level_progress)) * 100
                level_rates[f'level_{level_id}_completion_rate'] = round(completion_rate, 1)
            else:
                level_rates[f'level_{level_id}_completion_rate'] = 0
        
        return level_rates
    
    async def _calculate_retry_rate(self, level_sessions: List[Dict], blue_red_sessions: List[Dict]) -> float:
        """Calculate overall retry rate across all sessions"""
        total_attempts = 0
        total_successes = 0
        
        for session in (level_sessions or []):
            attempts = session.get('attempt_count', 1)
            total_attempts += attempts
            if session.get('completed'):
                total_successes += 1
        
        for session in (blue_red_sessions or []):
            attempts = session.get('attempt_count', 1)
            total_attempts += attempts
            if session.get('completed'):
                total_successes += 1
        
        if total_attempts > 0:
            retry_rate = ((total_attempts - total_successes) / total_attempts) * 100
            return round(retry_rate, 1)
        return 0
    
    async def _calculate_hint_usage_rate(self, level_sessions: List[Dict]) -> float:
        """Calculate hint usage rate in level sessions"""
        if not level_sessions:
            return 0
        
        sessions_with_hints = len([s for s in level_sessions if s.get('hints_used', 0) > 0])
        return round((sessions_with_hints / len(level_sessions)) * 100, 1)
    
    async def _calculate_churn_rate(self, users: List[Dict]) -> float:
        """Calculate user churn rate (users inactive for 30+ days)"""
        if not users:
            return 0
        
        month_ago = datetime.now() - timedelta(days=30)
        churned_users = [u for u in users if not u.get('last_login') or 
                        datetime.fromisoformat(u['last_login'].replace('Z', '+00:00')) < month_ago]
        
        return round((len(churned_users) / len(users)) * 100, 1)
    
    def _calculate_overall_completion_rate(self, level_sessions: List[Dict], 
                                         blue_red_sessions: List[Dict]) -> float:
        """Calculate overall completion rate across all modes"""
        total_sessions = len(level_sessions or []) + len(blue_red_sessions or [])
        if total_sessions == 0:
            return 0
            
        level_completed = len([s for s in (level_sessions or []) if s.get('completed')])
        blue_red_completed = len([s for s in (blue_red_sessions or []) if s.get('completed')])
        
        return round(((level_completed + blue_red_completed) / total_sessions * 100), 1)
    
    def _calculate_overall_average_score(self, level_sessions: List[Dict], 
                                       blue_red_sessions: List[Dict]) -> float:
        """Calculate overall average score across all modes"""
        all_scores = []
        
        if level_sessions:
            all_scores.extend([s.get('final_score', 0) for s in level_sessions if s.get('final_score')])
        if blue_red_sessions:
            all_scores.extend([s.get('total_xp_earned', 0) for s in blue_red_sessions if s.get('total_xp_earned')])
            
        return round(sum(all_scores) / len(all_scores), 1) if all_scores else 0
    
    async def _calculate_user_engagement(self, users: List[Dict], level_sessions: List[Dict], 
                                       blue_red_sessions: List[Dict]) -> Dict[str, Any]:
        """Calculate user engagement metrics"""
        if not users:
            return {
                'daily_active_users': 0,
                'weekly_active_users': 0,
                'average_session_duration': 0,
                'retention_rate': 0
            }
        
        # Calculate DAU (users active in last 24 hours)
        day_ago = datetime.now() - timedelta(days=1)
        dau = len([u for u in users if u.get('last_login') and 
                  datetime.fromisoformat(u['last_login'].replace('Z', '+00:00')) > day_ago])
        
        # Calculate WAU (users active in last 7 days)  
        week_ago = datetime.now() - timedelta(days=7)
        wau = len([u for u in users if u.get('last_login') and 
                  datetime.fromisoformat(u['last_login'].replace('Z', '+00:00')) > week_ago])
        
        # Calculate average session duration
        all_durations = []
        if level_sessions:
            all_durations.extend([s.get('completion_time_seconds', 0) for s in level_sessions])
        if blue_red_sessions:
            all_durations.extend([s.get('duration_minutes', 0) * 60 for s in blue_red_sessions])
            
        avg_duration = sum(all_durations) / len(all_durations) / 60 if all_durations else 0
        
        return {
            'daily_active_users': dau,
            'weekly_active_users': wau,
            'average_session_duration': round(avg_duration, 1),
            'retention_rate': round((wau / len(users) * 100), 1) if len(users) > 0 else 0
        }
    
    # ======================
    # LEVEL HELPER METHODS
    # ======================
    
    def _get_level_name(self, level_id: int) -> str:
        """Get display name for level"""
        names = {
            1: "The Misinformation Maze",
            2: "Shadow in the Inbox", 
            3: "Malware Mayhem",
            4: "The White Hat Test",
            5: "The Hunt for The Null"
        }
        return names.get(level_id, f"Level {level_id}")
    
    def _get_level_description(self, level_id: int) -> str:
        """Get description for level"""
        descriptions = {
            1: "Develop critical thinking skills to identify fake news and misinformation",
            2: "Spot phishing attempts and practice safe email protocols",
            3: "Isolate infections and perform digital cleanup during a gaming tournament",
            4: "Practice ethical hacking and responsible vulnerability disclosure", 
            5: "Use advanced digital forensics to expose The Null's identity"
        }
        return descriptions.get(level_id, f"Level {level_id} description")
    
    # ======================
    # HELPER FUNCTIONS
    # ======================
    
    async def _get_empty_level_data(self, level_id: int) -> Dict[str, Any]:
        """Return empty data structure for a level with no data"""
        return {
            'name': self._get_level_name(level_id),
            'description': self._get_level_description(level_id),
            'total_attempts': 0,
            'completed_sessions': 0,
            'completion_rate': 0,
            'average_score': 0,
            'average_completion_time': 0,
            'avg_time_seconds': 0,
            'attempts_to_complete': 0,
            'difficulty_rating': 'Unknown',
            'player_count': 0,
            'recent_activity': [],
            **await self._get_empty_level_specific_metrics(level_id)
        }
    
    async def _get_empty_level_specific_metrics(self, level_id: int) -> Dict[str, Any]:
        """Get empty metrics for level-specific fields"""
        base_metrics = {
            'articles_analyzed': 0, 'accuracy_rate': 0, 'fake_news_detected': 0, 'critical_thinking_score': 0,
            'fact_check_accuracy': 0, 'misinformation_detection_speed': 0, 'source_verification_attempts': 0,
            'news_bias_recognition': 0, 'emails_processed': 0, 'phishing_detected': 0, 'false_positives': 0,
            'security_awareness_score': 0, 'phishing_detection_rate': 0, 'false_positive_rate': 0,
            'email_analysis_thoroughness': 0, 'social_engineering_susceptibility': 0, 'safe_protocol_adherence': 0,
            'threats_neutralized': 0, 'systems_cleaned': 0, 'response_time': 0, 'cleanup_efficiency': 0,
            'malware_identification_accuracy': 0, 'quarantine_effectiveness': 0, 'system_cleanup_thoroughness': 0,
            'threat_propagation_prevention': 0, 'security_tool_utilization': 0, 'vulnerabilities_found': 0,
            'ethical_score': 0, 'documentation_quality': 0, 'responsible_disclosure': 0, 'vulnerability_discovery_rate': 0,
            'reporting_accuracy': 0, 'ethical_compliance_score': 0, 'technical_skill_demonstration': 0,
            'ethical_methodology_score': 0, 'responsible_disclosure_rate': 0, 'risk_assessment_accuracy': 0,
            'evidence_collected': 0, 'forensic_accuracy': 0, 'timeline_accuracy': 0, 'investigation_thoroughness': 0,
            'digital_forensics_proficiency': 0, 'investigation_methodology': 0, 'evidence_chain_preservation': 0,
            'case_resolution_efficiency': 0, 'evidence_collection_score': 0, 'data_analysis_depth': 0,
            'attribution_confidence': 0
        }
        return {k: v for k, v in base_metrics.items()}
    
    def _calculate_false_positive_rate(self, data: List[Dict]) -> float:
        """Calculate false positive rate"""
        total_negatives = sum(d.get('true_negatives', 0) + d.get('false_positives', 0) for d in data)
        false_positives = sum(d.get('false_positives', 0) for d in data)
        return round((false_positives / total_negatives * 100) if total_negatives > 0 else 0, 1)
    
    async def _get_empty_blue_vs_red_data(self) -> Dict[str, Any]:
        """Return empty data structure for blue vs red with no data"""
        return {
            'overview': {
                'total_games': 0, 'total_sessions': 0, 'completed_sessions': 0, 'completion_rate': 0,
                'avg_game_duration': 0, 'avg_session_duration': 0, 'avg_xp_earned': 0, 'active_players': 0,
                'player_win_rate': 0, 'asset_protection_rate': 0
            },
            'performance_metrics': {
                'threat_detection_speed': 0, 'incident_response_effectiveness': 0, 'security_control_optimization': 0,
                'ai_attack_success_rate': 0, 'player_action_efficiency': 0, 'alert_prioritization_accuracy': 0,
                'mttd': 0, 'mttr': 0, 'rto': 0
            },
            'defensive_actions': {
                'asset_isolation': {'total_attempts': 0, 'correct_actions': 0, 'accuracy_rate': 0, 'avg_per_session': 0},
                'vulnerability_patching': {'total_attempts': 0, 'correct_actions': 0, 'accuracy_rate': 0, 'avg_per_session': 0},
                'credential_resets': {'total_attempts': 0, 'correct_actions': 0, 'accuracy_rate': 0, 'avg_per_session': 0}
            },
            'ai_performance': {
                'attacks_launched': 0, 'successful_attacks': 0, 'detected_attacks': 0, 'success_rate': 0,
                'detection_rate': 0, 'avg_attacks_per_session': 0, 'difficulty_adaptation': 0
            },
            'asset_protection': {
                'academy_server': 0, 'student_db': 0, 'research_files': 0, 'learning_platform': 0
            },
            'attack_patterns': [],
            'recent_activity': []
        }
    
    async def _analyze_performance_metrics(self, sessions: List[Dict]) -> Dict[str, Any]:
        """Analyze performance metrics for blue vs red sessions"""
        if not sessions:
            return {
                'threat_detection_speed': 0, 'incident_response_effectiveness': 0, 'security_control_optimization': 0,
                'ai_attack_success_rate': 0, 'player_action_efficiency': 0, 'alert_prioritization_accuracy': 0,
                'mttd': 0, 'mttr': 0, 'rto': 0
            }
        
        return {
            'threat_detection_speed': self._calculate_avg_metric(sessions, 'threat_detection_speed'),
            'incident_response_effectiveness': self._calculate_avg_metric(sessions, 'incident_response_score'),
            'security_control_optimization': self._calculate_avg_metric(sessions, 'security_optimization_score'),
            'ai_attack_success_rate': self._calculate_avg_metric(sessions, 'ai_success_rate'),
            'player_action_efficiency': self._calculate_avg_metric(sessions, 'action_efficiency'),
            'alert_prioritization_accuracy': self._calculate_avg_metric(sessions, 'alert_accuracy'),
            'mttd': self._calculate_avg_metric(sessions, 'mean_time_to_detect'),
            'mttr': self._calculate_avg_metric(sessions, 'mean_time_to_respond'),
            'rto': self._calculate_avg_metric(sessions, 'recovery_time_objective')
        }
    
    async def _analyze_attack_patterns(self, sessions: List[Dict]) -> List[Dict]:
        """Analyze attack patterns across sessions"""
        if not sessions:
            return []
        
        phases = ['reconnaissance', 'initial_access', 'persistence', 'privilege_escalation', 'data_exfiltration']
        patterns = []
        
        for phase in phases:
            phase_attempts = sum(s.get(f'{phase}_attempts', 0) for s in sessions)
            phase_successes = sum(s.get(f'{phase}_successes', 0) for s in sessions)
            phase_detections = sum(s.get(f'{phase}_detections', 0) for s in sessions)
            
            success_rate = (phase_successes / phase_attempts * 100) if phase_attempts > 0 else 0
            detection_rate = (phase_detections / phase_attempts * 100) if phase_attempts > 0 else 0
            
            patterns.append({
                'phase': phase,
                'success_rate': round(success_rate, 1),
                'detection_rate': round(detection_rate, 1)
            })
        
        return patterns
    



# Global analytics instance
player_analytics = PlayerAnalytics()
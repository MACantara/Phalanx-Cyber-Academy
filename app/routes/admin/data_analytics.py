"""
Data analytics routes for admin panel.
"""

from flask import Blueprint, render_template
from flask_login import login_required
from app.routes.admin.admin_utils import admin_required

data_analytics_bp = Blueprint('data_analytics', __name__, url_prefix='/admin')


@data_analytics_bp.route('/player-analytics')
@login_required
@admin_required
def player_analytics():
    """Player Data Analytics dashboard with comprehensive metrics."""
    # Mock analytics data since user progress system is removed
    general_stats = {
        'total_users': 247,
        'active_users': 89,
        'completion_rate': 72.5,
        'average_score': 85.3,
        'total_sessions': 1456
    }
    
    gameplay_stats = {
        'total_levels_completed': 1789,
        'average_completion_time': 23.7,
        'retry_rate': 15.2,
        'hint_usage_rate': 34.6
    }
    
    engagement_stats = {
        'daily_active_users': 42,
        'weekly_active_users': 89,
        'average_session_duration': 18.5,
        'retention_rate': 68.3
    }
    
    weekly_trends = [
        {'week': 'Week 1', 'users': 35, 'completions': 78},
        {'week': 'Week 2', 'users': 42, 'completions': 95},
        {'week': 'Week 3', 'users': 38, 'completions': 87},
        {'week': 'Week 4', 'users': 45, 'completions': 102}
    ]
    
    # Cybersecurity-specific stats
    cybersec_stats = {
        'level_1_metrics': {
            'fact_check_accuracy': 85.2,
            'misinformation_detection_speed': 45.6
        },
        'level_2_metrics': {
            'phishing_detection_rate': 78.4,
            'false_positive_rate': 12.3
        },
        'level_3_metrics': {
            'malware_identification_accuracy': 82.7
        },
        'level_4_metrics': {
            'vulnerability_discovery_rate': 3.2,
            'ethical_methodology_score': 89.1,
            'responsible_disclosure_rate': 95.6
        },
        'level_5_metrics': {
            'evidence_collection_score': 77.8,
            'timeline_accuracy': 84.2,
            'attribution_confidence': 71.5
        },
        'blue_vs_red_metrics': {
            'asset_protection_rate': 74.8,
            'threat_detection_speed': 127.3,
            'incident_response_effectiveness': 81.2,
            'ai_attack_success_rate': 34.7,
            'mttd': 89.4,
            'mttr': 234.7
        }
    }
    
    return render_template('admin/player-data-analytics/dashboard.html',
                         general_stats=general_stats,
                         gameplay_stats=gameplay_stats,
                         engagement_stats=engagement_stats,
                         cybersec_stats=cybersec_stats,
                         weekly_trends=weekly_trends)


@data_analytics_bp.route('/player-analytics/levels')
@login_required
@admin_required
def player_analytics_levels():
    """Detailed level-specific analytics."""
    # Mock level analytics data
    level_details = {
        1: {
            'name': 'The Misinformation Maze',
            'completion_rate': 78.5,
            'average_score': 87.2,
            'average_time': 15.3,
            'attempts_to_complete': 1.8,
            'total_completions': 194
        },
        2: {
            'name': 'Shadow in the Inbox',
            'completion_rate': 72.3,
            'average_score': 84.6,
            'average_time': 18.7,
            'attempts_to_complete': 2.1,
            'total_completions': 179
        },
        3: {
            'name': 'Malware Mayhem',
            'completion_rate': 65.8,
            'average_score': 81.4,
            'average_time': 22.9,
            'attempts_to_complete': 2.4,
            'total_completions': 163
        },
        4: {
            'name': 'The White Hat Test',
            'completion_rate': 58.2,
            'average_score': 78.9,
            'average_time': 28.4,
            'attempts_to_complete': 2.8,
            'total_completions': 144
        },
        5: {
            'name': 'The Hunt for The Null',
            'completion_rate': 52.7,
            'average_score': 76.3,
            'average_time': 35.6,
            'attempts_to_complete': 3.1,
            'total_completions': 130
        }
    }
    
    return render_template('admin/player-data-analytics/levels.html',
                         level_details=level_details)


@data_analytics_bp.route('/player-analytics/blue-vs-red')
@login_required
@admin_required
def player_analytics_blue_vs_red():
    """Blue Team vs Red Team mode analytics."""
    # For now, using dummy data as blue vs red mode might not be fully implemented
    # This would be replaced with real queries when blue vs red data is available
    blue_vs_red_data = {
        'overview': {
            'total_games': 1247,
            'avg_game_duration': 567,  # seconds
            'asset_protection_rate': 74.8,
            'player_win_rate': 68.3
        },
        'performance_metrics': {
            'threat_detection_speed': 127.3,
            'incident_response_effectiveness': 81.2,
            'security_control_optimization': 76.4,
            'ai_attack_success_rate': 34.7,
            'player_action_efficiency': 0.73,
            'alert_prioritization_accuracy': 79.8,
            'mttd': 89.4,
            'mttr': 234.7,
            'rto': 312.6
        },
        'asset_protection': {
            'academy_server': 78.2,
            'student_db': 74.1,
            'research_files': 71.9,
            'learning_platform': 75.6
        },
        'attack_patterns': [
            {'phase': 'reconnaissance', 'success_rate': 67.2, 'detection_rate': 45.8},
            {'phase': 'initial_access', 'success_rate': 52.4, 'detection_rate': 63.1},
            {'phase': 'persistence', 'success_rate': 38.7, 'detection_rate': 78.4},
            {'phase': 'privilege_escalation', 'success_rate': 29.3, 'detection_rate': 84.2},
            {'phase': 'data_exfiltration', 'success_rate': 18.6, 'detection_rate': 91.7}
        ]
    }
    
    return render_template('admin/player-data-analytics/blue-vs-red.html',
                         blue_vs_red_data=blue_vs_red_data)

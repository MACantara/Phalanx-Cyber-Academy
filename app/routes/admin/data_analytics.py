"""
Data analytics routes for admin panel.
"""

import asyncio
import logging
from flask import Blueprint, render_template, jsonify
from flask_login import login_required
from app.routes.admin.admin_utils import admin_required
from app.utils.player_analytics import player_analytics as analytics_engine

logger = logging.getLogger(__name__)

data_analytics_bp = Blueprint('data_analytics', __name__, url_prefix='/admin')


@data_analytics_bp.route('/player-analytics')
@login_required
@admin_required
def player_analytics():
    """Player Data Analytics dashboard with comprehensive metrics."""
    # Get real analytics data from the analytics engine
    general_data = asyncio.run(analytics_engine.get_general_analytics())
    
    # Structure data for the dashboard template
    general_stats = {
        'total_users': general_data.get('total_users', 0),
        'active_users': general_data.get('active_users', 0),
        'completion_rate': general_data.get('completion_rate', 0),
        'average_score': general_data.get('average_score', 0),
        'total_sessions': general_data.get('total_sessions', 0),
        'dau': general_data.get('daily_active_users', 0),
        'wau': general_data.get('weekly_active_users', 0),
        'mau': general_data.get('monthly_active_users', 0),
        'avg_session_length': general_data.get('average_session_duration_seconds', 0),
        'retention_rates': {
            'day_1': general_data.get('retention_day_1', 0),
            'day_7': general_data.get('retention_day_7', 0),
            'day_30': general_data.get('retention_day_30', 0)
        },
        'drop_off_rate': general_data.get('drop_off_rate', 0),
        'churn_rate': general_data.get('churn_rate', 0)
    }
    
    # Calculate gameplay stats from general data
    gameplay_stats = {
        'total_levels_completed': int(general_data.get('total_sessions', 0) * general_data.get('completion_rate', 0) / 100),
        'average_completion_time': general_data.get('average_completion_time_minutes', 0),
        'retry_rate': general_data.get('retry_rate', 0),
        'hint_usage_rate': general_data.get('hint_usage_rate', 0),
        'levels_completed': {
            'level_1': general_data.get('level_1_completion_rate', 0),
            'level_2': general_data.get('level_2_completion_rate', 0),
            'level_3': general_data.get('level_3_completion_rate', 0),
            'level_4': general_data.get('level_4_completion_rate', 0),
            'level_5': general_data.get('level_5_completion_rate', 0)
        }
    }
    
    weekly_trends = general_data.get('weekly_trends', [])
    
    return render_template('admin/player-data-analytics/dashboard.html',
                         general_stats=general_stats,
                         gameplay_stats=gameplay_stats,
                         weekly_trends=weekly_trends)


@data_analytics_bp.route('/player-analytics/levels')
@login_required
@admin_required
def player_analytics_levels():
    """Detailed level-specific analytics."""
    # Get real level analytics data
    level_data = asyncio.run(analytics_engine.get_level_analytics())
    
    # Transform the data to match template expectations
    level_details = {}
    for level_key, data in level_data.items():
        level_id = int(level_key.split('_')[1])
        level_details[level_id] = {
            'name': data.get('name'),
            'completion_rate': data.get('completion_rate', 0),
            'average_score': data.get('average_score', 0),
            'average_time': data.get('average_completion_time', 0),
            'avg_time': data.get('avg_time_seconds', 0),
            'attempts_to_complete': data.get('attempts_to_complete', 0),
            'player_count': data.get('player_count', 0),
            'difficulty_rating': data.get('difficulty_rating', 'Unknown'),
            'total_attempts': data.get('total_attempts', 0),
            'completed_sessions': data.get('completed_sessions', 0),
            # Add level-specific metrics
            **{k: v for k, v in data.items() if k not in [
                'name', 'completion_rate', 'average_score', 'average_completion_time', 
                'player_count', 'difficulty_rating', 'total_attempts', 'completed_sessions'
            ]}
        }
    
    return render_template('admin/player-data-analytics/levels.html', level_details=level_details)


@data_analytics_bp.route('/player-analytics/blue-vs-red')
@login_required
@admin_required
def player_analytics_blue_vs_red():
    """Blue vs Red Team mode analytics."""
    # Get real blue vs red analytics data
    blue_vs_red_data = asyncio.run(analytics_engine.get_blue_vs_red_analytics())
    
    return render_template('admin/player-data-analytics/blue-vs-red.html', blue_vs_red_data=blue_vs_red_data)
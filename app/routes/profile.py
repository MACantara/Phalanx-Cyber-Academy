from flask import Blueprint, render_template, request, redirect, url_for, flash, current_app, jsonify
from flask_login import login_required, current_user
from app.models.user import User
from app.database import DatabaseError
from app.utils.timezone_utils import get_timezones
import re

profile_bp = Blueprint('profile', __name__, url_prefix='/profile')

def is_valid_username(username):
    """Validate username format."""
    # Username must be 3-30 characters, alphanumeric and underscores only
    pattern = r'^[a-zA-Z0-9_]{3,30}$'
    return re.match(pattern, username) is not None

@profile_bp.route('/')
@login_required
def profile():
    """User profile page."""
    if current_app.config.get('DISABLE_DATABASE', False):
        flash('User profiles are not available in this deployment environment.', 'warning')
        return redirect(url_for('main.home'))
    
    return render_template('profile/profile.html', user=current_user)

@profile_bp.route('/edit', methods=['GET', 'POST'])
@login_required
def edit_profile():
    """Edit user profile page."""
    if current_app.config.get('DISABLE_DATABASE', False):
        flash('Profile editing is not available in this deployment environment.', 'warning')
        return redirect(url_for('main.home'))
    
    # Get timezone list for template
    common_timezones = get_timezones()
    
    if request.method == 'POST':
        username = request.form.get('username', '').strip().lower()
        email = request.form.get('email', '').strip().lower()
        timezone = request.form.get('timezone', 'UTC').strip()
        current_password = request.form.get('current_password', '').strip()
        new_password = request.form.get('new_password', '').strip()
        confirm_password = request.form.get('confirm_password', '').strip()
        
        # Validate current password for any changes
        if not current_user.check_password(current_password):
            flash('Current password is incorrect.', 'error')
            return render_template('profile/edit-profile.html', user=current_user, common_timezones=common_timezones)
        
        # Validate username
        if not username or len(username) < 3 or len(username) > 30 or not is_valid_username(username):
            flash('Username must be between 3 and 30 characters.', 'error')
            return render_template('profile/edit-profile.html', user=current_user, common_timezones=common_timezones)
        
        # Check if username is taken by another user
        if username != current_user.username:
            existing_user = User.find_by_username(username)
            if existing_user:
                flash('Username is already taken.', 'error')
                return render_template('profile/edit-profile.html', user=current_user, common_timezones=common_timezones)
        
        # Validate email
        if not email or '@' not in email:
            flash('Please enter a valid email address.', 'error')
            return render_template('profile/edit-profile.html', user=current_user, common_timezones=common_timezones)
        
        # Check if email is taken by another user
        if email != current_user.email:
            existing_user = User.find_by_email(email)
            if existing_user:
                flash('Email address is already registered.', 'error')
                return render_template('profile/edit-profile.html', user=current_user, common_timezones=common_timezones)
        
        # Validate timezone
        if timezone not in common_timezones:
            flash('Please select a valid timezone.', 'error')
            return render_template('profile/edit-profile.html', user=current_user, common_timezones=common_timezones)
        
        # Validate new password if provided
        if new_password:
            if len(new_password) < 8:
                flash('Password must be at least 8 characters long.', 'error')
                return render_template('profile/edit-profile.html', user=current_user, common_timezones=common_timezones)
            
            if new_password != confirm_password:
                flash('New passwords do not match.', 'error')
                return render_template('profile/edit-profile.html', user=current_user, common_timezones=common_timezones)
        
        try:
            # Update user information
            current_user.username = username
            current_user.email = email
            current_user.timezone = timezone
            
            # Update password if provided
            if new_password:
                current_user.set_password(new_password)
            
            current_user.save()
            
            flash('Profile updated successfully!', 'success')
            return redirect(url_for('profile.profile'))
            
        except DatabaseError as e:
            flash('An error occurred while updating your profile. Please try again.', 'error')
            return render_template('profile/edit-profile.html', user=current_user, common_timezones=common_timezones)
        except Exception as e:
            flash('An error occurred while updating your profile. Please try again.', 'error')
            return render_template('profile/edit-profile.html', user=current_user, common_timezones=common_timezones)
    
    return render_template('profile/edit-profile.html', user=current_user, common_timezones=common_timezones)

@profile_bp.route('/dashboard')
@login_required
def dashboard():
    """Display user dashboard with cybersecurity level progress from sessions."""
    if current_app.config.get('DISABLE_DATABASE', False):
        flash('User dashboard is not available in this deployment environment.', 'warning')
        return redirect(url_for('main.home'))
    
    try:
        from app.models.level import Level
        from app.models.session import Session
        from app.utils.xp import get_user_level_info
        
        # Get all levels from database
        levels = Level.get_all_levels()
        total_levels = len(levels)
        
        # Get user progress from database
        progress_summary = Session.get_user_progress_summary(current_user.id)
        completed_levels = progress_summary['completed_levels']
        total_xp = getattr(current_user, 'total_xp', None) or 0
        progress_percentage = progress_summary['completion_percentage']
        
        # Get user level information
        level_info = get_user_level_info(total_xp)
        user_rank = f"Level {level_info['level']}"
        
        # Get learning streak information
        try:
            from app.utils.streak_tracker import get_user_learning_streak
            streak_info = get_user_learning_streak(current_user.id)
            learning_streak = streak_info['current_streak']
            streak_data = {
                'current_streak': streak_info['current_streak'],
                'longest_streak': streak_info['longest_streak'],
                'status': streak_info['status'],
                'message': streak_info['message'],
                'is_active': streak_info['is_active']
            }
        except Exception as e:
            current_app.logger.warning(f"Failed to calculate learning streak for user {current_user.id}: {str(e)}")
            learning_streak = 0
            streak_data = {
                'current_streak': 0,
                'longest_streak': 0,
                'status': 'unknown',
                'message': 'Streak information unavailable',
                'is_active': False
            }
        
        # Get user activity history
        try:
            from app.models.xp_history import XPHistory
            
            # Get recent XP history (last 5 entries)
            recent_xp_history_raw = XPHistory.get_user_history(current_user.id, limit=5)
            
            # Enrich XP history with level information from sessions
            recent_xp_history = []
            for entry in recent_xp_history_raw:
                entry_dict = entry.to_dict()
                # If this XP entry has a session, try to get session info
                if entry.session_id:
                    try:
                        session = Session.get_by_id(entry.session_id)
                        if session:
                            entry_dict['level_id'] = session.level_id
                            entry_dict['session_name'] = session.session_name
                        else:
                            entry_dict['level_id'] = None
                            entry_dict['session_name'] = None
                    except Exception:
                        entry_dict['level_id'] = None
                        entry_dict['session_name'] = None
                else:
                    entry_dict['level_id'] = None
                    entry_dict['session_name'] = None
                recent_xp_history.append(entry_dict)
            
            # Get XP summary for stats
            xp_summary = XPHistory.get_user_xp_summary(current_user.id)
            
            # Get recent sessions (last 5 sessions) and convert to dict format
            recent_sessions_raw = Session.get_user_sessions(current_user.id, limit=5)
            recent_sessions = [session.to_dict() for session in recent_sessions_raw]
            
        except Exception as e:
            current_app.logger.warning(f"Failed to load activity history for user {current_user.id}: {str(e)}")
            recent_xp_history = []
            xp_summary = {
                'total_xp': total_xp,
                'total_entries': 0,
                'xp_gained': 0,
                'xp_lost': 0,
                'by_reason': {},
                'first_entry': None,
                'last_entry': None
            }
            recent_sessions = []
        
        # Prepare levels with completion status based on sessions
        levels_progress = []
        # Get a large number of sessions to ensure we don't miss any completed ones
        user_sessions = Session.get_user_sessions(current_user.id, limit=500)
        
        # Create lookup for latest completed session per level_id (user_sessions is ordered by created_at DESC)
        session_lookup = {}
        for session in user_sessions:
            if session.level_id not in session_lookup and session.end_time is not None and session.level_id is not None:
                session_lookup[session.level_id] = session
        
        for level in levels:
            # Find session for this level by level_id
            session = session_lookup.get(level.level_id)
            
            level_data = {
                'id': level.level_id,
                'name': level.name,
                'description': level.description,
                'difficulty': level.difficulty.title() if level.difficulty else 'Medium',
                'xp_reward': level.xp_reward or 100,
                'icon': level.icon or 'bi-shield-check',
                'category': level.category or 'Cybersecurity',
                'estimated_time': level.estimated_time or '15 minutes',
                'skills': level.skills or [],
                'unlocked': level.unlocked,
                'coming_soon': level.coming_soon,
                # Progress data from sessions
                'completed': session is not None,
                'score': session.score or 0 if session else 0,
                'attempts': 1 if session else 0,  # For now, count session as 1 attempt
                'time_spent': session.time_spent or 0 if session else 0,
                'xp_earned': level.xp_reward if session else 0
            }
            
            levels_progress.append(level_data)
        
        # Sort by level_id
        levels_progress.sort(key=lambda x: x['id'])
        
        # Find next available level (first uncompleted level)
        next_level = next((level for level in levels_progress if not level['completed'] and level['unlocked']), None)
        
        # Empty skill analysis (could be enhanced with actual data)
        skill_analysis = []
        
        # Basic learning patterns
        learning_patterns = {
            'status': 'success',
            'engagement_score': min(int(progress_percentage), 100),
            'total_sessions': completed_levels,
            'preferred_time': 'afternoon',
            'recommendations': [
                'Complete your first cybersecurity level to start building your skills!' if completed_levels == 0 else f'Great progress! You\'ve completed {completed_levels} out of {total_levels} levels.',
                'Take your time to explore each level thoroughly.'
            ]
        }
        
        return render_template('profile/dashboard.html',
                             total_xp=total_xp,
                             completed_levels=completed_levels,
                             total_levels=total_levels,
                             learning_streak=learning_streak,
                             streak_data=streak_data,
                             user_rank=user_rank,
                             progress_percentage=int(progress_percentage),
                             levels=levels_progress,
                             next_level=next_level,
                             skill_analysis=skill_analysis,
                             recommendations=[],
                             learning_patterns=learning_patterns,
                             recent_xp_history=recent_xp_history,
                             xp_summary=xp_summary,
                             recent_sessions=recent_sessions)
    
    except DatabaseError as e:
        current_app.logger.error(f"Database error in dashboard: {str(e)}")
        flash('Unable to load dashboard data. Please try again later.', 'error')
        return redirect(url_for('profile.profile'))
    except Exception as e:
        current_app.logger.error(f"Unexpected error in dashboard: {str(e)}")
        flash('An error occurred while loading your dashboard. Please try again.', 'error')
        return redirect(url_for('profile.profile'))


@profile_bp.route('/api/user/streak', methods=['GET'])
@login_required
def get_user_streak_api():
    """API endpoint to get current user streak information"""
    try:
        from app.utils.streak_tracker import get_user_learning_streak
        
        streak_info = get_user_learning_streak(current_user.id)
        
        return jsonify({
            'success': True,
            'streak_info': streak_info
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Error getting streak info for user {current_user.id}: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Unable to load streak information',
            'streak_info': {
                'current_streak': 0,
                'longest_streak': 0,
                'is_active': False,
                'status': 'unknown',
                'message': 'Streak information unavailable',
                'days_since_last_activity': 0
            }
        }), 500

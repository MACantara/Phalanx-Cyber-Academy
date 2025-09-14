from flask import Blueprint, render_template, request, redirect, url_for, flash, current_app, jsonify
from flask_login import login_required, current_user
from app.models.user import User
from app.database import DatabaseError
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
    
    if request.method == 'POST':
        username = request.form.get('username', '').strip().lower()
        email = request.form.get('email', '').strip().lower()
        current_password = request.form.get('current_password', '').strip()
        new_password = request.form.get('new_password', '').strip()
        confirm_password = request.form.get('confirm_password', '').strip()
        
        # Validate current password for any changes
        if not current_user.check_password(current_password):
            flash('Current password is incorrect.', 'error')
            return render_template('profile/edit-profile.html', user=current_user)
        
        # Validate username
        if not username or len(username) < 3 or len(username) > 30 or not is_valid_username(username):
            flash('Username must be between 3 and 30 characters.', 'error')
            return render_template('profile/edit-profile.html', user=current_user)
        
        # Check if username is taken by another user
        if username != current_user.username:
            existing_user = User.find_by_username(username)
            if existing_user:
                flash('Username is already taken.', 'error')
                return render_template('profile/edit-profile.html', user=current_user)
        
        # Validate email
        if not email or '@' not in email:
            flash('Please enter a valid email address.', 'error')
            return render_template('profile/edit-profile.html', user=current_user)
        
        # Check if email is taken by another user
        if email != current_user.email:
            existing_user = User.find_by_email(email)
            if existing_user:
                flash('Email address is already registered.', 'error')
                return render_template('profile/edit-profile.html', user=current_user)
        
        # Validate new password if provided
        if new_password:
            if len(new_password) < 8:
                flash('Password must be at least 8 characters long.', 'error')
                return render_template('profile/edit-profile.html', user=current_user)
            
            if new_password != confirm_password:
                flash('New passwords do not match.', 'error')
                return render_template('profile/edit-profile.html', user=current_user)
        
        try:
            # Update user information
            current_user.username = username
            current_user.email = email
            
            # Update password if provided
            if new_password:
                current_user.set_password(new_password)
            
            current_user.save()
            
            flash('Profile updated successfully!', 'success')
            return redirect(url_for('profile.profile'))
            
        except DatabaseError as e:
            flash('An error occurred while updating your profile. Please try again.', 'error')
            return render_template('profile/edit-profile.html', user=current_user)
        except Exception as e:
            flash('An error occurred while updating your profile. Please try again.', 'error')
            return render_template('profile/edit-profile.html', user=current_user)
    
    return render_template('profile/edit-profile.html', user=current_user)

@profile_bp.route('/dashboard')
@login_required
def dashboard():
    """Display user dashboard with cybersecurity level progress."""
    if current_app.config.get('DISABLE_DATABASE', False):
        flash('User dashboard is not available in this deployment environment.', 'warning')
        return redirect(url_for('main.home'))
    
    try:
        from app.models.level import Level
        from app.models.level_completion import LevelCompletion
        from app.utils.xp import get_user_level_info
        
        # Get all levels from database
        levels = Level.get_all_levels()
        total_levels = len(levels)
        
        # Get user progress from database
        progress_summary = LevelCompletion.get_user_progress_summary(current_user.id)
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
            
            # Get recent XP history (last 10 entries)
            recent_xp_history = XPHistory.get_user_history(current_user.id, limit=10)
            
            # Get XP summary for stats
            xp_summary = XPHistory.get_user_xp_summary(current_user.id)
            
            # Get recent level completions (last 5 completions)
            recent_completions = LevelCompletion.get_user_completions(current_user.id, limit=5)
            
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
            recent_completions = []
        
        # Prepare levels with completion status
        levels_progress = []
        user_completions = {comp.level_id: comp for comp in LevelCompletion.get_user_completions(current_user.id)}
        
        for level in levels:
            completion = user_completions.get(level.level_id)
            
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
                # Progress data
                'completed': completion is not None,
                'score': completion.score if completion else 0,
                'attempts': 1 if completion else 0,  # For now, count completion as 1 attempt
                'time_spent': completion.time_spent if completion else 0,
                'xp_earned': level.xp_reward if completion else 0
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
                             recent_completions=recent_completions)
    
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

from flask import Blueprint, render_template, request, redirect, url_for, flash, current_app
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
    
    from app.routes.levels import CYBERSECURITY_LEVELS
    from app.models.user_progress import UserProgress
    
    # Get user statistics from UserProgress
    user_stats = UserProgress.get_user_stats(current_user.id)
    
    # Use real data from user progress system
    total_levels = len(CYBERSECURITY_LEVELS)
    completed_levels = user_stats.get('completed_levels', 0)
    total_xp = user_stats.get('total_xp', 0)
    learning_streak = user_stats.get('learning_streak', 0)
    user_rank = user_stats.get('user_rank', 'Novice')
    progress_percentage = (completed_levels / total_levels) * 100 if total_levels > 0 else 0
    
    # Prepare levels with completion status from database
    levels_progress = []
    for level in CYBERSECURITY_LEVELS:
        level_data = level.copy()
        
        # Get actual progress from database
        user_progress = UserProgress.get_level_progress(current_user.id, level['id'])
        if user_progress and user_progress.get('status') == 'completed':
            level_data['completed'] = True
            level_data['score'] = user_progress.get('score', 0)
            level_data['attempts'] = user_progress.get('attempts', 0)
            level_data['time_spent'] = user_progress.get('time_spent', 0)
            level_data['xp_earned'] = user_progress.get('xp_earned', 0)
        else:
            level_data['completed'] = False
            level_data['score'] = 0
            level_data['attempts'] = 0
            level_data['time_spent'] = 0
            level_data['xp_earned'] = 0
        
        # All levels are now unlocked (per previous requirement)
        level_data['unlocked'] = True
        
        levels_progress.append(level_data)
    
    # Find next available level (first uncompleted level)
    next_level = None
    for level in levels_progress:
        if not level['completed']:
            next_level = level
            break
    
    # Simple skill analysis based on completed levels
    skill_analysis = []
    if completed_levels > 0:
        # Basic skills that improve with level completion
        basic_skills = [
            ('Critical Thinking', min(completed_levels * 20, 100)),
            ('Source Verification', min((completed_levels - 0) * 25, 100) if completed_levels >= 1 else 0),
            ('Fact Checking', min((completed_levels - 1) * 30, 100) if completed_levels >= 2 else 0),
            ('Phishing Detection', min((completed_levels - 2) * 25, 100) if completed_levels >= 3 else 0),
            ('System Security', min((completed_levels - 3) * 35, 100) if completed_levels >= 4 else 0),
            ('Digital Forensics', min((completed_levels - 4) * 50, 100) if completed_levels >= 5 else 0)
        ]
        
        for skill_name, score in basic_skills:
            if score > 0:
                if score >= 80:
                    proficiency = 'advanced'
                elif score >= 60:
                    proficiency = 'intermediate'
                elif score >= 30:
                    proficiency = 'beginner'
                else:
                    proficiency = 'novice'
                
                skill_analysis.append({
                    'name': skill_name,
                    'proficiency': proficiency,
                    'score': score,
                    'max_score': 100
                })
    
    # Mock learning patterns for now
    learning_patterns = {
        'status': 'success',
        'engagement_score': min(completed_levels * 20, 100),
        'total_sessions': completed_levels + (completed_levels * 2),
        'preferred_time': 'afternoon',
        'recommendations': [
            'You learn best in the afternoon - try scheduling study sessions then!',
            'Great progress! Consider reviewing previous levels to reinforce learning.'
        ] if completed_levels > 0 else []
    }
    
    return render_template('profile/dashboard.html',
                         total_xp=total_xp,
                         completed_levels=completed_levels,
                         total_levels=total_levels,
                         learning_streak=learning_streak,
                         user_rank=user_rank,
                         progress_percentage=int(progress_percentage),
                         levels=levels_progress,
                         next_level=next_level,
                         skill_analysis=skill_analysis,
                         recommendations=[],  # No recommendations for now
                         learning_patterns=learning_patterns)

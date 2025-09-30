from flask import Blueprint, render_template, current_app, flash, redirect, url_for, request, session, jsonify
from flask_login import login_required, current_user
from app.database import DatabaseError
import json
import logging

logger = logging.getLogger(__name__)

levels_bp = Blueprint('levels', __name__, url_prefix='/levels')

# Legacy CYBERSECURITY_LEVELS for compatibility - will be populated from database
CYBERSECURITY_LEVELS = []

def get_levels_from_db():
    """Get all levels from database and cache them."""
    global CYBERSECURITY_LEVELS
    try:
        from app.models.level import Level
        
        levels = Level.get_all_levels()
        CYBERSECURITY_LEVELS = []
        
        for level in levels:
            # Convert Level model to legacy format for compatibility
            level_dict = {
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
                'coming_soon': level.coming_soon
            }
            CYBERSECURITY_LEVELS.append(level_dict)
        
        # Sort by level_id
        CYBERSECURITY_LEVELS.sort(key=lambda x: x['id'])
        
        return CYBERSECURITY_LEVELS
    except Exception as e:
        logger.error(f"Failed to load levels from database: {str(e)}")
        # Fallback to basic levels if database fails
        return [
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
            }
        ]

def get_level_js_files(level_id):
    """Get the JavaScript files required for a specific level."""
    
    # Core files needed for all levels
    core_files = [
        'js/simulated-pc/boot-sequence.js',
        'js/simulated-pc/loading-screen.js',
        'js/simulated-pc/shutdown-sequence.js',
        'js/simulated-pc/desktop.js',
        'js/simulated-pc/main.js',
        
        # Core desktop components
        'js/simulated-pc/desktop-components/window-base.js',
        'js/simulated-pc/desktop-components/window-manager.js',
        'js/simulated-pc/desktop-components/window-resize-manager.js',
        'js/simulated-pc/desktop-components/window-snap-manager.js',
        'js/simulated-pc/desktop-components/application-launcher.js',
        'js/simulated-pc/desktop-components/application-registry.js',
        'js/simulated-pc/desktop-components/taskbar.js',
        'js/simulated-pc/desktop-components/shutdown-modal.js',
        'js/simulated-pc/desktop-components/skip-dialogue-modal.js',
        
        # Shared utilities
        'js/simulated-pc/desktop-components/shared-utils/navigation-util.js',
        
        # Base dialogue system
        'js/simulated-pc/dialogues/base-dialogue.js',
        'js/simulated-pc/dialogues/dialogue-manager.js',
        'js/simulated-pc/dialogues/dialogue-integration.js',
        
        # Level management
        'js/simulated-pc/levels/level-manager.js',
    ]
    
    # Level-specific files
    level_specific_files = []
    
    if level_id == 1:
        # Level 1: The Misinformation Maze - News verification and browser-based tasks
        level_specific_files = [
            # Level 1 configuration and data
            'js/simulated-pc/levels/level-one/level-config.js',
            'js/simulated-pc/levels/level-one/apps/index.js',
            'js/simulated-pc/levels/level-one/data/index.js',
            
            # Level 1 dialogues
            'js/simulated-pc/levels/level-one/dialogues/index.js',
            'js/simulated-pc/levels/level-one/dialogues/level1-misinformation-maze.js',
            'js/simulated-pc/levels/level-one/dialogues/level-completion-dialogue.js',
        ]
    
    elif level_id == 2:
        # Level 2: Shadow in the Inbox - Email security focused
        level_specific_files = [
            # Level 2 configuration and data
            'js/simulated-pc/levels/level-two/level-config.js',
            'js/simulated-pc/levels/level-two/apps/index.js',
            'js/simulated-pc/levels/level-two/data/index.js',
            
            # Level 2 dialogues
            'js/simulated-pc/levels/level-two/dialogues/index.js',
            'js/simulated-pc/levels/level-two/dialogues/level2-shadow-inbox.js',
            'js/simulated-pc/levels/level-two/dialogues/email-security-completion-dialogue.js',
        ]
    
    elif level_id == 3:
        # Level 3: Malware Mayhem - System security and malware detection
        level_specific_files = [
            # Level 3 configuration and data
            'js/simulated-pc/levels/level-three/level-config.js',
            'js/simulated-pc/levels/level-three/apps/index.js',
            'js/simulated-pc/levels/level-three/data/index.js',
            
            # Level 3 dialogues
            'js/simulated-pc/levels/level-three/dialogues/index.js',
            'js/simulated-pc/levels/level-three/dialogues/level3-malware-mayhem.js',
            
            # Level 3 applications
            'js/simulated-pc/levels/level-three/apps/malware-scanner.js',
            'js/simulated-pc/levels/level-three/apps/process-monitor.js',
            
        ]
    
    elif level_id == 4:
        # Level 4: The White Hat Test - Ethical hacking and vulnerability assessment
        level_specific_files = [
            # Level 4 configuration and data
            'js/simulated-pc/levels/level-four/level-config.js',
            'js/simulated-pc/levels/level-four/apps/index.js',
            'js/simulated-pc/levels/level-four/data/index.js',
            
            # Level 4 dialogues
            'js/simulated-pc/levels/level-four/dialogues/index.js',
            'js/simulated-pc/levels/level-four/dialogues/level4-white-hat-test.js',
            
            # Level 4 terminal commands
            'js/simulated-pc/levels/level-four/apps/terminal/terminal-commands/base-command.js',
            'js/simulated-pc/levels/level-four/apps/terminal/terminal-commands/cat-command.js',
            'js/simulated-pc/levels/level-four/apps/terminal/terminal-commands/cd-command.js',
            'js/simulated-pc/levels/level-four/apps/terminal/terminal-commands/clear-command.js',
            'js/simulated-pc/levels/level-four/apps/terminal/terminal-commands/date-command.js',
            'js/simulated-pc/levels/level-four/apps/terminal/terminal-commands/echo-command.js',
            'js/simulated-pc/levels/level-four/apps/terminal/terminal-commands/find-command.js',
            'js/simulated-pc/levels/level-four/apps/terminal/terminal-commands/grep-command.js',
            'js/simulated-pc/levels/level-four/apps/terminal/terminal-commands/help-command.js',
            'js/simulated-pc/levels/level-four/apps/terminal/terminal-commands/history-command.js',
            'js/simulated-pc/levels/level-four/apps/terminal/terminal-commands/ls-command.js',
            'js/simulated-pc/levels/level-four/apps/terminal/terminal-commands/nmap-command.js',
            'js/simulated-pc/levels/level-four/apps/terminal/terminal-commands/ping-command.js',
            'js/simulated-pc/levels/level-four/apps/terminal/terminal-commands/pwd-command.js',
            'js/simulated-pc/levels/level-four/apps/terminal/terminal-commands/uname-command.js',
            'js/simulated-pc/levels/level-four/apps/terminal/terminal-commands/whoami-command.js',
            
            # Terminal Application (core Level 4 app)
            'js/simulated-pc/levels/level-four/apps/terminal-app.js',
            'js/simulated-pc/levels/level-four/apps/terminal/terminal-functions/command-history.js',
            'js/simulated-pc/levels/level-four/apps/terminal/terminal-functions/command-processor.js',
            'js/simulated-pc/levels/level-four/apps/terminal/terminal-functions/command-registry.js',
            'js/simulated-pc/levels/level-four/apps/terminal/terminal-functions/file-system.js',
            'js/simulated-pc/levels/level-four/apps/terminal/terminal-functions/tab-completion.js',
        ]
    
    elif level_id == 5:
        # Level 5: The Hunt for The Null - Advanced digital forensics
        level_specific_files = [
            # Level 5 configuration and data
            'js/simulated-pc/levels/level-five/level-config.js',
            'js/simulated-pc/levels/level-five/apps/index.js',
            'js/simulated-pc/levels/level-five/data/index.js',
            
            # Level 5 forensic applications
            'js/simulated-pc/levels/level-five/apps/evidence-locker-app.js',
            'js/simulated-pc/levels/level-five/apps/disk-analyzer-app.js',
            'js/simulated-pc/levels/level-five/apps/memory-forensics-app.js',
            'js/simulated-pc/levels/level-five/apps/network-analyzer-app.js',
            'js/simulated-pc/levels/level-five/apps/timeline-constructor-app.js',
            'js/simulated-pc/levels/level-five/apps/report-generator-app.js',
            'js/simulated-pc/levels/level-five/apps/forensic-app-base.js',
            
            # Level 5 dialogues
            'js/simulated-pc/levels/level-five/dialogues/index.js',
            'js/simulated-pc/levels/level-five/dialogues/level5-hunt-for-the-null.js',
        ]
    
    return core_files + level_specific_files

@levels_bp.route('/')
@login_required
def levels_overview():
    """Display all cybersecurity levels with real user progress from sessions."""
    try:
        from app.models.level import Level
        from app.models.session import Session
        from app.utils.xp import get_user_level_info
        
        # Load levels from database, fallback to cached if needed
        levels = get_levels_from_db()
        
        # Get user's progress summary
        progress_summary = Session.get_user_progress_summary(current_user.id)
        
        # Get user's total XP
        user_total_xp = getattr(current_user, 'total_xp', None) or 0
        level_info = get_user_level_info(user_total_xp)
        
        # Get user's sessions for detailed progress
        user_sessions = Session.get_user_sessions(current_user.id, limit=100)
        
        # Create lookup for latest session per level_id (user_sessions is ordered by created_at DESC)
        session_lookup = {}
        for session in user_sessions:
            if session.level_id not in session_lookup and session.end_time is not None and session.level_id is not None:
                session_lookup[session.level_id] = session
        
        # Enhance levels with user progress data
        enhanced_levels = []
        for level in levels:
            level_data = level.copy()
            
            # Check if user has completed this level (by level_id)
            level_id = level.get('id')
            session = session_lookup.get(level_id)
            
            if session:
                level_data['user_progress'] = {
                    'status': 'completed',
                    'completed': True,
                    'score': session.score or 0,
                    'completion_percentage': session.score or 0,
                    'xp_earned': level['xp_reward'],  # Use the reward from level data
                    'time_spent': session.time_spent or 0,
                    'attempts': 1,  # Could be enhanced to track multiple attempts
                    'completed_at': session.end_time,
                    'started_at': session.start_time
                }
            else:
                level_data['user_progress'] = {
                    'status': 'not_started',
                    'completed': False,
                    'score': 0,
                    'completion_percentage': 0,
                    'xp_earned': 0,
                    'time_spent': 0,
                    'attempts': 0,
                    'completed_at': None,
                    'started_at': None
                }
            enhanced_levels.append(level_data)
        
        # Real user stats from server-side tracking
        user_stats = {
            'total_levels': progress_summary['total_levels'],
            'completed_levels': progress_summary['completed_levels'],
            'total_xp': user_total_xp,
            'completion_percentage': progress_summary['completion_percentage'],
            'user_level': level_info['level'],
            'xp_for_next_level': level_info['xp_for_next'],
            'best_scores': progress_summary['best_scores']
        }
        
        return render_template('levels/levels.html', 
                             levels=enhanced_levels, 
                             user_stats=user_stats)
                             
    except Exception as e:
        logger.error(f"Error loading levels overview: {e}")
        # Fallback to basic display if database fails
        levels = get_levels_from_db()
        user_stats = {
            'total_levels': len(levels),
            'completed_levels': 0,
            'total_xp': 0,
            'completion_percentage': 0
        }
        
        # Add basic progress structure for fallback
        enhanced_levels = []
        for level in levels:
            level_data = level.copy()
            level_data['user_progress'] = {
                'status': 'not_started',
                'completed': False,
                'score': 0,
                'completion_percentage': 0,
                'xp_earned': 0,
                'time_spent': 0,
                'attempts': 0,
                'completed_at': None,
                'started_at': None
            }
            enhanced_levels.append(level_data)
        
        flash('Some features may be limited due to a temporary issue.', 'warning')
        return render_template('levels/levels.html', 
                             levels=enhanced_levels, 
                             user_stats=user_stats)

@levels_bp.route('/<int:level_id>/start')
@login_required
def start_level(level_id):
    """Start a level using database Level model and create a new session."""
    try:
        from app.models.level import Level
        from app.models.session import Session
        
        # Get level from database
        level = Level.get_by_level_id(level_id)
        
        if not level:
            flash('Level not found.', 'error')
            return redirect(url_for('levels.levels_overview'))
        
        # Create a new session for this level
        try:
            session = Session.start_session(
                user_id=current_user.id,
                session_name=level.name,
                level_id=level.level_id
            )
            session_id = session.id
        except Exception as session_error:
            logger.error(f"Failed to create session for level {level_id}: {session_error}")
            # Continue without session tracking
            session_id = None
        
        # Check if user has previous sessions for this level
        user_sessions = Session.get_user_sessions(current_user.id, limit=10)
        previous_sessions = [s for s in user_sessions if s.session_name == level.name and s.end_time is not None]
        previous_session = previous_sessions[0] if previous_sessions else None
        
        # Prepare level data for simulation
        level_data = {
            'id': level.level_id,
            'name': level.name,
            'description': level.description,
            'category': level.category,
            'difficulty': level.difficulty,
            'xp_reward': level.xp_reward or 100,
            'skills': level.skills or [],
            'session_id': session_id,  # Include session ID for tracking
            'is_retry': previous_session is not None,
            'previous_attempts': len(previous_sessions),
            'previous_score': previous_session.score if previous_session else 0,
            'previous_status': 'completed' if previous_session else 'not_started'
        }
        
        # Define level-specific JavaScript files to load
        level_js_files = get_level_js_files(level_id)
        
        # Convert level data to JSON string for direct JavaScript usage
        level_json = json.dumps(level_data, default=str)
        
        return render_template('simulated-pc/simulation.html', 
                             level=level, 
                             level_data=level_data,
                             level_json=level_json,
                             level_js_files=level_js_files)
                             
    except Exception as e:
        logger.error(f"Error starting level {level_id}: {e}")
        flash('Error starting level. Please try again.', 'error')
        return redirect(url_for('levels.levels_overview'))

# Simplified API endpoints that return success without actual functionality

@levels_bp.route('/api/progress', methods=['GET'])
@login_required
def get_user_progress():
    """API endpoint to get user progress data with server-side session tracking."""
    try:
        from app.models.session import Session
        from app.models.level import Level
        from app.utils.xp import get_user_level_info
        
        # Get user's progress summary
        progress_summary = Session.get_user_progress_summary(current_user.id)
        
        # Get user's total XP (from User model or calculate from history)
        user_total_xp = getattr(current_user, 'total_xp', None) or 0
        
        # Get user level information
        level_info = get_user_level_info(user_total_xp)
        
        # Get recent sessions
        recent_sessions = Session.get_user_sessions(current_user.id, limit=10)
        
        return jsonify({
            'success': True,
            'stats': {
                'total_levels': progress_summary['total_levels'],
                'completed_levels': progress_summary['completed_levels'],
                'total_xp': user_total_xp,
                'completion_percentage': progress_summary['completion_percentage'],
                'user_level': level_info['level'],
                'xp_for_next_level': level_info['xp_for_next'],
                'xp_in_current_level': level_info['xp_in_current'],
                'progress_percent': level_info['progress_percent']
            },
            'best_scores': progress_summary['best_scores'],
            'recent_sessions': [session.to_dict() for session in recent_sessions]
        })
        
    except DatabaseError as e:
        logger.error(f"Database error in get_user_progress: {str(e)}")
        return jsonify({'success': False, 'error': 'Database error occurred'}), 500
    except Exception as e:
        logger.error(f"Unexpected error in get_user_progress: {str(e)}")
        return jsonify({'success': False, 'error': 'Internal server error'}), 500

@levels_bp.route('/api/level/<int:level_id>/progress', methods=['POST'])
@login_required
def update_level_progress(level_id):
    """API endpoint to update level progress during gameplay (simplified)."""
    try:
        from app.models.level import Level
        
        # Validate level exists in database
        level = Level.get_by_level_id(level_id)
        if not level:
            return jsonify({'success': False, 'error': 'Level not found'}), 404
        
        return jsonify({'success': True, 'message': 'Progress updated'})
        
    except DatabaseError as e:
        logger.error(f"Database error in update_level_progress: {str(e)}")
        return jsonify({'success': False, 'error': 'Database error occurred'}), 500
    except Exception as e:
        logger.error(f"Unexpected error in update_level_progress: {str(e)}")
        return jsonify({'success': False, 'error': 'Internal server error'}), 500

@levels_bp.route('/api/level/<int:level_id>/statistics', methods=['GET'])
@login_required  
def get_level_statistics(level_id):
    """API endpoint to get statistics for a specific level based on sessions."""
    try:
        from app.models.session import Session
        from app.models.level import Level
        
        # Validate level exists
        level = Level.get_by_level_id(level_id)
        if not level:
            return jsonify({'success': False, 'error': 'Level not found'}), 404
        
        # Get session statistics for this level
        stats = Session.get_session_statistics(level.name)
        
        return jsonify({
            'success': True,
            'level_id': level_id,
            'level_name': level.name,
            'statistics': stats
        })
        
    except DatabaseError as e:
        logger.error(f"Database error in get_level_statistics: {str(e)}")
        return jsonify({'success': False, 'error': 'Database error occurred'}), 500
    except Exception as e:
        logger.error(f"Unexpected error in get_level_statistics: {str(e)}")
        return jsonify({'success': False, 'error': 'Internal server error'}), 500

@levels_bp.route('/api/xp/history', methods=['GET'])
@login_required
def get_user_xp_history():
    """API endpoint to get user's XP history."""
    try:
        from app.models.xp_history import XPHistory
        
        # Get pagination parameters
        limit = min(int(request.args.get('limit', 20)), 100)
        offset = int(request.args.get('offset', 0))
        
        # Get user's XP history
        history_entries = XPHistory.get_user_history(current_user.id, limit=limit, offset=offset)
        xp_summary = XPHistory.get_user_xp_summary(current_user.id)
        
        return jsonify({
            'success': True,
            'history': [entry.to_dict() for entry in history_entries],
            'summary': xp_summary,
            'pagination': {
                'limit': limit,
                'offset': offset,
                'has_more': len(history_entries) == limit
            }
        })
        
    except DatabaseError as e:
        logger.error(f"Database error in get_user_xp_history: {str(e)}")
        return jsonify({'success': False, 'error': 'Database error occurred'}), 500
    except Exception as e:
        logger.error(f"Unexpected error in get_user_xp_history: {str(e)}")
        return jsonify({'success': False, 'error': 'Internal server error'}), 500

@levels_bp.route('/api/session/start', methods=['POST'])
@login_required
def start_session():
    """API endpoint to start a new learning session."""
    try:
        from app.models.session import Session
        
        data = request.get_json()
        session_name = data.get('session_name', 'Unknown Session')
        level_id = data.get('level_id')
        
        if not session_name:
            return jsonify({'success': False, 'error': 'Session name is required'}), 400
        
        # Start new session
        session = Session.start_session(
            user_id=current_user.id,
            session_name=session_name,
            level_id=level_id
        )
        
        return jsonify({
            'success': True,
            'session_id': session.id,
            'message': 'Session started successfully'
        })
        
    except Exception as e:
        logger.error(f"Error starting session: {str(e)}")
        return jsonify({'success': False, 'error': 'Failed to start session'}), 500

@levels_bp.route('/api/session/end', methods=['POST'])
@login_required
def end_session():
    """API endpoint to end a learning session and award XP."""
    try:
        from app.models.session import Session
        
        data = request.get_json()
        session_id = data.get('session_id')
        score = data.get('score')
        
        if not session_id:
            return jsonify({'success': False, 'error': 'Session ID is required'}), 400
        
        # End session and award XP
        session = Session.end_session(session_id, score)
        
        return jsonify({
            'success': True,
            'session_id': session.id,
            'score': session.score,
            'time_spent': session.time_spent,
            'xp_awarded': session.get_xp_awarded(),
            'xp_calculation': session.get_xp_calculation_details(),
            'message': 'Session completed successfully'
        })
        
    except Exception as e:
        logger.error(f"Error ending session: {str(e)}")
        return jsonify({'success': False, 'error': 'Failed to end session'}), 500

@levels_bp.route('/api/sessions', methods=['GET'])
@login_required
def get_user_sessions():
    """API endpoint to get user's learning sessions."""
    try:
        from app.models.session import Session
        
        # Get pagination parameters
        limit = min(int(request.args.get('limit', 20)), 100)
        offset = int(request.args.get('offset', 0))
        
        # Get user's sessions
        sessions = Session.get_user_sessions(current_user.id, limit=limit, offset=offset)
        
        return jsonify({
            'success': True,
            'sessions': [session.to_dict() for session in sessions],
            'pagination': {
                'limit': limit,
                'offset': offset,
                'has_more': len(sessions) == limit
            }
        })
        
    except DatabaseError as e:
        logger.error(f"Database error in get_user_sessions: {str(e)}")
        return jsonify({'success': False, 'error': 'Database error occurred'}), 500
    except Exception as e:
        logger.error(f"Unexpected error in get_user_sessions: {str(e)}")
        return jsonify({'success': False, 'error': 'Internal server error'}), 500

@levels_bp.route('/api/analytics', methods=['POST'])
@login_required
def log_analytics():
    """API endpoint to log user actions for analytics (simplified)."""
    return jsonify({'success': True, 'message': 'Analytics logged'})

@levels_bp.route('/api/level/<int:level_id>/new-session', methods=['POST'])
@login_required
def start_new_level_session(level_id):
    """API endpoint to start a new session for a level (simplified)."""
    return jsonify({
        'success': True,
        'level_id': level_id,
        'attempts': 1,
        'message': 'New session started'
    })

# Initialize levels from database when module is imported
# This ensures CYBERSECURITY_LEVELS is populated for compatibility
try:
    get_levels_from_db()
except Exception as e:
    logger.error(f"Failed to initialize levels from database: {str(e)}")
    # Continue with empty CYBERSECURITY_LEVELS - will use fallback when needed
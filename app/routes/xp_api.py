"""
XP API Endpoints
Provides dedicated API endpoints for XP calculation, awarding, and management
Based on the XPCalculator and XPManager utilities
"""
from flask import Blueprint, request, jsonify, current_app
from flask_login import login_required, current_user
from app.database import DatabaseError
from app.utils.xp import XPCalculator, XPManager
import logging

logger = logging.getLogger(__name__)

xp_api_bp = Blueprint('xp_api', __name__, url_prefix='/api/xp')


@xp_api_bp.route('/calculate', methods=['POST'])
@login_required
def calculate_xp():
    """
    Calculate XP for a given performance (preview calculation)
    Does not award XP, just shows what would be earned
    """
    try:
        data = request.get_json()
        
        # Required parameters
        level_id = data.get('level_id')
        if level_id is None:
            return jsonify({
                'success': False,
                'error': 'level_id is required'
            }), 400
        
        # Optional parameters with defaults
        score = data.get('score')  # 0-100
        time_spent = data.get('time_spent')  # seconds
        difficulty = data.get('difficulty', 'medium')
        
        # Validate score if provided
        if score is not None and (not isinstance(score, (int, float)) or score < 0 or score > 100):
            return jsonify({
                'success': False,
                'error': 'score must be a number between 0 and 100'
            }), 400
        
        # Validate time_spent if provided
        if time_spent is not None and (not isinstance(time_spent, (int, float)) or time_spent < 0):
            return jsonify({
                'success': False,
                'error': 'time_spent must be a non-negative number'
            }), 400
        
        # Calculate XP
        xp_calculation = XPCalculator.calculate_level_xp(
            level_id=int(level_id),
            score=int(score) if score is not None else None,
            time_spent=int(time_spent) if time_spent is not None else None,
            difficulty=difficulty
        )
        
        return jsonify({
            'success': True,
            'calculation': xp_calculation
        })
        
    except ValueError as e:
        logger.error(f"Validation error in calculate_xp: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400
        
    except Exception as e:
        logger.error(f"Unexpected error in calculate_xp: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to calculate XP'
        }), 500


@xp_api_bp.route('/award', methods=['POST'])
@login_required
def award_xp():
    """
    Award XP to the current user for level completion
    """
    try:
        data = request.get_json()
        
        # Required parameters
        level_id = data.get('level_id')
        if level_id is None:
            return jsonify({
                'success': False,
                'error': 'level_id is required'
            }), 400
        
        # Optional parameters
        score = data.get('score')  # 0-100
        time_spent = data.get('time_spent')  # seconds
        difficulty = data.get('difficulty', 'medium')
        session_id = data.get('session_id')
        reason = data.get('reason', 'level_completion')
        
        # Validate score if provided
        if score is not None and (not isinstance(score, (int, float)) or score < 0 or score > 100):
            return jsonify({
                'success': False,
                'error': 'score must be a number between 0 and 100'
            }), 400
        
        # Validate time_spent if provided
        if time_spent is not None and (not isinstance(time_spent, (int, float)) or time_spent < 0):
            return jsonify({
                'success': False,
                'error': 'time_spent must be a non-negative number'
            }), 400
        
        # Award XP to current user
        result = XPManager.award_xp(
            user_id=current_user.id,
            level_id=int(level_id),
            score=int(score) if score is not None else None,
            time_spent=int(time_spent) if time_spent is not None else None,
            difficulty=difficulty,
            session_id=int(session_id) if session_id is not None else None,
            reason=reason
        )
        
        return jsonify({
            'success': True,
            'result': result
        })
        
    except ValueError as e:
        logger.error(f"Validation error in award_xp: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400
        
    except DatabaseError as e:
        logger.error(f"Database error in award_xp: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Database error occurred'
        }), 500
        
    except Exception as e:
        logger.error(f"Unexpected error in award_xp: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to award XP'
        }), 500


@xp_api_bp.route('/session/award', methods=['POST'])
@login_required
def award_session_xp():
    """
    Award XP for a session completion (levels or Blue Team vs Red Team Mode)
    """
    try:
        data = request.get_json()
        
        # Required parameters
        session_name = data.get('session_name')
        if not session_name:
            return jsonify({
                'success': False,
                'error': 'session_name is required'
            }), 400
        
        # Optional parameters
        score = data.get('score')  # 0-100
        time_spent = data.get('time_spent')  # seconds
        level_id = data.get('level_id')  # None for non-level sessions
        session_id = data.get('session_id')
        reason = data.get('reason', 'session_completion')
        
        # Validate score if provided
        if score is not None and (not isinstance(score, (int, float)) or score < 0 or score > 100):
            return jsonify({
                'success': False,
                'error': 'score must be a number between 0 and 100'
            }), 400
        
        # Validate time_spent if provided
        if time_spent is not None and (not isinstance(time_spent, (int, float)) or time_spent < 0):
            return jsonify({
                'success': False,
                'error': 'time_spent must be a non-negative number'
            }), 400
        
        # Award session XP to current user
        result = XPManager.award_session_xp(
            user_id=current_user.id,
            session_name=session_name,
            score=int(score) if score is not None else None,
            time_spent=int(time_spent) if time_spent is not None else None,
            level_id=int(level_id) if level_id is not None else None,
            session_id=int(session_id) if session_id is not None else None,
            reason=reason
        )
        
        return jsonify({
            'success': True,
            'result': result
        })
        
    except ValueError as e:
        logger.error(f"Validation error in award_session_xp: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400
        
    except DatabaseError as e:
        logger.error(f"Database error in award_session_xp: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Database error occurred'
        }), 500
        
    except Exception as e:
        logger.error(f"Unexpected error in award_session_xp: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to award session XP'
        }), 500


@xp_api_bp.route('/history', methods=['GET'])
@login_required
def get_xp_history():
    """
    Get user's XP history
    """
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
        logger.error(f"Database error in get_xp_history: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Database error occurred'
        }), 500
        
    except Exception as e:
        logger.error(f"Unexpected error in get_xp_history: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to get XP history'
        }), 500


@xp_api_bp.route('/user-level', methods=['GET'])
@login_required
def get_user_level():
    """
    Get user's current level information based on total XP
    """
    try:
        # Get user's total XP
        user_total_xp = getattr(current_user, 'total_xp', None) or 0
        
        # Calculate level information
        level_info = XPManager.get_user_level(user_total_xp)
        
        return jsonify({
            'success': True,
            'total_xp': user_total_xp,
            'level_info': level_info
        })
        
    except Exception as e:
        logger.error(f"Unexpected error in get_user_level: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to get user level'
        }), 500


@xp_api_bp.route('/leaderboard', methods=['GET'])
@login_required
def get_leaderboard():
    """
    Get XP leaderboard
    """
    try:
        # Get limit parameter
        limit = min(int(request.args.get('limit', 10)), 50)
        
        # Get leaderboard
        leaderboard = XPManager.get_leaderboard(limit=limit)
        
        return jsonify({
            'success': True,
            'leaderboard': leaderboard
        })
        
    except DatabaseError as e:
        logger.error(f"Database error in get_leaderboard: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Database error occurred'
        }), 500
        
    except Exception as e:
        logger.error(f"Unexpected error in get_leaderboard: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to get leaderboard'
        }), 500


@xp_api_bp.route('/config', methods=['GET'])
@login_required
def get_xp_config():
    """
    Get XP calculation configuration from backend
    Returns the same configuration used by XPCalculator for frontend consistency
    """
    try:
        # Get expected times using the same method as XPCalculator
        expected_times = {}
        for difficulty in ['easy', 'medium', 'hard', 'expert']:
            expected_times[difficulty] = XPCalculator._get_expected_time(1, difficulty)  # level_id doesn't affect base times
        
        config = {
            'base_xp': XPCalculator.BASE_XP.copy(),
            'score_multipliers': XPCalculator.SCORE_MULTIPLIERS.copy(),
            'time_bonus_thresholds': XPCalculator.TIME_BONUS_THRESHOLDS.copy(),
            'expected_times': expected_times,
            'first_time_bonus': 25  # Standard first-time bonus
        }
        
        return jsonify({
            'success': True,
            'config': config
        })
        
    except Exception as e:
        logger.error(f"Unexpected error in get_xp_config: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to get XP configuration'
        }), 500


@xp_api_bp.route('/recalculate', methods=['POST'])
@login_required
def recalculate_user_xp():
    """
    Recalculate user's total XP from history (admin/debug function)
    """
    try:
        # Recalculate XP for current user
        result = XPManager.recalculate_user_total_xp(current_user.id)
        
        return jsonify({
            'success': True,
            'result': result
        })
        
    except DatabaseError as e:
        logger.error(f"Database error in recalculate_user_xp: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Database error occurred'
        }), 500
        
    except Exception as e:
        logger.error(f"Unexpected error in recalculate_user_xp: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to recalculate XP'
        }), 500


# Error handlers
@xp_api_bp.errorhandler(404)
def not_found(error):
    return jsonify({
        'success': False,
        'error': 'Endpoint not found'
    }), 404


@xp_api_bp.errorhandler(405)
def method_not_allowed(error):
    return jsonify({
        'success': False,
        'error': 'Method not allowed'
    }), 405


@xp_api_bp.errorhandler(500)
def internal_error(error):
    return jsonify({
        'success': False,
        'error': 'Internal server error'
    }), 500
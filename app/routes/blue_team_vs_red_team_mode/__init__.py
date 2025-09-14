# Blue Team vs Red Team Mode Routes
from flask import Blueprint, render_template, request, jsonify, session, redirect, url_for
from flask_login import login_required, current_user
from app.models.xp_history import XPHistory
from app.database import DatabaseError
import json
import logging
from datetime import datetime

# Create blueprint
blue_team_vs_red_team = Blueprint('blue_team_vs_red_team', __name__, url_prefix='/blue-vs-red')

# Set up logging
logger = logging.getLogger(__name__)

@blue_team_vs_red_team.route('/')
@login_required
def introduction():
    """Introduction page for Blue Team vs Red Team mode"""
    try:
        return render_template('blue-team-vs-red-team-mode/introduction.html')
    except Exception as e:
        logger.error(f"Error rendering introduction: {str(e)}")
        return render_template('error.html', 
                             error_message="Unable to load Blue vs Red Team introduction"), 500

@blue_team_vs_red_team.route('/tutorial')
@login_required
def tutorial():
    """Tutorial page for Blue Team vs Red Team mode"""
    try:
        return render_template('blue-team-vs-red-team-mode/tutorial.html')
    except Exception as e:
        logger.error(f"Error rendering tutorial: {str(e)}")
        return render_template('error.html', 
                             error_message="Unable to load Blue vs Red Team tutorial"), 500

@blue_team_vs_red_team.route('/dashboard')
@login_required
def dashboard():
    """Main dashboard for Blue Team vs Red Team simulation"""
    try:
        # Initialize default game state if not exists
        if 'blue_vs_red_game_state' not in session:
            session['blue_vs_red_game_state'] = {
                'isRunning': False,
                'timeRemaining': 900,  # 15 minutes
                'assets': {
                    'academy-server': {'status': 'secure', 'integrity': 100},
                    'student-db': {'status': 'secure', 'integrity': 100},
                    'research-files': {'status': 'secure', 'integrity': 100},
                    'learning-platform': {'status': 'secure', 'integrity': 100}
                },
                'alerts': [],
                'incidents': [],
                'securityControls': {
                    'firewall': {'active': True, 'effectiveness': 80},
                    'endpoint': {'active': True, 'effectiveness': 75},
                    'access': {'active': True, 'effectiveness': 85}
                },
                'aiDifficulty': 'Normal',  # Default difficulty
                'currentPhase': 'reconnaissance',
                'currentXP': 0,
                'sessionXP': 0,
                'attacksMitigated': 0,
                'attacksSuccessful': 0
            }
            session.permanent = True
        
        return render_template('blue-team-vs-red-team-mode/dashboard.html')
    except Exception as e:
        logger.error(f"Error rendering dashboard: {str(e)}")
        return render_template('error.html', 
                             error_message="Unable to load Blue vs Red Team dashboard"), 500

@blue_team_vs_red_team.route('/api/game-state', methods=['GET'])
@login_required
def get_game_state():
    """Get current game state"""
    try:
        # Get game state from session or initialize default
        game_state = session.get('blue_vs_red_game_state', {
            'isRunning': False,
            'timeRemaining': 900,  # 15 minutes
            'assets': {
                'academy-server': {'status': 'secure', 'integrity': 100},
                'student-db': {'status': 'secure', 'integrity': 100},
                'research-files': {'status': 'secure', 'integrity': 100},
                'learning-platform': {'status': 'secure', 'integrity': 100}
            },
            'alerts': [],
            'incidents': [],
            'securityControls': {
                'firewall': {'active': True, 'effectiveness': 80},
                'endpoint': {'active': True, 'effectiveness': 75},
                'access': {'active': True, 'effectiveness': 85}
            },
            'aiDifficulty': 'Normal',
            'currentPhase': 'reconnaissance',
            'currentXP': 0,
            'sessionXP': 0,
            'attacksMitigated': 0,
            'attacksSuccessful': 0
        })
        
        return jsonify(game_state)
    
    except Exception as e:
        logger.error(f"Error getting game state: {str(e)}")
        return jsonify({'error': 'Failed to get game state'}), 500

@blue_team_vs_red_team.route('/api/game-state', methods=['POST'])
@login_required
def update_game_state():
    """Update game state"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Update session with new game state
        session['blue_vs_red_game_state'] = data
        session.permanent = True
        
        return jsonify({'success': True, 'message': 'Game state updated'})
    
    except Exception as e:
        logger.error(f"Error updating game state: {str(e)}")
        return jsonify({'error': 'Failed to update game state'}), 500

@blue_team_vs_red_team.route('/api/start-game', methods=['POST'])
@login_required
def start_game():
    """Start a new game session"""
    try:
        # Initialize new game state
        initial_state = {
            'isRunning': True,
            'timeRemaining': 900,
            'startTime': datetime.now().isoformat(),
            'assets': {
                'academy-server': {'status': 'secure', 'integrity': 100},
                'student-db': {'status': 'secure', 'integrity': 100},
                'research-files': {'status': 'secure', 'integrity': 100},
                'learning-platform': {'status': 'secure', 'integrity': 100}
            },
            'alerts': [],
            'incidents': [],
            'securityControls': {
                'firewall': {'active': True, 'effectiveness': 80},
                'endpoint': {'active': True, 'effectiveness': 75},
                'access': {'active': True, 'effectiveness': 85}
            },
            'aiDifficulty': 'Normal',
            'currentPhase': 'reconnaissance',
            'playerActions': [],
            'aiActions': [],
            'currentXP': 0,
            'sessionXP': 0,
            'attacksMitigated': 0,
            'attacksSuccessful': 0
        }
        
        session['blue_vs_red_game_state'] = initial_state
        session.permanent = True
        
        # Log game start
        logger.info(f"User {current_user.username} started Blue vs Red Team simulation")
        
        return jsonify({
            'success': True,
            'message': 'Game started successfully',
            'gameState': initial_state
        })
    
    except Exception as e:
        logger.error(f"Error starting game: {str(e)}")
        return jsonify({'error': 'Failed to start game'}), 500

@blue_team_vs_red_team.route('/api/stop-game', methods=['POST'])
@login_required
def stop_game():
    """Stop current game session and award final XP bonus"""
    try:
        game_state = session.get('blue_vs_red_game_state', {})
        
        if game_state.get('isRunning'):
            game_state['isRunning'] = False
            game_state['endTime'] = datetime.now().isoformat()
            
            # Calculate and award completion bonus XP
            completion_bonus = calculate_completion_bonus(game_state)
            if completion_bonus > 0:
                game_state['sessionXP'] = game_state.get('sessionXP', 0) + completion_bonus
                
                # Record completion bonus in database
                try:
                    # Get current user's XP balance
                    current_balance = getattr(current_user, 'total_xp', None) or 0
                    new_balance = current_balance + completion_bonus
                    
                    # Create XP history entry for completion bonus
                    xp_entry = XPHistory.create_entry(
                        user_id=current_user.id,
                        xp_change=completion_bonus,
                        reason='blue_team_completion',
                        level_id=None,
                        balance_before=current_balance,
                        balance_after=new_balance
                    )
                    
                    # Update user's total XP
                    current_user.total_xp = new_balance
                    current_user.save()
                    
                except Exception as db_error:
                    logger.error(f"Error recording completion bonus: {str(db_error)}")
                    # Don't fail the stop game if XP recording fails
            
            session['blue_vs_red_game_state'] = game_state
            session.permanent = True
            
            # Log game stop
            logger.info(f"User {current_user.username} stopped Blue vs Red Team simulation. Session XP: {game_state.get('sessionXP', 0)}")
        
        return jsonify({
            'success': True,
            'message': 'Game stopped successfully',
            'gameState': game_state,
            'completion_bonus': completion_bonus if 'completion_bonus' in locals() else 0
        })
    
    except Exception as e:
        logger.error(f"Error stopping game: {str(e)}")
        return jsonify({'error': 'Failed to stop game'}), 500

@blue_team_vs_red_team.route('/api/reset-game', methods=['POST'])
@login_required
def reset_game():
    """Reset game to initial state"""
    try:
        # Clear game state from session
        session.pop('blue_vs_red_game_state', None)
        
        # Log game reset
        logger.info(f"User {current_user.username} reset Blue vs Red Team simulation")
        
        return jsonify({
            'success': True,
            'message': 'Game reset successfully'
        })
    
    except Exception as e:
        logger.error(f"Error resetting game: {str(e)}")
        return jsonify({'error': 'Failed to reset game'}), 500

@blue_team_vs_red_team.route('/api/player-action', methods=['POST'])
@login_required
def player_action():
    """Record a player action and award XP for successful mitigation"""
    try:
        data = request.get_json()
        
        if not data or 'action' not in data:
            return jsonify({'error': 'Action data required'}), 400
        
        game_state = session.get('blue_vs_red_game_state', {})
        
        if not game_state.get('isRunning'):
            return jsonify({'error': 'Game is not running'}), 400
        
        # Record player action
        action = {
            'timestamp': datetime.now().isoformat(),
            'type': data['action'],
            'target': data.get('target'),
            'parameters': data.get('parameters', {}),
            'effectiveness': data.get('effectiveness', 0),
            'successful': data.get('successful', False)
        }
        
        if 'playerActions' not in game_state:
            game_state['playerActions'] = []
        
        game_state['playerActions'].append(action)
        
        # Award XP for successful defensive actions
        xp_awarded = 0
        if action.get('successful', False):
            xp_awarded = calculate_action_xp(action)
            if xp_awarded > 0:
                game_state['sessionXP'] = game_state.get('sessionXP', 0) + xp_awarded
                game_state['attacksMitigated'] = game_state.get('attacksMitigated', 0) + 1
                
                # Record XP in database
                try:
                    # Get current user's XP balance
                    current_balance = getattr(current_user, 'total_xp', None) or 0
                    new_balance = current_balance + xp_awarded
                    
                    # Create XP history entry
                    xp_entry = XPHistory.create_entry(
                        user_id=current_user.id,
                        xp_change=xp_awarded,
                        reason='blue_team_defense',
                        level_id=None,
                        balance_before=current_balance,
                        balance_after=new_balance
                    )
                    
                    # Update user's total XP
                    current_user.total_xp = new_balance
                    current_user.save()
                    
                except Exception as db_error:
                    logger.error(f"Error recording XP: {str(db_error)}")
                    # Don't fail the entire action if XP recording fails
        
        # Update session
        session['blue_vs_red_game_state'] = game_state
        session.permanent = True
        
        return jsonify({
            'success': True,
            'message': 'Player action recorded',
            'action': action,
            'xpAwarded': xp_awarded,
            'reason': f"Defensive action: {data['action']}",
            'total_session_xp': game_state.get('sessionXP', 0)
        })
    
    except Exception as e:
        logger.error(f"Error recording player action: {str(e)}")
        return jsonify({'error': 'Failed to record player action'}), 500

@blue_team_vs_red_team.route('/api/ai-action', methods=['POST'])
@login_required
def ai_action():
    """Record an AI action and handle integrity changes for critical/high severity actions"""
    try:
        data = request.get_json()
        
        if not data or 'action' not in data:
            return jsonify({'error': 'Action data required'}), 400
        
        game_state = session.get('blue_vs_red_game_state', {})
        
        if not game_state.get('isRunning'):
            return jsonify({'error': 'Game is not running'}), 400
        
        # Record AI action
        action = {
            'timestamp': datetime.now().isoformat(),
            'type': data['action'],
            'technique': data.get('technique'),
            'target': data.get('target'),
            'severity': data.get('severity', 'medium'),
            'detected': data.get('detected', False),
            'successful': data.get('successful', False)
        }
        
        if 'aiActions' not in game_state:
            game_state['aiActions'] = []
        
        game_state['aiActions'].append(action)
        
        # Handle integrity changes for critical/high severity actions
        if action['severity'] in ['critical', 'high'] and action.get('successful', False):
            target_asset = action.get('target')
            if target_asset and target_asset in game_state.get('assets', {}):
                # Calculate integrity loss based on severity
                integrity_loss = 15 if action['severity'] == 'critical' else 10
                current_integrity = game_state['assets'][target_asset].get('integrity', 100)
                new_integrity = max(0, current_integrity - integrity_loss)
                
                game_state['assets'][target_asset]['integrity'] = new_integrity
                game_state['assets'][target_asset]['status'] = 'compromised' if new_integrity < 80 else 'secure'
                
                # Track successful attacks
                game_state['attacksSuccessful'] = game_state.get('attacksSuccessful', 0) + 1
                
                # Deduct XP for failed defense (optional penalty)
                xp_penalty = 5 if action['severity'] == 'critical' else 3
                game_state['sessionXP'] = max(0, game_state.get('sessionXP', 0) - xp_penalty)
                
                # Record XP penalty in database
                try:
                    # Get current user's XP balance
                    current_balance = getattr(current_user, 'total_xp', None) or 0
                    new_balance = max(0, current_balance - xp_penalty)
                    
                    # Create XP history entry for penalty
                    xp_entry = XPHistory.create_entry(
                        user_id=current_user.id,
                        xp_change=-xp_penalty,
                        reason='blue_team_failure',
                        level_id=None,
                        balance_before=current_balance,
                        balance_after=new_balance
                    )
                    
                    # Update user's total XP
                    current_user.total_xp = new_balance
                    current_user.save()
                    
                except Exception as db_error:
                    logger.error(f"Error recording XP penalty: {str(db_error)}")
                    # Don't fail the entire action if XP recording fails
        
        # Update session
        session['blue_vs_red_game_state'] = game_state
        session.permanent = True
        
        return jsonify({
            'success': True,
            'message': 'AI action recorded',
            'action': action,
            'integrity_impact': action['severity'] in ['critical', 'high'] and action.get('successful', False)
        })
    
    except Exception as e:
        logger.error(f"Error recording AI action: {str(e)}")
        return jsonify({'error': 'Failed to record AI action'}), 500

@blue_team_vs_red_team.route('/api/game-results', methods=['GET'])
@login_required
def get_game_results():
    """Get game results and statistics"""
    try:
        game_state = session.get('blue_vs_red_game_state', {})
        
        if not game_state:
            return jsonify({'error': 'No game data found'}), 404
        
        # Calculate statistics
        player_actions = game_state.get('playerActions', [])
        ai_actions = game_state.get('aiActions', [])
        
        stats = {
            'gameDuration': calculate_game_duration(game_state),
            'totalPlayerActions': len(player_actions),
            'totalAIActions': len(ai_actions),
            'attacksDetected': len([a for a in ai_actions if a.get('detected')]),
            'attacksSuccessful': len([a for a in ai_actions if a.get('successful')]),
            'attacksMitigated': game_state.get('attacksMitigated', 0),
            'assetIntegrity': calculate_asset_integrity(game_state.get('assets', {})),
            'detectionRate': calculate_detection_rate(ai_actions),
            'responseTime': calculate_avg_response_time(player_actions, ai_actions),
            'finalScore': calculate_final_score(game_state),
            'sessionXP': game_state.get('sessionXP', 0),
            'xpPerAction': round(game_state.get('sessionXP', 0) / max(1, len(player_actions)), 1)
        }
        
        return jsonify({
            'success': True,
            'gameState': game_state,
            'statistics': stats
        })
    
    except Exception as e:
        logger.error(f"Error getting game results: {str(e)}")
        return jsonify({'error': 'Failed to get game results'}), 500

@blue_team_vs_red_team.route('/api/xp-status', methods=['GET'])
@login_required
def get_xp_status():
    """Get current XP status for the session"""
    try:
        game_state = session.get('blue_vs_red_game_state', {})
        
        return jsonify({
            'success': True,
            'currentXP': current_user.total_xp or 0,
            'sessionXP': game_state.get('sessionXP', 0),
            'userTotalXP': current_user.total_xp or 0,
            'attacksMitigated': game_state.get('attacksMitigated', 0),
            'attacksSuccessful': game_state.get('attacksSuccessful', 0)
        })
    
    except Exception as e:
        logger.error(f"Error getting XP status: {str(e)}")
        return jsonify({'error': 'Failed to get XP status'}), 500

def calculate_game_duration(game_state):
    """Calculate game duration in seconds"""
    start_time = game_state.get('startTime')
    end_time = game_state.get('endTime')
    
    if not start_time:
        return 0
    
    if not end_time:
        end_time = datetime.now().isoformat()
    
    try:
        start = datetime.fromisoformat(start_time)
        end = datetime.fromisoformat(end_time)
        return int((end - start).total_seconds())
    except:
        return 0

def calculate_asset_integrity(assets):
    """Calculate average asset integrity"""
    if not assets:
        return 100
    
    total_integrity = sum(asset.get('integrity', 100) for asset in assets.values())
    return round(total_integrity / len(assets), 1)

def calculate_detection_rate(ai_actions):
    """Calculate detection rate as percentage"""
    if not ai_actions:
        return 0
    
    detected = len([a for a in ai_actions if a.get('detected')])
    return round((detected / len(ai_actions)) * 100, 1)

def calculate_avg_response_time(player_actions, ai_actions):
    """Calculate average response time in seconds"""
    # Simplified calculation - in a real implementation, this would be more sophisticated
    return round(len(player_actions) * 2.5, 1) if player_actions else 0

def calculate_final_score(game_state):
    """Calculate final game score"""
    asset_integrity = calculate_asset_integrity(game_state.get('assets', {}))
    time_remaining = game_state.get('timeRemaining', 0)
    ai_actions = game_state.get('aiActions', [])
    detection_rate = calculate_detection_rate(ai_actions)
    
    # Score calculation: asset integrity (40%) + time bonus (30%) + detection rate (30%)
    score = (asset_integrity * 0.4) + (min(time_remaining / 9, 100) * 0.3) + (detection_rate * 0.3)
    return round(score, 1)

def calculate_action_xp(action):
    """Calculate XP reward for a successful defensive action"""
    base_xp = {
        'block-ip': 10,
        'isolate-asset': 15,
        'increase-monitoring': 5,
        'patch-vulnerability': 20,
        'reset-credentials': 8,
        'firewall-rule': 12,
        'endpoint-quarantine': 18,
        'access-revoke': 10
    }
    
    action_type = action.get('type', '')
    effectiveness = action.get('effectiveness', 0)
    
    # Base XP for the action type
    xp = base_xp.get(action_type, 5)
    
    # Effectiveness multiplier (0.5x to 1.5x based on effectiveness)
    effectiveness_multiplier = 0.5 + (effectiveness / 100)
    
    return int(xp * effectiveness_multiplier)

def calculate_completion_bonus(game_state):
    """Calculate XP bonus for completing the simulation"""
    # Base completion bonus
    base_bonus = 25
    
    # Bonus factors
    asset_integrity = calculate_asset_integrity(game_state.get('assets', {}))
    time_remaining = game_state.get('timeRemaining', 0)
    attacks_mitigated = game_state.get('attacksMitigated', 0)
    attacks_successful = game_state.get('attacksSuccessful', 0)
    
    # Calculate bonus multipliers
    integrity_bonus = (asset_integrity / 100) * 20  # Up to 20 bonus XP
    time_bonus = min(time_remaining / 900, 1) * 15   # Up to 15 bonus XP for time remaining
    defense_ratio = attacks_mitigated / max(1, attacks_mitigated + attacks_successful)
    defense_bonus = defense_ratio * 10               # Up to 10 bonus XP for defense ratio
    
    total_bonus = base_bonus + integrity_bonus + time_bonus + defense_bonus
    return int(total_bonus)

# Error handlers for the blueprint
@blue_team_vs_red_team.errorhandler(404)
def not_found_error(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@blue_team_vs_red_team.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

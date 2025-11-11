"""
NLP-Enhanced Red Team AI Backend
Provides advanced natural language processing for attack pattern analysis
"""

from flask import Blueprint, jsonify, request
from flask_login import login_required
import logging
import json
from datetime import datetime

# Create blueprint
red_team_nlp_api = Blueprint('red_team_nlp_api', __name__, url_prefix='/api/red-team-nlp')

# Set up logging
logger = logging.getLogger(__name__)

# MITRE ATT&CK technique database (simplified version)
MITRE_TECHNIQUES = {
    'T1595': {'tactic': 'reconnaissance', 'name': 'Active Scanning', 'severity': 'low'},
    'T1592': {'tactic': 'reconnaissance', 'name': 'Gather Victim Host Information', 'severity': 'low'},
    'T1590': {'tactic': 'reconnaissance', 'name': 'Gather Victim Network Information', 'severity': 'low'},
    'T1566': {'tactic': 'initial-access', 'name': 'Phishing', 'severity': 'medium'},
    'T1190': {'tactic': 'initial-access', 'name': 'Exploit Public-Facing Application', 'severity': 'high'},
    'T1133': {'tactic': 'initial-access', 'name': 'External Remote Services', 'severity': 'medium'},
    'T1547': {'tactic': 'persistence', 'name': 'Boot or Logon Autostart Execution', 'severity': 'medium'},
    'T1053': {'tactic': 'persistence', 'name': 'Scheduled Task/Job', 'severity': 'medium'},
    'T1543': {'tactic': 'persistence', 'name': 'Create or Modify System Process', 'severity': 'medium'},
    'T1055': {'tactic': 'privilege-escalation', 'name': 'Process Injection', 'severity': 'high'},
    'T1134': {'tactic': 'privilege-escalation', 'name': 'Access Token Manipulation', 'severity': 'high'},
    'T1068': {'tactic': 'privilege-escalation', 'name': 'Exploitation for Privilege Escalation', 'severity': 'critical'},
    'T1070': {'tactic': 'defense-evasion', 'name': 'Indicator Removal on Host', 'severity': 'medium'},
    'T1036': {'tactic': 'defense-evasion', 'name': 'Masquerading', 'severity': 'medium'},
    'T1003': {'tactic': 'credential-access', 'name': 'OS Credential Dumping', 'severity': 'critical'},
    'T1110': {'tactic': 'credential-access', 'name': 'Brute Force', 'severity': 'high'},
    'T1056': {'tactic': 'credential-access', 'name': 'Input Capture', 'severity': 'high'},
    'T1082': {'tactic': 'discovery', 'name': 'System Information Discovery', 'severity': 'low'},
    'T1087': {'tactic': 'discovery', 'name': 'Account Discovery', 'severity': 'low'},
    'T1046': {'tactic': 'discovery', 'name': 'Network Service Scanning', 'severity': 'medium'},
    'T1021': {'tactic': 'lateral-movement', 'name': 'Remote Services', 'severity': 'high'},
    'T1534': {'tactic': 'lateral-movement', 'name': 'Internal Spearphishing', 'severity': 'high'},
    'T1570': {'tactic': 'lateral-movement', 'name': 'Lateral Tool Transfer', 'severity': 'medium'},
    'T1005': {'tactic': 'collection', 'name': 'Data from Local System', 'severity': 'high'},
    'T1113': {'tactic': 'collection', 'name': 'Screen Capture', 'severity': 'medium'},
    'T1123': {'tactic': 'collection', 'name': 'Audio Capture', 'severity': 'medium'},
    'T1560': {'tactic': 'exfiltration', 'name': 'Archive Collected Data', 'severity': 'high'},
    'T1041': {'tactic': 'exfiltration', 'name': 'Exfiltration Over C2 Channel', 'severity': 'critical'},
    'T1020': {'tactic': 'exfiltration', 'name': 'Automated Exfiltration', 'severity': 'critical'},
    'T1485': {'tactic': 'impact', 'name': 'Data Destruction', 'severity': 'critical'},
    'T1491': {'tactic': 'impact', 'name': 'Defacement', 'severity': 'high'},
    'T1498': {'tactic': 'impact', 'name': 'Network Denial of Service', 'severity': 'critical'},
}


@red_team_nlp_api.route('/analyze-context', methods=['POST'])
@login_required
def analyze_context():
    """
    Analyze game context using NLP techniques
    Returns recommended attack patterns based on current defensive posture
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Extract game state information
        game_state = data.get('gameState', {})
        current_phase = data.get('currentPhase', 'reconnaissance')
        completed_phases = data.get('completedPhases', [])
        
        # Perform NLP-style analysis
        context_analysis = analyze_defensive_context(game_state)
        
        # Get recommended techniques
        recommended_techniques = get_optimal_techniques(
            current_phase,
            context_analysis,
            completed_phases
        )
        
        # Calculate success probabilities
        success_metrics = calculate_success_metrics(
            recommended_techniques,
            context_analysis
        )
        
        return jsonify({
            'success': True,
            'context_analysis': context_analysis,
            'recommended_techniques': recommended_techniques,
            'success_metrics': success_metrics,
            'timestamp': datetime.now().isoformat()
        })
    
    except Exception as e:
        logger.error(f"Error in NLP context analysis: {str(e)}")
        return jsonify({'error': 'Failed to analyze context'}), 500


@red_team_nlp_api.route('/technique-info/<technique_id>', methods=['GET'])
@login_required
def get_technique_info(technique_id):
    """
    Get detailed information about a specific MITRE ATT&CK technique
    """
    try:
        if technique_id not in MITRE_TECHNIQUES:
            return jsonify({'error': 'Technique not found'}), 404
        
        technique = MITRE_TECHNIQUES[technique_id]
        
        return jsonify({
            'success': True,
            'technique_id': technique_id,
            'technique': technique,
            'mitre_url': f'https://attack.mitre.org/techniques/{technique_id}/'
        })
    
    except Exception as e:
        logger.error(f"Error getting technique info: {str(e)}")
        return jsonify({'error': 'Failed to get technique info'}), 500


@red_team_nlp_api.route('/training-feedback', methods=['POST'])
@login_required
def receive_training_feedback():
    """
    Receive feedback from the AI to improve NLP recommendations
    This endpoint can be used for future machine learning enhancements
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Log training feedback for future model improvements
        feedback = {
            'timestamp': datetime.now().isoformat(),
            'predicted_success': data.get('predictedSuccess'),
            'actual_success': data.get('actualSuccess'),
            'technique_used': data.get('techniqueUsed'),
            'context': data.get('context'),
            'reward': data.get('reward')
        }
        
        # In a production system, this would be stored in a database for ML training
        logger.info(f"Training feedback received: {json.dumps(feedback)}")
        
        return jsonify({
            'success': True,
            'message': 'Feedback recorded for future improvements'
        })
    
    except Exception as e:
        logger.error(f"Error recording training feedback: {str(e)}")
        return jsonify({'error': 'Failed to record feedback'}), 500


# Helper functions

def analyze_defensive_context(game_state):
    """
    Analyze the defensive posture of the system
    """
    assets = game_state.get('assets', {})
    controls = game_state.get('securityControls', {})
    alerts = game_state.get('alerts', [])
    
    # Calculate defensive metrics
    avg_asset_integrity = sum(asset.get('integrity', 100) for asset in assets.values()) / max(len(assets), 1)
    
    active_controls = sum(1 for control in controls.values() if control.get('active', False))
    total_controls = len(controls)
    
    avg_control_effectiveness = sum(
        control.get('effectiveness', 0) for control in controls.values() if control.get('active', False)
    ) / max(active_controls, 1)
    
    # Identify vulnerabilities using keyword analysis
    vulnerabilities = []
    
    if avg_control_effectiveness < 50:
        vulnerabilities.append('weak_security_controls')
    
    if not controls.get('firewall', {}).get('active', False):
        vulnerabilities.append('firewall_disabled')
    elif controls.get('firewall', {}).get('effectiveness', 0) < 50:
        vulnerabilities.append('weak_firewall')
    
    if not controls.get('endpoint', {}).get('active', False):
        vulnerabilities.append('endpoint_disabled')
    elif controls.get('endpoint', {}).get('effectiveness', 0) < 50:
        vulnerabilities.append('weak_endpoint')
    
    if not controls.get('access', {}).get('active', False):
        vulnerabilities.append('access_control_disabled')
    elif controls.get('access', {}).get('effectiveness', 0) < 50:
        vulnerabilities.append('weak_access_control')
    
    if avg_asset_integrity < 90:
        vulnerabilities.append('compromised_assets')
    
    if len(alerts) == 0:
        vulnerabilities.append('no_monitoring')
    
    return {
        'defensive_strength': avg_control_effectiveness,
        'asset_integrity': avg_asset_integrity,
        'active_controls_ratio': active_controls / max(total_controls, 1),
        'alert_level': len(alerts),
        'vulnerabilities': vulnerabilities,
        'overall_posture': calculate_overall_posture(avg_control_effectiveness, avg_asset_integrity)
    }


def calculate_overall_posture(control_effectiveness, asset_integrity):
    """
    Calculate overall defensive posture
    """
    combined_score = (control_effectiveness + asset_integrity) / 2
    
    if combined_score >= 80:
        return 'strong'
    elif combined_score >= 50:
        return 'moderate'
    else:
        return 'weak'


def get_optimal_techniques(current_phase, context_analysis, completed_phases):
    """
    Get optimal attack techniques based on context
    """
    # Filter techniques by current phase
    phase_techniques = [
        {'id': tid, **technique}
        for tid, technique in MITRE_TECHNIQUES.items()
        if technique['tactic'] == current_phase
    ]
    
    # Score techniques based on vulnerabilities
    scored_techniques = []
    for technique in phase_techniques:
        score = 50  # Base score
        
        # Increase score based on relevant vulnerabilities
        if 'weak_firewall' in context_analysis['vulnerabilities']:
            if technique['id'] in ['T1595', 'T1046', 'T1190']:
                score += 20
        
        if 'weak_endpoint' in context_analysis['vulnerabilities']:
            if technique['id'] in ['T1055', 'T1543', 'T1113']:
                score += 20
        
        if 'weak_access_control' in context_analysis['vulnerabilities']:
            if technique['id'] in ['T1110', 'T1134', 'T1021']:
                score += 20
        
        if 'compromised_assets' in context_analysis['vulnerabilities']:
            if technique['id'] in ['T1005', 'T1560', 'T1041']:
                score += 15
        
        # Adjust based on defensive posture
        if context_analysis['overall_posture'] == 'weak':
            score += 15
        elif context_analysis['overall_posture'] == 'strong':
            score -= 10
        
        scored_techniques.append({
            **technique,
            'score': score,
            'contextual_fit': min(score / 100, 1.0)
        })
    
    # Return top 3 techniques
    scored_techniques.sort(key=lambda x: x['score'], reverse=True)
    return scored_techniques[:3]


def calculate_success_metrics(techniques, context_analysis):
    """
    Calculate success probability for recommended techniques
    """
    if not techniques:
        return {'overall_probability': 0, 'confidence': 0}
    
    # Calculate weighted success probability
    avg_score = sum(t['score'] for t in techniques) / len(techniques)
    vulnerability_bonus = len(context_analysis['vulnerabilities']) * 0.05
    
    overall_probability = min(0.95, (avg_score / 100) + vulnerability_bonus)
    
    # Calculate confidence based on context clarity
    confidence = 0.7 + (len(context_analysis['vulnerabilities']) * 0.05)
    confidence = min(0.95, confidence)
    
    return {
        'overall_probability': round(overall_probability, 3),
        'confidence': round(confidence, 3),
        'vulnerability_count': len(context_analysis['vulnerabilities']),
        'defensive_posture': context_analysis['overall_posture']
    }


# Error handlers
@red_team_nlp_api.errorhandler(404)
def not_found_error(error):
    return jsonify({'error': 'Endpoint not found'}), 404


@red_team_nlp_api.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

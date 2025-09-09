from flask import Blueprint, render_template, current_app, flash, redirect, url_for, request, session, jsonify
from flask_login import login_required, current_user
from app.database import DatabaseError
import json
import logging

logger = logging.getLogger(__name__)

levels_bp = Blueprint('levels', __name__, url_prefix='/levels')

# Define all levels with their metadata
CYBERSECURITY_LEVELS = [
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
    },
    {
        'id': 2,
        'name': 'Shadow in the Inbox',
        'description': 'Spot phishing attempts and practice safe email protocols.',
        'difficulty': 'Beginner',
        'xp_reward': 150,
        'icon': 'bi-envelope-exclamation',
        'category': 'Email Security',
        'estimated_time': '20 minutes',
        'skills': ['Phishing Detection', 'Email Analysis', 'Social Engineering'],
        'unlocked': True,
        'coming_soon': False
    },
    {
        'id': 3,
        'name': 'Malware Mayhem',
        'description': 'Isolate infections and perform digital cleanup during a gaming tournament.',
        'difficulty': 'Intermediate',
        'xp_reward': 200,
        'icon': 'bi-bug',
        'category': 'Threat Detection',
        'estimated_time': '25 minutes',
        'skills': ['Malware Recognition', 'System Security', 'Threat Analysis'],
        'unlocked': True,
        'coming_soon': False
    },
    {
        'id': 4,
        'name': 'The White Hat Test',
        'description': 'Practice ethical hacking and responsible vulnerability disclosure.',
        'difficulty': 'Expert',
        'xp_reward': 350,
        'icon': 'bi-terminal',
        'category': 'Ethical Hacking',
        'estimated_time': '30 minutes',
        'skills': ['Penetration Testing', 'Vulnerability Assessment', 'Ethical Hacking'],
        'unlocked': True,
        'coming_soon': False
    },
    {
        'id': 5,
        'name': 'The Hunt for The Null',
        'description': 'Final mission: Use advanced digital forensics to expose The Null\'s identity.',
        'difficulty': 'Master',
        'xp_reward': 500,
        'icon': 'bi-trophy',
        'category': 'Digital Forensics',
        'estimated_time': '40 minutes',
        'skills': ['Digital Forensics', 'Evidence Analysis', 'Advanced Investigation'],
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
        'js/simulated-pc/desktop-components/activity-emitter-base.js',
        'js/simulated-pc/desktop-components/application-launcher.js',
        'js/simulated-pc/desktop-components/application-registry.js',
        'js/simulated-pc/desktop-components/desktop-icons.js',
        'js/simulated-pc/desktop-components/taskbar.js',
        'js/simulated-pc/desktop-components/shutdown-modal.js',
        'js/simulated-pc/desktop-components/skip-dialogue-modal.js',
        'js/simulated-pc/desktop-components/skip-tutorial-modal.js',
        
        # Shared utilities
        'js/simulated-pc/desktop-components/shared-utils/navigation-util.js',
        
        # Base dialogue and tutorial systems
        'js/simulated-pc/dialogues/base-dialogue.js',
        'js/simulated-pc/dialogues/dialogue-manager.js',
        'js/simulated-pc/dialogues/dialogue-integration.js',
        'js/simulated-pc/tutorials/base-tutorial.js',
        'js/simulated-pc/tutorials/tutorial-manager.js',
        'js/simulated-pc/tutorials/tutorial-registry.js',
        'js/simulated-pc/tutorials/tutorial-step-manager.js',
        'js/simulated-pc/tutorials/tutorial-interaction-manager.js',
        'js/simulated-pc/tutorials/adaptive-tutorial-manager.js',
        
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
            'js/simulated-pc/levels/level-one/dialogues/challenge1-dialogue.js',
            'js/simulated-pc/levels/level-one/dialogues/level-completion-dialogue.js',
            
            # Tutorials for Level 1
            'js/simulated-pc/tutorials/initial-tutorial.js',
            'js/simulated-pc/tutorials/browser-tutorial.js',
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
            
            # Tutorials for Level 2
            'js/simulated-pc/tutorials/email-tutorial.js',
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
            
            # Level 3 malware definitions and processes (moved to level-three)
            'js/simulated-pc/levels/level-three/malware/base-malware.js',
            'js/simulated-pc/levels/level-three/malware/gaming-optimizer-ransomware.js',
            'js/simulated-pc/levels/level-three/malware/performance-monitor-spyware.js',
            'js/simulated-pc/levels/level-three/malware/steam-helper-trojan.js',
            'js/simulated-pc/levels/level-three/malware/system-optimizer-rootkit.js',
            
            'js/simulated-pc/levels/level-three/processes/application-processes.js',
            'js/simulated-pc/levels/level-three/processes/base-process.js',
            'js/simulated-pc/levels/level-three/processes/gaming-processes.js',
            'js/simulated-pc/levels/level-three/processes/malware-processes.js',
            'js/simulated-pc/levels/level-three/processes/process-factory.js',
            'js/simulated-pc/levels/level-three/processes/system-processes.js',
            
            # Malware Scanner Application (core Level 3 app)
            'js/simulated-pc/desktop-components/desktop-applications/malware-scanner-app.js',
            'js/simulated-pc/desktop-components/desktop-applications/malware-scanner-functions/malware-database.js',
            'js/simulated-pc/desktop-components/desktop-applications/malware-scanner-functions/malware-scanner-actions.js',
            'js/simulated-pc/desktop-components/desktop-applications/malware-scanner-functions/malware-scanner-activity-emitter.js',
            'js/simulated-pc/desktop-components/desktop-applications/malware-scanner-functions/malware-scanner-event-handler.js',
            'js/simulated-pc/desktop-components/desktop-applications/malware-scanner-functions/malware-scanner-ui-manager.js',
            'js/simulated-pc/desktop-components/desktop-applications/malware-scanner-functions/quarantine-manager.js',
            'js/simulated-pc/desktop-components/desktop-applications/malware-scanner-functions/scan-engine.js',
            
            # Process Monitor Application (core Level 3 app)
            'js/simulated-pc/desktop-components/desktop-applications/process-monitor-app.js',
            'js/simulated-pc/desktop-components/desktop-applications/process-monitor-functions/notification-manager.js',
            'js/simulated-pc/desktop-components/desktop-applications/process-monitor-functions/process-data-manager.js',
            'js/simulated-pc/desktop-components/desktop-applications/process-monitor-functions/process-event-handler.js',
            'js/simulated-pc/desktop-components/desktop-applications/process-monitor-functions/process-monitor-activity-emitter.js',
            'js/simulated-pc/desktop-components/desktop-applications/process-monitor-functions/process-renderer.js',
            'js/simulated-pc/desktop-components/desktop-applications/process-monitor-functions/process-sorter.js',
            
            # Ransomware Decryptor Application (core Level 3 app for recovery)
            'js/simulated-pc/desktop-components/desktop-applications/ransomware-decryptor-app.js',
            'js/simulated-pc/desktop-components/desktop-applications/ransomware-decryptor-functions/ransomware-decryptor-activity-emitter.js',
            
            # Tutorials for Level 3
            'js/simulated-pc/tutorials/malware-scanner-tutorial.js',
            'js/simulated-pc/tutorials/process-monitor-tutorial.js',
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
            
            # Level 4 nmap target hosts (moved to level-four)
            'js/simulated-pc/levels/level-four/nmap-target-hosts/base-target-host.js',
            'js/simulated-pc/levels/level-four/nmap-target-hosts/municipality-network.js',
            'js/simulated-pc/levels/level-four/nmap-target-hosts/target-host-registry.js',
            'js/simulated-pc/levels/level-four/nmap-target-hosts/vote-admin-server.js',
            'js/simulated-pc/levels/level-four/nmap-target-hosts/vote-database-server.js',
            'js/simulated-pc/levels/level-four/nmap-target-hosts/vote-main-server.js',
            
            # Level 4 terminal commands (moved to level-four)
            'js/simulated-pc/levels/level-four/terminal-commands/base-command.js',
            'js/simulated-pc/levels/level-four/terminal-commands/cat-command.js',
            'js/simulated-pc/levels/level-four/terminal-commands/cd-command.js',
            'js/simulated-pc/levels/level-four/terminal-commands/clear-command.js',
            'js/simulated-pc/levels/level-four/terminal-commands/date-command.js',
            'js/simulated-pc/levels/level-four/terminal-commands/echo-command.js',
            'js/simulated-pc/levels/level-four/terminal-commands/find-command.js',
            'js/simulated-pc/levels/level-four/terminal-commands/grep-command.js',
            'js/simulated-pc/levels/level-four/terminal-commands/help-command.js',
            'js/simulated-pc/levels/level-four/terminal-commands/history-command.js',
            'js/simulated-pc/levels/level-four/terminal-commands/ls-command.js',
            'js/simulated-pc/levels/level-four/terminal-commands/nmap-command.js',
            'js/simulated-pc/levels/level-four/terminal-commands/ping-command.js',
            'js/simulated-pc/levels/level-four/terminal-commands/pwd-command.js',
            'js/simulated-pc/levels/level-four/terminal-commands/uname-command.js',
            'js/simulated-pc/levels/level-four/terminal-commands/whoami-command.js',
            
            # Level 4 vulnerability scanner targets (moved to level-four)
            'js/simulated-pc/levels/level-four/vulnerability-scanner-targets/index.js',
            'js/simulated-pc/levels/level-four/vulnerability-scanner-targets/web-target-base.js',
            'js/simulated-pc/levels/level-four/vulnerability-scanner-targets/municipality-voting/index.js',
            'js/simulated-pc/levels/level-four/vulnerability-scanner-targets/municipality-voting/municipality-voting-group.js',
            'js/simulated-pc/levels/level-four/vulnerability-scanner-targets/municipality-voting/vote-admin-target.js',
            'js/simulated-pc/levels/level-four/vulnerability-scanner-targets/municipality-voting/vote-api-target.js',
            'js/simulated-pc/levels/level-four/vulnerability-scanner-targets/municipality-voting/vote-database-target.js',
            'js/simulated-pc/levels/level-four/vulnerability-scanner-targets/municipality-voting/vote-portal-target.js',
            
            # Vulnerability Scanner Application (core Level 4 app)
            'js/simulated-pc/desktop-components/desktop-applications/vulnerability-scanner-app.js',
            'js/simulated-pc/desktop-components/desktop-applications/vulnerability-scanner-functions/nmap-integration-utility.js',
            'js/simulated-pc/desktop-components/desktop-applications/vulnerability-scanner-functions/vulnerability-report-generator.js',
            'js/simulated-pc/desktop-components/desktop-applications/vulnerability-scanner-functions/vulnerability-scanner-data-manager.js',
            'js/simulated-pc/desktop-components/desktop-applications/vulnerability-scanner-functions/vulnerability-scanner-event-handler.js',
            'js/simulated-pc/desktop-components/desktop-applications/vulnerability-scanner-functions/vulnerability-scanner-logic.js',
            'js/simulated-pc/desktop-components/desktop-applications/vulnerability-scanner-functions/vulnerability-scanner-notification-manager.js',
            'js/simulated-pc/desktop-components/desktop-applications/vulnerability-scanner-functions/vulnerability-scanner-tab-manager.js',
            'js/simulated-pc/desktop-components/desktop-applications/vulnerability-scanner-functions/vulnerability-scanner-ui-renderer.js',
            'js/simulated-pc/desktop-components/desktop-applications/vulnerability-scanner-functions/vulnerability-scanner-ui.js',
            'js/simulated-pc/desktop-components/desktop-applications/vulnerability-scanner-functions/vulnerability-scanner.js',
            'js/simulated-pc/desktop-components/desktop-applications/vulnerability-scanner-functions/web-target-registry.js',
            
            # Terminal Application (core Level 4 app)
            'js/simulated-pc/desktop-components/desktop-applications/terminal-app.js',
            'js/simulated-pc/desktop-components/desktop-applications/terminal-functions/command-history.js',
            'js/simulated-pc/desktop-components/desktop-applications/terminal-functions/command-processor.js',
            'js/simulated-pc/desktop-components/desktop-applications/terminal-functions/command-registry.js',
            'js/simulated-pc/desktop-components/desktop-applications/terminal-functions/file-system.js',
            'js/simulated-pc/desktop-components/desktop-applications/terminal-functions/tab-completion.js',
            
            # Tutorials for Level 4
            'js/simulated-pc/tutorials/vulnerability-scanner-tutorial.js',
            'js/simulated-pc/tutorials/terminal-tutorial.js',
        ]
    
    elif level_id == 5:
        # Level 5: The Hunt for The Null - Advanced digital forensics
        level_specific_files = [
            # Level 5 configuration and data
            'js/simulated-pc/levels/level-five/level-config.js',
            'js/simulated-pc/levels/level-five/apps/index.js',
            'js/simulated-pc/levels/level-five/data/index.js',
            
            # Level 5 dialogues
            'js/simulated-pc/levels/level-five/dialogues/index.js',
            'js/simulated-pc/levels/level-five/dialogues/level5-hunt-for-the-null.js',
            
            # Level 5 special features
            'js/simulated-pc/levels/level-five/evidence-tracker.js',
            'js/simulated-pc/levels/level-five/scoring-system.js',
            
            # Level 5 directories (moved to level-five)
            'js/simulated-pc/levels/level-five/directories/base-directory.js',
            'js/simulated-pc/levels/level-five/directories/desktop-directory.js',
            'js/simulated-pc/levels/level-five/directories/directory-registry.js',
            'js/simulated-pc/levels/level-five/directories/documents-directory.js',
            'js/simulated-pc/levels/level-five/directories/downloads-directory.js',
            'js/simulated-pc/levels/level-five/directories/evidence-directory.js',
            'js/simulated-pc/levels/level-five/directories/home-directory.js',
            'js/simulated-pc/levels/level-five/directories/logs-directory.js',
            'js/simulated-pc/levels/level-five/directories/pictures-directory.js',
            
            # Level 5 files (moved to level-five)
            'js/simulated-pc/levels/level-five/files/base-file.js',
            
            # Level 5 documents files
            'js/simulated-pc/levels/level-five/files/documents/documents-files.js',
            'js/simulated-pc/levels/level-five/files/documents/incident-report.js',
            'js/simulated-pc/levels/level-five/files/documents/security-report.js',
            'js/simulated-pc/levels/level-five/files/documents/training-notes.js',
            
            # Level 5 downloads files
            'js/simulated-pc/levels/level-five/files/downloads-files/downloads-files.js',
            'js/simulated-pc/levels/level-five/files/downloads-files/installer-deb.js',
            'js/simulated-pc/levels/level-five/files/downloads-files/malware-sample.js',
            'js/simulated-pc/levels/level-five/files/downloads-files/network-diagram.js',
            'js/simulated-pc/levels/level-five/files/downloads-files/profile-photo.js',
            
            # Level 5 evidence files
            'js/simulated-pc/levels/level-five/files/evidence/evidence-files.js',
            
            # Level 5 home files
            'js/simulated-pc/levels/level-five/files/home/bashrc-file.js',
            'js/simulated-pc/levels/level-five/files/home/home-files.js',
            'js/simulated-pc/levels/level-five/files/home/readme-file.js',
            'js/simulated-pc/levels/level-five/files/home/security-audit.js',
            'js/simulated-pc/levels/level-five/files/home/suspicious-file.js',
            'js/simulated-pc/levels/level-five/files/home/system-screenshot.js',
            
            # Level 5 log files
            'js/simulated-pc/levels/level-five/files/logs/application-debug.js',
            'js/simulated-pc/levels/level-five/files/logs/auth-failures.js',
            'js/simulated-pc/levels/level-five/files/logs/firewall-blocks.js',
            'js/simulated-pc/levels/level-five/files/logs/logs-files.js',
            'js/simulated-pc/levels/level-five/files/logs/network-traffic.js',
            'js/simulated-pc/levels/level-five/files/logs/security-events.js',
            'js/simulated-pc/levels/level-five/files/logs/system-access.js',
            
            # File Manager Application (core Level 5 app)
            'js/simulated-pc/desktop-components/desktop-applications/file-manager-app.js',
            'js/simulated-pc/desktop-components/desktop-applications/file-manager-functions/file-navigator.js',
            'js/simulated-pc/desktop-components/desktop-applications/file-manager-functions/file-opener.js',
            'js/simulated-pc/desktop-components/desktop-applications/file-manager-functions/file-type-detector.js',
            'js/simulated-pc/desktop-components/desktop-applications/file-manager-functions/file-viewer.js',
            'js/simulated-pc/desktop-components/desktop-applications/file-manager-functions/viewer-factory.js',
            'js/simulated-pc/desktop-components/desktop-applications/file-manager-functions/window-tracker.js',
            
            # File Viewer Applications (for file types)
            'js/simulated-pc/desktop-components/desktop-applications/file-viewer-apps/text-viewer-app.js',
            'js/simulated-pc/desktop-components/desktop-applications/file-viewer-apps/log-viewer-app.js',
            'js/simulated-pc/desktop-components/desktop-applications/file-viewer-apps/image-viewer-app.js',
            'js/simulated-pc/desktop-components/desktop-applications/file-viewer-apps/pdf-viewer-app.js',
            'js/simulated-pc/desktop-components/desktop-applications/file-viewer-apps/executable-viewer-app.js',
            
            # System Logs Application (core Level 5 app)
            'js/simulated-pc/desktop-components/desktop-applications/system-logs-app.js',
            'js/simulated-pc/desktop-components/desktop-applications/system-logs-functions/activity-monitor.js',
            'js/simulated-pc/desktop-components/desktop-applications/system-logs-functions/log-filter.js',
            'js/simulated-pc/desktop-components/desktop-applications/system-logs-functions/log-manager.js',
            'js/simulated-pc/desktop-components/desktop-applications/system-logs-functions/log-renderer.js',
            'js/simulated-pc/desktop-components/desktop-applications/system-logs-functions/log-ui.js',
            
            # Terminal Application (shared with Level 4)
            'js/simulated-pc/desktop-components/desktop-applications/terminal-app.js',
            'js/simulated-pc/desktop-components/desktop-applications/terminal-functions/command-history.js',
            'js/simulated-pc/desktop-components/desktop-applications/terminal-functions/command-processor.js',
            'js/simulated-pc/desktop-components/desktop-applications/terminal-functions/command-registry.js',
            'js/simulated-pc/desktop-components/desktop-applications/terminal-functions/file-system.js',
            'js/simulated-pc/desktop-components/desktop-applications/terminal-functions/tab-completion.js',
            
            # Tutorials for Level 5
            'js/simulated-pc/levels/level-five/tutorials/level5-forensics-tutorial.js',
            'js/simulated-pc/tutorials/file-manager-tutorial.js',
            'js/simulated-pc/tutorials/terminal-tutorial.js',
        ]
    
    return core_files + level_specific_files

@levels_bp.route('/')
@login_required
def levels_overview():
    """Display all cybersecurity levels."""
    try:
        # Simple level display without user progress tracking
        enhanced_levels = []
        for level in CYBERSECURITY_LEVELS:
            level_data = level.copy()
            # Add basic progress structure for template compatibility
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
        
        # Basic user stats for template compatibility
        user_stats = {
            'total_levels': len(CYBERSECURITY_LEVELS),
            'completed_levels': 0,
            'total_xp': 0,
            'completion_percentage': 0
        }
        
        return render_template('levels/levels.html', 
                             levels=enhanced_levels, 
                             user_stats=user_stats)
                             
    except Exception as e:
        logger.error(f"Error loading levels overview: {e}")
        flash('Error loading level data. Please try again.', 'error')
        return render_template('levels/levels.html', 
                             levels=CYBERSECURITY_LEVELS, 
                             user_stats={
                                 'total_levels': 5,
                                 'completed_levels': 0,
                                 'total_xp': 0,
                                 'completion_percentage': 0
                             })

@levels_bp.route('/<int:level_id>/start')
@login_required
def start_level(level_id):
    """Start a level."""
    level = next((l for l in CYBERSECURITY_LEVELS if l['id'] == level_id), None)
    
    if not level:
        flash('Level not found.', 'error')
        return redirect(url_for('levels.levels_overview'))
    
    try:
        # Prepare basic level data for simulation
        level_data = {
            'id': level['id'],
            'name': level['name'],
            'description': level['description'],
            'category': level['category'],
            'difficulty': level['difficulty'],
            'skills': level['skills'],
            'is_retry': False,
            'previous_attempts': 0,
            'previous_score': 0,
            'previous_status': 'not_started'
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

@levels_bp.route('/api/complete/<int:level_id>', methods=['POST'])
@login_required
def complete_level(level_id):
    """API endpoint to mark a level as completed (simplified)."""
    level = next((l for l in CYBERSECURITY_LEVELS if l['id'] == level_id), None)
    if not level:
        return jsonify({'success': False, 'error': 'Level not found'}), 404
    
    data = request.get_json() or {}
    score = data.get('score', 100)
    
    return jsonify({
        'success': True,
        'level_completed': level_id,
        'xp_earned': level['xp_reward'],
        'score': score,
        'total_xp': 0,
        'completed_levels': 0,
        'completion_percentage': 0,
        'message': 'Level completed successfully'
    })

@levels_bp.route('/api/progress', methods=['GET'])
@login_required
def get_user_progress():
    """API endpoint to get user progress data (simplified)."""
    return jsonify({
        'success': True,
        'stats': {
            'total_levels': len(CYBERSECURITY_LEVELS),
            'completed_levels': 0,
            'total_xp': 0,
            'completion_percentage': 0
        }
    })

@levels_bp.route('/api/level/<int:level_id>/progress', methods=['POST'])
@login_required
def update_level_progress(level_id):
    """API endpoint to update level progress during gameplay (simplified)."""
    level = next((l for l in CYBERSECURITY_LEVELS if l['id'] == level_id), None)
    if not level:
        return jsonify({'success': False, 'error': 'Level not found'}), 404
    
    return jsonify({'success': True, 'message': 'Progress updated'})

@levels_bp.route('/api/analytics', methods=['POST'])
@login_required
def log_analytics():
    """API endpoint to log user actions for analytics (simplified)."""
    return jsonify({'success': True, 'message': 'Analytics logged'})

@levels_bp.route('/api/level/2/email-actions', methods=['POST'])
@login_required
def save_email_actions():
    """API endpoint to save Level 2 email actions (simplified)."""
    return jsonify({'success': True, 'message': 'Email actions saved'})

@levels_bp.route('/api/level/2/email-actions', methods=['GET'])
@login_required
def get_email_actions():
    """API endpoint to get Level 2 email actions (simplified)."""
    return jsonify({
        'success': True,
        'email_states': {
            'reported_phishing': [],
            'marked_legitimate': [],
            'spam_emails': [],
            'read_emails': []
        }
    })

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

@levels_bp.route('/api/level/2/session-data', methods=['POST'])
@login_required
def save_level2_session_data():
    """API endpoint to save Level 2 session data (simplified)."""
    return jsonify({'success': True, 'message': 'Session data saved'})

@levels_bp.route('/api/level/2/session-data', methods=['GET'])
@login_required
def get_level2_session_data():
    """API endpoint to get Level 2 session data (simplified)."""
    return jsonify({
        'success': True,
        'session_data': {}
    })

@levels_bp.route('/api/level/2/new-session', methods=['POST'])
@login_required
def start_new_level2_session():
    """API endpoint to start a new Level 2 session (simplified)."""
    return jsonify({'success': True, 'message': 'New session started'})
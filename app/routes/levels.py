# TODO: Add server-side tracking of level completion and XP

from flask import Blueprint, render_template, current_app, flash, redirect, url_for, request, session, jsonify
from flask_login import login_required, current_user
from app.models.user_progress import UserProgress, LearningAnalytics, SkillAssessment
from app.database import DatabaseError, handle_supabase_error
import json
import uuid
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
        'js/simulated-pc/adaptive-integration.js',
        'js/simulated-pc/adaptive-learning.js',
        
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
    """Display all cybersecurity levels with user progress."""
    try:
        # Get user progress and stats
        user_stats = UserProgress.get_user_stats(current_user.id)
        level_progress = user_stats.get('level_progress', {})
        
        # Enhance level data with user progress
        enhanced_levels = []
        for level in CYBERSECURITY_LEVELS:
            level_data = level.copy()
            level_id = level['id']
            
            # Get progress for this specific level
            progress = level_progress.get(level_id)
            if progress:
                level_data['user_progress'] = {
                    'status': progress.get('status', 'not_started'),
                    'completed': progress.get('status') == 'completed',
                    'score': progress.get('score', 0),
                    'completion_percentage': progress.get('completion_percentage', 0),
                    'xp_earned': progress.get('xp_earned', 0),
                    'time_spent': progress.get('time_spent', 0),
                    'attempts': progress.get('attempts', 0),
                    'completed_at': progress.get('completed_at'),
                    'started_at': progress.get('started_at')
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
    """Start or retry a level, maintaining existing progress."""
    level = next((l for l in CYBERSECURITY_LEVELS if l['id'] == level_id), None)
    
    if not level:
        flash('Level not found.', 'error')
        return redirect(url_for('levels.levels_overview'))
    
    try:
        # Check for existing progress
        existing_progress = UserProgress.get_level_progress(current_user.id, level_id)
        is_retry = existing_progress and existing_progress.get('status') in ['in_progress', 'completed']
        
        # Generate session ID for analytics tracking
        session_id = str(uuid.uuid4())
        session['level_session_id'] = session_id
        
        # Log level start or retry action
        action_type = 'retry' if is_retry else 'start'
        LearningAnalytics.log_action(
            user_id=current_user.id,
            session_id=session_id,
            level_id=level_id,
            action_type=action_type,
            action_data={
                'level_name': level['name'],
                'previous_attempts': existing_progress.get('attempts', 0) if existing_progress else 0,
                'previous_status': existing_progress.get('status') if existing_progress else 'new'
            }
        )
        
        # Increment attempt counter without clearing previous data
        UserProgress.increment_level_attempt(current_user.id, level_id)
        
        # Get existing progress data to maintain state
        level_progress = existing_progress or {}
        
        # Prepare level data for simulation
        level_data = {
            'id': level['id'],
            'name': level['name'],
            'description': level['description'],
            'category': level['category'],
            'difficulty': level['difficulty'],
            'skills': level['skills'],
            'session_id': session_id,
            'is_retry': is_retry,
            'previous_attempts': level_progress.get('attempts', 0),
            'previous_score': level_progress.get('score', 0),
            'previous_status': level_progress.get('status', 'not_started')
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

@levels_bp.route('/api/complete/<int:level_id>', methods=['POST'])
@login_required
def complete_level(level_id):
    """API endpoint to mark a level as completed."""
    try:
        level = next((l for l in CYBERSECURITY_LEVELS if l['id'] == level_id), None)
        if not level:
            return jsonify({'success': False, 'error': 'Level not found'}), 404
        
        # Get completion data from request
        data = request.get_json() or {}
        score = data.get('score', 100)
        time_spent = data.get('time_spent', 0)
        mistakes_made = data.get('mistakes_made', 0)
        hints_used = data.get('hints_used', 0)
        session_id = session.get('level_session_id', str(uuid.uuid4()))
        
        # Mark level as completed
        progress = UserProgress.mark_level_completed(
            user_id=current_user.id,
            level_id=level_id,
            score=score,
            xp_earned=level['xp_reward'],
            time_spent=time_spent
        )
        
        # Log completion action
        LearningAnalytics.log_action(
            user_id=current_user.id,
            session_id=session_id,
            level_id=level_id,
            action_type='complete',
            action_data={
                'score': score,
                'time_spent': time_spent,
                'mistakes_made': mistakes_made,
                'hints_used': hints_used,
                'xp_earned': level['xp_reward']
            }
        )
        
        # Update skill assessments for level skills
        if score > 0:
            for skill in level.get('skills', []):
                SkillAssessment.update_skill_assessment(
                    user_id=current_user.id,
                    skill_name=skill,
                    level_id=level_id,
                    assessment_score=score
                )
        
        # Get updated user stats
        user_stats = UserProgress.get_user_stats(current_user.id)
        
        return jsonify({
            'success': True,
            'level_completed': level_id,
            'xp_earned': level['xp_reward'],
            'score': score,
            'total_xp': user_stats.get('total_xp', 0),
            'completed_levels': user_stats.get('completed_levels', 0),
            'completion_percentage': user_stats.get('completion_percentage', 0),
            'progress_data': progress
        })
        
    except DatabaseError as e:
        logger.error(f"Database error completing level {level_id}: {e}")
        return jsonify({'success': False, 'error': 'Database error occurred'}), 500
    except Exception as e:
        logger.error(f"Unexpected error completing level {level_id}: {e}")
        return jsonify({'success': False, 'error': 'Unexpected error occurred'}), 500

@levels_bp.route('/api/progress', methods=['GET'])
@login_required
def get_user_progress():
    """API endpoint to get user progress data."""
    try:
        user_stats = UserProgress.get_user_stats(current_user.id)
        return jsonify({
            'success': True,
            'stats': user_stats
        })
    except Exception as e:
        logger.error(f"Error fetching user progress: {e}")
        return jsonify({'success': False, 'error': 'Failed to fetch progress'}), 500

@levels_bp.route('/api/level/<int:level_id>/progress', methods=['POST'])
@login_required
def update_level_progress(level_id):
    """API endpoint to update level progress during gameplay."""
    try:
        level = next((l for l in CYBERSECURITY_LEVELS if l['id'] == level_id), None)
        if not level:
            return jsonify({'success': False, 'error': 'Level not found'}), 404
        
        data = request.get_json() or {}
        session_id = session.get('level_session_id', str(uuid.uuid4()))
        
        # Get current progress to accumulate values
        current_progress = UserProgress.get_level_progress(current_user.id, level_id) or {}
        current_xp = current_progress.get('xp_earned', 0)
        
        # Update progress with accumulated values
        progress_data = {
            'status': data.get('status', 'in_progress'),
            'score': data.get('score', 0),
            'completion_percentage': data.get('completion_percentage', 0),
            'time_spent': data.get('time_spent', 0),
            'hints_used': data.get('hints_used', 0),
            'mistakes_made': data.get('mistakes_made', 0),
            'xp_earned': current_xp + data.get('xp_earned', 0)  # Accumulate XP
        }
        
        progress = UserProgress.create_or_update_progress(
            user_id=current_user.id,
            level_id=level_id,
            data=progress_data
        )
        
        # Log progress update action
        LearningAnalytics.log_action(
            user_id=current_user.id,
            session_id=session_id,
            level_id=level_id,
            action_type='progress_update',
            action_data=data
        )
        
        return jsonify({
            'success': True,
            'progress': progress
        })
        
    except Exception as e:
        logger.error(f"Error updating level progress: {e}")
        return jsonify({'success': False, 'error': 'Failed to update progress'}), 500

@levels_bp.route('/api/analytics', methods=['POST'])
@login_required
def log_analytics():
    """API endpoint to log user actions for analytics."""
    try:
        data = request.get_json() or {}
        session_id = session.get('level_session_id', str(uuid.uuid4()))
        
        LearningAnalytics.log_action(
            user_id=current_user.id,
            session_id=session_id,
            level_id=data.get('level_id'),
            action_type=data.get('action_type'),
            action_data=data.get('action_data', {})
        )
        
        return jsonify({'success': True})
        
    except Exception as e:
        logger.error(f"Error logging analytics: {e}")
        return jsonify({'success': False, 'error': 'Failed to log analytics'}), 500

# Level 2 specific API endpoints for email tracking
@levels_bp.route('/api/level/2/email-actions', methods=['POST'])
@login_required
def save_email_actions():
    """API endpoint to save Level 2 email actions (phishing reports, legitimate marks, etc.)."""
    try:
        data = request.get_json() or {}
        session_id = session.get('level_session_id', str(uuid.uuid4()))
        
        # Log the email action for analytics
        LearningAnalytics.log_action(
            user_id=current_user.id,
            session_id=session_id,
            level_id=2,
            action_type='email_action',
            action_data=data
        )
        
        return jsonify({'success': True})
        
    except Exception as e:
        logger.error(f"Error saving email actions: {e}")
        return jsonify({'success': False, 'error': 'Failed to save email actions'}), 500

@levels_bp.route('/api/level/<int:level_id>/new-session', methods=['POST'])
@login_required
def start_new_level_session(level_id):
    """API endpoint to start a new session for a level (used for retries)."""
    try:
        # Get existing progress
        existing_progress = UserProgress.get_level_progress(current_user.id, level_id)
        
        if not existing_progress:
            return jsonify({
                'success': False,
                'error': 'No existing progress found for this level',
                'started_new': False
            }), 404
        
        # Increment the attempt counter
        UserProgress.increment_level_attempt(current_user.id, level_id)
        
        # Log the retry action
        session_id = session.get('level_session_id', str(uuid.uuid4()))
        LearningAnalytics.log_action(
            user_id=current_user.id,
            session_id=session_id,
            level_id=level_id,
            action_type='retry_attempt',
            action_data={
                'previous_attempts': existing_progress.get('attempts', 0),
                'previous_status': existing_progress.get('status')
            }
        )
        
        return jsonify({
            'success': True,
            'level_id': level_id,
            'attempts': existing_progress.get('attempts', 0) + 1,
            'message': 'New session started for retry'
        })
        
    except Exception as e:
        logger.error(f"Error starting new session for level {level_id}: {e}")
        return jsonify({
            'success': False,
            'error': 'Failed to start new session',
            'details': str(e)
        }), 500

@levels_bp.route('/api/level/2/email-actions', methods=['GET'])
@login_required
def get_email_actions():
    """API endpoint to get Level 2 email actions for current user."""
    try:
        # Get all email actions for this user and level
        from app.database import get_supabase
        supabase = get_supabase()
        
        response = supabase.table('learning_analytics').select('*').eq('user_id', current_user.id).eq('level_id', 2).eq('action_type', 'email_action').execute()
        
        # Process and return the most recent actions
        actions = response.data if response.data else []
        
        # Extract email actions from the action_data
        email_states = {
            'reported_phishing': [],
            'marked_legitimate': [],
            'spam_emails': [],
            'read_emails': []
        }
        
        for action in actions:
            action_data = action.get('action_data', {})
            if 'reported_phishing' in action_data:
                email_states['reported_phishing'] = action_data['reported_phishing']
            if 'marked_legitimate' in action_data:
                email_states['marked_legitimate'] = action_data['marked_legitimate']
            if 'spam_emails' in action_data:
                email_states['spam_emails'] = action_data['spam_emails']
            if 'read_emails' in action_data:
                email_states['read_emails'] = action_data['read_emails']
        
        return jsonify({
            'success': True,
            'email_states': email_states
        })
        
    except Exception as e:
        logger.error(f"Error fetching email actions: {e}")
        return jsonify({'success': False, 'error': 'Failed to fetch email actions'}), 500

@levels_bp.route('/api/level/2/session-data', methods=['POST'])
@login_required
def save_level2_session_data():
    """API endpoint to save Level 2 session data (feedback, progress, etc.)."""
    try:
        data = request.get_json() or {}
        session_id = session.get('level_session_id', str(uuid.uuid4()))
        
        # Update level progress with session data
        progress_data = {
            'status': 'in_progress',
            'completion_percentage': data.get('completion_percentage', 0),
            'session_data': data
        }
        
        UserProgress.create_or_update_progress(
            user_id=current_user.id,
            level_id=2,
            data=progress_data
        )
        
        # Also log for analytics
        LearningAnalytics.log_action(
            user_id=current_user.id,
            session_id=session_id,
            level_id=2,
            action_type='session_data_update',
            action_data=data
        )
        
        return jsonify({'success': True})
        
    except Exception as e:
        logger.error(f"Error saving Level 2 session data: {e}")
        return jsonify({'success': False, 'error': 'Failed to save session data'}), 500

@levels_bp.route('/api/level/2/session-data', methods=['GET'])
@login_required
def get_level2_session_data():
    """API endpoint to get Level 2 session data for current user."""
    try:
        # Get current progress for Level 2
        progress = UserProgress.get_level_progress(current_user.id, 2)
        
        if progress and progress.get('session_data'):
            return jsonify({
                'success': True,
                'session_data': progress['session_data']
            })
        else:
            return jsonify({
                'success': True,
                'session_data': {}
            })
        
    except Exception as e:
        logger.error(f"Error fetching Level 2 session data: {e}")
        return jsonify({'success': False, 'error': 'Failed to fetch session data'}), 500

@levels_bp.route('/api/level/2/new-session', methods=['POST'])
@login_required
def start_new_level2_session():
    """API endpoint to start a new Level 2 session (preserving previous data)."""
    try:
        session_id = str(uuid.uuid4())
        session['level_session_id'] = session_id
        
        # Increment attempts for this level (don't clear previous data)
        UserProgress.increment_level_attempt(current_user.id, 2)
        
        # Log new session start for analytics
        LearningAnalytics.log_action(
            user_id=current_user.id,
            session_id=session_id,
            level_id=2,
            action_type='session_start',
            action_data={'attempt_type': 'new_session'}
        )
        
        logger.info(f"New Level 2 session started for user {current_user.id}")
        return jsonify({'success': True, 'session_id': session_id, 'message': 'New session started'})
        
    except Exception as e:
        logger.error(f"Error starting new Level 2 session: {e}")
        return jsonify({'success': False, 'error': 'Failed to start new session'}), 500
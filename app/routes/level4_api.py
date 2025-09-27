from flask import Blueprint, jsonify, current_app, request, session
import os
import json
import random
import traceback
from pathlib import Path
from app.utils.xp import XPCalculator
from app.models.level import Level

level4_api_bp = Blueprint('level4_api', __name__, url_prefix='/api/level4')

_json_cache = None

def load_json_data():
    """Load Level 4 CTF file system data fresh each time"""
    try:
        # Load the individual Level 4 JSON files fresh each time
        json_base_path = os.path.join(
            os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 
            'app', 'static', 'js', 'simulated-pc', 'levels', 'level-four', 'data'
        )
        
        # Load the CTF file system data
        file_path = os.path.join(json_base_path, 'ctf-file-system.json')
        
        if not os.path.exists(file_path):
            print(f"Warning: Level 4 CTF file system data not found: {file_path}")
            return {'fileSystem': {}}
                
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                ctf_data = json.load(f)
                print(f"Loaded fresh: ctf-file-system.json")
        except Exception as file_error:
            print(f"Error loading ctf-file-system.json: {file_error}")
            return {'fileSystem': {}}
        
        file_count = len(ctf_data.get('fileSystem', {}))
        
        print(f"Loaded Level 4 CTF file system data (no caching)")
        print(f"File system paths: {file_count}")
        
        return ctf_data
        
    except Exception as e:
        print(f"Error loading Level 4 CTF file system data: {e}")
        print("Traceback:")
        traceback.print_exc()
        # Return empty structure rather than None to prevent downstream errors
        return {'fileSystem': {}}

def get_random_items(array, count):
    """Get random items from an array"""
    if len(array) <= count:
        return array.copy()
    
    shuffled = array.copy()
    random.shuffle(shuffled)
    return shuffled[:count]

def filter_file_system_by_flags(file_system, selected_flags):
    """Filter file system to only show files/directories associated with selected flags"""
    
    def should_include_item(item, path=""):
        """Determine if an item should be included based on flags"""
        # Always include mission_brief.txt and basic navigation directories
        if (path.endswith("mission_brief.txt") or 
            path in ["/", "/home", "/home/researcher"] or
            item.get("always_visible", False)):
            return True
            
        # Check if item has any of the selected flags
        item_flags = item.get("flag_ids", [])
        if any(flag in selected_flags for flag in item_flags):
            return True
            
        # For directories, check if any child items should be included
        if item.get("type") == "directory" and "contents" in item:
            for child_name, child_item in item["contents"].items():
                child_path = f"{path}/{child_name}" if path else child_name
                if should_include_item(child_item, child_path):
                    return True
                    
        return False
    
    def needs_parent_directories(path, selected_flags):
        """Check if we need to include parent directories for navigation"""
        parts = path.strip('/').split('/') if path != '/' else ['']
        
        for i in range(len(parts)):
            parent_path = '/' + '/'.join(parts[:i+1]) if parts[0] else '/'
            if parent_path in file_system:
                parent_item = file_system[parent_path]
                if should_include_item(parent_item, parent_path):
                    # Include all parent directories up to this point
                    return True
        return False
    
    def filter_item(item, path=""):
        """Recursively filter an item and its contents"""
        if not should_include_item(item, path):
            return None
            
        filtered_item = item.copy()
        
        # If it's a directory, filter its contents
        if item.get("type") == "directory" and "contents" in item:
            filtered_contents = {}
            for child_name, child_item in item["contents"].items():
                child_path = f"{path}/{child_name}" if path else child_name
                filtered_child = filter_item(child_item, child_path)
                if filtered_child is not None:
                    filtered_contents[child_name] = filtered_child
            filtered_item["contents"] = filtered_contents
        
        return filtered_item
    
    # First pass: identify all paths that need to be included
    paths_to_include = set()
    
    for path, item in file_system.items():
        if should_include_item(item, path):
            paths_to_include.add(path)
            # Add parent directories for navigation
            parts = path.strip('/').split('/') if path != '/' else ['']
            for i in range(len(parts)):
                parent_path = '/' + '/'.join(parts[:i+1]) if parts[0] else '/'
                parent_path = parent_path.rstrip('/') if parent_path != '/' else '/'
                paths_to_include.add(parent_path)
    
    # Second pass: create filtered file system
    filtered_system = {}
    for path in paths_to_include:
        if path in file_system:
            filtered_item = filter_item(file_system[path], path)
            if filtered_item is not None:
                filtered_system[path] = filtered_item
    
    return filtered_system

@level4_api_bp.route('/hosts-data', methods=['GET'])
def get_level4_hosts_data():
    """Get Level 4 CTF file system data filtered by selected flags"""
    try:
        data = load_json_data()
        if not data:
            return jsonify({
                'success': False,
                'error': 'Failed to load CTF file system data',
                'fileSystem': {}
            }), 500
        
        file_system = data.get('fileSystem', {})
        
        # Get selected flags for filtering
        selected_flags = get_selected_flags()
        
        # Filter file system based on selected flags
        filtered_system = filter_file_system_by_flags(file_system, selected_flags)
        
        return jsonify({
            'success': True,
            'fileSystem': filtered_system,
            'total_paths': len(filtered_system),
            'selected_flags': selected_flags,
            'data_type': 'ctf_file_system_filtered'
        })
        
    except Exception as e:
        print(f"Error in get_level4_hosts_data: {e}")
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e),
            'fileSystem': {}
        }), 500

@level4_api_bp.route('/hosts-data-full', methods=['GET'])
def get_level4_hosts_data_full():
    """Get Level 4 CTF file system data without filtering (for debugging)"""
    try:
        data = load_json_data()
        if not data:
            return jsonify({
                'success': False,
                'error': 'Failed to load CTF file system data',
                'fileSystem': {}
            }), 500
        
        file_system = data.get('fileSystem', {})
        
        return jsonify({
            'success': True,
            'fileSystem': file_system,
            'total_paths': len(file_system),
            'data_type': 'ctf_file_system_full'
        })
        
    except Exception as e:
        print(f"Error in get_level4_hosts_data_full: {e}")
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e),
            'fileSystem': {}
        }), 500

@level4_api_bp.route('/hosts', methods=['GET'])
def get_hosts_only():
    """Get hosts data without vulnerabilities (for basic network mapping)"""
    try:
        data = load_json_data()
        if not data:
            return jsonify({
                'success': False,
                'error': 'Failed to load Level 4 data',
                'hosts': []
            }), 500
        
        hosts = data.get('level4_municipality_hosts', [])
        
        # Strip vulnerabilities for basic host info only
        basic_hosts = []
        for host in hosts:
            basic_host = {
                'hostname': host.get('hostname'),
                'ip': host.get('ip'),
                'description': host.get('description'),
                'os': host.get('os'),
                'ports': host.get('ports', {}),
                'hostType': host.get('hostType', 'single'),
                'category': host.get('category')
            }
            basic_hosts.append(basic_host)
        
        return jsonify({
            'success': True,
            'hosts': basic_hosts,
            'total_hosts': len(basic_hosts)
        })
        
    except Exception as e:
        print(f"Error in get_hosts_only: {e}")
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e),
            'hosts': []
        }), 500

@level4_api_bp.route('/vulnerabilities', methods=['GET'])
def get_vulnerabilities_data():
    """Get vulnerability data for all hosts"""
    try:
        data = load_json_data()
        if not data:
            return jsonify({
                'success': False,
                'error': 'Failed to load Level 4 data',
                'vulnerabilities': {}
            }), 500
        
        hosts = data.get('level4_municipality_hosts', [])
        all_vulnerabilities = {}
        
        for host in hosts:
            hostname = host.get('hostname')
            vulnerabilities = host.get('vulnerabilities', {})
            if vulnerabilities:
                all_vulnerabilities[hostname] = vulnerabilities
        
        return jsonify({
            'success': True,
            'vulnerabilities': all_vulnerabilities,
            'vulnerable_hosts': len(all_vulnerabilities)
        })
        
    except Exception as e:
        print(f"Error in get_vulnerabilities_data: {e}")
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e),
            'vulnerabilities': {}
        }), 500

@level4_api_bp.route('/stats', methods=['GET'])
def get_level4_stats():
    """Get Level 4 statistics"""
    try:
        data = load_json_data()
        if not data:
            return jsonify({
                'success': False,
                'error': 'Failed to load Level 4 data'
            }), 500
        
        hosts = data.get('level4_municipality_hosts', [])
        
        stats = {
            'total_hosts': len(hosts),
            'host_categories': {},
            'total_ports': 0,
            'total_vulnerabilities': 0,
            'vulnerability_types': set()
        }
        
        for host in hosts:
            # Count by category
            category = host.get('category', 'unknown')
            stats['host_categories'][category] = stats['host_categories'].get(category, 0) + 1
            
            # Count ports
            ports = host.get('ports', {})
            stats['total_ports'] += len(ports)
            
            # Count vulnerabilities
            vulnerabilities = host.get('vulnerabilities', {})
            for vuln_type, targets in vulnerabilities.items():
                stats['vulnerability_types'].add(vuln_type)
                for target, findings in targets.items():
                    stats['total_vulnerabilities'] += len(findings) if isinstance(findings, list) else 1
        
        # Convert set to list for JSON serialization
        stats['vulnerability_types'] = list(stats['vulnerability_types'])
        
        return jsonify({
            'success': True,
            'stats': stats
        })
        
    except Exception as e:
        print(f"Error in get_level4_stats: {e}")
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@level4_api_bp.route('/data-status', methods=['GET'])
def get_data_status():
    """Get Level 4 data loading status"""
    try:
        data = load_json_data()
        if not data:
            return jsonify({
                'success': False,
                'data_loaded': False,
                'error': 'Failed to load Level 4 data'
            }), 500
        
        hosts = data.get('level4_municipality_hosts', [])
        
        return jsonify({
            'success': True,
            'data_loaded': True,
            'hosts_count': len(hosts),
            'cache_status': 'loaded' if _json_cache else 'not_cached'
        })
        
    except Exception as e:
        print(f"Error in get_data_status: {e}")
        return jsonify({
            'success': False,
            'data_loaded': False,
            'error': str(e)
        }), 500

@level4_api_bp.route('/sample', methods=['GET'])
def get_sample_data():
    """Get sample Level 4 data for testing"""
    try:
        data = load_json_data()
        if not data:
            return jsonify({
                'success': False,
                'error': 'Failed to load Level 4 data',
                'sample': {}
            }), 500
        
        hosts = data.get('level4_municipality_hosts', [])
        
        # Return first host as sample
        sample_host = hosts[0] if hosts else {}
        
        return jsonify({
            'success': True,
            'sample': sample_host,
            'total_available': len(hosts)
        })
        
    except Exception as e:
        print(f"Error in get_sample_data: {e}")
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e),
            'sample': {}
        }), 500

def load_ctf_flags():
    """Load CTF flags configuration from JSON file"""
    try:
        flags_file_path = os.path.join(
            os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 
            'app', 'static', 'js', 'simulated-pc', 'levels', 'level-four', 'data', 'ctf-flags.json'
        )
        
        if not os.path.exists(flags_file_path):
            print(f"Warning: CTF flags file not found: {flags_file_path}")
            return None
            
        with open(flags_file_path, 'r', encoding='utf-8') as f:
            flags_data = json.load(f)
            print(f"Loaded fresh CTF flags configuration")
            return flags_data
            
    except Exception as e:
        print(f"Error loading CTF flags: {e}")
        return None

def get_selected_flags():
    """Get 7 randomly selected flags"""
    # Generate new random selection for each request
    flags_data = load_ctf_flags()
    if not flags_data:
        return []
    
    all_flags = list(flags_data.get('ctf_flags', {}).get('flags', {}).keys())
    flags_per_session = flags_data.get('ctf_flags', {}).get('flags_per_session', 7)
    
    # Randomly select flags for this request
    selected_flags = random.sample(all_flags, min(flags_per_session, len(all_flags)))
    
    print(f"Generated truly random flags for request: {selected_flags}")
    
    return selected_flags

@level4_api_bp.route('/validate-flag', methods=['POST'])
def validate_flag():
    """Validate a CTF flag submission"""
    try:
        # Get request data
        request_data = request.get_json()
        if not request_data:
            return jsonify({
                'success': False,
                'error': 'No data provided',
                'is_valid': False
            }), 400
        
        flag_number = request_data.get('flag_number', '').strip()
        flag_value = request_data.get('flag_value', '').strip()
        
        if not flag_number or not flag_value:
            return jsonify({
                'success': False,
                'error': 'flag_number and flag_value are required',
                'is_valid': False
            }), 400
        
        # Load flags dynamically from JSON
        flags_data = load_ctf_flags()
        if not flags_data:
            return jsonify({
                'success': False,
                'error': 'Unable to load flag configuration',
                'is_valid': False
            }), 500
        
        # Extract flag values from loaded JSON
        flags_config = flags_data.get('ctf_flags', {}).get('flags', {})
        correct_flags = {}
        for flag_id, flag_info in flags_config.items():
            correct_flags[flag_id] = flag_info.get('value', '')
        
        # Validate flag
        is_valid = False
        expected_flag = correct_flags.get(flag_number)
        
        if expected_flag and flag_value == expected_flag:
            is_valid = True
        
        response_data = {
            'success': True,
            'is_valid': is_valid,
            'flag_number': flag_number,
            'message': 'Flag validated successfully' if is_valid else 'Invalid flag value'
        }
        
        # Add flag description from loaded data if available
        if is_valid and flags_data:
            flag_info = flags_data.get('ctf_flags', {}).get('flags', {}).get(flag_number, {})
            if flag_info:
                response_data['description'] = flag_info.get('challenge_question', '')
                response_data['category'] = flag_info.get('category', '')
        
        return jsonify(response_data), 200
        
    except Exception as e:
        print(f"Error in validate_flag: {e}")
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e),
            'is_valid': False
        }), 500

@level4_api_bp.route('/flags-config', methods=['GET'])
def get_flags_config():
    """Get CTF flags configuration (without flag values for security)"""
    try:
        flags_data = load_ctf_flags()
        if not flags_data:
            return jsonify({
                'success': False,
                'error': 'Failed to load flags configuration'
            }), 500
        
        # Get selected flags for this session
        selected_flag_ids = get_selected_flags()
        
        # Return config without actual flag values for security
        ctf_config = flags_data.get('ctf_flags', {})
        safe_config = {
            'challenge_name': ctf_config.get('challenge_name', ''),
            'challenge_description': ctf_config.get('challenge_description', ''),
            'total_flags_available': ctf_config.get('total_flags_available', 15),
            'flags_per_session': ctf_config.get('flags_per_session', 7),
            'selected_flags': selected_flag_ids,
            'flags': {},
            'scoring': ctf_config.get('scoring', {}),
            'metadata': ctf_config.get('metadata', {})
        }
        
        # Include only selected flag info but exclude actual values
        all_flags = ctf_config.get('flags', {})
        for flag_id in selected_flag_ids:
            if flag_id in all_flags:
                flag_info = all_flags[flag_id]
                safe_config['flags'][flag_id] = {
                    'id': flag_info.get('id'),
                    'name': flag_info.get('name'),
                    'challenge_question': flag_info.get('challenge_question', ''),
                    'category': flag_info.get('category'),
                    'difficulty': flag_info.get('difficulty'),
                    'hints': flag_info.get('hints', []),
                    'discovery_commands': flag_info.get('discovery_commands', []),
                    'learning_objectives': flag_info.get('learning_objectives', [])
                    # Exclude 'value' for security
                }
        
        return jsonify({
            'success': True,
            'ctf_config': safe_config
        }), 200
        
    except Exception as e:
        print(f"Error in get_flags_config: {e}")
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@level4_api_bp.route('/mission-brief', methods=['GET'])
def get_mission_brief():
    """Get dynamic mission brief with current session challenges"""
    try:
        # Load flags data to get selected challenges
        flags_data = load_ctf_flags()
        selected_flag_ids = get_selected_flags()
        
        if not flags_data:
            return jsonify({
                'success': False,
                'error': 'Failed to load flags configuration'
            }), 500
        
        ctf_config = flags_data.get('ctf_flags', {})
        all_flags = ctf_config.get('flags', {})
        
        # Build dynamic mission brief content
        content_lines = [
            "THE WHITE HAT TEST - RESPONSIBLE DISCLOSURE CTF",
            "============================================",
            "",
            "MISSION BRIEFING",
            "===============",
            "",
            "Welcome, Security Researcher!",
            "",
            "You have been contracted to perform a security assessment of TechCorp's web application infrastructure.",
            "Your mission is to conduct an ethical security evaluation and provide a comprehensive responsible disclosure report.",
            "",
            "OBJECTIVES:",
            "----------",
            f"1. Discover {ctf_config.get('flags_per_session', 7)} randomly selected security flags hidden throughout the system",
            "2. Document each finding with proper evidence",
            "3. Complete the responsible disclosure report using the desktop app",
            "4. Recommend remediation steps for discovered vulnerabilities",
            "",
            "CURRENT SESSION CHALLENGES:",
            "-------------------------"
        ]
        
        # Add selected challenges dynamically
        for i, flag_id in enumerate(selected_flag_ids, 1):
            if flag_id in all_flags:
                flag_info = all_flags[flag_id]
                name = flag_info.get('name', f'Challenge {i}')
                question = flag_info.get('challenge_question', 'No question available')
                category = flag_info.get('category', 'unknown').replace('_', ' ').title()
                difficulty = flag_info.get('difficulty', 'medium').title()
                
                content_lines.extend([
                    f"{i}. {name}",
                    f"   Category: {category} | Difficulty: {difficulty}",
                    f"   Challenge: {question}",
                    ""
                ])
        
        # Add remaining static content
        content_lines.extend([
            "CHALLENGE TYPES:",
            "---------------",
            "This assessment includes various security challenges:",
            "- Environment Analysis: Hidden configuration secrets",
            "- Source Code Review: Development artifacts and comments", 
            "- Server Configuration: Misconfigurations and exposed settings",
            "- Credential Exposure: Database passwords and API keys",
            "- Privilege Escalation: SUID binaries and elevated access",
            "- Log Analysis: Security incidents and leaked information",
            "- Process Investigation: Memory dumps and runtime data",
            "- Forensic Analysis: Command history and user behavior",
            "- Network Security: Configuration and routing analysis",
            "- Cryptographic Analysis: SSL certificates and keys",
            "- Automation Security: Scripts and scheduled tasks",
            "- File System Security: Temporary files and artifacts",
            "",
            "RULES OF ENGAGEMENT:",
            "-------------------",
            "• Only use provided terminal commands",
            "• Document all findings thoroughly",
            "• Follow responsible disclosure practices",
            "• No destructive actions or data modification",
            "• Report findings through proper channels",
            ""
        ])
        
        # Dynamic assessment scope based on selected flags
        content_lines.extend([
            "ASSESSMENT SCOPE FOR THIS SESSION:",
            "----------------------------------"
        ])
        
        # Flag-to-scope mapping
        flag_scope_map = {
            'WHT-ENV': "• User environment files: /home/researcher/ (check hidden configuration files)",
            'WHT-SRC': "• Web application source: /var/www/html/ (examine HTML comments and client-side code)",
            'WHT-CFG': "• Server configurations: /etc/nginx/ (review web server settings and comments)",
            'WHT-ENV2': "• Administrator environment: /home/admin/ (investigate admin configuration files)",
            'WHT-SUID': "• System binaries: /usr/local/bin/ (analyze SUID executables and permissions)",
            'WHT-LOG': "• Application logs: /var/log/nginx/ (examine access and error logs for patterns)",
            'WHT-COMPL': "• Completion artifacts: /tmp/ (final challenge validation files)",
            'WHT-DB': "• Database configurations: /var/www/html/admin/ (check PHP config files for credentials)",
            'WHT-BACKUP': "• Backup automation: /home/admin/ (review backup scripts and processes)",
            'WHT-SSL': "• SSL certificates: /etc/ssl/private/ (analyze certificate files and keys)",
            'WHT-CRON': "• Scheduled tasks: /etc/crontab (examine system automation and job scheduling)",
            'WHT-PROC': "• Process information: /proc/1/ (investigate running process memory and environment)",
            'WHT-HIST': "• Command history: /home/admin/ (forensic analysis of user command patterns)",
            'WHT-NET': "• Network configuration: /etc/hosts (analyze network routing and host mappings)",
            'WHT-TEMP': "• Temporary files: /tmp/ (investigate debug logs and temporary artifacts)"
        }
        
        # Add scope items for selected flags
        scope_items = []
        for flag_id in selected_flag_ids:
            if flag_id in flag_scope_map:
                scope_items.append(flag_scope_map[flag_id])
        
        # Sort scope items for consistent presentation
        scope_items.sort()
        content_lines.extend(scope_items)
        
        content_lines.extend([
            "",
            "FOCUS AREAS FOR YOUR INVESTIGATION:",
            "----------------------------------"
        ])
        
        # Add specific guidance based on flag categories
        category_guidance = {
            'environment_analysis': "→ Look for hidden files (.bashrc, .env) containing environment variables",
            'source_code_review': "→ Examine HTML source code for developer comments and embedded secrets",
            'configuration_analysis': "→ Review server config files for misconfigurations and inline documentation",
            'credential_exposure': "→ Search for hardcoded passwords and API keys in configuration files",
            'privilege_escalation': "→ Check file permissions (ls -la) and analyze SUID binaries",
            'log_analysis': "→ Parse log files for suspicious patterns and embedded information",
            'disclosure_process': "→ Complete the responsible disclosure workflow and documentation",
            'script_analysis': "→ Review automation scripts for security issues and embedded credentials",
            'cryptographic_analysis': "→ Examine SSL certificates and private keys for sensitive information",
            'process_analysis': "→ Investigate process memory dumps and runtime environment data",
            'forensics': "→ Analyze command history files for evidence of past activities",
            'network_analysis': "→ Review network configuration files for internal infrastructure details",
            'file_analysis': "→ Investigate temporary directories for debug files and artifacts"
        }
        
        # Get unique categories from selected flags
        selected_categories = set()
        for flag_id in selected_flag_ids:
            if flag_id in all_flags:
                category = all_flags[flag_id].get('category', '')
                if category:
                    selected_categories.add(category)
        
        # Add guidance for selected categories
        for category in sorted(selected_categories):
            if category in category_guidance:
                content_lines.append(category_guidance[category])
        
        content_lines.extend([
            "",
            f"Your assessment begins now. Each session presents {ctf_config.get('flags_per_session', 7)} different challenges.",
            "Use the terminal commands to navigate and investigate the system systematically.",
            "Good luck, and remember - with great power comes great responsibility!",
            "",
            "Security Team Lead",
            "TechCorp Security Division"
        ])
        
        return jsonify({
            'success': True,
            'content': '\n'.join(content_lines),
            'size': len('\n'.join(content_lines))
        }), 200
        
    except Exception as e:
        print(f"Error in get_mission_brief: {e}")
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@level4_api_bp.route('/calculate-xp', methods=['POST'])
def calculate_level4_xp():
    """Calculate performance-based XP for Level 4 completion"""
    try:
        # Get request data
        request_data = request.get_json()
        if not request_data:
            return jsonify({
                'success': False,
                'error': 'No data provided'
            }), 400
        
        # Extract performance data
        score = request_data.get('score')  # Performance score (0-100)
        time_spent = request_data.get('time_spent')  # Time in seconds
        performance_metrics = request_data.get('performance_metrics', {})
        
        # Get Level 4 metadata for difficulty
        level = Level.get_by_level_id(4)
        difficulty = level.difficulty if level else 'hard'  # Level 4 is typically hard
        
        # Calculate XP using the centralized XP system
        xp_calculation = XPCalculator.calculate_level_xp(
            level_id=4,
            score=score,
            time_spent=time_spent,
            difficulty=difficulty
        )
        
        # Add Level 4 specific performance context to the response
        response_data = {
            'success': True,
            'xp_calculation': xp_calculation,
            'level_info': {
                'level_id': 4,
                'difficulty': difficulty,
                'name': 'The White Hat Test'
            },
            'performance_context': {
                'flags_found': performance_metrics.get('flags_found', 0),
                'total_flags': performance_metrics.get('total_flags', 7),
                'total_attempts': performance_metrics.get('total_attempts', 0),
                'average_attempts_per_flag': performance_metrics.get('average_attempts_per_flag', 0),
                'completion_time_minutes': performance_metrics.get('completion_time_minutes', 0),
                'efficiency_rating': performance_metrics.get('efficiency_rating', 'unknown'),
                'time_rating': performance_metrics.get('time_rating', 'unknown'),
                'categories_completed': performance_metrics.get('categories_completed', [])
            }
        }
        
        print(f"[Level4 XP] Calculated XP for Level 4:")
        print(f"  Score: {score}% | Time: {time_spent}s | Difficulty: {difficulty}")
        print(f"  XP Earned: {xp_calculation['xp_earned']} | Breakdown: {xp_calculation['breakdown']}")
        
        return jsonify(response_data), 200
        
    except Exception as e:
        print(f"Error in calculate_level4_xp: {e}")
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': 'Failed to calculate XP',
            'details': str(e)
        }), 500
from flask import Blueprint, jsonify, current_app, request
import json
import random
import os
from pathlib import Path

level3_api_bp = Blueprint('level3_api', __name__, url_prefix='/api/level3')

# Cache for JSON data to avoid reading files multiple times
_json_cache = None

def load_json_data():
    """Load and cache the Level 3 data from JSON files"""
    global _json_cache
    if _json_cache is not None:
        return _json_cache
    
    try:
        # Load the Level 3 data JSON files
        json_base_path = os.path.join(
            os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 
            'app', 'static', 'js', 'simulated-pc', 'levels', 'level-three', 'data'
        )
        
        malware_path = os.path.join(json_base_path, 'malware-data.json')
        process_path = os.path.join(json_base_path, 'process-data.json')
        encrypted_files_path = os.path.join(json_base_path, 'encrypted-files-data.json')
        
        # Check if all files exist
        if not os.path.exists(malware_path):
            print(f"Malware JSON file not found at: {malware_path}")
            return {}
        if not os.path.exists(process_path):
            print(f"Process JSON file not found at: {process_path}")
            return {}
        if not os.path.exists(encrypted_files_path):
            print(f"Encrypted files JSON file not found at: {encrypted_files_path}")
            return {}
        
        # Read all JSON files
        with open(malware_path, 'r', encoding='utf-8') as f:
            malware_data = json.load(f)
        
        with open(process_path, 'r', encoding='utf-8') as f:
            process_data = json.load(f)
        
        with open(encrypted_files_path, 'r', encoding='utf-8') as f:
            encrypted_files_data = json.load(f)
        
        # Combine all data into cache
        _json_cache = {
            'malware': malware_data,
            'processes': process_data,
            'encrypted_files': encrypted_files_data
        }
        
        malware_count = len(malware_data)
        process_count = len(process_data.get('malware', []))
        encrypted_files_count = len(encrypted_files_data.get('level3_ransomware_files', []))
        
        print(f"Loaded Level 3 data from JSON files:")
        print(f"Malware entries: {malware_count}")
        print(f"Malicious processes: {process_count}")
        print(f"Encrypted files: {encrypted_files_count}")
        
        return _json_cache
        
    except Exception as e:
        print(f"Error loading Level 3 JSON files: {e}")
        import traceback
        traceback.print_exc()
        return {}

def get_random_items(array, count):
    """Get random items from an array"""
    if len(array) <= count:
        return array.copy()
    
    shuffled = array.copy()
    random.shuffle(shuffled)
    return shuffled[:count]

@level3_api_bp.route('/game-data', methods=['GET'])
def get_level3_game_data():
    """Get randomized Level 3 game data with 5 items from each category"""
    try:
        data = load_json_data()
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'No Level 3 data available'
            }), 500
        
        # Get malware data - select 5 random items
        malware_data = data.get('malware', {})
        malware_keys = list(malware_data.keys())
        selected_malware_keys = get_random_items(malware_keys, 5)
        selected_malware = {key: malware_data[key] for key in selected_malware_keys}
        
        # Get process data - select 5 random malicious processes
        process_data = data.get('processes', {})
        malicious_processes = process_data.get('malware', [])
        selected_malicious_processes = get_random_items(malicious_processes, 5)
        
        # Combine with all legitimate processes for realistic process monitor
        all_processes = {
            'system': process_data.get('system', []),
            'gaming': process_data.get('gaming', []),
            'application': process_data.get('application', []),
            'malware': selected_malicious_processes
        }
        
        # Get encrypted files data - select 5 random files
        encrypted_files_data = data.get('encrypted_files', {})
        all_encrypted_files = encrypted_files_data.get('level3_ransomware_files', [])
        selected_encrypted_files = get_random_items(all_encrypted_files, 5)
        
        return jsonify({
            'success': True,
            'data': {
                'malware': selected_malware,
                'processes': all_processes,
                'encrypted_files': {'level3_ransomware_files': selected_encrypted_files}
            },
            'summary': {
                'malware_count': len(selected_malware),
                'malicious_processes_count': len(selected_malicious_processes),
                'encrypted_files_count': len(selected_encrypted_files),
                'legitimate_processes_count': len(process_data.get('system', [])) + 
                                           len(process_data.get('gaming', [])) + 
                                           len(process_data.get('application', [])),
                'source': 'Level 3 JSON data files with randomization'
            }
        })
        
    except Exception as e:
        print(f"Error getting Level 3 game data: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@level3_api_bp.route('/malware', methods=['GET'])
def get_malware_data():
    """Get malware data (optionally randomized)"""
    try:
        data = load_json_data()
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'No malware data available'
            }), 500
        
        malware_data = data.get('malware', {})
        
        # Check if randomization is requested
        randomize = request.args.get('randomize', 'false').lower() == 'true'
        count = int(request.args.get('count', 5))
        
        if randomize:
            malware_keys = list(malware_data.keys())
            selected_keys = get_random_items(malware_keys, count)
            selected_malware = {key: malware_data[key] for key in selected_keys}
        else:
            selected_malware = malware_data
        
        return jsonify({
            'success': True,
            'malware': selected_malware,
            'count': len(selected_malware)
        })
        
    except Exception as e:
        print(f"Error getting malware data: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@level3_api_bp.route('/processes', methods=['GET'])
def get_process_data():
    """Get process data (optionally randomized malicious processes)"""
    try:
        data = load_json_data()
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'No process data available'
            }), 500
        
        process_data = data.get('processes', {})
        
        # Check if randomization is requested for malicious processes
        randomize = request.args.get('randomize', 'false').lower() == 'true'
        count = int(request.args.get('count', 5))
        
        if randomize:
            malicious_processes = process_data.get('malware', [])
            selected_malicious = get_random_items(malicious_processes, count)
            
            # Return all legitimate processes + selected malicious ones
            result_data = {
                'system': process_data.get('system', []),
                'gaming': process_data.get('gaming', []),
                'application': process_data.get('application', []),
                'malware': selected_malicious
            }
        else:
            result_data = process_data
        
        return jsonify({
            'success': True,
            'processes': result_data,
            'summary': {
                'system_processes': len(result_data.get('system', [])),
                'gaming_processes': len(result_data.get('gaming', [])),
                'application_processes': len(result_data.get('application', [])),
                'malicious_processes': len(result_data.get('malware', []))
            }
        })
        
    except Exception as e:
        print(f"Error getting process data: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@level3_api_bp.route('/encrypted-files', methods=['GET'])
def get_encrypted_files_data():
    """Get encrypted files data (optionally randomized)"""
    try:
        data = load_json_data()
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'No encrypted files data available'
            }), 500
        
        encrypted_files_data = data.get('encrypted_files', {})
        all_files = encrypted_files_data.get('level3_ransomware_files', [])
        
        # Check if randomization is requested
        randomize = request.args.get('randomize', 'false').lower() == 'true'
        count = int(request.args.get('count', 5))
        
        if randomize:
            selected_files = get_random_items(all_files, count)
        else:
            selected_files = all_files
        
        return jsonify({
            'success': True,
            'encrypted_files': {
                'level3_ransomware_files': selected_files
            },
            'count': len(selected_files),
            'summary': {
                'critical_files': len([f for f in selected_files if f.get('priority') == 'Critical']),
                'high_files': len([f for f in selected_files if f.get('priority') == 'High']),
                'medium_files': len([f for f in selected_files if f.get('priority') == 'Medium']),
                'low_files': len([f for f in selected_files if f.get('priority') == 'Low'])
            }
        })
        
    except Exception as e:
        print(f"Error getting encrypted files data: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@level3_api_bp.route('/stats', methods=['GET'])
def get_level3_stats():
    """Get statistics about the Level 3 dataset"""
    try:
        data = load_json_data()
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'No Level 3 data available'
            }), 500
        
        malware_data = data.get('malware', {})
        process_data = data.get('processes', {})
        encrypted_files_data = data.get('encrypted_files', {})
        
        # Calculate malware statistics
        malware_types = {}
        total_reputation_damage = 0
        total_financial_damage = 0
        
        for malware in malware_data.values():
            malware_type = malware.get('type', 'Unknown')
            malware_types[malware_type] = malware_types.get(malware_type, 0) + 1
            total_reputation_damage += malware.get('reputationDamage', 0)
            total_financial_damage += malware.get('financialDamage', 0)
        
        # Calculate file statistics
        all_files = encrypted_files_data.get('level3_ransomware_files', [])
        file_priorities = {}
        total_reputation_recovery = 0
        
        for file_data in all_files:
            priority = file_data.get('priority', 'Unknown')
            file_priorities[priority] = file_priorities.get(priority, 0) + 1
            total_reputation_recovery += file_data.get('reputationRecovery', 0)
        
        return jsonify({
            'success': True,
            'stats': {
                'total_malware': len(malware_data),
                'malware_types': malware_types,
                'total_reputation_damage': total_reputation_damage,
                'total_financial_damage': total_financial_damage,
                'total_processes': {
                    'system': len(process_data.get('system', [])),
                    'gaming': len(process_data.get('gaming', [])),
                    'application': len(process_data.get('application', [])),
                    'malware': len(process_data.get('malware', []))
                },
                'total_encrypted_files': len(all_files),
                'file_priorities': file_priorities,
                'total_reputation_recovery': total_reputation_recovery,
                'source': 'Level 3 JSON data files'
            }
        })
        
    except Exception as e:
        print(f"Error getting Level 3 stats: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@level3_api_bp.route('/data-status', methods=['GET'])
def get_data_status():
    """Get status of Level 3 data loading"""
    try:
        data = load_json_data()
        
        if not data:
            return jsonify({
                'success': True,
                'data_available': False,
                'message': 'No Level 3 data available'
            })
        
        malware_count = len(data.get('malware', {}))
        process_count = len(data.get('processes', {}).get('malware', []))
        files_count = len(data.get('encrypted_files', {}).get('level3_ransomware_files', []))
        
        return jsonify({
            'success': True,
            'data_available': True,
            'malware_count': malware_count,
            'malicious_processes_count': process_count,
            'encrypted_files_count': files_count,
            'total_legitimate_processes': (
                len(data.get('processes', {}).get('system', [])) +
                len(data.get('processes', {}).get('gaming', [])) +
                len(data.get('processes', {}).get('application', []))
            ),
            'source_files': [
                'malware-data.json',
                'process-data.json', 
                'encrypted-files-data.json'
            ]
        })
        
    except Exception as e:
        print(f"Error getting Level 3 data status: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@level3_api_bp.route('/sample', methods=['GET'])
def get_sample_data():
    """Get a small sample of Level 3 data for testing purposes"""
    try:
        data = load_json_data()
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'No Level 3 data available'
            }), 500
        
        # Get small samples (2 items from each category)
        malware_data = data.get('malware', {})
        malware_keys = list(malware_data.keys())
        sample_malware_keys = get_random_items(malware_keys, 2)
        sample_malware = {key: malware_data[key] for key in sample_malware_keys}
        
        process_data = data.get('processes', {})
        sample_processes = get_random_items(process_data.get('malware', []), 2)
        
        encrypted_files_data = data.get('encrypted_files', {})
        sample_files = get_random_items(
            encrypted_files_data.get('level3_ransomware_files', []), 2
        )
        
        return jsonify({
            'success': True,
            'sample_data': {
                'malware': sample_malware,
                'malicious_processes': sample_processes,
                'encrypted_files': sample_files
            },
            'message': 'Sample Level 3 data for testing'
        })
        
    except Exception as e:
        print(f"Error getting Level 3 sample data: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
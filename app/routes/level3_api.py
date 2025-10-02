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
        
        # Check if required files exist
        if not os.path.exists(malware_path):
            print(f"Malware JSON file not found at: {malware_path}")
            return {}
        if not os.path.exists(process_path):
            print(f"Process JSON file not found at: {process_path}")
            return {}
        
        # Read required JSON files
        with open(malware_path, 'r', encoding='utf-8') as f:
            malware_data = json.load(f)
        
        with open(process_path, 'r', encoding='utf-8') as f:
            process_data = json.load(f)
        
        # Combine all data into cache
        _json_cache = {
            'malware': malware_data.get('malware', {}),
            'false_positives': malware_data.get('false_positives', {}),
            'processes': process_data
        }
        
        malware_count = len(malware_data.get('malware', {}))
        false_positive_count = len(malware_data.get('false_positives', {}))
        process_count = len(process_data.get('malware', []))
        
        print(f"Loaded Level 3 data from JSON files:")
        print(f"Malware entries: {malware_count}")
        print(f"False positive entries: {false_positive_count}")
        print(f"Malicious processes: {process_count}")
        
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
        
        # Get false positive data - select 5 random items
        false_positive_data = data.get('false_positives', {})
        false_positive_keys = list(false_positive_data.keys())
        selected_false_positive_keys = get_random_items(false_positive_keys, 5)
        selected_false_positives = {key: false_positive_data[key] for key in selected_false_positive_keys}
        
        # Get process data - select 5 random malicious processes
        process_data = data.get('processes', {})
        malicious_processes = process_data.get('malware', [])
        selected_malicious_processes = get_random_items(malicious_processes, 5)
        
        # Combine with all legitimate processes for realistic process monitor
        all_processes = {
            'system': process_data.get('system', []),
            'legitimate': process_data.get('legitimate', []),
            'malware': selected_malicious_processes
        }
        
        return jsonify({
            'success': True,
            'data': {
                'malware': selected_malware,
                'false_positives': selected_false_positives,
                'processes': all_processes
            },
            'summary': {
                'malware_count': len(selected_malware),
                'false_positive_count': len(selected_false_positives),
                'malicious_processes_count': len(selected_malicious_processes),
                'legitimate_processes_count': len(process_data.get('system', [])) + 
                                           len(process_data.get('legitimate', [])),
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
        false_positive_data = data.get('false_positives', {})
        
        # Check if randomization is requested
        randomize = request.args.get('randomize', 'false').lower() == 'true'
        count = int(request.args.get('count', 5))
        
        if randomize:
            malware_keys = list(malware_data.keys())
            selected_malware_keys = get_random_items(malware_keys, count)
            selected_malware = {key: malware_data[key] for key in selected_malware_keys}
            
            false_positive_keys = list(false_positive_data.keys())
            selected_false_positive_keys = get_random_items(false_positive_keys, count)
            selected_false_positives = {key: false_positive_data[key] for key in selected_false_positive_keys}
        else:
            selected_malware = malware_data
            selected_false_positives = false_positive_data
        
        return jsonify({
            'success': True,
            'malware': selected_malware,
            'false_positives': selected_false_positives,
            'count': len(selected_malware),
            'false_positive_count': len(selected_false_positives)
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
                'legitimate': process_data.get('legitimate', []),
                'malware': selected_malicious
            }
        else:
            result_data = process_data
        
        return jsonify({
            'success': True,
            'processes': result_data,
            'summary': {
                'system_processes': len(result_data.get('system', [])),
                'legitimate_processes': len(result_data.get('legitimate', [])),
                'malicious_processes': len(result_data.get('malware', []))
            }
        })
        
    except Exception as e:
        print(f"Error getting process data: {e}")
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
        false_positive_data = data.get('false_positives', {})
        process_data = data.get('processes', {})
        
        # Calculate malware statistics
        malware_types = {}
        total_reputation_damage = 0
        total_financial_damage = 0
        
        # Process actual malware
        for malware in malware_data.values():
            malware_type = malware.get('type', 'Unknown')
            malware_types[malware_type] = malware_types.get(malware_type, 0) + 1
            total_reputation_damage += malware.get('reputationDamage', 0)
            total_financial_damage += malware.get('financialDamage', 0)
        
        # Count false positive types separately
        false_positive_types = {}
        for fp in false_positive_data.values():
            fp_type = fp.get('type', 'Unknown')
            false_positive_types[fp_type] = false_positive_types.get(fp_type, 0) + 1
        
        return jsonify({
            'success': True,
            'stats': {
                'total_malware': len(malware_data),
                'total_false_positives': len(false_positive_data),
                'malware_types': malware_types,
                'false_positive_types': false_positive_types,
                'total_reputation_damage': total_reputation_damage,
                'total_financial_damage': total_financial_damage,
                'total_processes': {
                    'system': len(process_data.get('system', [])),
                    'legitimate': len(process_data.get('legitimate', [])),
                    'malware': len(process_data.get('malware', []))
                },
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
        false_positive_count = len(data.get('false_positives', {}))
        process_count = len(data.get('processes', {}).get('malware', []))
        
        return jsonify({
            'success': True,
            'data_available': True,
            'malware_count': malware_count,
            'false_positive_count': false_positive_count,
            'malicious_processes_count': process_count,
            'total_legitimate_processes': (
                len(data.get('processes', {}).get('system', [])) +
                len(data.get('processes', {}).get('legitimate', []))
            ),
            'source_files': [
                'malware-data.json',
                'process-data.json'
            ],
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
        
        false_positive_data = data.get('false_positives', {})
        false_positive_keys = list(false_positive_data.keys())
        sample_false_positive_keys = get_random_items(false_positive_keys, 2)
        sample_false_positives = {key: false_positive_data[key] for key in sample_false_positive_keys}
        
        process_data = data.get('processes', {})
        sample_processes = get_random_items(process_data.get('malware', []), 2)
        
        return jsonify({
            'success': True,
            'sample_data': {
                'malware': sample_malware,
                'false_positives': sample_false_positives,
                'malicious_processes': sample_processes
            },
            'message': 'Sample Level 3 data for testing'
        })
        
    except Exception as e:
        print(f"Error getting Level 3 sample data: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
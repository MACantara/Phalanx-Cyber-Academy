from flask import Blueprint, jsonify, current_app, request
import os
import json
import random
import traceback
from pathlib import Path

level4_api_bp = Blueprint('level4_api', __name__, url_prefix='/api/level4')

# Cache for JSON data to avoid reading files multiple times
_json_cache = None

def load_json_data():
    """Load and cache the Level 4 CTF file system data"""
    global _json_cache
    if _json_cache is not None:
        return _json_cache
    
    try:
        # Load the individual Level 4 JSON files
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
                print(f"Loaded: ctf-file-system.json")
        except Exception as file_error:
            print(f"Error loading ctf-file-system.json: {file_error}")
            return {'fileSystem': {}}
        # Cache the data
        _json_cache = ctf_data
        
        file_count = len(ctf_data.get('fileSystem', {}))
        
        print(f"Loaded Level 4 CTF file system data successfully")
        print(f"File system paths: {file_count}")
        
        return _json_cache
        
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

@level4_api_bp.route('/hosts-data', methods=['GET'])
def get_level4_hosts_data():
    """Get Level 4 CTF file system data"""
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
            'data_type': 'ctf_file_system'
        })
        
    except Exception as e:
        print(f"Error in get_level4_hosts_data: {e}")
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
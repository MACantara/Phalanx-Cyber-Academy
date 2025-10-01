from flask import Blueprint, jsonify, current_app, request, session
from functools import wraps
import json
import hashlib
import random
from pathlib import Path

level5_api_bp = Blueprint('level5_api', __name__, url_prefix='/api/level5')

_json_cache = {}

def load_json_data():
    """Load Level 5 forensic data - now using null members dataset with randomized evidence"""
    global _json_cache
    
    try:
        # Define the base path to Level 5 data files
        base_path = Path(current_app.root_path) / 'static' / 'js' / 'simulated-pc' / 'levels' / 'level-five' / 'data'
        
        # Load the new null members dataset
        null_members_file = base_path / 'null-members-dataset.json'
        
        if null_members_file.exists():
            with open(null_members_file, 'r', encoding='utf-8') as f:
                null_data = json.load(f)
            
            # Randomly select one null member for investigation
            selected_member = random.choice(null_data['null_members'])
            
            current_app.logger.info(f"Selected Null member for investigation: {selected_member['code_name']} ({selected_member['real_name']})")
            
            # Structure data for apps
            _json_cache = {
                'null_members_full': null_data,
                'selected_member': selected_member,
                'evidence_data': {
                    'evidence': selected_member['evidence_trail']
                }
            }
            
            return _json_cache
        else:
            current_app.logger.error("Null members dataset not found")
            return {}
        
    except Exception as e:
        current_app.logger.error(f"Error loading Level 5 forensic data: {str(e)}")
        return {}


def get_selected_member_evidence(selected_member):
    """Get all evidence for the selected null member (5 pieces of evidence per member)"""
    if not selected_member or 'evidence_trail' not in selected_member:
        return []
    
    # Return all 5 evidence pieces for the selected member
    evidence_trail = selected_member['evidence_trail']
    current_app.logger.info(f"Loaded {len(evidence_trail)} evidence items for {selected_member['code_name']}")
    
    return evidence_trail


@level5_api_bp.route('/evidence-viewer-data', methods=['GET'])
def get_evidence_viewer_data():
    """Get evidence viewer data with 5 evidence items from selected null member"""
    try:
        data = load_json_data()
        selected_member = data.get('selected_member', {})
        
        # Get all 5 evidence items for the selected member
        evidence_items = get_selected_member_evidence(selected_member)
        
        response_data = {
            'target_identity': {
                'code_name': selected_member.get('code_name', 'Unknown'),
                'real_name': selected_member.get('real_name', '?'),
                'email': selected_member.get('email', '?'),
                'phone': selected_member.get('phone', '?'),
                'role': selected_member.get('role', 'Unknown')
            },
            'evidence_pool': evidence_items,
            'investigation_objective': f"Identify the real identity of '{selected_member.get('code_name', 'Unknown')}' through forensic analysis of digital evidence",
            'evidence_count': len(evidence_items)
        }
        
        return jsonify({
            'success': True,
            'data': response_data,
            'evidence_count': len(evidence_items),
            'target': selected_member.get('code_name', 'Unknown')
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Error fetching evidence viewer data: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to load evidence viewer data'
        }), 500


@level5_api_bp.route('/evidence-data', methods=['GET'])
def get_evidence_data():
    """Get base evidence data - returns selected member's evidence trail"""
    try:
        data = load_json_data()
        evidence_data = data.get('evidence_data', {})
        selected_member = data.get('selected_member', {})
        
        return jsonify({
            'success': True,
            'data': evidence_data,
            'count': len(evidence_data.get('evidence', [])),
            'target_info': {
                'code_name': selected_member.get('code_name'),
                'role': selected_member.get('role')
            }
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Error fetching evidence data: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to load evidence data'
        }), 500


@level5_api_bp.route('/investigation-hub-data', methods=['GET'])
def get_investigation_hub_data():
    """Get investigation hub data with objectives and progress tracking"""
    try:
        data = load_json_data()
        hub_data = data.get('investigation_hub', {})
        
        return jsonify({
            'success': True,
            'data': hub_data,
            'objectives_count': len(hub_data.get('objectives', []))
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Error fetching investigation hub data: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to load investigation hub data'
        }), 500


@level5_api_bp.route('/forensic-report-data', methods=['GET'])
def get_forensic_report_data():
    """Get forensic report evidence bank - extracted clues from evidence analysis"""
    try:
        data = load_json_data()
        selected_member = data.get('selected_member', {})
        
        # Convert evidence trail to forensic report evidence bank format
        evidence_bank = []
        for evidence in selected_member.get('evidence_trail', []):
            evidence_bank.append({
                'id': evidence['id'],
                'title': evidence['title'],
                'description': evidence['finding'],
                'type': evidence['clue_type'],
                'source': evidence['source'],
                'icon': evidence['icon'],
                'points': 20 if evidence['clue_type'] in ['identity', 'contact'] else 10,
                'difficulty': evidence['difficulty'],
                'evidence_data': evidence.get('evidence_data', {})
            })
        
        response_data = {
            'target_identity': {
                'code_name': selected_member.get('code_name'),
                'real_name': selected_member.get('real_name'),
                'email': selected_member.get('email'),
                'phone': selected_member.get('phone'),
                'role': selected_member.get('role')
            },
            'evidence_bank': evidence_bank,
            'report_template': {
                'case_title': f"Identity Investigation: {selected_member.get('code_name', 'Unknown')}",
                'investigation_objective': f"Conclusively identify the real identity of '{selected_member.get('code_name', 'Unknown')}' through digital forensic analysis"
            }
        }
        
        return jsonify({
            'success': True,
            'data': response_data,
            'evidence_bank_count': len(evidence_bank),
            'target': selected_member.get('code_name', 'Unknown')
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Error fetching forensic report data: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to load forensic report data'
        }), 500


@level5_api_bp.route('/all-data', methods=['GET'])
def get_all_data():
    """Get all Level 5 forensic data in a single request"""
    try:
        data = load_json_data()
        
        return jsonify({
            'success': True,
            'data': data,
            'datasets': list(data.keys())
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Error fetching all Level 5 data: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to load Level 5 data'
        }), 500





@level5_api_bp.route('/data-status', methods=['GET'])
def get_data_status():
    """Check if Level 5 data is loaded and available"""
    try:
        data = load_json_data()
        
        status = {}
        # Check null members dataset and selected member
        status['null_members'] = {
            'loaded': 'null_members_full' in data and bool(data['null_members_full']),
            'total_members': len(data.get('null_members_full', {}).get('null_members', []))
        }
        status['selected_member'] = {
            'loaded': 'selected_member' in data and bool(data['selected_member']),
            'code_name': data.get('selected_member', {}).get('code_name', 'Unknown'),
            'evidence_count': len(data.get('selected_member', {}).get('evidence_trail', []))
        }
        
        return jsonify({
            'success': True,
            'status': status,
            'all_loaded': all(s['loaded'] for s in status.values())
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Error checking data status: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to check data status'
        }), 500


@level5_api_bp.route('/generate-hash', methods=['POST'])
def generate_hash():
    """Generate SHA256 hash for forensic evidence verification"""
    try:
        # Get JSON data from request
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'No data provided for hashing'
            }), 400
        
        # Convert data to consistent JSON string for hashing
        data_string = json.dumps(data, sort_keys=True, separators=(',', ':'))
        
        # Generate SHA256 hash
        sha256_hash = hashlib.sha256(data_string.encode('utf-8')).hexdigest()
        
        # Also generate MD5 for backward compatibility
        md5_hash = hashlib.md5(data_string.encode('utf-8')).hexdigest()
        
        # Log the hash generation
        current_app.logger.info(f"Generated SHA256 hash for {len(data_string)} bytes of data")
        
        return jsonify({
            'success': True,
            'data': {
                'sha256': sha256_hash,
                'md5': md5_hash,
                'algorithm': 'SHA256',
                'input_size': len(data_string)
            }
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Error generating hash: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to generate hash'
        }), 500

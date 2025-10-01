from flask import Blueprint, jsonify, current_app, request, session
from functools import wraps
import json
import hashlib
import random
from pathlib import Path

level5_api_bp = Blueprint('level5_api', __name__, url_prefix='/api/level5')

_json_cache = {}

def load_json_data():
    """Load Level 5 forensic data from JSON files - centralized data loading matching index.js structure"""
    global _json_cache
    
    try:
        # Define the base path to Level 5 data files
        base_path = Path(current_app.root_path) / 'static' / 'js' / 'simulated-pc' / 'levels' / 'level-five' / 'data'
        
        # Load streamlined Level 5 JSON datasets for 3 core apps
        datasets = {
            'evidence': 'evidence-data.json',
            'evidence_viewer': 'evidence-viewer-data.json',
            'investigation_hub': 'investigation-hub-data.json',
            'forensic_report': 'forensic-report-data.json'
        }
        
        data = {}
        for key, filename in datasets.items():
            file_path = base_path / filename
            if file_path.exists():
                with open(file_path, 'r', encoding='utf-8') as f:
                    data[key] = json.load(f)
                current_app.logger.info(f"Loaded Level 5 {key} data from {filename}")
            else:
                current_app.logger.warning(f"Level 5 data file not found: {filename}")
                data[key] = {}
        
        _json_cache = data
        return data
        
    except Exception as e:
        current_app.logger.error(f"Error loading Level 5 forensic data: {str(e)}")
        return {}


def get_random_evidence_items(evidence_pool, count=5):
    """Randomly select evidence items from the pool for varied gameplay"""
    if not evidence_pool or len(evidence_pool) == 0:
        return []
    
    # Ensure we don't request more items than available
    actual_count = min(count, len(evidence_pool))
    
    # Use random.sample to get unique random items
    return random.sample(evidence_pool, actual_count)


@level5_api_bp.route('/evidence-viewer-data', methods=['GET'])
def get_evidence_viewer_data():
    """Get evidence viewer data with 5 random evidence items for analysis"""
    try:
        data = load_json_data()
        evidence_viewer_data = data.get('evidence_viewer', {})
        
        # Get 5 random evidence items from the evidence pool
        evidence_pool = evidence_viewer_data.get('evidence_pool', [])
        random_evidence = get_random_evidence_items(evidence_pool, 5)
        
        response_data = {
            'evidence_pool': random_evidence,
            'analysis_objectives': evidence_viewer_data.get('analysis_objectives', []),
            'forensic_standards': evidence_viewer_data.get('forensic_standards', {})
        }
        
        return jsonify({
            'success': True,
            'data': response_data,
            'evidence_count': len(random_evidence)
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Error fetching evidence viewer data: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to load evidence viewer data'
        }), 500


@level5_api_bp.route('/evidence-data', methods=['GET'])
def get_evidence_data():
    """Get base evidence data for compatibility"""
    try:
        data = load_json_data()
        evidence_data = data.get('evidence', {})
        
        return jsonify({
            'success': True,
            'data': evidence_data,
            'count': len(evidence_data.get('evidence', []))
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
    """Get forensic report data with evidence bank and identity verification"""
    try:
        data = load_json_data()
        report_data = data.get('forensic_report', {})
        
        return jsonify({
            'success': True,
            'data': report_data,
            'evidence_bank_count': len(report_data.get('evidence_bank', []))
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
        # Check streamlined Level 5 datasets for 3 core apps
        for key in ['evidence', 'evidence_viewer', 'investigation_hub', 'forensic_report']:
            status[key] = {
                'loaded': key in data and bool(data[key]),
                'item_count': len(data.get(key, {}))
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

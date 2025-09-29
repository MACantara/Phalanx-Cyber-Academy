from flask import Blueprint, jsonify, current_app, request, session
from functools import wraps
import json
from pathlib import Path

level5_api_bp = Blueprint('level5_api', __name__, url_prefix='/api/level5')

_json_cache = {}

def load_json_data():
    """Load Level 5 forensic data from JSON files"""
    global _json_cache
    
    try:
        # Define the base path to Level 5 data files
        base_path = Path(current_app.root_path) / 'static' / 'js' / 'simulated-pc' / 'levels' / 'level-five' / 'data'
        
        # Load all Level 5 JSON datasets
        datasets = {
            'evidence': 'evidence-data.json',
            'disk_analysis': 'disk-analysis-data.json',
            'memory_forensics': 'memory-forensics-data.json',
            'network_analysis': 'network-analysis-data.json',
            'timeline': 'timeline-data.json',
            'report_templates': 'report-templates-data.json'
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


@level5_api_bp.route('/evidence-data', methods=['GET'])
def get_evidence_data():
    """Get all evidence items for the investigation"""
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


@level5_api_bp.route('/disk-analysis-data', methods=['GET'])
def get_disk_analysis_data():
    """Get disk analysis data including images, filesystem, and deleted files"""
    try:
        data = load_json_data()
        disk_data = data.get('disk_analysis', {})
        
        return jsonify({
            'success': True,
            'data': disk_data,
            'images_count': len(disk_data.get('disk_images', [])),
            'deleted_files_count': len(disk_data.get('deleted_files', []))
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Error fetching disk analysis data: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to load disk analysis data'
        }), 500


@level5_api_bp.route('/memory-forensics-data', methods=['GET'])
def get_memory_forensics_data():
    """Get memory forensics data including processes and malware signatures"""
    try:
        data = load_json_data()
        memory_data = data.get('memory_forensics', {})
        
        return jsonify({
            'success': True,
            'data': memory_data,
            'dumps_count': len(memory_data.get('memory_dumps', [])),
            'processes_count': len(memory_data.get('processes', [])),
            'malware_signatures_count': len(memory_data.get('malware_signatures', []))
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Error fetching memory forensics data: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to load memory forensics data'
        }), 500


@level5_api_bp.route('/network-analysis-data', methods=['GET'])
def get_network_analysis_data():
    """Get network analysis data including captures, packets, and conversations"""
    try:
        data = load_json_data()
        network_data = data.get('network_analysis', {})
        
        return jsonify({
            'success': True,
            'data': network_data,
            'captures_count': len(network_data.get('network_captures', [])),
            'packets_count': len(network_data.get('packets', [])),
            'conversations_count': len(network_data.get('conversations', []))
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Error fetching network analysis data: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to load network analysis data'
        }), 500


@level5_api_bp.route('/timeline-data', methods=['GET'])
def get_timeline_data():
    """Get timeline data including correlation rules and event templates"""
    try:
        data = load_json_data()
        timeline_data = data.get('timeline', {})
        
        return jsonify({
            'success': True,
            'data': timeline_data,
            'correlation_rules_count': len(timeline_data.get('correlation_rules', [])),
            'event_templates_count': len(timeline_data.get('event_templates', [])),
            'sample_events_count': len(timeline_data.get('sample_events', []))
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Error fetching timeline data: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to load timeline data'
        }), 500


@level5_api_bp.route('/report-templates-data', methods=['GET'])
def get_report_templates_data():
    """Get report templates and compliance standards"""
    try:
        data = load_json_data()
        report_data = data.get('report_templates', {})
        
        return jsonify({
            'success': True,
            'data': report_data,
            'templates_count': len(report_data.get('report_templates', [])),
            'citation_formats_count': len(report_data.get('citation_formats', []))
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Error fetching report templates data: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to load report templates data'
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


@level5_api_bp.route('/case-briefing-data', methods=['GET'])
def get_case_briefing_data():
    """Get investigation case briefing and objectives"""
    try:
        # Load case briefing data
        base_path = Path(current_app.root_path) / 'static' / 'js' / 'simulated-pc' / 'levels' / 'level-five' / 'data'
        briefing_path = base_path / 'case-briefing.json'
        
        if briefing_path.exists():
            with open(briefing_path, 'r', encoding='utf-8') as f:
                briefing_data = json.load(f)
            
            return jsonify({
                'success': True,
                'data': briefing_data
            }), 200
        else:
            current_app.logger.warning("Case briefing file not found")
            return jsonify({
                'success': False,
                'error': 'Case briefing data not available'
            }), 404
        
    except Exception as e:
        current_app.logger.error(f"Error fetching case briefing data: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to load case briefing data'
        }), 500


@level5_api_bp.route('/investigation-objectives-data', methods=['GET'])
def get_investigation_objectives_data():
    """Get investigation objectives and victory conditions"""
    try:
        # Load investigation objectives data
        base_path = Path(current_app.root_path) / 'static' / 'js' / 'simulated-pc' / 'levels' / 'level-five' / 'data'
        objectives_path = base_path / 'investigation-objectives.json'
        
        if objectives_path.exists():
            with open(objectives_path, 'r', encoding='utf-8') as f:
                objectives_data = json.load(f)
            
            return jsonify({
                'success': True,
                'data': objectives_data
            }), 200
        else:
            current_app.logger.warning("Investigation objectives file not found")
            return jsonify({
                'success': False,
                'error': 'Investigation objectives data not available'
            }), 404
        
    except Exception as e:
        current_app.logger.error(f"Error fetching investigation objectives data: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to load investigation objectives data'
        }), 500


@level5_api_bp.route('/data-status', methods=['GET'])
def get_data_status():
    """Check if Level 5 data is loaded and available"""
    try:
        data = load_json_data()
        
        status = {}
        for key in ['evidence', 'disk_analysis', 'memory_forensics', 'network_analysis', 'timeline', 'report_templates']:
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

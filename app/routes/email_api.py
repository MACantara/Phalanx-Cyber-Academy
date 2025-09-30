from flask import Blueprint, jsonify, current_app
import json
import random
import os
from pathlib import Path

email_api_bp = Blueprint('email_api', __name__, url_prefix='/api/emails')

# Cache for JSON data to avoid reading files multiple times
_json_cache = None

def load_json_data():
    """Load and cache the phishing and legitimate email data from JSON files"""
    global _json_cache
    if _json_cache is not None:
        return _json_cache
    
    try:
        # Load the separate phishing and legitimate email JSON files
        json_base_path = os.path.join(
            os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 
            'app', 'static', 'js', 'simulated-pc', 'levels', 'level-two', 'data'
        )
        
        phishing_path = os.path.join(json_base_path, 'phishing_emails.json')
        legit_path = os.path.join(json_base_path, 'legitimate_emails.json')
        
        # Check if both files exist
        if not os.path.exists(phishing_path):
            print(f"Phishing JSON file not found at: {phishing_path}")
            return []
        if not os.path.exists(legit_path):
            print(f"Legitimate JSON file not found at: {legit_path}")
            return []
        
        # Read both JSON files
        with open(phishing_path, 'r', encoding='utf-8') as f:
            phishing_emails = json.load(f)
        
        with open(legit_path, 'r', encoding='utf-8') as f:
            legitimate_emails = json.load(f)
        
        # Combine both lists
        _json_cache = phishing_emails + legitimate_emails
        
        phishing_count = len(phishing_emails)
        legit_count = len(legitimate_emails)
        
        print(f"Loaded {len(_json_cache)} total emails from phishing_emails.json and legitimate_emails.json")
        print(f"Phishing emails: {phishing_count}")
        print(f"Legitimate emails: {legit_count}")
        
        return _json_cache
        
    except Exception as e:
        print(f"Error loading phishing_emails.json and legitimate_emails.json: {e}")
        import traceback
        traceback.print_exc()
        return []

def filter_emails_by_type(emails, email_type):
    """Filter emails by type (phishing or legitimate)"""
    return [email for email in emails if email.get('is_phishing') == (1 if email_type == 'phishing' else 0)]

@email_api_bp.route('/mixed-emails', methods=['GET'])
def get_mixed_emails():
    """Get a balanced mix of phishing and legitimate emails with 5 phishing and 5 legitimate emails"""
    try:
        emails = load_json_data()
        
        if not emails:
            return jsonify({
                'success': False,
                'error': 'No JSON data available'
            }), 500
        
        # Separate phishing and legitimate emails
        phishing_emails = filter_emails_by_type(emails, 'phishing')
        legitimate_emails = filter_emails_by_type(emails, 'legitimate')
        
        # Check if we have enough emails
        if len(phishing_emails) < 5:
            print(f"Warning: Only {len(phishing_emails)} phishing emails available, requested 5")
        if len(legitimate_emails) < 5:
            print(f"Warning: Only {len(legitimate_emails)} legitimate emails available, requested 5")

        # Sample the required number of emails
        selected_phishing = random.sample(phishing_emails, min(5, len(phishing_emails)))
        selected_legitimate = random.sample(legitimate_emails, min(5, len(legitimate_emails)))

        # Combine the selected emails
        selected_emails = selected_phishing + selected_legitimate
        
        if not selected_emails:
            return jsonify({
                'success': False,
                'error': 'No emails could be processed from JSON data'
            }), 500
        
        # Shuffle emails for variety
        random.shuffle(selected_emails)
        
        # Calculate summary stats
        phishing_count = len(selected_phishing)
        legitimate_count = len(selected_legitimate)
        
        return jsonify({
            'success': True,
            'emails': selected_emails,
            'summary': {
                'total': len(selected_emails),
                'phishing_count': phishing_count,
                'legitimate_count': legitimate_count,
                'source': 'phishing_emails.json + legitimate_emails.json'
            }
        })
        
    except Exception as e:
        print(f"Error getting mixed emails: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@email_api_bp.route('/stats', methods=['GET'])
def get_email_stats():
    """Get statistics about the email dataset"""
    try:
        emails = load_json_data()
        
        if not emails:
            return jsonify({
                'success': False,
                'error': 'No JSON data available'
            }), 500
        
        phishing_count = sum(1 for email in emails if email.get('is_phishing') == 1)
        legitimate_count = len(emails) - phishing_count
        
        return jsonify({
            'success': True,
            'stats': {
                'total_emails': len(emails),
                'phishing_emails': phishing_count,
                'legitimate_emails': legitimate_count,
                'phishing_percentage': round((phishing_count / len(emails)) * 100, 2) if emails else 0,
                'legitimate_percentage': round((legitimate_count / len(emails)) * 100, 2) if emails else 0,
                'source': 'phishing_emails.json + legitimate_emails.json'
            }
        })
        
    except Exception as e:
        print(f"Error getting email stats: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@email_api_bp.route('/csv-status', methods=['GET'])
def get_csv_status():
    """Get status of JSON data loading"""
    try:
        emails = load_json_data()
        
        if not emails:
            return jsonify({
                'success': True,
                'json_data_available': False,
                'message': 'No JSON data available'
            })
        
        # Get basic statistics
        phishing_count = sum(1 for email in emails if email.get('is_phishing') == 1)
        legitimate_count = len(emails) - phishing_count
        
        return jsonify({
            'success': True,
            'json_data_available': True,
            'total_emails': len(emails),
            'phishing_emails': phishing_count,
            'legitimate_emails': legitimate_count,
            'source_file': 'phishing_emails.json + legitimate_emails.json'
        })
        
    except Exception as e:
        print(f"Error getting JSON status: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@email_api_bp.route('/sample', methods=['GET'])
def get_sample_emails():
    """Get a small sample of emails for testing purposes"""
    try:
        emails = load_json_data()
        
        if not emails:
            return jsonify({
                'success': False,
                'error': 'No JSON data available'
            }), 500
        
        # Get a small sample (2 phishing, 2 legitimate)
        phishing_emails = filter_emails_by_type(emails, 'phishing')
        legitimate_emails = filter_emails_by_type(emails, 'legitimate')
        
        sample_phishing = random.sample(phishing_emails, min(2, len(phishing_emails)))
        sample_legitimate = random.sample(legitimate_emails, min(2, len(legitimate_emails)))
        
        sample_emails = sample_phishing + sample_legitimate
        random.shuffle(sample_emails)
        
        return jsonify({
            'success': True,
            'emails': sample_emails,
            'message': 'Sample emails for testing'
        })
        
    except Exception as e:
        print(f"Error getting sample emails: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

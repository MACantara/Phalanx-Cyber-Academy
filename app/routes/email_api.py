from flask import Blueprint, jsonify, current_app
import json
import random
import os
import pandas as pd
from pathlib import Path

email_api_bp = Blueprint('email_api', __name__, url_prefix='/api/emails')

# Cache for CSV data to avoid reading file multiple times
_csv_cache = None

def load_csv_data():
    """Load and cache the CEAS_08.csv phishing email data"""
    global _csv_cache
    if _csv_cache is not None:
        return _csv_cache
    
    try:
        # Load the CEAS_08 CSV data
        csv_path = os.path.join(
            os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 
            'app', 'static', 'js', 'simulated-pc', 'levels', 'level-two', 'data', 'CEAS_08.csv'
        )
        
        # Check if file exists
        if not os.path.exists(csv_path):
            print(f"CSV file not found at: {csv_path}")
            return pd.DataFrame()
        
        # Read CSV with pandas
        _csv_cache = pd.read_csv(csv_path)
        
        # Filter out any invalid rows and ensure we have the required columns
        required_columns = ['sender', 'receiver', 'date', 'subject', 'body', 'label']
        missing_columns = [col for col in required_columns if col not in _csv_cache.columns]
        
        if missing_columns:
            print(f"Missing required columns: {missing_columns}")
            return pd.DataFrame()
        
        # Filter for valid emails (remove rows with missing essential data)
        _csv_cache = _csv_cache.dropna(subset=['sender', 'subject', 'body']).copy()
        
        # Ensure label is numeric (1 = phishing, 0 = legitimate)
        _csv_cache['label'] = pd.to_numeric(_csv_cache['label'], errors='coerce')
        _csv_cache = _csv_cache.dropna(subset=['label']).copy()
        
        print(f"Loaded {len(_csv_cache)} emails from CEAS_08.csv")
        print(f"Phishing emails: {len(_csv_cache[_csv_cache['label'] == 1])}")
        print(f"Legitimate emails: {len(_csv_cache[_csv_cache['label'] == 0])}")
        
        return _csv_cache
        
    except Exception as e:
        print(f"Error loading CEAS_08.csv: {e}")
        import traceback
        traceback.print_exc()
        return pd.DataFrame()

def convert_csv_to_email_format(df):
    """Convert CSV dataframe to email format expected by frontend"""
    emails = []
    
    for index, row in df.iterrows():
        # Skip rows with missing essential data
        if pd.isna(row['subject']) or pd.isna(row['body']) or pd.isna(row['sender']):
            continue
        
        # Determine if email is phishing (label 1 = phishing, 0 = legitimate)
        is_phishing = int(row['label']) == 1
        
        # Clean and format the email data
        sender = str(row['sender']).strip()
        receiver = str(row['receiver']).strip() if pd.notna(row['receiver']) else 'Unknown Recipient'
        date = str(row['date']).strip() if pd.notna(row['date']) else ''
        subject = str(row['subject']).strip()
        body = str(row['body']).strip()
        
        # Create email object with required fields
        email = {
            'id': f'email_{index}',
            'sender': sender,
            'receiver': receiver,
            'date': date,
            'subject': subject,
            'body': body,
            'label': int(row['label']),  # For checking purposes (not displayed)
            'is_phishing': is_phishing,
            'email_type': 'phishing' if is_phishing else 'legitimate',
            'ai_analysis': {
                'risk_level': 'high' if is_phishing else 'low',
                'phishing_indicators': [
                    'Suspicious sender',
                    'Urgent language',
                    'Suspicious links',
                    'Request for personal information'
                ] if is_phishing else [],
                'safety_factors': [
                    'Verified sender',
                    'Professional formatting',
                    'No suspicious requests'
                ] if not is_phishing else [],
                'educational_focus': f'This email demonstrates {"phishing" if is_phishing else "legitimate"} email characteristics.',
                'red_flags': [
                    'Poor grammar or spelling',
                    'Generic greetings',
                    'Urgent or threatening language',
                    'Suspicious attachments or links',
                    'Requests for sensitive information'
                ] if is_phishing else [],
                'verification_tips': [
                    'Check sender email address carefully',
                    'Hover over links before clicking',
                    'Verify sender through alternative means',
                    'Look for spelling and grammar errors',
                    'Be suspicious of urgent requests',
                    'Never provide sensitive information via email'
                ]
            }
        }
        
        emails.append(email)
    
    return emails

@email_api_bp.route('/mixed-emails', methods=['GET'])
def get_mixed_emails():
    """Get a balanced mix of phishing and legitimate emails with 8 phishing and 7 legitimate emails"""
    try:
        df = load_csv_data()
        
        if df.empty:
            return jsonify({
                'success': False,
                'error': 'No CSV data available'
            }), 500
        
        # Separate phishing and legitimate emails
        phishing_emails = df[df['label'] == 1].copy()
        legitimate_emails = df[df['label'] == 0].copy()
        
        # Check if we have enough emails
        if len(phishing_emails) < 8:
            print(f"Warning: Only {len(phishing_emails)} phishing emails available, requested 8")
        if len(legitimate_emails) < 7:
            print(f"Warning: Only {len(legitimate_emails)} legitimate emails available, requested 7")
        
        # Sample the required number of emails
        selected_phishing = phishing_emails.sample(n=min(8, len(phishing_emails)), random_state=random.randint(1, 1000))
        selected_legitimate = legitimate_emails.sample(n=min(7, len(legitimate_emails)), random_state=random.randint(1, 1000))
        
        # Combine the selected emails
        selected_df = pd.concat([selected_phishing, selected_legitimate], ignore_index=True)
        
        # Convert to email format
        emails = convert_csv_to_email_format(selected_df)
        
        if not emails:
            return jsonify({
                'success': False,
                'error': 'No emails could be processed from CSV data'
            }), 500
        
        # Shuffle emails for variety
        random.shuffle(emails)
        
        # Calculate summary stats
        phishing_count = sum(1 for email in emails if email['is_phishing'])
        legitimate_count = len(emails) - phishing_count
        
        return jsonify({
            'success': True,
            'emails': emails,
            'summary': {
                'total': len(emails),
                'phishing_count': phishing_count,
                'legitimate_count': legitimate_count,
                'source': 'CEAS_08.csv'
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
        df = load_csv_data()
        
        if df.empty:
            return jsonify({
                'success': False,
                'error': 'No CSV data available'
            }), 500
        
        emails = convert_csv_to_email_format(df)
        
        phishing_count = sum(1 for email in emails if email['is_phishing'])
        legitimate_count = len(emails) - phishing_count
        
        return jsonify({
            'success': True,
            'stats': {
                'total_emails': len(emails),
                'phishing_emails': phishing_count,
                'legitimate_emails': legitimate_count,
                'phishing_percentage': round((phishing_count / len(emails)) * 100, 2) if emails else 0,
                'legitimate_percentage': round((legitimate_count / len(emails)) * 100, 2) if emails else 0,
                'source': 'CEAS_08.csv'
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
    """Get status of CSV data loading"""
    try:
        df = load_csv_data()
        
        if df.empty:
            return jsonify({
                'success': True,
                'csv_data_available': False,
                'message': 'No CSV data available'
            })
        
        # Get basic statistics
        phishing_count = len(df[df['label'] == 1])
        legitimate_count = len(df[df['label'] == 0])
        
        return jsonify({
            'success': True,
            'csv_data_available': True,
            'total_emails': len(df),
            'phishing_emails': phishing_count,
            'legitimate_emails': legitimate_count,
            'source_file': 'CEAS_08.csv'
        })
        
    except Exception as e:
        print(f"Error getting CSV status: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@email_api_bp.route('/sample', methods=['GET'])
def get_sample_emails():
    """Get a small sample of emails for testing purposes"""
    try:
        df = load_csv_data()
        
        if df.empty:
            return jsonify({
                'success': False,
                'error': 'No CSV data available'
            }), 500
        
        # Get a small sample (2 phishing, 2 legitimate)
        phishing_sample = df[df['label'] == 1].sample(n=min(2, len(df[df['label'] == 1])))
        legitimate_sample = df[df['label'] == 0].sample(n=min(2, len(df[df['label'] == 0])))
        
        sample_df = pd.concat([phishing_sample, legitimate_sample], ignore_index=True)
        emails = convert_csv_to_email_format(sample_df)
        
        return jsonify({
            'success': True,
            'emails': emails,
            'message': 'Sample emails for testing'
        })
        
    except Exception as e:
        print(f"Error getting sample emails: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

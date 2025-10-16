from flask import Blueprint, jsonify, request, session, current_app, render_template
from flask_wtf.csrf import generate_csrf
import os

csrf_api_bp = Blueprint('csrf_api', __name__, url_prefix='/api')

@csrf_api_bp.route('/csrf-token', methods=['GET'])
def csrf_token():
    """
    Endpoint to get a fresh CSRF token
    Used by JavaScript to refresh tokens when needed
    """
    try:
        token = generate_csrf()
        return jsonify({
            'csrf_token': token,
            'status': 'success'
        })
    except Exception as e:
        return jsonify({
            'error': 'Failed to generate CSRF token',
            'status': 'error'
        }), 500

@csrf_api_bp.route('/debug', methods=['GET'])
def debug_csrf():
    """
    Debug endpoint to check CSRF configuration in Vercel
    """
    try:
        token = generate_csrf()
        return jsonify({
            'csrf_token': token[:20] + '...' if token else 'None',
            'csrf_enabled': current_app.config.get('WTF_CSRF_ENABLED'),
            'csrf_ssl_strict': current_app.config.get('WTF_CSRF_SSL_STRICT'),
            'csrf_time_limit': current_app.config.get('WTF_CSRF_TIME_LIMIT'),
            'secret_key_set': bool(current_app.config.get('SECRET_KEY')),
            'secret_key_preview': str(current_app.config.get('SECRET_KEY', ''))[:20] + '...',
            'is_vercel': current_app.config.get('IS_VERCEL'),
            'session_data': dict(session),
            'headers': dict(request.headers),
            'environment': {
                'VERCEL': os.environ.get('VERCEL'),
                'FLASK_ENV': os.environ.get('FLASK_ENV'),
                'SECRET_KEY_ENV': bool(os.environ.get('SECRET_KEY')),
            },
            'status': 'success'
        })
    except Exception as e:
        return jsonify({
            'error': f'Debug failed: {str(e)}',
            'status': 'error',
            'config_basics': {
                'csrf_enabled': current_app.config.get('WTF_CSRF_ENABLED'),
                'is_vercel': current_app.config.get('IS_VERCEL'),
                'secret_key_set': bool(current_app.config.get('SECRET_KEY')),
            }
        }), 500

@csrf_api_bp.route('/test-csrf', methods=['POST'])
def test_csrf_submission():
    """
    Test endpoint for CSRF form submissions
    """
    try:
        message = request.form.get('message', 'No message')
        return jsonify({
            'status': 'success',
            'message': 'CSRF validation passed!',
            'received_message': message,
            'method': request.method
        })
    except Exception as e:
        return jsonify({
            'error': f'Test failed: {str(e)}',
            'status': 'error'
        }), 500

@csrf_api_bp.route('/health', methods=['GET'])
def health_check():
    """
    Simple health check endpoint
    """
    return jsonify({
        'status': 'healthy',
        'message': 'Phalanx Cyber Academy API is running'
    })

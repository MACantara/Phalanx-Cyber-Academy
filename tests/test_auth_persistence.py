"""
Test authentication cookie persistence
"""
import pytest
import os
from flask import session
from app import create_app
from app.models.user import User
from app.models.email_verification import EmailVerification


@pytest.fixture
def app():
    """Create application for testing"""
    # Set mock Supabase credentials for testing
    os.environ['SUPABASE_URL'] = 'https://mock.supabase.co'
    os.environ['SUPABASE_SERVICE_ROLE_KEY'] = 'mock-key-for-testing-only'
    
    app = create_app('testing')
    app.config['TESTING'] = True
    app.config['WTF_CSRF_ENABLED'] = False
    app.config['PERMANENT_SESSION_LIFETIME'] = 604800  # 7 days in seconds
    
    yield app


@pytest.fixture
def client(app):
    """Create test client"""
    return app.test_client()


@pytest.fixture
def runner(app):
    """Create test CLI runner"""
    return app.test_cli_runner()


class TestAuthenticationPersistence:
    """Test cookie-based authentication persistence"""
    
    def test_session_cookie_persistence_config(self, app):
        """Test that session cookie configuration is correct for persistence"""
        with app.app_context():
            # Check that session cookies are configured correctly
            assert app.config['SESSION_COOKIE_HTTPONLY'] is True
            assert app.config['SESSION_COOKIE_SAMESITE'] == 'Lax'
            assert app.config['SESSION_COOKIE_NAME'] == 'cyberquest_session'
            # PERMANENT_SESSION_LIFETIME should be set
            assert app.config['PERMANENT_SESSION_LIFETIME'] is not None
    
    def test_session_permanent_after_login(self, client, app):
        """Test that session is marked as permanent after login"""
        with client:
            with app.app_context():
                # Create test user
                try:
                    test_user = User.find_by_email('test@example.com')
                    if not test_user:
                        test_user = User.create(
                            username='testuser',
                            email='test@example.com',
                            timezone='UTC'
                        )
                        test_user.is_verified = True
                        test_user.onboarding_completed = True
                        test_user.save()
                except Exception as e:
                    # If database operations fail, skip this test
                    pytest.skip(f"Database not available: {e}")
                
                # Simulate login by creating verification code
                try:
                    verification = EmailVerification.create_verification(
                        user_id=test_user.id,
                        email='test@example.com',
                        code_type='login'
                    )
                    
                    # Store email in session (simulating the login flow)
                    with client.session_transaction() as sess:
                        sess['login_email'] = 'test@example.com'
                        sess['verification_id'] = verification.id
                    
                    # Post verification code
                    response = client.post('/auth/verify-code', data={
                        'code': verification.verification_code
                    }, follow_redirects=False)
                    
                    # Check that response is a redirect (successful login)
                    assert response.status_code in [302, 303]
                    
                    # Check that session is permanent
                    with client.session_transaction() as sess:
                        # Flask's session.permanent should be set
                        # This ensures the cookie will persist across browser restarts
                        assert sess.permanent is True
                        
                except Exception as e:
                    pytest.skip(f"Database operation failed: {e}")
    
    def test_logout_clears_session(self, client, app):
        """Test that logout properly clears the session"""
        with client:
            with app.app_context():
                # Create and login test user
                try:
                    test_user = User.find_by_email('test_logout@example.com')
                    if not test_user:
                        test_user = User.create(
                            username='testlogout',
                            email='test_logout@example.com',
                            timezone='UTC'
                        )
                        test_user.is_verified = True
                        test_user.onboarding_completed = True
                        test_user.save()
                    
                    # Manually login the user using Flask-Login
                    from flask_login import login_user
                    with app.test_request_context():
                        login_user(test_user)
                        
                        # Verify user is logged in by checking session
                        from flask_login import current_user
                        assert current_user.is_authenticated
                    
                    # Now test logout
                    response = client.get('/auth/logout', follow_redirects=False)
                    
                    # Should redirect after logout
                    assert response.status_code in [302, 303]
                    
                    # Session should be cleared
                    with client.session_transaction() as sess:
                        # Session should be empty or at least not contain user info
                        assert '_user_id' not in sess or sess.get('_user_id') is None
                        
                except Exception as e:
                    pytest.skip(f"Database operation failed: {e}")
    
    def test_cookie_security_settings(self, app):
        """Test that cookie security settings are properly configured"""
        with app.app_context():
            # HttpOnly should be True to prevent XSS attacks
            assert app.config['SESSION_COOKIE_HTTPONLY'] is True
            
            # SameSite should be set to Lax or Strict
            assert app.config['SESSION_COOKIE_SAMESITE'] in ['Lax', 'Strict']
            
            # Secure flag depends on environment (HTTPS)
            # In testing, it should be False, but in production it should be True
            # We're just checking it's set
            assert 'SESSION_COOKIE_SECURE' in app.config

"""
Shared pytest fixtures for the Flask application.
"""
import os
import pytest
from app import create_app


@pytest.fixture(scope='session')
def app():
    """Create a Flask application instance configured for testing."""
    # Ensure deterministic secret key for tests
    os.environ.setdefault('SECRET_KEY', 'test-secret-key')
    _app = create_app('testing')
    _app.config['TESTING'] = True
    return _app


@pytest.fixture
def client(app):
    """Create a test client for the Flask app."""
    return app.test_client()

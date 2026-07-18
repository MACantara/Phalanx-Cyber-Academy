"""
Contract tests capture the shape of current HTTP responses.

These serve as acceptance criteria when re-implementing routes in FastAPI.
Each test documents the expected status code, content type, and top-level
response keys for a public endpoint.
"""


def test_home_contract(client):
    """Contract: GET / returns HTML."""
    response = client.get('/')
    assert response.status_code == 200
    assert 'text/html' in response.content_type
    assert b'<html' in response.data.lower() or b'<!doctype' in response.data.lower()


def test_login_contract(client):
    """Contract: GET /auth/login returns an HTML login form."""
    response = client.get('/auth/login')
    assert response.status_code == 200
    assert 'text/html' in response.content_type
    assert b'form' in response.data.lower()


def test_404_contract(client):
    """Contract: Unknown GET routes return a text or HTML 404 response."""
    response = client.get('/missing-endpoint')
    assert response.status_code == 404
    assert response.data

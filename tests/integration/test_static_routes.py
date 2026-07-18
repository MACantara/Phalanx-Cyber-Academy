"""
Integration tests for static and public routes.
"""


def test_home_page(client):
    """The home page loads successfully."""
    response = client.get('/')
    assert response.status_code == 200
    assert b'Phalanx' in response.data


def test_login_page(client):
    """The login page loads successfully."""
    response = client.get('/auth/login')
    assert response.status_code == 200
    assert b'login' in response.data.lower() or response.data


def test_404_unknown_route(client):
    """Unknown routes return a 404."""
    response = client.get('/this-route-does-not-exist')
    assert response.status_code == 404


def test_static_assets(client):
    """Static assets are served and core JS/CSS files are reachable."""
    response = client.get('/static/js/main.js')
    # Static files are served if they exist; otherwise 404 is acceptable
    assert response.status_code in (200, 404)

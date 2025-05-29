"""
Test configuration for Study Eyes backend
"""

import pytest
import os
import tempfile
from app import create_app
from models.database import db

@pytest.fixture
def app():
    """Create application for testing"""
    # Create a temporary file for the test database
    db_fd, db_path = tempfile.mkstemp()
    
    # Create app with testing configuration
    app = create_app('testing')
    app.config.update({
        'TESTING': True,
        'SQLALCHEMY_DATABASE_URI': f'sqlite:///{db_path}',
        'JWT_SECRET_KEY': 'test-secret-key',
        'WTF_CSRF_ENABLED': False
    })
    
    with app.app_context():
        db.create_all()
        yield app
        db.drop_all()
    
    os.close(db_fd)
    os.unlink(db_path)

@pytest.fixture
def client(app):
    """Create test client"""
    return app.test_client()

@pytest.fixture
def runner(app):
    """Create test CLI runner"""
    return app.test_cli_runner()

@pytest.fixture
def auth_headers():
    """Helper to create authentication headers"""
    def _auth_headers(token):
        return {'Authorization': f'Bearer {token}'}
    return _auth_headers

@pytest.fixture
def create_user(app):
    """Helper to create test users"""
    def _create_user(username='testuser', email='test@example.com', password='testpass123'):
        with app.app_context():
            from models.user import User
            user = User(
                username=username,
                email=email,
                first_name='Test',
                last_name='User'
            )
            user.set_password(password)
            db.session.add(user)
            db.session.commit()
            return user
    return _create_user

@pytest.fixture
def auth_token(client, create_user):
    """Helper to get authentication token"""
    def _auth_token(username='testuser', email='test@example.com', password='testpass123'):
        # Create user
        user = create_user(username=username, email=email, password=password)
        
        # Login to get token
        response = client.post('/api/auth/login', json={
            'email': email,
            'password': password
        })
        
        data = response.get_json()
        return data['access_token']
    
    return _auth_token

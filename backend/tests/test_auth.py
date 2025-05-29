"""
Tests for authentication routes
"""

import pytest
import json
from models.user import User
from models.database import db

class TestAuthRoutes:
    
    def test_register_success(self, client):
        """Test successful user registration"""
        response = client.post('/api/auth/register', json={
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password': 'securepass123',
            'first_name': 'New',
            'last_name': 'User'
        })
        
        assert response.status_code == 201
        data = response.get_json()
        assert 'access_token' in data
        assert data['user']['username'] == 'newuser'
        assert data['user']['email'] == 'newuser@example.com'
    
    def test_register_duplicate_email(self, client, create_user):
        """Test registration with duplicate email"""
        create_user(email='existing@example.com')
        
        response = client.post('/api/auth/register', json={
            'username': 'newuser',
            'email': 'existing@example.com',
            'password': 'securepass123',
            'first_name': 'New',
            'last_name': 'User'
        })
        
        assert response.status_code == 400
        data = response.get_json()
        assert 'email already exists' in data['error']['message'].lower()
    
    def test_register_invalid_data(self, client):
        """Test registration with invalid data"""
        # Missing required fields
        response = client.post('/api/auth/register', json={
            'username': 'newuser'
        })
        
        assert response.status_code == 400
        data = response.get_json()
        assert 'validation error' in data['error']['message'].lower()
    
    def test_login_success(self, client, create_user):
        """Test successful login"""
        create_user(email='test@example.com', password='testpass123')
        
        response = client.post('/api/auth/login', json={
            'email': 'test@example.com',
            'password': 'testpass123'
        })
        
        assert response.status_code == 200
        data = response.get_json()
        assert 'access_token' in data
        assert data['user']['email'] == 'test@example.com'
    
    def test_login_invalid_credentials(self, client, create_user):
        """Test login with invalid credentials"""
        create_user(email='test@example.com', password='testpass123')
        
        # Wrong password
        response = client.post('/api/auth/login', json={
            'email': 'test@example.com',
            'password': 'wrongpassword'
        })
        
        assert response.status_code == 401
        data = response.get_json()
        assert 'invalid credentials' in data['error']['message'].lower()
    
    def test_login_nonexistent_user(self, client):
        """Test login with non-existent user"""
        response = client.post('/api/auth/login', json={
            'email': 'nonexistent@example.com',
            'password': 'testpass123'
        })
        
        assert response.status_code == 401
        data = response.get_json()
        assert 'invalid credentials' in data['error']['message'].lower()
    
    def test_get_profile_success(self, client, auth_token, auth_headers):
        """Test getting user profile"""
        token = auth_token()
        
        response = client.get('/api/auth/profile', 
                            headers=auth_headers(token))
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['user']['email'] == 'test@example.com'
        assert 'password_hash' not in data['user']  # Should not expose password
    
    def test_get_profile_no_token(self, client):
        """Test getting profile without authentication"""
        response = client.get('/api/auth/profile')
        
        assert response.status_code == 401
        data = response.get_json()
        assert 'authentication' in data['error']['message'].lower()
    
    def test_get_profile_invalid_token(self, client, auth_headers):
        """Test getting profile with invalid token"""
        response = client.get('/api/auth/profile', 
                            headers=auth_headers('invalid_token'))
        
        assert response.status_code == 401
        data = response.get_json()
        assert 'invalid' in data['error']['message'].lower()
    
    def test_logout_success(self, client, auth_token, auth_headers):
        """Test successful logout"""
        token = auth_token()
        
        response = client.post('/api/auth/logout', 
                             headers=auth_headers(token))
        
        assert response.status_code == 200
        data = response.get_json()
        assert 'logged out' in data['message'].lower()
    
    def test_logout_no_token(self, client):
        """Test logout without authentication"""
        response = client.post('/api/auth/logout')
        
        assert response.status_code == 401

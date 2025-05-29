"""
Tests for session management routes
"""

import pytest
import json
from datetime import datetime, timedelta
from models.session import StudySession
from models.database import db

class TestSessionRoutes:
    
    def test_start_session_success(self, client, auth_token, auth_headers):
        """Test starting a new study session"""
        token = auth_token()
        
        response = client.post('/api/sessions/start', 
                             headers=auth_headers(token),
                             json={
                                 'subject': 'Mathematics',
                                 'planned_duration': 3600,
                                 'session_type': 'focused_study',
                                 'notes': 'Algebra practice'
                             })
        
        assert response.status_code == 201
        data = response.get_json()
        assert data['session']['subject'] == 'Mathematics'
        assert data['session']['planned_duration'] == 3600
        assert data['session']['is_active'] == True
    
    def test_start_session_while_active(self, client, auth_token, auth_headers):
        """Test starting a session while another is active"""
        token = auth_token()
        
        # Start first session
        client.post('/api/sessions/start', 
                   headers=auth_headers(token),
                   json={'subject': 'Math', 'planned_duration': 3600})
        
        # Try to start second session
        response = client.post('/api/sessions/start', 
                             headers=auth_headers(token),
                             json={'subject': 'Science', 'planned_duration': 1800})
        
        assert response.status_code == 400
        data = response.get_json()
        assert 'active session' in data['error']['message'].lower()
    
    def test_get_current_session_success(self, client, auth_token, auth_headers):
        """Test getting current active session"""
        token = auth_token()
        
        # Start a session
        start_response = client.post('/api/sessions/start', 
                                   headers=auth_headers(token),
                                   json={'subject': 'History', 'planned_duration': 2400})
        
        session_id = start_response.get_json()['session']['id']
        
        # Get current session
        response = client.get('/api/sessions/current', 
                            headers=auth_headers(token))
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['session']['id'] == session_id
        assert data['session']['subject'] == 'History'
        assert data['session']['is_active'] == True
    
    def test_get_current_session_none_active(self, client, auth_token, auth_headers):
        """Test getting current session when none active"""
        token = auth_token()
        
        response = client.get('/api/sessions/current', 
                            headers=auth_headers(token))
        
        assert response.status_code == 404
        data = response.get_json()
        assert 'no active session' in data['error']['message'].lower()
    
    def test_pause_session_success(self, client, auth_token, auth_headers):
        """Test pausing an active session"""
        token = auth_token()
        
        # Start a session
        start_response = client.post('/api/sessions/start', 
                                   headers=auth_headers(token),
                                   json={'subject': 'Physics', 'planned_duration': 3600})
        
        session_id = start_response.get_json()['session']['id']
        
        # Pause the session
        response = client.post(f'/api/sessions/{session_id}/pause', 
                             headers=auth_headers(token))
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['session']['is_paused'] == True
    
    def test_resume_session_success(self, client, auth_token, auth_headers):
        """Test resuming a paused session"""
        token = auth_token()
        
        # Start and pause a session
        start_response = client.post('/api/sessions/start', 
                                   headers=auth_headers(token),
                                   json={'subject': 'Chemistry', 'planned_duration': 3600})
        
        session_id = start_response.get_json()['session']['id']
        
        client.post(f'/api/sessions/{session_id}/pause', 
                   headers=auth_headers(token))
        
        # Resume the session
        response = client.post(f'/api/sessions/{session_id}/resume', 
                             headers=auth_headers(token))
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['session']['is_paused'] == False
    
    def test_end_session_success(self, client, auth_token, auth_headers):
        """Test ending an active session"""
        token = auth_token()
        
        # Start a session
        start_response = client.post('/api/sessions/start', 
                                   headers=auth_headers(token),
                                   json={'subject': 'Biology', 'planned_duration': 3600})
        
        session_id = start_response.get_json()['session']['id']
        
        # End the session
        response = client.post(f'/api/sessions/{session_id}/end', 
                             headers=auth_headers(token),
                             json={
                                 'notes': 'Completed chapter 5',
                                 'self_rating': 4
                             })
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['session']['is_active'] == False
        assert data['session']['end_time'] is not None
    
    def test_get_session_history(self, client, auth_token, auth_headers, app):
        """Test getting user's session history"""
        token = auth_token()
        
        with app.app_context():
            # Create some test sessions
            from models.user import User
            user = User.query.filter_by(email='test@example.com').first()
            
            for i in range(3):
                session = StudySession(
                    user_id=user.id,
                    subject=f'Subject {i}',
                    planned_duration=3600,
                    actual_duration=3000 + i * 100,
                    start_time=datetime.utcnow() - timedelta(days=i),
                    end_time=datetime.utcnow() - timedelta(days=i, hours=-1),
                    is_active=False
                )
                db.session.add(session)
            db.session.commit()
        
        response = client.get('/api/sessions', 
                            headers=auth_headers(token))
        
        assert response.status_code == 200
        data = response.get_json()
        assert len(data['sessions']) == 3
        assert 'pagination' in data
    
    def test_get_session_history_with_filters(self, client, auth_token, auth_headers):
        """Test getting session history with filters"""
        token = auth_token()
        
        response = client.get('/api/sessions?subject=Mathematics&limit=10', 
                            headers=auth_headers(token))
        
        assert response.status_code == 200
        data = response.get_json()
        assert 'sessions' in data
        assert 'pagination' in data
    
    def test_unauthorized_access(self, client):
        """Test accessing session endpoints without authentication"""
        endpoints = [
            ('/api/sessions/start', 'POST'),
            ('/api/sessions/current', 'GET'),
            ('/api/sessions', 'GET'),
        ]
        
        for endpoint, method in endpoints:
            if method == 'POST':
                response = client.post(endpoint, json={})
            else:
                response = client.get(endpoint)
            
            assert response.status_code == 401
            data = response.get_json()
            assert 'authentication' in data['error']['message'].lower()

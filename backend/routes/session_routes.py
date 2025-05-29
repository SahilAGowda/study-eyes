"""
Session routes for managing study sessions and real-time eye tracking
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.database import db
from models.user import User
from models.session import StudySession, EyeTrackingData
from models.analytics import UserAnalytics
from datetime import datetime, timedelta
from sqlalchemy import desc, and_

session_bp = Blueprint('sessions', __name__)

@session_bp.route('/start/dev', methods=['POST'])
def start_session_dev():
    """Create and start a new study session for development (no auth required)"""
    try:
        from datetime import datetime
        
        # Create mock session data
        mock_session = {
            'id': 999,  # Mock session ID
            'title': 'Development Study Session',
            'description': 'Mock session for development',
            'start_time': datetime.utcnow().isoformat(),
            'end_time': None,
            'duration': 0,
            'status': 'active',
            'is_active': True,
            'focus_percentage': 0.0,
            'average_attention_score': 0.0,
            'blink_rate': 0.0,
            'posture_score': 0.0,
            'fatigue_level': 0.0,
            'break_count': 0,
            'planned_duration': 25,
            'eye_tracking_enabled': True,
            'break_reminders_enabled': True,
            'posture_monitoring_enabled': True
        }
        
        return jsonify({
            'message': 'Development session started successfully',
            'session': mock_session
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to start development session', 'details': str(e)}), 500

@session_bp.route('/start', methods=['POST'])
def start_session_direct():
    """Create and start a new study session directly (for compatibility)"""
    try:
        # For development, return mock data without authentication
        data = request.get_json() or {}
        
        from datetime import datetime
        
        mock_session = {
            'id': 1000,  # Mock session ID
            'title': data.get('title', 'Quick Study Session'),
            'description': data.get('description', 'Auto-created session'),
            'start_time': datetime.utcnow().isoformat(),
            'end_time': None,
            'duration': 0,
            'status': 'active',
            'is_active': True,
            'focus_percentage': 0.0,
            'average_attention_score': 0.0,
            'blink_rate': 0.0,
            'posture_score': 0.0,
            'fatigue_level': 0.0,
            'break_count': 0,
            'planned_duration': data.get('planned_duration', 25),
            'eye_tracking_enabled': data.get('eye_tracking_enabled', True),
            'break_reminders_enabled': data.get('break_reminders_enabled', True),
            'posture_monitoring_enabled': data.get('posture_monitoring_enabled', True)
        }
        
        return jsonify(mock_session), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to start session', 'details': str(e)}), 500

@session_bp.route('/', methods=['GET'])
@jwt_required()
def get_sessions():
    """Get user's study sessions with pagination and filtering"""
    try:
        user_id = get_jwt_identity()
        
        # Query parameters
        page = request.args.get('page', 1, type=int)
        per_page = min(request.args.get('per_page', 10, type=int), 100)  # Max 100 per page
        status = request.args.get('status')  # active, completed, cancelled
        date_from = request.args.get('date_from')
        date_to = request.args.get('date_to')
        
        # Build query
        query = StudySession.query.filter_by(user_id=user_id)
        
        # Apply filters
        if status:
            query = query.filter(StudySession.status == status)
        
        if date_from:
            try:
                from_date = datetime.fromisoformat(date_from.replace('Z', '+00:00'))
                query = query.filter(StudySession.start_time >= from_date)
            except ValueError:
                return jsonify({'error': 'Invalid date_from format'}), 400
        
        if date_to:
            try:
                to_date = datetime.fromisoformat(date_to.replace('Z', '+00:00'))
                query = query.filter(StudySession.start_time <= to_date)
            except ValueError:
                return jsonify({'error': 'Invalid date_to format'}), 400
        
        # Order by start time (newest first)
        query = query.order_by(desc(StudySession.start_time))
        
        # Paginate
        pagination = query.paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        sessions = [session.to_dict() for session in pagination.items]
        
        return jsonify({
            'sessions': sessions,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': pagination.total,
                'pages': pagination.pages,
                'has_next': pagination.has_next,
                'has_prev': pagination.has_prev
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to fetch sessions', 'details': str(e)}), 500

@session_bp.route('/', methods=['POST'])
@jwt_required()
def create_session():
    """Create a new study session"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        # Validate required fields
        if 'title' not in data:
            return jsonify({'error': 'Session title is required'}), 400
        
        title = data['title'].strip()
        if not title:
            return jsonify({'error': 'Session title cannot be empty'}), 400
        
        # Check if user has an active session
        active_session = StudySession.query.filter_by(
            user_id=user_id, 
            is_active=True
        ).first()
        
        if active_session:
            return jsonify({
                'error': 'You already have an active session',
                'active_session': active_session.to_dict()
            }), 409
        
        # Create new session
        session = StudySession(
            user_id=user_id,
            title=title,
            description=data.get('description'),
            planned_duration=data.get('planned_duration', 25)
        )
        
        # Set session preferences
        session.eye_tracking_enabled = data.get('eye_tracking_enabled', True)
        session.break_reminders_enabled = data.get('break_reminders_enabled', True)
        session.posture_monitoring_enabled = data.get('posture_monitoring_enabled', True)
        
        db.session.add(session)
        db.session.commit()
        
        return jsonify({
            'message': 'Session created successfully',
            'session': session.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to create session', 'details': str(e)}), 500

@session_bp.route('/<int:session_id>', methods=['GET'])
@jwt_required()
def get_session(session_id):
    """Get specific session details"""
    try:
        user_id = get_jwt_identity()
        
        session = StudySession.query.filter_by(
            id=session_id, 
            user_id=user_id
        ).first()
        
        if not session:
            return jsonify({'error': 'Session not found'}), 404
        
        return jsonify({
            'session': session.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to fetch session', 'details': str(e)}), 500

@session_bp.route('/<int:session_id>/start', methods=['POST'])
@jwt_required()
def start_session(session_id):
    """Start a study session"""
    try:
        user_id = get_jwt_identity()
        
        session = StudySession.query.filter_by(
            id=session_id, 
            user_id=user_id
        ).first()
        
        if not session:
            return jsonify({'error': 'Session not found'}), 404
        
        if session.is_active:
            return jsonify({'error': 'Session is already active'}), 409
        
        # Check if user has another active session
        active_session = StudySession.query.filter_by(
            user_id=user_id, 
            is_active=True
        ).first()
        
        if active_session:
            return jsonify({
                'error': 'You already have an active session',
                'active_session': active_session.to_dict()
            }), 409
        
        # Start the session
        session.start_session()
        
        return jsonify({
            'message': 'Session started successfully',
            'session': session.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to start session', 'details': str(e)}), 500

@session_bp.route('/<int:session_id>/pause', methods=['POST'])
@jwt_required()
def pause_session(session_id):
    """Pause a study session"""
    try:
        user_id = get_jwt_identity()
        
        session = StudySession.query.filter_by(
            id=session_id, 
            user_id=user_id
        ).first()
        
        if not session:
            return jsonify({'error': 'Session not found'}), 404
        
        if not session.is_active:
            return jsonify({'error': 'Session is not active'}), 409
        
        session.pause_session()
        
        return jsonify({
            'message': 'Session paused successfully',
            'session': session.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to pause session', 'details': str(e)}), 500

@session_bp.route('/<int:session_id>/resume', methods=['POST'])
@jwt_required()
def resume_session(session_id):
    """Resume a paused study session"""
    try:
        user_id = get_jwt_identity()
        
        session = StudySession.query.filter_by(
            id=session_id, 
            user_id=user_id
        ).first()
        
        if not session:
            return jsonify({'error': 'Session not found'}), 404
        
        if session.status != 'paused':
            return jsonify({'error': 'Session is not paused'}), 409
        
        session.resume_session()
        
        return jsonify({
            'message': 'Session resumed successfully',
            'session': session.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to resume session', 'details': str(e)}), 500

@session_bp.route('/<int:session_id>/end', methods=['POST'])
@jwt_required()
def end_session(session_id):
    """End a study session"""
    try:
        user_id = get_jwt_identity()
        
        session = StudySession.query.filter_by(
            id=session_id, 
            user_id=user_id
        ).first()
        
        if not session:
            return jsonify({'error': 'Session not found'}), 404
        
        if not session.is_active:
            return jsonify({'error': 'Session is not active'}), 409
        
        session.end_session()
        
        # Update user analytics for today
        today = datetime.utcnow().date()
        analytics = UserAnalytics.query.filter_by(
            user_id=user_id, 
            date=today
        ).first()
        
        if not analytics:
            analytics = UserAnalytics(user_id=user_id, date=today)
            db.session.add(analytics)
        
        analytics.calculate_daily_metrics()
        
        return jsonify({
            'message': 'Session ended successfully',
            'session': session.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to end session', 'details': str(e)}), 500

@session_bp.route('/<int:session_id>/cancel', methods=['POST'])
@jwt_required()
def cancel_session(session_id):
    """Cancel a study session"""
    try:
        user_id = get_jwt_identity()
        
        session = StudySession.query.filter_by(
            id=session_id, 
            user_id=user_id
        ).first()
        
        if not session:
            return jsonify({'error': 'Session not found'}), 404
        
        if not session.is_active:
            return jsonify({'error': 'Session is not active'}), 409
        
        session.cancel_session()
        
        return jsonify({
            'message': 'Session cancelled successfully',
            'session': session.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to cancel session', 'details': str(e)}), 500

@session_bp.route('/active', methods=['GET'])
@jwt_required()
def get_active_session():
    """Get user's current active session"""
    try:
        user_id = get_jwt_identity()
        
        session = StudySession.query.filter_by(
            user_id=user_id, 
            is_active=True
        ).first()
        
        if not session:
            return jsonify({'message': 'No active session'}), 404
        
        return jsonify({
            'session': session.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to fetch active session', 'details': str(e)}), 500

@session_bp.route('/<int:session_id>/tracking', methods=['POST'])
@jwt_required()
def add_tracking_data(session_id):
    """Add eye tracking data to a session"""
    try:
        user_id = get_jwt_identity()
        
        session = StudySession.query.filter_by(
            id=session_id, 
            user_id=user_id
        ).first()
        
        if not session:
            return jsonify({'error': 'Session not found'}), 404
        
        if not session.is_active:
            return jsonify({'error': 'Session is not active'}), 409
        
        data = request.get_json()
        
        # Create tracking data entry
        tracking_data = EyeTrackingData(
            session_id=session_id,
            left_eye_x=data.get('left_eye_x'),
            left_eye_y=data.get('left_eye_y'),
            right_eye_x=data.get('right_eye_x'),
            right_eye_y=data.get('right_eye_y'),
            gaze_x=data.get('gaze_x'),
            gaze_y=data.get('gaze_y'),
            gaze_direction=data.get('gaze_direction'),
            attention_score=data.get('attention_score', 0.0),
            is_focused=data.get('is_focused', True),
            distraction_type=data.get('distraction_type'),
            is_blinking=data.get('is_blinking', False),
            blink_duration=data.get('blink_duration'),
            head_pitch=data.get('head_pitch'),
            head_yaw=data.get('head_yaw'),
            head_roll=data.get('head_roll'),
            distance_cm=data.get('distance_cm')
        )
        
        db.session.add(tracking_data)
        
        # Update session metrics
        if 'focus_time' in data and 'distraction_time' in data:
            session.update_focus_metrics(
                data['focus_time'],
                data['distraction_time'],
                data.get('attention_score', 0.0)
            )
        
        db.session.commit()
        
        return jsonify({
            'message': 'Tracking data added successfully'
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to add tracking data', 'details': str(e)}), 500

@session_bp.route('/<int:session_id>/break', methods=['POST'])
@jwt_required()
def add_break(session_id):
    """Add a break to the session"""
    try:
        user_id = get_jwt_identity()
        
        session = StudySession.query.filter_by(
            id=session_id, 
            user_id=user_id
        ).first()
        
        if not session:
            return jsonify({'error': 'Session not found'}), 404
        
        data = request.get_json()
        break_duration = data.get('duration', 300)  # Default 5 minutes in seconds
        
        session.add_break(break_duration)
        
        return jsonify({
            'message': 'Break added successfully',
            'session': session.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to add break', 'details': str(e)}), 500

"""
Authentication routes for user registration, login, and token management
"""

from flask import Blueprint, request, jsonify, current_app, url_for
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token
from models.database import db
from models.user import User
from datetime import datetime, timedelta
import re
from utils.auth_utils import generate_reset_token, generate_verification_token, verify_token
from services.email_service import email_service

auth_bp = Blueprint('auth', __name__)

def validate_email(email):
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_password(password):
    """Validate password strength"""
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"
    if not re.search(r'[A-Z]', password):
        return False, "Password must contain at least one uppercase letter"
    if not re.search(r'[a-z]', password):
        return False, "Password must contain at least one lowercase letter"
    if not re.search(r'\d', password):
        return False, "Password must contain at least one number"
    return True, "Password is valid"

@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['email', 'username', 'password', 'first_name', 'last_name']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({'error': f'{field} is required'}), 400
        
        email = data['email'].lower().strip()
        username = data['username'].strip()
        password = data['password']
        first_name = data['first_name'].strip()
        last_name = data['last_name'].strip()
        
        # Validate email format
        if not validate_email(email):
            return jsonify({'error': 'Invalid email format'}), 400
        
        # Validate password strength
        is_valid, message = validate_password(password)
        if not is_valid:
            return jsonify({'error': message}), 400
        
        # Check if user already exists
        if User.query.filter_by(email=email).first():
            return jsonify({'error': 'Email already registered'}), 409
        
        if User.query.filter_by(username=username).first():
            return jsonify({'error': 'Username already taken'}), 409
        
        # Get role from request (default to 'student')
        role = data.get('role', 'student').lower()
        if role not in ['student', 'teacher', 'admin', 'management']:
            role = 'student'
        
        # Create new user
        new_user = User(
            email=email,
            username=username,
            password=password,  # Password hashing is handled in the User model
            first_name=first_name,
            last_name=last_name,
            role=role
        )
        new_user.is_active = True
        new_user.is_verified = False
        new_user.created_at = datetime.utcnow()
        new_user.last_login = datetime.utcnow()
        
        db.session.add(new_user)
        db.session.commit()
        
        # Generate email verification token and send verification email
        verification_token = generate_verification_token(new_user.id, email)
        verification_link = f"{current_app.config['FRONTEND_URL']}/verify-email?token={verification_token}"
        
        # Send verification email in background
        email_service.send_verification_email(
            to_email=email,
            username=username,
            verification_link=verification_link
        )
        
        # Generate access token
        access_token = create_access_token(identity=new_user.id)
        
        return jsonify({
            'message': 'User registered successfully. Please check your email to verify your account.',
            'token': access_token,  # For compatibility
            'access_token': access_token,
            'user': new_user.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Registration failed', 'details': str(e)}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    """Authenticate user and return access token"""
    try:
        data = request.get_json()
        
        # Validate required fields
        if 'email' not in data or 'password' not in data:
            return jsonify({'error': 'Email and password are required'}), 400
        
        email = data['email'].lower().strip()
        password = data['password']
        
        # Find user by email
        user = User.query.filter_by(email=email).first()
        
        if not user or not user.check_password(password):
            return jsonify({'error': 'Invalid email or password'}), 401
        
        if not user.is_active:
            return jsonify({'error': 'Account is deactivated'}), 401
        
        # Update last login
        user.update_last_login()
        
        # Generate access token
        access_token = create_access_token(identity=user.id)
        
        return jsonify({
            'message': 'Login successful',
            'user': user.to_dict(),
            'token': access_token,  # For compatibility
            'access_token': access_token
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Login failed', 'details': str(e)}), 500

@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    """Get current user profile"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to fetch profile', 'details': str(e)}), 500

@auth_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    """Update user profile"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        
        # Update allowed fields
        allowed_fields = [
            'first_name', 'last_name', 'timezone', 'notification_enabled',
            'default_session_duration', 'break_duration', 'focus_threshold'
        ]
        
        for field in allowed_fields:
            if field in data:
                setattr(user, field, data[field])
        
        db.session.commit()
        
        return jsonify({
            'message': 'Profile updated successfully',
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to update profile', 'details': str(e)}), 500

@auth_bp.route('/change-password', methods=['POST'])
@jwt_required()
def change_password():
    """Change user password"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        
        # Validate required fields
        if 'current_password' not in data or 'new_password' not in data:
            return jsonify({'error': 'Current password and new password are required'}), 400
        
        current_password = data['current_password']
        new_password = data['new_password']
        
        # Verify current password
        if not user.check_password(current_password):
            return jsonify({'error': 'Current password is incorrect'}), 401
        
        # Validate new password
        is_valid, message = validate_password(new_password)
        if not is_valid:
            return jsonify({'error': message}), 400
        
        # Update password
        user.set_password(new_password)
        db.session.commit()
        
        return jsonify({
            'message': 'Password changed successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to change password', 'details': str(e)}), 500

@auth_bp.route('/refresh', methods=['POST'])
@jwt_required()
def refresh_token():
    """Refresh access token"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user or not user.is_active:
            return jsonify({'error': 'User not found or inactive'}), 404
        
        # Generate new access token
        access_token = create_access_token(identity=user.id)
        
        return jsonify({
            'access_token': access_token
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to refresh token', 'details': str(e)}), 500

@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    """Logout user (client-side token removal)"""
    return jsonify({'message': 'Successfully logged out'}), 200

@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    """Initiate password reset process"""
    try:
        data = request.get_json()
        if 'email' not in data or not data['email']:
            return jsonify({'error': 'Email is required'}), 400
            
        email = data['email'].lower().strip()
        user = User.query.filter_by(email=email).first()
        
        # For security reasons, don't reveal if the email exists or not
        if user:
            # Generate reset token
            reset_token = generate_reset_token(user.id)
            reset_link = f"{current_app.config['FRONTEND_URL']}/reset-password?token={reset_token}"
            
            # Send password reset email
            email_service.send_password_reset_email(
                to_email=user.email,
                username=user.username,
                reset_link=reset_link
            )
            
        return jsonify({
            'message': 'If an account with that email exists, a password reset link has been sent.'
        }), 200
        
    except Exception as e:
        current_app.logger.error(f'Error in forgot_password: {str(e)}')
        return jsonify({'error': 'An error occurred while processing your request'}), 500

@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    """Reset user password with token"""
    try:
        data = request.get_json()
        
        if 'token' not in data or not data['token']:
            return jsonify({'error': 'Reset token is required'}), 400
        if 'password' not in data or not data['password']:
            return jsonify({'error': 'New password is required'}), 400
            
        token = data['token']
        new_password = data['password']
        
        # Verify token
        payload = verify_token(token, 'reset')
        if not payload:
            return jsonify({'error': 'Invalid or expired token'}), 400
            
        # Validate password
        is_valid, message = validate_password(new_password)
        if not is_valid:
            return jsonify({'error': message}), 400
            
        # Update user password
        user = User.query.get(payload['user_id'])
        if not user:
            return jsonify({'error': 'User not found'}), 404
            
        user.set_password(new_password)
        db.session.commit()
        
        return jsonify({'message': 'Password has been reset successfully'}), 200
        
    except Exception as e:
        current_app.logger.error(f'Error in reset_password: {str(e)}')
        return jsonify({'error': 'An error occurred while resetting your password'}), 500

@auth_bp.route('/verify-email', methods=['POST'])
def verify_email():
    """Verify user email with token"""
    try:
        data = request.get_json()
        if 'token' not in data or not data['token']:
            return jsonify({'error': 'Verification token is required'}), 400
            
        token = data['token']
        payload = verify_token(token, 'verification')
        if not payload:
            return jsonify({'error': 'Invalid or expired verification token'}), 400
            
        user = User.query.get(payload['user_id'])
        if not user:
            return jsonify({'error': 'User not found'}), 404
            
        if user.email != payload['email']:
            return jsonify({'error': 'Email verification failed'}), 400
            
        if user.is_verified:
            return jsonify({'message': 'Email is already verified'}), 200
            
        user.is_verified = True
        user.email_verified_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({'message': 'Email verified successfully'}), 200
        
    except Exception as e:
        current_app.logger.error(f'Error in verify_email: {str(e)}')
        return jsonify({'error': 'An error occurred while verifying your email'}), 500

@auth_bp.route('/resend-verification', methods=['POST'])
@jwt_required()
def resend_verification():
    """Resend email verification"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
            
        if user.is_verified:
            return jsonify({'message': 'Email is already verified'}), 200
            
        # Generate new verification token
        verification_token = generate_verification_token(user.id, user.email)
        verification_link = f"{current_app.config['FRONTEND_URL']}/verify-email?token={verification_token}"
        
        # Send verification email
        email_service.send_verification_email(
            to_email=user.email,
            username=user.username,
            verification_link=verification_link
        )
        
        return jsonify({'message': 'Verification email has been resent'}), 200
        
    except Exception as e:
        current_app.logger.error(f'Error in resend_verification: {str(e)}')
        return jsonify({'error': 'An error occurred while resending the verification email'}), 500

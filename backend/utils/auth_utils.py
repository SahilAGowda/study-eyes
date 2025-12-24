import os
import jwt
import secrets
import string
from datetime import datetime, timedelta
from functools import wraps
from flask import jsonify, request, current_app
from werkzeug.security import generate_password_hash, check_password_hash

def generate_reset_token(user_id):
    """Generate a secure token for password reset"""
    payload = {
        'user_id': user_id,
        'exp': datetime.utcnow() + timedelta(hours=1),  # Token expires in 1 hour
        'type': 'reset'
    }
    return jwt.encode(
        payload,
        current_app.config['SECRET_KEY'],
        algorithm='HS256'
    )

def generate_verification_token(user_id, email):
    """Generate a secure token for email verification"""
    payload = {
        'user_id': user_id,
        'email': email,
        'exp': datetime.utcnow() + timedelta(days=1),  # Token expires in 1 day
        'type': 'verification'
    }
    return jwt.encode(
        payload,
        current_app.config['SECRET_KEY'],
        algorithm='HS256'
    )

def verify_token(token, token_type='reset'):
    """Verify the token and return the payload if valid"""
    try:
        payload = jwt.decode(
            token,
            current_app.config['SECRET_KEY'],
            algorithms=['HS256']
        )
        if payload.get('type') != token_type:
            return None
        return payload
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        return None

def generate_secure_password(length=12):
    """Generate a secure random password"""
    chars = string.ascii_letters + string.digits + "!@#$%^&*"
    return ''.join(secrets.choice(chars) for _ in range(length))

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            token = request.headers['Authorization'].split(" ")[1]
        
        if not token:
            return jsonify({'message': 'Token is missing'}), 401
            
        try:
            data = jwt.decode(
                token,
                current_app.config['SECRET_KEY'],
                algorithms=['HS256']
            )
            current_user_id = data['user_id']
        except:
            return jsonify({'message': 'Token is invalid'}), 401
            
        return f(current_user_id, *args, **kwargs)
    
    return decorated

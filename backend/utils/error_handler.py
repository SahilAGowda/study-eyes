"""
Error handling utilities for Study Eyes application
"""

import logging
from functools import wraps
from flask import jsonify, request, current_app
from werkzeug.exceptions import HTTPException
import traceback


class StudyEyesError(Exception):
    """Base exception class for Study Eyes application"""
    
    def __init__(self, message, status_code=500, error_code=None):
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.error_code = error_code or 'INTERNAL_ERROR'


class ValidationError(StudyEyesError):
    """Exception for validation errors"""
    
    def __init__(self, message, field=None):
        super().__init__(message, status_code=400, error_code='VALIDATION_ERROR')
        self.field = field


class AuthenticationError(StudyEyesError):
    """Exception for authentication errors"""
    
    def __init__(self, message='Authentication required'):
        super().__init__(message, status_code=401, error_code='AUTH_ERROR')


class AuthorizationError(StudyEyesError):
    """Exception for authorization errors"""
    
    def __init__(self, message='Insufficient permissions'):
        super().__init__(message, status_code=403, error_code='AUTH_ERROR')


class ResourceNotFoundError(StudyEyesError):
    """Exception for resource not found errors"""
    
    def __init__(self, message='Resource not found', resource_type=None):
        super().__init__(message, status_code=404, error_code='NOT_FOUND')
        self.resource_type = resource_type


class RateLimitError(StudyEyesError):
    """Exception for rate limiting errors"""
    
    def __init__(self, message='Rate limit exceeded'):
        super().__init__(message, status_code=429, error_code='RATE_LIMIT')


class ExternalServiceError(StudyEyesError):
    """Exception for external service errors"""
    
    def __init__(self, message='External service error', service=None):
        super().__init__(message, status_code=502, error_code='EXTERNAL_ERROR')
        self.service = service


def handle_error(error):
    """Generic error handler"""
    logger = logging.getLogger(__name__)
    
    # Handle custom exceptions
    if isinstance(error, StudyEyesError):
        logger.warning(f"Application error: {error.message}")
        return jsonify({
            'success': False,
            'error': {
                'code': error.error_code,
                'message': error.message,
                'type': error.__class__.__name__
            }
        }), error.status_code
    
    # Handle HTTP exceptions
    if isinstance(error, HTTPException):
        logger.warning(f"HTTP error {error.code}: {error.description}")
        return jsonify({
            'success': False,
            'error': {
                'code': f'HTTP_{error.code}',
                'message': error.description,
                'type': 'HTTPException'
            }
        }), error.code
    
    # Handle unexpected exceptions
    logger.error(f"Unexpected error: {str(error)}")
    logger.error(f"Traceback: {traceback.format_exc()}")
    
    # Don't expose internal errors in production
    if current_app.debug:
        return jsonify({
            'success': False,
            'error': {
                'code': 'INTERNAL_ERROR',
                'message': str(error),
                'type': error.__class__.__name__,
                'traceback': traceback.format_exc()
            }
        }), 500
    else:
        return jsonify({
            'success': False,
            'error': {
                'code': 'INTERNAL_ERROR',
                'message': 'An internal error occurred',
                'type': 'InternalError'
            }
        }), 500


def api_error_handler(func):
    """Decorator to handle API errors consistently"""
    @wraps(func)
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except StudyEyesError as e:
            return handle_error(e)
        except Exception as e:
            return handle_error(e)
    return wrapper


def validate_json(required_fields=None, optional_fields=None):
    """Decorator to validate JSON request data"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            if not request.is_json:
                raise ValidationError('Request must be JSON')
            
            data = request.get_json()
            if not data:
                raise ValidationError('Request body cannot be empty')
            
            # Check required fields
            if required_fields:
                for field in required_fields:
                    if field not in data or data[field] is None:
                        raise ValidationError(f'Field "{field}" is required', field=field)
                    
                    # Check for empty strings
                    if isinstance(data[field], str) and not data[field].strip():
                        raise ValidationError(f'Field "{field}" cannot be empty', field=field)
            
            # Check for unknown fields
            if required_fields or optional_fields:
                allowed_fields = set(required_fields or []) | set(optional_fields or [])
                unknown_fields = set(data.keys()) - allowed_fields
                if unknown_fields:
                    raise ValidationError(f'Unknown fields: {", ".join(unknown_fields)}')
            
            return func(*args, **kwargs)
        return wrapper
    return decorator


def handle_database_error(func):
    """Decorator to handle database errors"""
    @wraps(func)
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except Exception as e:
            # Log the database error
            logger = logging.getLogger(__name__)
            logger.error(f"Database error in {func.__name__}: {str(e)}")
            
            # Rollback any pending transactions
            from models.database import db
            db.session.rollback()
            
            # Return appropriate error
            if 'UNIQUE constraint failed' in str(e):
                raise ValidationError('Duplicate entry detected')
            elif 'FOREIGN KEY constraint failed' in str(e):
                raise ValidationError('Invalid reference')
            else:
                raise StudyEyesError('Database operation failed')
    return wrapper


def setup_error_handlers(app):
    """Setup error handlers for the Flask app"""
    
    @app.errorhandler(StudyEyesError)
    def handle_custom_error(error):
        return handle_error(error)
    
    @app.errorhandler(HTTPException)
    def handle_http_error(error):
        return handle_error(error)
    
    @app.errorhandler(Exception)
    def handle_unexpected_error(error):
        return handle_error(error)
    
    # Handle 404 specifically
    @app.errorhandler(404)
    def handle_not_found(error):
        return jsonify({
            'success': False,
            'error': {
                'code': 'NOT_FOUND',
                'message': 'Endpoint not found',
                'type': 'NotFound'
            }
        }), 404
    
    # Handle 405 Method Not Allowed
    @app.errorhandler(405)
    def handle_method_not_allowed(error):
        return jsonify({
            'success': False,
            'error': {
                'code': 'METHOD_NOT_ALLOWED',
                'message': 'Method not allowed for this endpoint',
                'type': 'MethodNotAllowed'
            }
        }), 405

"""
Logging configuration for Study Eyes application
"""

import logging
import logging.handlers
import os
from datetime import datetime
from flask import request, g
import functools


class RequestFormatter(logging.Formatter):
    """Custom formatter that includes request information"""
    
    def format(self, record):
        try:
            if hasattr(g, 'user_id'):
                record.user_id = g.user_id
            else:
                record.user_id = 'anonymous'
        except RuntimeError:
            # Outside application context
            record.user_id = 'system'
            
        try:
            if request:
                record.url = request.url
                record.remote_addr = request.remote_addr
                record.method = request.method
            else:
                record.url = 'N/A'
                record.remote_addr = 'N/A'
                record.method = 'N/A'
        except RuntimeError:
            # Outside request context
            record.url = 'N/A'
            record.remote_addr = 'N/A'
            record.method = 'N/A'
            
        return super().format(record)


def setup_logging(app):
    """Configure logging for the application"""
    
    # Create logs directory if it doesn't exist
    log_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'logs')
    os.makedirs(log_dir, exist_ok=True)
    
    # Configure root logger
    logging.getLogger().setLevel(logging.INFO)
    
    # Create formatters
    detailed_formatter = RequestFormatter(
        fmt='%(asctime)s [%(levelname)s] %(name)s [%(user_id)s] [%(method)s %(url)s] %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    
    simple_formatter = logging.Formatter(
        fmt='%(asctime)s [%(levelname)s] %(name)s: %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    
    # File handler for general logs
    file_handler = logging.handlers.RotatingFileHandler(
        filename=os.path.join(log_dir, 'app.log'),
        maxBytes=10 * 1024 * 1024,  # 10MB
        backupCount=5
    )
    file_handler.setLevel(logging.INFO)
    file_handler.setFormatter(detailed_formatter)
    
    # File handler for errors
    error_handler = logging.handlers.RotatingFileHandler(
        filename=os.path.join(log_dir, 'errors.log'),
        maxBytes=10 * 1024 * 1024,  # 10MB
        backupCount=5
    )
    error_handler.setLevel(logging.ERROR)
    error_handler.setFormatter(detailed_formatter)
    
    # Console handler
    console_handler = logging.StreamHandler()
    if app.debug:
        console_handler.setLevel(logging.DEBUG)
    else:
        console_handler.setLevel(logging.INFO)
    console_handler.setFormatter(simple_formatter)
    
    # Add handlers to app logger
    app.logger.addHandler(file_handler)
    app.logger.addHandler(error_handler)
    app.logger.addHandler(console_handler)
    
    # Set logging level based on environment
    if app.debug:
        app.logger.setLevel(logging.DEBUG)
    else:
        app.logger.setLevel(logging.INFO)
    
    # Configure specific loggers
    logging.getLogger('werkzeug').setLevel(logging.WARNING)
    logging.getLogger('socketio').setLevel(logging.INFO)
    logging.getLogger('engineio').setLevel(logging.WARNING)
    
    app.logger.info("Logging configuration completed")


def log_request(func):
    """Decorator to log API requests"""
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        start_time = datetime.utcnow()
        
        try:
            result = func(*args, **kwargs)
            
            # Log successful request
            duration = (datetime.utcnow() - start_time).total_seconds()
            logging.getLogger(__name__).info(
                f"Request completed successfully in {duration:.3f}s"
            )
            
            return result
            
        except Exception as e:
            # Log failed request
            duration = (datetime.utcnow() - start_time).total_seconds()
            logging.getLogger(__name__).error(
                f"Request failed after {duration:.3f}s: {str(e)}"
            )
            raise
            
    return wrapper


def log_function_call(func):
    """Decorator to log function calls for debugging"""
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        logger = logging.getLogger(func.__module__)
        logger.debug(f"Calling {func.__name__} with args: {args}, kwargs: {kwargs}")
        
        try:
            result = func(*args, **kwargs)
            logger.debug(f"{func.__name__} completed successfully")
            return result
        except Exception as e:
            logger.error(f"{func.__name__} failed: {str(e)}")
            raise
            
    return wrapper

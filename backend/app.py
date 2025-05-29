"""
Study Eyes - Main Flask Application
AI-powered application for monitoring student focus and attention during study sessions
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_socketio import SocketIO
import os
from datetime import timedelta
import threading
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import configurations
from config.config import Config

# Import routes
from routes.auth_routes import auth_bp
from routes.session_routes import session_bp
from routes.analytics_routes import analytics_bp
from routes.user_routes import user_bp

# Import models
from models.database import db

# Import utilities
from utils.logger import setup_logging
from utils.error_handler import setup_error_handlers

def create_app(config_name='development'):
    """Application factory pattern"""
    app = Flask(__name__)
    
    # Load configuration
    if config_name == 'testing':
        from config.config import TestingConfig
        app.config.from_object(TestingConfig)
    elif config_name == 'production':
        from config.config import ProductionConfig
        app.config.from_object(ProductionConfig)
    else:
        app.config.from_object(Config)
      # Setup logging
    setup_logging(app)
    app.logger.info(f"Starting Study Eyes application in {config_name} mode")
    
    # Initialize extensions
    CORS(app, origins=['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5000'])  # Frontend URLs
    db.init_app(app)
    migrate = Migrate(app, db)
    
    # Initialize SocketIO
    socketio = SocketIO(app, cors_allowed_origins=['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5000'], async_mode='threading')
    
    # JWT Configuration
    app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'study-eyes-secret-key')
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)
    jwt = JWTManager(app)
    
    # Setup error handlers
    setup_error_handlers(app)
      # Register blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(session_bp, url_prefix='/api/sessions')
    app.register_blueprint(analytics_bp, url_prefix='/api/analytics')
    app.register_blueprint(user_bp, url_prefix='/api/users')
    
    # Import and initialize WebSocket service (after app is fully configured)
    from services.websocket_service import init_websocket_handlers
    init_websocket_handlers(socketio)
    
    # Health check endpoint
    @app.route('/api/health')
    def health_check():
        return jsonify({
            'status': 'healthy',
            'message': 'Study Eyes API is running',
            'version': '1.0.0',
            'environment': config_name
        })
    
    app.logger.info("Application setup completed successfully")
    return app, socketio

# Create the application instance
app, socketio = create_app()

if __name__ == '__main__':
    with app.app_context():
        # Create database tables
        db.create_all()
    
    # Run the application with SocketIO
    socketio.run(app, debug=True, host='0.0.0.0', port=5000)

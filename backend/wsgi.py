"""
Production WSGI configuration for Study Eyes
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add the project directory to Python path
sys.path.insert(0, os.path.dirname(__file__))

from app import create_app

# Create the application instance for production
app, socketio = create_app('production')

if __name__ == "__main__":
    socketio.run(app, host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))

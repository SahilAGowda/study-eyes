# Study Eyes - AI-Powered Study Session Monitoring

![Study Eyes Logo](docs/assets/logo.png)

Study Eyes is an innovative AI-powered application that monitors student focus and attention during study sessions using computer vision and machine learning technologies. The system provides real-time feedback, analytics, and insights to help students improve their study habits and maintain optimal focus levels.

## 🚀 Features

### Core Features
- **Real-time Eye Tracking**: Advanced computer vision using MediaPipe for precise eye movement detection
- **AI Attention Detection**: Machine learning models to assess focus levels and detect distractions
- **Study Session Management**: Complete session lifecycle with start, pause, resume, and end functionality
- **Real-time Analytics**: Live dashboard showing attention metrics, focus levels, and productivity scores
- **WebSocket Communication**: Real-time data transmission for immediate feedback
- **User Management**: Comprehensive authentication and profile management system

### Advanced Features
- **Distraction Classification**: Automatic detection and categorization of different distraction types
- **Fatigue Level Monitoring**: AI-powered fatigue detection to prevent burnout
- **Personalized Insights**: Machine learning recommendations based on individual study patterns
- **Goal Tracking**: Set and monitor study goals with progress tracking
- **Data Export**: Export study session data in various formats (JSON, CSV)
- **Historical Analytics**: Comprehensive reporting with daily, weekly, and monthly insights

## 🏗️ Architecture

### Technology Stack

#### Frontend
- **React 18**: Modern React with functional components and hooks
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework for modern UI
- **Vite**: Fast build tool and development server
- **Axios**: HTTP client for API communication
- **React Router**: Client-side routing

#### Backend
- **Flask**: Lightweight Python web framework
- **SQLAlchemy**: ORM for database operations
- **Flask-JWT-Extended**: JWT authentication
- **Flask-SocketIO**: Real-time WebSocket communication
- **Flask-Migrate**: Database migration management
- **Flask-CORS**: Cross-origin resource sharing

#### AI & Computer Vision
- **MediaPipe**: Google's computer vision framework for face and eye detection
- **OpenCV**: Computer vision library for image processing
- **scikit-learn**: Machine learning library for attention prediction models
- **NumPy & Pandas**: Data processing and analysis

#### Database
- **SQLite**: Development database (easily replaceable with PostgreSQL for production)
- **Alembic**: Database migration tool

## 📦 Installation

### Prerequisites
- **Node.js** (v16 or higher)
- **Python** (v3.8 or higher)
- **Git**
- **Webcam** (for eye tracking functionality)

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/study-eyes.git
   cd study-eyes
   ```

2. **Set up Python virtual environment**
   ```bash
   cd backend
   python -m venv venv
   
   # Windows
   venv\Scripts\activate
   
   # macOS/Linux
   source venv/bin/activate
   ```

3. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   ```bash
   # Copy the example environment file
   copy .env.example .env  # Windows
   cp .env.example .env    # macOS/Linux
   
   # Edit .env with your configuration
   ```

5. **Initialize the database**
   ```bash
   flask db init
   flask db migrate -m "Initial migration"
   flask db upgrade
   ```

6. **Run the backend server**
   ```bash
   python app.py
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install Node.js dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Copy the example environment file
   copy .env.example .env  # Windows
   cp .env.example .env    # macOS/Linux
   ```

4. **Start the development server**
   ```bash
   npm run dev   ```

## 🚀 Quick Start

### One-Click Setup (Windows)

For the fastest setup on Windows, use our automated scripts:

1. **Download or clone the repository**
   ```bash
   git clone https://github.com/your-username/study-eyes.git
   cd study-eyes
   ```

2. **Run the setup script**
   ```bash
   setup.bat
   ```

3. **Start the application**
   ```bash
   start-dev.bat
   ```

4. **Open your browser**
   - Navigate to `http://localhost:3000`
   - Create an account and start your first study session!

### Interactive Guide (Windows)

For a guided setup experience:

```bash
quick-start.bat
```

This interactive script will help you:
- Install all dependencies
- Run tests to verify installation
- Start/stop development servers
- View documentation and requirements

### Manual Setup

#### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate     # macOS/Linux
pip install -r requirements.txt
flask db upgrade
python app.py
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Docker Setup

For a containerized environment:

```bash
docker-compose up -d
```

### Next Steps

After setup:
1. 📸 **Grant camera permissions** when prompted
2. 🔐 **Create an account** at `http://localhost:3000`
3. 📊 **Start a study session** and begin tracking
4. 📈 **View analytics** to monitor your progress

## 🚀 Usage

### Getting Started

1. **Access the Application**
   - Open your browser and navigate to `http://localhost:3000`
   - The backend API runs on `http://localhost:5000`

2. **Create an Account**
   - Click "Sign Up" to create a new account
   - Provide username, email, and password
   - Verify your email (if email verification is enabled)

3. **Set Up Your Profile**
   - Complete your profile information
   - Set study goals and preferences
   - Grant camera permissions for eye tracking

4. **Start Your First Study Session**
   - Click "Start New Session" on the dashboard
   - Choose session duration and subject
   - Ensure good lighting and camera positioning
   - Click "Begin Tracking" to start

### Camera Setup

For optimal eye tracking performance:

- **Lighting**: Ensure good, even lighting on your face
- **Camera Position**: Position camera at eye level, 50-70cm away
- **Background**: Use a plain, non-distracting background
- **Stability**: Keep your head relatively stable during tracking

### Understanding the Analytics

#### Focus Metrics
- **Attention Score**: Real-time focus level (0-100%)
- **Distraction Events**: Number and types of distractions detected
- **Focus Duration**: Continuous periods of high attention
- **Productivity Score**: Overall session effectiveness rating

#### Insights
- **Peak Focus Times**: Identify when you're most focused
- **Distraction Patterns**: Common distraction triggers and times
- **Fatigue Indicators**: Signs of mental fatigue and recommended breaks
- **Progress Trends**: Long-term improvement tracking

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
# Database
DATABASE_URL=sqlite:///study_eyes.db
SQLALCHEMY_TRACK_MODIFICATIONS=False

# Security
JWT_SECRET_KEY=your-secret-key
SECRET_KEY=your-flask-secret-key

# API
CORS_ORIGINS=http://localhost:3000

# Camera & AI
DEFAULT_CAMERA_INDEX=0
CAMERA_RESOLUTION_WIDTH=640
CAMERA_RESOLUTION_HEIGHT=480
MODEL_UPDATE_INTERVAL=300
```

#### Frontend (.env)
```env
# API Configuration
REACT_APP_API_BASE_URL=http://localhost:5000/api
REACT_APP_WEBSOCKET_URL=ws://localhost:5000

# Feature Flags
REACT_APP_ENABLE_ANALYTICS=true
REACT_APP_ENABLE_NOTIFICATIONS=true
REACT_APP_ENABLE_EXPORT=true
```

### Customization

#### AI Model Configuration
- Adjust attention detection sensitivity in `services/attention_detector.py`
- Modify eye tracking parameters in `services/eye_tracking.py`
- Update model training data and retraining intervals

#### UI Customization
- Modify Tailwind CSS configuration in `tailwind.config.js`
- Update component styles in the `src/components` directory
- Customize dashboard layouts and color schemes

## 🔒 Security

### Authentication
- JWT-based authentication with secure token management
- Password hashing using bcrypt
- Session management with automatic token refresh
- Rate limiting on authentication endpoints

### Privacy
- All eye tracking data is processed locally
- Personal data is encrypted at rest
- Optional data anonymization for analytics
- GDPR-compliant data handling procedures

### Camera Privacy
- Camera access is only activated during study sessions
- No video recordings are stored
- Real-time processing with immediate data deletion
- Clear camera status indicators in the UI

## 🧪 Testing

### Running Tests

#### Backend Tests
```bash
cd backend
python -m pytest tests/ -v
```

#### Frontend Tests
```bash
cd frontend
npm test
```

#### Integration Tests
```bash
npm run test:e2e
```

### Test Coverage
- Unit tests for all core functionality
- Integration tests for API endpoints
- End-to-end tests for user workflows
- Performance tests for real-time tracking

## 📊 API Documentation

### Authentication Endpoints

#### POST /api/auth/register
Register a new user account.

**Request Body:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user_id": "integer",
  "access_token": "string"
}
```

#### POST /api/auth/login
Authenticate user and return access token.

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "access_token": "string",
  "user": {
    "id": "integer",
    "username": "string",
    "email": "string"
  }
}
```

### Session Management Endpoints

#### POST /api/sessions/start
Start a new study session.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "subject": "string",
  "planned_duration": "integer"
}
```

#### GET /api/sessions/current
Get current active session.

#### POST /api/sessions/{id}/end
End a study session.

### Analytics Endpoints

#### GET /api/analytics/dashboard
Get dashboard analytics data.

#### GET /api/analytics/insights
Get personalized insights and recommendations.

#### GET /api/analytics/export
Export session data in specified format.

**Query Parameters:**
- `format`: json|csv
- `start_date`: ISO date string
- `end_date`: ISO date string

### WebSocket Events

#### Client to Server
- `connect`: Establish connection with authentication
- `start_tracking`: Begin eye tracking for a session
- `stop_tracking`: Stop eye tracking
- `pause_tracking`: Pause tracking temporarily
- `resume_tracking`: Resume paused tracking

#### Server to Client
- `connected`: Connection established successfully
- `tracking_data`: Real-time eye tracking data
- `tracking_started`: Tracking session started
- `tracking_stopped`: Tracking session stopped
- `error`: Error message

## 🚀 Deployment

### Production Deployment

#### Backend Deployment (Heroku)
1. Create a Heroku app
2. Set environment variables
3. Configure PostgreSQL database
4. Deploy using Git

```bash
heroku create study-eyes-api
heroku config:set DATABASE_URL=postgresql://...
heroku config:set JWT_SECRET_KEY=...
git push heroku main
```

#### Frontend Deployment (Netlify/Vercel)
1. Build the production bundle
2. Configure environment variables
3. Deploy to hosting platform

```bash
npm run build
# Deploy dist/ folder to your hosting platform
```

#### Docker Deployment
Use the provided Docker configurations:

```bash
# Build and run with Docker Compose
docker-compose up -d
```

### Environment Setup
- Configure production database (PostgreSQL recommended)
- Set up SSL certificates for HTTPS
- Configure monitoring and logging
- Set up automated backups

## 🤝 Contributing

We welcome contributions to Study Eyes! Please follow these guidelines:

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

### Code Standards
- Follow PEP 8 for Python code
- Use ESLint and Prettier for JavaScript/TypeScript
- Add TypeScript types for all new code
- Include docstrings for all functions
- Write comprehensive tests

### Git and Repository Management
Before committing, ensure your changes are clean:

```bash
# Check for large files that shouldn't be committed
python check_large_files.py

# Run pre-commit checks
python pre_commit_check.py

# Verify repository size and ignored files
git status
```

**Important file size guidelines:**
- Keep individual files under 10MB
- Large models/datasets should be stored externally
- Use `.gitignore` patterns for build artifacts
- See `docs/GIT_CONFIG.md` for detailed guidelines

**Files automatically ignored:**
- Virtual environments (`venv/`, `node_modules/`)
- Build outputs (`dist/`, `build/`, `__pycache__/`)
- IDE configurations (`.vscode/`, `.idea/`)
- Large media files (`*.mp4`, `*.jpg`, etc.)
- ML models (`*.tflite`, `*.pkl`, `*.h5`)
- Database files (`*.db`, `*.sqlite`)

### Pull Request Process
1. Update documentation for new features
2. Add tests with good coverage
3. Ensure CI/CD pipeline passes
4. Request review from maintainers
5. Address feedback and merge

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Getting Help
- **Documentation**: Check this README and the `/docs` folder
- **Issues**: Create a GitHub issue for bugs or feature requests
- **Discussions**: Use GitHub Discussions for questions
- **Email**: contact@study-eyes.com

### Common Issues

#### Camera Not Working
1. Check browser permissions
2. Ensure camera is not in use by other applications
3. Verify camera drivers are installed
4. Test with different browsers

#### Poor Eye Tracking Accuracy
1. Improve lighting conditions
2. Adjust camera position
3. Reduce background distractions
4. Ensure stable head position

#### Performance Issues
1. Close unnecessary browser tabs
2. Ensure adequate system resources
3. Update browser to latest version
4. Check network connectivity

## 🗺️ Roadmap

### Version 2.0 (Planned Features)
- [ ] Mobile app support (React Native)
- [ ] Voice command integration
- [ ] Advanced AI models with deep learning
- [ ] Multi-user study rooms
- [ ] Gamification features
- [ ] Integration with popular study apps
- [ ] Advanced analytics with ML insights

### Long-term Goals
- [ ] Eye strain detection and prevention
- [ ] Personalized study recommendations
- [ ] Integration with learning management systems
- [ ] Advanced biometric monitoring
- [ ] AI-powered study content optimization

## 📈 Changelog

### v1.0.0 (Current)
- Initial release with core functionality
- Real-time eye tracking and attention detection
- User authentication and session management
- Analytics dashboard and insights
- WebSocket real-time communication

---

**Built with ❤️ by the Study Eyes Team**

For more information, visit our [website](https://study-eyes.com) or contact us at [contact@study-eyes.com](mailto:contact@study-eyes.com).

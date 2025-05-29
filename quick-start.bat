@echo off
REM Study Eyes Project Quick Start Guide

echo ====================================
echo      Study Eyes Quick Start
echo ====================================
echo.

echo Welcome to Study Eyes - AI-Powered Student Focus Monitor!
echo.
echo This interactive guide will help you get started quickly.
echo.

echo Current project status:
echo - Backend: Flask API with eye tracking
echo - Frontend: React dashboard with real-time monitoring
echo - Database: SQLite with user sessions and analytics
echo - AI: Computer vision for attention detection
echo.

:menu
echo ====================================
echo        Choose an option:
echo ====================================
echo.
echo 1. First time setup (install dependencies)
echo 2. Run tests to verify installation
echo 3. Start development servers
echo 4. Stop development servers
echo 5. View project documentation
echo 6. Check system requirements
echo 7. Exit
echo.
set /p choice="Enter your choice (1-7): "

if "%choice%"=="1" goto :setup
if "%choice%"=="2" goto :test
if "%choice%"=="3" goto :start
if "%choice%"=="4" goto :stop
if "%choice%"=="5" goto :docs
if "%choice%"=="6" goto :requirements
if "%choice%"=="7" goto :exit

echo Invalid choice. Please try again.
echo.
goto :menu

:setup
echo.
echo [INFO] Running first-time setup...
call setup.bat
echo.
echo Setup completed! You can now run tests or start the servers.
echo.
goto :menu

:test
echo.
echo [INFO] Running project tests...
call test-setup.bat
echo.
goto :menu

:start
echo.
echo [INFO] Starting development servers...
echo This will open backend (http://localhost:5000) and frontend (http://localhost:3000)
echo.
call start-dev.bat
echo.
goto :menu

:stop
echo.
echo [INFO] Stopping development servers...
call stop-dev.bat
echo.
goto :menu

:docs
echo.
echo ====================================
echo      Project Documentation
echo ====================================
echo.
echo Available documentation:
echo - README.md: Complete project overview
echo - docs/API.md: API documentation
echo - docs/DEPLOYMENT.md: Deployment guide
echo.
echo Key features:
echo - Real-time eye tracking using MediaPipe
echo - Attention level detection with ML
echo - WebSocket communication for live updates
echo - User authentication and session management
echo - Analytics dashboard with insights
echo - Camera-based monitoring with privacy controls
echo.
echo Project structure:
echo - backend/: Flask API server
echo - frontend/: React TypeScript app
echo - docs/: Documentation files
echo - *.bat: Windows utility scripts
echo.
goto :menu

:requirements
echo.
echo ====================================
echo      System Requirements
echo ====================================
echo.
echo Required software:
echo - Python 3.8+ (with pip)
echo - Node.js 16+ (with npm)
echo - Git (for version control)
echo - Webcam (for eye tracking)
echo.
echo Recommended hardware:
echo - 8GB+ RAM
echo - Multi-core processor
echo - Good lighting for camera
echo - Stable internet connection
echo.
echo Supported browsers:
echo - Chrome 80+ (recommended)
echo - Firefox 75+
echo - Edge 80+
echo.
echo Note: Camera permissions required for eye tracking functionality.
echo.
goto :menu

:exit
echo.
echo Thank you for using Study Eyes!
echo.
echo For support or questions:
echo - Check README.md for detailed instructions
echo - Review logs in backend/logs/ for troubleshooting
echo - Ensure camera permissions are granted
echo.
exit /b 0

@echo off
REM Study Eyes Backend Development Server Startup Script

echo ====================================
echo    Study Eyes Backend Server
echo ====================================
echo.

REM Check if virtual environment exists
if not exist "venv\" (
    echo [ERROR] Virtual environment not found!
    echo Please run setup.bat first to set up the environment.
    pause
    exit /b 1
)

echo [INFO] Activating virtual environment...
call venv\Scripts\activate.bat

echo [INFO] Setting environment variables...
set FLASK_APP=app.py
set FLASK_ENV=development
set FLASK_DEBUG=True

echo [INFO] Checking database...
flask db upgrade

echo [INFO] Starting Flask development server...
echo.
echo Server will be available at: http://localhost:5000
echo API documentation: http://localhost:5000/api/health
echo.
echo Press Ctrl+C to stop the server
echo.

python app.py

pause

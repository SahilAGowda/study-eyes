@echo off
echo ===============================================
echo           Study Eyes Project Setup
echo ===============================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed or not in PATH
    echo Please install Python 3.8+ from https://python.org
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

echo [INFO] Setting up Study Eyes project...
echo.

REM Setup Backend
echo [STEP 1/4] Setting up Backend...
cd backend

REM Create virtual environment if it doesn't exist
if not exist "venv" (
    echo [INFO] Creating Python virtual environment...
    python -m venv venv
)

REM Activate virtual environment and install dependencies
echo [INFO] Installing Python dependencies...
call venv\Scripts\activate.bat
pip install -r requirements.txt

REM Copy environment file if it doesn't exist
if not exist ".env" (
    echo [INFO] Creating backend .env file...
    copy .env.example .env
)

REM Initialize database if needed
echo [INFO] Setting up database...
set FLASK_APP=app.py
if not exist "instance\study_eyes.db" (
    flask db init
    flask db migrate -m "Initial migration"
    flask db upgrade
) else (
    flask db upgrade
)

cd ..

REM Setup Frontend
echo [STEP 2/4] Setting up Frontend...
cd frontend

REM Install Node.js dependencies
echo [INFO] Installing Node.js dependencies...
npm install

REM Copy environment file if it doesn't exist
if not exist ".env" (
    echo [INFO] Creating frontend .env file...
    copy .env.example .env
)

cd ..

REM Create logs directory
echo [STEP 3/4] Creating logs directory...
if not exist "logs" mkdir logs

REM Display setup completion
echo [STEP 4/4] Setup completed successfully!
echo.
echo ===============================================
echo              Setup Complete!
echo ===============================================
echo.
echo Next steps:
echo 1. Start the backend: cd backend ^&^& start-dev.bat
echo 2. Start the frontend: cd frontend ^&^& start-dev.bat
echo 3. Or use Docker: docker-compose up
echo.
echo The application will be available at:
echo - Frontend: http://localhost:3000
echo - Backend API: http://localhost:5000
echo - WebSocket: ws://localhost:5001
echo.
echo For more information, see README.md
echo.
pause

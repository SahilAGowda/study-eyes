@echo off
REM Study Eyes Backend Setup Script

echo ====================================
echo    Study Eyes Backend Setup
echo ====================================
echo.

echo [INFO] Setting up Python virtual environment...
python -m venv venv

echo [INFO] Activating virtual environment...
call venv\Scripts\activate.bat

echo [INFO] Upgrading pip...
python -m pip install --upgrade pip

echo [INFO] Installing Python dependencies...
pip install -r requirements.txt

echo [INFO] Setting up environment variables...
if not exist ".env" (
    echo [INFO] Creating .env file from template...
    copy ".env.example" ".env" 2>nul || (
        echo [WARNING] .env.example not found, creating basic .env file...
        echo DATABASE_URL=sqlite:///study_eyes.db > .env
        echo JWT_SECRET_KEY=study-eyes-development-key >> .env
        echo SECRET_KEY=study-eyes-flask-development-key >> .env
        echo FLASK_ENV=development >> .env
        echo FLASK_DEBUG=True >> .env
    )
)

echo [INFO] Setting Flask environment...
set FLASK_APP=app.py
set FLASK_ENV=development

echo [INFO] Initializing database...
flask db init 2>nul || echo [INFO] Database already initialized
flask db migrate -m "Initial setup" 2>nul || echo [INFO] No new migrations needed
flask db upgrade

echo.
echo ====================================
echo    Setup Complete!
echo ====================================
echo.
echo To start the development server, run:
echo   start-dev.bat
echo.
echo Or manually:
echo   1. venv\Scripts\activate
echo   2. python app.py
echo.

pause

@echo off
REM Study Eyes Frontend Setup Script

echo ====================================
echo    Study Eyes Frontend Setup
echo ====================================
echo.

echo [INFO] Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo [INFO] Node.js version:
node --version

echo [INFO] Installing npm dependencies...
npm install

echo [INFO] Setting up environment variables...
if not exist ".env" (
    echo [INFO] Creating .env file from template...
    copy ".env.example" ".env" 2>nul || (
        echo [WARNING] .env.example not found, creating basic .env file...
        echo REACT_APP_API_BASE_URL=http://localhost:5000/api > .env
        echo REACT_APP_WEBSOCKET_URL=ws://localhost:5000 >> .env
        echo REACT_APP_ENABLE_ANALYTICS=true >> .env
        echo REACT_APP_ENABLE_CAMERA=true >> .env
    )
)

echo.
echo ====================================
echo    Setup Complete!
echo ====================================
echo.
echo To start the development server, run:
echo   start-dev.bat
echo.
echo Or manually:
echo   npm run dev
echo.

pause

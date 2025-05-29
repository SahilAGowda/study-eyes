@echo off
REM Study Eyes Frontend Development Server Startup Script

echo ====================================
echo    Study Eyes Frontend Server
echo ====================================
echo.

REM Check if node_modules exists
if not exist "node_modules\" (
    echo [ERROR] Node modules not found!
    echo Please run setup.bat first to install dependencies.
    pause
    exit /b 1
)

echo [INFO] Starting Vite development server...
echo.
echo Frontend will be available at: http://localhost:3000
echo.
echo Press Ctrl+C to stop the server
echo.

npm run dev

pause

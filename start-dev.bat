@echo off
REM Study Eyes Project Startup Script - Runs both backend and frontend

echo ====================================
echo      Study Eyes Full Stack
echo ====================================
echo.

echo [INFO] Starting Study Eyes development environment...
echo.

REM Start backend in new window
echo [INFO] Starting backend server...
start "Study Eyes Backend" cmd /k "cd /d backend && start-dev.bat"

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend in new window
echo [INFO] Starting frontend server...
start "Study Eyes Frontend" cmd /k "cd /d frontend && start-dev.bat"

echo.
echo ====================================
echo    Development Environment Started
echo ====================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Both servers are running in separate windows.
echo Close this window or press any key to continue...
echo.

pause

@echo off
REM Study Eyes Project Stop Script - Stops all development servers

echo ====================================
echo      Study Eyes Server Stop
echo ====================================
echo.

echo [INFO] Stopping all Study Eyes development servers...
echo.

REM Kill all processes running on port 5000 (backend)
echo [INFO] Stopping backend server (port 5000)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5000') do (
    taskkill /f /pid %%a >nul 2>&1
)

REM Kill all processes running on port 3000 (frontend)
echo [INFO] Stopping frontend server (port 3000)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000') do (
    taskkill /f /pid %%a >nul 2>&1
)

REM Kill any remaining Node.js and Python processes related to the project
echo [INFO] Cleaning up remaining processes...
taskkill /f /im "python.exe" /fi "WINDOWTITLE eq Study Eyes Backend*" >nul 2>&1
taskkill /f /im "node.exe" /fi "WINDOWTITLE eq Study Eyes Frontend*" >nul 2>&1

echo.
echo ====================================
echo    Development Servers Stopped
echo ====================================
echo.
echo All Study Eyes development servers have been stopped.
echo.

pause

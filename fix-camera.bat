@echo off
echo ===========================================
echo    CAMERA TROUBLESHOOTING HELPER
echo ===========================================
echo.
echo This script will help you resolve camera issues
echo.
echo Step 1: Close all browser tabs using camera
echo - Close all Chrome/Edge/Firefox tabs
echo - Close video conferencing apps (Zoom, Teams, etc.)
echo.
pause
echo.
echo Step 2: Restart browser completely
echo - Close ALL browser windows
echo - Wait 5 seconds
echo - Open browser again
echo.
pause
echo.
echo Step 3: Check Windows camera permissions
echo - Go to Settings > Privacy > Camera
echo - Make sure "Allow apps to access your camera" is ON
echo - Make sure your browser is allowed
echo.
pause
echo.
echo Step 4: Test camera access
echo - Go to https://www.webcamtests.com/
echo - Click "Test My Cam"
echo - If it works, go back to Study Eyes
echo.
pause
echo.
echo If camera still doesn't work:
echo 1. Restart your computer
echo 2. Check if camera drivers are installed
echo 3. Try a different browser
echo.
echo Press any key to open camera test website...
pause
start https://www.webcamtests.com/
echo.
echo Done! Try Study Eyes again at http://localhost:5173/study
pause

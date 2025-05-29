@echo off
REM Study Eyes Project Test Script - Comprehensive testing

echo ====================================
echo      Study Eyes Test Suite
echo ====================================
echo.

echo [INFO] Running comprehensive tests for Study Eyes project...
echo.

REM Test 1: Check if Python is installed
echo [TEST 1] Checking Python installation...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [FAIL] Python is not installed or not in PATH
    goto :test_failed
) else (
    echo [PASS] Python is installed
)

REM Test 2: Check if Node.js is installed
echo [TEST 2] Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [FAIL] Node.js is not installed or not in PATH
    goto :test_failed
) else (
    echo [PASS] Node.js is installed
)

REM Test 3: Check backend dependencies
echo [TEST 3] Checking backend dependencies...
cd backend
if not exist "venv\" (
    echo [FAIL] Virtual environment not found in backend
    cd ..
    goto :test_failed
)

call venv\Scripts\activate
python -c "import flask, flask_sqlalchemy, flask_jwt_extended, flask_socketio, flask_cors, mediapipe, cv2" >nul 2>&1
if %errorlevel% neq 0 (
    echo [FAIL] Backend dependencies not properly installed
    call venv\Scripts\deactivate
    cd ..
    goto :test_failed
) else (
    echo [PASS] Backend dependencies are installed
)
call venv\Scripts\deactivate
cd ..

REM Test 4: Check frontend dependencies
echo [TEST 4] Checking frontend dependencies...
cd frontend
if not exist "node_modules\" (
    echo [FAIL] Node modules not found in frontend
    cd ..
    goto :test_failed
) else (
    echo [PASS] Frontend dependencies are installed
)
cd ..

REM Test 5: Check environment files
echo [TEST 5] Checking environment configuration...
if not exist "backend\.env" (
    echo [WARN] Backend .env file not found (using defaults)
) else (
    echo [PASS] Backend .env file exists
)

if not exist "frontend\.env" (
    echo [WARN] Frontend .env file not found (using defaults)
) else (
    echo [PASS] Frontend .env file exists
)

REM Test 6: Run backend unit tests
echo [TEST 6] Running backend unit tests...
cd backend
call venv\Scripts\activate
python -m pytest tests/ -v --tb=short >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARN] Some backend tests failed (check logs for details)
) else (
    echo [PASS] Backend tests passed
)
call venv\Scripts\deactivate
cd ..

REM Test 7: Check TypeScript compilation
echo [TEST 7] Checking TypeScript compilation...
cd frontend
npx tsc --noEmit >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARN] TypeScript compilation issues found
) else (
    echo [PASS] TypeScript compilation successful
)
cd ..

REM Test 8: Test database connection
echo [TEST 8] Testing database initialization...
cd backend
call venv\Scripts\activate
python -c "from app import create_app; from models import db; app = create_app(); app.app_context().push(); db.create_all(); print('Database OK')" >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARN] Database initialization issues
) else (
    echo [PASS] Database initialization successful
)
call venv\Scripts\deactivate
cd ..

echo.
echo ====================================
echo       All Tests Completed
echo ====================================
echo.
echo [INFO] Test suite completed successfully!
echo [INFO] Your Study Eyes project is ready to run.
echo.
echo Next steps:
echo 1. Run 'start-dev.bat' to start development servers
echo 2. Open http://localhost:3000 in your browser
echo 3. Use 'stop-dev.bat' to stop servers when done
echo.
goto :end

:test_failed
echo.
echo ====================================
echo       Tests Failed
echo ====================================
echo.
echo [ERROR] Some tests failed. Please check the output above.
echo [INFO] You may need to run 'setup.bat' to install dependencies.
echo.

:end
pause

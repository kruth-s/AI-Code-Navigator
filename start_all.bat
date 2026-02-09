@echo off
echo ========================================
echo   AI Code Navigator - Full Stack
echo ========================================
echo.
echo Starting Backend and Frontend...
echo.

REM Start Backend in new window
echo [1/2] Starting Backend Server (Port 8000)...
start "Akaza Backend" cmd /k "cd server && start_server.bat"

REM Wait for backend to initialize
timeout /t 5 /nobreak >nul

REM Start Frontend in new window
echo [2/2] Starting Frontend (Port 3000)...
start "Akaza Frontend" cmd /k "cd client && npm run dev"

echo.
echo ========================================
echo   Services Started!
echo ========================================
echo.
echo Backend API:  http://127.0.0.1:8000
echo API Docs:     http://127.0.0.1:8000/docs
echo Frontend UI:  http://localhost:3000
echo.
echo Press any key to open the application in your browser...
pause >nul

REM Open browser
start http://localhost:3000

echo.
echo Application opened in browser!
echo Close the terminal windows to stop the services.
echo.

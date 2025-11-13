@echo off
echo Starting Mold Management System...

echo.
echo Starting backend server...
start "Backend Server" cmd /k "cd server && node simple-server.js"

echo.
echo Waiting for server to start...
timeout /t 3 /nobreak > nul

echo.
echo Starting frontend client...
start "Frontend Client" cmd /k "cd client && npm run dev"

echo.
echo Both servers are starting...
echo Backend: http://localhost:5001
echo Frontend: http://localhost:3000
echo.
echo Press any key to exit...
pause > nul

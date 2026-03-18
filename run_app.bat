@echo off
echo Starting SVKM NMIMS Hostel Management System...
echo ================================================

echo 1. Ensuring dependencies are installed...
cd backend
call npm install

echo 2. Starting Node.js Backend Server...
start "Backend Server" cmd /k "node server.js"

echo 3. Launching Frontend in Default Browser...
cd ../frontend
start index.html

echo Done! The app should open automatically.
pause

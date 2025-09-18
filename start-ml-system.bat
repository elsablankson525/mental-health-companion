@echo off
echo 🧠 Starting Mental Health Companion ML System
echo ================================================

echo.
echo 📦 Starting ML Backend...
start "ML Backend" cmd /k "cd ml_backend && python start.py"

echo.
echo ⏳ Waiting for ML backend to start...
timeout /t 5 /nobreak > nul

echo.
echo 🚀 Starting Frontend...
start "Frontend" cmd /k "npm run dev"

echo.
echo ✅ System started!
echo.
echo 🌐 Frontend: http://localhost:3000
echo 🤖 ML Backend: http://localhost:5000
echo.
echo Press any key to close this window...
pause > nul

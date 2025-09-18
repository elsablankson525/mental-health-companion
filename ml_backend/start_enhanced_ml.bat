@echo off
echo 🧠 Mental Health Companion - Enhanced ML Backend
echo ================================================

echo 📦 Installing requirements...
pip install -r requirements_enhanced.txt

echo 🔧 Setting up environment...
if not exist "models" mkdir models
if not exist "logs" mkdir logs

echo 🚀 Starting Enhanced ML Backend...
echo.
echo 📍 Server will be available at: http://localhost:5000
echo 🔗 API endpoints:
echo    - GET  /api/health
echo    - POST /api/sentiment
echo    - POST /api/predict-mood
echo    - POST /api/recommendations
echo    - POST /api/feedback
echo    - POST /api/patterns
echo    - GET  /api/insights
echo    - POST /api/train
echo.
echo 💡 Press Ctrl+C to stop the server
echo ================================================

python start_enhanced.py

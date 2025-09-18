@echo off
echo 🧠 Mental Health Companion - Enhanced ML Backend Deployment
echo ============================================================

echo 📦 Installing enhanced requirements...
pip install -r requirements_enhanced.txt

echo 🔧 Setting up environment...
if not exist "models" mkdir models
if not exist "logs" mkdir logs

echo 🚀 Starting Enhanced ML Backend...
python start_enhanced.py

pause

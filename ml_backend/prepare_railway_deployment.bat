@echo off
REM Railway Deployment Preparation Script for Windows

echo 🚀 Preparing ML Backend for Railway Deployment...

REM Check if we're in the right directory
if not exist "app.py" (
    echo ❌ Error: app.py not found. Please run this script from the ml_backend directory.
    pause
    exit /b 1
)

echo ✅ Found app.py

REM Check required files
set required_files=requirements.txt Procfile railway.json nixpacks.toml runtime.txt
for %%f in (%required_files%) do (
    if exist "%%f" (
        echo ✅ Found %%f
    ) else (
        echo ❌ Missing %%f
        pause
        exit /b 1
    )
)

REM Check models directory
if exist "models" (
    echo ✅ Found models directory
    if exist "models\mood_predictor.joblib" (
        echo ✅ Found models\mood_predictor.joblib
    ) else (
        echo ⚠️  Warning: models\mood_predictor.joblib not found
    )
    if exist "models\scaler.joblib" (
        echo ✅ Found models\scaler.joblib
    ) else (
        echo ⚠️  Warning: models\scaler.joblib not found
    )
    if exist "models\vectorizer.joblib" (
        echo ✅ Found models\vectorizer.joblib
    ) else (
        echo ⚠️  Warning: models\vectorizer.joblib not found
    )
) else (
    echo ❌ Models directory not found
    pause
    exit /b 1
)

REM Test the application locally
echo 🧪 Testing application locally...
python -c "import sys; from app import app; print('✅ Application imports successfully')" 2>nul
if errorlevel 1 (
    echo ❌ Application import failed
    pause
    exit /b 1
)

REM Check if all dependencies are available
echo 📦 Checking dependencies...
python -c "import flask, flask_cors, pandas, numpy, textblob, joblib, gunicorn; print('✅ All required modules available')" 2>nul
if errorlevel 1 (
    echo ❌ Some required modules are missing
    echo Please run: pip install -r requirements.txt
    pause
    exit /b 1
)

echo.
echo 🎉 ML Backend is ready for Railway deployment!
echo.
echo 📋 Next steps:
echo 1. Push your code to a Git repository (GitHub, GitLab, etc.)
echo 2. Go to https://railway.app and sign in
echo 3. Create a new project and connect your repository
echo 4. Set the root directory to 'ml_backend'
echo 5. Deploy!
echo.
echo 📖 For detailed instructions, see RAILWAY_DEPLOYMENT_GUIDE.md
echo.
echo 🔗 Your API will be available at: https://your-app-name.railway.app/api
echo.
pause

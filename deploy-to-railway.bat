@echo off
echo 🚀 Mental Health Companion - Railway Deployment
echo ================================================
echo.

echo 📋 Preparing ML Backend for Railway Deployment...
echo.

echo ✅ Checking ML Backend Structure...
if exist "ml_backend\app.py" (
    echo ✅ app.py found
) else (
    echo ❌ app.py not found
    pause
    exit /b 1
)

if exist "ml_backend\requirements.txt" (
    echo ✅ requirements.txt found
) else (
    echo ❌ requirements.txt not found
    pause
    exit /b 1
)

if exist "ml_backend\railway.json" (
    echo ✅ railway.json found
) else (
    echo ❌ railway.json not found
    pause
    exit /b 1
)

echo.
echo 🎯 Railway Deployment Steps:
echo ============================
echo.
echo 1. Go to https://railway.app
echo 2. Sign up/Login with GitHub
echo 3. Click "New Project"
echo 4. Select "Deploy from GitHub repo"
echo 5. Choose your repository: mental-health-companion
echo 6. Set Root Directory: ml_backend
echo 7. Railway will auto-detect Python and deploy
echo.
echo 📝 Environment Variables to Set in Railway:
echo ===========================================
echo.
echo DATABASE_URL=postgresql://neondb_owner:npg_21ADOrVLdFaS@ep-restless-mode-ad4uhxnc-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require^&channel_binding=require
echo FLASK_ENV=production
echo FLASK_DEBUG=False
echo PORT=5000
echo HOST=0.0.0.0
echo SECRET_KEY=your-production-secret-key-here
echo CORS_ORIGINS=https://your-app.vercel.app
echo.
echo 🧪 After Deployment:
echo ===================
echo.
echo 1. Copy your Railway URL (e.g., https://your-app.up.railway.app)
echo 2. Run: node test-railway-deployment.js
echo 3. Update your .env file with the Railway URL
echo.
echo ✅ ML Backend is ready for Railway deployment!
echo.
pause

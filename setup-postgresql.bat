@echo off
echo ========================================
echo Mental Health Companion - PostgreSQL Setup
echo ========================================
echo.

echo Step 1: Installing PostgreSQL dependencies...
call npm install
echo.

echo Step 2: Setting up database schema...
call npx prisma generate
call npx prisma db push
echo.

echo Step 3: Installing ML backend dependencies...
cd ml_backend
call pip install -r requirements.txt
cd ..
echo.

echo Step 4: Creating environment files...
if not exist .env.local (
    copy env.example .env.local
    echo Created .env.local file. Please update with your PostgreSQL credentials.
)

if not exist ml_backend\.env (
    copy ml_backend\.env.example ml_backend\.env 2>nul
    echo Created ML backend .env file.
)
echo.

echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Update .env.local with your PostgreSQL password
echo 2. Update ml_backend\.env with your PostgreSQL password
echo 3. Make sure PostgreSQL 17 is running
echo 4. Run: npm run dev
echo.
echo For detailed setup instructions, see DATABASE_SETUP.md
echo.
pause

@echo off
echo 🔐 Setting up Enhanced Authentication System...
echo.

REM Check if .env file exists
if not exist .env (
    echo 📝 Creating .env file from template...
    copy env.example .env
    echo ✅ .env file created. Please update the environment variables.
    echo.
) else (
    echo ✅ .env file already exists.
    echo.
)

REM Database setup
echo 🗄️  Setting up database...
echo 📊 Generating Prisma client...
call npx prisma generate
if %errorlevel% neq 0 (
    echo ❌ Prisma generate failed
    goto :error
)

echo 🔄 Pushing database schema...
call npx prisma db push
if %errorlevel% neq 0 (
    echo ❌ Database push failed
    goto :error
)

echo 🌱 Seeding database...
call npx prisma db seed
if %errorlevel% neq 0 (
    echo ❌ Database seed failed
    goto :error
)

echo ✅ Database setup completed.
echo.

echo 🎉 Enhanced Authentication Setup Complete!
echo.
echo 📋 Next Steps:
echo 1. Update your .env file with:
echo    - Google OAuth credentials (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET)
echo    - Twilio credentials for SMS (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER)
echo    - Your domain URL (NEXTAUTH_URL)
echo.
echo 2. Start the development server:
echo    npm run dev
echo.
echo 3. Test the authentication:
echo    - Email/Password login
echo    - Google OAuth login
echo    - Phone number OTP login
echo.
echo 🔒 Security Features Enabled:
echo    ✅ Rate limiting
echo    ✅ Account lockout protection
echo    ✅ Secure password requirements
echo    ✅ CSRF protection
echo    ✅ Security headers
echo    ✅ Login attempt logging
echo    ✅ OTP verification
echo    ✅ Session security
echo.
echo 📚 For more information, see SECURITY.md
goto :end

:error
echo.
echo ❌ Setup failed. Please check the error messages above.
echo Make sure PostgreSQL is running and DATABASE_URL is correct.

:end
pause

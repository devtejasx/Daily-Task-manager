@echo off
echo.
echo ==========================================
echo   Task Manager - Deployment Helper
echo ==========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install it from https://nodejs.org
    pause
    exit /b 1
)
echo ✅ Node.js found

REM Check if Heroku CLI is installed
where heroku >nul 2>nul
if errorlevel 1 (
    echo ❌ Heroku CLI is not installed.
    echo    Download from: https://devcenter.heroku.com/articles/nodejs-support
    pause
    exit /b 1
)
echo ✅ Heroku CLI found

REM Check if Git is installed
where git >nul 2>nul
if errorlevel 1 (
    echo ❌ Git is not installed. Please install it from https://git-scm.com
    pause
    exit /b 1
)
echo ✅ Git found

echo.
echo ==========================================
echo   Step 1: Dependencies
echo ==========================================
echo.

cd backend
echo Installing backend dependencies...
call npm install
if errorlevel 1 (
    echo ❌ Failed to install backend dependencies
    pause
    exit /b 1
)
echo ✅ Backend dependencies installed

cd ..\frontend
echo Installing frontend dependencies...
call npm install
if errorlevel 1 (
    echo ❌ Failed to install frontend dependencies
    pause
    exit /b 1
)
echo ✅ Frontend dependencies installed

cd ..

echo.
echo ==========================================
echo   Step 2: Heroku Login
echo ==========================================
echo.
echo Opening browser for Heroku login...
call heroku login

echo.
echo ==========================================
echo   Step 3: Create Heroku App
echo ==========================================
echo.
set /p APP_NAME="Enter your Heroku app name (e.g., taskmanager-api-yourname): "

cd backend
call heroku create %APP_NAME%
if errorlevel 1 (
    echo ❌ Failed to create Heroku app (may already exist)
)

echo.
echo ==========================================
echo   Step 4: Set Environment Variables
echo ==========================================
echo.
echo ⚠️  You need to add these environment variables to your Heroku app:
echo.
echo   1. MONGODB_URI - Your MongoDB Atlas connection string
echo   2. REDIS_URL - Your Redis Cloud connection string
echo   3. JWT_SECRET - A strong random secret (min 32 chars)
echo   4. FRONTEND_URL - Your Netlify URL (will be provided later)
echo   5. NODE_ENV - Set to "production"
echo.
echo Example command:
echo   heroku config:set MONGODB_URI="your_mongodb_url" REDIS_URL="your_redis_url" JWT_SECRET="your_secret" FRONTEND_URL="your_netlify_url" NODE_ENV="production"
echo.
pause

echo.
echo ==========================================
echo   Step 5: Deploy Backend
echo ==========================================
echo.

REM Ensure we're in git repository
if not exist ..\..\.git (
    echo Initializing git repository...
    cd ..\..
    call git init
    call git add .
    call git commit -m "Initial commit"
    cd backend
)

echo Deploying to Heroku...
call git push heroku main
if errorlevel 1 (
    echo Trying alternate branch name...
    call git push heroku master
)

echo.
echo ==========================================
echo   ✅ Deployment Complete!
echo ==========================================
echo.
echo Next steps:
echo   1. Get your Heroku app URL: heroku domains
echo   2. Update frontend/.env.production with your backend URL
echo   3. Deploy frontend to Netlify (via GitHub or drag-and-drop)
echo   4. Test the application
echo.
cd ..
pause

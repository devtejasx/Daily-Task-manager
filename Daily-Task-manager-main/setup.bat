@echo off
REM TaskMaster Setup Script for Windows
REM This script automates the initial setup process

echo.
echo 🚀 TaskMaster Setup Script
echo ==========================
echo.

REM Check Node.js
echo Checking prerequisites...
node -v >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js 18+
    pause
    exit /b 1
)
echo ✓ Node.js is installed

REM Check npm
npm -v >nul 2>&1
if errorlevel 1 (
    echo ❌ npm is not installed
    pause
    exit /b 1
)
echo ✓ npm is installed

REM Initialize git if needed
if not exist .git (
    echo Initializing git repository...
    git init
)

REM Install dependencies
echo.
echo Installing node dependencies (this may take a few minutes)...
call npm install

echo Installing Backend dependencies...
cd backend
call npm install
cd ..

echo Installing Frontend dependencies...
cd frontend
call npm install
cd ..

REM Create environment files
echo.
echo Setting up environment variables...

if not exist backend\.env (
    echo Creating backend/.env from .env.example
    copy backend\.env.example backend\.env
    echo.
    echo ⚠️  Edit backend\.env with your settings:
    echo    - MONGODB_URI
    echo    - JWT_SECRET
    echo    - REDIS_URL (if using remote)
)

if not exist frontend\.env.local (
    echo Creating frontend/.env.local from .env.example
    copy frontend\.env.example frontend\.env.local
)

REM Check for Docker
echo.
set /p use_docker="Would you like to use Docker? (y/n): "

if "%use_docker%"=="y" (
    docker -v >nul 2>&1
    if errorlevel 1 (
        echo ❌ Docker is not installed
        echo Please install Docker Desktop from docker.com
    ) else (
        echo ✓ Docker is installed
        echo Building Docker containers...
        docker-compose build
        echo.
        echo ✓ Docker setup complete!
        echo.
        echo To start development servers:
        echo   docker-compose up -d
        echo.
        echo Access:
        echo   Frontend: http://localhost:3000
        echo   Backend: http://localhost:5000
    )
) else (
    echo.
    echo Make sure MongoDB and Redis are running locally!
    echo.
    echo To start development servers:
    echo   Terminal 1: cd backend ^&^& npm run dev
    echo   Terminal 2: cd frontend ^&^& npm run dev
)

echo.
echo ✓ Setup complete!
echo.
echo Next steps:
echo 1. Configure environment variables:
echo    - backend\.env
echo    - frontend\.env.local (optional for local dev)
echo 2. Start the development servers
echo 3. Open http://localhost:3000 in your browser
echo 4. Register and start creating tasks!
echo.
echo For more information, see:
echo   - README.md
echo   - docs/INSTALLATION.md
echo   - docs/DEVELOPMENT_PHASES.md
echo.
pause

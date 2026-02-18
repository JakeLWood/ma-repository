@echo off
REM M&A Platform - Startup Script for Windows
REM This script helps you start the M&A Platform quickly

echo.
echo ======================================
echo   M&A Platform - Startup Script
echo ======================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed
    echo Please install Node.js 18+ from https://nodejs.org/
    pause
    exit /b 1
)

echo [OK] Node.js detected
node --version
echo.

REM Check for Docker
where docker >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [INFO] Docker detected - you can use: docker-compose up -d
) else (
    echo [WARNING] Docker not detected
)
echo.

REM Setup backend
echo Setting up backend...
cd server

if not exist ".env" (
    echo    Creating .env file...
    copy .env.example .env >nul
    echo    [OK] .env file created
)

if not exist "node_modules" (
    echo    Installing backend dependencies...
    call npm install
    echo    [OK] Backend dependencies installed
) else (
    echo    [OK] Backend dependencies already installed
)

if not exist "node_modules\.prisma" (
    echo    Generating Prisma client...
    call npx prisma generate
    echo    [OK] Prisma client generated
)

cd ..

REM Setup frontend
echo.
echo Setting up frontend...
cd client

if not exist ".env" (
    echo    Creating .env file...
    copy .env.example .env >nul
    echo    [OK] .env file created
)

if not exist "node_modules" (
    echo    Installing frontend dependencies...
    call npm install
    echo    [OK] Frontend dependencies installed
) else (
    echo    [OK] Frontend dependencies already installed
)

cd ..

REM Instructions
echo.
echo ======================================
echo   Setup Complete!
echo ======================================
echo.
echo Next Steps:
echo.
echo 1. Start the database:
echo    docker-compose up -d
echo.
echo 2. In a new terminal, start the backend:
echo    cd server
echo    npm run dev
echo.
echo 3. In another terminal, start the frontend:
echo    cd client
echo    npm run dev
echo.
echo 4. Open your browser:
echo    http://localhost:5173
echo.
echo Default Login:
echo    Email:    admin@ma-platform.com
echo    Password: Admin123!
echo.
echo Tip: Check QUICKSTART.md for detailed instructions
echo.
pause

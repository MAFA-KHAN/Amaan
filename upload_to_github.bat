@echo off
echo ========================================
echo AMAAN - GitHub Upload Script
echo ========================================
echo.

REM Check if Git is installed
where git >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Git is not installed!
    echo.
    echo Please install Git from: https://git-scm.com/download/win
    echo.
    pause
    exit /b 1
)

echo [1/6] Initializing Git repository...
git init

echo.
echo [2/6] Adding all files...
git add .

echo.
echo [3/6] Creating initial commit...
git commit -m "Initial commit: AMAAN - Location Intelligence & Safety Navigation for Islamabad"

echo.
echo [4/6] Adding remote repository...
git remote add origin https://github.com/MAFA-KHAN/Amaan.git

echo.
echo [5/6] Setting main branch...
git branch -M main

echo.
echo [6/6] Pushing to GitHub...
git push -u origin main

echo.
echo ========================================
echo SUCCESS! Repository uploaded to GitHub
echo ========================================
echo.
echo View your repository at:
echo https://github.com/MAFA-KHAN/Amaan
echo.
pause

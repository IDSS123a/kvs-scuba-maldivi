@echo off
SETLOCAL EnableDelayedExpansion

REM KVS Scuba Maldivi - Update Script
cd /d c:\DAVOR_IDSS\Locker\AI\Maldivi\kvs-scuba-maldivi

echo.
echo ========================================
echo Updating KVS-SCUBA on GitHub...
echo ========================================

REM Check if git is initialized, if not initialize it
if not exist .git (
    echo [!] Initializing Git...
    git init
    git remote add origin https://github.com/IDSS123a/kvs-scuba-maldivi.git
    git branch -M main
)

echo.
echo Step 1: Staging files...
git add .

echo.
echo Step 2: Committing changes...
set "commit_msg=Fix: Supabase schema mismatch (name/ssi_number) and admin actions"
git commit -m "!commit_msg!"

echo.
echo Step 3: Pushing to GitHub (main)...
git push origin main

echo.
echo ========================================
echo SUCCESS: Changes pushed to GitHub!
echo Vercel will now start the automatic build.
echo ========================================
echo.

git log --oneline -3

echo.
pause
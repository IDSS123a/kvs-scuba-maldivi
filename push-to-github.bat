@echo off
REM Git initialization and push to GitHub
REM KVS Scuba Maldivi Project

cd /d c:\DAVOR_IDSS\Locker\AI\Maldivi\kvs-scuba-maldivi

echo.
echo ========================================
echo Step 1: Initialize Git Repository
echo ========================================
git init

echo.
echo ========================================
echo Step 2: Configure User Information
echo ========================================
git config user.name "IDSS123a"
git config user.email "idsssarajevo@gmail.com"

echo.
echo ========================================
echo Step 3: Set Remote Origin
echo ========================================
git remote remove origin
git remote add origin https://github.com/IDSS123a/kvs-scuba-maldivi.git

echo.
echo ========================================
echo Step 4: Stage All Files
echo ========================================
git add .

echo.
echo ========================================
echo Step 5: Create Initial Commit
echo ========================================
git commit -m "Initial commit: kvs-scuba-maldivi complete deployment package"

echo.
echo ========================================
echo Step 6: Rename Branch to Main
echo ========================================
git branch -M main

echo.
echo ========================================
echo Step 7: Push to GitHub
echo ========================================
git push -u origin main

echo.
echo ========================================
echo Step 8: Verify Push
echo ========================================
git log --oneline -5
echo.
echo Push complete! Check https://github.com/IDSS123a/kvs-scuba-maldivi
echo.
pause
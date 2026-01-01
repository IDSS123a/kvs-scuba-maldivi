@echo off
echo ============================================================
echo KVS-SCUBA MALDIVES 2026 - ROOT CLEANUP SCRIPT
echo ============================================================
echo.
echo This script will delete the legacy root-level files and folders
echo that have been successfully migrated to the src/ directory.
echo.
set /p confirm="Are you sure you want to proceed? (Y/N): "
if /i "%confirm%" neq "Y" goto cancel

echo.
echo [1/2] Deleting legacy directories...
if exist "components" rd /s /q "components"
if exist "services" rd /s /q "services"
if exist "utils" rd /s /q "utils"
if exist "contexts" rd /s /q "contexts"

echo [2/2] Deleting legacy root files...
if exist "App.tsx" del /f /q "App.tsx"
if exist "constants.tsx" del /f /q "constants.tsx"
if exist "i18n.ts" del /f /q "i18n.ts"
if exist "index.tsx" del /f /q "index.tsx"
if exist "mapConstants.tsx" del /f /q "mapConstants.tsx"
if exist "styles.css" del /f /q "styles.css"
if exist "types.ts" del /f /q "types.ts"

echo.
echo ============================================================
echo CLEANUP COMPLETE!
echo Legacy root-level files and folders have been removed.
echo ============================================================
pause
exit

:cancel
echo.
echo Cleanup cancelled. No files were deleted.
pause
exit

@echo off
chcp 65001 >nul 2>&1
title SaiWei Sport - Auto Deploy

echo ============================================
echo   SaiWei Sport Auto Deploy
echo ============================================
echo.

cd /d "%~dp0"

:: Check for changes (including untracked files)
git status --porcelain >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Not a git repository. Initializing...
    git init
    git remote add origin https://github.com/vipuare/saiwei.git
)

:: Get current date and time for commit message
for /f "tokens=1-3 delims=/" %%a in ('echo %date:~0,10%') do set "commit_date=%%a-%%b-%%c"
for /f "tokens=1-2 delims=:" %%a in ('echo %time%') do set "commit_time=%%a:%%b"
set "msg=Auto deploy %commit_date% %commit_time%"

:: Stage all changes
echo [1/4] Staging files...
git add -A

:: Check if there is anything to commit
git diff --cached --quiet
if %errorlevel% equ 0 (
    echo.
    echo [INFO] No changes to commit.
) else (
    echo [2/4] Committing...  %msg%
    git commit -m "%msg%"
)

:: Push to remote
echo [3/4] Pushing to GitHub...
git push -u origin main
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Push failed. Possible reasons:
    echo   - No login credentials configured
    echo   - Network connection issue
    echo   - Remote branch conflict
    echo.
    echo You can try manually:
    echo   git push -u origin main
) else (
    echo.
    echo ============================================
    echo   Deploy complete!
    echo ============================================
)

echo.
pause

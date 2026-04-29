@echo off
echo ==========================================
echo    MEC UAFMS - Push to New GitHub Account
echo ==========================================

:: Configure local git identity for this repo
git config user.name "Maruti Education"
git config user.email "marutieducation64@gmail.com"

:: Set the new remote URL
echo Updating remote URL...
git remote set-url origin https://github.com/marutieducation/MEC.git

:: Stage and commit
echo Staging changes...
git add .
echo Committing...
git commit -m "Update: Implementation of static university logos and UI polish"

:: Push
echo Pushing to GitHub (master branch)...
echo ------------------------------------------
echo NOTE: If a login popup appears, please sign in with your NEW account.
echo ------------------------------------------
git push -u origin master

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Push failed. 
    echo Please make sure you have:
    echo 1. Created the repository "MEC" on the "marutieducation" GitHub account.
    echo 2. Logged into the correct account in the popup.
) else (
    echo.
    echo [SUCCESS] Code pushed successfully to marutieducation/MEC
)

pause

@echo off
title Starting DataPulse AI Analyst...
color 0A

echo ===================================================
echo        DataPulse AI - AI Data Analyst
echo ===================================================
echo.
echo Starting Next.js server on http://localhost:3000...
echo Please wait 5 seconds while server initializes...
echo.

:: Launch browser after 5 seconds delay in background
start "" cmd /c "timeout /t 4 >nul && start http://localhost:3000"

:: Start Next.js dev server using cmd wrapper to prevent execution policy issues
cmd /c "npm run dev"

pause

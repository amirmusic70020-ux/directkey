@echo off
title DirectKey - Starting...
color 0A
echo.
echo  ================================================
echo    DirectKey MVP - Starting Development Server
echo  ================================================
echo.

cd /d "%~dp0"

echo [1/2] Installing dependencies (first time only)...
call npm install

echo.
echo [2/2] Starting DirectKey server...
echo.
echo  Site will open at: http://localhost:3000/en
echo  Press Ctrl+C to stop the server.
echo.

start "" "http://localhost:3000/en"
call npm run dev
pause

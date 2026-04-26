@echo off
echo.
echo ==============================================
echo   DirectKey CRM - Airtable Setup
echo ==============================================
echo.
echo NOTE: Make sure your .env.local has:
echo   AIRTABLE_TOKEN=your_token
echo   AIRTABLE_BASE_ID=your_base_id
echo.

cd /d "C:\Users\Asus\Documents\GitHub\directkey"

echo Running setup script...
echo.

node -e "require('dotenv').config({path:'.env.local'})" scripts\airtable-setup.js

echo.
echo ==============================================
pause

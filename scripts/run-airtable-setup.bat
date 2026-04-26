@echo off
echo.
echo ==============================================
echo   DirectKey CRM - Airtable Setup
echo ==============================================
echo.

set AIRTABLE_TOKEN=patj7fd7T7Rah0nZd.76dd66aabd542f90ec78cc673727c148412ff7a12d1cabdb5324224de88c5830
set AIRTABLE_BASE_ID=app9s86IQWv5SkBk5

cd /d "C:\Users\Asus\Documents\GitHub\directkey"

echo Running setup script...
echo.

node scripts\airtable-setup.js

echo.
echo ==============================================
pause

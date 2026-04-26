@echo off
del /f "C:\Users\Asus\Documents\GitHub\directkey\.git\index.lock" 2>nul
del /f "C:\Users\Asus\Documents\GitHub\directkey\.git\HEAD.lock" 2>nul
del /f "C:\Users\Asus\Documents\GitHub\directkey\.git\objects\maintenance.lock" 2>nul
echo Done! Lock files removed.
pause

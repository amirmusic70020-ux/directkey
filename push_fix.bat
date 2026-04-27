@echo off
cd /d "C:\Users\Asus\Documents\GitHub\directkey"

:: Try git from PATH first
where git >nul 2>nul
if %errorlevel% equ 0 (
    echo Found git in PATH
    git add package.json app\api\whatsapp\route.ts
    git commit -m "fix: use waitUntil to keep Vercel function alive for SARA async processing"
    git push
    goto :done
)

:: Try common installation paths
set FOUND=0

if exist "C:\Program Files\Git\cmd\git.exe" (
    set GITEXE=C:\Program Files\Git\cmd\git.exe
    set FOUND=1
)
if %FOUND%==0 if exist "C:\Program Files (x86)\Git\cmd\git.exe" (
    set GITEXE=C:\Program Files (x86)\Git\cmd\git.exe
    set FOUND=1
)
if %FOUND%==0 if exist "%LOCALAPPDATA%\Programs\Git\cmd\git.exe" (
    set GITEXE=%LOCALAPPDATA%\Programs\Git\cmd\git.exe
    set FOUND=1
)
if %FOUND%==0 if exist "C:\Users\Asus\AppData\Local\Programs\Git\cmd\git.exe" (
    set GITEXE=C:\Users\Asus\AppData\Local\Programs\Git\cmd\git.exe
    set FOUND=1
)
if %FOUND%==0 if exist "C:\Program Files\Git\bin\git.exe" (
    set GITEXE=C:\Program Files\Git\bin\git.exe
    set FOUND=1
)

if %FOUND%==0 (
    echo ERROR: Cannot find git.exe! Please add Git to your PATH.
    goto :done
)

echo Using git at: %GITEXE%
"%GITEXE%" add package.json app\api\whatsapp\route.ts
"%GITEXE%" commit -m "fix: use waitUntil to keep Vercel function alive for SARA async processing"
"%GITEXE%" push

:done
echo.
echo Done! Check Vercel for deployment.
pause

@echo off
echo 🧹 Cleaning up ports and starting Tourist Safety Dashboard...
echo.

REM Kill processes on common development ports
echo Freeing up ports 3000, 5500, 8000, 8080...
for %%p in (3000 5500 8000 8080) do (
    echo Checking port %%p...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :%%p 2^>nul') do (
        echo Killing process %%a on port %%p
        taskkill /F /PID %%a >nul 2>&1
    )
)

echo.
echo 🚀 Starting development server...
npm run dev

pause
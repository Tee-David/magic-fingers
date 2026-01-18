@echo off
setlocal
set "PORT=3000"

echo ===================================================
echo   Magic Fingers - Local Server Starter
echo ===================================================
echo.

:: Check if Node.js is installed and npx exists
where npx >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo [OK] Node.js detected. Launching server with npx serve...
    echo.
    echo The app will open at http://localhost:%PORT%
    start http://localhost:%PORT%
    npx -y serve -l %PORT% .
    goto :end
)

:: Check if Python is installed
where python >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo [OK] Python detected. Launching server with http.server...
    echo.
    echo The app will open at http://localhost:%PORT%
    start http://localhost:%PORT%
    python -m http.server %PORT%
    goto :end
)

echo [ERROR] Neither Node.js nor Python detected!
echo.
echo To run this app, you need a local web server due to browser security restrictions.
echo Please install Node.js (https://nodejs.org) or Python (https://python.org).
echo.
pause

:end
localend

@echo off
setlocal

echo Building Windows installer...

where npm >nul 2>nul
if errorlevel 1 (
    echo npm was not found. Install Node.js and try again.
    exit /b 1
)

echo Installing dependencies...
call npm ci
if errorlevel 1 exit /b 1

echo Generating icons...
call npm run icon:generate
if errorlevel 1 exit /b 1

echo Packaging installer...
call npm run electron:win
if errorlevel 1 exit /b 1

echo Done. Installer output is available in dist-electron\
endlocal

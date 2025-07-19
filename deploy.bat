@echo off
echo Starting deployment process...

echo Installing dependencies...
call npm ci

echo Building application...
call npm run build

if exist "dist\" (
    echo Build successful! Files ready for deployment.
    echo Contents of dist folder:
    dir dist
    
    echo Deploying to GitHub Pages...
    call npm run deploy
    
    echo Deployment complete!
    echo App should be available at: https://knoksen.github.io/ebike-assistant-app
) else (
    echo Build failed - dist folder not found
    exit /b 1
)

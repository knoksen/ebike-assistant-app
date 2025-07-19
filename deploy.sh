#!/bin/bash
# Deploy script for E-Bike Assistant

echo "Starting deployment process..."

# Install dependencies
echo "Installing dependencies..."
npm ci

# Build the application
echo "Building application..."
npm run build

# Check if build was successful
if [ -d "dist" ]; then
    echo "Build successful! Files ready for deployment."
    echo "Contents of dist folder:"
    ls -la dist/
    
    # Deploy to GitHub Pages
    echo "Deploying to GitHub Pages..."
    npm run deploy
    
    echo "Deployment complete!"
    echo "App should be available at: https://knoksen.github.io/ebike-assistant-app"
else
    echo "Build failed - dist folder not found"
    exit 1
fi

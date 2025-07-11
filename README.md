# E-Bike Assistant App

E-Bike Assistant is an AI-powered tool for diagnosing e-bike and scooter issues. Built with **React**, **TypeScript**, and **Vite**, it provides step-by-step repair guidance and performance tips. The app is designed to run entirely in the browser and can be deployed as a static site.

The app uses **React Router** for client-side navigation. The main routes are:
- `/` - Home
- `/diagnostics` - Diagnostics tools
- `/about` - Project information

## Setup

```bash
# Install dependencies
npm install

# Start the development server
npm run dev

# Lint source files
npm run lint

# Build the app for production
npm run build

# Generate a bundle size report
npm run build:analyze
```

## Deployment

### GitHub Pages

This repository is configured to publish the `dist` directory to GitHub Pages. After building, run:

```bash
npm run deploy
```

The site will be available at <https://knoksen.github.io/ebike-assistant-app>.

### Azure Static Web Apps

An Azure Static Web Apps workflow is included in `.github/workflows`. Pushes to the `main` branch trigger the workflow to build and deploy the site. Configure the `AZURE_STATIC_WEB_APPS_API_TOKEN_*` secret in your repository settings to enable automatic deployment.

### PWA support

The app can be installed like a native application. The web app manifest is
sourced from `public/manifest.json`. Update this file to change the app name or
modify icon paths if you want to use custom images.

Running `npm run build` generates `dist/manifest.webmanifest` and `sw.js` while
pre‑caching static assets so the app works offline.

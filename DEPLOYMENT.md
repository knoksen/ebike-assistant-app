# E-Bike Assistant - Deployment Guide

## Quick Start

The E-Bike Assistant app is now ready for deployment with multiple options:

### 🌐 Web Application Deployment

#### Option 1: GitHub Pages (Recommended)

```bash
# Install dependencies
npm ci

# Build the application
npm run build

# Deploy to GitHub Pages
npm run deploy
```

The app will be available at: <https://knoksen.github.io/ebike-assistant-app>

#### Option 2: Manual Deployment

```bash
# Build the application
npm run build

# The 'dist' folder contains all files needed for deployment
# Upload the contents of 'dist' to any web hosting service
```

### 🚀 Development

#### Local Development Server

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:5173 in your browser
```

#### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run tests
- `npm run lint` - Run linting

### 🖥️ Desktop Application

#### Build Desktop Apps

```bash
# Build for current platform
npm run electron:build

# Build for specific platforms
npm run electron:win    # Windows
npm run electron:mac    # macOS
npm run electron:linux  # Linux

# Development mode with hot reload
npm run electron:dev
```

### ☁️ Cloud Deployment Options

#### Azure Static Web Apps

The app includes Azure configuration. Set up automatic deployment:

1. Configure `AZURE_STATIC_WEB_APPS_API_TOKEN_*` in GitHub repository settings
2. Push to `main` branch triggers automatic deployment

#### Other Hosting Providers

The app works with any static hosting provider:

- Vercel
- Netlify
- Firebase Hosting
- AWS S3 + CloudFront
- GitHub Pages (configured)

### 📱 Progressive Web App (PWA)

The app includes PWA features:

- **Offline Support**: Works without internet connection
- **Install Prompt**: Can be installed on devices
- **Service Worker**: Caches resources for offline use
- **Manifest**: Proper web app manifest for native-like experience

### 🔧 Build Configuration

#### Environment Variables

- `VITE_BASE_URL` - Base URL for deployment (default: `/ebike-assistant-app/`)

#### Customization

Edit `vite.config.ts` to customize:

- Build output directory
- PWA settings
- Base URL for deployment

### 🚨 Troubleshooting

#### Common Issues

1. **Build fails with TypeScript errors**

   ```bash
   npm run lint
   # Fix any linting errors, then rebuild
   ```

2. **PWA not working offline**
   - Ensure service worker is registered
   - Check browser developer tools for PWA status

3. **Desktop app won't start**

   ```bash
   # Rebuild Electron app
   npm run electron:build
   ```

### 📊 Performance

The built app includes:

- Code splitting for optimal loading
- Tree shaking to reduce bundle size
- CSS optimization
- PWA caching for fast subsequent loads

### 🔒 Security

- No sensitive data stored locally (except maintenance records)
- All external links open in new tabs
- CSP headers recommended for production deployment

---

## App Features Summary

✅ **Diagnostics & Troubleshooting** - Interactive fault diagnosis
✅ **Parts Search** - Comprehensive parts database with filtering
✅ **Maintenance Tracker** - Schedule tracking with local storage
✅ **Tips & Guides** - Detailed maintenance guides and tutorials
✅ **Progressive Web App** - Installable with offline support
✅ **Desktop Applications** - Native apps for all platforms
✅ **Responsive Design** - Works on all screen sizes
✅ **Dark Mode** - Automatic and manual theme switching

The E-Bike Assistant is now ready for production use!

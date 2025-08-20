# E-Bike Assistant

A comprehensive Progressive Web App (PWA) and Desktop Application for e-bike maintenance, troubleshooting, and parts management. Built with React, TypeScript, and Vite.

## Features

- 🔧 **Diagnostics**: Troubleshoot common e-bike issues
- 🔍 **Parts Search**: Find compatible components for your e-bike
- 📱 **Progressive Web App**: Install on mobile devices for offline access
- 🖥️ **Desktop Application**: Native Windows 10/11, macOS, and Linux support
- ⚡ **Fast & Responsive**: Built with modern web technologies

---

## 🚀 One-Click Deploy & Start (Mobile)

The E-Bike Assistant app is a Progressive Web App (PWA) and can be launched instantly on any mobile device—no installation or build steps needed!

### 📲 How to Use on Mobile

1. **Open:** https://knoksen.github.io/ebike-assistant-app
2. **Install (Recommended):**
   - **Android:** Tap the browser menu (⋮) → “Add to Home screen”
   - **iOS (Safari):** Tap Share → “Add to Home Screen”
3. **Start:** Tap the home screen icon to launch the app instantly.

- Works fully offline after first load.
- No account required.
- Updates automatically.

> This app is optimized for touch and mobile navigation!

---

## Desktop Application

### Download & Install

The E-Bike Assistant is available as a native desktop application for Windows 10/11, macOS, and Linux.

#### Windows 10/11
- Download the installer (.exe) or portable version
- Run the installer for system-wide installation with Start Menu integration
- Or use the portable version for no-install usage

#### macOS
- Download the .dmg file
- Drag to Applications folder

#### Linux
- Download the AppImage file
- Make executable: `chmod +x E-Bike-Assistant-*.AppImage`
- Run directly: `./E-Bike-Assistant-*.AppImage`

### Desktop Features
- Native application menus and keyboard shortcuts
- System tray integration
- File associations
- Offline functionality
- Auto-updater support (configurable)

## Development

### Prerequisites

- Node.js 20 or higher
- npm

### Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/knoksen/ebike-assistant-app.git
   cd ebike-assistant-app
   ```

2. Install dependencies:
   ```bash
   npm ci
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:5173](http://localhost:5173) in your browser.

### Available Scripts

#### Web Development
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint
- `npm test` - Run tests with Vitest
- `npm run build:analyze` - Build with bundle analyzer

#### Desktop Development
- `npm run electron:dev` - Start Electron app in development mode
- `npm run electron:build` - Build desktop app for current platform
- `npm run electron:win` - Build Windows installer and portable app
- `npm run electron:mac` - Build macOS application
- `npm run electron:linux` - Build Linux AppImage
- `npm run electron:dist` - Build for current platform without publishing

## Deployment

This app is configured for deployment to multiple platforms:

### GitHub Pages (Recommended)

Automatic deployment is configured via GitHub Actions:

1. Push to the `main` branch triggers automatic deployment
2. The app will be available at: https://knoksen.github.io/ebike-assistant-app

Manual deployment:
```bash
npm run deploy
```

### Azure Static Web Apps

Automatic deployment is configured for Azure:

1. Configure the `AZURE_STATIC_WEB_APPS_API_TOKEN_*` secret in repository settings
2. Push to `main` branch triggers deployment

### Custom Deployment

For other hosting platforms, build the app and serve the `dist` folder:

```bash
npm run build
# Upload the 'dist' folder to your hosting provider
```

#### Environment Variables

- `VITE_BASE_URL` - Set the base URL for deployment (default: `/ebike-assistant-app/`)

## PWA Features

The app includes Progressive Web App capabilities:

- **Offline Support**: Service worker caches assets for offline use
- **Install Prompt**: Can be installed on mobile devices and desktops
- **App Icons**: Proper iconography for different platforms
- **Manifest**: Web app manifest for native-like experience

## Technology Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Vitest** - Testing framework
- **PWA Plugin** - Progressive Web App features
- **Electron** - Desktop application framework
- **electron-builder** - Desktop app packaging and distribution
- **ESLint** - Code linting

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes and add tests
4. Run tests: `npm test`
5. Run linting: `npm run lint`
6. Commit your changes: `git commit -m 'Add your feature'`
7. Push to the branch: `git push origin feature/your-feature`
8. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
# E-Bike Assistant Desktop App

## Building for Different Platforms

### Windows 10/11
```bash
npm run electron:win
```
This creates:
- NSIS installer (.exe)
- Unpacked app directory

### macOS
```bash
npm run electron:mac
```

### Linux
```bash
npm run electron:linux
```
This creates:
- AppImage (portable)
- Unpacked app directory

### Development
```bash
npm run electron:dev
```
This starts both the Vite dev server and Electron in development mode.

## Installation

### Windows
1. Run the generated `.exe` installer from `dist-electron/`
2. The installer will guide you through the installation process
3. Creates desktop and start menu shortcuts

### Manual Installation
1. Extract the unpacked directory from `dist-electron/`
2. Run the executable directly

## Features

- Native desktop application
- Windows 10 compatible
- File associations and native menus
- Desktop and Start Menu integration
- Offline functionality
- Auto-updater ready (can be configured)
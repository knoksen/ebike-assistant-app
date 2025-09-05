# E-Bike Assistant 🚲

[![CI](https://github.com/knoksen/ebike-assistant-app/actions/workflows/ci.yml/badge.svg)](https://github.com/knoksen/ebike-assistant-app/actions/workflows/ci.yml)

Your pocket e-bike companion! Track rides, diagnose issues, customize boost profiles, and maintain your e-bike - all from your phone or desktop.

![Boost Profiles](docs/screenshots/boost.png)
![Diagnostics](docs/screenshots/diagnostics.png)
![Maintenance](docs/screenshots/maintenance.png)
![Ride Tracker](docs/screenshots/home.png)

## 📱 Quick Start (30 seconds!)

1. Open [our web app](https://knoksen.github.io/ebike-assistant-app) in your phone's browser
2. Tap "Add to Home Screen" when prompted:
   - **Android:** Tap menu (⋮) → "Add to Home screen"
   - **iOS:** Tap Share → "Add to Home Screen"
3. Tap the app icon on your home screen to start

That's it! The app works offline and updates automatically.

## 🔧 Main Features

### Power Boost (NEW)

Manage eco/normal/boost/custom profiles with live telemetry awareness, activation readiness, and persistent local settings. Rapid profile switching + visual power ring.

### Bluetooth Device Connection (NEW)

Universal connect button (header + mobile dock) using a shared `useBluetooth` hook. Handles connection lifecycle, telemetry listeners, and graceful errors.

### Mobile Dock Navigation (NEW)

Bottom navigation bar on small screens for faster access to core areas (Home, Diagnostics, Boost, Settings) plus inline device status.

### Diagnose & Fix

![Diagnostics Screen](docs/screenshots/diagnostics.png)

- Quick troubleshooting guide
- Step-by-step solutions
- Common issue database
- Photo diagnosis helper

### Track Maintenance

![Maintenance Screen](docs/screenshots/maintenance.png)

- Service reminders
- Part replacement logs
- Maintenance schedule
- Wear indicators

### Find Parts

![Parts Search](docs/screenshots/parts-search.png)

- Compatible parts finder
- Price comparisons
- Installation guides
- Where to buy

### Track Your Rides

![Ride Tracker](docs/screenshots/ride-tracker.png)

- Record routes & distance
- Track performance
- View ride history
- Export ride data

### Customize

![Settings](docs/screenshots/settings.png)

- Dark/Light mode
- Units (km/miles)
- Language
- Notifications

## ⚠️ Quick Troubleshooting

Having issues? Try these quick fixes:

### App Won't Load?

- Check internet connection
- Clear browser cache
- Reinstall from home screen

### Features Not Working?

- Update to latest version
- Check permissions
- Restart the app

### Need More Help?

- Visit our [support page](https://github.com/knoksen/ebike-assistant-app/issues)
- Email us at [support@ebike-assistant.app](mailto:support@ebike-assistant.app)

## 💾 Technical Details

### Core Features

- Works offline after first install
- Automatic updates
- No account needed
- Secure: all data stays on your phone
- Low battery usage

### 📡 Bluetooth Connectivity

The app uses Bluetooth Low Energy (BLE) with GATT services to communicate with e-bikes:

#### Architecture Notes

1. **Transport Abstraction**
   - Supports both encrypted (FE95) and plain (NUS) protocols
   - Pluggable crypto implementation for secure sessions
   - Device-specific adapters handle protocol variations

2. **Security Implementation**
   - ECDH-based handshake for Xiaomi devices
   - Secure session management via `XiaomiECDH`
   - Cryptographic operations isolated in `NinebotSecureCryptor`

3. **Firmware Operations**
   - Firmware flashing capabilities are isolated
   - Not included in v1 release
   - When implemented:
     - Requires explicit user consent
     - Mandatory checksum verification
     - Extensive error handling

#### Supported Protocols

1. **Xiaomi/Mi Protocol**
   - Service UUID: `0000fe95-0000-1000-8000-00805f9b34fb`
   - Secure authentication via ECDH
   - Encrypted telemetry and commands
   - Some devices only expose FE95 with encrypted commands

2. **Nordic UART Service (NUS)**
   - Service UUID: `6e400001-b5a3-f393-e0a9-e50e24dcca9e`
   - TX Characteristic: `6e400002-b5a3-f393-e0a9-e50e24dcca9e`
   - RX Characteristic: `6e400003-b5a3-f393-e0a9-e50e24dcca9e`
   - Simple UART-style communication
   - Used by some models for direct communication

#### Device Compatibility

- Models vary in their protocol support
- Some use only encrypted FE95 service
- Others use simpler UART-style interface
- Transport layer abstracts these differences

#### Telemetry Capabilities

- Battery metrics:
  - Individual cell voltages (1-10 cells)
  - Pack voltage and current
  - State of charge
  - Temperature monitoring
  - External battery support

- Vehicle data:
  - Error code reporting
  - Total mileage tracking
  - Speed and performance metrics
  - BMS/ESC diagnostics

#### Control Features

- Cruise control management
- Riding mode presets
- Security settings
- Performance tuning

### 🔒 Security

- ECDH-based authentication
- Session encryption
- Secure parameter validation
- Rate-limited commands
- See [SECURITY.md](SECURITY.md) for details

## 🖥️ Desktop & Distribution

For power users, we also offer a desktop version with additional features. See [desktop installation guide](DESKTOP.md).

## 🚀 Release Preparation

Run the full quality gate:

```bash
npm run prep:release
```

If everything passes, create a tag and build platform packages:

```bash
git tag -a v1.0.0 -m "v1.0.0" && git push --tags
npm run electron:dist
```

Optional platform targets:

```bash
npm run electron:win
npm run electron:mac
npm run electron:linux
```

### Manual Smoke Checklist

- [ ] App loads over HTTPS (PWA install prompt shows)
- [ ] Connect button scans & handles cancel gracefully
- [ ] Boost profile save / load works after refresh
- [ ] Dark / Light mode persists
- [ ] Navigation works on mobile (dock) & desktop (header)
- [ ] No console errors in production build

### Generating Screenshots

Use your browser dev tools or a headless tool (e.g. Playwright) to capture key screens. Replace the placeholder SVGs in `docs/screenshots/` with real PNG/JPG exports of approx 800px wide.

#### Automated (Playwright)

Install once and capture:

```bash
npm i -D @playwright/test
npx playwright install --with-deps chromium
npm run build
npm run screenshots
```

PNGs will be saved into `docs/screenshots/` (home, diagnostics, boost, settings).

## �️ Development

For developer documentation and contribution guidelines, see [DEVELOPMENT.md](DEVELOPMENT.md).

## 🧹 Housekeeping / Future

Planned improvements:

- Real battery & error telemetry parsing refinements
- Firmware flashing workflow (guarded, post-1.0)
- Cloud sync (optional) with end‑to‑end encryption
- Localization pipeline

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

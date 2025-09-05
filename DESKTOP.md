# E-Bike Assistant Desktop App

## Building for Different Platforms

Generate / update icons first (only needed if SVG changed):

```bash
npm run icon:generate
```

### Windows 10/11

```bash
npm run electron:win
```

Creates:

- NSIS installer (.exe)
- Unpacked app directory

### macOS

```bash
npm run electron:mac
```

Produces default unsigned `.dmg`/`.zip` depending on target configuration. For distribution/notarization:

1. Set `CSC_IDENTITY_AUTO_DISCOVERY=true` (or specify `CSC_NAME`)
2. Provide Apple ID credentials via environment variables (`APPLE_ID`, `APPLE_ID_PASS` / app‑specific password)
3. Re-run the build

Code signing & notarization are optional for local usage but required to avoid Gatekeeper warnings in distribution.

### Linux

```bash
npm run electron:linux
```

Creates:

- AppImage (portable)
- Unpacked app directory

You can add more targets (e.g., `deb`, `rpm`) by extending the `linux.target` field in `package.json`.

### Development

```bash
npm run electron:dev
```

Starts both the Vite dev server and Electron in development mode.

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

## Icon Pipeline

Windows icon is generated from `public/ebike-icon.svg` via `scripts/generate-icon.mjs` producing multi-size PNGs and `public/icon.ico`. The build references `win.icon` in `package.json`.

For macOS `.icns` and Linux PNG directories you can extend the script—sharp already produces the required sizes—then reference via `mac.icon` / `linux.icon`.

## Security & Signing (Optional)

| Platform | Purpose | Minimal Steps |
|----------|---------|---------------|
| Windows  | Authenticode signing | Obtain code signing cert (.pfx), set `CSC_LINK` & `CSC_KEY_PASSWORD` env vars |
| macOS    | Notarization & stapling | Set Apple ID env vars, enable notarization in build pipeline |
| Linux    | Package signature metadata | Use distro-specific tooling (optional) |

If not signing, distribution still works but users may see OS warnings.

## Troubleshooting

| Issue | Symptom | Fix |
|-------|---------|-----|
| Invalid icon format | electron-builder error about image format | Re-run `npm run icon:generate` ensuring valid `.ico` present |
| Build fails fetching Electron | Network error | Retry; check corporate proxy; optionally set `ELECTRON_MIRROR` |
| SmartScreen warning | Windows shows unrecognized app | Sign the binary or instruct user to run anyway |
| macOS blocked | “App is damaged / can’t be opened” | Notarize or remove quarantine: `xattr -cr /Applications/E-Bike\\ Assistant.app` |

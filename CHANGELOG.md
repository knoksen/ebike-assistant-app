# Changelog

All notable changes to this project will be documented in this file.

The format roughly follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and adheres to semantic versioning once past v1.0.0.

## [1.0.0] - 2025-09-05
### Added

- Power Boost profiles (eco / normal / boost / custom) with persistence and live profile editing UI.
- Unified Bluetooth device connect/disconnect button + `useBluetooth` hook with connection lifecycle & telemetry listeners.
- Mobile bottom dock navigation for small screens with device status integration.
- Diagnostics Assistant with categorized faults, severity indicators, solution steps & completion tracking progress bar.
- Maintenance Tracker: scheduling, overdue highlighting, records with local persistence.
- Parts search section (placeholder visuals & structure) and ride tracking UI (battery usage, progress indicators).
- Settings with theme (dark/light), unit preferences placeholder, and future extensibility.
- Logging abstraction (`logger.ts`) with environment-driven log level via `VITE_LOG_LEVEL` and production `.env.production` default to `warn`.
- Progressive Web App service worker & manifest (installable, offline caching via workbox).
- Electron desktop packaging configuration (Windows, macOS, Linux targets) + build scripts.
- Playwright-based automated screenshot capture workflow & screenshot optimization script.
- Screenshot gallery + `docs/SCREENSHOTS.md` guide for consistent documentation assets.
- Unified Tailwind-based progress bar utility classes (`.progress-bar`, `.progress-bar__fill`, `.progress-bar__shine`).

### Changed

- Refactored multiple bespoke progress indicators to use shared utility classes for visual consistency.
- Simplified sensor & navigator feature detection using targeted casts instead of complex ambient type augmentation for build stability.
- Cleaned inline styles (moved to utility classes) and reduced console noise by channeling through logger.
- README overhauled with consolidated feature gallery, environment/logging section, deployment & release instructions.

### Removed

- Redundant progress bar CSS and unused type guard scaffolding for navigator extensions.
- Automatic database seeding side-effects at module import for safer production behavior.

### Fixed

- JSX structure issues in `SolutionSteps` causing earlier build break.
- Test build failure due to self-referential untyped mock (`mockStorage`) in BoostSettings tests.

### Security / Stability

- Added basic safeguards for network & WebSocket reconnection logic with exponential backoff.
- Introduced rate limiting scaffolding in `NetworkService` for future external API integrations.

### Documentation

- Added detailed Bluetooth protocol & architecture notes in README.
- Added screenshot capture and optimization workflow documentation.

[1.0.0]: https://github.com/knoksen/ebike-assistant-app/releases/tag/v1.0.0

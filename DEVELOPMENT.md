<!-- markdownlint-disable MD033 -->
# Development Guide

## 📚 Table of Contents
- [Setup](#setup)
- [Architecture](#architecture)
- [Testing](#testing)
- [Security](#security)
- [Internationalization (i18n)](#internationalization-i18n)
- [Contributing](#contributing)

## 🔧 Setup

### Prerequisites

```bash
# Required tools
Node.js 18+
Android Studio (for mobile builds)
VS Code (recommended)
```

### Installation

1. Clone the repository:
```bash
git clone https://github.com/knoksen/ebike-assistant-app.git
cd ebike-assistant-app
```

2. Install dependencies:
```bash
npm install
```

3. Run development server:
```bash
npm run dev
```

4. For mobile development:
```bash
# Android
npm run android

# iOS
npm run ios
```

## 🏗️ Architecture

### Core Components

```
src/
├── components/    # React components
├── pages/         # Screen components
├── logic/         # Business logic
├── services/      # External services
└── context/       # React context
```

### Mobile Architecture

```
android/
├── app/
│   ├── src/
│   │   └── bluetooth/    # BLE implementation
│   │       ├── auth/     # Authentication
│   │       ├── crc/      # CRC utilities
│   │       └── telemetry/ # Telemetry models
```

### Key Technologies

- **Frontend:** React, TypeScript, Vite
- **Mobile:** Android BLE APIs, Kotlin
- **State:** React Context + Custom Hooks
- **Testing:** Vitest, JUnit

## 🧪 Testing

### Frontend Tests

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

### Android Tests

```bash
# Unit tests
./gradlew test

# Instrumented tests
./gradlew connectedAndroidTest
```

### Test Structure

```
__tests__/
├── components/    # Component tests
├── logic/         # Business logic tests
└── services/     # Service mocks & tests
```

### BLE Testing

1. **Mock Mode**
   - Use `TestMiCrypto` for auth testing
   - Simulated device responses
   - No real BLE hardware needed

2. **Integration Tests**
   - Requires real hardware
   - Test vectors included
   - CRC validation

## 🔒 Security

### BLE Security

1. **Authentication**
   - ECDH key exchange
   - Session management
   - Rate limiting

2. **Data Protection**
   - AES-CCM encryption
   - CRC verification
   - Input validation

### Best Practices

- Never commit secrets
- Use provided crypto interfaces
- Validate all inputs
- Handle timeouts properly
- Test error cases

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Follow style guide
4. Add tests
5. Submit PR

### Pull Request Checklist

- [ ] Tests pass
- [ ] Documentation updated
- [ ] Code style compliant
- [ ] Security review done
- [ ] CRC tests included
- [ ] Error handling complete

## 📋 Versioning

We use semantic versioning:
- MAJOR: Breaking changes
- MINOR: New features
- PATCH: Bug fixes

## 🌍 Internationalization (i18n)

We use **i18next** with **react-i18next** for UI translations.

### Adding a new locale

1. Create a new locale file in `src/locales/` (for example, `src/locales/es.json`) by copying the structure of `src/locales/en.json`.
2. Add the new locale import to `src/i18n.ts` and register it in the `resources` map.
3. Update the default language in `src/i18n.ts` if needed.

### Using translations in components

1. Import the hook: `import { useTranslation } from 'react-i18next'`.
2. Call `const { t } = useTranslation()` in your component.
3. Replace hard-coded text with `t('your.key.path')`.

## 📜 License

MIT License - see [LICENSE](LICENSE)

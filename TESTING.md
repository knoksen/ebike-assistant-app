# Testing Guide

## Unit Testing Infrastructure

### Frontend Tests

We use Vitest for frontend testing. Run tests with:

```bash
npm test                # Run all tests
npm run test:watch     # Watch mode
npm run test:coverage  # Generate coverage report
```

Test files are co-located with their implementations and use the `.test.ts` or `.test.tsx` extension.

### Android Tests

Android tests use JUnit and Mockk. Run tests with:

```bash
./gradlew test                    # Unit tests
./gradlew connectedAndroidTest    # Instrumented tests
```

## Test Categories

### 1. Bluetooth Tests

#### Authentication Tests
- ECDH handshake flow
- Session management
- Timeout handling
- Error cases

```kotlin
// Example test vector for ECDH
val testVector = TestVector(
    deviceRandom = "0123456789ABCDEF",
    sharedSecret = "FEDCBA9876543210",
    expectedSessionKey = "A1B2C3D4E5F6A7B8"
)
```

#### CRC Tests
We support multiple CRC algorithms with test vectors:

- CRC-8
- CRC-16/IBM
- CRC-16/X25

```kotlin
// Test vectors from standards
val crc8TestData = "123456789".toByteArray()
assertEquals(0xF4, crc8.calculate(crc8TestData))
```

### 2. Telemetry Tests

#### Cell Voltage Analysis
- Min/Max/Avg calculation
- Imbalance detection
- Zero handling
- Array bounds

```kotlin
val cells = intArrayOf(3800, 3850, 3900, 3875)
val stats = telemetry.getCellStats()
assertEquals(100, telemetry.getCellImbalance())
```

#### Data Validation
- Range checks
- Unit conversions
- Null handling

### 3. UI Component Tests

We use React Testing Library for component testing:

```typescript
test('DashboardScreen shows battery stats', () => {
  const { getByText } = render(<DashboardScreen />)
  expect(getByText(/Battery/i)).toBeInTheDocument()
})
```

## Mock Implementations

### BLE Mocks

```kotlin
class MockBleDevice : BleDevice {
    override fun connect(): Flow<ConnectionState> = flow {
        emit(ConnectionState.Connecting)
        delay(100)
        emit(ConnectionState.Connected)
    }
}
```

### Crypto Mocks

**WARNING: For Testing Only!**

```kotlin
class TestMiCrypto : MiCrypto {
    override fun ecdh(peerPublicKey: ByteArray): ByteArray {
        return ByteArray(32) { 1 }  // DO NOT USE IN PRODUCTION
    }
}
```

## Testing Guidelines

1. **Test Coverage Requirements**
   - 90% coverage for core logic
   - 80% coverage for UI components
   - 100% coverage for crypto operations

2. **Test Organization**
   ```
   src/
   ├── __tests__/          # Test utilities
   ├── components/
   │   └── __tests__/      # Component tests
   └── logic/
       └── __tests__/      # Logic tests
   ```

3. **Required Test Cases**
   - Happy path
   - Error conditions
   - Edge cases
   - Timeout handling
   - Memory leaks
   - Race conditions

4. **Performance Testing**
   - Response times
   - Memory usage
   - Battery impact
   - BLE connection stability

## Continuous Integration

Our CI pipeline runs:
1. Unit tests
2. Integration tests
3. Type checking
4. Linting
5. Code coverage reporting

## Debug Tools

### BLE Debugging

Enable debug logging:

```kotlin
// Add to Application class
BleLogger.setLevel(BleLogger.Level.DEBUG)
```

### React DevTools

Install the React DevTools browser extension for component debugging.

## Test Data

### Sample Telemetry

```json
{
  "vehicleModel": "Test Scooter",
  "packVoltageV": 36.5,
  "socPercent": 85,
  "cellsMv": [3800, 3850, 3900, 3875],
  "errorCode": 0
}
```

### BLE Test Frames

```
// Example authenticated frame
[OpCode][Counter][Length][Payload][CRC]
 0x01    0001     04      AABBCCDD  F4
```

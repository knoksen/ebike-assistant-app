# BLE Protocol Documentation

## Overview

This document details the Bluetooth Low Energy (BLE) protocols used in the E-Bike Assistant app.

## Protocol Stack

```
┌─────────────────────┐
│    Application      │
├─────────────────────┤
│ Transport Abstract. │
├─────────────────┬───┤
│ Xiaomi Auth     │NUS│
├─────────────────┴───┤
│      GATT           │
└─────────────────────┘
```

## Service UUIDs

### Xiaomi/Mi Protocol
- **Service**: `0000fe95-0000-1000-8000-00805f9b34fb`
- **Auth**: ECDH-based handshake
- **Transport**: Encrypted frames

### Nordic UART Service (NUS)
- **Service**: `6e400001-b5a3-f393-e0a9-e50e24dcca9e`
- **TX Char**: `6e400002-b5a3-f393-e0a9-e50e24dcca9e` (Write)
- **RX Char**: `6e400003-b5a3-f393-e0a9-e50e24dcca9e` (Notify)

### Common
- **CCCD**: `00002902-0000-1000-8000-00805f9b34fb`

## Authentication Flow

```
┌──────┐                      ┌──────┐
│Device│                      │ App  │
└──┬───┘                      └──┬───┘
   │      Subscribe Notify      │
   │ ←───────────────────────── │
   │                            │
   │      Request Random        │
   │ ←───────────────────────── │
   │                            │
   │      Send Random          │
   │ ─────────────────────────→ │
   │                            │
   │      Send Public Key       │
   │ ←───────────────────────── │
   │                            │
   │      Send Auth Proof       │
   │ ←───────────────────────── │
   │                            │
   │      Auth Success/Fail     │
   │ ─────────────────────────→ │
```

## Frame Formats

### Xiaomi Auth Frame
```
┌────────┬──────────┬────────┬─────────┐
│ OpCode │ Counter  │ Length │ Payload │
│  (1B)  │   (2B)   │  (1B)  │  (var)  │
└────────┴──────────┴────────┴─────────┘
```

### Telemetry Frame
```
┌────────┬────────┬─────────┬─────┐
│ Header │ Length │ Payload │ CRC │
│  (1B)  │  (1B)  │  (var)  │ (1B)│
└────────┴────────┴─────────┴─────┘
```

## Data Structures

### Battery Telemetry
```kotlin
data class BatteryTelemetry(
    val packVoltageV: Float,      // Total pack voltage
    val packCurrentA: Float,      // Current draw
    val socPercent: Int,         // State of charge
    val tempC: Float,            // Temperature
    val cellsMv: IntArray,       // Cell voltages (1-10)
    val extBatteryTempC: Float?  // External battery temp
)
```

### Vehicle Telemetry
```kotlin
data class VehicleTelemetry(
    val totalMileageKm: Float,
    val currentTripKm: Float,
    val avgSpeedKmH: Float,
    val errorCode: Int,
    val warning: String?
)
```

## Command Types

1. **System Commands**
   - Get status
   - Get battery info
   - Get error codes
   - Get version info

2. **Control Commands**
   - Set cruise control
   - Set power mode
   - Lock/unlock
   - Set lights

3. **Configuration**
   - Set speed limit
   - Set power assist
   - Save presets

## Error Handling

### Error Codes
```kotlin
enum class ErrorCode(val code: Int) {
    NONE(0),
    BMS_ERROR(1),
    MOTOR_ERROR(2),
    CONTROLLER_ERROR(3),
    THROTTLE_ERROR(4),
    COMM_ERROR(5)
}
```

### Status Codes
```kotlin
enum class StatusCode(val code: Int) {
    OK(0),
    AUTH_FAILED(1),
    INVALID_PARAM(2),
    TIMEOUT(3),
    NOT_SUPPORTED(4)
}
```

## Implementation Notes

1. **Authentication**
   - Always verify ECDH implementation
   - Use proper key derivation
   - Handle timeout cases
   - Validate all packets

2. **Telemetry**
   - Validate value ranges
   - Handle missing data
   - Check CRC/checksums
   - Rate-limit requests

3. **Commands**
   - Require authentication
   - Validate parameters
   - Confirm critical changes
   - Handle timeouts

4. **Security**
   - No hardcoded secrets
   - Secure session storage
   - Clean error handling
   - Rate limiting

## Future Considerations

1. **Firmware Updates**
   - Currently excluded
   - Requires signed packages
   - Atomic updates
   - Rollback support

2. **Extended Features**
   - Battery health tracking
   - Performance analytics
   - Custom presets
   - Diagnostic logging

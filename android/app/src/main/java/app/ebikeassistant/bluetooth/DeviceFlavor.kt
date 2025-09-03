package app.ebikeassistant.bluetooth

/**
 * Classification of BLE devices based on their advertised services
 */
enum class DeviceFlavor {
    XIAOMI_FE95,  // Devices advertising the Xiaomi service (0xFE95)
    NORDIC_UART,  // Devices with Nordic UART service
    UNKNOWN       // Devices not matching any known pattern
}

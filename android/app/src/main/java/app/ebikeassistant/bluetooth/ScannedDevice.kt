package app.ebikeassistant.bluetooth

/**
 * Represents a scanned BLE device with classification
 *
 * @property name Device name from advertising data (nullable)
 * @property address Device MAC address
 * @property flavor Classification based on advertised services
 * @property rssi Signal strength indicator
 */
data class ScannedDevice(
    val name: String?,
    val address: String,
    val flavor: DeviceFlavor,
    val rssi: Int
)

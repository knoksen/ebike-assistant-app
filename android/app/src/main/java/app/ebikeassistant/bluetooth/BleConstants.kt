package app.ebikeassistant.bluetooth

import java.util.UUID

object BleConstants {
    val FE95_SERVICE: UUID = UUID.fromString("0000fe95-0000-1000-8000-00805f9b34fb")
    val CCC_DESCRIPTOR: UUID = UUID.fromString("00002902-0000-1000-8000-00805f9b34fb")

    val NUS_SERVICE: UUID = UUID.fromString("6e400001-b5a3-f393-e0a9-e50e24dcca9e")
    val NUS_TX_CHAR: UUID = UUID.fromString("6e400002-b5a3-f393-e0a9-e50e24dcca9e")
    val NUS_RX_CHAR: UUID = UUID.fromString("6e400003-b5a3-f393-e0a9-e50e24dcca9e")

    // Bluetooth Base UUID components
    private const val BLUETOOTH_BASE_UUID_START = "0000"
    private const val BLUETOOTH_BASE_UUID_END = "-0000-1000-8000-00805f9b34fb"

    /**
     * Converts a UUID to its 16-bit alias if it's in the Bluetooth Base UUID namespace,
     * otherwise returns the full UUID string.
     * 
     * Example: UUID 0000180F-0000-1000-8000-00805f9b34fb -> "180F"
     */
    fun UUID.toBluetoothAlias(): String {
        val uuidStr = toString()
        return if (uuidStr.startsWith(BLUETOOTH_BASE_UUID_START) && 
                   uuidStr.endsWith(BLUETOOTH_BASE_UUID_END)) {
            uuidStr.substring(4, 8)
        } else {
            uuidStr
        }
    }
}

inline fun ByteArray.toHex(): String = joinToString("") { "%02X".format(it) }

fun String.hexToBytes(): ByteArray {
    val clean = replace("[^0-9A-Fa-f]".toRegex(), "")
    require(clean.length % 2 == 0) { "Hex length must be even" }
    return ByteArray(clean.length / 2) { i -> clean.substring(i * 2, i * 2 + 2).toInt(16).toByte() }
}
fun UUID.hex(): String = toString().replace("-", "")
}

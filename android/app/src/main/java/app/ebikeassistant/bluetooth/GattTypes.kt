package app.ebikeassistant.bluetooth

import android.bluetooth.BluetoothGattCharacteristic

/**
 * GATT connection states
 */
sealed class GattState {
    data object Disconnected : GattState()
    data object Connecting : GattState()
    data class Connected(val address: String) : GattState()
    data class Failed(val error: GattError) : GattState()
}

/**
 * GATT operation errors
 */
sealed class GattError : Exception() {
    data class ConnectionError(override val message: String) : GattError()
    data class ServiceDiscoveryFailed(override val message: String) : GattError()
    data class CharacteristicNotFound(val uuid: String) : GattError()
    data class OperationFailed(val operation: String, override val cause: Throwable? = null) : GattError()
    data class Timeout(val operation: String) : GattError()
}

/**
 * Characteristic value change event
 */
data class CharacteristicEvent(
    val uuid: String,
    val value: ByteArray
) {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false

        other as CharacteristicEvent
        if (uuid != other.uuid) return false
        return value.contentEquals(other.value)
    }

    override fun hashCode(): Int {
        var result = uuid.hashCode()
        result = 31 * result + value.contentHashCode()
        return result
    }
}

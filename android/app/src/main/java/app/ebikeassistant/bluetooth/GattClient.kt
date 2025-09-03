package app.ebikeassistant.bluetooth

import android.bluetooth.BluetoothDevice
import android.bluetooth.BluetoothGatt
import android.bluetooth.BluetoothGattCallback
import android.bluetooth.BluetoothGattCharacteristic
import android.bluetooth.BluetoothGattDescriptor
import android.bluetooth.BluetoothProfile
import android.content.Context
import android.os.Build
import android.util.Log
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import kotlinx.coroutines.withContext
import kotlinx.coroutines.withTimeout
import java.util.UUID
import kotlin.coroutines.resume
import kotlin.coroutines.resumeWithException
import kotlin.coroutines.suspendCoroutine
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.first

enum class GattState {
    DISCONNECTED,
    CONNECTING,
    CONNECTED,
    DISCOVERING_SERVICES,
    READY,
    DISCONNECTING
}

data class CharacteristicEvent(
    val characteristic: BluetoothGattCharacteristic,
    val value: ByteArray
) {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false
        other as CharacteristicEvent
        return characteristic == other.characteristic && value.contentEquals(other.value)
    }

    override fun hashCode(): Int {
        var result = characteristic.hashCode()
        result = 31 * result + value.contentHashCode()
        return result
    }
}

class GattClient(
    private val context: Context,
    private val device: BluetoothDevice
) {
    private val tag = "GattClient"
    private var gatt: BluetoothGatt? = null
    private val mutex = Mutex()
    private val operationTimeout = 10000L // 10 seconds
    private val maxRetries = 3
    private val reconnectBackoff = listOf(100L, 1000L, 3000L) // Increasing backoff delays

    private val _connectionState = MutableStateFlow(GattState.DISCONNECTED)
    val connectionState: StateFlow<GattState> = _connectionState

    private val characteristicChangedChannel = Channel<CharacteristicEvent>(Channel.BUFFERED)

    private val gattCallback = object : BluetoothGattCallback() {
        override fun onConnectionStateChange(gatt: BluetoothGatt, status: Int, newState: Int) {
            val deviceAddress = gatt.device.address
            when (newState) {
                BluetoothProfile.STATE_CONNECTED -> {
                    Log.i(tag, "Connected to GATT server. Discovering services...")
                    _connectionState.value = GattState.DISCOVERING_SERVICES
                    gatt.discoverServices()
                }
                BluetoothProfile.STATE_DISCONNECTED -> {
                    Log.i(tag, "Disconnected from GATT server")
                    disconnect()
                    if (_connectionState.value != GattState.DISCONNECTING) {
                        // Unexpected disconnection - attempt reconnect
                        attemptReconnect()
                    } else {
                        _connectionState.value = GattState.DISCONNECTED
                    }
                }
            }
        }

        override fun onServicesDiscovered(gatt: BluetoothGatt, status: Int) {
            if (status == BluetoothGatt.GATT_SUCCESS) {
                Log.i(tag, "Services discovered successfully")
                _connectionState.value = GattState.READY
            } else {
                Log.e(tag, "Service discovery failed with status: $status")
                disconnect()
            }
        }

        override fun onCharacteristicChanged(
            gatt: BluetoothGatt,
            characteristic: BluetoothGattCharacteristic,
            value: ByteArray
        ) {
            characteristicChangedChannel.trySend(CharacteristicEvent(characteristic, value))
        }

        // For Android versions prior to API 33
        @Deprecated("Deprecated in Java")
        override fun onCharacteristicChanged(
            gatt: BluetoothGatt,
            characteristic: BluetoothGattCharacteristic
        ) {
            val value = characteristic.value
            characteristicChangedChannel.trySend(CharacteristicEvent(characteristic, value))
        }
    }

    suspend fun connect() = withContext(Dispatchers.Main) {
        mutex.withLock {
            if (_connectionState.value != GattState.DISCONNECTED) {
                return@withContext
            }

            _connectionState.value = GattState.CONNECTING
            gatt = device.connectGatt(
                context,
                false,
                gattCallback,
                BluetoothDevice.TRANSPORT_LE
            )

            // Wait for connection to be established
            withTimeout(operationTimeout) {
                connectionState.first { it == GattState.READY }
            }
        }
    }

    private suspend fun attemptReconnect() {
        for ((attempt, delay) in reconnectBackoff.withIndex()) {
            try {
                delay(delay)
                connect()
                return
            } catch (e: Exception) {
                if (attempt == reconnectBackoff.lastIndex) {
                    Log.e(tag, "Failed to reconnect after ${attempt + 1} attempts")
                    _connectionState.value = GattState.DISCONNECTED
                }
            }
        }
    }

    fun disconnect() {
        _connectionState.value = GattState.DISCONNECTING
        gatt?.disconnect()
        gatt?.close()
        gatt = null
    }

    suspend fun withCharacteristic(
        uuid: UUID,
        block: suspend (BluetoothGattCharacteristic) -> Unit
    ) = withContext(Dispatchers.Main) {
        mutex.withLock {
            val gatt = gatt ?: throw IllegalStateException("GATT not connected")
            val characteristic = gatt.services
                .flatMap { it.characteristics }
                .find { it.uuid == uuid }
                ?: throw IllegalArgumentException("Characteristic not found: ${uuid.hex()}")
            
            block(characteristic)
        }
    }

    val characteristicChanges: Flow<CharacteristicEvent> = callbackFlow {
        for (event in characteristicChangedChannel) {
            send(event)
        }
        awaitClose { }
    }

    suspend fun write(
        uuid: UUID,
        payload: ByteArray,
        writeType: Int = BluetoothGattCharacteristic.WRITE_TYPE_NO_RESPONSE
    ) = withContext(Dispatchers.Main) {
        var lastError: Exception? = null
        
        repeat(maxRetries) { attempt ->
            try {
                return@withContext writeWithRetry(uuid, payload, writeType)
            } catch (e: Exception) {
                lastError = e
                if (attempt < maxRetries - 1) {
                    delay(100L * (attempt + 1))
                }
            }
        }
        
        throw lastError ?: IllegalStateException("Write failed after $maxRetries attempts")
    }

    private suspend fun writeWithRetry(
        uuid: UUID,
        payload: ByteArray,
        writeType: Int
    ) = suspendCoroutine<Unit> { continuation ->
        withCharacteristic(uuid) { characteristic ->
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                gatt?.writeCharacteristic(
                    characteristic,
                    payload,
                    writeType
                )
            } else {
                @Suppress("DEPRECATION")
                characteristic.writeType = writeType
                @Suppress("DEPRECATION")
                characteristic.value = payload
                gatt?.writeCharacteristic(characteristic)
            }?.let { success ->
                if (success) {
                    continuation.resume(Unit)
                } else {
                    continuation.resumeWithException(
                        IllegalStateException("Write characteristic failed")
                    )
                }
            } ?: continuation.resumeWithException(
                IllegalStateException("GATT not connected")
            )
        }
    }

    suspend fun enableNotifications(uuid: UUID) = withContext(Dispatchers.Main) {
        withCharacteristic(uuid) { characteristic ->
            // Enable local notifications
            gatt?.setCharacteristicNotification(characteristic, true)
                ?: throw IllegalStateException("GATT not connected")

            // Write to CCC descriptor
            val descriptor = characteristic.getDescriptor(BleConstants.CCC_DESCRIPTOR)
                ?: throw IllegalStateException("CCC descriptor not found")

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                gatt?.writeDescriptor(
                    descriptor,
                    BluetoothGattDescriptor.ENABLE_NOTIFICATION_VALUE
                )
            } else {
                @Suppress("DEPRECATION")
                descriptor.value = BluetoothGattDescriptor.ENABLE_NOTIFICATION_VALUE
                @Suppress("DEPRECATION")
                gatt?.writeDescriptor(descriptor)
            } ?: throw IllegalStateException("Failed to write CCC descriptor")
        }
    }

    override fun toString(): String {
        return "GattClient(device=${device.address}, state=${_connectionState.value})"
    }
}

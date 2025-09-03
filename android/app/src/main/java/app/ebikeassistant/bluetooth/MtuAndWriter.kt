package app.ebikeassistant.bluetooth

import android.bluetooth.BluetoothGatt
import android.bluetooth.BluetoothGattCharacteristic
import android.bluetooth.BluetoothStatusCodes
import android.os.Build
import kotlinx.coroutines.TimeoutCancellationException
import kotlinx.coroutines.delay
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlinx.coroutines.withTimeout
import kotlin.coroutines.resume
import kotlin.math.min

/**
 * Request MTU change with timeout and fallback
 * @param target Target MTU size (default 247)
 * @return Negotiated MTU size
 */
suspend fun BluetoothGatt.requestMtuSafely(target: Int = 247): Int = try {
    withTimeout(1000) {
        suspendCancellableCoroutine { continuation ->
            requestMtu(target).apply {
                continuation.resume(gatt.getMtu())
            }
        }
    }
} catch (e: TimeoutCancellationException) {
    // Fallback to current MTU on timeout
    getMtu()
}

/**
 * Handles writing BLE packets with automatic splitting and error handling
 */
class BlePacketWriter(
    private val gatt: BluetoothGatt,
    private val char: BluetoothGattCharacteristic,
    private val mtu: Int
) {
    private val maxChunkSize = min(
        mtu - 3,  // Account for ATT header
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            char.properties.maxWriteLength
        } else {
            mtu - 3
        }
    )

    /**
     * Write payload in frames with delay between chunks
     * @param payload Data to write
     * @param frameSize Maximum frame size (default mtu-3)
     * @param delayBetweenMs Delay between frames in ms (default 8)
     */
    suspend fun writeFramed(
        payload: ByteArray,
        frameSize: Int = mtu - 3,
        delayBetweenMs: Int = 8
    ) {
        val chunkSize = min(frameSize, maxChunkSize)
        
        payload.asSequence()
            .chunked(chunkSize)
            .map { it.toByteArray() }
            .forEach { chunk ->
                var retryCount = 0
                var success = false
                
                while (!success && retryCount < 3) {
                    if (retryCount > 0) {
                        delay(delayBetweenMs * (1 shl retryCount))  // Exponential backoff
                    }
                    
                    success = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                        writeCharacteristic(
                            char,
                            chunk,
                            BluetoothGattCharacteristic.WRITE_TYPE_NO_RESPONSE
                        ) == BluetoothStatusCodes.SUCCESS
                    } else {
                        @Suppress("DEPRECATION")
                        char.writeType = BluetoothGattCharacteristic.WRITE_TYPE_NO_RESPONSE
                        @Suppress("DEPRECATION")
                        char.value = chunk
                        @Suppress("DEPRECATION")
                        gatt.writeCharacteristic(char)
                    }
                    
                    if (!success && gatt.getLastError() == BluetoothGatt.GATT_WRITE_NOT_PERMITTED) {
                        retryCount++
                        continue
                    }
                    
                    delay(delayBetweenMs.toLong())
                }
                
                if (!success) {
                    throw IllegalStateException("Failed to write chunk after retries")
                }
            }
    }
    
    private fun BluetoothGatt.getLastError(): Int {
        // This is a simplification - in practice you'd want to track the last error
        // through your GATT callback system
        return BluetoothGatt.GATT_SUCCESS
    }
}

// Extension for getting current MTU
private fun BluetoothGatt.getMtu(): Int = try {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
        this.getMtu()
    } else {
        // Default MTU if not negotiated
        23
    }
} catch (e: Exception) {
    // Fallback to minimum MTU
    23
}

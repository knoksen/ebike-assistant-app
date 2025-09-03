package app.ebikeassistant.bluetooth

import android.bluetooth.*
import kotlinx.coroutines.delay
import android.os.Build

/**
 * Handles writing BLE packets with automatic MTU-based chunking
 */
class BlePacketWriter(
    private val gatt: BluetoothGatt,
    private val ch: BluetoothGattCharacteristic,
    private val mtu: Int
) {
    // Account for ATT header (3 bytes) and ensure minimum size
    private val chunk = (mtu - 3).coerceAtLeast(20)

    /**
     * Write payload in chunks with configurable delay
     * @param payload Data to write
     * @param delayBetweenMs Delay between chunks in milliseconds
     */
    suspend fun writeFramed(payload: ByteArray, delayBetweenMs: Int = 8) {
        var offset = 0
        while (offset < payload.size) {
            val end = (offset + chunk).coerceAtMost(payload.size)
            val part = payload.copyOfRange(offset, end)
            
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                gatt.writeCharacteristic(
                    ch,
                    part,
                    BluetoothGattCharacteristic.WRITE_TYPE_NO_RESPONSE
                )
            } else {
                @Suppress("DEPRECATION")
                ch.writeType = BluetoothGattCharacteristic.WRITE_TYPE_NO_RESPONSE
                @Suppress("DEPRECATION")
                ch.value = part
                @Suppress("DEPRECATION")
                gatt.writeCharacteristic(ch)
            }
            
            offset = end
            if (offset < payload.size) delay(delayBetweenMs.toLong())
        }
    }
}

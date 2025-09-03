package app.ebikeassistant.bluetooth

import android.bluetooth.BluetoothGatt
import android.bluetooth.BluetoothGattCharacteristic
import android.bluetooth.BluetoothGattDescriptor
import android.os.Build
import kotlin.coroutines.resume
import kotlin.coroutines.suspendCoroutine

/**
 * Extension function to enable notifications for a characteristic
 * Returns true if notifications were successfully enabled
 */
suspend fun BluetoothGatt.enableNotifications(char: BluetoothGattCharacteristic): Boolean = suspendCoroutine { continuation ->
    // Enable local notifications
    if (!setCharacteristicNotification(char, true)) {
        continuation.resume(false)
        return@suspendCoroutine
    }
    
    // Get the CCC descriptor
    val cccd = char.getDescriptor(BleConstants.CCC_DESCRIPTOR)
    if (cccd == null) {
        continuation.resume(false)
        return@suspendCoroutine
    }

    // Write to the CCC descriptor
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
        writeDescriptor(
            cccd, 
            BluetoothGattDescriptor.ENABLE_NOTIFICATION_VALUE
        ).apply {
            continuation.resume(true)
        }
    } else {
        @Suppress("DEPRECATION")
        cccd.value = BluetoothGattDescriptor.ENABLE_NOTIFICATION_VALUE
        @Suppress("DEPRECATION")
        writeDescriptor(cccd).apply {
            continuation.resume(true)
        }
    }
}

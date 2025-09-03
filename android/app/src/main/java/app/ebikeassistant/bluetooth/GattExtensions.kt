package app.ebikeassistant.bluetooth

import android.bluetooth.*
import android.os.Build

suspend fun BluetoothGatt.enableNotifications(char: BluetoothGattCharacteristic): Boolean {
    setCharacteristicNotification(char, true)
    val cccd = char.getDescriptor(BleConstants.CCC_DESCRIPTOR) ?: return false
    
    return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
        writeDescriptor(cccd, BluetoothGattDescriptor.ENABLE_NOTIFICATION_VALUE)
    } else {
        @Suppress("DEPRECATION")
        cccd.value = BluetoothGattDescriptor.ENABLE_NOTIFICATION_VALUE
        @Suppress("DEPRECATION")
        writeDescriptor(cccd)
    }
}

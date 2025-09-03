package app.ebikeassistant.bluetooth

import android.bluetooth.BluetoothAdapter
import android.bluetooth.le.*
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.flow.Flow
import java.util.UUID
import android.os.ParcelUuid

fun scanForScooters(adapter: BluetoothAdapter): Flow<ScannedDevice> = callbackFlow {
    val scanner = adapter.bluetoothLeScanner
    val settings = ScanSettings.Builder()
        .setScanMode(ScanSettings.SCAN_MODE_LOW_LATENCY)
        .build()
    val filters = listOf(
        ScanFilter.Builder().setServiceUuid(ParcelUuid(BleConstants.FE95_SERVICE)).build(),
        ScanFilter.Builder().setServiceUuid(ParcelUuid(BleConstants.NUS_SERVICE)).build(),
    )

    val cb = object : ScanCallback() {
        override fun onScanResult(callbackType: Int, result: ScanResult) {
            val record = result.scanRecord
            val services = record?.serviceUuids?.map { it.uuid }?.toSet() ?: emptySet()
            val flavor = when {
                BleConstants.FE95_SERVICE in services -> DeviceFlavor.XIAOMI_FE95
                BleConstants.NUS_SERVICE in services -> DeviceFlavor.NORDIC_UART
                else -> DeviceFlavor.UNKNOWN
            }
            trySend(
                ScannedDevice(
                    name = result.device.name ?: record?.deviceName,
                    address = result.device.address,
                    flavor = flavor,
                    rssi = result.rssi,
                )
            )
        }
        override fun onScanFailed(errorCode: Int) { close(IllegalStateException("Scan failed: $errorCode")) }
    }

    scanner.startScan(filters, settings, cb)
    awaitClose { scanner.stopScan(cb) }
}

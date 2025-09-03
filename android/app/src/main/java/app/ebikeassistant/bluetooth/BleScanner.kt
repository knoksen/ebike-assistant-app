package app.ebikeassistant.bluetooth

import android.bluetooth.BluetoothManager
import android.bluetooth.le.BluetoothLeScanner
import android.bluetooth.le.ScanCallback
import android.bluetooth.le.ScanFilter
import android.bluetooth.le.ScanResult
import android.bluetooth.le.ScanSettings
import android.content.Context
import android.os.ParcelUuid
import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.flow.flowOn
import kotlinx.coroutines.flow.scan
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import java.util.UUID

enum class DeviceFlavor {
    XIAOMI_FE95,
    NORDIC_UART,
    UNKNOWN
}

data class ScannedDevice(
    val name: String?,
    val address: String,
    val flavor: DeviceFlavor,
    val rssi: Int
)

class BleScanner(context: Context) {
    private val tag = "BleScanner"
    private var scanJob: Job? = null
    private val bluetoothManager = context.getSystemService(Context.BLUETOOTH_SERVICE) as BluetoothManager
    private val scanner: BluetoothLeScanner? get() = bluetoothManager.adapter?.bluetoothLeScanner

    private val scanFilters = listOf(
        // Xiaomi FE95 service filter
        ScanFilter.Builder()
            .setServiceUuid(ParcelUuid(BleConstants.FE95_SERVICE))
            .build(),
        // Nordic UART service filter
        ScanFilter.Builder()
            .setServiceUuid(ParcelUuid(BleConstants.NUS_SERVICE))
            .build()
    )

    private val scanSettings = ScanSettings.Builder()
        .setScanMode(ScanSettings.SCAN_MODE_LOW_LATENCY)
        .build()

    fun scan(): Flow<ScannedDevice> = callbackFlow {
        val scanner = scanner ?: throw IllegalStateException("Bluetooth not available")

        val scanCallback = object : ScanCallback() {
            override fun onScanResult(callbackType: Int, result: ScanResult) {
                val device = classifyDevice(result)
                trySend(device)
            }

            override fun onScanFailed(errorCode: Int) {
                Log.e(tag, "Scan failed with error: $errorCode")
                close(Exception("Scan failed with error: $errorCode"))
            }
        }

        try {
            scanner.startScan(scanFilters, scanSettings, scanCallback)
        } catch (e: Exception) {
            Log.e(tag, "Failed to start scan", e)
            close(e)
        }

        awaitClose {
            try {
                scanner.stopScan(scanCallback)
            } catch (e: Exception) {
                Log.e(tag, "Failed to stop scan", e)
            }
        }
    }.flowOn(Dispatchers.IO)

    private fun classifyDevice(result: ScanResult): ScannedDevice {
        val scanRecord = result.scanRecord
        val serviceUuids = scanRecord?.serviceUuids.orEmpty()
        
        val flavor = when {
            serviceUuids.any { it.uuid == BleConstants.FE95_SERVICE } -> DeviceFlavor.XIAOMI_FE95
            serviceUuids.any { it.uuid == BleConstants.NUS_SERVICE } -> DeviceFlavor.NORDIC_UART
            else -> DeviceFlavor.UNKNOWN
        }

        return ScannedDevice(
            name = result.device.name ?: scanRecord?.deviceName,
            address = result.device.address,
            flavor = flavor,
            rssi = result.rssi
        )
    }

    fun start() {
        scanJob?.cancel()
        scanJob = scan().collect { /* Keep flow active */ }
    }

    fun stop() {
        scanJob?.cancel()
        scanJob = null
    }
}

class BleScannerViewModel(context: Context) : ViewModel() {
    private val scanner = BleScanner(context)
    
    val scannedDevices = scanner.scan()
        .scan(emptyList<ScannedDevice>()) { acc, device ->
            // Update list, replacing devices with the same address
            acc.filter { it.address != device.address } + device
        }
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = emptyList()
        )

    private var isScanning = false

    fun startScanning() {
        if (!isScanning) {
            isScanning = true
            viewModelScope.launch {
                scanner.start()
            }
        }
    }

    fun stopScanning() {
        if (isScanning) {
            isScanning = false
            scanner.stop()
        }
    }

    override fun onCleared() {
        super.onCleared()
        stopScanning()
    }
}

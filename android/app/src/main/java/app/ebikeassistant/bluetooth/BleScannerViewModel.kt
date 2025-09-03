package app.ebikeassistant.bluetooth

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.stateIn

/**
 * ViewModel for BLE device scanning
 * Exposes scanned devices as a StateFlow
 */
class BleScannerViewModel(
    private val scanner: BleScanner
) : ViewModel() {
    
    private var _scanState: StateFlow<List<ScannedDevice>>? = null
    
    /**
     * Start scanning and expose devices as StateFlow
     */
    fun startScanning(): StateFlow<List<ScannedDevice>> {
        return _scanState ?: scanner.start()
            .stateIn(
                scope = viewModelScope,
                started = SharingStarted.WhileSubscribed(5000),
                initialValue = emptyList()
            ).also { _scanState = it }
    }

    /**
     * Stop scanning for devices
     */
    fun stopScanning() {
        scanner.stop()
    }

    override fun onCleared() {
        super.onCleared()
        stopScanning()
    }
}

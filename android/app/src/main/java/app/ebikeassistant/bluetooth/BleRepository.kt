package app.ebikeassistant.bluetooth

import android.bluetooth.BluetoothAdapter
import android.bluetooth.BluetoothDevice
import android.content.Context
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

/**
 * Repository for BLE device interactions
 */
class BleRepository(
    private val context: Context,
    private val bluetoothAdapter: BluetoothAdapter
) {
    private val scope = CoroutineScope(Dispatchers.Default + SupervisorJob())
    private var transport: BleTransport? = null
    private var gattClient: GattClient? = null
    private val parser = BinaryTelemetryParser.createDefault()
    private val commandCodec = CommandCodec()

    private val _telemetry = MutableStateFlow<Telemetry?>(null)
    val telemetry: StateFlow<Telemetry?> = _telemetry

    /**
     * Connect to device by address
     */
    suspend fun connect(address: String) = withContext(Dispatchers.IO) {
        // Get device
        val device = bluetoothAdapter.getRemoteDevice(address)
            ?: throw IllegalArgumentException("Device not found: $address")

        // Create scanner and scan for device flavor
        val scanner = BleScanner(context)
        val scannedDevice = scanner.scan()
            .map { devices -> devices.firstOrNull { it.address == address } }
            .first { it != null }
            ?: throw IllegalStateException("Device not found in scan")

        // Create transport based on device flavor
        transport = BleTransport.create(scannedDevice.flavor)

        // Create and connect GATT client
        gattClient = GattClient(context).also { client ->
            // Connect client
            client.connect()
            // Initialize transport
            transport?.connect(client)
        }

        // Start telemetry collection
        scope.launch {
            transport?.receive()?.collect { frame ->
                when (val event = parser.parse(frame)) {
                    is TelemetryEvent.TelemetryUpdate -> _telemetry.value = event.telemetry
                    is TelemetryEvent.BatteryUpdate -> _telemetry.value = _telemetry.value?.copy(
                        battery = event.battery
                    )
                    else -> { /* Handle other events */ }
                }
            }
        }
    }

    /**
     * Disconnect from device
     */
    fun disconnect() {
        transport?.disconnect()
        gattClient?.disconnect()
        transport = null
        gattClient = null
    }

    /**
     * Send command to device
     */
    suspend fun sendCommand(command: Command): Boolean = withContext(Dispatchers.IO) {
        val transport = transport ?: throw IllegalStateException("Not connected")

        val frame = commandCodec.encode(command)
        
        // Send frame with encryption if required
        transport.send(frame.bytes)

        // Await response
        frame.awaitResponse()
    }
}

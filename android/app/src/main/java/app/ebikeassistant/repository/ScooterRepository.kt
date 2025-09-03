package app.ebikeassistant.repository

import android.bluetooth.BluetoothAdapter
import android.bluetooth.BluetoothGatt
import app.ebikeassistant.bluetooth.BleScanner
import app.ebikeassistant.bluetooth.GattClient
import app.ebikeassistant.bluetooth.auth.AuthAdapter
import app.ebikeassistant.bluetooth.auth.AuthAdapterFactory
import app.ebikeassistant.bluetooth.scanForScooters
import app.ebikeassistant.payload.ScooterPayload
import app.ebikeassistant.protocol.Frame
import app.ebikeassistant.protocol.Encoder
import app.ebikeassistant.protocol.Deframer
import app.ebikeassistant.telemetry.TelemetryParser
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import java.io.IOException
import kotlin.time.Duration.Companion.seconds

class ScooterRepository(
    private val bluetoothAdapter: BluetoothAdapter,
    private val scope: CoroutineScope,
    private val dispatcher: CoroutineDispatcher = Dispatchers.IO
) {
    private val authAdapter: AuthAdapter = AuthAdapterFactory.create()
    private val deframer = Deframer()
    private val parser = TelemetryParser()
    
    private var currentDevice: GattClient? = null
    private var securedLink: SecuredLink? = null
    
    private val _state = MutableStateFlow(ScooterState())
    val state: StateFlow<ScooterState> = _state.asStateFlow()
    
    init {
        setupConnectionMonitoring()
    }
    
    private fun setupConnectionMonitoring() {
        scope.launch(dispatcher) {
            // Monitor for devices and attempt connection
            scanForScooters(bluetoothAdapter)
                .distinctUntilChangedBy { it.address }
                .collectLatest { device ->
                    try {
                        connectDevice(device)
                    } catch (e: Exception) {
                        _state.update { it.copy(
                            isConnected = false,
                            isAuthenticated = false,
                            lastError = e.message,
                            connectionAttempts = it.connectionAttempts + 1
                        )}
                    }
                }
        }
    }
    
    private suspend fun connectDevice(device: ScannedDevice) {
        // Disconnect existing
        currentDevice?.disconnect()
        securedLink = null
        
        // Update state
        _state.update { it.copy(
            isConnected = false,
            isAuthenticated = false,
            lastError = null
        )}
        
        // Connect new device
        val client = GattClient(device)
        currentDevice = client
        
        try {
            // Establish connection
            client.connect()
            _state.update { it.copy(isConnected = true) }
            
            // Authenticate
            val link = authAdapter.establish(client.gatt)
            securedLink = link
            _state.update { it.copy(isAuthenticated = true) }
            
            // Start processing notifications with retry
            link.notifications
                .retryWhen { cause, attempt ->
                    if (cause is IOException && attempt < 3) {
                        delay(attempt * 1.seconds)
                        true
                    } else false
                }
                .collect { bytes ->
                    processNotification(bytes)
                }
                
        } catch (e: Exception) {
            _state.update { it.copy(
                isConnected = false,
                isAuthenticated = false,
                lastError = e.message
            )}
            throw e
        }
    }
    
    private suspend fun processNotification(bytes: ByteArray) {
        deframer.offer(bytes).forEach { frame ->
            when (frame) {
                is Frame.Data -> {
                    when (frame.type.toInt()) {
                        0x01 -> { // Telemetry update
                            val telemetry = parser.parse(frame.body)
                            val payload = ScooterPayload.fromTelemetry(telemetry)
                            _state.update { it.copy(payload = payload) }
                        }
                    }
                }
                is Frame.Ack -> { /* Handle ACK */ }
                is Frame.Nack -> {
                    _state.update { it.copy(lastError = "Command failed: ${frame.code}") }
                }
            }
        }
    }
    
    suspend fun setLock(locked: Boolean) = sendCommand(
        type = 0x02,
        body = byteArrayOf(if (locked) 1 else 0)
    )
    
    suspend fun setHeadlight(on: Boolean) = sendCommand(
        type = 0x03,
        body = byteArrayOf(if (on) 1 else 0)
    )
    
    suspend fun setCruise(enabled: Boolean) = sendCommand(
        type = 0x04,
        body = byteArrayOf(if (enabled) 1 else 0)
    )
    
    suspend fun getBattery() = sendCommand(
        type = 0x05,
        body = ByteArray(0)
    )
    
    private suspend fun sendCommand(type: Int, body: ByteArray) {
        val link = securedLink ?: throw IllegalStateException("Not connected")
        if (!state.value.canSendCommands) {
            throw IllegalStateException("Cannot send commands: ${state.value.lastError}")
        }
        
        val frame = Encoder.encode(
            type = type,
            counter = 0, // Implement counter if needed
            body = body,
            useX25 = true
        )
        
        link.write(frame)
    }
    
    fun disconnect() {
        scope.launch(dispatcher) {
            currentDevice?.disconnect()
            securedLink = null
            _state.update { ScooterState() }
        }
    }
}

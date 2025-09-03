package app.ebikeassistant.bluetooth

import app.ebikeassistant.bluetooth.xiaomi.Session
import app.ebikeassistant.bluetooth.xiaomi.XiaomiEcdhAuthenticator
import app.ebikeassistant.bluetooth.ninebot.NinebotSecureCryptor
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.filter
import kotlinx.coroutines.flow.map
import java.util.UUID

/**
 * Abstract transport layer for BLE communication
 */
sealed class BleTransport {
    abstract suspend fun connect(client: GattClient)
    abstract suspend fun send(data: ByteArray)
    abstract fun receive(): Flow<ByteArray>
    abstract fun disconnect()

    /**
     * Xiaomi FE95 encrypted transport
     */
    class XiaomiTransport(
        private val authenticator: XiaomiEcdhAuthenticator
    ) : BleTransport() {
        private var session: Session? = null

        override suspend fun connect(client: GattClient) {
            session = authenticator.authenticate(client)
        }

        override suspend fun send(data: ByteArray) {
            session?.write?.invoke(data) ?: throw IllegalStateException("Not connected")
        }

        override fun receive(): Flow<ByteArray> =
            session?.notifications ?: throw IllegalStateException("Not connected")

        override fun disconnect() {
            session = null
        }
    }

    /**
     * Nordic UART plain transport
     */
    class NordicUartTransport : BleTransport() {
        companion object {
            val SERVICE_UUID = UUID.fromString("6e400001-b5a3-f393-e0a9-e50e24dcca9e")
            val RX_CHAR_UUID = UUID.fromString("6e400002-b5a3-f393-e0a9-e50e24dcca9e") // Write
            val TX_CHAR_UUID = UUID.fromString("6e400003-b5a3-f393-e0a9-e50e24dcca9e") // Notify
        }

        private var client: GattClient? = null

        override suspend fun connect(client: GattClient) {
            // Enable notifications for TX characteristic
            client.enableNotifications(TX_CHAR_UUID)
            this.client = client
        }

        override suspend fun send(data: ByteArray) {
            client?.write(RX_CHAR_UUID, data)
                ?: throw IllegalStateException("Not connected")
        }

        override fun receive(): Flow<ByteArray> =
            client?.characteristicChanges
                ?.filter { it.uuid == TX_CHAR_UUID.toString() }
                ?.map { it.value }
                ?: throw IllegalStateException("Not connected")

        override fun disconnect() {
            client = null
        }
    }

    companion object {
        /**
         * Creates appropriate transport based on device flavor
         */
        fun create(flavor: DeviceFlavor): BleTransport = when (flavor) {
            DeviceFlavor.XIAOMI_FE95 -> XiaomiTransport(XiaomiEcdhAuthenticator(TODO("Implement MiCrypto")))
            DeviceFlavor.NORDIC_UART -> NordicUartTransport()
            DeviceFlavor.UNKNOWN -> throw IllegalArgumentException("Unknown device flavor")
        }
    }
}

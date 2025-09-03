package app.ebikeassistant.bluetooth.auth

import app.ebikeassistant.bluetooth.GattClient
import app.ebikeassistant.bluetooth.hex
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.filter
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.withTimeout
import java.nio.ByteBuffer
import java.nio.ByteOrder
import java.util.UUID

class XiaomiEcdhAuthenticator(private val crypto: MiCrypto) {
    private var frameCounter = 0

    companion object {
        // TODO: Define actual UUIDs and constants from protocol spec
        private val SERVICE_UUID = UUID.fromString("0000fe95-0000-1000-8000-00805f9b34fb")
        private val WRITE_CHAR_UUID = UUID.fromString("00000001-0000-1000-8000-00805f9b34fb")
        private val NOTIFY_CHAR_UUID = UUID.fromString("00000002-0000-1000-8000-00805f9b34fb")
        
        private const val AUTH_TIMEOUT_MS = 5000L
        private const val INFO_STRING = "xiaomi-ble-auth-v2"
        private const val SESSION_KEY_LENGTH = 16
    }

    suspend fun authenticate(gatt: GattClient): Session {
        // Subscribe to notifications
        gatt.enableNotifications(NOTIFY_CHAR_UUID)
        
        val notifyFlow = gatt.characteristicChanges
            .filter { it.characteristic.uuid == NOTIFY_CHAR_UUID }
            .map { it.value }

        // Start authentication flow
        val random = requestAndWaitForRandom(gatt, notifyFlow)
        val sharedSecret = sendPublicKeyAndGenerateSecret(gatt)
        
        // Derive session key using HKDF
        val sessionKey = crypto.hkdf(
            secret = sharedSecret,
            salt = random,
            info = INFO_STRING.toByteArray(),
            outputLength = SESSION_KEY_LENGTH
        )

        // Send auth proof and wait for success
        val success = sendAuthProofAndWaitForResult(gatt, notifyFlow, sessionKey, random)
        if (!success) {
            throw IllegalStateException("Authentication failed")
        }

        // Return authenticated session
        return Session(
            key = sessionKey,
            nonce = random,
            write = { payload -> writeEncrypted(gatt, sessionKey, random, payload) },
            notifications = notifyFlow.map { decrypt(sessionKey, random, it) }
        )
    }

    private suspend fun requestAndWaitForRandom(
        gatt: GattClient,
        notifications: Flow<ByteArray>
    ): ByteArray {
        val request = createPacket(
            MiPacket.Request(
                opCode = MiPacket.OP_REQUEST_RANDOM,
                frameCounter = nextCounter(),
                payload = ByteArray(0)
            )
        )

        gatt.write(WRITE_CHAR_UUID, request)

        return withTimeout(AUTH_TIMEOUT_MS) {
            notifications
                .map { parsePacket(it) }
                .first { it.opCode == MiPacket.OP_SEND_RANDOM }
                .payload
        }
    }

    private suspend fun sendPublicKeyAndGenerateSecret(gatt: GattClient): ByteArray {
        // TODO: Generate actual ECDH keypair and derive shared secret
        val dummyPublicKey = ByteArray(32) { 1 }
        val packet = createPacket(
            MiPacket.Request(
                opCode = MiPacket.OP_SEND_PUBKEY,
                frameCounter = nextCounter(),
                payload = dummyPublicKey
            )
        )
        
        gatt.write(WRITE_CHAR_UUID, packet)
        
        // TODO: Return actual ECDH shared secret
        return ByteArray(32) { 2 }
    }

    private suspend fun sendAuthProofAndWaitForResult(
        gatt: GattClient,
        notifications: Flow<ByteArray>,
        sessionKey: ByteArray,
        random: ByteArray
    ): Boolean {
        // TODO: Generate actual auth proof using session key and random
        val dummyProof = ByteArray(16) { 3 }
        val packet = createPacket(
            MiPacket.Request(
                opCode = MiPacket.OP_SEND_AUTH,
                frameCounter = nextCounter(),
                payload = dummyProof
            )
        )

        gatt.write(WRITE_CHAR_UUID, packet)

        return withTimeout(AUTH_TIMEOUT_MS) {
            val response = notifications
                .map { parsePacket(it) }
                .first { it.opCode == MiPacket.OP_AUTH_SUCCESS || it.opCode == MiPacket.OP_AUTH_FAILED }
            
            response.opCode == MiPacket.OP_AUTH_SUCCESS
        }
    }

    private fun createPacket(packet: MiPacket): ByteArray {
        return ByteBuffer.allocate(MiPacket.HEADER_SIZE + packet.payload.size)
            .order(ByteOrder.LITTLE_ENDIAN)
            .put(packet.opCode.toByte())
            .putShort(packet.frameCounter.toShort())
            .put(packet.payload.size.toByte())
            .put(packet.payload)
            .array()
    }

    private fun parsePacket(data: ByteArray): MiPacket.Response {
        val buffer = ByteBuffer.wrap(data).order(ByteOrder.LITTLE_ENDIAN)
        val opCode = buffer.get().toInt() and 0xFF
        val counter = buffer.short.toInt() and 0xFFFF
        val payloadLen = buffer.get().toInt() and 0xFF
        
        val payload = ByteArray(payloadLen)
        buffer.get(payload)
        
        return MiPacket.Response(opCode, counter, payload)
    }

    private suspend fun writeEncrypted(
        gatt: GattClient,
        key: ByteArray,
        nonce: ByteArray,
        payload: ByteArray
    ) {
        // TODO: Implement actual frame encryption
        gatt.write(WRITE_CHAR_UUID, payload)
    }

    private fun decrypt(key: ByteArray, nonce: ByteArray, data: ByteArray): ByteArray {
        // TODO: Implement actual frame decryption
        return data
    }

    private fun nextCounter(): Int = frameCounter++
}

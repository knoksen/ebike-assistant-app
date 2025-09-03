package app.ebikeassistant.bluetooth.xiaomi

import app.ebikeassistant.bluetooth.GattClient
import app.ebikeassistant.bluetooth.xiaomi.MiPacket.Companion.OP_AUTH_PROOF
import app.ebikeassistant.bluetooth.xiaomi.MiPacket.Companion.OP_GET_RANDOM
import app.ebikeassistant.bluetooth.xiaomi.MiPacket.Companion.OP_SEND_KEY
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.filter
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.withTimeout
import java.util.UUID
import kotlin.time.Duration.Companion.seconds

/**
 * Session data after successful authentication
 */
data class Session(
    val key: ByteArray,
    val nonce: ByteArray,
    val write: suspend (ByteArray) -> Unit,
    val notifications: Flow<ByteArray>
) {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false
        other as Session
        return key.contentEquals(other.key) &&
               nonce.contentEquals(other.nonce)
    }

    override fun hashCode(): Int {
        var result = key.contentHashCode()
        result = 31 * result + nonce.contentHashCode()
        return result
    }
}

/**
 * Implements Xiaomi/Mi BLE ECDH v2 authentication
 */
class XiaomiEcdhAuthenticator(
    private val crypto: MiCrypto
) {
    companion object {
        private const val AUTH_TIMEOUT_SECONDS = 30L

        // TODO: Protocol-specific UUIDs and constants
        val FE95_SERVICE: UUID = UUID.fromString("0000fe95-0000-1000-8000-00805f9b34fb")
        val AUTH_CHAR: UUID = UUID.fromString("00000001-0000-1000-8000-00805f9b34fb") // TODO: Replace with actual UUID
        
        private const val AUTH_INFO = "mible-login-info"
        private const val SESSION_INFO = "mible-session-info"
    }

    suspend fun authenticate(gatt: GattClient): Session = withTimeout(AUTH_TIMEOUT_SECONDS.seconds) {
        var frameCounter: Short = 0

        // Subscribe to notifications
        gatt.enableNotifications(AUTH_CHAR)

        // Setup notification flow
        val responses = gatt.characteristicChanges
            .filter { it.uuid == AUTH_CHAR.toString() }
            .map { MiPacket.decode(it.value) }

        // Request random challenge
        val request = MiPacket.Request(OP_GET_RANDOM, frameCounter++, byteArrayOf())
        gatt.write(AUTH_CHAR, MiPacket.encode(request))

        // Wait for random challenge
        val random = (responses.first { it.opCode == OP_GET_RANDOM } as MiPacket.Response)
            .payload

        // Send our public key
        val publicKey = crypto.getPublicKey()
        gatt.write(
            AUTH_CHAR,
            MiPacket.encode(MiPacket.Request(OP_SEND_KEY, frameCounter++, publicKey))
        )

        // Wait for device public key
        val deviceKey = (responses.first { it.opCode == OP_SEND_KEY } as MiPacket.Response)
            .payload

        // Calculate shared secret and derive session key
        val sharedSecret = crypto.ecdh(deviceKey)
        val sessionKey = crypto.hkdf(
            secret = sharedSecret,
            salt = random,
            info = AUTH_INFO.toByteArray(),
            outputLength = 64 // TODO: Protocol-specific key size
        )

        // Send auth proof
        val proof = crypto.aesCcmEncrypt(
            key = sessionKey,
            nonce = random,
            data = publicKey
        )
        gatt.write(
            AUTH_CHAR,
            MiPacket.encode(MiPacket.Request(OP_AUTH_PROOF, frameCounter++, proof))
        )

        // Wait for success response and extract session nonce
        val bindResponse = responses.first { it.opCode == OP_AUTH_PROOF } as MiPacket.Response
        val sessionNonce = crypto.aesCcmDecrypt(
            key = sessionKey,
            nonce = random,
            data = bindResponse.payload
        )

        // Return authenticated session
        Session(
            key = sessionKey,
            nonce = sessionNonce,
            write = { payload ->
                gatt.write(
                    AUTH_CHAR,
                    crypto.aesCcmEncrypt(sessionKey, sessionNonce, payload)
                )
            },
            notifications = gatt.characteristicChanges
                .filter { it.uuid == AUTH_CHAR.toString() }
                .map { event -> 
                    crypto.aesCcmDecrypt(sessionKey, sessionNonce, event.value)
                }
        )
    }
}

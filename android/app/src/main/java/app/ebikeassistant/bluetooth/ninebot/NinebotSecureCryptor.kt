package app.ebikeassistant.bluetooth.ninebot

import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

/**
 * Handles secure communication for Ninebot BLE protocol
 */
class NinebotSecureCryptor(
    private val params: SecureParams,
    private val cipher: SecureCipher,
    private val noncePolicy: NoncePolicy
) {
    companion object {
        // TODO: Protocol-specific constants
        private const val MAX_FRAME_SIZE = 20 // BLE MTU - overhead
        private const val TAG_SIZE = 4 // Example tag size
    }

    /**
     * Wraps raw write/notify operations with encryption
     */
    fun wrap(
        write: suspend (ByteArray) -> Unit,
        notifications: Flow<ByteArray>
    ): SecuredLink = SecuredLink(
        writeSecured = { data ->
            // TODO: Implement frame segmentation if needed
            val nonce = noncePolicy.nextWriteNonce()
            val encrypted = cipher.encrypt(data, nonce)
            write(encrypted)
            noncePolicy.updateNonce(isWrite = true)
        },
        securedNotifications = notifications.map { data ->
            // TODO: Implement frame reassembly if needed
            val nonce = noncePolicy.nextReadNonce()
            val decrypted = cipher.decrypt(data, nonce)
            noncePolicy.updateNonce(isWrite = false)
            decrypted
        }
    )
}

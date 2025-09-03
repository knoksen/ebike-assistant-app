package app.ebikeassistant.bluetooth.ninebot

/**
 * Default pass-through implementation for testing
 */
class PassThroughCipher : SecureCipher {
    override fun encrypt(
        data: ByteArray,
        nonce: ByteArray,
        associatedData: ByteArray?
    ): ByteArray = data.copyOf()

    override fun decrypt(
        data: ByteArray,
        nonce: ByteArray,
        associatedData: ByteArray?
    ): ByteArray = data.copyOf()
}

/**
 * Default sequential nonce policy for testing
 */
class SequentialNoncePolicy : NoncePolicy {
    private var writeCounter = 0L
    private var readCounter = 0L

    override fun nextWriteNonce(): ByteArray =
        writeCounter.toBigEndian()

    override fun nextReadNonce(): ByteArray =
        readCounter.toBigEndian()

    override fun updateNonce(isWrite: Boolean) {
        if (isWrite) writeCounter++ else readCounter++
    }

    private fun Long.toBigEndian(): ByteArray = ByteArray(8) { i ->
        (this shr ((7 - i) * 8)).toByte()
    }
}

/**
 * Creates default testing configuration
 */
object DefaultSecureConfig {
    fun createTestParams() = SecureParams(
        key = ByteArray(16) { it.toByte() },  // Sequential test key
        writeNonce = ByteArray(12),           // Zero nonce
        readNonce = ByteArray(12)             // Zero nonce
    )
}

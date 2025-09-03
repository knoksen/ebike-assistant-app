package app.ebikeassistant.bluetooth.ninebot

import kotlinx.coroutines.flow.Flow

/**
 * Parameters for AEAD encryption
 */
data class SecureParams(
    val key: ByteArray,
    val writeNonce: ByteArray,
    val readNonce: ByteArray
) {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false
        other as SecureParams
        return key.contentEquals(other.key) &&
               writeNonce.contentEquals(other.writeNonce) &&
               readNonce.contentEquals(other.readNonce)
    }

    override fun hashCode(): Int {
        var result = key.contentHashCode()
        result = 31 * result + writeNonce.contentHashCode()
        result = 31 * result + readNonce.contentHashCode()
        return result
    }
}

/**
 * Wraps read/write operations with encryption
 */
data class SecuredLink(
    val writeSecured: suspend (ByteArray) -> Unit,
    val securedNotifications: Flow<ByteArray>
)

/**
 * Policy for nonce generation and updates
 */
interface NoncePolicy {
    /**
     * Get next nonce for encryption
     */
    fun nextWriteNonce(): ByteArray
    
    /**
     * Get next nonce for decryption
     */
    fun nextReadNonce(): ByteArray
    
    /**
     * Update nonce after successful operation
     */
    fun updateNonce(isWrite: Boolean)
}

/**
 * Interface for cipher operations
 */
interface SecureCipher {
    /**
     * Encrypts data with associated data
     */
    fun encrypt(
        data: ByteArray,
        nonce: ByteArray,
        associatedData: ByteArray? = null
    ): ByteArray

    /**
     * Decrypts data with associated data
     */
    fun decrypt(
        data: ByteArray,
        nonce: ByteArray,
        associatedData: ByteArray? = null
    ): ByteArray
}

package app.ebikeassistant.bluetooth.auth

import kotlinx.coroutines.flow.Flow

/**
 * Represents an authenticated session with a Xiaomi device
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

        if (!key.contentEquals(other.key)) return false
        if (!nonce.contentEquals(other.nonce)) return false
        return true
    }

    override fun hashCode(): Int {
        var result = key.contentHashCode()
        result = 31 * result + nonce.contentHashCode()
        return result
    }
}

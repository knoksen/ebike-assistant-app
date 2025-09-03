package app.ebikeassistant.bluetooth.auth

/**
 * Interface for cryptographic operations needed by the Xiaomi ECDH auth protocol.
 * Implementations should be Android-independent to allow unit testing.
 */
interface MiCrypto {
    /**
     * Generate ECDH shared secret from peer's public key
     */
    fun ecdh(peerPublicKey: ByteArray): ByteArray

    /**
     * Derive a session key using HKDF with SHA-256
     */
    fun hkdf(
        secret: ByteArray,
        salt: ByteArray,
        info: ByteArray,
        outputLength: Int
    ): ByteArray

    /**
     * AES-CCM encrypt with associated data
     */
    fun aesCcmEncrypt(
        key: ByteArray,
        nonce: ByteArray,
        payload: ByteArray,
        associatedData: ByteArray
    ): ByteArray

    /**
     * AES-CCM decrypt with associated data
     */
    fun aesCcmDecrypt(
        key: ByteArray,
        nonce: ByteArray,
        ciphertext: ByteArray,
        associatedData: ByteArray
    ): ByteArray
}

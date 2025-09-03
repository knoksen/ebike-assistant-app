package app.ebikeassistant.bluetooth.xiaomi

/**
 * Crypto interface for Mi BLE authentication
 */
interface MiCrypto {
    /**
     * Generates ECDH shared secret from peer's public key
     */
    fun ecdh(peerPublicKey: ByteArray): ByteArray

    /**
     * Derives encryption key using HKDF with SHA-256
     */
    fun hkdf(
        secret: ByteArray,
        salt: ByteArray,
        info: ByteArray,
        outputLength: Int
    ): ByteArray

    /**
     * AES-CCM encryption
     */
    fun aesCcmEncrypt(
        key: ByteArray,
        nonce: ByteArray,
        data: ByteArray,
        associatedData: ByteArray? = null
    ): ByteArray

    /**
     * AES-CCM decryption
     */
    fun aesCcmDecrypt(
        key: ByteArray,
        nonce: ByteArray,
        data: ByteArray,
        associatedData: ByteArray? = null
    ): ByteArray

    /**
     * Gets the public key for ECDH
     */
    fun getPublicKey(): ByteArray
}

package app.ebikeassistant.crypto

import javax.crypto.Mac
import javax.crypto.spec.SecretKeySpec

/**
 * HMAC-based Key Derivation Function (HKDF) implementation using SHA-256
 * as defined in RFC 5869.
 */
object Hkdf {
    /**
     * Derives key material using HKDF-SHA256
     *
     * @param ikm Input Key Material (initial secret)
     * @param salt Salt value (recommended: random, but can be empty)
     * @param info Context/application specific information
     * @param size Length of output keying material in bytes
     * @return Derived key material of specified length
     */
    fun sha256(ikm: ByteArray, salt: ByteArray, info: ByteArray, size: Int): ByteArray {
        // Extract phase - mix salt and input material
        val prk = hmacSha256(salt, ikm)
        
        // Expand phase - generate output keying material
        var t = ByteArray(0)
        val out = ArrayList<Byte>()
        var counter = 1
        
        while (out.size < size) {
            val mac = Mac.getInstance("HmacSHA256")
            mac.init(SecretKeySpec(prk, "HmacSHA256"))
            mac.update(t)
            mac.update(info)
            mac.update(counter.toByte())
            t = mac.doFinal()
            out.addAll(t.toList())
            counter++
        }
        
        return out.take(size).toByteArray()
    }

    /**
     * Compute HMAC-SHA256
     *
     * @param key MAC key
     * @param data Data to authenticate
     * @return HMAC value
     */
    private fun hmacSha256(key: ByteArray, data: ByteArray): ByteArray {
        val mac = Mac.getInstance("HmacSHA256")
        mac.init(SecretKeySpec(key, "HmacSHA256"))
        return mac.doFinal(data)
    }
}

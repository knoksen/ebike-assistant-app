package app.ebikeassistant.crypto

import org.junit.Test
import org.junit.Assert.*
import javax.crypto.AEADBadTagException
import kotlin.random.Random

class AesCcmTest {
    @Test
    fun testBasicEncryptDecrypt() {
        val key = Random.nextBytes(16)  // 128-bit key
        val nonce = Random.nextBytes(12)
        val data = "Hello, World!".toByteArray()
        val aad = "Additional Data".toByteArray()
        
        val ccm = AesCcm(key)
        
        val sealed = ccm.seal(nonce, aad, data)
        val opened = ccm.open(nonce, aad, sealed)
        
        assertArrayEquals(data, opened)
    }

    @Test
    fun testEmptyAad() {
        val key = Random.nextBytes(16)
        val nonce = Random.nextBytes(12)
        val data = "Test Data".toByteArray()
        val emptyAad = ByteArray(0)
        
        val ccm = AesCcm(key)
        
        val sealed = ccm.seal(nonce, emptyAad, data)
        val opened = ccm.open(nonce, emptyAad, sealed)
        
        assertArrayEquals(data, opened)
    }

    @Test(expected = AEADBadTagException::class)
    fun testTamperDetection() {
        val key = Random.nextBytes(16)
        val nonce = Random.nextBytes(12)
        val data = "Sensitive Data".toByteArray()
        val aad = "Context".toByteArray()
        
        val ccm = AesCcm(key)
        val sealed = ccm.seal(nonce, aad, data)
        
        // Tamper with ciphertext
        sealed[sealed.size - 1] = (sealed[sealed.size - 1] + 1).toByte()
        
        // Should throw AEADBadTagException
        ccm.open(nonce, aad, sealed)
    }

    @Test(expected = AEADBadTagException::class)
    fun testWrongAad() {
        val key = Random.nextBytes(16)
        val nonce = Random.nextBytes(12)
        val data = "Protected Content".toByteArray()
        val aad = "Original AAD".toByteArray()
        val wrongAad = "Wrong AAD".toByteArray()
        
        val ccm = AesCcm(key)
        val sealed = ccm.seal(nonce, aad, data)
        
        // Should throw AEADBadTagException due to AAD mismatch
        ccm.open(nonce, wrongAad, sealed)
    }

    @Test
    fun testRfc3610Vector1() {
        // Test vector from RFC 3610
        val key = byteArrayOf(
            0x40, 0x41, 0x42, 0x43, 0x44, 0x45, 0x46, 0x47,
            0x48, 0x49, 0x4a, 0x4b, 0x4c, 0x4d, 0x4e, 0x4f
        )
        val nonce = byteArrayOf(
            0x10, 0x11, 0x12, 0x13, 0x14, 0x15, 0x16,
            0x00, 0x00, 0x00, 0x01
        )
        val aad = byteArrayOf(
            0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07
        )
        val plaintext = byteArrayOf(
            0x20, 0x21, 0x22, 0x23
        )
        
        val ccm = AesCcm(key)
        val sealed = ccm.seal(nonce, aad, plaintext)
        
        // Expected output from RFC 3610
        val expected = byteArrayOf(
            0x71, 0x62, 0x01, 0x5b, 0x4d, 0xac, 0x25, 0x5d
        )
        
        assertArrayEquals(expected, sealed)
    }

    @Test
    fun testDifferentKeysProduceDifferentOutputs() {
        val key1 = Random.nextBytes(16)
        val key2 = Random.nextBytes(16)
        val nonce = Random.nextBytes(12)
        val data = "Same Data".toByteArray()
        val aad = ByteArray(0)
        
        val ccm1 = AesCcm(key1)
        val ccm2 = AesCcm(key2)
        
        val sealed1 = ccm1.seal(nonce, aad, data)
        val sealed2 = ccm2.seal(nonce, aad, data)
        
        assertFalse(sealed1.contentEquals(sealed2))
    }

    @Test
    fun testDifferentNoncesProduceDifferentOutputs() {
        val key = Random.nextBytes(16)
        val nonce1 = Random.nextBytes(12)
        val nonce2 = Random.nextBytes(12)
        val data = "Same Data".toByteArray()
        val aad = ByteArray(0)
        
        val ccm = AesCcm(key)
        
        val sealed1 = ccm.seal(nonce1, aad, data)
        val sealed2 = ccm.seal(nonce2, aad, data)
        
        assertFalse(sealed1.contentEquals(sealed2))
    }
}

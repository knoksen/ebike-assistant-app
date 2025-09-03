package app.ebikeassistant.crypto

import org.junit.Test
import org.junit.Assert.*
import kotlin.text.Charsets

class HkdfTest {
    @Test
    fun testBasicDerivation() {
        val ikm = "input key material".toByteArray(Charsets.UTF_8)
        val salt = "salt".toByteArray(Charsets.UTF_8)
        val info = "context info".toByteArray(Charsets.UTF_8)
        val size = 32
        
        val output = Hkdf.sha256(ikm, salt, info, size)
        assertEquals(size, output.size)
    }

    @Test
    fun testEmptySalt() {
        val ikm = "input key material".toByteArray(Charsets.UTF_8)
        val salt = ByteArray(0)
        val info = "context info".toByteArray(Charsets.UTF_8)
        val size = 32
        
        val output = Hkdf.sha256(ikm, salt, info, size)
        assertEquals(size, output.size)
    }

    @Test
    fun testRfc5869TestVector1() {
        val ikm = ByteArray(22) { 0x0b.toByte() }
        val salt = ByteArray(13) { i -> (i + 0x00).toByte() }
        val info = ByteArray(10) { i -> (i + 0xf0).toByte() }
        val size = 42

        val output = Hkdf.sha256(ikm, salt, info, size)
        
        // Expected output from RFC 5869 test vector 1
        val expected = byteArrayOf(
            0x3c.toByte(), 0xb2.toByte(), 0x5f.toByte(), 0x25.toByte(),
            0xfa.toByte(), 0xac.toByte(), 0xd5.toByte(), 0x7a.toByte(),
            0x90.toByte(), 0x43.toByte(), 0x4f.toByte(), 0x64.toByte(),
            0xd0.toByte(), 0x36.toByte(), 0x2f.toByte(), 0x2a.toByte(),
            0x2d.toByte(), 0x2d.toByte(), 0x0a.toByte(), 0x90.toByte(),
            0xcf.toByte(), 0x1a.toByte(), 0x5a.toByte(), 0x4c.toByte(),
            0x5d.toByte(), 0xb0.toByte(), 0x2d.toByte(), 0x56.toByte(),
            0xec.toByte(), 0xc4.toByte(), 0xc5.toByte(), 0xbf.toByte(),
            0x34.toByte(), 0x00.toByte(), 0x72.toByte(), 0x08.toByte(),
            0xd5.toByte(), 0xb8.toByte(), 0x87.toByte(), 0x18.toByte(),
            0x58.toByte(), 0x65.toByte()
        )
        
        assertArrayEquals(expected, output)
    }

    @Test
    fun testRfc5869TestVector2() {
        val ikm = ByteArray(80) { i -> i.toByte() }
        val salt = ByteArray(80) { i -> (i + 0x60).toByte() }
        val info = ByteArray(80) { i -> (i + 0xb0).toByte() }
        val size = 82

        val output = Hkdf.sha256(ikm, salt, info, size)
        
        // Expected output from RFC 5869 test vector 2
        val expected = byteArray("b11e398dc80327a1c8e7f78c596a4934" +
            "4f012eda2d4efad8a050cc4c19afa97c" +
            "59045a99cac7827271cb41c65e590e09" +
            "da3275600c2f09b8367793a9aca3db71" +
            "cc30c58179ec3e87c14c01d5c1f3434f" +
            "1d87")
        
        assertArrayEquals(expected, output)
    }

    @Test
    fun testRfc5869TestVector3() {
        val ikm = ByteArray(22) { 0x0b.toByte() }
        val salt = ByteArray(0)
        val info = ByteArray(0)
        val size = 42

        val output = Hkdf.sha256(ikm, salt, info, size)
        
        // Expected output from RFC 5869 test vector 3
        val expected = byteArray("8da4e775a563c18f715f802a063c5a31" +
            "b8a11f5c5ee1879ec3454e5f3c738d2d" +
            "9d201395faa4b61a96c8")
        
        assertArrayEquals(expected, output)
    }
    
    private fun byteArray(hex: String): ByteArray {
        return hex.chunked(2).map { it.toInt(16).toByte() }.toByteArray()
    }
}

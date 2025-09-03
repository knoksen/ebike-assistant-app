package app.ebikeassistant.codec

import org.junit.Test
import org.junit.Assert.*
import kotlin.random.Random

class CrcTest {
    @Test
    fun testCrc16IBM() {
        // Test vectors for CRC-16-IBM
        assertEquals(0x0000, Crc.crc16IBM(byteArrayOf()))
        assertEquals(0x4B37, Crc.crc16IBM("123456789".toByteArray()))
        
        // Additional test cases
        assertEquals(0xF0AC, Crc.crc16IBM(byteArrayOf(0x0F)))
        assertEquals(0x6417, Crc.crc16IBM(byteArrayOf(0xFF.toByte())))
    }

    @Test
    fun testCrc16X25() {
        // Test vectors for CRC-16-CCITT-FALSE
        assertEquals(0xFFFF, Crc.crc16X25(byteArrayOf()))
        assertEquals(0x906E, Crc.crc16X25("123456789".toByteArray()))
        
        // Additional test cases
        assertEquals(0x0F08, Crc.crc16X25(byteArrayOf(0x0F)))
        assertEquals(0x1E0F, Crc.crc16X25(byteArrayOf(0xFF.toByte())))
    }

    @Test
    fun testCrc8Maxim() {
        // Test vectors for CRC-8-MAXIM
        assertEquals(0x00, Crc.crc8Maxim(byteArrayOf()))
        assertEquals(0xA1, Crc.crc8Maxim("123456789".toByteArray()))
        
        // Additional test cases
        assertEquals(0x33, Crc.crc8Maxim(byteArrayOf(0x0F)))
        assertEquals(0xBD, Crc.crc8Maxim(byteArrayOf(0xFF.toByte())))
    }

    @Test
    fun testIncrementalCrc16IBM() {
        val data = "Hello, World!".toByteArray()
        
        // Calculate CRC in one go
        val fullCrc = Crc.crc16IBM(data)
        
        // Calculate CRC in chunks and verify it matches
        var partialCrc = 0xFFFF
        for (byte in data) {
            partialCrc = partialCrc xor (byte.toInt() and 0xFF)
            repeat(8) {
                val mix = partialCrc and 0x0001
                partialCrc = (partialCrc ushr 1)
                if (mix != 0) partialCrc = partialCrc xor 0xA001
            }
        }
        partialCrc = partialCrc and 0xFFFF
        
        assertEquals(fullCrc, partialCrc)
    }

    @Test
    fun testIncrementalCrc16X25() {
        val data = "Hello, World!".toByteArray()
        
        // Calculate CRC in one go
        val fullCrc = Crc.crc16X25(data)
        
        // Calculate CRC in chunks and verify it matches
        var partialCrc = 0xFFFF
        for (byte in data) {
            partialCrc = partialCrc xor (byte.toInt() and 0xFF)
            repeat(8) {
                val bit = partialCrc and 1
                partialCrc = partialCrc ushr 1
                if (bit != 0) partialCrc = partialCrc xor 0x8408
            }
        }
        partialCrc = partialCrc.inv() and 0xFFFF
        
        assertEquals(fullCrc, partialCrc)
    }

    @Test
    fun testRandomData() {
        val size = 1000
        val data = Random.nextBytes(size)
        
        // Ensure CRCs are consistent
        assertEquals(Crc.crc16IBM(data), Crc.crc16IBM(data.clone()))
        assertEquals(Crc.crc16X25(data), Crc.crc16X25(data.clone()))
        assertEquals(Crc.crc8Maxim(data), Crc.crc8Maxim(data.clone()))
        
        // Ensure different data produces different CRCs
        val differentData = data.clone().also { it[0] = (it[0] + 1).toByte() }
        assertNotEquals(Crc.crc16IBM(data), Crc.crc16IBM(differentData))
        assertNotEquals(Crc.crc16X25(data), Crc.crc16X25(differentData))
        assertNotEquals(Crc.crc8Maxim(data), Crc.crc8Maxim(differentData))
    }
}

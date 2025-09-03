package app.ebikeassistant.bluetooth.crc

import kotlin.test.*

class CrcCalculatorTest {
    private val crc8 = Crc8Calculator()
    private val crc16Ibm = Crc16IbmCalculator()
    private val crc16X25 = Crc16X25Calculator()

    @Test
    fun `test CRC-8 calculation`() {
        // Test vector: "123456789"
        val data = "123456789".toByteArray()
        assertEquals(0xF4, crc8.calculate(data))
        
        // Test empty array
        assertEquals(0x00, crc8.calculate(ByteArray(0)))
        
        // Test single byte
        assertEquals(0x07, crc8.calculate(byteArrayOf(0x80.toByte())))
    }

    @Test
    fun `test CRC-16 IBM calculation`() {
        // Test vector: "123456789"
        val data = "123456789".toByteArray()
        assertEquals(0xB44C, crc16Ibm.calculate(data))
        
        // Test empty array
        assertEquals(0x0000, crc16Ibm.calculate(ByteArray(0)))
        
        // Test single byte
        assertEquals(0xA001, crc16Ibm.calculate(byteArrayOf(0x80.toByte())))
    }

    @Test
    fun `test CRC-16 X25 calculation`() {
        // Test vector: "123456789"
        val data = "123456789".toByteArray()
        assertEquals(0x906E, crc16X25.calculate(data))
        
        // Test empty array
        assertEquals(0xFFFF, crc16X25.calculate(ByteArray(0)))
        
        // Test single byte
        assertEquals(0x1021, crc16X25.calculate(byteArrayOf(0x80.toByte())))
    }

    @Test
    fun `test offset and length parameters`() {
        val data = byteArrayOf(0x00, 0x11, 0x22, 0x33, 0x44, 0x55)
        
        // Test middle section
        val fullCrc8 = crc8.calculate(byteArrayOf(0x22, 0x33))
        assertEquals(fullCrc8, crc8.calculate(data, 2, 2))
        
        val fullCrc16Ibm = crc16Ibm.calculate(byteArrayOf(0x22, 0x33))
        assertEquals(fullCrc16Ibm, crc16Ibm.calculate(data, 2, 2))
        
        val fullCrc16X25 = crc16X25.calculate(byteArrayOf(0x22, 0x33))
        assertEquals(fullCrc16X25, crc16X25.calculate(data, 2, 2))
    }

    @Test
    fun `test invalid parameters`() {
        val data = byteArrayOf(0x00, 0x11, 0x22)
        
        // Test out of bounds
        assertFails { crc8.calculate(data, -1, 1) }
        assertFails { crc8.calculate(data, 0, 4) }
        assertFails { crc8.calculate(data, 2, 2) }
    }
}

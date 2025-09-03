package app.ebikeassistant.protocol

import org.junit.Test
import org.junit.Assert.*
import kotlin.random.Random

class FrameCodecTest {
    
    @Test
    fun testCrc16IBM() {
        // Test vectors from documented IBM CRC-16 implementation
        assertEquals(0x0000, Crc.crc16IBM(byteArrayOf()))
        assertEquals(0xBB3D, Crc.crc16IBM("123456789".toByteArray()))
    }

    @Test
    fun testCrc16X25() {
        // Test vectors from X.25 specification
        assertEquals(0xFFFF, Crc.crc16X25(byteArrayOf()))
        assertEquals(0x906E, Crc.crc16X25("123456789".toByteArray()))
    }

    @Test
    fun testCrc8Maxim() {
        // Test vectors from Maxim application note
        assertEquals(0x00, Crc.crc8Maxim(byteArrayOf()))
        assertEquals(0xA1, Crc.crc8Maxim("123456789".toByteArray()))
    }

    @Test
    fun testFrameEncoding() {
        val type = 0x12
        val counter = 0x34
        val body = byteArrayOf(0x56, 0x78, 0x9A)
        
        // Test IBM CRC
        val frameIBM = Encoder.encode(type, counter, body, useX25 = false)
        assertEquals(9, frameIBM.size)  // 4 header + 3 body + 2 CRC
        assertEquals(0x12, frameIBM[2].toInt() and 0xFF)  // type
        assertEquals(0x34, frameIBM[3].toInt() and 0xFF)  // counter
        
        // Test X.25 CRC
        val frameX25 = Encoder.encode(type, counter, body, useX25 = true)
        assertEquals(9, frameX25.size)
        assertEquals(0x12, frameX25[2].toInt() and 0xFF)
        assertEquals(0x34, frameX25[3].toInt() and 0xFF)
    }

    @Test
    fun testFrameDecoding() {
        val deframer = Deframer()
        
        // Test Data frame
        val data = Encoder.encode(0x12, 0x34, byteArrayOf(0x56, 0x78), false)
        val frames1 = deframer.offer(data)
        assertEquals(1, frames1.size)
        assertTrue(frames1[0] is Frame.Data)
        with(frames1[0] as Frame.Data) {
            assertEquals(0x12.toUByte(), type)
            assertEquals(0x34.toUByte(), counter)
            assertArrayEquals(byteArrayOf(0x56, 0x78), body)
        }
        
        // Test Ack
        val ack = Encoder.encode(0x00, 0x00, ByteArray(0), false)
        val frames2 = deframer.offer(ack)
        assertEquals(1, frames2.size)
        assertTrue(frames2[0] is Frame.Ack)
        
        // Test Nack
        val nack = Encoder.encode(0xFF, 0x42, ByteArray(0), false)
        val frames3 = deframer.offer(nack)
        assertEquals(1, frames3.size)
        assertTrue(frames3[0] is Frame.Nack)
        assertEquals(0x42.toUByte(), (frames3[0] as Frame.Nack).code)
    }

    @Test
    fun testPartialFrames() {
        val deframer = Deframer()
        val data = Encoder.encode(0x12, 0x34, byteArrayOf(0x56, 0x78), false)
        
        // Split frame into parts
        val part1 = data.sliceArray(0..2)
        val part2 = data.sliceArray(3 until data.size)
        
        // Should handle partial data
        val frames1 = deframer.offer(part1)
        assertTrue(frames1.isEmpty())
        
        // Should complete frame when rest arrives
        val frames2 = deframer.offer(part2)
        assertEquals(1, frames2.size)
        assertTrue(frames2[0] is Frame.Data)
    }

    @Test
    fun testReset() {
        val deframer = Deframer()
        val partial = Encoder.encode(0x12, 0x34, byteArrayOf(0x56), false)
            .sliceArray(0..2)
            
        // Add partial frame then reset
        deframer.offer(partial)
        deframer.reset()
        
        // Should handle new frame correctly after reset
        val data = Encoder.encode(0x12, 0x34, byteArrayOf(0x78), false)
        val frames = deframer.offer(data)
        assertEquals(1, frames.size)
        assertTrue(frames[0] is Frame.Data)
    }

    @Test
    fun testCorruptedFrames() {
        val deframer = Deframer()
        val data = Encoder.encode(0x12, 0x34, byteArrayOf(0x56, 0x78), false)
        
        // Corrupt CRC
        data[data.size - 1] = (data[data.size - 1] + 1).toByte()
        
        // Should reject corrupted frame
        val frames = deframer.offer(data)
        assertTrue(frames.isEmpty())
    }
}

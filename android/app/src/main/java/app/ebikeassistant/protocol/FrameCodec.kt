package app.ebikeassistant.protocol

import kotlin.experimental.and

sealed class Frame {
    data class Data(
        val type: UByte,
        val counter: UByte,
        val body: ByteArray
    ) : Frame() {
        override fun equals(other: Any?): Boolean {
            if (this === other) return true
            if (javaClass != other?.javaClass) return false

            other as Data
            if (type != other.type) return false
            if (counter != other.counter) return false
            if (!body.contentEquals(other.body)) return false

            return true
        }

        override fun hashCode(): Int {
            var result = type.hashCode()
            result = 31 * result + counter.hashCode()
            result = 31 * result + body.contentHashCode()
            return result
        }
    }
    object Ack : Frame()
    data class Nack(val code: UByte) : Frame()
}

/**
 * CRC calculation utilities
 */
object Crc {
    // IBM CRC-16 polynomial: x^16 + x^15 + x^2 + 1
    fun crc16IBM(bytes: ByteArray): Int {
        var crc = 0
        for (b in bytes) {
            crc = crc xor (b.toInt() and 0xFF shl 8)
            for (i in 0..7) {
                crc = if (crc and 0x8000 != 0) {
                    (crc shl 1) xor 0x8005
                } else {
                    crc shl 1
                }
            }
        }
        return crc and 0xFFFF
    }

    // X.25 CRC-16 polynomial: x^16 + x^12 + x^5 + 1
    fun crc16X25(bytes: ByteArray): Int {
        var crc = 0xFFFF
        for (b in bytes) {
            crc = crc xor ((b.toInt() and 0xFF) shl 8)
            for (i in 0..7) {
                crc = if (crc and 0x8000 != 0) {
                    (crc shl 1) xor 0x1021
                } else {
                    crc shl 1
                }
            }
        }
        return crc and 0xFFFF
    }

    // Maxim (Dallas) 1-Wire CRC-8 polynomial: x^8 + x^5 + x^4 + 1
    fun crc8Maxim(bytes: ByteArray): Int {
        var crc = 0
        for (b in bytes) {
            var data = b.toInt() and 0xFF
            for (i in 0..7) {
                val mix = (crc xor data) and 1
                crc = crc shr 1
                if (mix != 0) {
                    crc = crc xor 0x8C
                }
                data = data shr 1
            }
        }
        return crc
    }
}

/**
 * Frame encoding utility
 */
object Encoder {
    fun encode(type: Int, counter: Int, body: ByteArray, useX25: Boolean): ByteArray {
        val frameSize = 4 + body.size + 2  // length + type + counter + body + crc
        val buffer = ByteArray(frameSize)
        
        // Length (16-bit)
        buffer[0] = ((frameSize - 2) shr 8).toByte()  // High byte
        buffer[1] = (frameSize - 2).toByte()          // Low byte
        
        // Type and counter
        buffer[2] = type.toByte()
        buffer[3] = counter.toByte()
        
        // Body
        body.copyInto(buffer, 4)
        
        // Calculate CRC on everything except CRC field
        val crc = if (useX25) {
            Crc.crc16X25(buffer.sliceArray(0 until frameSize - 2))
        } else {
            Crc.crc16IBM(buffer.sliceArray(0 until frameSize - 2))
        }
        
        // Add CRC
        buffer[frameSize - 2] = (crc shr 8).toByte()
        buffer[frameSize - 1] = crc.toByte()
        
        return buffer
    }
}

/**
 * Frame decoding utility with state machine
 */
class Deframer {
    private var buffer = ByteArray(0)
    private var state = State.LENGTH
    private var frameLength = 0
    private var position = 0

    private enum class State {
        LENGTH,
        FRAME,
    }

    fun offer(bytes: ByteArray): List<Frame> {
        val frames = mutableListOf<Frame>()
        buffer = buffer.plus(bytes)

        while (buffer.isNotEmpty()) {
            when (state) {
                State.LENGTH -> {
                    if (buffer.size < 2) break
                    frameLength = ((buffer[0].toInt() and 0xFF) shl 8) or
                                 (buffer[1].toInt() and 0xFF)
                    buffer = buffer.sliceArray(2 until buffer.size)
                    state = State.FRAME
                }

                State.FRAME -> {
                    if (buffer.size < frameLength) break
                    
                    val frame = buffer.sliceArray(0 until frameLength)
                    buffer = buffer.sliceArray(frameLength until buffer.size)
                    
                    // Verify CRC (try both algorithms)
                    val receivedCrc = ((frame[frameLength-2].toInt() and 0xFF) shl 8) or
                                     (frame[frameLength-1].toInt() and 0xFF)
                    val dataSection = frame.sliceArray(0 until frameLength-2)
                    
                    val isValidIBM = Crc.crc16IBM(dataSection) == receivedCrc
                    val isValidX25 = Crc.crc16X25(dataSection) == receivedCrc
                    
                    if (isValidIBM || isValidX25) {
                        when {
                            frame[0] == 0x00.toByte() -> frames.add(Frame.Ack)
                            frame[0] == 0xFF.toByte() -> frames.add(Frame.Nack(frame[1].toUByte()))
                            else -> frames.add(Frame.Data(
                                type = frame[0].toUByte(),
                                counter = frame[1].toUByte(),
                                body = frame.sliceArray(2 until frameLength-2)
                            ))
                        }
                    }
                    
                    state = State.LENGTH
                }
            }
        }

        return frames
    }

    fun reset() {
        buffer = ByteArray(0)
        state = State.LENGTH
        frameLength = 0
        position = 0
    }
}

package app.ebikeassistant.bluetooth.xiaomi

import java.nio.ByteBuffer
import java.nio.ByteOrder

/**
 * Xiaomi/Mi BLE protocol packet interface
 */
sealed interface MiPacket {
    val opCode: Byte
    val frameCounter: Short
    
    data class Request(
        override val opCode: Byte,
        override val frameCounter: Short,
        val payload: ByteArray
    ) : MiPacket {
        override fun equals(other: Any?): Boolean {
            if (this === other) return true
            if (javaClass != other?.javaClass) return false
            other as Request
            return opCode == other.opCode &&
                   frameCounter == other.frameCounter &&
                   payload.contentEquals(other.payload)
        }

        override fun hashCode(): Int {
            var result = opCode.toInt()
            result = 31 * result + frameCounter.toInt()
            result = 31 * result + payload.contentHashCode()
            return result
        }
    }

    data class Response(
        override val opCode: Byte,
        override val frameCounter: Short,
        val payload: ByteArray,
        val status: Byte
    ) : MiPacket {
        override fun equals(other: Any?): Boolean {
            if (this === other) return true
            if (javaClass != other?.javaClass) return false
            other as Response
            return opCode == other.opCode &&
                   frameCounter == other.frameCounter &&
                   payload.contentEquals(other.payload) &&
                   status == other.status
        }

        override fun hashCode(): Int {
            var result = opCode.toInt()
            result = 31 * result + frameCounter.toInt()
            result = 31 * result + payload.contentHashCode()
            result = 31 * result + status.toInt()
            return result
        }
    }

    companion object {
        // TODO: Protocol-specific opcodes
        const val OP_GET_RANDOM: Byte = 0x10  // Example opcode
        const val OP_SEND_KEY: Byte = 0x11
        const val OP_AUTH_PROOF: Byte = 0x12
        const val OP_BIND_SUCCESS: Byte = 0x13

        fun encode(packet: MiPacket): ByteArray = ByteBuffer
            .allocate(when(packet) {
                is Request -> 3 + packet.payload.size
                is Response -> 4 + packet.payload.size
            })
            .order(ByteOrder.LITTLE_ENDIAN)
            .put(packet.opCode)
            .putShort(packet.frameCounter)
            .apply {
                when(packet) {
                    is Request -> put(packet.payload)
                    is Response -> {
                        put(packet.payload)
                        put(packet.status)
                    }
                }
            }
            .array()

        fun decode(data: ByteArray): MiPacket {
            val buffer = ByteBuffer.wrap(data).order(ByteOrder.LITTLE_ENDIAN)
            val opCode = buffer.get()
            val frameCounter = buffer.short
            
            return when {
                data.size == buffer.remaining() + 4 -> {
                    // Response packet (has status byte)
                    val payload = ByteArray(data.size - 4)
                    buffer.get(payload)
                    val status = buffer.get()
                    Response(opCode, frameCounter, payload, status)
                }
                else -> {
                    // Request packet
                    val payload = ByteArray(buffer.remaining())
                    buffer.get(payload)
                    Request(opCode, frameCounter, payload)
                }
            }
        }
    }
}

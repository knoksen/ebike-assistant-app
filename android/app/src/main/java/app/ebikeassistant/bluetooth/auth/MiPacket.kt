package app.ebikeassistant.bluetooth.auth

/**
 * Represents packets in the Xiaomi ECDH authentication protocol
 */
sealed interface MiPacket {
    val opCode: Int
    val frameCounter: Int
    val payload: ByteArray

    data class Request(
        override val opCode: Int,
        override val frameCounter: Int,
        override val payload: ByteArray
    ) : MiPacket {
        override fun equals(other: Any?): Boolean {
            if (this === other) return true
            if (javaClass != other?.javaClass) return false

            other as Request

            if (opCode != other.opCode) return false
            if (frameCounter != other.frameCounter) return false
            if (!payload.contentEquals(other.payload)) return false

            return true
        }

        override fun hashCode(): Int {
            var result = opCode
            result = 31 * result + frameCounter
            result = 31 * result + payload.contentHashCode()
            return result
        }
    }

    data class Response(
        override val opCode: Int,
        override val frameCounter: Int,
        override val payload: ByteArray
    ) : MiPacket {
        override fun equals(other: Any?): Boolean {
            if (this === other) return true
            if (javaClass != other?.javaClass) return false

            other as Response

            if (opCode != other.opCode) return false
            if (frameCounter != other.frameCounter) return false
            if (!payload.contentEquals(other.payload)) return false

            return true
        }

        override fun hashCode(): Int {
            var result = opCode
            result = 31 * result + frameCounter
            result = 31 * result + payload.contentHashCode()
            return result
        }
    }

    companion object {
        // TODO: Define actual opcode constants from protocol spec
        const val OP_REQUEST_RANDOM = 0x01
        const val OP_SEND_RANDOM = 0x02
        const val OP_SEND_PUBKEY = 0x03
        const val OP_SEND_AUTH = 0x04
        const val OP_AUTH_SUCCESS = 0x05
        const val OP_AUTH_FAILED = 0x06

        // Packet structure constants
        const val HEADER_SIZE = 4 // opcode(1) + counter(2) + payload_len(1)
        const val MAX_PAYLOAD_SIZE = 16
    }
}

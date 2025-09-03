package app.ebikeassistant.bluetooth

import kotlinx.coroutines.CompletableDeferred
import kotlinx.coroutines.withTimeout
import java.nio.ByteBuffer
import java.nio.ByteOrder
import kotlin.time.Duration.Companion.seconds

/**
 * Command interface for vehicle control
 */
sealed class Command {
    data object GetStatus : Command()
    data object GetBattery : Command()
    data class SetLock(val enabled: Boolean) : Command()
    data class SetHeadlight(val on: Boolean) : Command()
    data class SetCruiseControl(val enabled: Boolean) : Command()
}

/**
 * Command codec for serialization and response handling
 */
class CommandCodec(
    private val crcStrategy: CrcStrategy = Crc8Strategy()
) {
    private var frameCounter: Short = 0

    /**
     * Command frame types
     */
    companion object {
        const val CMD_GET_STATUS = 0x01
        const val CMD_GET_BATTERY = 0x02
        const val CMD_SET_LOCK = 0x10
        const val CMD_SET_HEADLIGHT = 0x11
        const val CMD_SET_CRUISE = 0x12

        const val REQUIRES_ENCRYPTION = 0x80
        const val FRAME_TIMEOUT_MS = 5000L
    }

    /**
     * Encodes command into frame bytes
     */
    fun encode(command: Command): CommandFrame {
        val buffer = ByteBuffer.allocate(32).order(ByteOrder.LITTLE_ENDIAN)
        val typeId = when (command) {
            is Command.GetStatus -> CMD_GET_STATUS
            is Command.GetBattery -> CMD_GET_BATTERY
            is Command.SetLock -> CMD_SET_LOCK or REQUIRES_ENCRYPTION
            is Command.SetHeadlight -> CMD_SET_HEADLIGHT
            is Command.SetCruiseControl -> CMD_SET_CRUISE
        }

        // Write header
        buffer.put(typeId.toByte())
        buffer.putShort(frameCounter++)

        // Write payload
        when (command) {
            is Command.SetLock -> buffer.put(if (command.enabled) 1 else 0)
            is Command.SetHeadlight -> buffer.put(if (command.on) 1 else 0)
            is Command.SetCruiseControl -> buffer.put(if (command.enabled) 1 else 0)
            else -> { /* No payload */ }
        }

        // Add CRC
        val frameSize = buffer.position()
        val frameBytes = buffer.array().copyOf(frameSize)
        val crc = crcStrategy.calculate(frameBytes, 0, frameSize)
        buffer.put(crc.toByte())

        return CommandFrame(
            bytes = buffer.array().copyOf(frameSize + 1),
            requiresEncryption = (typeId and REQUIRES_ENCRYPTION) != 0,
            response = CompletableDeferred()
        )
    }

    /**
     * Processes response frame
     */
    suspend fun processResponse(frame: ByteArray): Boolean {
        if (frame.size < 4) return false // Invalid frame

        val buffer = ByteBuffer.wrap(frame).order(ByteOrder.LITTLE_ENDIAN)
        val typeId = buffer.get().toInt() and 0xFF
        val responseCounter = buffer.short
        val status = buffer.get().toInt() and 0xFF

        return status == 0 // 0 = Success
    }
}

/**
 * Command frame with response handling
 */
data class CommandFrame(
    val bytes: ByteArray,
    val requiresEncryption: Boolean,
    val response: CompletableDeferred<Boolean>
) {
    suspend fun awaitResponse(): Boolean = withTimeout(5.seconds) {
        response.await()
    }

    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false
        other as CommandFrame
        return bytes.contentEquals(other.bytes) &&
               requiresEncryption == other.requiresEncryption
    }

    override fun hashCode(): Int {
        var result = bytes.contentHashCode()
        result = 31 * result + requiresEncryption.hashCode()
        return result
    }
}

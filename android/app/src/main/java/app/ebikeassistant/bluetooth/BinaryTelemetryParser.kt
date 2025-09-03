package app.ebikeassistant.bluetooth

import java.nio.ByteBuffer
import java.nio.ByteOrder

/**
 * CRC calculation strategy
 */
interface CrcStrategy {
    fun calculate(data: ByteArray, offset: Int = 0, length: Int = data.size): Int
}

/**
 * CRC-8 implementation
 */
class Crc8Strategy : CrcStrategy {
    private val table = ByteArray(256) { i ->
        var crc = i
        repeat(8) {
            crc = if (crc and 0x80 != 0) {
                ((crc shl 1) xor 0x07) and 0xFF
            } else {
                (crc shl 1) and 0xFF
            }
        }
        crc.toByte()
    }

    override fun calculate(data: ByteArray, offset: Int, length: Int): Int {
        var crc = 0
        for (i in offset until offset + length) {
            crc = table[(crc xor data[i].toInt()) and 0xFF].toInt() and 0xFF
        }
        return crc
    }
}

/**
 * CRC-16/IBM implementation
 */
class Crc16IbmStrategy : CrcStrategy {
    override fun calculate(data: ByteArray, offset: Int, length: Int): Int {
        var crc = 0
        for (i in offset until offset + length) {
            crc = ((crc ushr 8) or (crc shl 8)) and 0xFFFF
            crc = crc xor (data[i].toInt() and 0xFF)
            crc = crc xor ((crc and 0xFF) ushr 4)
            crc = crc xor ((crc shl 12) and 0xFFFF)
            crc = crc xor ((crc and 0xFF) shl 5)
        }
        return crc and 0xFFFF
    }
}

/**
 * Binary telemetry parser with pluggable message handlers
 */
class BinaryTelemetryParser {
    private val parsers = mutableMapOf<Int, (ByteBuffer) -> TelemetryEvent>()
    private var crcStrategy: CrcStrategy = Crc8Strategy()

    /**
     * Register a parser for a specific message type
     */
    fun registerParser(typeId: Int, parser: (ByteBuffer) -> TelemetryEvent) {
        parsers[typeId] = parser
    }

    /**
     * Set CRC validation strategy
     */
    fun setCrcStrategy(strategy: CrcStrategy) {
        crcStrategy = strategy
    }

    /**
     * Parse a telemetry frame
     */
    fun parse(frame: ByteArray): TelemetryEvent {
        val buffer = ByteBuffer.wrap(frame).order(ByteOrder.LITTLE_ENDIAN)
        
        // Validate frame size
        if (frame.size < 3) { // type + crc
            return TelemetryEvent.Nack
        }

        // Validate CRC
        val calculatedCrc = crcStrategy.calculate(frame, 0, frame.size - 1)
        val receivedCrc = frame.last().toInt() and 0xFF
        if (calculatedCrc != receivedCrc) {
            return TelemetryEvent.Nack
        }

        // Parse message
        val typeId = buffer.get().toInt() and 0xFF
        return parsers[typeId]?.invoke(buffer) ?: TelemetryEvent.Unknown(typeId)
    }

    companion object {
        /**
         * Creates default parser with common message types
         */
        fun createDefault(): BinaryTelemetryParser = BinaryTelemetryParser().apply {
            // Register default parsers
            registerParser(0x01) { buffer -> 
                // Example telemetry parser
                TelemetryEvent.TelemetryUpdate(
                    Telemetry(
                        vehicleModel = buffer.getAsciiString(16),
                        manufacturerId = buffer.short.toInt(),
                        firmwareApp = buffer.getAsciiString(8),
                        firmwareBle = buffer.getAsciiString(8),
                        totalMileageKm = buffer.float,
                        currentTripKm = buffer.float,
                        avgSpeedKmH = buffer.float,
                        battery = BatteryData(
                            packVoltageV = buffer.float,
                            packCurrentA = buffer.float,
                            socPercent = buffer.get().toInt() and 0xFF,
                            tempC = buffer.float,
                            cellsMv = IntArray(10) { buffer.short.toInt() },
                            extBatteryTempC = buffer.float
                        ),
                        errorCode = buffer.short.toInt(),
                        warning = if (buffer.get().toInt() != 0) buffer.getAsciiString(32) else null
                    )
                )
            }

            registerParser(0x02) { buffer ->
                // Example battery update parser
                TelemetryEvent.BatteryUpdate(
                    BatteryData(
                        packVoltageV = buffer.float,
                        packCurrentA = buffer.float,
                        socPercent = buffer.get().toInt() and 0xFF,
                        tempC = buffer.float,
                        cellsMv = IntArray(10) { buffer.short.toInt() },
                        extBatteryTempC = buffer.float
                    )
                )
            }

            // TODO: Add more message type parsers
        }
    }
}

/**
 * Helper function to read ASCII string from ByteBuffer
 */
private fun ByteBuffer.getAsciiString(length: Int): String {
    val bytes = ByteArray(length)
    get(bytes)
    val nullIndex = bytes.indexOf(0)
    return String(
        bytes.copyOfRange(0, if (nullIndex >= 0) nullIndex else length),
        Charsets.US_ASCII
    )
}

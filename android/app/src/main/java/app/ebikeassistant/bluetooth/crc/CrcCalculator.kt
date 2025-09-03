package app.ebikeassistant.bluetooth.crc

/**
 * CRC calculation utilities supporting common BLE protocols
 */
interface CrcCalculator {
    fun calculate(data: ByteArray, offset: Int = 0, length: Int = data.size): Int
}

/**
 * CRC-8 calculator commonly used in BLE protocols
 */
class Crc8Calculator : CrcCalculator {
    override fun calculate(data: ByteArray, offset: Int, length: Int): Int {
        var crc = 0
        for (i in offset until offset + length) {
            crc = (crc xor data[i].toInt()) and 0xFF
            for (j in 0 until 8) {
                crc = if (crc and 0x80 != 0) {
                    ((crc shl 1) xor 0x07) and 0xFF
                } else {
                    (crc shl 1) and 0xFF
                }
            }
        }
        return crc
    }
}

/**
 * CRC-16/IBM calculator (0xA001 polynomial) used in some BLE protocols
 */
class Crc16IbmCalculator : CrcCalculator {
    override fun calculate(data: ByteArray, offset: Int, length: Int): Int {
        var crc = 0
        for (i in offset until offset + length) {
            crc = crc xor (data[i].toInt() and 0xFF)
            for (j in 0 until 8) {
                crc = if (crc and 1 != 0) {
                    (crc ushr 1) xor 0xA001
                } else {
                    crc ushr 1
                }
            }
        }
        return crc
    }
}

/**
 * CRC-16/X25 calculator (0x1021 polynomial) used in some BLE protocols
 */
class Crc16X25Calculator : CrcCalculator {
    override fun calculate(data: ByteArray, offset: Int, length: Int): Int {
        var crc = 0xFFFF
        for (i in offset until offset + length) {
            crc = crc xor (data[i].toInt() shl 8)
            for (j in 0 until 8) {
                crc = if (crc and 0x8000 != 0) {
                    ((crc shl 1) xor 0x1021) and 0xFFFF
                } else {
                    (crc shl 1) and 0xFFFF
                }
            }
        }
        return crc xor 0xFFFF
    }
}

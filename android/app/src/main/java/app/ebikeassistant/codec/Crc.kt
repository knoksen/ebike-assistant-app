package app.ebikeassistant.codec

/**
 * CRC (Cyclic Redundancy Check) calculation utilities
 */
object Crc {
    /**
     * Calculates CRC-16-IBM (polynomial 0xA001)
     * Used in Modbus and USB
     */
    fun crc16IBM(bytes: ByteArray): Int {
        var crc = 0xFFFF
        for (b in bytes) {
            crc = crc xor (b.toInt() and 0xFF)
            repeat(8) {
                val mix = crc and 0x0001
                crc = (crc ushr 1)
                if (mix != 0) crc = crc xor 0xA001
            }
        }
        return crc and 0xFFFF
    }

    /**
     * Calculates CRC-16-X25 (polynomial 0x8408, final XOR 0xFFFF)
     * Used in X.25, V.41, HDLC, Bluetooth
     */
    fun crc16X25(bytes: ByteArray): Int {
        var crc = 0xFFFF
        for (b in bytes) {
            crc = crc xor (b.toInt() and 0xFF)
            repeat(8) {
                val bit = crc and 1
                crc = crc ushr 1
                if (bit != 0) crc = crc xor 0x8408
            }
        }
        return crc.inv() and 0xFFFF
    }

    /**
     * Calculates CRC-8-Maxim (polynomial 0x31)
     * Used in 1-Wire bus devices
     */
    fun crc8Maxim(bytes: ByteArray): Int {
        var crc = 0x00
        for (b in bytes) {
            var data = b.toInt()
            for (i in 0 until 8) {
                val mix = (crc xor data) and 0x01
                crc = crc ushr 1
                if (mix != 0) crc = crc xor 0x8C
                data = data ushr 1
            }
        }
        return crc and 0xFF
    }
}

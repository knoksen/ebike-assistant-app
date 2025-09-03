package app.ebikeassistant.bluetooth

import org.junit.Test
import java.util.UUID
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith

class BleConstantsTest {
    
    @Test
    fun `test UUID Bluetooth alias conversion`() {
        // Test standard Bluetooth UUID
        val batteryUUID = UUID.fromString("0000180F-0000-1000-8000-00805f9b34fb")
        assertEquals("180F", BleConstants.run { batteryUUID.toBluetoothAlias() })

        // Test custom UUID (non-Bluetooth base)
        val customUUID = UUID.fromString("6e400001-b5a3-f393-e0a9-e50e24dcca9e")
        assertEquals(
            "6e400001-b5a3-f393-e0a9-e50e24dcca9e", 
            BleConstants.run { customUUID.toBluetoothAlias() }
        )

        // Test FE95 service
        assertEquals("FE95", BleConstants.run { BleConstants.FE95_SERVICE.toBluetoothAlias() })
    }

    @Test
    fun `test ByteArray to hex conversion`() {
        val data = byteArrayOf(0x12, 0x34, 0xAB, 0xCD)
        assertEquals("1234ABCD", data.toHex())
        
        // Test empty array
        assertEquals("", ByteArray(0).toHex())
        
        // Test single byte
        assertEquals("FF", byteArrayOf(0xFF.toByte()).toHex())
    }

    @Test
    fun `test hex string to ByteArray conversion`() {
        // Test valid hex
        val bytes = "1234ABCD".hexToBytes()
        assertEquals(4, bytes.size)
        assertEquals(0x12, bytes[0].toInt() and 0xFF)
        assertEquals(0x34, bytes[1].toInt() and 0xFF)
        assertEquals(0xAB, bytes[2].toInt() and 0xFF)
        assertEquals(0xCD, bytes[3].toInt() and 0xFF)

        // Test lowercase
        assertEquals("1234ABCD".hexToBytes().toHex(), "1234abcd".hexToBytes().toHex())

        // Test with spaces and dashes
        assertEquals(
            "1234ABCD".hexToBytes().toHex(),
            "12-34 AB-CD".hexToBytes().toHex()
        )
    }

    @Test
    fun `test invalid hex string conversion`() {
        // Test odd length
        assertFailsWith<IllegalArgumentException> {
            "123".hexToBytes()
        }

        // Test invalid characters
        assertFailsWith<IllegalArgumentException> {
            "12XX34".hexToBytes()
        }
    }

    @Test
    fun `test UUID constants`() {
        // FE95 Service (Xiaomi)
        assertEquals(
            "0000fe95-0000-1000-8000-00805f9b34fb",
            BleConstants.FE95_SERVICE.toString().lowercase()
        )

        // NUS Service (Nordic UART)
        assertEquals(
            "6e400001-b5a3-f393-e0a9-e50e24dcca9e",
            BleConstants.NUS_SERVICE.toString().lowercase()
        )

        // CCC Descriptor
        assertEquals(
            "00002902-0000-1000-8000-00805f9b34fb",
            BleConstants.CCC_DESCRIPTOR.toString().lowercase()
        )
    }
}

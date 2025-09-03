package app.ebikeassistant.bluetooth

import android.bluetooth.BluetoothGatt
import android.bluetooth.BluetoothGattCharacteristic
import kotlinx.coroutines.runBlocking
import org.junit.Test
import org.junit.Assert.*
import io.mockk.*
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlinx.coroutines.test.runTest
import org.junit.Before

class BleWriterTest {
    private lateinit var gatt: BluetoothGatt
    private lateinit var characteristic: BluetoothGattCharacteristic
    
    @Before
    fun setup() {
        gatt = mockk(relaxed = true)
        characteristic = mockk(relaxed = true)
    }
    
    @Test
    fun testChunkSizeCalculation() = runTest {
        val mtu = 100
        val writer = BlePacketWriter(gatt, characteristic, mtu)
        
        // MTU - 3 should be used as chunk size
        val data = ByteArray(200)
        writer.writeFramed(data)
        
        // Should be split into 3 chunks (97 + 97 + 6)
        verify(exactly = 3) { gatt.writeCharacteristic(any()) }
    }
    
    @Test
    fun testMinimumChunkSize() = runTest {
        val mtu = 10  // Too small MTU
        val writer = BlePacketWriter(gatt, characteristic, mtu)
        
        val data = ByteArray(50)
        writer.writeFramed(data)
        
        // Should use minimum chunk size of 20
        verify(exactly = 3) { gatt.writeCharacteristic(any()) }
    }
    
    @Test
    fun testWriteDelay() = runTest {
        val writer = BlePacketWriter(gatt, characteristic, 50)
        val data = ByteArray(100)
        
        var lastWrite = 0L
        var minDelay = Long.MAX_VALUE
        
        coEvery { gatt.writeCharacteristic(any()) } coAnswers {
            val now = System.nanoTime()
            if (lastWrite > 0) {
                val delay = now - lastWrite
                minDelay = minOf(minDelay, delay)
            }
            lastWrite = now
            true
        }
        
        writer.writeFramed(data, delayBetweenMs = 10)
        
        // Verify minimum delay between writes
        assertTrue("Delay should be at least 10ms", minDelay >= 10_000_000)
    }
    
    @Test
    fun testMtuNegotiation() = runTest {
        val gatt = mockk<BluetoothGatt>()
        
        coEvery { gatt.requestMtu(any()) } returns true
        
        val mtu = runBlocking {
            gatt.requestMtuSafely(247)
        }
        
        // In our stub implementation, returns target
        assertEquals(247, mtu)
    }
}

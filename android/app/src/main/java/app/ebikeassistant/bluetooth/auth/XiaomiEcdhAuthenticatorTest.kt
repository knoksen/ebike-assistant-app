package app.ebikeassistant.bluetooth.auth

import app.ebikeassistant.bluetooth.GattClient
import io.mockk.coEvery
import io.mockk.coVerify
import io.mockk.every
import io.mockk.mockk
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.runBlocking
import org.junit.Test
import java.util.UUID
import kotlin.test.assertContentEquals
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith

class XiaomiEcdhAuthenticatorTest {
    private lateinit var authenticator: XiaomiEcdhAuthenticator
    private lateinit var mockCrypto: MiCrypto
    private lateinit var mockGatt: GattClient

    @BeforeTest
    fun setup() {
        mockCrypto = mockk()
        mockGatt = mockk()
        authenticator = XiaomiEcdhAuthenticator(mockCrypto)
    }

    @Test
    fun `authentication succeeds with valid responses`() = runBlocking {
        // Test vectors
        val testRandom = ByteArray(16) { 1 }
        val testSharedSecret = ByteArray(32) { 2 }
        val testSessionKey = ByteArray(16) { 3 }
        
        // Mock crypto operations
        every { mockCrypto.hkdf(any(), any(), any(), any()) } returns testSessionKey
        
        // Mock GATT operations
        coEvery { mockGatt.enableNotifications(any()) } returns Unit
        coEvery { mockGatt.write(any(), any()) } returns Unit
        coEvery { mockGatt.characteristicChanges } returns notificationsFlow
        
        // Start authentication
        val sessionFuture = authenticator.authenticate(mockGatt)
        
        // Simulate device responses
        notificationsFlow.emit(createTestPacket(MiPacket.OP_SEND_RANDOM, testRandom))
        notificationsFlow.emit(createTestPacket(MiPacket.OP_AUTH_SUCCESS, ByteArray(0)))
        
        // Verify session
        val session = sessionFuture
        assertContentEquals(testSessionKey, session.key)
        assertContentEquals(testRandom, session.nonce)
    }

    @Test
    fun `authentication fails with auth failed response`() = runBlocking {
        // Mock GATT operations
        coEvery { mockGatt.enableNotifications(any()) } returns Unit
        coEvery { mockGatt.write(any(), any()) } returns Unit
        coEvery { mockGatt.characteristicChanges } returns notificationsFlow
        
        // Start authentication
        val future = authenticator.authenticate(mockGatt)
        
        // Simulate device responses
        notificationsFlow.emit(createTestPacket(MiPacket.OP_SEND_RANDOM, ByteArray(16)))
        notificationsFlow.emit(createTestPacket(MiPacket.OP_AUTH_FAILED, ByteArray(0)))
        
        // Verify failure
        assertFailsWith<IllegalStateException> {
            future
        }
    }

    private fun createTestPacket(opCode: Int, payload: ByteArray): ByteArray {
        return byteArrayOf(
            opCode.toByte(),
            0, 0,  // frame counter
            payload.size.toByte()
        ) + payload
    }
}

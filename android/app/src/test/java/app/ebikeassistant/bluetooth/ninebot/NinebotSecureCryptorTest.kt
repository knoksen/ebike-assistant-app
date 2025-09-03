package app.ebikeassistant.bluetooth.ninebot

import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.test.runTest
import org.junit.Before
import org.junit.Test
import kotlin.test.assertContentEquals
import kotlin.test.assertEquals

class NinebotSecureCryptorTest {
    private lateinit var cryptor: NinebotSecureCryptor
    private lateinit var cipher: SecureCipher
    private lateinit var noncePolicy: NoncePolicy
    private lateinit var params: SecureParams

    @Before
    fun setup() {
        params = DefaultSecureConfig.createTestParams()
        cipher = PassThroughCipher()
        noncePolicy = SequentialNoncePolicy()
        cryptor = NinebotSecureCryptor(params, cipher, noncePolicy)
    }

    @Test
    fun `test secure write operation`() = runTest {
        val written = mutableListOf<ByteArray>()
        val writeOperation: suspend (ByteArray) -> Unit = { data ->
            written.add(data)
        }

        val link = cryptor.wrap(
            write = writeOperation,
            notifications = flow { }
        )

        // Test data
        val testData = "Test Message".toByteArray()
        
        // Write through secure link
        link.writeSecured(testData)

        // With pass-through cipher, data should be unchanged
        assertEquals(1, written.size)
        assertContentEquals(testData, written[0])
    }

    @Test
    fun `test secure notifications`() = runTest {
        val notificationFlow = MutableSharedFlow<ByteArray>()
        
        val link = cryptor.wrap(
            write = { },
            notifications = notificationFlow
        )

        // Test data
        val testData = "Test Notification".toByteArray()

        // Launch collector
        val job = launch {
            val received = link.securedNotifications.first()
            // With pass-through cipher, data should be unchanged
            assertContentEquals(testData, received)
        }

        // Emit test data
        notificationFlow.emit(testData)
        
        job.join()
    }

    @Test
    fun `test nonce updates`() = runTest {
        val written = mutableListOf<ByteArray>()
        val notifications = MutableSharedFlow<ByteArray>()

        val link = cryptor.wrap(
            write = { data -> written.add(data) },
            notifications = notifications
        )

        // Multiple writes should advance write nonce
        repeat(3) {
            link.writeSecured("Test $it".toByteArray())
        }

        // Multiple notifications should advance read nonce
        val job = launch {
            link.securedNotifications.collect()
        }

        repeat(3) {
            notifications.emit("Notify $it".toByteArray())
        }

        job.cancel()
    }
}

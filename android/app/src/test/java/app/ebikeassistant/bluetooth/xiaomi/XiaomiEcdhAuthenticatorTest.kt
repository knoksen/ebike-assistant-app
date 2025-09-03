package app.ebikeassistant.bluetooth.xiaomi

import app.ebikeassistant.bluetooth.GattClient
import app.ebikeassistant.bluetooth.CharacteristicEvent
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.test.runTest
import org.junit.Before
import org.junit.Test
import java.util.UUID
import kotlin.test.assertContentEquals
import kotlin.test.assertEquals

/**
 * Mock crypto implementation for testing
 */
class MockMiCrypto : MiCrypto {
    companion object {
        val TEST_PUBLIC_KEY = "0123456789ABCDEF".toByteArray()
        val TEST_SHARED_SECRET = "SHARED_SECRET_TEST".toByteArray()
        val TEST_SESSION_KEY = "SESSION_KEY_000000".toByteArray()
        val TEST_SESSION_NONCE = "NONCE".toByteArray()
    }

    override fun ecdh(peerPublicKey: ByteArray): ByteArray = TEST_SHARED_SECRET

    override fun hkdf(
        secret: ByteArray,
        salt: ByteArray,
        info: ByteArray,
        outputLength: Int
    ): ByteArray = TEST_SESSION_KEY

    override fun aesCcmEncrypt(
        key: ByteArray,
        nonce: ByteArray,
        data: ByteArray,
        associatedData: ByteArray?
    ): ByteArray = data // Echo for testing

    override fun aesCcmDecrypt(
        key: ByteArray,
        nonce: ByteArray,
        data: ByteArray,
        associatedData: ByteArray?
    ): ByteArray = data // Echo for testing

    override fun getPublicKey(): ByteArray = TEST_PUBLIC_KEY
}

/**
 * Mock GATT client for testing
 */
class MockGattClient : GattClient(MockBluetoothAdapter()) {
    private val notificationFlow = MutableSharedFlow<CharacteristicEvent>()
    private val writtenData = mutableListOf<Pair<UUID, ByteArray>>()

    override val characteristicChanges: Flow<CharacteristicEvent> = notificationFlow.asSharedFlow()

    suspend fun emitNotification(uuid: UUID, data: ByteArray) {
        notificationFlow.emit(CharacteristicEvent(
            uuid = uuid.toString(),
            data = data
        ))
    }

    override suspend fun write(uuid: UUID, payload: ByteArray, writeType: Int) {
        writtenData.add(uuid to payload)
    }

    override suspend fun enableNotifications(uuid: UUID) {
        // No-op for testing
    }

    fun getWrittenData(): List<Pair<UUID, ByteArray>> = writtenData
}

class XiaomiEcdhAuthenticatorTest {
    private lateinit var authenticator: XiaomiEcdhAuthenticator
    private lateinit var gattClient: MockGattClient
    private lateinit var crypto: MockMiCrypto

    @Before
    fun setup() {
        crypto = MockMiCrypto()
        authenticator = XiaomiEcdhAuthenticator(crypto)
        gattClient = MockGattClient()
    }

    @Test
    fun `test successful authentication flow`() = runTest {
        // Create fake device random
        val deviceRandom = "DEVICE_RANDOM_DATA".toByteArray()
        val devicePublicKey = "DEVICE_PUBLIC_KEY".toByteArray()

        // Start authentication
        val authJob = launch {
            authenticator.authenticate(gattClient)
        }

        // Mock device responses
        gattClient.emitNotification(
            XiaomiEcdhAuthenticator.AUTH_CHAR,
            MiPacket.encode(MiPacket.Response(
                MiPacket.OP_GET_RANDOM,
                0,
                deviceRandom,
                0x00
            ))
        )

        gattClient.emitNotification(
            XiaomiEcdhAuthenticator.AUTH_CHAR,
            MiPacket.encode(MiPacket.Response(
                MiPacket.OP_SEND_KEY,
                1,
                devicePublicKey,
                0x00
            ))
        )

        // Mock bind success
        gattClient.emitNotification(
            XiaomiEcdhAuthenticator.AUTH_CHAR,
            MiPacket.encode(MiPacket.Response(
                MiPacket.OP_AUTH_PROOF,
                2,
                MockMiCrypto.TEST_SESSION_NONCE,
                0x00
            ))
        )

        // Wait for completion
        val session = authJob.await()

        // Verify written packets
        val writtenData = gattClient.getWrittenData()
        assertEquals(3, writtenData.size)

        // Verify session data
        assertContentEquals(
            MockMiCrypto.TEST_SESSION_KEY,
            session.key
        )
        assertContentEquals(
            MockMiCrypto.TEST_SESSION_NONCE,
            session.nonce
        )
    }

    @Test
    fun `test encrypted session communication`() = runTest {
        val session = Session(
            key = MockMiCrypto.TEST_SESSION_KEY,
            nonce = MockMiCrypto.TEST_SESSION_NONCE,
            write = { data -> 
                gattClient.write(XiaomiEcdhAuthenticator.AUTH_CHAR, data)
            },
            notifications = gattClient.characteristicChanges
                .map { it.value }
        )

        // Test encrypted write
        val testData = "Test Message".toByteArray()
        session.write(testData)

        // Verify write was encrypted
        val writtenData = gattClient.getWrittenData().last()
        assertEquals(XiaomiEcdhAuthenticator.AUTH_CHAR, writtenData.first)
        
        // With our mock crypto (echo), the data should be unchanged
        assertContentEquals(testData, writtenData.second)
    }
}

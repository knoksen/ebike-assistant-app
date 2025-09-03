package app.ebikeassistant.bluetooth.auth

import android.bluetooth.BluetoothGatt
import android.bluetooth.BluetoothGattCharacteristic
import app.ebikeassistant.bluetooth.BleConstants
import app.ebikeassistant.bluetooth.enableNotifications
import app.ebikeassistant.crypto.CryptoProvider
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.filter
import kotlinx.coroutines.flow.first
import javax.crypto.Cipher
import javax.crypto.spec.IvParameterSpec
import javax.crypto.spec.SecretKeySpec
import java.security.KeyPair
import java.security.KeyPairGenerator
import java.security.MessageDigest
import java.security.spec.ECGenParameterSpec
import kotlin.random.Random

class XiaomiAuthAdapter : AuthAdapter {
    private lateinit var keyPair: KeyPair
    private lateinit var sharedSecret: ByteArray
    private lateinit var sessionKey: ByteArray
    private val random = Random.Default
    
    override suspend fun establish(gatt: BluetoothGatt): SecuredLink {
        // Initialize crypto provider (adds BouncyCastle)
        CryptoProvider.init()
        
        // Get auth characteristic
        val authChar = gatt.getService(BleConstants.FE95_SERVICE)
            ?.getCharacteristic(BleConstants.AUTH_CHARACTERISTIC)
            ?: throw IllegalStateException("Auth characteristic not found")
            
        // Enable notifications
        gatt.enableNotifications(authChar)
        
        // Generate ECDH keypair
        val kpg = KeyPairGenerator.getInstance("EC")
        kpg.initialize(ECGenParameterSpec("secp256r1"))
        keyPair = kpg.generateKeyPair()
        
        // Request random challenge
        val challenge = requestChallenge(gatt, authChar)
        
        // Complete ECDH and derive keys
        completeEcdh(challenge)
        
        // Get data characteristic for secured communication
        val dataChar = gatt.getService(BleConstants.FE95_SERVICE)
            ?.getCharacteristic(BleConstants.DATA_CHARACTERISTIC)
            ?: throw IllegalStateException("Data characteristic not found")
            
        // Enable notifications on data characteristic
        gatt.enableNotifications(dataChar)
        
        return SecuredLink(
            write = { payload -> writeEncrypted(gatt, dataChar, payload) },
            notifications = getDecryptedNotifications(dataChar)
        )
    }
    
    private suspend fun requestChallenge(
        gatt: BluetoothGatt,
        char: BluetoothGattCharacteristic
    ): ByteArray {
        // Send initial request with our public key
        val request = ByteArray(2 + keyPair.public.encoded.size).apply {
            this[0] = 0x90.toByte() // Auth request command
            this[1] = keyPair.public.encoded.size.toByte()
            keyPair.public.encoded.copyInto(this, 2)
        }
        
        char.value = request
        gatt.writeCharacteristic(char)
        
        // Wait for challenge response
        return ByteArray(32) // Simulated challenge - implement actual response handling
    }
    
    private fun completeEcdh(challenge: ByteArray) {
        // Derive shared secret
        val ka = KeyAgreement.getInstance("ECDH")
        ka.init(keyPair.private)
        // ka.doPhase(remotePublicKey, true) // Use challenge to get remote public key
        sharedSecret = ka.generateSecret()
        
        // Derive session key using HKDF
        val info = "XiaomiScooter".toByteArray()
        val prk = MessageDigest.getInstance("SHA-256").digest(sharedSecret)
        sessionKey = ByteArray(16).apply {
            System.arraycopy(
                MessageDigest.getInstance("SHA-256").digest(prk + info + byteArrayOf(0x01)),
                0, this, 0, 16
            )
        }
    }
    
    private suspend fun writeEncrypted(
        gatt: BluetoothGatt,
        char: BluetoothGattCharacteristic,
        payload: ByteArray
    ) {
        val cipher = Cipher.getInstance("AES/CCM/NoPadding")
        val iv = ByteArray(12) { random.nextInt().toByte() }
        cipher.init(
            Cipher.ENCRYPT_MODE,
            SecretKeySpec(sessionKey, "AES"),
            IvParameterSpec(iv)
        )
        
        val encrypted = cipher.doFinal(payload)
        char.value = iv + encrypted
        gatt.writeCharacteristic(char)
    }
    
    private fun getDecryptedNotifications(char: BluetoothGattCharacteristic): Flow<ByteArray> {
        return char.getNotifications().map { encrypted ->
            val iv = encrypted.sliceArray(0..11)
            val cipher = Cipher.getInstance("AES/CCM/NoPadding")
            cipher.init(
                Cipher.DECRYPT_MODE,
                SecretKeySpec(sessionKey, "AES"),
                IvParameterSpec(iv)
            )
            cipher.doFinal(encrypted.sliceArray(12 until encrypted.size))
        }
    }
    
    private fun BluetoothGattCharacteristic.getNotifications(): Flow<ByteArray> {
        // Implement notification flow - this is a stub
        return kotlinx.coroutines.flow.flowOf()
    }
}

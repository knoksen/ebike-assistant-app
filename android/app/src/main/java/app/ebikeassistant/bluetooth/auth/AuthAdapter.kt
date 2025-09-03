package app.ebikeassistant.bluetooth.auth

import android.bluetooth.BluetoothGatt
import android.bluetooth.BluetoothGattCharacteristic
import app.ebikeassistant.BuildConfig
import app.ebikeassistant.bluetooth.BleConstants
import app.ebikeassistant.bluetooth.enableNotifications
import app.ebikeassistant.crypto.CryptoProvider
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import java.security.KeyPair
import java.security.KeyPairGenerator
import java.security.spec.ECGenParameterSpec
import javax.crypto.KeyAgreement
import javax.crypto.spec.SecretKeySpec
import kotlin.random.Random

/**
 * Represents an authenticated connection with encryption
 */
data class SecuredLink(
    val write: suspend (ByteArray) -> Unit,
    val notifications: Flow<ByteArray>
)

/**
 * Base interface for authentication adapters
 */
interface AuthAdapter {
    suspend fun establish(gatt: BluetoothGatt): SecuredLink
}

/**
 * Factory for creating the appropriate auth adapter
 */
object AuthAdapterFactory {
    fun create(): AuthAdapter = when (BuildConfig.FLAVOR_TAG) {
        "xiaomi" -> XiaomiAuthAdapter()
        "ninebot" -> NinebotAuthAdapter()
        else -> throw IllegalStateException("Unknown flavor: ${BuildConfig.FLAVOR_TAG}")
    }
}

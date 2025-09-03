package app.ebikeassistant.crypto

import app.ebikeassistant.BuildConfig
import java.security.Security
import org.bouncycastle.jce.provider.BouncyCastleProvider

/**
 * Manages cryptographic providers and initialization
 */
object CryptoProvider {
    private var isInitialized = false

    /**
     * Initializes cryptographic providers based on the app flavor.
     * For xiaomi flavor, adds BouncyCastle provider.
     */
    @Synchronized
    fun init() {
        if (isInitialized) return
        
        if (BuildConfig.FLAVOR_TAG == "xiaomi") {
            Security.removeProvider(BouncyCastleProvider.PROVIDER_NAME)
            Security.addProvider(BouncyCastleProvider())
        }
        
        isInitialized = true
    }
}

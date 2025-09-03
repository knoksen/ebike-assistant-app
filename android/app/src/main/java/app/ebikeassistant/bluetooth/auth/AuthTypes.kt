package app.ebikeassistant.bluetooth.auth

/**
 * SECURITY NOTICE
 * 
 * This class implements Xiaomi's ECDH-based authentication protocol.
 * Production implementations MUST:
 * 
 * 1. Use vetted crypto implementations (not mock/test crypto)
 * 2. Properly validate all received data
 * 3. Handle key material securely
 * 4. Implement proper error handling
 * 5. Use appropriate timeouts
 * 
 * See SecurityPolicy.kt for complete security requirements.
 */
sealed class AuthResult {
    /**
     * Authentication succeeded with a secure session
     */
    data class Success(val session: Session) : AuthResult()
    
    /**
     * Authentication failed with a specific error
     */
    data class Failure(
        val reason: FailureReason,
        val message: String
    ) : AuthResult()
    
    /**
     * Protocol violation or unexpected error
     */
    data class Error(
        val exception: Exception,
        val message: String
    ) : AuthResult()
}

enum class FailureReason {
    TIMEOUT,
    REJECTED,
    INVALID_DATA,
    PROTOCOL_ERROR,
    CRYPTO_ERROR
}

/**
 * IMPLEMENTATION NOTES
 * 
 * 1. Some devices use FE95 service with encrypted commands
 * 2. Others use simpler UART-like services (NUS)
 * 3. The transport abstraction handles both cases
 * 4. Device-specific frame formats will be added later
 * 
 * FIRMWARE UPDATE NOTICE
 * 
 * Firmware updates are intentionally excluded from v1.
 * Future firmware update support would require:
 * - Cryptographic verification
 * - Safe update procedures
 * - Explicit user consent
 * - Full backup/restore
 */

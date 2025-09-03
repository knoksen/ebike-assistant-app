package app.ebikeassistant.security

/**
 * SECURITY NOTICE
 * 
 * This interface defines the expected shape of a secure cryptographic provider
 * for ECDH key exchange and AES-CCM operations. A real implementation must:
 * 
 * 1. Use strong, standardized cryptographic primitives (e.g. X25519, HKDF-SHA256)
 * 2. Properly handle key material and perform secure key erasure
 * 3. Be independently reviewed before production use
 * 4. Have test vectors to validate the implementation
 * 
 * DO NOT implement this interface with mock/placeholder crypto in production.
 */
interface SecureCryptoProvider {
    /**
     * Whether this is a mock implementation (must be false in production)
     */
    val isMockImplementation: Boolean
    
    /**
     * Logs a warning if mock crypto is used in production
     */
    fun validateProductionSafety() {
        check(!isMockImplementation) { 
            "SECURITY RISK: Mock crypto implementation detected in production build" 
        }
    }
}

/**
 * SECURITY BOUNDARIES
 * 
 * 1. Authentication
 * - The XiaomiEcdhAuthenticator establishes secure sessions via ECDH
 * - All sensitive operations must be authenticated
 * - Session keys must be properly derived and rotated
 * 
 * 2. Firmware Safety
 * - Firmware updates are OUT OF SCOPE for v1
 * - Future firmware support requires:
 *   * Explicit user consent
 *   * Signed firmware packages
 *   * Checksum validation
 *   * Atomic updates
 *   * Rollback capability
 * 
 * 3. Command Security
 * - Commands that could affect vehicle safety must be authenticated
 * - Rate limiting should be implemented for critical commands
 * - Commands should be idempotent where possible
 * 
 * 4. Data Validation
 * - All parsed data must be validated before use
 * - Buffer sizes must be checked
 * - CRC/checksum verification required
 * 
 * 5. Privacy
 * - Minimize collection of unique identifiers
 * - Clear documentation of data usage
 * - Proper handling of location data
 */

/**
 * Command classifications for security policy enforcement
 */
enum class CommandSecurity {
    /**
     * Read-only telemetry commands
     */
    TELEMETRY_READ,
    
    /**
     * Commands that change non-critical settings
     */
    SETTINGS_WRITE,
    
    /**
     * Commands that could affect vehicle operation
     */
    SAFETY_CRITICAL,
    
    /**
     * Firmware update operations (currently disabled)
     */
    FIRMWARE_UPDATE
}

/**
 * Security requirements per command class
 */
object SecurityPolicy {
    private val requirements = mapOf(
        CommandSecurity.TELEMETRY_READ to SecurityRequirements(
            requiresAuth = false,
            requiresEncryption = false,
            rateLimitMs = 0
        ),
        CommandSecurity.SETTINGS_WRITE to SecurityRequirements(
            requiresAuth = true,
            requiresEncryption = true,
            rateLimitMs = 1000
        ),
        CommandSecurity.SAFETY_CRITICAL to SecurityRequirements(
            requiresAuth = true,
            requiresEncryption = true,
            rateLimitMs = 2000,
            requiresConfirmation = true
        ),
        CommandSecurity.FIRMWARE_UPDATE to SecurityRequirements(
            requiresAuth = true,
            requiresEncryption = true,
            rateLimitMs = 0,
            enabled = false,
            reason = "Firmware updates not supported in v1"
        )
    )

    fun getRequirements(commandClass: CommandSecurity): SecurityRequirements =
        requirements[commandClass] ?: throw IllegalArgumentException("Unknown command class")
}

/**
 * Security requirements for a command class
 */
data class SecurityRequirements(
    val requiresAuth: Boolean,
    val requiresEncryption: Boolean,
    val rateLimitMs: Long,
    val requiresConfirmation: Boolean = false,
    val enabled: Boolean = true,
    val reason: String? = null
)

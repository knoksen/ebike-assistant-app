package app.ebikeassistant.repository

import app.ebikeassistant.payload.ScooterPayload
import app.ebikeassistant.protocol.Frame
import kotlinx.serialization.Serializable

@Serializable
data class ScooterState(
    val isConnected: Boolean = false,
    val isAuthenticated: Boolean = false,
    val lastError: String? = null,
    val payload: ScooterPayload? = null,
    val connectionAttempts: Int = 0
) {
    val canSendCommands: Boolean
        get() = isConnected && isAuthenticated && lastError == null
}

package app.ebikeassistant.ui

import androidx.compose.ui.graphics.Color

/**
 * Vehicle error codes and messages
 */
object ErrorCodes {
    // Sample error code map
    private val ERROR_MESSAGES = mapOf(
        0x0000 to null,  // No error
        0x0001 to "Motor hall sensor error",
        0x0002 to "Motor phase error",
        0x0010 to "Battery undervoltage",
        0x0011 to "Battery overvoltage",
        0x0012 to "Battery over-temperature",
        0x0013 to "Battery communication error",
        0x0020 to "Controller over-temperature",
        0x0021 to "Controller overcurrent",
        // TODO: Add more error codes
    )

    /**
     * Get error message and severity
     */
    fun getError(code: Int): ErrorInfo? {
        if (code == 0) return null
        
        val severity = when (code and 0xF0) {
            0x00 -> ErrorSeverity.CRITICAL  // Motor errors
            0x10 -> ErrorSeverity.WARNING   // Battery warnings
            0x20 -> ErrorSeverity.WARNING   // Controller warnings
            else -> ErrorSeverity.INFO
        }

        return ErrorInfo(
            message = ERROR_MESSAGES[code] ?: "Unknown error (0x${code.toString(16)})",
            severity = severity
        )
    }
}

enum class ErrorSeverity {
    INFO, WARNING, CRITICAL
}

data class ErrorInfo(
    val message: String,
    val severity: ErrorSeverity
) {
    val color: Color
        get() = when (severity) {
            ErrorSeverity.INFO -> Color(0xFF2196F3)     // Blue
            ErrorSeverity.WARNING -> Color(0xFFFFA000)  // Orange
            ErrorSeverity.CRITICAL -> Color(0xFFD32F2F) // Red
        }
}

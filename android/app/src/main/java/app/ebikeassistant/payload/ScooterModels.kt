package app.ebikeassistant.payload

import kotlinx.serialization.*
import kotlinx.serialization.json.*
import kotlinx.serialization.cbor.*
import app.ebikeassistant.telemetry.Telemetry
import java.time.Instant

@Serializable
data class ScooterPayload(
    val timestamp: Long = System.currentTimeMillis(),
    val serialNumber: String? = null,
    val firmware: FirmwareVersions? = null,
    val battery: BatteryState? = null,
    val trip: TripState? = null,
    val sensors: SensorReadings? = null,
    val status: ScooterStatus? = null
) {
    @Serializable
    data class FirmwareVersions(
        val ble: String,
        val controller: String,
        val battery: String? = null
    )

    @Serializable
    data class BatteryState(
        val percentage: Int,
        val voltage: Float,
        val current: Float,
        val temperature: Float,
        val cellVoltages: List<Int> = emptyList(),
        val isCharging: Boolean = false
    )

    @Serializable
    data class TripState(
        val totalDistance: Float,  // km
        val tripDistance: Float,   // km
        val averageSpeed: Float,   // km/h
        val topSpeed: Float        // km/h
    )

    @Serializable
    data class SensorReadings(
        val temperature: Float? = null,  // °C
        val humidity: Float? = null,     // %
        val pressure: Float? = null      // hPa
    )

    @Serializable
    data class ScooterStatus(
        val isLocked: Boolean = false,
        val lights: Boolean = false,
        val errorCode: Int = 0,
        val warningMessage: String? = null
    )
    
    companion object {
        fun fromTelemetry(telemetry: Telemetry) = ScooterPayload(
            firmware = telemetry.firmwareApp?.let { app ->
                FirmwareVersions(
                    ble = telemetry.firmwareBle ?: "unknown",
                    controller = app
                )
            },
            battery = BatteryState(
                percentage = telemetry.socPercent ?: 0,
                voltage = telemetry.packVoltageV ?: 0f,
                current = telemetry.packCurrentA ?: 0f,
                temperature = telemetry.tempC ?: 0f,
                cellVoltages = telemetry.cellsMv.toList()
            ),
            trip = TripState(
                totalDistance = telemetry.totalMileageKm ?: 0f,
                tripDistance = telemetry.currentTripKm ?: 0f,
                averageSpeed = telemetry.avgSpeedKmH ?: 0f,
                topSpeed = 0f  // Not available in telemetry
            ),
            status = ScooterStatus(
                errorCode = telemetry.errorCode,
                warningMessage = telemetry.warning
            )
        )
    }
}

@Serializable
data class ScooterPresets(
    val maxSpeed: Int,              // km/h
    val startMode: StartMode,
    val regenerativeBraking: RegenerativeBraking,
    val cruiseControl: Boolean = true
) {
    @Serializable
    enum class StartMode {
        KICK,       // Requires kick to start
        INSTANT     // Starts from throttle
    }
    
    @Serializable
    enum class RegenerativeBraking {
        OFF,
        LOW,
        MEDIUM,
        HIGH
    }
}

@Serializable
data class ScooterRemoteSetting(
    val name: String,
    val value: Value,
    val readOnly: Boolean = false,
    val description: String? = null
) {
    @Serializable
    sealed class Value {
        @Serializable @SerialName("int") data class IntValue(val value: Int) : Value()
        @Serializable @SerialName("float") data class FloatValue(val value: Float) : Value()
        @Serializable @SerialName("bool") data class BoolValue(val value: Boolean) : Value()
        @Serializable @SerialName("string") data class StringValue(val value: String) : Value()
    }
}

@Serializable
data class SoundSettings(
    val enabled: Boolean = true,
    val volume: Int = 50,            // 0-100
    val startupSound: Boolean = true,
    val turnSignals: Boolean = true,
    val lockSound: Boolean = true,
    val customSounds: List<CustomSound> = emptyList()
) {
    @Serializable
    data class CustomSound(
        val name: String,
        val data: ByteArray,
        val format: Format = Format.WAV
    ) {
        @Serializable
        enum class Format { WAV, MP3 }
        
        override fun equals(other: Any?): Boolean {
            if (this === other) return true
            if (javaClass != other?.javaClass) return false

            other as CustomSound
            if (name != other.name) return false
            if (!data.contentEquals(other.data)) return false
            if (format != other.format) return false

            return true
        }

        override fun hashCode(): Int {
            var result = name.hashCode()
            result = 31 * result + data.contentHashCode()
            result = 31 * result + format.hashCode()
            return result
        }
    }
}

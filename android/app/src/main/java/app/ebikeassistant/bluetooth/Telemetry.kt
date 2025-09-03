package app.ebikeassistant.bluetooth

/**
 * Vehicle telemetry data
 */
data class Telemetry(
    // Device info
    val vehicleModel: String,
    val manufacturerId: Int,
    val firmwareApp: String,
    val firmwareBle: String,
    
    // Trip data
    val totalMileageKm: Float,
    val currentTripKm: Float,
    val avgSpeedKmH: Float,
    
    // Battery data
    val battery: BatteryData,
    
    // Status
    val errorCode: Int,
    val warning: String?
)

/**
 * Battery telemetry data
 */
data class BatteryData(
    val packVoltageV: Float,
    val packCurrentA: Float,
    val socPercent: Int,
    val tempC: Float,
    val cellsMv: IntArray,
    val extBatteryTempC: Float?
) {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false
        other as BatteryData
        return packVoltageV == other.packVoltageV &&
               packCurrentA == other.packCurrentA &&
               socPercent == other.socPercent &&
               tempC == other.tempC &&
               cellsMv.contentEquals(other.cellsMv) &&
               extBatteryTempC == other.extBatteryTempC
    }

    override fun hashCode(): Int {
        var result = packVoltageV.hashCode()
        result = 31 * result + packCurrentA.hashCode()
        result = 31 * result + socPercent
        result = 31 * result + tempC.hashCode()
        result = 31 * result + cellsMv.contentHashCode()
        result = 31 * result + (extBatteryTempC?.hashCode() ?: 0)
        return result
    }
}

/**
 * Telemetry event types
 */
sealed class TelemetryEvent {
    data class TelemetryUpdate(val telemetry: Telemetry) : TelemetryEvent()
    data class BatteryUpdate(val battery: BatteryData) : TelemetryEvent()
    data object Ack : TelemetryEvent()
    data object Nack : TelemetryEvent()
    data class Unknown(val typeId: Int) : TelemetryEvent()
}

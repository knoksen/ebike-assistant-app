package app.ebikeassistant.telemetry

data class Telemetry(
    val vehicleModel: String? = null,
    val manufacturerId: Int? = null,
    val firmwareApp: String? = null,
    val firmwareBle: String? = null,
    val totalMileageKm: Float? = null,
    val currentTripKm: Float? = null,
    val avgSpeedKmH: Float? = null,
    val packVoltageV: Float? = null,
    val packCurrentA: Float? = null,
    val socPercent: Int? = null,
    val tempC: Float? = null,
    val extBatteryTempC: Float? = null,
    val cellsMv: IntArray = IntArray(10),
    val errorCode: Int = 0,
    val warning: String? = null,
) {
    /**
     * Computes cell voltage statistics
     * @return Triple of (min, max, average) cell voltages in mV, or null if no valid cells
     */
    fun getCellStats(): Triple<Int, Int, Float>? {
        if (cellsMv.isEmpty()) return null
        
        var min = Int.MAX_VALUE
        var max = Int.MIN_VALUE
        var sum = 0L
        var count = 0
        
        for (mv in cellsMv) {
            if (mv > 0) {  // Only consider non-zero readings
                min = minOf(min, mv)
                max = maxOf(max, mv)
                sum += mv
                count++
            }
        }
        
        return if (count > 0) {
            Triple(min, max, sum.toFloat() / count)
        } else null
    }

    /**
     * Calculates cell voltage imbalance in mV
     * @return The difference between max and min cell voltages, or null if no valid cells
     */
    fun getCellImbalance(): Int? {
        return getCellStats()?.let { (min, max, _) -> max - min }
    }

    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false

        other as Telemetry

        if (vehicleModel != other.vehicleModel) return false
        if (manufacturerId != other.manufacturerId) return false
        if (firmwareApp != other.firmwareApp) return false
        if (firmwareBle != other.firmwareBle) return false
        if (totalMileageKm != other.totalMileageKm) return false
        if (currentTripKm != other.currentTripKm) return false
        if (avgSpeedKmH != other.avgSpeedKmH) return false
        if (packVoltageV != other.packVoltageV) return false
        if (packCurrentA != other.packCurrentA) return false
        if (socPercent != other.socPercent) return false
        if (tempC != other.tempC) return false
        if (extBatteryTempC != other.extBatteryTempC) return false
        if (!cellsMv.contentEquals(other.cellsMv)) return false
        if (errorCode != other.errorCode) return false
        if (warning != other.warning) return false

        return true
    }

    override fun hashCode(): Int {
        var result = vehicleModel?.hashCode() ?: 0
        result = 31 * result + (manufacturerId ?: 0)
        result = 31 * result + (firmwareApp?.hashCode() ?: 0)
        result = 31 * result + (firmwareBle?.hashCode() ?: 0)
        result = 31 * result + (totalMileageKm?.hashCode() ?: 0)
        result = 31 * result + (currentTripKm?.hashCode() ?: 0)
        result = 31 * result + (avgSpeedKmH?.hashCode() ?: 0)
        result = 31 * result + (packVoltageV?.hashCode() ?: 0)
        result = 31 * result + (packCurrentA?.hashCode() ?: 0)
        result = 31 * result + (socPercent ?: 0)
        result = 31 * result + (tempC?.hashCode() ?: 0)
        result = 31 * result + (extBatteryTempC?.hashCode() ?: 0)
        result = 31 * result + cellsMv.contentHashCode()
        result = 31 * result + errorCode
        result = 31 * result + (warning?.hashCode() ?: 0)
        return result
    }

    override fun toString(): String {
        return """Telemetry(
            |  model=$vehicleModel, 
            |  mfgId=$manufacturerId,
            |  fw=[app=$firmwareApp, ble=$firmwareBle],
            |  trip=$currentTripKm km, total=$totalMileageKm km,
            |  speed=$avgSpeedKmH km/h,
            |  battery=[${packVoltageV}V, ${packCurrentA}A, $socPercent%],
            |  temp=${tempC}°C, extTemp=${extBatteryTempC}°C,
            |  cells=${cellsMv.joinToString("mV, ")}mV,
            |  error=$errorCode${warning?.let { ", warning=$it" } ?: ""}
            |)""".trimMargin()
    }

    companion object {
        const val CELL_COUNT = 10
        const val NO_ERROR = 0
    }
}

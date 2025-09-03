package app.ebikeassistant.telemetry

import kotlin.test.*

class TelemetryTest {
    @Test
    fun `test cell stats with valid data`() {
        val telemetry = Telemetry(
            cellsMv = intArrayOf(3800, 3850, 3900, 3875, 3825, 3850, 3875, 3900, 3825, 3850)
        )
        
        val stats = telemetry.getCellStats()
        assertNotNull(stats)
        
        val (min, max, avg) = stats
        assertEquals(3800, min)
        assertEquals(3900, max)
        assertEquals(3855f, avg)
        assertEquals(100, telemetry.getCellImbalance())
    }

    @Test
    fun `test cell stats with zero values`() {
        val telemetry = Telemetry(
            cellsMv = intArrayOf(3800, 0, 3900, 0, 3825, 0, 3875, 0, 3825, 0)
        )
        
        val stats = telemetry.getCellStats()
        assertNotNull(stats)
        
        val (min, max, avg) = stats
        assertEquals(3800, min)
        assertEquals(3900, max)
        assertEquals(3845f, avg)
    }

    @Test
    fun `test cell stats with all zeros`() {
        val telemetry = Telemetry(
            cellsMv = IntArray(10)
        )
        
        val stats = telemetry.getCellStats()
        assertNull(stats)
        assertNull(telemetry.getCellImbalance())
    }

    @Test
    fun `test equals and hashCode with array content`() {
        val cells1 = intArrayOf(3800, 3850, 3900, 3875, 3825, 3850, 3875, 3900, 3825, 3850)
        val cells2 = intArrayOf(3800, 3850, 3900, 3875, 3825, 3850, 3875, 3900, 3825, 3850)
        val cells3 = intArrayOf(3800, 3850, 3900, 3875, 3825, 3850, 3875, 3900, 3825, 3851)

        val t1 = Telemetry(cellsMv = cells1)
        val t2 = Telemetry(cellsMv = cells2)
        val t3 = Telemetry(cellsMv = cells3)

        assertEquals(t1, t2)
        assertEquals(t1.hashCode(), t2.hashCode())
        assertNotEquals(t1, t3)
        assertNotEquals(t1.hashCode(), t3.hashCode())
    }

    @Test
    fun `test toString contains all non-null fields`() {
        val telemetry = Telemetry(
            vehicleModel = "Test Model",
            manufacturerId = 123,
            firmwareApp = "1.0.0",
            firmwareBle = "2.0.0",
            totalMileageKm = 1000f,
            currentTripKm = 10f,
            avgSpeedKmH = 20f,
            packVoltageV = 36f,
            packCurrentA = 2f,
            socPercent = 80,
            tempC = 25f,
            extBatteryTempC = 30f,
            cellsMv = intArrayOf(3800, 3850, 3900, 3875, 3825, 3850, 3875, 3900, 3825, 3850),
            errorCode = 0,
            warning = null
        )

        val str = telemetry.toString()
        
        // Check that all non-null fields are included
        assertTrue(str.contains("Test Model"))
        assertTrue(str.contains("123"))
        assertTrue(str.contains("1.0.0"))
        assertTrue(str.contains("2.0.0"))
        assertTrue(str.contains("1000"))
        assertTrue(str.contains("36"))
        assertTrue(str.contains("80%"))
        assertTrue(str.contains("25°C"))
        assertTrue(str.contains("3800mV"))
    }
}

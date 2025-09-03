package app.ebikeassistant.permissions

import android.content.Context
import android.os.Build
import io.mockk.every
import io.mockk.mockk
import org.junit.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertTrue

class BlePermissionsHelperTest {
    private val mockContext: Context = mockk()
    private val helper = BlePermissionsHelper(mockContext)

    @Test
    fun `test required permissions by API level`() {
        // Test Android 12+ (API 31+)
        setAndroidVersion(Build.VERSION_CODES.S)
        val permissionsS = helper.getRequiredPermissions()
        assertTrue(permissionsS.contains("android.permission.BLUETOOTH_SCAN"))
        assertTrue(permissionsS.contains("android.permission.BLUETOOTH_CONNECT"))
        assertFalse(permissionsS.contains("android.permission.ACCESS_FINE_LOCATION"))

        // Test Android 11 (API 30)
        setAndroidVersion(Build.VERSION_CODES.R)
        val permissionsR = helper.getRequiredPermissions()
        assertTrue(permissionsR.contains("android.permission.ACCESS_FINE_LOCATION"))
        assertTrue(permissionsR.contains("android.permission.BLUETOOTH"))
        assertTrue(permissionsR.contains("android.permission.BLUETOOTH_ADMIN"))
    }

    @Test
    fun `test location requirement by version`() {
        // Android 12+
        setAndroidVersion(Build.VERSION_CODES.S)
        assertFalse(BlePermissionsHelper.shouldRequestLocationWithScan())
        assertFalse(BlePermissionsHelper.permissionRequiresLocation("android.permission.BLUETOOTH_SCAN"))

        // Android 11 and below
        setAndroidVersion(Build.VERSION_CODES.R)
        assertTrue(BlePermissionsHelper.shouldRequestLocationWithScan())
        assertTrue(BlePermissionsHelper.permissionRequiresLocation("android.permission.BLUETOOTH_SCAN"))
    }

    @Test
    fun `test permission rationale messages`() {
        val scanRationale = helper.getPermissionRationale("android.permission.BLUETOOTH_SCAN")
        assertTrue(scanRationale.contains("scanning"))

        val connectRationale = helper.getPermissionRationale("android.permission.BLUETOOTH_CONNECT")
        assertTrue(connectRationale.contains("connection"))

        val locationRationale = helper.getPermissionRationale("android.permission.ACCESS_FINE_LOCATION")
        assertTrue(locationRationale.contains("location"))
    }

    private fun setAndroidVersion(version: Int) {
        val field = Build.VERSION::class.java.getField("SDK_INT")
        field.isAccessible = true
        field.set(null, version)
    }
}

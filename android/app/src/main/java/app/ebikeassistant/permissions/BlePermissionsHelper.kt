package app.ebikeassistant.permissions

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.os.Build
import androidx.core.content.ContextCompat
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow

/**
 * Helper class for managing BLE-related permissions
 */
class BlePermissionsHelper(private val context: Context) {
    
    /**
     * Required permissions based on Android version
     */
    private val requiredPermissions = when {
        Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
            // Android 12+ requires BLUETOOTH_SCAN and BLUETOOTH_CONNECT
            arrayOf(
                Manifest.permission.BLUETOOTH_SCAN,
                Manifest.permission.BLUETOOTH_CONNECT
            )
        }
        Build.VERSION.SDK_INT >= Build.VERSION_CODES.M -> {
            // Android 6-11 requires FINE_LOCATION for BLE scanning
            arrayOf(
                Manifest.permission.ACCESS_FINE_LOCATION,
                Manifest.permission.BLUETOOTH,
                Manifest.permission.BLUETOOTH_ADMIN
            )
        }
        else -> {
            // Below Android 6, permissions are granted at install time
            emptyArray()
        }
    }

    /**
     * Check if all required permissions are granted
     */
    fun hasRequiredPermissions(): Boolean {
        return requiredPermissions.all { permission ->
            ContextCompat.checkSelfPermission(context, permission) == 
                PackageManager.PERMISSION_GRANTED
        }
    }

    /**
     * Get list of permissions that need to be requested
     */
    fun getRequiredPermissions(): Array<String> {
        return requiredPermissions.filter { permission ->
            ContextCompat.checkSelfPermission(context, permission) != 
                PackageManager.PERMISSION_GRANTED
        }.toTypedArray()
    }

    /**
     * Get rationale messages for permissions
     */
    fun getPermissionRationale(permission: String): String {
        return when (permission) {
            Manifest.permission.BLUETOOTH_SCAN -> 
                "Scanning for nearby e-bikes requires Bluetooth scanning permission"
            Manifest.permission.BLUETOOTH_CONNECT -> 
                "Connecting to your e-bike requires Bluetooth connection permission"
            Manifest.permission.ACCESS_FINE_LOCATION -> 
                "Finding nearby e-bikes requires location permission on this Android version"
            else -> "This permission is required for BLE functionality"
        }
    }

    /**
     * Monitor permission state changes
     */
    fun observePermissions(): Flow<Boolean> = flow {
        while (true) {
            emit(hasRequiredPermissions())
            kotlinx.coroutines.delay(1000)  // Check every second
        }
    }

    companion object {
        /**
         * Check if permissions should be requested with location usage
         */
        fun shouldRequestLocationWithScan(): Boolean {
            return Build.VERSION.SDK_INT < Build.VERSION_CODES.S
        }

        /**
         * Check if a permission requires location access
         */
        fun permissionRequiresLocation(permission: String): Boolean {
            return Build.VERSION.SDK_INT < Build.VERSION_CODES.S && 
                   permission == Manifest.permission.BLUETOOTH_SCAN
        }
    }
}

package app.ebikeassistant.utils

import android.Manifest
import android.app.Activity
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.provider.Settings
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow

/**
 * Helper class to manage BLE-related permissions across different Android versions
 */
class BlePermissionsHelper(private val context: Context) {

    companion object {
        private const val PERMISSION_REQUEST_CODE = 42
        
        private val PERMISSIONS_PRE_ANDROID_12 = arrayOf(
            Manifest.permission.ACCESS_FINE_LOCATION,
            Manifest.permission.ACCESS_COARSE_LOCATION,
            Manifest.permission.BLUETOOTH,
            Manifest.permission.BLUETOOTH_ADMIN
        )

        private val PERMISSIONS_ANDROID_12 = arrayOf(
            Manifest.permission.BLUETOOTH_SCAN,
            Manifest.permission.BLUETOOTH_CONNECT
        )
    }

    private val requiredPermissions = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
        PERMISSIONS_ANDROID_12
    } else {
        PERMISSIONS_PRE_ANDROID_12
    }

    /**
     * Check if all required permissions are granted
     */
    fun hasRequiredPermissions(): Boolean = requiredPermissions.all { permission ->
        ContextCompat.checkSelfPermission(context, permission) == PackageManager.PERMISSION_GRANTED
    }

    /**
     * Request all required permissions
     * @return Flow emitting permission grant results
     */
    fun requestPermissions(activity: Activity): Flow<PermissionResult> = flow {
        // Check if we should show rationale for any permission
        val shouldShowRationale = requiredPermissions.any { permission ->
            ActivityCompat.shouldShowRequestPermissionRationale(activity, permission)
        }

        if (shouldShowRationale) {
            emit(PermissionResult.RationaleRequired)
        }

        // Request permissions
        ActivityCompat.requestPermissions(
            activity,
            requiredPermissions,
            PERMISSION_REQUEST_CODE
        )

        // Check results after request
        if (hasRequiredPermissions()) {
            emit(PermissionResult.Granted)
        } else {
            if (shouldShowRationale) {
                emit(PermissionResult.Denied(true))
            } else {
                emit(PermissionResult.Denied(false))
            }
        }
    }

    /**
     * Handle permission request results
     */
    fun handlePermissionResult(
        requestCode: Int,
        permissions: Array<out String>,
        grantResults: IntArray
    ): PermissionResult {
        if (requestCode == PERMISSION_REQUEST_CODE) {
            if (grantResults.all { it == PackageManager.PERMISSION_GRANTED }) {
                return PermissionResult.Granted
            }
            
            val canAskAgain = permissions.filterIndexed { index, _ -> 
                grantResults[index] == PackageManager.PERMISSION_DENIED 
            }.any { permission ->
                !ActivityCompat.shouldShowRequestPermissionRationale(
                    context as Activity,
                    permission
                )
            }
            
            return PermissionResult.Denied(!canAskAgain)
        }
        return PermissionResult.Denied(false)
    }

    /**
     * Open app settings to allow user to grant permissions manually
     */
    fun openAppSettings(activity: Activity) {
        val intent = Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS).apply {
            data = Uri.fromParts("package", activity.packageName, null)
        }
        activity.startActivity(intent)
    }
}

/**
 * Represents different permission states
 */
sealed class PermissionResult {
    object Granted : PermissionResult()
    object RationaleRequired : PermissionResult()
    data class Denied(val permanentlyDenied: Boolean) : PermissionResult()
}

/**
 * Example usage in Activity/Fragment:
 * 
 * class MainActivity : AppCompatActivity() {
 *     private val permissionsHelper = BlePermissionsHelper(this)
 *     private val scope = MainScope()
 * 
 *     override fun onCreate(savedInstanceState: Bundle?) {
 *         super.onCreate(savedInstanceState)
 * 
 *         if (!permissionsHelper.hasRequiredPermissions()) {
 *             scope.launch {
 *                 permissionsHelper.requestPermissions(this@MainActivity)
 *                     .collect { result ->
 *                         when (result) {
 *                             is PermissionResult.Granted -> {
 *                                 // Start BLE operations
 *                             }
 *                             is PermissionResult.RationaleRequired -> {
 *                                 // Show explanation to user
 *                             }
 *                             is PermissionResult.Denied -> {
 *                                 if (result.permanentlyDenied) {
 *                                     // Guide user to app settings
 *                                     permissionsHelper.openAppSettings(this@MainActivity)
 *                                 } else {
 *                                     // Show message about required permissions
 *                                 }
 *                             }
 *                         }
 *                     }
 *             }
 *         }
 *     }
 * 
 *     override fun onRequestPermissionsResult(
 *         requestCode: Int,
 *         permissions: Array<out String>,
 *         grantResults: IntArray
 *     ) {
 *         super.onRequestPermissionsResult(requestCode, permissions, grantResults)
 *         val result = permissionsHelper.handlePermissionResult(
 *             requestCode,
 *             permissions,
 *             grantResults
 *         )
 *         // Handle result
 *     }
 * }
 */

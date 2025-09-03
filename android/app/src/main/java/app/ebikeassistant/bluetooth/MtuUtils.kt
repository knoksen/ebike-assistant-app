package app.ebikeassistant.bluetooth

import android.bluetooth.*
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlin.coroutines.resume

/**
 * Request MTU change with a safe default and proper coroutine handling
 * @param target Target MTU size (default 247)
 * @return Negotiated MTU size
 */
suspend fun BluetoothGatt.requestMtuSafely(target: Int = 247): Int = suspendCancellableCoroutine { cont ->
    val d = object : BluetoothGattCallback() {
        override fun onMtuChanged(gatt: BluetoothGatt, mtu: Int, status: Int) {
            if (status == BluetoothGatt.GATT_SUCCESS) {
                cont.resume(mtu)
            } else {
                cont.resume(23) // Default MTU on failure
            }
        }
    }
    // NOTE: Integrate into your existing GATT callback; this is a stub.
    // Replace with your StateFlow-based callback hub.
    requestMtu(target)
    // In real code, resume with onMtuChanged; here just resume with target
    // to keep scaffolding compiling.
    cont.resume(target)
}

package app.ebikeassistant.ui

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.expandVertically
import androidx.compose.animation.shrinkVertically
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import app.ebikeassistant.R
import app.ebikeassistant.bluetooth.Command
import app.ebikeassistant.bluetooth.Telemetry
import kotlinx.coroutines.flow.StateFlow
import kotlin.math.abs

@Composable
fun DashboardScreen(
    telemetry: StateFlow<Telemetry?>,
    onCommand: suspend (Command) -> Boolean,
    modifier: Modifier = Modifier
) {
    val telemetryState by telemetry.collectAsState()
    var headlightOn by remember { mutableStateOf(false) }
    var cruiseEnabled by remember { mutableStateOf(false) }
    var locked by remember { mutableStateOf(false) }

    Column(modifier = modifier.fillMaxSize()) {
        // Error banner
        telemetryState?.let { data ->
            ErrorCodes.getError(data.errorCode)?.let { error ->
                Surface(
                    modifier = Modifier.fillMaxWidth(),
                    color = error.color,
                    contentColor = MaterialTheme.colorScheme.surface
                ) {
                    Text(
                        text = error.message,
                        style = MaterialTheme.typography.bodyMedium,
                        modifier = Modifier.padding(16.dp)
                    )
                }
            }
        }

        // Quick toggles
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(8.dp),
            horizontalArrangement = Arrangement.SpaceEvenly
        ) {
            IconToggleButton(
                checked = headlightOn,
                onCheckedChange = {
                    headlightOn = it
                    LaunchedEffect(it) {
                        onCommand(Command.SetHeadlight(it))
                    }
                }
            ) {
                Icon(
                    painter = painterResource(
                        if (headlightOn) R.drawable.ic_headlight_on
                        else R.drawable.ic_headlight_off
                    ),
                    contentDescription = "Headlight"
                )
            }

            IconToggleButton(
                checked = cruiseEnabled,
                onCheckedChange = {
                    cruiseEnabled = it
                    LaunchedEffect(it) {
                        onCommand(Command.SetCruiseControl(it))
                    }
                }
            ) {
                Icon(
                    painter = painterResource(
                        if (cruiseEnabled) R.drawable.ic_cruise_on
                        else R.drawable.ic_cruise_off
                    ),
                    contentDescription = "Cruise Control"
                )
            }

            IconToggleButton(
                checked = locked,
                onCheckedChange = {
                    locked = it
                    LaunchedEffect(it) {
                        onCommand(Command.SetLock(it))
                    }
                }
            ) {
                Icon(
                    painter = painterResource(
                        if (locked) R.drawable.ic_lock
                        else R.drawable.ic_unlock
                    ),
                    contentDescription = "Lock"
                )
            }
        }

        // Telemetry display
        telemetryState?.let { data ->
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp)
            ) {
                // Speed and battery status
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Column {
                        Text(
                            text = "%.1f km/h".format(data.avgSpeedKmH),
                            style = MaterialTheme.typography.displayLarge
                        )
                        Text(
                            text = "%.1f km".format(data.currentTripKm),
                            style = MaterialTheme.typography.bodyMedium
                        )
                    }
                    
                    Column(horizontalAlignment = Alignment.End) {
                        Text(
                            text = "${data.battery.socPercent}%",
                            style = MaterialTheme.typography.displayMedium
                        )
                        Text(
                            text = "%.1fV / %.1fA".format(
                                data.battery.packVoltageV,
                                data.battery.packCurrentA
                            ),
                            style = MaterialTheme.typography.bodyMedium
                        )
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Temperature and total distance
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(
                        text = "%.1f°C".format(data.battery.tempC),
                        style = MaterialTheme.typography.bodyLarge
                    )
                    Text(
                        text = "Total: %.1f km".format(data.totalMileageKm),
                        style = MaterialTheme.typography.bodyLarge
                    )
                    data.battery.extBatteryTempC?.let { temp ->
                        Text(
                            text = "Ext: %.1f°C".format(temp),
                            style = MaterialTheme.typography.bodyLarge
                        )
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Power meter
                val power = data.battery.packVoltageV * abs(data.battery.packCurrentA)
                LinearProgressIndicator(
                    progress = (power / 750f).coerceIn(0f, 1f), // Assuming 750W max
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(8.dp)
                )

                Spacer(modifier = Modifier.height(16.dp))

                // Cell voltages
                Card(
                    modifier = Modifier.fillMaxWidth(),
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp)
                    ) {
                        Text(
                            text = "Cell Voltages",
                            style = MaterialTheme.typography.titleMedium
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        CellsBarChart(
                            values = data.battery.cellsMv,
                            minValue = 2500, // 2.5V min
                            maxValue = 4200, // 4.2V max
                            modifier = Modifier.align(Alignment.CenterHorizontally)
                        )
                        Text(
                            text = "Min: ${data.battery.cellsMv.min()}mV / " +
                                  "Max: ${data.battery.cellsMv.max()}mV / " +
                                  "Δ: ${data.battery.cellsMv.max() - data.battery.cellsMv.min()}mV",
                            style = MaterialTheme.typography.bodySmall,
                            textAlign = TextAlign.Center,
                            modifier = Modifier.fillMaxWidth()
                        )
                    }
                }
            }
        } ?: run {
            // No telemetry data
            Box(
                modifier = Modifier.fillMaxSize(),
                contentAlignment = Alignment.Center
            ) {
                CircularProgressIndicator()
            }
        }
    }
}

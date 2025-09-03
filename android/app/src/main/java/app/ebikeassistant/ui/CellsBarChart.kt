package app.ebikeassistant.ui

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.width
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp

/**
 * Bar chart for displaying cell voltages
 */
@Composable
fun CellsBarChart(
    values: IntArray,
    minValue: Int,
    maxValue: Int,
    modifier: Modifier = Modifier
) {
    Canvas(
        modifier = modifier
            .height(60.dp)
            .width(120.dp)
    ) {
        val barWidth = size.width / values.size
        val range = (maxValue - minValue).toFloat()

        values.forEachIndexed { index, value ->
            val normalizedHeight = ((value - minValue) / range) * size.height
            val color = when {
                value < minValue + range * 0.2f -> Color(0xFFD32F2F) // Red - Low
                value < minValue + range * 0.4f -> Color(0xFFFFA000) // Orange - Warning
                else -> Color(0xFF4CAF50) // Green - Good
            }

            drawRect(
                color = color,
                topLeft = Offset(index * barWidth, size.height - normalizedHeight),
                size = Size(barWidth * 0.8f, normalizedHeight)
            )
        }
    }
}

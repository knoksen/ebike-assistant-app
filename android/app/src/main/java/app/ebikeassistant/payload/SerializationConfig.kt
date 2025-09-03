package app.ebikeassistant.payload

import kotlinx.serialization.json.Json
import kotlinx.serialization.cbor.Cbor
import kotlinx.serialization.modules.SerializersModule

/**
 * Serialization configurations for different formats
 */
object SerializationConfig {
    /**
     * JSON configuration with logical defaults for human readability
     */
    val json = Json {
        encodeDefaults = true          // Include default values
        prettyPrint = true            // Format with indentation
        ignoreUnknownKeys = true      // Skip unknown fields when deserializing
        isLenient = true             // Allow some JSON spec violations
        allowSpecialFloatingPointValues = true  // Allow NaN/Infinity
        
        // Custom names module if needed
        serializersModule = SerializersModule {
            // Register any custom serializers here
        }
    }
    
    /**
     * CBOR configuration for compact binary logging
     */
    val cbor = Cbor {
        ignoreUnknownKeys = true     // Skip unknown fields when deserializing
        
        serializersModule = SerializersModule {
            // Register any custom serializers here
        }
    }
}

/**
 * Extension functions for easy serialization
 */
object PayloadExtensions {
    /**
     * Convert any serializable payload to JSON string
     */
    inline fun <reified T> T.toJson(): String {
        return SerializationConfig.json.encodeToString(T::serializer(), this)
    }
    
    /**
     * Convert any serializable payload to CBOR bytes
     */
    inline fun <reified T> T.toCbor(): ByteArray {
        return SerializationConfig.cbor.encodeToByteArray(T::serializer(), this)
    }
    
    /**
     * Parse JSON string to payload
     */
    inline fun <reified T> String.fromJson(): T {
        return SerializationConfig.json.decodeFromString(T::serializer(), this)
    }
    
    /**
     * Parse CBOR bytes to payload
     */
    inline fun <reified T> ByteArray.fromCbor(): T {
        return SerializationConfig.cbor.decodeFromByteArray(T::serializer(), this)
    }
}

export interface BLEDevice {
  id: string
  name: string
  type: 'scooter' | 'bike' | 'sensor'
  rssi: number | null
}

export interface TuningParameters {
  speedLimit: number          // Max speed in km/h
  acceleration: number        // Acceleration boost (0-100%)
  startAssist: number        // Starting assist power level (0-5)
  regeneration: number       // Regenerative braking strength (0-100%)
  boostMode: boolean         // Power boost mode enabled
  powerLimit: number         // Power limit in watts
  torqueLimit: number        // Torque limit in Nm
  batteryLimit: number       // Battery current limit in amperes
  wheelSize: number          // Wheel size in inches
  gearRatio: number         // Motor gear ratio
}

export interface SensorData {
  timestamp: number
  type: string
  value: number | string | boolean
  unit?: string
  metadata?: Record<string, any>
}

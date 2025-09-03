import { SensorDevice } from '../services/SensorService'

export interface EnhancedRideData {
  id: string
  startTime: Date
  endTime: Date
  totalDistance: number
  route: {
    path: { lat: number; lng: number; timestamp: number; speed: number; elevation?: number }[]
    start: { lat: number; lng: number; address?: string }
    end?: { lat: number; lng: number; address?: string }
  }
  batteryData: {
    startLevel: number
    endLevel: number
    currentLevel: number
    temperature?: number
  }
  sensorData: {
    devices: SensorDevice[]
    heartRate?: Array<{ timestamp: number; heartRate: number }>
    power?: Array<{ timestamp: number; power: number }>
    cadence?: Array<{ timestamp: number; cadence: number }>
  }
  analytics: {
    averageSpeed: number
    maxSpeed: number
    elevationGain: number
    calories: number
    co2Saved: number
    averagePower?: number
    powerZones?: Record<string, number>
    heartRateZones?: Record<string, number>
    cadenceAverage?: number
    maxElevation: number
    minElevation: number
  }
  weatherData?: {
    temperature: number
    humidity: number
    windSpeed: number
    condition: 'sunny' | 'cloudy' | 'rainy' | 'windy' | 'cold' | 'hot'
  }
  insights: {
    efficiency: number
    co2Saved: number
    calories: number
    routeRating: number
    recommendations: string[]
  }
}

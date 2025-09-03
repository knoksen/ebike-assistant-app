export type WeatherType = 'sunny' | 'cloudy' | 'rainy' | 'windy' | 'cold' | 'hot'
export type AssistLevel = 'eco' | 'tour' | 'sport' | 'turbo' | 'off'

export interface Ride {
  id: string
  date: Date
  duration: number // minutes
  distance: number // km or miles
  averageSpeed: number
  maxSpeed: number
  elevation?: number
  batteryStart: number // percentage
  batteryEnd: number // percentage
  batteryUsed: number // percentage
  route?: string
  notes?: string
  weather?: WeatherType
  assistLevel?: AssistLevel
  sensors?: {
    id: string
    name: string
    type: string
    status: string
  }[]
  realTimeMetrics?: {
    currentSpeed: number
    heartRate?: number
    power?: number
    cadence?: number
    batteryTemp?: number
  }
  weatherData?: {
    temperature: number
    humidity: number
    windSpeed: number
    condition: WeatherType
  }
  insights?: {
    efficiency: number
    co2Saved: number
    calories: number
    routeRating: number
    recommendations: string[]
  }
}

export interface RideStats {
  totalRides: number
  totalDistance: number
  totalDuration: number
  averageDistance: number
  averageSpeed: number
  longestRide: number
  fastestRide: number
  totalBatteryUsed: number
  totalCo2Saved: number
  connectedSensors: number
}

export interface ConnectionStatus {
  database: boolean
  sensors: number
  network: boolean
  gps: boolean
}

export interface BaseEntity {
  id: string
  created: number
  lastModified: number
}

export interface Device extends BaseEntity {
  type: 'bluetooth' | 'ant+' | 'wifi' | 'internal' | 'scooter'
  name: string
  manufacturer: string
  model: string
  firmwareVersion?: string
  batteryLevel?: number
  signalStrength?: number
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error'
  capabilities: string[]
  settings: Record<string, unknown>
  calibration: Record<string, number>
  lastData: {
    timestamp: number
    values: Record<string, unknown>
  }
}

export interface Trip extends BaseEntity {
  deviceId: string
  startTime: number
  endTime: number
  distance: number
  duration: number
  averageSpeed: number
  maxSpeed: number
  calories?: number
  route?: {
    type: 'LineString'
    coordinates: [number, number][]
  }
  stats: {
    speed: number[]
    cadence?: number[]
    power?: number[]
    heartRate?: number[]
    battery?: number[]
  }
  metadata: {
    weatherConditions?: string
    temperature?: number
    notes?: string
  }
}

export interface Maintenance extends BaseEntity {
  deviceId: string
  type: 'service' | 'repair' | 'replacement'
  component: string
  date: number
  mileage: number
  description: string
  cost?: number
  provider?: string
  nextServiceDue?: number
}

export interface Settings extends BaseEntity {
  key: string
  value: unknown
}

export interface DbSchema {
  devices: {
    key: string
    value: Device
    indexes: {
      'by-type': string
      'by-name': string
    }
  }
  trips: {
    key: string
    value: Trip
    indexes: {
      'by-device': string
      'by-date': number
    }
  }
  maintenance: {
    key: string
    value: Maintenance
    indexes: {
      'by-device': string
      'by-date': number
      'by-component': string
    }
  }
  settings: {
    key: string
    value: Settings
  }
}

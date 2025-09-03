import type { DBSchema } from 'idb'

// Internal Database Schema
export interface EBikeDB extends DBSchema {
  rides: {
    key: string
    value: {
      id: string
      timestamp: number
      userId?: string
      bikeId: string
      route: {
        startLocation: { lat: number; lng: number; address?: string }
        endLocation: { lat: number; lng: number; address?: string }
        waypoints: Array<{ lat: number; lng: number; timestamp: number; speed: number; elevation?: number }>
      }
      metrics: {
        distance: number
        duration: number
        avgSpeed: number
        maxSpeed: number
        elevation: {
          gain: number
          loss: number
          max: number
          min: number
        }
        battery: {
          startLevel: number
          endLevel: number
          consumption: number
          efficiency: number // km per % of battery
        }
        calories: number
        co2Saved: number // compared to car
      }
      conditions: {
        weather: string
        temperature: number
        humidity: number
        windSpeed: number
        windDirection: number
      }
      sensors: {
        heartRate?: number[]
        cadence?: number[]
        power?: number[]
        gpsAccuracy: number[]
      }
      assistLevel: string
      notes?: string
      photos?: string[] // base64 or URLs
      synchronized: boolean
      lastModified: number
    }
    indexes: {
      timestamp: number
      bikeId: string
      userId: string
      synchronized: boolean
    }
  }
  bikes: {
    key: string
    value: {
      id: string
      userId?: string
      profile: {
        make: string
        model: string
        year: number
        type: 'mountain' | 'road' | 'hybrid' | 'commuter' | 'cargo' | 'folding'
        color: string
        serialNumber?: string
      }
      specifications: {
        motor: {
          type: 'hub' | 'mid-drive'
          power: number // watts
          torque: number // Nm
          brand: string
          model: string
        }
        battery: {
          capacity: number // Wh
          voltage: number // V
          chemistry: 'lithium-ion' | 'lithium-polymer'
          brand: string
          cycles: number
          health: number // percentage
        }
        drivetrain: {
          gears: number
          chainring: string
          cassette: string
          chain: string
        }
        wheels: {
          size: string
          brand: string
          tires: string
          pressure: number
        }
        weight: number // kg
      }
      maintenance: {
        totalDistance: number
        lastService: number
        nextService: number
        serviceHistory: Array<{
          id: string
          date: number
          type: string
          description: string
          cost?: number
          parts?: string[]
          shop?: string
        }>
      }
      sensors: {
        connected: Array<{
          id: string
          type: 'speed' | 'cadence' | 'power' | 'heart-rate' | 'gps' | 'temperature'
          name: string
          batteryLevel?: number
          lastSync: number
          active: boolean
        }>
      }
      created: number
      lastModified: number
    }
    indexes: {
      userId: string
    }
  }
  sensors: {
    key: string
    value: {
      id: string
      type: 'bluetooth' | 'ant+' | 'wifi' | 'internal'
      name: string
      manufacturer: string
      model: string
      firmwareVersion?: string
      batteryLevel?: number
      connectionStatus: 'connected' | 'disconnected' | 'pairing' | 'error'
      capabilities: string[]
      settings: Record<string, any>
      calibration: Record<string, number>
      lastData: {
        timestamp: number
        values: Record<string, number>
      }
      created: number
      lastSync: number
    }
    indexes: {
      type: string
      connectionStatus: string
    }
  }
  settings: {
    key: string
    value: {
      id: string
      category: 'user' | 'app' | 'sync' | 'sensors' | 'privacy'
      data: Record<string, any>
      encrypted: boolean
      synchronized: boolean
      lastModified: number
    }
    indexes: {
      category: string
    }
  }
  sync: {
    key: string
    value: {
      id: string
      table: string
      recordId: string
      action: 'create' | 'update' | 'delete'
      data: any
      timestamp: number
      synchronized: boolean
      retryCount: number
      error?: string
    }
    indexes: {
      table: string
      synchronized: boolean
      timestamp: number
    }
  }
}

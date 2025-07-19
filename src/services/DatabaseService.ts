// Database Service Layer - Supporting multiple storage backends
import { openDB, DBSchema, IDBPDatabase } from 'idb'

// Internal Database Schema
interface EBikeDB extends DBSchema {
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
  }
}

class DatabaseService {
  private db: IDBPDatabase<EBikeDB> | null = null
  private isOnline = navigator.onLine
  private syncQueue: Array<{ table: string; id: string; action: string; data: any }> = []
  private eventListeners: Map<string, Function[]> = new Map()

  // External API configuration
  private readonly API_CONFIG = {
    baseUrl: process.env.REACT_APP_API_URL || 'https://api.ebike-assistant.com',
    syncUrl: process.env.REACT_APP_SYNC_URL || 'https://sync.ebike-assistant.com',
    weatherUrl: 'https://api.openweathermap.org/data/2.5',
    elevationUrl: 'https://api.open-elevation.com/api/v1',
    geocodingUrl: 'https://api.mapbox.com/geocoding/v5',
    stavaUrl: 'https://www.strava.com/api/v3',
    garminUrl: 'https://connectapi.garmin.com',
    apiKeys: {
      weather: process.env.REACT_APP_WEATHER_API_KEY,
      mapbox: process.env.REACT_APP_MAPBOX_API_KEY,
      strava: process.env.REACT_APP_STRAVA_API_KEY,
      garmin: process.env.REACT_APP_GARMIN_API_KEY
    }
  }

  constructor() {
    this.setupConnectionListeners()
    this.initialize()
  }

  // Initialize database
  async initialize(): Promise<void> {
    try {
      this.db = await openDB<EBikeDB>('ebike-assistant', 1, {
        upgrade(db) {
          // Rides store
          if (!db.objectStoreNames.contains('rides')) {
            const ridesStore = db.createObjectStore('rides', { keyPath: 'id' })
            ridesStore.createIndex('timestamp', 'timestamp')
            ridesStore.createIndex('bikeId', 'bikeId')
            ridesStore.createIndex('userId', 'userId')
            ridesStore.createIndex('synchronized', 'synchronized')
          }

          // Bikes store
          if (!db.objectStoreNames.contains('bikes')) {
            const bikesStore = db.createObjectStore('bikes', { keyPath: 'id' })
            bikesStore.createIndex('userId', 'userId')
          }

          // Sensors store
          if (!db.objectStoreNames.contains('sensors')) {
            const sensorsStore = db.createObjectStore('sensors', { keyPath: 'id' })
            sensorsStore.createIndex('type', 'type')
            sensorsStore.createIndex('connectionStatus', 'connectionStatus')
          }

          // Settings store
          if (!db.objectStoreNames.contains('settings')) {
            const settingsStore = db.createObjectStore('settings', { keyPath: 'id' })
            settingsStore.createIndex('category', 'category')
          }

          // Sync queue store
          if (!db.objectStoreNames.contains('sync')) {
            const syncStore = db.createObjectStore('sync', { keyPath: 'id' })
            syncStore.createIndex('table', 'table')
            syncStore.createIndex('synchronized', 'synchronized')
            syncStore.createIndex('timestamp', 'timestamp')
          }
        }
      })

      // Start background processes
      this.startSyncProcess()
      this.emit('database:ready')
    } catch (error) {
      console.error('Failed to initialize database:', error)
      this.emit('database:error', error)
    }
  }

  // Event system
  on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, [])
    }
    this.eventListeners.get(event)!.push(callback)
  }

  off(event: string, callback: Function): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      const index = listeners.indexOf(callback)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }

  private emit(event: string, data?: any): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      listeners.forEach(callback => callback(data))
    }
  }

  // Connection monitoring
  private setupConnectionListeners(): void {
    window.addEventListener('online', () => {
      this.isOnline = true
      this.emit('connection:online')
      this.processSyncQueue()
    })

    window.addEventListener('offline', () => {
      this.isOnline = false
      this.emit('connection:offline')
    })
  }

  // Generic CRUD operations
  async create<T extends keyof EBikeDB>(table: T, data: EBikeDB[T]['value']): Promise<string> {
    if (!this.db) throw new Error('Database not initialized')
    
    const id = data.id || this.generateId()
    const record = { ...data, id, lastModified: Date.now() } as EBikeDB[T]['value']
    
    await this.db.put(table, record)
    
    // Queue for sync if online features are enabled
    this.queueSync(table as string, id, 'create', record)
    this.emit(`${table}:created`, record)
    
    return id
  }

  async read<T extends keyof EBikeDB>(table: T, id: string): Promise<EBikeDB[T]['value'] | undefined> {
    if (!this.db) throw new Error('Database not initialized')
    return await this.db.get(table, id)
  }

  async update<T extends keyof EBikeDB>(table: T, id: string, updates: Partial<EBikeDB[T]['value']>): Promise<void> {
    if (!this.db) throw new Error('Database not initialized')
    
    const existing = await this.db.get(table, id)
    if (!existing) throw new Error(`Record not found: ${id}`)
    
    const updated = { ...existing, ...updates, lastModified: Date.now() }
    await this.db.put(table, updated)
    
    this.queueSync(table as string, id, 'update', updated)
    this.emit(`${table}:updated`, updated)
  }

  async delete<T extends keyof EBikeDB>(table: T, id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized')
    
    await this.db.delete(table, id)
    this.queueSync(table as string, id, 'delete', { id })
    this.emit(`${table}:deleted`, { id })
  }

  async list<T extends keyof EBikeDB>(table: T, options?: {
    index?: string
    query?: IDBKeyRange
    limit?: number
    offset?: number
  }): Promise<EBikeDB[T]['value'][]> {
    if (!this.db) throw new Error('Database not initialized')
    
    const tx = this.db.transaction(table, 'readonly')
    const store = options?.index ? tx.store.index(options.index) : tx.store
    
    let cursor = await store.openCursor(options?.query)
    const results: EBikeDB[T]['value'][] = []
    let count = 0
    const skip = options?.offset || 0
    const limit = options?.limit || Infinity
    
    while (cursor && results.length < limit) {
      if (count >= skip) {
        results.push(cursor.value)
      }
      count++
      cursor = await cursor.continue()
    }
    
    return results
  }

  // Sync operations
  private queueSync(table: string, id: string, action: string, data: any): void {
    const syncRecord = {
      id: this.generateId(),
      table,
      recordId: id,
      action,
      data,
      timestamp: Date.now(),
      synchronized: false,
      retryCount: 0
    }
    
    this.syncQueue.push({ table, id, action, data })
    this.db?.put('sync', syncRecord)
  }

  private async processSyncQueue(): Promise<void> {
    if (!this.isOnline || !this.db) return
    
    const pendingSync = await this.db.getAll('sync', IDBKeyRange.only(false))
    
    for (const syncRecord of pendingSync) {
      try {
        await this.syncToCloud(syncRecord)
        syncRecord.synchronized = true
        await this.db.put('sync', syncRecord)
        this.emit('sync:success', syncRecord)
      } catch (error) {
        syncRecord.retryCount++
        syncRecord.error = (error as Error).message
        await this.db.put('sync', syncRecord)
        this.emit('sync:error', { syncRecord, error })
      }
    }
  }

  private async syncToCloud(syncRecord: any): Promise<void> {
    const { table, recordId, action, data } = syncRecord
    const url = `${this.API_CONFIG.syncUrl}/${table}`
    
    const response = await fetch(`${url}/${action}`, {
      method: action === 'delete' ? 'DELETE' : 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await this.getAuthToken()}`
      },
      body: action === 'delete' ? undefined : JSON.stringify(data)
    })
    
    if (!response.ok) {
      throw new Error(`Sync failed: ${response.statusText}`)
    }
  }

  private async getAuthToken(): Promise<string> {
    // Implementation would depend on your auth system
    return localStorage.getItem('auth_token') || ''
  }

  private startSyncProcess(): void {
    // Sync every 5 minutes
    setInterval(() => {
      if (this.isOnline) {
        this.processSyncQueue()
      }
    }, 5 * 60 * 1000)
  }

  // External API integrations
  async getWeatherData(lat: number, lng: number): Promise<any> {
    if (!this.API_CONFIG.apiKeys.weather) return null
    
    try {
      const response = await fetch(
        `${this.API_CONFIG.weatherUrl}/weather?lat=${lat}&lon=${lng}&appid=${this.API_CONFIG.apiKeys.weather}&units=metric`
      )
      return await response.json()
    } catch (error) {
      console.error('Weather API error:', error)
      return null
    }
  }

  async getElevationData(coordinates: Array<{lat: number, lng: number}>): Promise<any> {
    try {
      const response = await fetch(`${this.API_CONFIG.elevationUrl}/lookup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locations: coordinates.map(c => ({ latitude: c.lat, longitude: c.lng }))
        })
      })
      return await response.json()
    } catch (error) {
      console.error('Elevation API error:', error)
      return null
    }
  }

  async geocodeLocation(lat: number, lng: number): Promise<string | null> {
    if (!this.API_CONFIG.apiKeys.mapbox) return null
    
    try {
      const response = await fetch(
        `${this.API_CONFIG.geocodingUrl}/mapbox.places/${lng},${lat}.json?access_token=${this.API_CONFIG.apiKeys.mapbox}`
      )
      const data = await response.json()
      return data.features[0]?.place_name || null
    } catch (error) {
      console.error('Geocoding error:', error)
      return null
    }
  }

  // Export data
  async exportData(format: 'json' | 'gpx' | 'csv' = 'json'): Promise<string> {
    if (!this.db) throw new Error('Database not initialized')
    
    const rides = await this.list('rides')
    const bikes = await this.list('bikes')
    const settings = await this.list('settings')
    
    const exportData = {
      version: '1.0',
      timestamp: Date.now(),
      data: { rides, bikes, settings }
    }
    
    switch (format) {
      case 'json':
        return JSON.stringify(exportData, null, 2)
      case 'csv':
        return this.convertToCSV(rides)
      case 'gpx':
        return this.convertToGPX(rides)
      default:
        return JSON.stringify(exportData)
    }
  }

  private convertToCSV(rides: any[]): string {
    if (rides.length === 0) return ''
    
    const headers = ['Date', 'Distance (km)', 'Duration (min)', 'Avg Speed (km/h)', 'Battery Used (%)', 'Notes']
    const rows = rides.map(ride => [
      new Date(ride.timestamp).toLocaleDateString(),
      ride.metrics.distance.toFixed(2),
      Math.round(ride.metrics.duration / 60),
      ride.metrics.avgSpeed.toFixed(1),
      ride.metrics.battery.consumption,
      ride.notes || ''
    ])
    
    return [headers, ...rows].map(row => row.join(',')).join('\n')
  }

  private convertToGPX(rides: any[]): string {
    const gpxHeader = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="E-Bike Assistant">
  <metadata>
    <name>E-Bike Rides Export</name>
    <time>${new Date().toISOString()}</time>
  </metadata>`
    
    const gpxTracks = rides.map(ride => {
      const trackPoints = ride.route.waypoints.map((point: any) => 
        `    <trkpt lat="${point.lat}" lon="${point.lng}">
      <time>${new Date(point.timestamp).toISOString()}</time>
      ${point.elevation ? `<ele>${point.elevation}</ele>` : ''}
    </trkpt>`
      ).join('\n')
      
      return `  <trk>
    <name>Ride ${new Date(ride.timestamp).toLocaleDateString()}</name>
    <trkseg>
${trackPoints}
    </trkseg>
  </trk>`
    }).join('\n')
    
    return `${gpxHeader}\n${gpxTracks}\n</gpx>`
  }

  // Import data
  async importData(jsonData: string): Promise<void> {
    try {
      const data = JSON.parse(jsonData)
      
      if (data.data?.rides) {
        for (const ride of data.data.rides) {
          await this.create('rides', ride)
        }
      }
      
      if (data.data?.bikes) {
        for (const bike of data.data.bikes) {
          await this.create('bikes', bike)
        }
      }
      
      if (data.data?.settings) {
        for (const setting of data.data.settings) {
          await this.create('settings', setting)
        }
      }
      
      this.emit('data:imported', data)
    } catch (error) {
      throw new Error('Invalid data format')
    }
  }

  // Utility methods
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  // Get database statistics
  async getStats(): Promise<{
    rides: number
    bikes: number
    sensors: number
    totalDistance: number
    totalTime: number
    syncPending: number
    dbSize: number
  }> {
    if (!this.db) throw new Error('Database not initialized')
    
    const rides = await this.list('rides')
    const bikes = await this.list('bikes')
    const sensors = await this.list('sensors')
    const pendingSync = await this.db.getAll('sync', IDBKeyRange.only(false))
    
    const totalDistance = rides.reduce((sum, ride) => sum + ride.metrics.distance, 0)
    const totalTime = rides.reduce((sum, ride) => sum + ride.metrics.duration, 0)
    
    // Estimate database size (rough calculation)
    const dbSize = JSON.stringify({ rides, bikes, sensors }).length
    
    return {
      rides: rides.length,
      bikes: bikes.length,
      sensors: sensors.length,
      totalDistance,
      totalTime,
      syncPending: pendingSync.length,
      dbSize
    }
  }

  // Close database connection
  async close(): Promise<void> {
    if (this.db) {
      this.db.close()
      this.db = null
    }
  }
}

// Create singleton instance
export const databaseService = new DatabaseService()
export type { EBikeDB }

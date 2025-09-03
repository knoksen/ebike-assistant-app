import { openDB } from 'idb'
import type { IDBPDatabase } from 'idb'
import type { Device, Trip, Maintenance, Settings, DbSchema } from '../types/db'

const DB_VERSION = 1
const DB_NAME = 'ebike-assistant'

type TableNames = keyof DbSchema
type TableValue<T extends TableNames> = DbSchema[T]['value']

class DatabaseService {
  private db: IDBPDatabase<DbSchema> | null = null
  private eventListeners: Map<string, Array<(data: unknown) => void>> = new Map()

  constructor() {
    this.initialize()
  }

  async initialize(): Promise<void> {
    if (this.db) return

    try {
      this.db = await openDB<DbSchema>(DB_NAME, DB_VERSION, {
        upgrade(db) {
          // Devices store
          if (!db.objectStoreNames.contains('devices')) {
            const deviceStore = db.createObjectStore('devices', { keyPath: 'id' })
            deviceStore.createIndex('by-type', 'type')
            deviceStore.createIndex('by-name', 'name')
          }

          // Trips store
          if (!db.objectStoreNames.contains('trips')) {
            const tripStore = db.createObjectStore('trips', { keyPath: 'id' })
            tripStore.createIndex('by-device', 'deviceId')
            tripStore.createIndex('by-date', 'startTime')
          }

          // Maintenance store
          if (!db.objectStoreNames.contains('maintenance')) {
            const maintenanceStore = db.createObjectStore('maintenance', { keyPath: 'id' })
            maintenanceStore.createIndex('by-device', 'deviceId')
            maintenanceStore.createIndex('by-date', 'date')
            maintenanceStore.createIndex('by-component', 'component')
          }

          // Settings store
          if (!db.objectStoreNames.contains('settings')) {
            db.createObjectStore('settings', { keyPath: 'key' })
          }
        }
      })

      this.emit('database:ready', null)
    } catch (error) {
      console.error('Failed to initialize database:', error)
      this.emit('database:error', error)
    }
  }

  // Event system
  on(event: string, callback: (data: unknown) => void): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, [])
    }
    this.eventListeners.get(event)!.push(callback)
  }

  off(event: string, callback: (data: unknown) => void): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      const index = listeners.indexOf(callback)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }

  private emit(event: string, data: unknown): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      listeners.forEach(callback => callback(data))
    }
  }

  // Generic CRUD operations
  private async ensureDb(): Promise<IDBPDatabase<DbSchema>> {
    if (!this.db) {
      await this.initialize()
    }
    if (!this.db) throw new Error('Database initialization failed')
    return this.db
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  async create<T extends TableNames>(
    store: T,
    data: Omit<TableValue<T>, 'id' | 'created' | 'lastModified'>
  ): Promise<string> {
    const db = await this.ensureDb()
    const timestamp = Date.now()
    const id = this.generateId()
    
    const record = {
      ...data,
      id,
      created: timestamp,
      lastModified: timestamp
    } as TableValue<T>

    await db.add(store, record)
    this.emit(`${String(store)}:created`, record)
    return id
  }

  async get<T extends TableNames>(
    store: T,
    id: string
  ): Promise<TableValue<T> | undefined> {
    const db = await this.ensureDb()
    return await db.get(store, id)
  }

  async update<T extends TableNames>(
    store: T,
    id: string,
    updates: Partial<Omit<TableValue<T>, 'id' | 'created' | 'lastModified'>>
  ): Promise<void> {
    const db = await this.ensureDb()
    const existing = await db.get(store, id)
    if (!existing) throw new Error(`Record not found: ${id}`)

    const updated = {
      ...existing,
      ...updates,
      lastModified: Date.now()
    } as TableValue<T>

    await db.put(store, updated)
    this.emit(`${String(store)}:updated`, updated)
  }

  async delete<T extends TableNames>(store: T, id: string): Promise<void> {
    const db = await this.ensureDb()
    await db.delete(store, id)
    this.emit(`${String(store)}:deleted`, { id })
  }

  async list<T extends TableNames>(
    store: T,
    options?: {
      index?: string
      query?: IDBKeyRange
      limit?: number
      offset?: number
    }
  ): Promise<TableValue<T>[]> {
    const db = await this.ensureDb()

    if (options?.index) {
      const cursor = await db.transaction(store).store.index(String(options.index)).openCursor()
      const results: TableValue<T>[] = []
      
      if (cursor) {
        let count = 0
        const offset = options.offset || 0
        const limit = options.limit || Infinity

        while (cursor && count < limit + offset) {
          if (count >= offset) {
            results.push(cursor.value as TableValue<T>)
          }
          count++
          await cursor.continue()
        }
      }

      return results
    }

    return await db.getAll(store)
  }

  // Specialized queries
  async getDevicesByType(type: Device['type']): Promise<Device[]> {
    const db = await this.ensureDb()
    return await db.getAllFromIndex('devices', 'by-type', type)
  }

  async getTripsByDevice(deviceId: string): Promise<Trip[]> {
    const db = await this.ensureDb()
    return await db.getAllFromIndex('trips', 'by-device', deviceId)
  }

  async getTripsByDateRange(start: number, end: number): Promise<Trip[]> {
    const db = await this.ensureDb()
    const range = IDBKeyRange.bound(start, end)
    return await db.getAllFromIndex('trips', 'by-date', range)
  }

  async getMaintenanceByDevice(deviceId: string): Promise<Maintenance[]> {
    const db = await this.ensureDb()
    return await db.getAllFromIndex('maintenance', 'by-device', deviceId)
  }

  async getMaintenanceByComponent(component: string): Promise<Maintenance[]> {
    const db = await this.ensureDb()
    return await db.getAllFromIndex('maintenance', 'by-component', component)
  }

  async getDueMaintenance(threshold = 500): Promise<Maintenance[]> {
    const now = Date.now()
    const db = await this.ensureDb()
    const maintenance = await db.getAll('maintenance')
    return maintenance.filter(m => m.nextServiceDue && m.nextServiceDue - now <= threshold)
  }

  // Settings management
  async getSetting<T>(key: string): Promise<T | undefined> {
    const setting = await this.get('settings', key)
    return setting?.value as T
  }

  async setSetting<T>(key: string, value: T): Promise<void> {
    await this.update('settings', key, { key, value })
  }

  // Data export
  async exportData(): Promise<{
    version: string
    timestamp: number
    devices: Device[]
    trips: Trip[]
    maintenance: Maintenance[]
    settings: Settings[]
  }> {
    const db = await this.ensureDb()
    
    return {
      version: `${DB_VERSION}.0`,
      timestamp: Date.now(),
      devices: await db.getAll('devices'),
      trips: await db.getAll('trips'),
      maintenance: await db.getAll('maintenance'),
      settings: await db.getAll('settings')
    }
  }

  // Database verification and repair
  async verifyIntegrity(): Promise<{
    status: 'ok' | 'error'
    issues: string[]
    repairs: string[]
  }> {
    const db = await this.ensureDb()
    const issues: string[] = []
    const repairs: string[] = []

    try {
      // Check devices
      const devices = await db.getAll('devices')
      for (const device of devices) {
        if (!device.type || !device.name) {
          issues.push(`Device ${device.id} missing required fields`)
          await this.update('devices', device.id, {
            name: device.name || 'Unknown Device',
            type: device.type || 'bluetooth',
            manufacturer: device.manufacturer || '',
            model: device.model || '',
            capabilities: device.capabilities || [],
            connectionStatus: device.connectionStatus || 'disconnected',
            settings: device.settings || {},
            calibration: device.calibration || {},
            lastData: device.lastData || { timestamp: 0, values: {} }
          })
          repairs.push(`Fixed missing fields for device ${device.id}`)
        }
      }

      // Check trips reference integrity
      const trips = await db.getAll('trips')
      for (const trip of trips) {
        const device = await db.get('devices', trip.deviceId)
        if (!device) {
          issues.push(`Trip ${trip.id} references non-existent device ${trip.deviceId}`)
        }
        if (trip.endTime < trip.startTime) {
          issues.push(`Trip ${trip.id} has invalid time range`)
          await this.update('trips', trip.id, {
            endTime: trip.startTime + 1
          })
          repairs.push(`Fixed trip ${trip.id} time range`)
        }
      }

      // Check maintenance reference integrity
      const maintenance = await db.getAll('maintenance')
      for (const record of maintenance) {
        const device = await db.get('devices', record.deviceId)
        if (!device) {
          issues.push(`Maintenance ${record.id} references non-existent device ${record.deviceId}`)
        }
      }

      return {
        status: issues.length === 0 ? 'ok' : 'error',
        issues,
        repairs
      }
    } catch (error) {
      console.error('Database verification failed:', error)
      return {
        status: 'error',
        issues: [`Verification failed: ${error}`],
        repairs: []
      }
    }
  }

  // Cleanup old data
  async cleanup(options: {
    tripRetentionDays?: number
    maintenanceRetentionDays?: number
  } = {}): Promise<void> {
    const db = await this.ensureDb()
    const now = Date.now()
    
    const tripCutoff = now - (options.tripRetentionDays || 90) * 24 * 60 * 60 * 1000
    const maintenanceCutoff = now - (options.maintenanceRetentionDays || 365) * 24 * 60 * 60 * 1000

    // Clean up old trips
    const trips = await db.getAllFromIndex('trips', 'by-date')
    for (const trip of trips) {
      if (trip.startTime < tripCutoff) {
        await db.delete('trips', trip.id)
      }
    }

    // Clean up old maintenance records
    const maintenance = await db.getAllFromIndex('maintenance', 'by-date')
    for (const record of maintenance) {
      if (record.date < maintenanceCutoff && !record.nextServiceDue) {
        await db.delete('maintenance', record.id)
      }
    }
  }

  // Close database
  async close(): Promise<void> {
    if (this.db) {
      this.db.close()
      this.db = null
    }
  }
}

// Create singleton instance
export const databaseService = new DatabaseService()
export type { Device, Trip, Maintenance, Settings }

await databaseService.create('devices', {
  name: 'My Scooter',
  type: 'scooter',
  manufacturer: 'Miscooter',
  model: '0211',
  capabilities: ['speed', 'battery', 'odometer', 'tuning'],
  connectionStatus: 'disconnected',
  settings: {
    speedLimit: 25,
    boostMode: false
  },
  calibration: {},
  lastData: {
    timestamp: Date.now(),
    values: {}
  }
})

const tripId = await databaseService.create('trips', {
  deviceId: 'your-device-id',
  startTime: Date.now(),
  endTime: 0,
  distance: 0,
  duration: 0,
  averageSpeed: 0,
  maxSpeed: 0,
  stats: {
    speed: [],
    battery: []
  },
  metadata: {}
})

await databaseService.create('maintenance', {
  deviceId: 'your-device-id',
  type: 'service',
  component: 'battery',
  date: Date.now(),
  mileage: 1000,
  description: 'Battery calibration',
  nextServiceDue: Date.now() + 30 * 24 * 60 * 60 * 1000 // 30 days
})

const health = await databaseService.verifyIntegrity()
if (health.status === 'error') {
  console.error('Database issues:', health.issues)
  console.log('Repairs made:', health.repairs)
}

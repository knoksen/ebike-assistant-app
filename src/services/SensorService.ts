// Sensor Integration Service - Bluetooth, ANT+, WiFi sensor support
import { databaseService } from './DatabaseService'

// Sensor data types
export interface SensorData {
  timestamp: number
  sensorId: string
  type: 'speed' | 'cadence' | 'power' | 'heart-rate' | 'battery' | 'temperature' | 'gps' | 'accelerometer' | 'gyroscope'
  value: number
  unit: string
  accuracy?: number
  metadata?: Record<string, unknown>
}

export interface SensorDevice {
  id: string
  name: string
  type: 'bluetooth' | 'ant+' | 'wifi' | 'internal'
  manufacturer?: string
  model?: string
  capabilities: string[]
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error'
  batteryLevel?: number
  signalStrength?: number
  lastData?: SensorData
  settings: Record<string, unknown>
}

// Geolocation and motion sensors
export interface LocationData {
  latitude: number
  longitude: number
  altitude?: number
  accuracy: number
  speed?: number
  heading?: number
  timestamp: number
}

interface MotionData {
  acceleration: { x: number; y: number; z: number }
  rotation: { alpha: number; beta: number; gamma: number }
  timestamp: number
}

class SensorService {
  private sensors: Map<string, SensorDevice> = new Map()
  private dataStreams: Map<string, SensorData[]> = new Map()
  private eventListeners: Map<string, Array<(data: unknown) => void>> = new Map()
  private isRecording = false
  private recordingStartTime = 0
  private watchId: number | null = null
  private bluetoothSupported = false
  private webSerialSupported = false

  // Bluetooth characteristics UUIDs for common e-bike sensors
  private readonly BLUETOOTH_SERVICES = {
    CYCLING_SPEED_CADENCE: '00001816-0000-1000-8000-00805f9b34fb',
    CYCLING_POWER: '00001818-0000-1000-8000-00805f9b34fb',
    HEART_RATE: '0000180d-0000-1000-8000-00805f9b34fb',
    BATTERY_SERVICE: '0000180f-0000-1000-8000-00805f9b34fb',
    DEVICE_INFORMATION: '0000180a-0000-1000-8000-00805f9b34fb'
  }

  private readonly BLUETOOTH_CHARACTERISTICS = {
    CSC_MEASUREMENT: '00002a5b-0000-1000-8000-00805f9b34fb',
    CYCLING_POWER_MEASUREMENT: '00002a63-0000-1000-8000-00805f9b34fb',
    HEART_RATE_MEASUREMENT: '00002a37-0000-1000-8000-00805f9b34fb',
    BATTERY_LEVEL: '00002a19-0000-1000-8000-00805f9b34fb'
  }

  constructor() {
    this.checkCapabilities()
    this.initializeInternalSensors()
  }

  // Check browser capabilities
  private checkCapabilities(): void {
    this.bluetoothSupported = 'bluetooth' in navigator
    this.webSerialSupported = 'serial' in navigator
    
    console.log('Sensor capabilities:', {
      bluetooth: this.bluetoothSupported,
      webSerial: this.webSerialSupported,
      geolocation: 'geolocation' in navigator,
      deviceMotion: 'DeviceMotionEvent' in window,
      deviceOrientation: 'DeviceOrientationEvent' in window
    })
  }

  // Initialize built-in sensors
  private async initializeInternalSensors(): Promise<void> {
    // GPS sensor
    if ('geolocation' in navigator) {
      const gpsDevice: SensorDevice = {
        id: 'internal-gps',
        name: 'Built-in GPS',
        type: 'internal',
        capabilities: ['location', 'speed', 'altitude'],
        connectionStatus: 'disconnected',
        settings: { highAccuracy: true, timeout: 10000, maximumAge: 1000 }
      }
      this.sensors.set('internal-gps', gpsDevice)
    }

    // Motion sensors
    if ('DeviceMotionEvent' in window) {
      const motionDevice: SensorDevice = {
        id: 'internal-motion',
        name: 'Built-in Motion Sensors',
        type: 'internal',
        capabilities: ['accelerometer', 'gyroscope'],
        connectionStatus: 'disconnected',
        settings: { frequency: 50 } // 50Hz
      }
      this.sensors.set('internal-motion', motionDevice)
    }

    // Web Serial API for connecting to bike computers
    if (this.webSerialSupported) {
      const serialDevice: SensorDevice = {
        id: 'serial-bike-computer',
        name: 'Serial Bike Computer',
        type: 'wifi',
        capabilities: ['speed', 'cadence', 'power', 'battery'],
        connectionStatus: 'disconnected',
        settings: { baudRate: 9600, dataBits: 8, stopBits: 1, parity: 'none' }
      }
      this.sensors.set('serial-bike-computer', serialDevice)
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

  // Bluetooth sensor discovery and connection
  async scanBluetoothSensors(): Promise<SensorDevice[]> {
    if (!this.bluetoothSupported) {
      throw new Error('Bluetooth not supported in this browser')
    }

    try {
      const device = await navigator.bluetooth.requestDevice({
        filters: [
          { services: [this.BLUETOOTH_SERVICES.CYCLING_SPEED_CADENCE] },
          { services: [this.BLUETOOTH_SERVICES.CYCLING_POWER] },
          { services: [this.BLUETOOTH_SERVICES.HEART_RATE] }
        ],
        optionalServices: [this.BLUETOOTH_SERVICES.BATTERY_SERVICE, this.BLUETOOTH_SERVICES.DEVICE_INFORMATION]
      })

      const sensorDevice: SensorDevice = {
        id: device.id,
        name: device.name || 'Unknown Bluetooth Device',
        type: 'bluetooth',
        capabilities: this.detectCapabilities(device),
        connectionStatus: 'disconnected',
        settings: {}
      }

      this.sensors.set(device.id, sensorDevice)
      await this.connectBluetoothSensor(device.id)
      
      return [sensorDevice]
    } catch (error) {
      console.error('Bluetooth scan error:', error)
      throw error
    }
  }

  private detectCapabilities(device: BluetoothDevice): string[] {
    const capabilities: string[] = []
    
    // This would be expanded based on actual services available
    if (device.name?.toLowerCase().includes('speed')) capabilities.push('speed')
    if (device.name?.toLowerCase().includes('cadence')) capabilities.push('cadence')
    if (device.name?.toLowerCase().includes('power')) capabilities.push('power')
    if (device.name?.toLowerCase().includes('heart')) capabilities.push('heart-rate')
    
    return capabilities
  }

  async connectBluetoothSensor(sensorId: string): Promise<void> {
    const sensor = this.sensors.get(sensorId)
    if (!sensor || sensor.type !== 'bluetooth') {
      throw new Error('Bluetooth sensor not found')
    }

    try {
      sensor.connectionStatus = 'connecting'
      this.emit('sensor:connecting', sensor)

      const device = await navigator.bluetooth.getDevices().then(devices => 
        devices.find(d => d.id === sensorId)
      )
      
      if (!device) throw new Error('Device not found')

      const server = await device.gatt?.connect()
      if (!server) throw new Error('Failed to connect to GATT server')

      // Connect to relevant services
      await this.subscribeToBluetoothServices(server, sensor)
      
      sensor.connectionStatus = 'connected'
      this.emit('sensor:connected', sensor)
      
      // Save to database
      await databaseService.create('sensors', {
        id: sensor.id,
        type: sensor.type,
        name: sensor.name,
        manufacturer: sensor.manufacturer || '',
        model: sensor.model || '',
        connectionStatus: sensor.connectionStatus,
        capabilities: sensor.capabilities,
        settings: sensor.settings,
        calibration: {},
        lastData: { timestamp: Date.now(), values: {} },
        created: Date.now(),
        lastSync: Date.now()
      })
      
    } catch (error) {
      sensor.connectionStatus = 'error'
      this.emit('sensor:error', { sensor, error })
      throw error
    }
  }

  private async subscribeToBluetoothServices(server: BluetoothRemoteGATTServer, sensor: SensorDevice): Promise<void> {
    try {
      // Cycling Speed and Cadence
      const cscService = await server.getPrimaryService(this.BLUETOOTH_SERVICES.CYCLING_SPEED_CADENCE).catch(() => null)
      if (cscService) {
        const cscCharacteristic = await cscService.getCharacteristic(this.BLUETOOTH_CHARACTERISTICS.CSC_MEASUREMENT)
        await cscCharacteristic.startNotifications()
        cscCharacteristic.addEventListener('characteristicvaluechanged', (event) => {
          this.handleCSCData(sensor.id, (event.target as BluetoothRemoteGATTCharacteristic).value!)
        })
      }

      // Heart Rate
      const hrService = await server.getPrimaryService(this.BLUETOOTH_SERVICES.HEART_RATE).catch(() => null)
      if (hrService) {
        const hrCharacteristic = await hrService.getCharacteristic(this.BLUETOOTH_CHARACTERISTICS.HEART_RATE_MEASUREMENT)
        await hrCharacteristic.startNotifications()
        hrCharacteristic.addEventListener('characteristicvaluechanged', (event) => {
          this.handleHeartRateData(sensor.id, (event.target as BluetoothRemoteGATTCharacteristic).value!)
        })
      }

      // Power
      const powerService = await server.getPrimaryService(this.BLUETOOTH_SERVICES.CYCLING_POWER).catch(() => null)
      if (powerService) {
        const powerCharacteristic = await powerService.getCharacteristic(this.BLUETOOTH_CHARACTERISTICS.CYCLING_POWER_MEASUREMENT)
        await powerCharacteristic.startNotifications()
        powerCharacteristic.addEventListener('characteristicvaluechanged', (event) => {
          this.handlePowerData(sensor.id, (event.target as BluetoothRemoteGATTCharacteristic).value!)
        })
      }

      // Battery Level
      const batteryService = await server.getPrimaryService(this.BLUETOOTH_SERVICES.BATTERY_SERVICE).catch(() => null)
      if (batteryService) {
        const batteryCharacteristic = await batteryService.getCharacteristic(this.BLUETOOTH_CHARACTERISTICS.BATTERY_LEVEL)
        const batteryLevel = await batteryCharacteristic.readValue()
        sensor.batteryLevel = batteryLevel.getUint8(0)
      }

    } catch (error) {
      console.error('Error subscribing to Bluetooth services:', error)
    }
  }

  // Data handlers for different sensor types
  private handleCSCData(sensorId: string, data: DataView): void {
    // Parse Cycling Speed and Cadence data according to Bluetooth spec
    const flags = data.getUint8(0)
    let offset = 1
    
    if (flags & 0x01) { // Wheel revolution data present
      const wheelRevolutions = data.getUint32(offset, true)
      const wheelEventTime = data.getUint16(offset + 4, true)
      offset += 6
      
      const speed = this.calculateSpeed(wheelRevolutions, wheelEventTime)
      this.addSensorData(sensorId, 'speed', speed, 'km/h')
    }
    
    if (flags & 0x02) { // Crank revolution data present
      const crankRevolutions = data.getUint16(offset, true)
      const crankEventTime = data.getUint16(offset + 2, true)
      
      const cadence = this.calculateCadence(crankRevolutions, crankEventTime)
      this.addSensorData(sensorId, 'cadence', cadence, 'rpm')
    }
  }

  private handleHeartRateData(sensorId: string, data: DataView): void {
    const flags = data.getUint8(0)
    const heartRate = flags & 0x01 ? data.getUint16(1, true) : data.getUint8(1)
    this.addSensorData(sensorId, 'heart-rate', heartRate, 'bpm')
  }

  private handlePowerData(sensorId: string, data: DataView): void {
    const power = data.getInt16(2, true)
    this.addSensorData(sensorId, 'power', power, 'watts')
  }

  // GPS and location services
  async startGPSTracking(): Promise<void> {
    if (!('geolocation' in navigator)) {
      throw new Error('Geolocation not supported')
    }

    const gpsDevice = this.sensors.get('internal-gps')
    if (!gpsDevice) throw new Error('GPS device not found')

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 1000
    }

    gpsDevice.connectionStatus = 'connecting'
    
    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        gpsDevice.connectionStatus = 'connected'
        this.handleLocationData(position)
      },
      (error) => {
        gpsDevice.connectionStatus = 'error'
        this.emit('sensor:error', { sensor: gpsDevice, error })
      },
      options
    )
  }

  private handleLocationData(position: GeolocationPosition): void {
    const locationData: LocationData = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      altitude: position.coords.altitude || undefined,
      accuracy: position.coords.accuracy,
      speed: position.coords.speed || undefined,
      heading: position.coords.heading || undefined,
      timestamp: position.timestamp
    }

    this.addSensorData('internal-gps', 'gps', 0, 'location', undefined, { location: locationData })
    this.emit('location:updated', locationData)
  }

  async stopGPSTracking(): Promise<void> {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId)
      this.watchId = null
    }
    
    const gpsDevice = this.sensors.get('internal-gps')
    if (gpsDevice) {
      gpsDevice.connectionStatus = 'disconnected'
    }
  }

  // Motion sensors for detecting bike movement, crashes, etc.
  async startMotionTracking(): Promise<void> {
    const motionDevice = this.sensors.get('internal-motion')
    if (!motionDevice) throw new Error('Motion sensors not available')

    if ('DeviceMotionEvent' in window) {
      window.addEventListener('devicemotion', this.handleMotionData.bind(this))
      motionDevice.connectionStatus = 'connected'
      this.emit('sensor:connected', motionDevice)
    }

    if ('DeviceOrientationEvent' in window) {
      window.addEventListener('deviceorientation', this.handleOrientationData.bind(this))
    }
  }

  private handleMotionData(event: DeviceMotionEvent): void {
    if (!event.acceleration || !event.rotationRate) return

    const motionData: MotionData = {
      acceleration: {
        x: event.acceleration.x || 0,
        y: event.acceleration.y || 0,
        z: event.acceleration.z || 0
      },
      rotation: {
        alpha: event.rotationRate.alpha || 0,
        beta: event.rotationRate.beta || 0,
        gamma: event.rotationRate.gamma || 0
      },
      timestamp: Date.now()
    }

    // Detect potential crashes or hard braking
    const totalAcceleration = Math.sqrt(
      motionData.acceleration.x ** 2 + 
      motionData.acceleration.y ** 2 + 
      motionData.acceleration.z ** 2
    )

    if (totalAcceleration > 20) { // Configurable threshold
      this.emit('motion:crash-detected', motionData)
    }

    this.addSensorData('internal-motion', 'accelerometer', totalAcceleration, 'm/s²', undefined, { motion: motionData })
  }

  private handleOrientationData(event: DeviceOrientationEvent): void {
    const heading = event.alpha || 0
    this.addSensorData('internal-motion', 'gyroscope', heading, 'degrees')
  }

  // Web Serial API for bike computer connections
  async connectSerialDevice(): Promise<void> {
    if (!this.webSerialSupported) {
      throw new Error('Web Serial API not supported')
    }

    try {
      const port = await (navigator as any).serial.requestPort()
      await port.open({ baudRate: 9600 })

      const textDecoder = new TextDecoderStream()
      const readableStreamClosed = port.readable.pipeTo(textDecoder.writable)
      const reader = textDecoder.readable.getReader()

      const serialDevice = this.sensors.get('serial-bike-computer')
      if (serialDevice) {
        serialDevice.connectionStatus = 'connected'
        this.emit('sensor:connected', serialDevice)
      }

      // Read data from serial port
      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        
        this.parseSerialData(value)
      }

    } catch (error) {
      console.error('Serial connection error:', error)
      throw error
    }
  }

  private parseSerialData(data: string): void {
    // Parse bike computer data (format depends on specific device)
    // Example format: "SPEED:25.5,CADENCE:85,POWER:250,BATTERY:75"
    try {
      const parts = data.split(',')
      parts.forEach(part => {
        const [key, value] = part.split(':')
        const numValue = parseFloat(value)
        
        switch (key.toLowerCase()) {
          case 'speed':
            this.addSensorData('serial-bike-computer', 'speed', numValue, 'km/h')
            break
          case 'cadence':
            this.addSensorData('serial-bike-computer', 'cadence', numValue, 'rpm')
            break
          case 'power':
            this.addSensorData('serial-bike-computer', 'power', numValue, 'watts')
            break
          case 'battery':
            const serialDevice = this.sensors.get('serial-bike-computer')
            if (serialDevice) {
              serialDevice.batteryLevel = numValue
            }
            break
        }
      })
    } catch (error) {
      console.error('Error parsing serial data:', error)
    }
  }

  // Data management
  private addSensorData(sensorId: string, type: SensorData['type'], value: number, unit: string, accuracy?: number, metadata?: Record<string, unknown>): void {
    const sensorData: SensorData = {
      timestamp: Date.now(),
      sensorId,
      type,
      value,
      unit,
      accuracy,
      metadata
    }

    if (!this.dataStreams.has(sensorId)) {
      this.dataStreams.set(sensorId, [])
    }
    
    const stream = this.dataStreams.get(sensorId)!
    stream.push(sensorData)
    
    // Keep only last 1000 data points per sensor to manage memory
    if (stream.length > 1000) {
      stream.shift()
    }

    // Update sensor's last data
    const sensor = this.sensors.get(sensorId)
    if (sensor) {
      sensor.lastData = sensorData
    }

    this.emit('sensor:data', sensorData)

    // If recording, save to database
    if (this.isRecording) {
      this.saveSensorDataToDatabase(sensorData)
    }
  }

  private async saveSensorDataToDatabase(sensorData: SensorData): Promise<void> {
    // This would typically be batch-saved to improve performance
    // For now, we'll emit the data for the ride tracker to handle
    this.emit('recording:data', sensorData)
  }

  // Recording control
  startRecording(): void {
    this.isRecording = true
    this.recordingStartTime = Date.now()
    this.emit('recording:started')
  }

  stopRecording(): Array<{ sensorId: string; data: SensorData[] }> {
    this.isRecording = false
    const recordingData = Array.from(this.dataStreams.entries()).map(([sensorId, data]) => ({
      sensorId,
      data: data.filter(d => d.timestamp >= this.recordingStartTime)
    }))
    
    this.emit('recording:stopped', recordingData)
    return recordingData
  }

  // Utility methods
  private calculateSpeed(wheelRevolutions: number, wheelEventTime: number): number {
    // Implementation depends on wheel circumference and previous values
    // This is a simplified version
    return wheelRevolutions * 0.1 // Placeholder calculation
  }

  private calculateCadence(crankRevolutions: number, crankEventTime: number): number {
    // Implementation depends on previous values to calculate RPM
    // This is a simplified version
    return crankRevolutions * 2 // Placeholder calculation
  }

  // Get connected sensors
  getConnectedSensors(): SensorDevice[] {
    return Array.from(this.sensors.values()).filter(s => s.connectionStatus === 'connected')
  }

  // Get sensor data
  getSensorData(sensorId: string, since?: number): SensorData[] {
    const data = this.dataStreams.get(sensorId) || []
    return since ? data.filter(d => d.timestamp >= since) : data
  }

  // Disconnect sensor
  async disconnectSensor(sensorId: string): Promise<void> {
    const sensor = this.sensors.get(sensorId)
    if (!sensor) return

    sensor.connectionStatus = 'disconnected'
    
    if (sensor.type === 'internal' && sensorId === 'internal-gps') {
      await this.stopGPSTracking()
    }

    this.emit('sensor:disconnected', sensor)
  }

  // Calibrate sensor
  async calibrateSensor(sensorId: string, calibrationData: Record<string, number>): Promise<void> {
    const sensor = this.sensors.get(sensorId)
    if (!sensor) throw new Error('Sensor not found')

    // Update sensor calibration in database
    await databaseService.update('sensors', sensorId, {
      calibration: calibrationData,
      lastModified: Date.now()
    })

    this.emit('sensor:calibrated', { sensor, calibrationData })
  }

  // Get sensor status
  getSensorStatus(): Record<string, { connected: number; total: number }> {
    const status: Record<string, { connected: number; total: number }> = {}
    
    for (const sensor of this.sensors.values()) {
      const type = sensor.type
      if (!status[type]) {
        status[type] = { connected: 0, total: 0 }
      }
      status[type].total++
      if (sensor.connectionStatus === 'connected') {
        status[type].connected++
      }
    }
    
    return status
  }
}

export const sensorService = new SensorService()
export type { SensorDevice, SensorData, MotionData }
export type { LocationData as SensorLocationData }

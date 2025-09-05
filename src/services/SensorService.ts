// Sensor Integration Service - Bluetooth, ANT+, WiFi sensor support
import { databaseService } from './DatabaseService'
import { log } from './logger'
import { hasBluetooth, hasSerial } from '../types/navigator-extensions'

// Narrow structural helper types for internal maps (use platform types where possible)
interface GATTServerLike { getPrimaryService(uuid: string): Promise<GATTServiceLike> }
interface GATTServiceLike { getCharacteristic(uuid: string): Promise<GATTCharacteristicLike> }
interface GATTCharacteristicLike { startNotifications?: () => Promise<void>; addEventListener?: (ev: string, cb: (e: Event) => void) => void; readValue?: () => Promise<DataView>; writeValue?: (data: Uint8Array) => Promise<void> }

// Sensor data types
export interface SensorData {
  timestamp: number
  sensorId: string
  type: 'speed' | 'cadence' | 'power' | 'heart-rate' | 'battery' | 'temperature' | 'gps' | 'accelerometer' | 'gyroscope' | 'odometer'
  value: number
  unit: string
  accuracy?: number
  metadata?: Record<string, unknown>
}

export interface SensorDevice {
  id: string
  name: string
  type: 'bluetooth' | 'ant+' | 'wifi' | 'internal' | 'scooter'
  manufacturer?: string
  model?: string
  capabilities: string[]
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error'
  batteryLevel?: number
  signalStrength?: number
  lastData?: SensorData
  settings: Record<string, unknown>
}

// Interface for scooter command responses
export interface ScooterCommandResponse {
  sensorId: string
  subCommand: number
  success: boolean
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
  private characteristics: Map<string, GATTCharacteristicLike> = new Map()
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
    DEVICE_INFORMATION: '0000180a-0000-1000-8000-00805f9b34fb',
    // Miscooter0211 specific
    MISCOOTER_SERVICE: '6e400001-b5a3-f393-e0a9-e50e24dcca9e',
    XIAOMI_SERVICE: 'fe95'
  }

  private readonly BLUETOOTH_CHARACTERISTICS = {
    CSC_MEASUREMENT: '00002a5b-0000-1000-8000-00805f9b34fb',
    CYCLING_POWER_MEASUREMENT: '00002a63-0000-1000-8000-00805f9b34fb',
    HEART_RATE_MEASUREMENT: '00002a37-0000-1000-8000-00805f9b34fb',
    BATTERY_LEVEL: '00002a19-0000-1000-8000-00805f9b34fb',
    // Miscooter0211 specific
    MISCOOTER_RX: '6e400002-b5a3-f393-e0a9-e50e24dcca9e',  // Write
    MISCOOTER_TX: '6e400003-b5a3-f393-e0a9-e50e24dcca9e',  // Notify
    XIAOMI_WRITE: 'fe95'
  }

  // Miscooter0211 specific commands
  private readonly SCOOTER_COMMANDS = {
    READ_SPEED: [0x55, 0xAA, 0x04, 0x22, 0x01, 0x26],
    READ_BATTERY: [0x55, 0xAA, 0x04, 0x22, 0x02, 0x27],
    READ_ODOMETER: [0x55, 0xAA, 0x04, 0x22, 0x03, 0x28],
    SET_SPEED_LIMIT: (speed: number) => {
      const checksum = (0x55 + 0xAA + 0x04 + 0x20 + 0x01 + speed) & 0xFF
      return [0x55, 0xAA, 0x04, 0x20, 0x01, speed, checksum]
    },
    SET_BOOST_MODE: (enabled: boolean) => {
      const value = enabled ? 0x01 : 0x00
      const checksum = (0x55 + 0xAA + 0x04 + 0x20 + 0x02 + value) & 0xFF
      return [0x55, 0xAA, 0x04, 0x20, 0x02, value, checksum]
    }
  }

  constructor() {
    this.checkCapabilities()
    this.initializeInternalSensors()
  }

  // Check browser capabilities
  private checkCapabilities(): void {
  this.bluetoothSupported = hasBluetooth(navigator)
  this.webSerialSupported = hasSerial(navigator)
    
  log.info('Sensor capabilities:', {
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
  if (!hasBluetooth(navigator)) throw new Error('Bluetooth not available')
  const device = await navigator.bluetooth.requestDevice({
        filters: [
          // Miscooter0211 and Xiaomi scooters
          { services: [this.BLUETOOTH_SERVICES.MISCOOTER_SERVICE] },
          { services: [this.BLUETOOTH_SERVICES.XIAOMI_SERVICE] },
          // Standard bike sensors
          { services: [this.BLUETOOTH_SERVICES.CYCLING_SPEED_CADENCE] },
          { services: [this.BLUETOOTH_SERVICES.CYCLING_POWER] },
          { services: [this.BLUETOOTH_SERVICES.HEART_RATE] },
          // Include devices by name for broader compatibility
          { namePrefix: 'MiScooter' }
        ],
        optionalServices: [
          this.BLUETOOTH_SERVICES.BATTERY_SERVICE,
          this.BLUETOOTH_SERVICES.DEVICE_INFORMATION
        ]
      })

      const sensorDevice: SensorDevice = {
        id: device.id,
        name: device.name || 'Unknown Bluetooth Device',
        type: 'bluetooth',
        capabilities: this.detectCapabilities(device),
        connectionStatus: 'disconnected',
        settings: {
          // Default settings for Miscooter0211
          speedLimit: 25, // km/h
          powerMode: 'normal',
          cruiseControl: true,
          regenerativeBraking: true,
          ledMode: 'auto'
        }
      }

      // Add specific capabilities for Miscooter
      if (device.name?.includes('MiScooter')) {
        sensorDevice.type = 'scooter'
        sensorDevice.capabilities.push(
          'speed',
          'battery',
          'odometer',
          'tuning',
          'boost-mode'
        )
      }

      this.sensors.set(device.id, sensorDevice)
      await this.connectBluetoothSensor(device.id)
      
      return [sensorDevice]
    } catch (error) {
  log.warn('Bluetooth scan error:', error)
      throw error
    }
  }

  // Minimal capability detection, keep loose typing for flexibility
  private detectCapabilities(device: Pick<BluetoothDevice, 'name'>): string[] {
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

  if (!hasBluetooth(navigator)) throw new Error('Bluetooth not available')
  const deviceList = await navigator.bluetooth.getDevices()
  const device = deviceList.find(d => d.id === sensorId)
      
      if (!device) throw new Error('Device not found')

      const server = await device.gatt?.connect()
      if (!server) throw new Error('Failed to connect to GATT server')

      // Connect to relevant services
      await this.subscribeToBluetoothServices(server, sensor)
      
      sensor.connectionStatus = 'connected'
      this.emit('sensor:connected', sensor)
      
      // Save to database
      await databaseService.create('sensors', {
        type: sensor.type,
        name: sensor.name,
        manufacturer: sensor.manufacturer || '',
        model: sensor.model || '',
        firmwareVersion: '',
        batteryLevel: sensor.batteryLevel,
        connectionStatus: sensor.connectionStatus,
        capabilities: sensor.capabilities,
        settings: sensor.settings,
        calibration: {},
        lastData: { timestamp: Date.now(), values: {} },
        lastSync: Date.now()
      })
      
    } catch (error) {
      sensor.connectionStatus = 'error'
      this.emit('sensor:error', { sensor, error })
      throw error
    }
  }

  private async subscribeToBluetoothServices(server: GATTServerLike, sensor: SensorDevice): Promise<void> {
    try {
      // Miscooter service
      const miscooterService = await server.getPrimaryService(this.BLUETOOTH_SERVICES.MISCOOTER_SERVICE).catch(() => null)
      if (miscooterService) {
        // Get RX (write) and TX (notify) characteristics
        const rxChar = await miscooterService.getCharacteristic(this.BLUETOOTH_CHARACTERISTICS.MISCOOTER_RX)
        const txChar = await miscooterService.getCharacteristic(this.BLUETOOTH_CHARACTERISTICS.MISCOOTER_TX)

        // Start notifications for receiving data
        if (txChar.startNotifications) await txChar.startNotifications()
        txChar.addEventListener?.('characteristicvaluechanged', (event: Event) => {
          const target = event.target as unknown as { value?: DataView }
          const dv = target?.value
          if (!dv) return
          const data = new Uint8Array(dv.buffer)
          this.handleMiscooterData(sensor.id, data)
        })

        // Store RX characteristic for writing commands
        this.characteristics.set(`${sensor.id}_rx`, rxChar)

        // Initial data read
        await this.sendMiscooterCommand(sensor.id, this.SCOOTER_COMMANDS.READ_BATTERY)
        await new Promise(resolve => setTimeout(resolve, 100))
        await this.sendMiscooterCommand(sensor.id, this.SCOOTER_COMMANDS.READ_SPEED)
        await new Promise(resolve => setTimeout(resolve, 100))
        await this.sendMiscooterCommand(sensor.id, this.SCOOTER_COMMANDS.READ_ODOMETER)

        return // Skip other services for Miscooter
      }

      // Standard bike sensors if not a Miscooter
      // Cycling Speed and Cadence
      const cscService = await server.getPrimaryService(this.BLUETOOTH_SERVICES.CYCLING_SPEED_CADENCE).catch(() => null)
      if (cscService) {
        const cscChar = await cscService.getCharacteristic(this.BLUETOOTH_CHARACTERISTICS.CSC_MEASUREMENT)
        if (cscChar.startNotifications) await cscChar.startNotifications()
        cscChar.addEventListener?.('characteristicvaluechanged', (event: Event) => {
          const target = event.target as unknown as { value?: DataView }
          if (target.value) this.handleCSCData(sensor.id, target.value)
        })
      }

      // Heart Rate
      const hrService = await server.getPrimaryService(this.BLUETOOTH_SERVICES.HEART_RATE).catch(() => null)
      if (hrService) {
        const hrChar = await hrService.getCharacteristic(this.BLUETOOTH_CHARACTERISTICS.HEART_RATE_MEASUREMENT)
        if (hrChar.startNotifications) await hrChar.startNotifications()
        hrChar.addEventListener?.('characteristicvaluechanged', (event: Event) => {
          const target = event.target as unknown as { value?: DataView }
          if (target.value) this.handleHeartRateData(sensor.id, target.value)
        })
      }

      // Power
      const powerService = await server.getPrimaryService(this.BLUETOOTH_SERVICES.CYCLING_POWER).catch(() => null)
      if (powerService) {
        const powerChar = await powerService.getCharacteristic(this.BLUETOOTH_CHARACTERISTICS.CYCLING_POWER_MEASUREMENT)
        if (powerChar.startNotifications) await powerChar.startNotifications()
        powerChar.addEventListener?.('characteristicvaluechanged', (event: Event) => {
          const target = event.target as unknown as { value?: DataView }
          if (target.value) this.handlePowerData(sensor.id, target.value)
        })
      }

      // Battery Level
      const batteryService = await server.getPrimaryService(this.BLUETOOTH_SERVICES.BATTERY_SERVICE).catch(() => null)
      if (batteryService) {
        const batteryChar = await batteryService.getCharacteristic(this.BLUETOOTH_CHARACTERISTICS.BATTERY_LEVEL)
        if (batteryChar.readValue) {
          const batteryLevel = await batteryChar.readValue()
          sensor.batteryLevel = batteryLevel.getUint8(0)
        }
      }

    } catch (error) {
  log.warn('Error subscribing to Bluetooth services:', error)
      throw error
    }
  }

  private async sendMiscooterCommand(sensorId: string, command: number[]): Promise<void> {
    const rxChar = this.characteristics.get(`${sensorId}_rx`)
    if (!rxChar) throw new Error('Device not ready for commands')

  if (rxChar.writeValue) await rxChar.writeValue(new Uint8Array(command))
  }

  private handleMiscooterData(sensorId: string, data: Uint8Array): void {
    // Check header
    if (data[0] !== 0x55 || data[1] !== 0xAA) {
  log.debug('Invalid Miscooter data header')
      return
    }

    const command = data[3]
    const subCommand = data[4]

    switch (command) {
      case 0x22: { // Read responses
        switch (subCommand) {
          case 0x01: { // Speed
            const speed = data[5]
            this.addSensorData(sensorId, 'speed', speed, 'km/h')
            break
          }
          case 0x02: { // Battery
            const battery = data[5]
            this.addSensorData(sensorId, 'battery', battery, '%')
            break
          }
          case 0x03: { // Odometer
            const odometer = (data[5] << 16) | (data[6] << 8) | data[7]
            this.addSensorData(sensorId, 'odometer', odometer / 1000, 'km')
            break
          }
        }
        break
      }
      case 0x20: { // Write responses
        this.emit('scooter:command:response', {
          sensorId,
          subCommand,
          success: data[5] === 0
        })
        break
      }
    }
  }

  // Miscooter specific methods
  async setScooterSpeedLimit(sensorId: string, speed: number): Promise<void> {
    if (speed < 1 || speed > 35) {
      throw new Error('Speed limit must be between 1 and 35 km/h')
    }
    await this.sendMiscooterCommand(sensorId, this.SCOOTER_COMMANDS.SET_SPEED_LIMIT(speed))
  }

  async setScooterBoostMode(sensorId: string, enabled: boolean): Promise<void> {
    await this.sendMiscooterCommand(sensorId, this.SCOOTER_COMMANDS.SET_BOOST_MODE(enabled))
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
  if (!hasSerial(navigator)) throw new Error('Web Serial API not available')
  const port = await navigator.serial.requestPort()
      await port.open({ baudRate: 9600 })

      const textDecoder = new TextDecoderStream()
      await port.readable.pipeTo(textDecoder.writable)
      const reader = textDecoder.readable.getReader()

      const serialDevice = this.sensors.get('serial-bike-computer')
      if (serialDevice) {
        serialDevice.connectionStatus = 'connected'
        this.emit('sensor:connected', serialDevice)
      }

      // Read data from serial port
  for (;;) { // intentional continuous read loop until reader reports done
        const { value, done } = await reader.read()
        if (done) break
        
        this.parseSerialData(value)
      }

    } catch (error) {
  log.error('Serial connection error:', error)
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
          case 'speed': {
            this.addSensorData('serial-bike-computer', 'speed', numValue, 'km/h')
            break
          }
          case 'cadence': {
            this.addSensorData('serial-bike-computer', 'cadence', numValue, 'rpm')
            break
          }
          case 'power': {
            this.addSensorData('serial-bike-computer', 'power', numValue, 'watts')
            break
          }
          case 'battery': {
            const serialDevice = this.sensors.get('serial-bike-computer')
            if (serialDevice) {
              serialDevice.batteryLevel = numValue
            }
            break
          }
        }
      })
    } catch (error) {
  log.warn('Error parsing serial data:', error)
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
    this.emit('recording:started', null)
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
  private calculateSpeed(wheelRevolutions: number, _wheelEventTime: number): number {
    // Implementation depends on wheel circumference and previous values
    // This is a simplified version
    return wheelRevolutions * 0.1 // Placeholder calculation
  }

  private calculateCadence(crankRevolutions: number, _crankEventTime: number): number {
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
      lastSync: Date.now()
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
export type { MotionData }

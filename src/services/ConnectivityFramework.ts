// Connectivity Framework - Central hub for all connections and data flow
import { databaseService, type EBikeDB } from './DatabaseService'
import { sensorService, type SensorData, type LocationData } from './SensorService'
import { networkService, type WeatherData, type RouteData } from './NetworkService'

// Enhanced ride data with all sensor inputs and external data
export interface EnhancedRideData {
  id: string
  startTime: number
  endTime?: number
  status: 'active' | 'paused' | 'completed'
  
  // Basic metrics
  distance: number
  duration: number
  averageSpeed: number
  maxSpeed: number
  
  // Location and route
  route: {
    start: { lat: number; lng: number; address?: string }
    end?: { lat: number; lng: number; address?: string }
    path: Array<{ lat: number; lng: number; timestamp: number; speed: number; elevation?: number }>
  }
  
  // Sensor data streams
  sensorData: {
    gps: LocationData[]
    heartRate: SensorData[]
    power: SensorData[]
    cadence: SensorData[]
    speed: SensorData[]
    motion: SensorData[]
  }
  
  // Environmental data
  environment: {
    weather: WeatherData[]
    temperature: number[]
    elevation: Array<{ distance: number; elevation: number }>
  }
  
  // E-bike specific data
  battery: {
    startLevel: number
    endLevel?: number
    consumption: number
    efficiency: number
    temperature: number[]
    voltage: number[]
  }
  
  // Performance analytics
  analytics: {
    calories: number
    co2Saved: number
    averagePower?: number
    powerZones?: Record<string, number>
    heartRateZones?: Record<string, number>
    cadenceAverage?: number
    maxElevation: number
    minElevation: number
  }
  
  // AI insights
  insights: {
    routeRating: number
    difficultyActual: 'easy' | 'moderate' | 'hard'
    recommendations: string[]
    anomalies: Array<{
      type: 'speed' | 'power' | 'heart-rate' | 'battery'
      timestamp: number
      description: string
      severity: 'low' | 'medium' | 'high'
    }>
  }
}

class ConnectivityFramework {
  private activeRide: EnhancedRideData | null = null
  private dataCollectionInterval: number | null = null
  private analysisWorker: Worker | null = null
  private isInitialized = false

  // Real-time data streams
  private locationStream: LocationData[] = []
  private sensorStreams: Map<string, SensorData[]> = new Map()
  private environmentalData: { weather: WeatherData[]; temperature: number[] } = {
    weather: [],
    temperature: []
  }

  constructor() {
    this.initialize()
  }

  private async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      // Initialize all services
      await databaseService.initialize()
      
      // Set up event listeners
      this.setupEventListeners()
      
      // Initialize web worker for data analysis
      this.initializeAnalysisWorker()
      
      // Request permissions
      await this.requestPermissions()
      
      this.isInitialized = true
      console.log('Connectivity Framework initialized successfully')
    } catch (error) {
      console.error('Failed to initialize Connectivity Framework:', error)
    }
  }

  private setupEventListeners(): void {
    // Sensor data events
    sensorService.on('sensor:data', (data: unknown) => {
      if (this.isValidSensorData(data)) {
        this.handleSensorData(data)
      }
    })

    sensorService.on('location:updated', (location: unknown) => {
      if (this.isValidLocationData(location)) {
        this.handleLocationUpdate(location)
      }
    })

    // Network events
    window.addEventListener('weather-updated', (event: Event) => {
      const weatherData = (event as CustomEvent).detail as WeatherData
      this.handleWeatherUpdate(weatherData)
    })

    // Emergency detection
    sensorService.on('motion:crash-detected', (motionData: unknown) => {
      this.handleEmergencyDetection(motionData)
    })

    // Database events
    databaseService.on('database:ready', () => {
      console.log('Database ready for connectivity framework')
    })
  }

  private initializeAnalysisWorker(): void {
    if (typeof Worker !== 'undefined') {
      // In a real implementation, this would be a separate worker file
      const workerCode = `
        self.onmessage = function(e) {
          const { type, data } = e.data;
          
          switch (type) {
            case 'analyze-performance':
              const analysis = analyzePerformance(data);
              self.postMessage({ type: 'performance-analysis', result: analysis });
              break;
            case 'detect-anomalies':
              const anomalies = detectAnomalies(data);
              self.postMessage({ type: 'anomalies-detected', result: anomalies });
              break;
          }
        };

        function analyzePerformance(rideData) {
          // Simplified performance analysis
          const avgSpeed = rideData.distance / (rideData.duration / 3600);
          const calories = rideData.distance * 30; // Rough estimate
          const co2Saved = rideData.distance * 0.21; // kg CO2 saved vs car
          
          return {
            averageSpeed: avgSpeed,
            calories,
            co2Saved,
            efficiency: rideData.battery.consumption / rideData.distance
          };
        }

        function detectAnomalies(sensorData) {
          const anomalies = [];
          
          // Check for speed anomalies
          const speeds = sensorData.speed || [];
          const avgSpeed = speeds.reduce((sum, s) => sum + s.value, 0) / speeds.length;
          
          speeds.forEach(speed => {
            if (speed.value > avgSpeed * 2) {
              anomalies.push({
                type: 'speed',
                timestamp: speed.timestamp,
                description: 'Unusually high speed detected',
                severity: 'medium'
              });
            }
          });
          
          return anomalies;
        }
      `

      const blob = new Blob([workerCode], { type: 'application/javascript' })
      this.analysisWorker = new Worker(URL.createObjectURL(blob))
      
      this.analysisWorker.onmessage = (e) => {
        this.handleWorkerMessage(e.data)
      }
    }
  }

  private async requestPermissions(): Promise<void> {
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission()
    }

    // Request location permission (will be handled by sensorService)
    // Request device motion permission on iOS
    if (typeof (DeviceMotionEvent as any)?.requestPermission === 'function') {
      try {
        await (DeviceMotionEvent as any).requestPermission()
      } catch (error) {
        console.log('Motion permission denied:', error)
      }
    }
  }

  // Type guards
  private isValidSensorData(data: unknown): data is SensorData {
    return typeof data === 'object' && data !== null &&
           'timestamp' in data && 'sensorId' in data && 'type' in data && 'value' in data
  }

  private isValidLocationData(data: unknown): data is LocationData {
    return typeof data === 'object' && data !== null &&
           'latitude' in data && 'longitude' in data && 'timestamp' in data
  }

  // Start a new ride with full connectivity
  async startRide(bikeId?: string): Promise<string> {
    if (this.activeRide) {
      throw new Error('A ride is already in progress')
    }

    try {
      // Get current location
      await sensorService.startGPSTracking()
      await sensorService.startMotionTracking()

      // Get initial weather data
      const location = await this.getCurrentLocation()
      const weather = await networkService.getWeatherData(location.latitude, location.longitude)
      
      // Create ride record
      this.activeRide = {
        id: this.generateRideId(),
        startTime: Date.now(),
        status: 'active',
        distance: 0,
        duration: 0,
        averageSpeed: 0,
        maxSpeed: 0,
        route: {
          start: { 
            lat: location.latitude, 
            lng: location.longitude,
            address: await this.getAddressFromCoordinates(location.latitude, location.longitude)
          },
          path: []
        },
        sensorData: {
          gps: [],
          heartRate: [],
          power: [],
          cadence: [],
          speed: [],
          motion: []
        },
        environment: {
          weather: [weather],
          temperature: [weather.temperature],
          elevation: []
        },
        battery: {
          startLevel: await this.getBatteryLevel(bikeId),
          consumption: 0,
          efficiency: 0,
          temperature: [],
          voltage: []
        },
        analytics: {
          calories: 0,
          co2Saved: 0,
          maxElevation: 0,
          minElevation: 999999
        },
        insights: {
          routeRating: 0,
          difficultyActual: 'easy',
          recommendations: [],
          anomalies: []
        }
      }

      // Start data collection
      this.startDataCollection()
      
      // Save to database
      await this.saveRideToDatabase()

      console.log('Ride started with full connectivity:', this.activeRide.id)
      return this.activeRide.id

    } catch (error) {
      console.error('Failed to start ride:', error)
      throw error
    }
  }

  // Stop the current ride
  async stopRide(): Promise<EnhancedRideData> {
    if (!this.activeRide) {
      throw new Error('No active ride to stop')
    }

    try {
      // Stop data collection
      this.stopDataCollection()
      
      // Stop sensors
      await sensorService.stopGPSTracking()
      
      // Final calculations
      this.activeRide.endTime = Date.now()
      this.activeRide.duration = this.activeRide.endTime - this.activeRide.startTime
      this.activeRide.status = 'completed'
      
      // Get final location
      const location = await this.getCurrentLocation()
      this.activeRide.route.end = {
        lat: location.latitude,
        lng: location.longitude,
        address: await this.getAddressFromCoordinates(location.latitude, location.longitude)
      }
      
      // Get final battery level
      this.activeRide.battery.endLevel = await this.getBatteryLevel()
      this.activeRide.battery.consumption = this.activeRide.battery.startLevel - (this.activeRide.battery.endLevel || 0)
      this.activeRide.battery.efficiency = this.activeRide.distance / Math.max(1, this.activeRide.battery.consumption)

      // Run final analysis
      await this.analyzeRide()
      
      // Save final data
      await this.saveRideToDatabase()
      
      const completedRide = { ...this.activeRide }
      this.activeRide = null
      
      // Try to sync with cloud
      try {
        await networkService.getConnectionStatus()
      } catch (error) {
        console.log('Cloud sync will happen when connection is available')
      }

      return completedRide

    } catch (error) {
      console.error('Failed to stop ride:', error)
      throw error
    }
  }

  // Pause/resume ride
  pauseRide(): void {
    if (this.activeRide && this.activeRide.status === 'active') {
      this.activeRide.status = 'paused'
      this.stopDataCollection()
    }
  }

  resumeRide(): void {
    if (this.activeRide && this.activeRide.status === 'paused') {
      this.activeRide.status = 'active'
      this.startDataCollection()
    }
  }

  // Data collection
  private startDataCollection(): void {
    if (this.dataCollectionInterval) return

    this.dataCollectionInterval = window.setInterval(async () => {
      if (!this.activeRide || this.activeRide.status !== 'active') return

      try {
        // Update ride metrics
        await this.updateRideMetrics()
        
        // Periodic weather updates
        if (Date.now() % (5 * 60 * 1000) < 1000) { // Every 5 minutes
          await this.updateWeatherData()
        }
        
        // Run anomaly detection
        if (this.analysisWorker) {
          this.analysisWorker.postMessage({
            type: 'detect-anomalies',
            data: this.activeRide.sensorData
          })
        }

      } catch (error) {
        console.error('Data collection error:', error)
      }
    }, 1000) // Collect data every second
  }

  private stopDataCollection(): void {
    if (this.dataCollectionInterval) {
      clearInterval(this.dataCollectionInterval)
      this.dataCollectionInterval = null
    }
  }

  // Event handlers
  private handleSensorData(data: SensorData): void {
    if (!this.activeRide || this.activeRide.status !== 'active') return

    // Add to appropriate stream
    switch (data.type) {
      case 'speed':
        this.activeRide.sensorData.speed.push(data)
        this.activeRide.maxSpeed = Math.max(this.activeRide.maxSpeed, data.value)
        break
      case 'heart-rate':
        this.activeRide.sensorData.heartRate.push(data)
        break
      case 'power':
        this.activeRide.sensorData.power.push(data)
        break
      case 'cadence':
        this.activeRide.sensorData.cadence.push(data)
        break
      case 'accelerometer':
        this.activeRide.sensorData.motion.push(data)
        break
    }
  }

  private handleLocationUpdate(location: LocationData): void {
    if (!this.activeRide || this.activeRide.status !== 'active') return

    // Add to GPS stream
    this.activeRide.sensorData.gps.push(location)
    
    // Add to route path
    this.activeRide.route.path.push({
      lat: location.latitude,
      lng: location.longitude,
      timestamp: location.timestamp,
      speed: location.speed || 0,
      elevation: location.altitude
    })
    
    // Update elevation tracking
    if (location.altitude) {
      this.activeRide.analytics.maxElevation = Math.max(this.activeRide.analytics.maxElevation, location.altitude)
      this.activeRide.analytics.minElevation = Math.min(this.activeRide.analytics.minElevation, location.altitude)
    }

    // Calculate distance
    this.updateDistance()
  }

  private handleWeatherUpdate(weather: WeatherData): void {
    if (!this.activeRide) return
    
    this.activeRide.environment.weather.push(weather)
    this.activeRide.environment.temperature.push(weather.temperature)
  }

  private async handleEmergencyDetection(motionData: unknown): Promise<void> {
    if (!this.activeRide) return

    try {
      const location = await this.getCurrentLocation()
      
      // Send emergency alert
      await networkService.sendEmergencyAlert(
        { lat: location.latitude, lng: location.longitude },
        'accident'
      )
      
      // Add to insights
      this.activeRide.insights.anomalies.push({
        type: 'speed',
        timestamp: Date.now(),
        description: 'Potential crash or accident detected',
        severity: 'high'
      })
      
      console.log('Emergency alert sent:', motionData)
    } catch (error) {
      console.error('Failed to handle emergency:', error)
    }
  }

  private handleWorkerMessage(message: { type: string; result: unknown }): void {
    if (!this.activeRide) return

    switch (message.type) {
      case 'performance-analysis':
        this.updatePerformanceAnalytics(message.result)
        break
      case 'anomalies-detected':
        this.updateAnomalies(message.result)
        break
    }
  }

  // Analysis and calculations
  private async analyzeRide(): Promise<void> {
    if (!this.activeRide) return

    // Calculate basic metrics
    this.updateRideMetrics()
    
    // AI-powered insights
    await this.generateInsights()
    
    // Performance analysis using web worker
    if (this.analysisWorker) {
      this.analysisWorker.postMessage({
        type: 'analyze-performance',
        data: this.activeRide
      })
    }
  }

  private updateRideMetrics(): void {
    if (!this.activeRide) return

    // Update duration
    const now = Date.now()
    this.activeRide.duration = now - this.activeRide.startTime
    
    // Update average speed
    if (this.activeRide.duration > 0) {
      this.activeRide.averageSpeed = (this.activeRide.distance / this.activeRide.duration) * 3600000 // km/h
    }
  }

  private updateDistance(): void {
    if (!this.activeRide || this.activeRide.route.path.length < 2) return

    const path = this.activeRide.route.path
    let totalDistance = 0
    
    for (let i = 1; i < path.length; i++) {
      const prev = path[i - 1]
      const curr = path[i]
      totalDistance += this.calculateDistance(
        { lat: prev.lat, lng: prev.lng },
        { lat: curr.lat, lng: curr.lng }
      )
    }
    
    this.activeRide.distance = totalDistance
  }

  private calculateDistance(point1: { lat: number; lng: number }, point2: { lat: number; lng: number }): number {
    const R = 6371 // Earth's radius in km
    const dLat = (point2.lat - point1.lat) * Math.PI / 180
    const dLng = (point2.lng - point1.lng) * Math.PI / 180
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  private async generateInsights(): Promise<void> {
    if (!this.activeRide) return

    const insights = this.activeRide.insights
    
    // Route rating based on various factors
    insights.routeRating = this.calculateRouteRating()
    
    // Difficulty assessment
    insights.difficultyActual = this.assessDifficulty()
    
    // Generate recommendations
    insights.recommendations = await this.generateRecommendations()
  }

  private calculateRouteRating(): number {
    if (!this.activeRide) return 0

    let rating = 5 // Base rating
    
    // Adjust for weather conditions
    const avgTemp = this.activeRide.environment.temperature.reduce((a, b) => a + b, 0) / 
                   this.activeRide.environment.temperature.length
    
    if (avgTemp > 25 || avgTemp < 5) rating -= 0.5 // Extreme temperatures
    
    // Adjust for elevation
    const elevationGain = this.activeRide.analytics.maxElevation - this.activeRide.analytics.minElevation
    if (elevationGain > 500) rating += 0.5 // Scenic routes with elevation
    
    // Adjust for anomalies
    const highSeverityAnomalies = this.activeRide.insights.anomalies.filter(a => a.severity === 'high')
    rating -= highSeverityAnomalies.length * 0.5
    
    return Math.max(1, Math.min(10, rating))
  }

  private assessDifficulty(): 'easy' | 'moderate' | 'hard' {
    if (!this.activeRide) return 'easy'

    const distance = this.activeRide.distance
    const elevation = this.activeRide.analytics.maxElevation - this.activeRide.analytics.minElevation
    const avgSpeed = this.activeRide.averageSpeed
    
    const difficultyScore = (distance * 0.1) + (elevation * 0.01) + (avgSpeed * 0.05)
    
    if (difficultyScore < 3) return 'easy'
    if (difficultyScore < 7) return 'moderate'
    return 'hard'
  }

  private async generateRecommendations(): Promise<string[]> {
    if (!this.activeRide) return []

    const recommendations: string[] = []
    
    // Battery efficiency recommendations
    if (this.activeRide.battery.efficiency < 5) {
      recommendations.push('Consider using a lower assist level to improve battery efficiency')
    }
    
    // Speed recommendations
    if (this.activeRide.averageSpeed > 25) {
      recommendations.push('Great pace! You might enjoy more challenging routes')
    } else if (this.activeRide.averageSpeed < 10) {
      recommendations.push('Take your time and enjoy the scenery!')
    }
    
    // Weather-based recommendations
    const weather = this.activeRide.environment.weather[0]
    if (weather?.temperature > 30) {
      recommendations.push('Stay hydrated on hot days like this')
    }
    
    return recommendations
  }

  private updatePerformanceAnalytics(analysis: unknown): void {
    if (!this.activeRide || !analysis || typeof analysis !== 'object') return
    
    const performanceData = analysis as {
      averageSpeed?: number
      calories?: number
      co2Saved?: number
      efficiency?: number
    }
    
    if (performanceData.calories) this.activeRide.analytics.calories = performanceData.calories
    if (performanceData.co2Saved) this.activeRide.analytics.co2Saved = performanceData.co2Saved
  }

  private updateAnomalies(anomalies: unknown): void {
    if (!this.activeRide || !Array.isArray(anomalies)) return
    
    this.activeRide.insights.anomalies.push(...anomalies.filter(a => 
      a && typeof a === 'object' && 'type' in a && 'timestamp' in a
    ))
  }

  // Utility methods
  private async getCurrentLocation(): Promise<LocationData> {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            altitude: position.coords.altitude || undefined,
            accuracy: position.coords.accuracy,
            speed: position.coords.speed || undefined,
            heading: position.coords.heading || undefined,
            timestamp: position.timestamp
          })
        },
        reject,
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
      )
    })
  }

  private async getAddressFromCoordinates(lat: number, lng: number): Promise<string | undefined> {
    try {
      // This would use a geocoding service
      return `Location: ${lat.toFixed(4)}, ${lng.toFixed(4)}`
    } catch (error) {
      return undefined
    }
  }

  private async getBatteryLevel(bikeId?: string): Promise<number> {
    if (bikeId) {
      const bike = await databaseService.read('bikes', bikeId)
      return bike?.specifications.battery.health || 100
    }
    
    // Use device battery if available
    if ('getBattery' in navigator) {
      try {
        const battery = await (navigator as any).getBattery()
        return battery.level * 100
      } catch (error) {
        return 100
      }
    }
    
    return 100 // Default
  }

  private async updateWeatherData(): Promise<void> {
    if (!this.activeRide) return
    
    try {
      const location = await this.getCurrentLocation()
      const weather = await networkService.getWeatherData(location.latitude, location.longitude)
      this.handleWeatherUpdate(weather)
    } catch (error) {
      console.error('Failed to update weather data:', error)
    }
  }

  private async saveRideToDatabase(): Promise<void> {
    if (!this.activeRide) return

    try {
      // Convert to database format
      const rideRecord = this.convertToRideRecord(this.activeRide)
      
      // Save or update
      const existingRide = await databaseService.read('rides', this.activeRide.id)
      if (existingRide) {
        await databaseService.update('rides', this.activeRide.id, rideRecord)
      } else {
        await databaseService.create('rides', rideRecord)
      }
    } catch (error) {
      console.error('Failed to save ride to database:', error)
    }
  }

  private convertToRideRecord(ride: EnhancedRideData): EBikeDB['rides']['value'] {
    return {
      id: ride.id,
      timestamp: ride.startTime,
      bikeId: 'default-bike',
      route: {
        startLocation: ride.route.start,
        endLocation: ride.route.end || ride.route.start,
        waypoints: ride.route.path
      },
      metrics: {
        distance: ride.distance,
        duration: ride.duration,
        avgSpeed: ride.averageSpeed,
        maxSpeed: ride.maxSpeed,
        elevation: {
          gain: ride.analytics.maxElevation - ride.analytics.minElevation,
          loss: 0,
          max: ride.analytics.maxElevation,
          min: ride.analytics.minElevation
        },
        battery: {
          startLevel: ride.battery.startLevel,
          endLevel: ride.battery.endLevel || 0,
          consumption: ride.battery.consumption,
          efficiency: ride.battery.efficiency
        },
        calories: ride.analytics.calories,
        co2Saved: ride.analytics.co2Saved
      },
      conditions: {
        weather: ride.environment.weather[0]?.condition || 'unknown',
        temperature: ride.environment.temperature[0] || 20,
        humidity: ride.environment.weather[0]?.humidity || 50,
        windSpeed: ride.environment.weather[0]?.windSpeed || 0,
        windDirection: ride.environment.weather[0]?.windDirection || 0
      },
      sensors: {
        heartRate: ride.sensorData.heartRate.map(s => s.value),
        cadence: ride.sensorData.cadence.map(s => s.value),
        power: ride.sensorData.power.map(s => s.value),
        gpsAccuracy: ride.sensorData.gps.map(s => s.accuracy)
      },
      assistLevel: 'auto',
      notes: ride.insights.recommendations.join('; '),
      synchronized: false,
      lastModified: Date.now()
    }
  }

  private generateRideId(): string {
    return 'ride-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9)
  }

  // Public API
  getCurrentRide(): EnhancedRideData | null {
    return this.activeRide
  }

  async getRideHistory(limit = 10): Promise<EnhancedRideData[]> {
    const rides = await databaseService.list('rides', {
      index: 'timestamp',
      limit
    })
    
    // Convert from database format (simplified for this example)
    return rides.map(ride => ({
      id: ride.id,
      startTime: ride.timestamp,
      endTime: ride.timestamp + ride.metrics.duration,
      status: 'completed' as const,
      distance: ride.metrics.distance,
      duration: ride.metrics.duration,
      averageSpeed: ride.metrics.avgSpeed,
      maxSpeed: ride.metrics.maxSpeed,
      route: ride.route,
      sensorData: {
        gps: [],
        heartRate: ride.sensors.heartRate?.map(hr => ({
          timestamp: ride.timestamp,
          sensorId: 'heart-rate',
          type: 'heart-rate' as const,
          value: hr,
          unit: 'bpm'
        })) || [],
        power: [],
        cadence: [],
        speed: [],
        motion: []
      },
      environment: {
        weather: [],
        temperature: [ride.conditions.temperature],
        elevation: []
      },
      battery: ride.metrics.battery,
      analytics: {
        calories: ride.metrics.calories,
        co2Saved: ride.metrics.co2Saved,
        maxElevation: ride.metrics.elevation.max,
        minElevation: ride.metrics.elevation.min
      },
      insights: {
        routeRating: 5,
        difficultyActual: 'moderate' as const,
        recommendations: ride.notes ? ride.notes.split('; ') : [],
        anomalies: []
      }
    }))
  }

  getConnectionStatus(): {
    database: boolean
    sensors: number
    network: boolean
    gps: boolean
  } {
    return {
      database: this.isInitialized,
      sensors: sensorService.getConnectedSensors().length,
      network: networkService.getConnectionStatus().online,
      gps: sensorService.getConnectedSensors().some(s => s.capabilities.includes('location'))
    }
  }

  // Cleanup
  async shutdown(): Promise<void> {
    this.stopDataCollection()
    await sensorService.stopGPSTracking()
    networkService.disconnect()
    
    if (this.analysisWorker) {
      this.analysisWorker.terminate()
    }
    
    await databaseService.close()
  }
}

// Create singleton instance
export const connectivityFramework = new ConnectivityFramework()
export type { EnhancedRideData }

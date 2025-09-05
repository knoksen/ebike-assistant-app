/// <reference path="../vite-env.d.ts" />
// Network Service - API integrations, WebSocket, real-time sync
import { databaseService } from './DatabaseService'
import { sensorService } from './SensorService'
import type { Trip } from './dbTypes'

// API Response types
export interface WeatherData {
  temperature: number
  humidity: number
  windSpeed: number
  windDirection: number
  condition: string
  visibility: number
  pressure: number
  uvIndex: number
}

export interface RouteData {
  distance: number
  duration: number
  elevation: {
    gain: number
    loss: number
    profile: Array<{ distance: number; elevation: number }>
  }
  difficulty: 'easy' | 'moderate' | 'hard'
  surface: 'paved' | 'gravel' | 'mixed'
  waypoints: Array<{
    lat: number
    lng: number
    name?: string
    type: 'start' | 'waypoint' | 'end' | 'poi'
  }>
}

export interface TrafficData {
  congestionLevel: number
  incidents: Array<{
    type: 'accident' | 'construction' | 'road-closure'
    description: string
    location: { lat: number; lng: number }
    severity: 'low' | 'moderate' | 'high'
  }>
  bikeInfrastructure: Array<{
    type: 'bike-lane' | 'bike-path' | 'bike-rack' | 'bike-shop'
    location: { lat: number; lng: number }
    name: string
    rating?: number
  }>
}

export interface CommunityData {
  nearbyRiders: Array<{
    id: string
    name: string
    location: { lat: number; lng: number }
    activity: 'riding' | 'stopped' | 'maintenance'
    bikeType: string
    lastSeen: number
  }>
  events: Array<{
    id: string
    name: string
    description: string
    location: { lat: number; lng: number; address: string }
    startTime: number
    endTime: number
    participants: number
    difficulty: string
    type: 'group-ride' | 'race' | 'maintenance-workshop' | 'social'
  }>
  routes: Array<{
    id: string
    name: string
    createdBy: string
    difficulty: string
    distance: number
    rating: number
    downloads: number
    tags: string[]
  }>
}

class NetworkService {
  private baseUrl = import.meta.env.VITE_API_URL || 'https://api.ebike-assistant.com'
  private wsConnection: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private isOnline = navigator.onLine
  private requestQueue: Array<() => Promise<unknown>> = []
  private rateLimiters: Map<string, { count: number; resetTime: number }> = new Map()

  // API Keys (in production, these should be secured)
  private readonly API_KEYS = {
    weather: import.meta.env.VITE_WEATHER_API_KEY || '',
    maps: import.meta.env.VITE_MAPS_API_KEY || '',
    elevation: import.meta.env.VITE_ELEVATION_API_KEY || '',
    traffic: import.meta.env.VITE_TRAFFIC_API_KEY || '',
    community: import.meta.env.VITE_COMMUNITY_API_KEY || ''
  }

  // External API endpoints
  private readonly ENDPOINTS = {
    weather: 'https://api.openweathermap.org/data/2.5',
    maps: 'https://api.mapbox.com',
    elevation: 'https://api.open-elevation.com/api/v1',
    strava: 'https://www.strava.com/api/v3',
    komoot: 'https://api.komoot.de/v007',
    openStreetMap: 'https://api.openstreetmap.org/api/0.6'
  }

  constructor() {
    this.setupNetworkListeners()
    this.initializeWebSocket()
    this.startPeriodicSync()
  }

  // Network monitoring
  private setupNetworkListeners(): void {
    window.addEventListener('online', () => {
      this.isOnline = true
      this.processRequestQueue()
      this.reconnectWebSocket()
    })

    window.addEventListener('offline', () => {
      this.isOnline = false
      if (this.wsConnection) {
        this.wsConnection.close()
      }
    })
  }

  // WebSocket connection for real-time features
  private initializeWebSocket(): void {
    if (!this.isOnline) return

    const wsUrl = import.meta.env.VITE_WS_URL || 'wss://ws.ebike-assistant.com'
    
    try {
      this.wsConnection = new WebSocket(wsUrl)
      
      this.wsConnection.onopen = () => {
        console.log('WebSocket connected')
        this.reconnectAttempts = 0
        this.subscribeToRealTimeUpdates()
      }
      
      this.wsConnection.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          this.handleWebSocketMessage(data)
        } catch (error) {
          console.error('Error parsing WebSocket message:', error)
        }
      }
      
      this.wsConnection.onclose = () => {
        console.log('WebSocket disconnected')
        this.scheduleReconnect()
      }
      
      this.wsConnection.onerror = (error) => {
        console.error('WebSocket error:', error)
      }
      
    } catch (error) {
      console.error('WebSocket initialization error:', error)
      this.scheduleReconnect()
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts && this.isOnline) {
      setTimeout(() => {
        this.reconnectAttempts++
        this.initializeWebSocket()
      }, this.reconnectDelay * Math.pow(2, this.reconnectAttempts))
    }
  }

  private reconnectWebSocket(): void {
    if (!this.wsConnection || this.wsConnection.readyState === WebSocket.CLOSED) {
      this.reconnectAttempts = 0
      this.initializeWebSocket()
    }
  }

  private subscribeToRealTimeUpdates(): void {
    if (this.wsConnection && this.wsConnection.readyState === WebSocket.OPEN) {
      // Subscribe to various real-time channels
      this.sendWebSocketMessage({
        type: 'subscribe',
        channels: ['weather-updates', 'traffic-updates', 'community-events', 'emergency-alerts']
      })
    }
  }

  private handleWebSocketMessage(data: { type: string; payload: unknown }): void {
    switch (data.type) {
      case 'weather-update':
        this.handleWeatherUpdate(data.payload as WeatherData)
        break
      case 'traffic-update':
        this.handleTrafficUpdate(data.payload as TrafficData)
        break
      case 'community-event':
        this.handleCommunityEvent(data.payload)
        break
      case 'emergency-alert':
        this.handleEmergencyAlert(data.payload)
        break
      default:
        console.log('Unknown WebSocket message type:', data.type)
    }
  }

  private sendWebSocketMessage(message: Record<string, unknown>): void {
    if (this.wsConnection && this.wsConnection.readyState === WebSocket.OPEN) {
      this.wsConnection.send(JSON.stringify(message))
    }
  }

  // API request with retry logic and rate limiting
  private async makeRequest<T>(
    url: string, 
    options: RequestInit = {}, 
    retries = 3,
    rateLimitKey?: string
  ): Promise<T> {
    // Check rate limit
    if (rateLimitKey && this.isRateLimited(rateLimitKey)) {
      throw new Error('Rate limit exceeded')
    }

    // If offline, queue the request
    if (!this.isOnline) {
      return new Promise((resolve, reject) => {
        this.requestQueue.push(async () => {
          try {
            const result = await this.makeRequest<T>(url, options, retries, rateLimitKey)
            resolve(result)
          } catch (error) {
            reject(error)
          }
        })
      })
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'E-Bike-Assistant/1.0',
          ...options.headers
        }
      })

      // Update rate limit tracking
      if (rateLimitKey) {
        this.updateRateLimit(rateLimitKey, response)
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      if (retries > 0) {
        await this.delay(1000 * (4 - retries)) // Exponential backoff
        return this.makeRequest<T>(url, options, retries - 1, rateLimitKey)
      }
      throw error
    }
  }

  private isRateLimited(key: string): boolean {
    const limiter = this.rateLimiters.get(key)
    if (!limiter) return false
    
    if (Date.now() > limiter.resetTime) {
      this.rateLimiters.delete(key)
      return false
    }
    
    return limiter.count >= 100 // 100 requests per hour default
  }

  private updateRateLimit(key: string, response: Response): void {
    const remaining = response.headers.get('X-RateLimit-Remaining')
    const reset = response.headers.get('X-RateLimit-Reset')
    
    if (remaining && reset) {
      const limiter = this.rateLimiters.get(key) || { count: 0, resetTime: 0 }
      limiter.count = 100 - parseInt(remaining)
      limiter.resetTime = parseInt(reset) * 1000
      this.rateLimiters.set(key, limiter)
    }
  }

  private async processRequestQueue(): Promise<void> {
    while (this.requestQueue.length > 0 && this.isOnline) {
      const request = this.requestQueue.shift()
      if (request) {
        try {
          await request()
        } catch (error) {
          console.error('Queued request failed:', error)
        }
      }
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // Weather API integration
  async getWeatherData(lat: number, lng: number): Promise<WeatherData> {
    if (!this.API_KEYS.weather) {
      throw new Error('Weather API key not configured')
    }

    const url = `${this.ENDPOINTS.weather}/weather?lat=${lat}&lon=${lng}&appid=${this.API_KEYS.weather}&units=metric`
    
    const data = await this.makeRequest<{
      main: { temp: number; humidity: number; pressure: number }
      wind: { speed: number; deg: number }
      weather: Array<{ main: string; description: string }>
      visibility: number
      uvi?: number
    }>(url, {}, 3, 'weather')

    return {
      temperature: data.main.temp,
      humidity: data.main.humidity,
      windSpeed: data.wind.speed,
      windDirection: data.wind.deg,
      condition: data.weather[0]?.description || 'unknown',
      visibility: data.visibility,
      pressure: data.main.pressure,
      uvIndex: data.uvi || 0
    }
  }

  async getWeatherForecast(lat: number, lng: number): Promise<WeatherData[]> {
    if (!this.API_KEYS.weather) {
      throw new Error('Weather API key not configured')
    }

    const url = `${this.ENDPOINTS.weather}/forecast?lat=${lat}&lon=${lng}&appid=${this.API_KEYS.weather}&units=metric`
    
    const data = await this.makeRequest<{
      list: Array<{
        main: { temp: number; humidity: number; pressure: number }
        wind: { speed: number; deg: number }
        weather: Array<{ main: string; description: string }>
        visibility: number
        dt: number
      }>
    }>(url, {}, 3, 'weather-forecast')

    return data.list.slice(0, 24).map(item => ({
      temperature: item.main.temp,
      humidity: item.main.humidity,
      windSpeed: item.wind.speed,
      windDirection: item.wind.deg,
      condition: item.weather[0]?.description || 'unknown',
      visibility: item.visibility,
      pressure: item.main.pressure,
      uvIndex: 0
    }))
  }

  // Route planning and navigation
  async getRouteData(
    start: { lat: number; lng: number },
    end: { lat: number; lng: number },
    preferences: {
      avoidTraffic?: boolean
      preferBikePaths?: boolean
      avoidHills?: boolean
      routeType?: 'fastest' | 'shortest' | 'scenic'
    } = {}
  ): Promise<RouteData> {
    const url = `${this.ENDPOINTS.maps}/directions/v5/mapbox/cycling/${start.lng},${start.lat};${end.lng},${end.lat}?access_token=${this.API_KEYS.maps}&geometries=geojson&steps=true&overview=full`
    
    const data = await this.makeRequest<{
      routes: Array<{
        distance: number
        duration: number
        geometry: { coordinates: Array<[number, number]> }
        legs: Array<{
          steps: Array<{
            geometry: { coordinates: Array<[number, number]> }
            maneuver: { location: [number, number]; instruction: string }
          }>
        }>
      }>
    }>(url, {}, 3, 'routing')

    const route = data.routes[0]
    if (!route) throw new Error('No route found')

    // Get elevation data for the route
    const elevationData = await this.getElevationProfile(
      route.geometry.coordinates.map(([lng, lat]) => ({ lat, lng }))
    )

    const waypoints = route.legs[0]?.steps.map((step, index) => ({
      lat: step.maneuver.location[1],
      lng: step.maneuver.location[0],
      name: step.maneuver.instruction,
      type: index === 0 ? 'start' as const : 
            index === route.legs[0].steps.length - 1 ? 'end' as const : 
            'waypoint' as const
    })) || []

    return {
      distance: route.distance / 1000, // Convert to km
      duration: route.duration / 60, // Convert to minutes
      elevation: elevationData,
      difficulty: this.calculateRouteDifficulty(route.distance, elevationData.gain),
      surface: 'mixed', // Would need additional API call to determine
      waypoints
    }
  }

  private async getElevationProfile(coordinates: Array<{ lat: number; lng: number }>): Promise<{
    gain: number
    loss: number
    profile: Array<{ distance: number; elevation: number }>
  }> {
    try {
      const response = await this.makeRequest<{
        results: Array<{ elevation: number }>
      }>(`${this.ENDPOINTS.elevation}/lookup`, {
        method: 'POST',
        body: JSON.stringify({
          locations: coordinates.map(c => ({ latitude: c.lat, longitude: c.lng }))
        })
      }, 3, 'elevation')

      const elevations = response.results.map(r => r.elevation)
      let gain = 0
      let loss = 0
      let distance = 0

      const profile = elevations.map((elevation, index) => {
        if (index > 0) {
          const prevElevation = elevations[index - 1]
          const diff = elevation - prevElevation
          if (diff > 0) gain += diff
          else loss += Math.abs(diff)
          
          // Approximate distance between points
          distance += this.calculateDistance(
            coordinates[index - 1],
            coordinates[index]
          )
        }
        
        return { distance, elevation }
      })

      return { gain, loss, profile }
    } catch (error) {
      console.error('Elevation API error:', error)
      return { gain: 0, loss: 0, profile: [] }
    }
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

  private calculateRouteDifficulty(distance: number, elevation: number): 'easy' | 'moderate' | 'hard' {
    const difficultyScore = (elevation / 100) + (distance / 10)
    if (difficultyScore < 3) return 'easy'
    if (difficultyScore < 7) return 'moderate'
    return 'hard'
  }

  // Traffic and infrastructure data
  async getTrafficData(bounds: {
    north: number
    south: number
    east: number
    west: number
  }): Promise<TrafficData> {
    // This would integrate with traffic APIs like HERE, Mapbox, or local government APIs
    const mockData: TrafficData = {
      congestionLevel: Math.random() * 10,
      incidents: [],
      bikeInfrastructure: []
    }
    
    return mockData
  }

  // Community features
  async getCommunityData(
    location: { lat: number; lng: number },
    radius = 10
  ): Promise<CommunityData> {
    const url = `${this.baseUrl}/community?lat=${location.lat}&lng=${location.lng}&radius=${radius}`
    
    try {
      return await this.makeRequest<CommunityData>(url, {}, 3, 'community')
    } catch (error) {
      console.error('Community API error:', error)
      // Return mock data if API is unavailable
      return {
        nearbyRiders: [],
        events: [],
        routes: []
      }
    }
  }

  async shareRide(rideData: {
    route: Array<{ lat: number; lng: number }>
    distance: number
    duration: number
    averageSpeed: number
    notes?: string
  }): Promise<{ shareId: string; shareUrl: string }> {
    const url = `${this.baseUrl}/rides/share`
    
    const response = await this.makeRequest<{
      shareId: string
      shareUrl: string
    }>(url, {
      method: 'POST',
      body: JSON.stringify(rideData)
    }, 3, 'share')

    return response
  }

  // Emergency services
  async sendEmergencyAlert(location: { lat: number; lng: number }, type: 'accident' | 'breakdown' | 'medical'): Promise<void> {
    const alertData = {
      location,
      type,
      timestamp: Date.now(),
      deviceId: await this.getDeviceId(),
      userProfile: await this.getUserProfile()
    }

    // Send via WebSocket for immediate delivery
    this.sendWebSocketMessage({
      type: 'emergency-alert',
      payload: alertData
    })

    // Also send via HTTP as backup
    try {
      await this.makeRequest(`${this.baseUrl}/emergency`, {
        method: 'POST',
        body: JSON.stringify(alertData)
      }, 1, 'emergency')
    } catch (error) {
      console.error('Emergency alert HTTP backup failed:', error)
    }
  }

  // Sync with cloud services
  private startPeriodicSync(): void {
    setInterval(async () => {
      if (this.isOnline) {
        await this.syncData()
      }
    }, 5 * 60 * 1000) // Sync every 5 minutes
  }

  private async syncData(): Promise<void> {
    try {
      // Sync trips data
      const unsynced = await databaseService.list('trips', {
        index: 'by-date',
        query: IDBKeyRange.upperBound(Date.now())
      })

      for (const trip of unsynced.slice(0, 10)) { // Sync up to 10 trips at a time
        await this.syncTripToCloud(trip)
      }
    } catch (error) {
      console.error('Sync error:', error)
    }
  }

  private async syncTripToCloud(trip: Trip): Promise<void> {
    const url = `${this.baseUrl}/trips/sync`
    
    try {
      await this.makeRequest(url, {
        method: 'POST',
        body: JSON.stringify(trip)
      }, 2, 'sync')

      // Mark as synchronized by updating metadata
      await databaseService.update('trips', trip.id, {
        metadata: { ...trip.metadata, synced: true }
      })
    } catch (error) {
      console.error('Failed to sync trip:', error)
    }
  }

  // Event handlers for WebSocket messages
  private handleWeatherUpdate(weather: WeatherData): void {
    // Emit event for components to listen to
    window.dispatchEvent(new CustomEvent('weather-updated', { detail: weather }))
  }

  private handleTrafficUpdate(traffic: TrafficData): void {
    window.dispatchEvent(new CustomEvent('traffic-updated', { detail: traffic }))
  }

  private handleCommunityEvent(event: unknown): void {
    window.dispatchEvent(new CustomEvent('community-event', { detail: event }))
  }

  private handleEmergencyAlert(alert: unknown): void {
    // Show notification for emergency alerts
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Emergency Alert', {
        body: 'Emergency situation detected in your area',
        icon: '/ebike-icon.svg'
      })
    }
    window.dispatchEvent(new CustomEvent('emergency-alert', { detail: alert }))
  }

  // Utility methods
  private async getDeviceId(): Promise<string> {
    let deviceId = localStorage.getItem('device-id')
    if (!deviceId) {
      deviceId = 'device-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9)
      localStorage.setItem('device-id', deviceId)
    }
    return deviceId
  }

  private async getUserProfile(): Promise<{ name?: string; emergencyContact?: string }> {
    const userProfile = await databaseService.get('settings', 'user-profile')
    return userProfile?.value as { name?: string; emergencyContact?: string } || {}
  }

  // Connection status
  getConnectionStatus(): {
    online: boolean
    websocket: boolean
    lastSync: number
    queuedRequests: number
  } {
    return {
      online: this.isOnline,
      websocket: this.wsConnection?.readyState === WebSocket.OPEN,
      lastSync: parseInt(localStorage.getItem('last-sync') || '0'),
      queuedRequests: this.requestQueue.length
    }
  }

  // Clean up
  disconnect(): void {
    if (this.wsConnection) {
      this.wsConnection.close()
    }
  }
}

export const networkService = new NetworkService()

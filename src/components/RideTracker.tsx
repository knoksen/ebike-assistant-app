import { useState, useEffect } from 'react'
import { connectivityFramework, type EnhancedRideData } from '../services/ConnectivityFramework'
import { sensorService, type SensorDevice } from '../services/SensorService'
import { networkService } from '../services/NetworkService'

type Ride = {
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
  weather?: 'sunny' | 'cloudy' | 'rainy' | 'windy' | 'cold' | 'hot'
  assistLevel?: 'eco' | 'tour' | 'sport' | 'turbo' | 'off'
  // Enhanced properties
  sensors?: SensorDevice[]
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
    condition: string
  }
  insights?: {
    efficiency: number
    co2Saved: number
    calories: number
    routeRating: number
    recommendations: string[]
  }
}

type RideStats = {
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

export function RideTracker() {
  const [rides, setRides] = useState<Ride[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingRide, setEditingRide] = useState<Ride | null>(null)
  const [sortBy, setSortBy] = useState<'date' | 'distance' | 'duration'>('date')
  const [filterBy, setFilterBy] = useState<'all' | 'week' | 'month' | 'year'>('all')
  const [isRecording, setIsRecording] = useState(false)
  const [currentRide, setCurrentRide] = useState<EnhancedRideData | null>(null)
  const [connectedSensors, setConnectedSensors] = useState<SensorDevice[]>([])
  const [connectionStatus, setConnectionStatus] = useState({
    database: false,
    sensors: 0,
    network: false,
    gps: false
  })

  // Load rides from localStorage and initialize connectivity framework
  useEffect(() => {
    const saved = localStorage.getItem('ebike-rides')
    if (saved) {
      const parsed = JSON.parse(saved) as Array<Omit<Ride, 'date'> & { date: string }>
      setRides(parsed.map((r) => ({
        ...r,
        date: new Date(r.date)
      })))
    }

    // Initialize services and update connection status
    const initializeServices = async () => {
      try {
        // Get connected sensors
        const devices = sensorService.getConnectedSensors()
        setConnectedSensors(devices)

        // Update connection status
        setConnectionStatus({
          database: true, // Assuming localStorage is available
          sensors: devices.length,
          network: navigator.onLine,
          gps: navigator.geolocation ? true : false
        })

      } catch (error) {
        console.error('Failed to initialize services:', error)
      }
    }

    initializeServices()

    // Listen for online/offline status
    const handleOnline = () => setConnectionStatus(prev => ({ ...prev, network: true }))
    const handleOffline = () => setConnectionStatus(prev => ({ ...prev, network: false }))
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Save rides to localStorage
  useEffect(() => {
    localStorage.setItem('ebike-rides', JSON.stringify(rides))
  }, [rides])

  const addRide = (rideData: Omit<Ride, 'id'>) => {
    const newRide: Ride = {
      ...rideData,
      id: Date.now().toString()
    }
    setRides(prev => [newRide, ...prev])
    setShowAddForm(false)
  }

  const updateRide = (id: string, updates: Partial<Ride>) => {
    setRides(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r))
    setEditingRide(null)
  }

  const deleteRide = (id: string) => {
    if (confirm('Are you sure you want to delete this ride?')) {
      setRides(prev => prev.filter(r => r.id !== id))
    }
  }

  const getFilteredRides = () => {
    const now = new Date()
    let filtered = [...rides]

    switch (filterBy) {
      case 'week': {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        filtered = rides.filter(r => r.date >= weekAgo)
        break
      }
      case 'month': {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        filtered = rides.filter(r => r.date >= monthAgo)
        break
      }
      case 'year': {
        const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        filtered = rides.filter(r => r.date >= yearAgo)
        break
      }
    }

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'distance':
          return b.distance - a.distance
        case 'duration':
          return b.duration - a.duration
        default:
          return b.date.getTime() - a.date.getTime()
      }
    })
  }

  const calculateStats = (): RideStats => {
    const filteredRides = getFilteredRides()
    
    if (filteredRides.length === 0) {
      return {
        totalRides: 0,
        totalDistance: 0,
        totalDuration: 0,
        averageDistance: 0,
        averageSpeed: 0,
        longestRide: 0,
        fastestRide: 0,
        totalBatteryUsed: 0,
        totalCo2Saved: 0,
        connectedSensors: 0
      }
    }

    const totalDistance = filteredRides.reduce((sum, r) => sum + r.distance, 0)
    const totalDuration = filteredRides.reduce((sum, r) => sum + r.duration, 0)
    const totalBatteryUsed = filteredRides.reduce((sum, r) => sum + r.batteryUsed, 0)
    const totalCo2Saved = filteredRides.reduce((sum, r) => sum + (r.insights?.co2Saved || 0), 0)
    const connectedSensorsCount = filteredRides.reduce((sum, r) => sum + (r.sensors?.length || 0), 0)

    return {
      totalRides: filteredRides.length,
      totalDistance,
      totalDuration,
      averageDistance: totalDistance / filteredRides.length,
      averageSpeed: filteredRides.reduce((sum, r) => sum + r.averageSpeed, 0) / filteredRides.length,
      longestRide: Math.max(...filteredRides.map(r => r.distance)),
      fastestRide: Math.max(...filteredRides.map(r => r.maxSpeed)),
      totalBatteryUsed,
      totalCo2Saved,
      connectedSensors: Math.ceil(connectedSensorsCount / Math.max(filteredRides.length, 1))
    }
  }

  const stats = calculateStats()
  const filteredRides = getFilteredRides()

  const WeatherIcon = ({ weather }: { weather?: string }) => {
    const icons = {
      sunny: '☀️',
      cloudy: '☁️',
      rainy: '🌧️',
      windy: '💨',
      cold: '❄️',
      hot: '🔥'
    }
    return <span>{weather ? icons[weather as keyof typeof icons] || '🌤️' : '🌤️'}</span>
  }

  const AssistIcon = ({ level }: { level?: string }) => {
    const icons = {
      off: '🚴',
      eco: '🌱',
      tour: '🚵',
      sport: '⚡',
      turbo: '🚀'
    }
    return <span>{level ? icons[level as keyof typeof icons] || '⚙️' : '⚙️'}</span>
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
          🚴‍♂️ Ride Tracker
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Track your e-bike adventures and monitor your progress
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {stats.totalRides}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Rides</div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {stats.totalDistance.toFixed(1)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Distance (km)</div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {Math.round(stats.totalDuration / 60)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Hours</div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {stats.averageSpeed.toFixed(1)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Avg Speed (km/h)</div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          
          {/* Connection Status */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${connectionStatus.database ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span>Database</span>
            </div>
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${connectionStatus.network ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span>Network</span>
            </div>
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${connectionStatus.gps ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span>GPS</span>
            </div>
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${connectionStatus.sensors > 0 ? 'bg-green-500' : 'bg-gray-400'}`}></div>
              <span>{connectionStatus.sensors} Sensors</span>
            </div>
          </div>

          {/* Real-time Tracking Controls */}
          <div className="flex items-center gap-4">
            {!isRecording ? (
              <button
                onClick={async () => {
                  try {
                    setIsRecording(true)
                    const rideId = await connectivityFramework.startRide()
                    console.log('Started ride tracking:', rideId)
                  } catch (error) {
                    console.error('Failed to start ride:', error)
                    setIsRecording(false)
                  }
                }}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
                Start Ride
              </button>
            ) : (
              <button
                onClick={async () => {
                  try {
                    const enhancedRide = await connectivityFramework.stopRide()
                    setIsRecording(false)
                    setCurrentRide(null)
                    
                    // Convert enhanced ride to regular ride format for display
                    const newRide: Ride = {
                      id: enhancedRide.id,
                      date: enhancedRide.startTime,
                      duration: Math.round((enhancedRide.endTime.getTime() - enhancedRide.startTime.getTime()) / (1000 * 60)),
                      distance: enhancedRide.totalDistance,
                      averageSpeed: enhancedRide.analytics?.averageSpeed || 0,
                      maxSpeed: enhancedRide.analytics?.maxSpeed || 0,
                      elevation: enhancedRide.analytics?.elevationGain,
                      batteryStart: enhancedRide.batteryData?.startLevel || 100,
                      batteryEnd: enhancedRide.batteryData?.endLevel || 90,
                      batteryUsed: (enhancedRide.batteryData?.startLevel || 100) - (enhancedRide.batteryData?.endLevel || 90),
                      route: enhancedRide.route.map(p => `${p.latitude},${p.longitude}`).join(';'),
                      notes: enhancedRide.insights?.recommendations.join('. '),
                      weather: (enhancedRide.weatherData?.condition === 'sunny' || 
                               enhancedRide.weatherData?.condition === 'cloudy' ||
                               enhancedRide.weatherData?.condition === 'rainy' ||
                               enhancedRide.weatherData?.condition === 'windy' ||
                               enhancedRide.weatherData?.condition === 'cold' ||
                               enhancedRide.weatherData?.condition === 'hot') 
                               ? enhancedRide.weatherData.condition 
                               : undefined,
                      sensors: enhancedRide.sensorData.devices,
                      realTimeMetrics: {
                        currentSpeed: enhancedRide.analytics?.averageSpeed || 0,
                        heartRate: enhancedRide.sensorData.heartRate?.[0]?.heartRate,
                        power: enhancedRide.sensorData.power?.[0]?.power,
                        cadence: enhancedRide.sensorData.cadence?.[0]?.cadence,
                        batteryTemp: enhancedRide.batteryData?.temperature
                      },
                      weatherData: enhancedRide.weatherData,
                      insights: enhancedRide.insights
                    }
                    
                    setRides(prev => [newRide, ...prev])
                  } catch (error) {
                    console.error('Failed to stop ride:', error)
                  }
                }}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 animate-pulse"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                </svg>
                Stop Ride
              </button>
            )}
            
            {/* Current ride status */}
            {isRecording && currentRide && (
              <div className="text-sm text-green-600 dark:text-green-400">
                Recording... {currentRide.totalDistance.toFixed(1)} km
              </div>
            )}
          </div>

          {/* Traditional Controls */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Add Ride
            </button>
            
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value as 'all' | 'week' | 'month' | 'year')}
              className="p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              aria-label="Filter rides by time period"
            >
              <option value="all">All Time</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'distance' | 'duration')}
              className="p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              aria-label="Sort rides by"
            >
              <option value="date">Sort by Date</option>
              <option value="distance">Sort by Distance</option>
              <option value="duration">Sort by Duration</option>
            </select>
          </div>
        </div>
      </div>

      {/* Real-time Status Dashboard */}
      {isRecording && currentRide && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl shadow-lg p-6 mb-8 border-l-4 border-green-500">
          <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-4 flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            Live Ride Tracking
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
              <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                {currentRide.totalDistance.toFixed(1)} km
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Distance</div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
              <div className="text-xl font-bold text-green-600 dark:text-green-400">
                {currentRide.analytics?.averageSpeed?.toFixed(1) || '0.0'} km/h
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Avg Speed</div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
              <div className="text-xl font-bold text-orange-600 dark:text-orange-400">
                {currentRide.analytics?.maxSpeed?.toFixed(1) || '0.0'} km/h
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Max Speed</div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
              <div className="text-xl font-bold text-purple-600 dark:text-purple-400">
                {currentRide.batteryData?.currentLevel?.toFixed(0) || '100'}%
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Battery</div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
              <div className="text-xl font-bold text-red-600 dark:text-red-400">
                {currentRide.sensorData.heartRate?.[0]?.heartRate || '--'} bpm
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Heart Rate</div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
              <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                {currentRide.analytics?.elevationGain?.toFixed(0) || '0'} m
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Elevation</div>
            </div>
          </div>

          {/* Connected Sensors Status */}
          {connectedSensors.length > 0 && (
            <div className="mt-4 pt-4 border-t border-green-200 dark:border-green-800">
              <h4 className="text-sm font-medium text-green-700 dark:text-green-300 mb-2">
                Connected Sensors ({connectedSensors.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {connectedSensors.map((sensor, index) => (
                  <span 
                    key={sensor.id || index}
                    className="px-2 py-1 bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 rounded text-xs flex items-center gap-1"
                  >
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    {sensor.name} ({sensor.type})
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sensor Management */}
      {!isRecording && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
            </svg>
            Sensor Management
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Connected Sensors */}
            <div className="col-span-1 md:col-span-2 lg:col-span-1">
              <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Connected Sensors</h4>
              {connectedSensors.length > 0 ? (
                <div className="space-y-2">
                  {connectedSensors.map((sensor, index) => (
                    <div 
                      key={sensor.id || index}
                      className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div>
                          <div className="font-medium text-green-800 dark:text-green-200 text-sm">
                            {sensor.name}
                          </div>
                          <div className="text-xs text-green-600 dark:text-green-400">
                            {sensor.type} • {sensor.connection}
                          </div>
                        </div>
                      </div>
                      <button 
                        onClick={async () => {
                          try {
                            await sensorService.disconnectSensor(sensor.id)
                            setConnectedSensors(sensorService.getConnectedSensors())
                          } catch (error) {
                            console.error('Failed to disconnect sensor:', error)
                          }
                        }}
                        className="text-red-600 hover:text-red-700 text-xs px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        Disconnect
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm">No sensors connected</p>
                  <p className="text-xs mt-1">Connect Bluetooth devices to track more data</p>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div>
              <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Quick Actions</h4>
              <div className="space-y-2">
                <button 
                  onClick={async () => {
                    try {
                      const devices = await sensorService.scanBluetoothSensors()
                      console.log('Found devices:', devices)
                      // Here you would typically show a device selection modal
                    } catch (error) {
                      console.error('Failed to scan for sensors:', error)
                    }
                  }}
                  className="w-full flex items-center gap-2 p-3 text-left bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <div className="font-medium text-blue-700 dark:text-blue-300 text-sm">Scan for Bluetooth</div>
                    <div className="text-xs text-blue-600 dark:text-blue-400">Find nearby sensors</div>
                  </div>
                </button>
                
                <button 
                  onClick={async () => {
                    try {
                      await sensorService.startGPSTracking()
                      setConnectionStatus(prev => ({ ...prev, gps: true }))
                    } catch (error) {
                      console.error('Failed to start GPS:', error)
                    }
                  }}
                  disabled={connectionStatus.gps}
                  className="w-full flex items-center gap-2 p-3 text-left bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <div className="font-medium text-green-700 dark:text-green-300 text-sm">
                      {connectionStatus.gps ? 'GPS Active' : 'Enable GPS'}
                    </div>
                    <div className="text-xs text-green-600 dark:text-green-400">Track location data</div>
                  </div>
                </button>
              </div>
            </div>

            {/* System Status */}
            <div>
              <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">System Status</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Database</span>
                  <span className={`flex items-center gap-1 ${connectionStatus.database ? 'text-green-600' : 'text-red-600'}`}>
                    <div className={`w-2 h-2 rounded-full ${connectionStatus.database ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    {connectionStatus.database ? 'Connected' : 'Offline'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Network</span>
                  <span className={`flex items-center gap-1 ${connectionStatus.network ? 'text-green-600' : 'text-red-600'}`}>
                    <div className={`w-2 h-2 rounded-full ${connectionStatus.network ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    {connectionStatus.network ? 'Online' : 'Offline'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">GPS</span>
                  <span className={`flex items-center gap-1 ${connectionStatus.gps ? 'text-green-600' : 'text-gray-600'}`}>
                    <div className={`w-2 h-2 rounded-full ${connectionStatus.gps ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                    {connectionStatus.gps ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Sensors</span>
                  <span className="flex items-center gap-1 text-blue-600">
                    <div className={`w-2 h-2 rounded-full ${connectionStatus.sensors > 0 ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                    {connectionStatus.sensors} Connected
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Ride Form */}
      {(showAddForm || editingRide) && (
        <RideForm
          ride={editingRide}
          onSave={editingRide ? (data) => updateRide(editingRide.id, data) : addRide}
          onCancel={() => {
            setShowAddForm(false)
            setEditingRide(null)
          }}
        />
      )}

      {/* Rides List */}
      <div className="space-y-4">
        {filteredRides.map(ride => (
          <div key={ride.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <WeatherIcon weather={ride.weather} />
                  <AssistIcon level={ride.assistLevel} />
                  <span className="font-medium text-gray-800 dark:text-white">
                    {ride.date.toLocaleDateString()}
                  </span>
                  {ride.route && (
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      • {ride.route}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Distance:</span>
                    <span className="ml-1 font-medium">{ride.distance.toFixed(1)} km</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Duration:</span>
                    <span className="ml-1 font-medium">{Math.floor(ride.duration / 60)}h {ride.duration % 60}m</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Avg Speed:</span>
                    <span className="ml-1 font-medium">{ride.averageSpeed.toFixed(1)} km/h</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Battery Used:</span>
                    <span className="ml-1 font-medium">{ride.batteryUsed}%</span>
                  </div>
                </div>
                
                {/* Enhanced Data Display */}
                {ride.sensors && ride.sensors.length > 0 && (
                  <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Connected Sensors ({ride.sensors.length})
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {ride.sensors.map((sensor, index) => (
                        <span 
                          key={sensor.id || index}
                          className="px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded text-xs"
                        >
                          {sensor.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Real-time Metrics */}
                {ride.realTimeMetrics && (
                  <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                    {ride.realTimeMetrics.heartRate && (
                      <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded">
                        <span className="text-red-600 dark:text-red-400 font-medium">
                          {ride.realTimeMetrics.heartRate} bpm
                        </span>
                        <div className="text-gray-500 dark:text-gray-400">Heart Rate</div>
                      </div>
                    )}
                    {ride.realTimeMetrics.power && (
                      <div className="bg-orange-50 dark:bg-orange-900/20 p-2 rounded">
                        <span className="text-orange-600 dark:text-orange-400 font-medium">
                          {ride.realTimeMetrics.power} W
                        </span>
                        <div className="text-gray-500 dark:text-gray-400">Power</div>
                      </div>
                    )}
                    {ride.realTimeMetrics.cadence && (
                      <div className="bg-purple-50 dark:bg-purple-900/20 p-2 rounded">
                        <span className="text-purple-600 dark:text-purple-400 font-medium">
                          {ride.realTimeMetrics.cadence} rpm
                        </span>
                        <div className="text-gray-500 dark:text-gray-400">Cadence</div>
                      </div>
                    )}
                    {ride.weatherData && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                        <span className="text-blue-600 dark:text-blue-400 font-medium">
                          {ride.weatherData.temperature}°C
                        </span>
                        <div className="text-gray-500 dark:text-gray-400">Temperature</div>
                      </div>
                    )}
                  </div>
                )}

                {/* AI Insights */}
                {ride.insights && (
                  <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <h4 className="text-xs font-medium text-green-700 dark:text-green-300 mb-2 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                      </svg>
                      AI Insights
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs mb-2">
                      <div>
                        <span className="text-green-600 dark:text-green-400 font-medium">
                          {ride.insights.efficiency.toFixed(1)}%
                        </span>
                        <div className="text-gray-500 dark:text-gray-400">Efficiency</div>
                      </div>
                      <div>
                        <span className="text-green-600 dark:text-green-400 font-medium">
                          {ride.insights.co2Saved.toFixed(1)} kg
                        </span>
                        <div className="text-gray-500 dark:text-gray-400">CO₂ Saved</div>
                      </div>
                      <div>
                        <span className="text-orange-600 dark:text-orange-400 font-medium">
                          {ride.insights.calories.toFixed(0)} cal
                        </span>
                        <div className="text-gray-500 dark:text-gray-400">Calories</div>
                      </div>
                      <div>
                        <span className="text-blue-600 dark:text-blue-400 font-medium">
                          {ride.insights.routeRating.toFixed(1)}/10
                        </span>
                        <div className="text-gray-500 dark:text-gray-400">Route Rating</div>
                      </div>
                    </div>
                    {ride.insights.recommendations.length > 0 && (
                      <div className="text-xs text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-800 p-2 rounded">
                        <strong>Recommendations:</strong> {ride.insights.recommendations.slice(0, 2).join('. ')}
                        {ride.insights.recommendations.length > 2 && '...'}
                      </div>
                    )}
                  </div>
                )}

                {ride.notes && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    {ride.notes}
                  </p>
                )}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setEditingRide(ride)}
                  className="text-blue-600 hover:text-blue-700 text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteRide(ride.id)}
                  className="text-red-600 hover:text-red-700 text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
            
            {/* Battery Usage Visualization */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                <span>Battery: {ride.batteryStart}% → {ride.batteryEnd}%</span>
                <span>Used: {ride.batteryUsed}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full relative"
                  style={{ width: `${Math.min(100, ride.batteryStart)}%` }}
                >
                  <div 
                    className="absolute top-0 right-0 h-2 bg-red-400 rounded-r-full"
                    style={{ 
                      width: `${Math.min(100, (ride.batteryUsed / Math.max(1, ride.batteryStart)) * 100)}%`
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {filteredRides.length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
            <div className="text-4xl mb-4">🚴‍♂️</div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
              No rides recorded yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Start tracking your e-bike adventures!
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Add Your First Ride
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// Ride Form Component
function RideForm({ 
  ride, 
  onSave, 
  onCancel 
}: { 
  ride?: Ride | null
  onSave: (data: Omit<Ride, 'id'>) => void
  onCancel: () => void 
}) {
  const [formData, setFormData] = useState({
    date: ride?.date?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
    duration: ride?.duration || 0,
    distance: ride?.distance || 0,
    averageSpeed: ride?.averageSpeed || 0,
    maxSpeed: ride?.maxSpeed || 0,
    elevation: ride?.elevation || 0,
    batteryStart: ride?.batteryStart || 100,
    batteryEnd: ride?.batteryEnd || 80,
    batteryUsed: ride?.batteryUsed || 20,
    route: ride?.route || '',
    notes: ride?.notes || '',
    weather: ride?.weather || 'sunny',
    assistLevel: ride?.assistLevel || 'tour'
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    onSave({
      ...formData,
      date: new Date(formData.date),
      batteryUsed: formData.batteryStart - formData.batteryEnd
    })
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
        {ride ? 'Edit Ride' : 'Add New Ride'}
      </h3>
      
      <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Date
          </label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
            className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            aria-label="Ride date"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Duration (minutes)
          </label>
          <input
            type="number"
            value={formData.duration}
            onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
            className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            aria-label="Duration in minutes"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Distance (km)
          </label>
          <input
            type="number"
            step="0.1"
            value={formData.distance}
            onChange={(e) => setFormData(prev => ({ ...prev, distance: parseFloat(e.target.value) || 0 }))}
            className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            aria-label="Distance in kilometers"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Average Speed (km/h)
          </label>
          <input
            type="number"
            step="0.1"
            value={formData.averageSpeed}
            onChange={(e) => setFormData(prev => ({ ...prev, averageSpeed: parseFloat(e.target.value) || 0 }))}
            className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            aria-label="Average speed in kilometers per hour"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Battery Start (%)
          </label>
          <input
            type="number"
            min="0"
            max="100"
            value={formData.batteryStart}
            onChange={(e) => setFormData(prev => ({ ...prev, batteryStart: parseInt(e.target.value) || 0 }))}
            className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            aria-label="Battery level at start of ride"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Battery End (%)
          </label>
          <input
            type="number"
            min="0"
            max="100"
            value={formData.batteryEnd}
            onChange={(e) => setFormData(prev => ({ ...prev, batteryEnd: parseInt(e.target.value) || 0 }))}
            className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            aria-label="Battery level at end of ride"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Weather
          </label>
          <select
            value={formData.weather}
            onChange={(e) => setFormData(prev => ({ ...prev, weather: e.target.value as 'sunny' | 'cloudy' | 'rainy' | 'windy' | 'cold' | 'hot' }))}
            className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            aria-label="Weather conditions"
          >
            <option value="sunny">☀️ Sunny</option>
            <option value="cloudy">☁️ Cloudy</option>
            <option value="rainy">🌧️ Rainy</option>
            <option value="windy">💨 Windy</option>
            <option value="cold">❄️ Cold</option>
            <option value="hot">🔥 Hot</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Assist Level
          </label>
          <select
            value={formData.assistLevel}
            onChange={(e) => setFormData(prev => ({ ...prev, assistLevel: e.target.value as 'eco' | 'tour' | 'sport' | 'turbo' | 'off' }))}
            className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            aria-label="Assist level used"
          >
            <option value="off">🚴 Off</option>
            <option value="eco">🌱 Eco</option>
            <option value="tour">🚵 Tour</option>
            <option value="sport">⚡ Sport</option>
            <option value="turbo">🚀 Turbo</option>
          </select>
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Route/Location
          </label>
          <input
            type="text"
            value={formData.route}
            onChange={(e) => setFormData(prev => ({ ...prev, route: e.target.value }))}
            placeholder="e.g. Downtown loop, Mountain trail"
            className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Notes
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            rows={3}
            placeholder="How was the ride? Any observations?"
            className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
        
        <div className="md:col-span-2 flex space-x-4">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            {ride ? 'Update Ride' : 'Save Ride'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

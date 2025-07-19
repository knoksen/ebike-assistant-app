import { useState, useEffect } from 'react'

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
}

export function RideTracker() {
  const [rides, setRides] = useState<Ride[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingRide, setEditingRide] = useState<Ride | null>(null)
  const [sortBy, setSortBy] = useState<'date' | 'distance' | 'duration'>('date')
  const [filterBy, setFilterBy] = useState<'all' | 'week' | 'month' | 'year'>('all')

  // Load rides from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('ebike-rides')
    if (saved) {
      const parsed = JSON.parse(saved) as Array<Omit<Ride, 'date'> & { date: string }>
      setRides(parsed.map((r) => ({
        ...r,
        date: new Date(r.date)
      })))
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
        totalBatteryUsed: 0
      }
    }

    const totalDistance = filteredRides.reduce((sum, r) => sum + r.distance, 0)
    const totalDuration = filteredRides.reduce((sum, r) => sum + r.duration, 0)
    const totalBatteryUsed = filteredRides.reduce((sum, r) => sum + r.batteryUsed, 0)

    return {
      totalRides: filteredRides.length,
      totalDistance,
      totalDuration,
      averageDistance: totalDistance / filteredRides.length,
      averageSpeed: filteredRides.reduce((sum, r) => sum + r.averageSpeed, 0) / filteredRides.length,
      longestRide: Math.max(...filteredRides.map(r => r.distance)),
      fastestRide: Math.max(...filteredRides.map(r => r.maxSpeed)),
      totalBatteryUsed
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
        <div className="flex flex-wrap items-center justify-between gap-4">
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

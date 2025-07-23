import { useState, useEffect } from 'react'
import { sensorService } from '../services/SensorService'
import { useTheme } from '../context/useTheme'
import type { Theme } from '../context/themeTypes'

type UserSettings = {
  units: 'metric' | 'imperial'
  language: 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'nl' | 'ja' | 'zh'
  notifications: boolean
  autoSave: boolean
  theme: 'light' | 'dark' | 'auto' | 'midnight' | 'forest' | 'ocean'
  privacy: {
    shareData: boolean
    analytics: boolean
    crashReports: boolean
    location: boolean
  }
  performance: {
    highFrameRate: boolean
    reduceAnimations: boolean
    offlineMode: boolean
    backgroundSync: boolean
  }
  sensors: {
    autoConnect: boolean
    reconnectInterval: number
    dataRetention: number
    calibrationAlerts: boolean
  }
  ai: {
    enableInsights: boolean
    personalizedRecommendations: boolean
    predictiveAnalytics: boolean
    voiceCommands: boolean
  }
  bikeProfile: {
    make?: string
    model?: string
    year?: number
    type?: 'mountain' | 'road' | 'hybrid' | 'commuter' | 'cargo' | 'ebike' | 'touring'
    motorType?: 'hub' | 'mid-drive' | 'none'
    batteryCapacity?: number
    purchaseDate?: string
    weight?: number
    wheelSize?: string
    gears?: number
    color?: string
    customName?: string
  }
  advanced: {
    developerMode: boolean
    debugLogs: boolean
    experimentalFeatures: boolean
    apiEndpoint?: string
    syncInterval: number
  }
}

const DEFAULT_SETTINGS: UserSettings = {
  units: 'metric',
  language: 'en',
  notifications: true,
  autoSave: true,
  theme: 'auto',
  privacy: {
    shareData: false,
    analytics: true,
    crashReports: true,
    location: true
  },
  performance: {
    highFrameRate: true,
    reduceAnimations: false,
    offlineMode: false,
    backgroundSync: true
  },
  sensors: {
    autoConnect: true,
    reconnectInterval: 30,
    dataRetention: 90,
    calibrationAlerts: true
  },
  ai: {
    enableInsights: true,
    personalizedRecommendations: true,
    predictiveAnalytics: false,
    voiceCommands: false
  },
  bikeProfile: {},
  advanced: {
    developerMode: false,
    debugLogs: false,
    experimentalFeatures: false,
    syncInterval: 300
  }
}

// Modern Toggle Switch Component
const ToggleSwitch = ({ enabled, onChange, label }: { 
  enabled: boolean
  onChange: (value: boolean) => void 
  label: string
}) => (
  <label className="flex items-center justify-between cursor-pointer group">
    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
      {label}
    </span>
    <div
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out ${
        enabled ? 'bg-gradient-to-r from-blue-600 to-purple-600' : 'bg-gray-300 dark:bg-gray-600'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform duration-200 ease-in-out ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </div>
  </label>
)

// Advanced Slider Component
const SliderControl = ({ value, onChange, min, max, step = 1, label, unit }: {
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  step?: number
  label: string
  unit: string
}) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
      <span className="text-sm text-blue-600 dark:text-blue-400 font-mono">{value}{unit}</span>
    </div>
    <div className="relative">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-gradient-to-r from-blue-200 to-purple-200 dark:from-blue-800 dark:to-purple-800 rounded-lg appearance-none cursor-pointer slider"
        aria-label={label}
      />
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(45deg, #3b82f6, #8b5cf6);
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(45deg, #3b82f6, #8b5cf6);
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
      `}</style>
    </div>
  </div>
)

export default function Settings() {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS)
  const [hasChanges, setHasChanges] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [connectedSensors, setConnectedSensors] = useState<any[]>([])
  const [isScanning, setIsScanning] = useState(false)
  const [sensorStatus, setSensorStatus] = useState<string>('Ready')

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('ebike-assistant-settings')
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        setSettings({ ...DEFAULT_SETTINGS, ...parsed })
      } catch (error) {
        console.error('Failed to load settings:', error)
      }
    }
  }, [])

  // Save settings to localStorage
  const saveSettings = () => {
    setSaveStatus('saving')
    try {
      localStorage.setItem('ebike-assistant-settings', JSON.stringify(settings))
      setHasChanges(false)
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2000)
    } catch (error) {
      console.error('Failed to save settings:', error)
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 2000)
    }
  }

  const updateSettings = (updates: Partial<UserSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }))
    setHasChanges(true)
  }

  const updateBikeProfile = (updates: Partial<UserSettings['bikeProfile']>) => {
    setSettings(prev => ({
      ...prev,
      bikeProfile: { ...prev.bikeProfile, ...updates }
    }))
    setHasChanges(true)
  }

  const resetSettings = () => {
    if (confirm('Are you sure you want to reset all settings to defaults?')) {
      setSettings(DEFAULT_SETTINGS)
      setHasChanges(true)
    }
  }

  const exportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = 'ebike-assistant-settings.json'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const importSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string)
        setSettings({ ...DEFAULT_SETTINGS, ...imported })
        setHasChanges(true)
        alert('Settings imported successfully!')
      } catch (error) {
        alert('Failed to import settings. Please check the file format.')
      }
    }
    reader.readAsText(file)
  }

  const scanForSensors = async () => {
    setIsScanning(true)
    setSensorStatus('Scanning for sensors...')
    
    try {
      const sensors = await sensorService.scanBluetoothSensors()
      setConnectedSensors(sensors)
      setSensorStatus(`Found ${sensors.length} sensor(s)`)
    } catch (error) {
      console.error('Failed to scan sensors:', error)
      setSensorStatus('Failed to scan sensors. Check Bluetooth permissions.')
    } finally {
      setIsScanning(false)
    }
  }

  const disconnectSensor = async (sensorId: string) => {
    try {
      await sensorService.disconnectSensor(sensorId)
      setConnectedSensors(prev => prev.filter(sensor => sensor.id !== sensorId))
    } catch (error) {
      console.error('Failed to disconnect sensor:', error)
    }
  }

  const loadConnectedSensors = () => {
    const sensors = sensorService.getConnectedSensors()
    setConnectedSensors(sensors)
  }

  useEffect(() => {
    loadConnectedSensors()
  }, [])

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
          ⚙️ Settings & Preferences
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Customize your E-Bike Assistant experience
        </p>
      </div>

      <div className="space-y-8">
        {/* General Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
            General Settings
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Units
              </label>
              <select
                value={settings.units}
                onChange={(e) => updateSettings({ units: e.target.value as 'metric' | 'imperial' })}
                className="w-full p-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="metric">Metric (km, kg, °C)</option>
                <option value="imperial">Imperial (miles, lbs, °F)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Language
              </label>
              <select
                value={settings.language}
                onChange={(e) => updateSettings({ language: e.target.value as any })}
                className="w-full p-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Theme
              </label>
              <select
                value={settings.theme}
                onChange={(e) => updateSettings({ theme: e.target.value as any })}
                className="w-full p-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="auto">Auto (System)</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>

            <div className="flex items-center space-x-4">
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.notifications}
                    onChange={(e) => updateSettings({ notifications: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Enable notifications
                  </span>
                </label>
              </div>
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.autoSave}
                    onChange={(e) => updateSettings({ autoSave: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Auto-save data
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Bike Profile */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
            Your E-Bike Profile
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Make/Brand
              </label>
              <input
                type="text"
                value={settings.bikeProfile.make || ''}
                onChange={(e) => updateBikeProfile({ make: e.target.value })}
                placeholder="e.g. Trek, Specialized, Rad Power"
                className="w-full p-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Model
              </label>
              <input
                type="text"
                value={settings.bikeProfile.model || ''}
                onChange={(e) => updateBikeProfile({ model: e.target.value })}
                placeholder="e.g. Verve+, Turbo Vado"
                className="w-full p-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Year
              </label>
              <input
                type="number"
                min="2010"
                max="2025"
                value={settings.bikeProfile.year || ''}
                onChange={(e) => updateBikeProfile({ year: parseInt(e.target.value) || undefined })}
                className="w-full p-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Bike Type
              </label>
              <select
                value={settings.bikeProfile.type || ''}
                onChange={(e) => updateBikeProfile({ type: e.target.value as any })}
                className="w-full p-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Select type...</option>
                <option value="mountain">Mountain</option>
                <option value="road">Road</option>
                <option value="hybrid">Hybrid</option>
                <option value="commuter">Commuter</option>
                <option value="cargo">Cargo</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Motor Type
              </label>
              <select
                value={settings.bikeProfile.motorType || ''}
                onChange={(e) => updateBikeProfile({ motorType: e.target.value as any })}
                className="w-full p-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Select motor type...</option>
                <option value="mid-drive">Mid-drive</option>
                <option value="hub">Hub motor</option>
                <option value="none">No motor (traditional bike)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Battery Capacity ({settings.units === 'metric' ? 'Wh' : 'Wh'})
              </label>
              <input
                type="number"
                min="200"
                max="2000"
                step="50"
                value={settings.bikeProfile.batteryCapacity || ''}
                onChange={(e) => updateBikeProfile({ batteryCapacity: parseInt(e.target.value) || undefined })}
                placeholder="e.g. 500, 750, 1000"
                className="w-full p-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Purchase Date
              </label>
              <input
                type="date"
                value={settings.bikeProfile.purchaseDate || ''}
                onChange={(e) => updateBikeProfile({ purchaseDate: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Sensor Management */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
            Sensor Management
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Bluetooth Sensors</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Connect speed, cadence, power, and heart rate sensors</p>
              </div>
              <button
                onClick={() => scanForSensors()}
                disabled={isScanning}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  isScanning 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {isScanning ? 'Scanning...' : 'Scan for Sensors'}
              </button>
            </div>

            <div className="space-y-2">
              {connectedSensors.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">No sensors connected</p>
              ) : (
                connectedSensors.map((sensor) => (
                  <div key={sensor.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white">{sensor.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {sensor.type} • {sensor.capabilities.join(', ')}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        sensor.connectionStatus === 'connected' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                          : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                      }`}>
                        {sensor.connectionStatus}
                      </span>
                      <button
                        onClick={() => disconnectSensor(sensor.id)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400"
                      >
                        Disconnect
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <ToggleSwitch
                enabled={settings.sensors.autoConnect}
                onChange={(value) => updateSettings({ sensors: { ...settings.sensors, autoConnect: value } })}
                label="Auto-connect to known sensors"
              />
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
            Data Management
          </h2>
          
          <div className="flex flex-wrap gap-4">
            <button
              onClick={exportSettings}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Export Settings
            </button>
            
            <label className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors cursor-pointer">
              Import Settings
              <input
                type="file"
                accept=".json"
                onChange={importSettings}
                className="hidden"
              />
            </label>
            
            <button
              onClick={resetSettings}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Reset to Defaults
            </button>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-center">
          <button
            onClick={saveSettings}
            disabled={!hasChanges || saveStatus === 'saving'}
            className={`px-8 py-3 rounded-lg font-medium transition-colors ${
              hasChanges
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed'
            }`}
          >
            {saveStatus === 'saving' && '⏳ Saving...'}
            {saveStatus === 'saved' && '✅ Saved!'}
            {saveStatus === 'error' && '❌ Error'}
            {saveStatus === 'idle' && (hasChanges ? 'Save Settings' : 'No Changes')}
          </button>
        </div>
      </div>
    </div>
  )
}

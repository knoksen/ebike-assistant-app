import { useState, useEffect } from 'react'
import { sensorService } from '../services/SensorService'

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

export function Settings() {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS)
  const [hasChanges, setHasChanges] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [activeTab, setActiveTab] = useState('general')
  const [searchQuery, setSearchQuery] = useState('')
  const [systemStats, setSystemStats] = useState({
    storage: { used: 0, total: 0 },
    sensors: { connected: 0, total: 0 },
    sync: { lastSync: null as Date | null, status: 'connected' as 'connected' | 'offline' | 'syncing' },
    performance: { cpu: 0, memory: 0 }
  })

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

    // Initialize system stats
    updateSystemStats()
    const interval = setInterval(updateSystemStats, 5000)
    return () => clearInterval(interval)
  }, [])

  const updateSystemStats = async () => {
    try {
      // Simulate system stats (in real app, these would come from actual APIs)
      const storage = await navigator.storage?.estimate() || { usage: 0, quota: 0 }
      const sensors = sensorService.getConnectedSensors()
      
      setSystemStats({
        storage: { 
          used: storage.usage || Math.random() * 50000000, 
          total: storage.quota || 1000000000 
        },
        sensors: { 
          connected: sensors.length, 
          total: sensors.length + Math.floor(Math.random() * 3) 
        },
        sync: { 
          lastSync: new Date(), 
          status: navigator.onLine ? 'connected' : 'offline'
        },
        performance: {
          cpu: Math.random() * 100,
          memory: Math.random() * 100
        }
      })
    } catch (error) {
      console.error('Failed to update system stats:', error)
    }
  }

  // Save settings to localStorage and services
  const saveSettings = async () => {
    setSaveStatus('saving')
    try {
      localStorage.setItem('ebike-assistant-settings', JSON.stringify(settings))
      
      // Apply theme settings immediately
      if (settings.theme !== 'auto') {
        const isDark = settings.theme === 'dark' || settings.theme === 'midnight'
        document.documentElement.classList.toggle('dark', isDark)
        
        // Apply custom theme classes
        const themes = ['midnight', 'forest', 'ocean']
        themes.forEach(theme => {
          document.documentElement.classList.toggle(`theme-${theme}`, settings.theme === theme)
        })
      }
      
      // Simulate API sync
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      setSaveStatus('saved')
      setHasChanges(false)
      
      setTimeout(() => setSaveStatus('idle'), 3000)
    } catch (error) {
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 3000)
    }
  }

  const updateSettings = (updates: Partial<UserSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }))
    setHasChanges(true)
  }

  const updateNestedSettings = <K extends keyof UserSettings>(
    key: K,
    updates: Partial<UserSettings[K]>
  ) => {
    setSettings(prev => ({
      ...prev,
      [key]: { ...prev[key], ...updates }
    }))
    setHasChanges(true)
  }

  const tabs = [
    { id: 'general', name: 'General', icon: '⚙️' },
    { id: 'bike', name: 'Bike Profile', icon: '🚴' },
    { id: 'sensors', name: 'Sensors', icon: '📡' },
    { id: 'ai', name: 'AI & Analytics', icon: '🤖' },
    { id: 'privacy', name: 'Privacy', icon: '🔒' },
    { id: 'performance', name: 'Performance', icon: '⚡' },
    { id: 'advanced', name: 'Advanced', icon: '🔧' }
  ]

  const filteredTabs = searchQuery 
    ? tabs.filter(tab => tab.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : tabs

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-8">
            {/* Language & Units */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-3">
                <span className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                  🌐
                </span>
                Language & Regional Settings
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Display Language
                  </label>
                  <select
                    value={settings.language}
                    onChange={(e) => updateSettings({ language: e.target.value as UserSettings['language'] })}
                    className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    aria-label="Select display language"
                  >
                    <option value="en">🇺🇸 English</option>
                    <option value="es">🇪🇸 Español</option>
                    <option value="fr">🇫🇷 Français</option>
                    <option value="de">🇩🇪 Deutsch</option>
                    <option value="it">🇮🇹 Italiano</option>
                    <option value="pt">🇵🇹 Português</option>
                    <option value="nl">🇳🇱 Nederlands</option>
                    <option value="ja">🇯🇵 日本語</option>
                    <option value="zh">🇨🇳 中文</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Measurement Units
                  </label>
                  <select
                    value={settings.units}
                    onChange={(e) => updateSettings({ units: e.target.value as UserSettings['units'] })}
                    className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    aria-label="Select measurement units"
                  >
                    <option value="metric">📏 Metric (km, kg, °C)</option>
                    <option value="imperial">📐 Imperial (mi, lb, °F)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Theme Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-3">
                <span className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  🎨
                </span>
                Appearance & Theme
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {[
                  { value: 'light', name: 'Light', preview: 'bg-white border-gray-200', icon: '☀️' },
                  { value: 'dark', name: 'Dark', preview: 'bg-gray-800 border-gray-600', icon: '🌙' },
                  { value: 'auto', name: 'Auto', preview: 'bg-gradient-to-br from-white to-gray-800', icon: '🔄' },
                  { value: 'midnight', name: 'Midnight', preview: 'bg-gray-900 border-blue-500', icon: '🌌' },
                  { value: 'forest', name: 'Forest', preview: 'bg-green-800 border-green-400', icon: '🌲' },
                  { value: 'ocean', name: 'Ocean', preview: 'bg-blue-800 border-cyan-400', icon: '🌊' }
                ].map(theme => (
                  <button
                    key={theme.value}
                    onClick={() => updateSettings({ theme: theme.value as UserSettings['theme'] })}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                      settings.theme === theme.value
                        ? 'border-blue-500 ring-2 ring-blue-200 scale-105'
                        : 'border-gray-200 dark:border-gray-600 hover:border-blue-300'
                    }`}
                  >
                    <div className={`w-full h-16 rounded-lg mb-3 ${theme.preview} border`}></div>
                    <div className="text-center">
                      <div className="text-xl mb-1">{theme.icon}</div>
                      <div className="text-xs font-medium text-gray-700 dark:text-gray-300">{theme.name}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* General Preferences */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-3">
                <span className="w-8 h-8 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg flex items-center justify-center">
                  🔔
                </span>
                General Preferences
              </h3>
              
              <div className="space-y-6">
                <ToggleSwitch
                  enabled={settings.notifications}
                  onChange={(value) => updateSettings({ notifications: value })}
                  label="Enable Notifications"
                />
                <ToggleSwitch
                  enabled={settings.autoSave}
                  onChange={(value) => updateSettings({ autoSave: value })}
                  label="Auto-Save Settings"
                />
              </div>
            </div>
          </div>
        )

      case 'bike':
        return (
          <div className="space-y-8">
            {/* Bike Identity */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-3">
                <span className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                  🚴
                </span>
                Bike Identity & Specifications
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Custom Bike Name
                  </label>
                  <input
                    type="text"
                    value={settings.bikeProfile.customName || ''}
                    onChange={(e) => updateNestedSettings('bikeProfile', { customName: e.target.value })}
                    placeholder="e.g., Lightning Bolt, Green Machine"
                    className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Color
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={settings.bikeProfile.color || '#3B82F6'}
                      onChange={(e) => updateNestedSettings('bikeProfile', { color: e.target.value })}
                      className="w-12 h-12 rounded-lg border border-gray-200 dark:border-gray-600"
                      aria-label="Select bike color"
                    />
                    <input
                      type="text"
                      value={settings.bikeProfile.color || ''}
                      onChange={(e) => updateNestedSettings('bikeProfile', { color: e.target.value })}
                      placeholder="#3B82F6"
                      className="flex-1 p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Make
                  </label>
                  <input
                    type="text"
                    value={settings.bikeProfile.make || ''}
                    onChange={(e) => updateNestedSettings('bikeProfile', { make: e.target.value })}
                    placeholder="e.g., Trek, Specialized, Giant"
                    className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Model
                  </label>
                  <input
                    type="text"
                    value={settings.bikeProfile.model || ''}
                    onChange={(e) => updateNestedSettings('bikeProfile', { model: e.target.value })}
                    placeholder="e.g., Powerfly 5, Turbo Vado"
                    className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Year
                  </label>
                  <input
                    type="number"
                    value={settings.bikeProfile.year || ''}
                    onChange={(e) => updateNestedSettings('bikeProfile', { year: parseInt(e.target.value) || undefined })}
                    min="1980"
                    max={new Date().getFullYear() + 1}
                    placeholder={new Date().getFullYear().toString()}
                    className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Type
                  </label>
                  <select
                    value={settings.bikeProfile.type || ''}
                    onChange={(e) => updateNestedSettings('bikeProfile', { type: e.target.value as UserSettings['bikeProfile']['type'] })}
                    className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    aria-label="Select bike type"
                  >
                    <option value="">Select bike type...</option>
                    <option value="mountain">🏔️ Mountain Bike</option>
                    <option value="road">🏁 Road Bike</option>
                    <option value="hybrid">🚴 Hybrid Bike</option>
                    <option value="commuter">🏢 Commuter Bike</option>
                    <option value="cargo">📦 Cargo Bike</option>
                    <option value="ebike">⚡ E-Bike</option>
                    <option value="touring">🗺️ Touring Bike</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Technical Specifications */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-3">
                <span className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                  ⚡
                </span>
                Technical Specifications
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Motor Type
                  </label>
                  <select
                    value={settings.bikeProfile.motorType || ''}
                    onChange={(e) => updateNestedSettings('bikeProfile', { motorType: e.target.value as UserSettings['bikeProfile']['motorType'] })}
                    className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    aria-label="Select motor type"
                  >
                    <option value="none">No Motor</option>
                    <option value="hub">Hub Motor</option>
                    <option value="mid-drive">Mid-Drive Motor</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Battery Capacity (Wh)
                  </label>
                  <input
                    type="number"
                    value={settings.bikeProfile.batteryCapacity || ''}
                    onChange={(e) => updateNestedSettings('bikeProfile', { batteryCapacity: parseInt(e.target.value) || undefined })}
                    placeholder="500"
                    min="200"
                    max="2000"
                    step="50"
                    className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    value={settings.bikeProfile.weight || ''}
                    onChange={(e) => updateNestedSettings('bikeProfile', { weight: parseFloat(e.target.value) || undefined })}
                    placeholder="15.5"
                    min="5"
                    max="50"
                    step="0.1"
                    className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Wheel Size
                  </label>
                  <select
                    value={settings.bikeProfile.wheelSize || ''}
                    onChange={(e) => updateNestedSettings('bikeProfile', { wheelSize: e.target.value })}
                    className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    aria-label="Select wheel size"
                  >
                    <option value="">Select wheel size...</option>
                    <option value="26">26"</option>
                    <option value="27.5">27.5"</option>
                    <option value="29">29"</option>
                    <option value="700c">700c</option>
                    <option value="650b">650b</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Number of Gears
                  </label>
                  <input
                    type="number"
                    value={settings.bikeProfile.gears || ''}
                    onChange={(e) => updateNestedSettings('bikeProfile', { gears: parseInt(e.target.value) || undefined })}
                    placeholder="21"
                    min="1"
                    max="30"
                    className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Purchase Date
                  </label>
                  <input
                    type="date"
                    value={settings.bikeProfile.purchaseDate || ''}
                    onChange={(e) => updateNestedSettings('bikeProfile', { purchaseDate: e.target.value })}
                    className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>
          </div>
        )

      case 'sensors':
        return (
          <div className="space-y-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-3">
                <span className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                  📡
                </span>
                Sensor Configuration
              </h3>
              
              <div className="space-y-6">
                <ToggleSwitch
                  enabled={settings.sensors.autoConnect}
                  onChange={(value) => updateNestedSettings('sensors', { autoConnect: value })}
                  label="Auto-Connect to Known Sensors"
                />
                
                <ToggleSwitch
                  enabled={settings.sensors.calibrationAlerts}
                  onChange={(value) => updateNestedSettings('sensors', { calibrationAlerts: value })}
                  label="Calibration Reminders"
                />

                <SliderControl
                  value={settings.sensors.reconnectInterval}
                  onChange={(value) => updateNestedSettings('sensors', { reconnectInterval: value })}
                  min={5}
                  max={120}
                  step={5}
                  label="Reconnection Interval"
                  unit="s"
                />

                <SliderControl
                  value={settings.sensors.dataRetention}
                  onChange={(value) => updateNestedSettings('sensors', { dataRetention: value })}
                  min={7}
                  max={365}
                  step={7}
                  label="Data Retention Period"
                  unit=" days"
                />
              </div>
            </div>
          </div>
        )

      case 'ai':
        return (
          <div className="space-y-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-3">
                <span className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  🤖
                </span>
                AI & Analytics Settings
              </h3>
              
              <div className="space-y-6">
                <ToggleSwitch
                  enabled={settings.ai.enableInsights}
                  onChange={(value) => updateNestedSettings('ai', { enableInsights: value })}
                  label="Enable AI Insights"
                />
                
                <ToggleSwitch
                  enabled={settings.ai.personalizedRecommendations}
                  onChange={(value) => updateNestedSettings('ai', { personalizedRecommendations: value })}
                  label="Personalized Recommendations"
                />
                
                <ToggleSwitch
                  enabled={settings.ai.predictiveAnalytics}
                  onChange={(value) => updateNestedSettings('ai', { predictiveAnalytics: value })}
                  label="Predictive Analytics (Beta)"
                />
                
                <ToggleSwitch
                  enabled={settings.ai.voiceCommands}
                  onChange={(value) => updateNestedSettings('ai', { voiceCommands: value })}
                  label="Voice Commands (Experimental)"
                />
              </div>
            </div>
          </div>
        )

      case 'privacy':
        return (
          <div className="space-y-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-3">
                <span className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center">
                  🔒
                </span>
                Privacy & Data Control
              </h3>
              
              <div className="space-y-6">
                <ToggleSwitch
                  enabled={settings.privacy.shareData}
                  onChange={(value) => updateNestedSettings('privacy', { shareData: value })}
                  label="Share Anonymous Usage Data"
                />
                
                <ToggleSwitch
                  enabled={settings.privacy.analytics}
                  onChange={(value) => updateNestedSettings('privacy', { analytics: value })}
                  label="Enable Analytics"
                />
                
                <ToggleSwitch
                  enabled={settings.privacy.crashReports}
                  onChange={(value) => updateNestedSettings('privacy', { crashReports: value })}
                  label="Send Crash Reports"
                />
                
                <ToggleSwitch
                  enabled={settings.privacy.location}
                  onChange={(value) => updateNestedSettings('privacy', { location: value })}
                  label="Location Services"
                />
              </div>
            </div>
          </div>
        )

      case 'performance':
        return (
          <div className="space-y-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-3">
                <span className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                  ⚡
                </span>
                Performance Optimization
              </h3>
              
              <div className="space-y-6">
                <ToggleSwitch
                  enabled={settings.performance.highFrameRate}
                  onChange={(value) => updateNestedSettings('performance', { highFrameRate: value })}
                  label="High Frame Rate Mode"
                />
                
                <ToggleSwitch
                  enabled={settings.performance.reduceAnimations}
                  onChange={(value) => updateNestedSettings('performance', { reduceAnimations: value })}
                  label="Reduce Animations"
                />
                
                <ToggleSwitch
                  enabled={settings.performance.offlineMode}
                  onChange={(value) => updateNestedSettings('performance', { offlineMode: value })}
                  label="Offline Mode"
                />
                
                <ToggleSwitch
                  enabled={settings.performance.backgroundSync}
                  onChange={(value) => updateNestedSettings('performance', { backgroundSync: value })}
                  label="Background Synchronization"
                />
              </div>
            </div>
          </div>
        )

      case 'advanced':
        return (
          <div className="space-y-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-3">
                <span className="w-8 h-8 bg-gradient-to-r from-gray-600 to-gray-800 rounded-lg flex items-center justify-center">
                  🔧
                </span>
                Advanced Developer Settings
              </h3>
              
              <div className="space-y-6">
                <ToggleSwitch
                  enabled={settings.advanced.developerMode}
                  onChange={(value) => updateNestedSettings('advanced', { developerMode: value })}
                  label="Developer Mode"
                />
                
                <ToggleSwitch
                  enabled={settings.advanced.debugLogs}
                  onChange={(value) => updateNestedSettings('advanced', { debugLogs: value })}
                  label="Debug Logging"
                />
                
                <ToggleSwitch
                  enabled={settings.advanced.experimentalFeatures}
                  onChange={(value) => updateNestedSettings('advanced', { experimentalFeatures: value })}
                  label="Experimental Features"
                />

                <SliderControl
                  value={settings.advanced.syncInterval}
                  onChange={(value) => updateNestedSettings('advanced', { syncInterval: value })}
                  min={60}
                  max={3600}
                  step={60}
                  label="Sync Interval"
                  unit="s"
                />

                {settings.advanced.developerMode && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Custom API Endpoint
                    </label>
                    <input
                      type="url"
                      value={settings.advanced.apiEndpoint || ''}
                      onChange={(e) => updateNestedSettings('advanced', { apiEndpoint: e.target.value })}
                      placeholder="https://api.example.com"
                      className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono text-sm"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Data Management */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-3">
                <span className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                  💾
                </span>
                Data Management
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => {
                    const dataStr = JSON.stringify(settings, null, 2)
                    const dataBlob = new Blob([dataStr], { type: 'application/json' })
                    const url = URL.createObjectURL(dataBlob)
                    const link = document.createElement('a')
                    link.href = url
                    link.download = 'ebike-settings-backup.json'
                    link.click()
                    URL.revokeObjectURL(url)
                  }}
                  className="flex flex-col items-center gap-3 p-6 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-xl transition-colors group"
                >
                  <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-blue-700 dark:text-blue-300">Export Settings</div>
                    <div className="text-xs text-blue-600 dark:text-blue-400">Download backup</div>
                  </div>
                </button>

                <label className="flex flex-col items-center gap-3 p-6 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-xl transition-colors group cursor-pointer">
                  <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 11-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-green-700 dark:text-green-300">Import Settings</div>
                    <div className="text-xs text-green-600 dark:text-green-400">Restore backup</div>
                  </div>
                  <input
                    type="file"
                    accept=".json"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        const reader = new FileReader()
                        reader.onload = (event) => {
                          try {
                            const importedSettings = JSON.parse(event.target?.result as string)
                            setSettings({ ...DEFAULT_SETTINGS, ...importedSettings })
                            setHasChanges(true)
                          } catch (error) {
                            console.error('Failed to import settings:', error)
                          }
                        }
                        reader.readAsText(file)
                      }
                    }}
                    className="hidden"
                  />
                </label>

                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to reset all settings to defaults? This action cannot be undone.')) {
                      setSettings(DEFAULT_SETTINGS)
                      setHasChanges(true)
                    }
                  }}
                  className="flex flex-col items-center gap-3 p-6 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-xl transition-colors group"
                >
                  <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd" />
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 012 0v4a1 1 0 11-2 0V7zM12 7a1 1 0 012 0v4a1 1 0 11-2 0V7z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-red-700 dark:text-red-300">Reset Settings</div>
                    <div className="text-xs text-red-600 dark:text-red-400">Restore defaults</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )

      default:
        return <div>Tab not found</div>
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Advanced Settings
          </h1>
        </div>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Configure your E-Bike Assistant with precision controls, AI-powered features, and professional-grade customization
        </p>
      </div>

      {/* System Status Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium opacity-90">Storage</h3>
              <div className="text-2xl font-bold">
                {Math.round((systemStats.storage.used / 1024 / 1024) * 10) / 10} MB
              </div>
              <div className="text-xs opacity-75">
                of {Math.round((systemStats.storage.total / 1024 / 1024 / 1024) * 10) / 10} GB
              </div>
            </div>
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium opacity-90">Sensors</h3>
              <div className="text-2xl font-bold">{systemStats.sensors.connected}</div>
              <div className="text-xs opacity-75">of {systemStats.sensors.total} devices</div>
            </div>
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium opacity-90">Sync Status</h3>
              <div className="text-2xl font-bold capitalize">{systemStats.sync.status}</div>
              <div className="text-xs opacity-75">
                Last: {systemStats.sync.lastSync?.toLocaleTimeString() || 'Never'}
              </div>
            </div>
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
              <div className={`w-3 h-3 rounded-full ${systemStats.sync.status === 'connected' ? 'bg-green-300 animate-pulse' : 'bg-red-300'}`}></div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium opacity-90">Performance</h3>
              <div className="text-2xl font-bold">{Math.round(systemStats.performance.cpu)}%</div>
              <div className="text-xs opacity-75">CPU Usage</div>
            </div>
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Search Bar */}
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search settings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                aria-label="Search settings"
              />
              <svg className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2">
            {filteredTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[500px]">
        {renderTabContent()}
      </div>

      {/* Save Button */}
      {hasChanges && (
        <div className="fixed bottom-8 right-8 z-50">
          <button
            onClick={saveSettings}
            disabled={saveStatus === 'saving'}
            className={`px-8 py-4 rounded-2xl font-bold text-lg shadow-2xl transition-all duration-300 transform ${
              saveStatus === 'saving'
                ? 'bg-gray-400 cursor-not-allowed'
                : saveStatus === 'saved'
                ? 'bg-green-600 hover:bg-green-700 scale-110'
                : saveStatus === 'error'
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:scale-105'
            } text-white`}
          >
            <div className="flex items-center gap-3">
              {saveStatus === 'saving' && (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
              {saveStatus === 'saved' && <span className="text-xl">✅</span>}
              {saveStatus === 'error' && <span className="text-xl">❌</span>}
              {saveStatus === 'idle' && (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h3a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2h3v5.586l-1.293-1.293zM9 4a1 1 0 012 0v2H9V4z" />
                </svg>
              )}
              <span>
                {saveStatus === 'saving' && 'Saving Changes...'}
                {saveStatus === 'saved' && 'Changes Saved!'}
                {saveStatus === 'error' && 'Save Failed'}
                {saveStatus === 'idle' && 'Save Changes'}
              </span>
            </div>
          </button>
        </div>
      )}
    </div>
  )
}

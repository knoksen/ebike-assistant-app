import React, { useEffect, useState } from 'react'
import { useBluetooth } from '../hooks/useBluetooth'

// Types
interface BoostProfile {
  mode: 'eco' | 'normal' | 'boost' | 'custom'
  maxSpeed: number
  maxPowerOutput: number
  assistanceLevel: number
  boostDuration: number
  cooldownPeriod: number
  enabled: boolean
}

interface BoostSettingsData {
  selectedProfile: string
  profiles: Record<string, BoostProfile>
  defaultLimits: {
    maxSpeed: number
    maxPowerOutput: number
    maxAssistanceLevel: number
  }
}

const DEFAULT_BOOST_SETTINGS: BoostSettingsData = {
  selectedProfile: 'normal',
  profiles: {
    eco: {
      mode: 'eco',
      maxSpeed: 25,
      maxPowerOutput: 200,
      assistanceLevel: 1,
      boostDuration: 0,
      cooldownPeriod: 0,
      enabled: true
    },
    normal: {
      mode: 'normal',
      maxSpeed: 32,
      maxPowerOutput: 350,
      assistanceLevel: 2,
      boostDuration: 30,
      cooldownPeriod: 60,
      enabled: true
    },
    boost: {
      mode: 'boost',
      maxSpeed: 45,
      maxPowerOutput: 500,
      assistanceLevel: 3,
      boostDuration: 15,
      cooldownPeriod: 120,
      enabled: true
    },
    custom: {
      mode: 'custom',
      maxSpeed: 35,
      maxPowerOutput: 400,
      assistanceLevel: 2,
      boostDuration: 20,
      cooldownPeriod: 90,
      enabled: false
    }
  },
  defaultLimits: {
    maxSpeed: 50,
    maxPowerOutput: 750,
    maxAssistanceLevel: 5
  }
}

type SaveState = 'idle' | 'saving' | 'saved' | 'error'

export function BoostSettings2(): JSX.Element {
  const [settings, setSettings] = useState<BoostSettingsData>(DEFAULT_BOOST_SETTINGS)
  const [activeProfile, setActiveProfile] = useState<string>(DEFAULT_BOOST_SETTINGS.selectedProfile)
  const [saveStatus, setSaveStatus] = useState<SaveState>('idle')
  const { isConnected, isConnecting, telemetry, connect, disconnect, error: connectError } = useBluetooth()

  // Load persisted settings
  useEffect(() => {
    const saved = localStorage.getItem('boostSettings')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setSettings(prev => ({
          ...prev,
            // merge profiles (so we keep any new defaults)
          profiles: { ...prev.profiles, ...(parsed.profiles || {}) },
          selectedProfile: parsed.selectedProfile || prev.selectedProfile
        }))
        if (parsed.selectedProfile) setActiveProfile(parsed.selectedProfile)
      } catch (e) {
        // ignore
      }
    }
  }, [])

  const handleProfileChange = (name: string) => {
    setActiveProfile(name)
    setSettings(prev => ({ ...prev, selectedProfile: name }))
  }

  const updateProfile = (profileName: string, updates: Partial<BoostProfile>) => {
    setSettings(prev => ({
      ...prev,
      profiles: {
        ...prev.profiles,
        [profileName]: { ...prev.profiles[profileName], ...updates }
      }
    }))
  }

  const saveSettings = async () => {
    setSaveStatus('saving')
    try {
      localStorage.setItem('boostSettings', JSON.stringify(settings))
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 1500)
    } catch (e) {
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 1500)
    }
  }

  const connectOrDisconnect = async () => {
    if (isConnected) return disconnect()
    return connect()
  }

  const profile = settings.profiles[activeProfile]

  // (Removed custom value override; using number inputs for test compatibility)

  return (
    <div className="space-y-8" data-testid="boost-settings">
      {/* Connection & Telemetry Card */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md shadow-inner">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold flex items-center gap-2">Device Connection
                <span className={`inline-flex items-center px-2 py-0.5 text-xs rounded-full border ${isConnected ? 'bg-green-500/20 border-green-300 text-green-200' : 'bg-white/10 border-white/30 text-white/70'}`}>
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </h2>
              <p className="text-sm text-white/70">{telemetry ? 'Live telemetry active' : 'Connect to access live telemetry & boost control'}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {telemetry && (
              <div className="hidden sm:flex items-center gap-4 text-sm">
                <div className="flex flex-col items-center"><span className="font-semibold">{telemetry.speed.toFixed(1)}</span><span className="text-white/60 text-xs">km/h</span></div>
                <div className="flex flex-col items-center"><span className="font-semibold">{telemetry.power}</span><span className="text-white/60 text-xs">W</span></div>
                <div className="flex flex-col items-center"><span className="font-semibold">{telemetry.temperature}</span><span className="text-white/60 text-xs">°C</span></div>
              </div>
            )}
            <button
              onClick={connectOrDisconnect}
              aria-label="Connect Device"
              className={`relative px-6 py-3 rounded-xl font-medium flex items-center gap-2 shadow-lg transition-all backdrop-blur-md ${isConnected ? 'bg-white text-blue-600 hover:bg-blue-50' : 'bg-white/20 hover:bg-white/30 text-white'} disabled:opacity-50`}
              disabled={isConnecting}
            >
              {isConnecting ? (
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.333 0 1 4.333 1 12h3z" /></svg>
              ) : (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.14 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" /></svg>
              )}
              {isConnected ? 'Disconnect' : isConnecting ? 'Connecting' : 'Connect Device'}
            </button>
          </div>
        </div>
        {connectError && <div className="mt-4 text-sm bg-red-500/20 border border-red-300/40 text-red-100 rounded-lg px-3 py-2">{connectError}</div>}
      </div>

      {/* Profile Selection */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-3 text-gray-800 dark:text-white"><span className="w-9 h-9 rounded-lg bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center">⚡</span>Power Boost Profiles</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Object.entries(settings.profiles).map(([name, prof]) => (
            <button
              key={name}
              onClick={() => handleProfileChange(name)}
        aria-label={`${name} profile`}
              className={`p-4 rounded-xl text-left transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 relative overflow-hidden ${activeProfile === name ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white scale-105 shadow-lg' : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200'}`}
            >
              <div className="font-semibold capitalize">{name}</div>
              <div className="text-sm opacity-80">{prof.maxPowerOutput}W | {prof.maxSpeed}km/h</div>
              {activeProfile === name && <div className="absolute inset-0 bg-white/10 pointer-events-none" />}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Boost & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 overflow-hidden">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-3"><span className="w-9 h-9 rounded-lg bg-gradient-to-r from-yellow-500 to-red-500 flex items-center justify-center">🚀</span>Quick Boost</h3>
          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-4xl font-extrabold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent drop-shadow">+{profile.maxPowerOutput}W</div>
            </div>
            <svg className="w-full h-48" viewBox="0 0 100 100">
              <circle strokeWidth="8" stroke="currentColor" className="text-gray-200 dark:text-gray-700" fill="transparent" r="40" cx="50" cy="50" />
              <circle strokeWidth="8" strokeLinecap="round" stroke="currentColor" className="text-red-500 transition-all duration-500" fill="transparent" r="40" cx="50" cy="50" strokeDasharray={251.2} strokeDashoffset={251.2 * (1 - profile.maxPowerOutput / settings.defaultLimits.maxPowerOutput)} />
            </svg>
          </div>
          <div className="flex flex-col gap-4">
            <button
              disabled={!isConnected}
              aria-label="activate"
              className="w-full p-4 rounded-xl font-medium bg-gradient-to-r from-red-500 to-orange-500 text-white hover:from-red-600 hover:to-orange-600 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed transition relative group"
            >
              <div className="absolute inset-0 rounded-xl bg-white opacity-0 group-hover:opacity-10 transition" />
              <span className="flex items-center justify-center gap-2"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg><span aria-hidden="true">Activate Boost</span></span>
            </button>
            {!isConnected && <p className="text-xs text-center text-gray-500 dark:text-gray-400">Connect a device to enable boost activation.</p>}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-3"><span className="w-9 h-9 rounded-lg bg-gradient-to-r from-green-500 to-teal-500 flex items-center justify-center">📊</span>Boost Stats</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4"><div className="text-sm text-gray-600 dark:text-gray-400">Boosts Today</div><div className="text-2xl font-bold mt-1 text-gray-900 dark:text-white">5</div><div className="text-xs text-green-600 dark:text-green-400 mt-1">↑ 2 more than yesterday</div></div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4"><div className="text-sm text-gray-600 dark:text-gray-400">Avg. Duration</div><div className="text-2xl font-bold mt-1 text-gray-900 dark:text-white">12s</div><div className="text-xs text-blue-600 dark:text-blue-400 mt-1">Within safe limits</div></div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4"><div className="text-sm text-gray-600 dark:text-gray-400">Power Saved</div><div className="text-2xl font-bold mt-1 text-gray-900 dark:text-white">1.2kWh</div><div className="text-xs text-green-600 dark:text-green-400 mt-1">↑ 15% efficiency</div></div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4"><div className="text-sm text-gray-600 dark:text-gray-400">Battery Impact</div><div className="text-2xl font-bold mt-1 text-gray-900 dark:text-white">Low</div><div className="text-xs text-green-600 dark:text-green-400 mt-1">Optimal usage</div></div>
          </div>
          <div className="mt-6">
            <div className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Recent Activity</div>
            <div className="space-y-3">
              {[{ time: '10:23 AM', duration: '15s', power: '450W' }, { time: '9:45 AM', duration: '12s', power: '400W' }, { time: '9:12 AM', duration: '10s', power: '350W' }].map((a, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2"><div className="w-2 h-2 bg-green-500 rounded-full" /><span className="text-gray-600 dark:text-gray-400">{a.time}</span></div>
                  <div className="flex items-center gap-4"><span className="text-gray-700 dark:text-gray-300">{a.duration}</span><span className="text-orange-600 dark:text-orange-400">{a.power}</span></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Active Profile Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
        <h3 className="text-xl font-bold mb-6 flex items-center justify-between text-gray-800 dark:text-white">
          <span className="flex items-center gap-3"><span className="w-9 h-9 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">🎯</span>Profile Settings</span>
          <span className="text-sm font-normal capitalize text-gray-500 dark:text-gray-400">{activeProfile} Profile</span>
        </h3>
        <div className="space-y-6">
          <div>
            <label htmlFor="max-speed" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Max Speed (km/h)</label>
            <input id="max-speed" type="number" min="0" max={settings.defaultLimits.maxSpeed} value={profile.maxSpeed} onChange={e => updateProfile(activeProfile, { maxSpeed: parseInt(e.target.value || '0') })} className="w-full p-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md" />
            <div className="text-sm mt-1 text-gray-600 dark:text-gray-400">Current: {profile.maxSpeed} km/h</div>
          </div>
          <div>
            <label htmlFor="max-power" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Max Power Output (W)</label>
            <input id="max-power" type="number" min="0" max={settings.defaultLimits.maxPowerOutput} value={profile.maxPowerOutput} onChange={e => updateProfile(activeProfile, { maxPowerOutput: parseInt(e.target.value || '0') })} className="w-full p-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md" />
            <div className="text-sm mt-1 text-gray-600 dark:text-gray-400">Current: {profile.maxPowerOutput} W</div>
          </div>
            <div>
            <label htmlFor="assist-level" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Assistance Level</label>
            <input id="assist-level" type="number" min="0" max={settings.defaultLimits.maxAssistanceLevel} value={profile.assistanceLevel} onChange={e => updateProfile(activeProfile, { assistanceLevel: parseInt(e.target.value || '0') })} className="w-full p-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md" />
            <div className="text-sm mt-1 text-gray-600 dark:text-gray-400">Level {profile.assistanceLevel}</div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Boost Duration (seconds)</label>
            <input type="number" min="0" max="300" value={profile.boostDuration} onChange={e => updateProfile(activeProfile, { boostDuration: parseInt(e.target.value) })} className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" aria-label="Boost Duration" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Cooldown Period (seconds)</label>
            <input type="number" min="0" max="600" value={profile.cooldownPeriod} onChange={e => updateProfile(activeProfile, { cooldownPeriod: parseInt(e.target.value) })} className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" aria-label="Cooldown Period" />
          </div>
          <div className="flex items-center justify-between pt-4">
            <button type="button" aria-label="Enable Profile" onClick={() => updateProfile(activeProfile, { enabled: !profile.enabled })} className="flex items-center gap-3 group">
              <div className={`relative h-6 w-11 flex items-center rounded-full transition-colors duration-300 ${profile.enabled ? 'bg-gradient-to-r from-blue-600 to-purple-600' : 'bg-gray-300 dark:bg-gray-600'}`}>
                <span className={`inline-block h-5 w-5 bg-white rounded-full shadow transform transition ${profile.enabled ? 'translate-x-6' : 'translate-x-1'}`} />
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">Enable Profile</span>
            </button>
            <button onClick={saveSettings} disabled={saveStatus === 'saving'} className={`px-6 py-2 rounded-lg font-medium text-white transition ${saveStatus === 'saving' ? 'bg-gray-400 cursor-not-allowed' : saveStatus === 'saved' ? 'bg-green-500 hover:bg-green-600' : saveStatus === 'error' ? 'bg-red-500 hover:bg-red-600' : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'}`}>{saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved!' : saveStatus === 'error' ? 'Error!' : 'Save Changes'}</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BoostSettings2

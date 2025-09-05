import React from 'react'
import { useBluetooth } from '../hooks/useBluetooth'

interface DeviceConnectButtonProps {
  compact?: boolean
  className?: string
}

export const DeviceConnectButton: React.FC<DeviceConnectButtonProps> = ({ compact, className = '' }) => {
  const { isConnected, isConnecting, error, connect, disconnect, resetError } = useBluetooth()

  const toggleConnection = async () => {
    resetError()
    if (isConnected) return disconnect()
    return connect()
  }

  return (
    <div className={`relative flex items-center ${className}`}>
      <button
        onClick={toggleConnection}
        aria-label={isConnected ? 'Disconnect Device' : 'Connect Device'}
        className={`group flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all shadow-sm hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${isConnected ? 'bg-green-500/15 text-green-700 dark:text-green-300 hover:bg-green-500/25 border border-green-400/40' : 'bg-blue-500/15 text-blue-700 dark:text-blue-300 hover:bg-blue-500/25 border border-blue-400/40'}`}
        disabled={isConnecting}
      >
        {isConnecting ? (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.333 0 1 4.333 1 12h3z" /></svg>
        ) : (
          <svg className={`h-5 w-5 ${isConnected ? 'text-green-500' : 'text-blue-500'} dark:text-current`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.14 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" /></svg>
        )}
        {!compact && (
          <span>{isConnected ? 'Connected' : isConnecting ? 'Connecting…' : 'Connect'}</span>
        )}
        <span className={`ml-1 h-2 w-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'} transition-colors`} />
      </button>
  {error && (
        <div className="absolute top-full mt-1 text-xs bg-red-500/90 text-white px-2 py-1 rounded shadow-lg">
          {error}
        </div>
      )}
    </div>
  )
}

export default DeviceConnectButton

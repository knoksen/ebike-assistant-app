import { useCallback, useEffect, useRef, useState } from 'react'
import { BluetoothService, type TelemetryData } from '../services/BluetoothService'

export interface UseBluetoothState {
  isAvailable: boolean
  isConnected: boolean
  isConnecting: boolean
  error: string | null
  telemetry: TelemetryData | null
  connect: () => Promise<void>
  disconnect: () => Promise<void>
  resetError: () => void
}

export function useBluetooth(): UseBluetoothState {
  const [isAvailable, setIsAvailable] = useState<boolean>(() => !!navigator.bluetooth)
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null)
  const serviceRef = useRef<BluetoothService | null>(null)

  useEffect(() => {
    serviceRef.current = BluetoothService.getInstance()
    const svc = serviceRef.current
    const handleConn = (c: boolean) => {
      setIsConnected(c)
      setIsConnecting(false)
      if (!c) setTelemetry(null)
    }
    const handleTel = (data: TelemetryData) => setTelemetry(data)
    svc.addConnectionListener(handleConn)
    svc.addTelemetryListener(handleTel)
    return () => {
      svc.removeConnectionListener(handleConn)
      svc.removeTelemetryListener(handleTel)
    }
  }, [])

  const connect = useCallback(async () => {
    if (!serviceRef.current) return
    setError(null)
    setIsConnecting(true)
    try {
      const picked = await serviceRef.current.requestDevice()
      if (!picked) {
        setError('Device selection cancelled')
        setIsConnecting(false)
        return
      }
      await serviceRef.current.connect()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to connect')
      setIsConnecting(false)
    }
  }, [])

  const disconnect = useCallback(async () => {
    if (!serviceRef.current) return
    try {
      await serviceRef.current.disconnect()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to disconnect')
    }
  }, [])

  const resetError = useCallback(() => setError(null), [])

  return { isAvailable, isConnected, isConnecting, error, telemetry, connect, disconnect, resetError }
}

export default useBluetooth

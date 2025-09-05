import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { ThemeProvider } from '../../context/ThemeContext'
import DeviceConnectButton from '../../components/DeviceConnectButton'

// Mock BluetoothService
const mockListeners: { conn: Array<(c: boolean) => void>; tele: Array<(d: unknown) => void> } = { conn: [], tele: [] }
const mockConnect = vi.fn(async () => { mockListeners.conn.forEach(l => l(true)) })
const mockDisconnect = vi.fn(async () => { mockListeners.conn.forEach(l => l(false)) })
const mockRequest = vi.fn(async () => true)

vi.mock('../../services/BluetoothService', () => {
  return {
    BluetoothService: class {
      static instance: any
      static getInstance() { if (!this.instance) this.instance = new this(); return this.instance }
      requestDevice = mockRequest
      connect = mockConnect
      disconnect = mockDisconnect
      addConnectionListener(l: (c: boolean)=>void) { mockListeners.conn.push(l) }
      removeConnectionListener(l: (c: boolean)=>void) { const i = mockListeners.conn.indexOf(l); if (i>-1) mockListeners.conn.splice(i,1) }
  addTelemetryListener(l: (d: unknown)=>void) { mockListeners.tele.push(l) }
  removeTelemetryListener(l: (d: unknown)=>void) { const i = mockListeners.tele.indexOf(l); if (i>-1) mockListeners.tele.splice(i,1) }
    }
  }
})

describe('DeviceConnectButton', () => {
  test('connects and disconnects', async () => {
    render(<ThemeProvider><DeviceConnectButton /></ThemeProvider>)
    const btn = screen.getByRole('button', { name: /connect device/i })
    fireEvent.click(btn)
    await waitFor(() => expect(mockConnect).toHaveBeenCalled())
    expect(screen.getByRole('button', { name: /disconnect device/i })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /disconnect device/i }))
    await waitFor(() => expect(mockDisconnect).toHaveBeenCalled())
  })
})

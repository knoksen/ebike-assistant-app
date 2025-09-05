import { vi } from 'vitest'

export const networkService = {
  getWeatherData: vi.fn(async () => ({
    temperature: 20,
    humidity: 50,
    windSpeed: 2,
    windDirection: 90,
    condition: 'clear',
    visibility: 10000,
    pressure: 1015,
    uvIndex: 1,
  })),
  getWeatherForecast: vi.fn(async () => []),
  getConnectionStatus: vi.fn(() => ({ online: false, websocket: false, lastSync: 0, queuedRequests: 0 })),
  sendEmergencyAlert: vi.fn(async () => {}),
  disconnect: vi.fn(() => {}),
  shareRide: vi.fn(async () => ({ shareId: 'share-test', shareUrl: 'https://example.com/share-test' })),
}

export default networkService
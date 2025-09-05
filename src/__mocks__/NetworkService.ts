import { vi } from 'vitest'

export const networkService = {
  connectWebSocket: vi.fn(() => ({ close: vi.fn(), send: vi.fn() })),
  disconnectWebSocket: vi.fn(),
  isConnected: vi.fn(() => false),
  getWeather: vi.fn(async () => []),
}

export default networkService
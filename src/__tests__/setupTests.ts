import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Suppress noisy logging in tests
vi.mock('../services/logger', () => ({
	log: {
		debug: vi.fn(),
		info: vi.fn(),
		warn: vi.fn(),
		error: vi.fn(),
	}
}))

// Connectivity & network mocks (prevent WebSocket + DB init noise)
vi.mock('../services/ConnectivityFramework', () => import('../__mocks__/ConnectivityFramework'))
vi.mock('../services/NetworkService', () => import('../__mocks__/NetworkService'))

// Provide minimal window Notification mock if missing
if (typeof window !== 'undefined' && !('Notification' in window)) {
	// @ts-expect-error test shim
	window.Notification = { permission: 'granted' }
}

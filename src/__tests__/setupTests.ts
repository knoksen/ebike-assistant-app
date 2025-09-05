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

// Connectivity, network & database mocks (prevent side effects & noise)
vi.mock('../services/ConnectivityFramework', () => import('../__mocks__/ConnectivityFramework'))
vi.mock('../services/NetworkService', () => import('../__mocks__/NetworkService'))
vi.mock('../services/DatabaseService', () => import('../__mocks__/DatabaseService'))

// Provide minimal window Notification mock if missing
if (typeof window !== 'undefined' && !('Notification' in window)) {
	// @ts-expect-error test shim
	window.Notification = { permission: 'granted' }
}

// Suppress React Router future flag warnings to keep test output clean
const rrWarningPattern = /React Router Future Flag Warning/i
const originalError = console.error
const originalWarn = console.warn
console.error = (...args: unknown[]) => {
	if (args.length && typeof args[0] === 'string' && rrWarningPattern.test(args[0])) {
		return
	}
	originalError(...(args as []))
}
console.warn = (...args: unknown[]) => {
	if (args.length && typeof args[0] === 'string' && rrWarningPattern.test(args[0])) {
		return
	}
	originalWarn(...(args as []))
}

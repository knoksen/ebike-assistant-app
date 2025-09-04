import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock IndexedDB
class IDBRequest {
  result: any
  error: Error | null = null
  source: any = null
  transaction: IDBTransaction | null = null
  readyState: string = 'pending'
  onsuccess: ((this: IDBRequest, ev: Event) => any) | null = null
  onerror: ((this: IDBRequest, ev: Event) => any) | null = null

  constructor() {
    this.result = null
  }
}

class IDBOpenDBRequest extends IDBRequest {
  onblocked: ((this: IDBOpenDBRequest, ev: Event) => any) | null = null
  onupgradeneeded: ((this: IDBOpenDBRequest, ev: IDBVersionChangeEvent) => any) | null = null
}

const indexedDB = {
  open: vi.fn(() => {
    const request = new IDBOpenDBRequest()
    setTimeout(() => {
      if (request.onsuccess) {
        request.result = {
          createObjectStore: vi.fn(),
          transaction: vi.fn(() => ({
            objectStore: vi.fn(() => ({
              put: vi.fn(),
              get: vi.fn(),
              delete: vi.fn()
            }))
          }))
        }
        request.onsuccess(new Event('success'))
      }
    })
    return request
  }),
  deleteDatabase: vi.fn(() => {
    const request = new IDBRequest()
    setTimeout(() => {
      if (request.onsuccess) {
        request.onsuccess(new Event('success'))
      }
    })
    return request
  })
}

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
}

// Mock window.matchMedia
window.matchMedia = window.matchMedia || function() {
  return {
    matches: false,
    addListener: function() {},
    removeListener: function() {},
    addEventListener: function() {},
    removeEventListener: function() {},
    dispatchEvent: function() { return true },
  }
}

// Mock Bluetooth API
const bluetooth = {
  requestDevice: vi.fn(),
  getAvailability: vi.fn().mockResolvedValue(true),
}

Object.defineProperty(window, 'indexedDB', { value: indexedDB })
Object.defineProperty(window, 'localStorage', { value: localStorageMock })
Object.defineProperty(navigator, 'bluetooth', { value: bluetooth })

// Lightweight test mock for DatabaseService matching the real module's public API shape
// Only implements methods actually used in tests/services to avoid side effects & noise
import { vi } from 'vitest'

// Simple in-memory stores map
const stores: Record<string, Map<string, any>> = {
  devices: new Map(),
  trips: new Map(),
  maintenance: new Map(),
  settings: new Map(),
}

type Listener = (data: unknown) => void
const listeners: Record<string, Listener[]> = {}

function emit(event: string, data: unknown) {
  (listeners[event] || []).forEach(cb => cb(data))
}

export const databaseService = {
  initialize: vi.fn(async () => { emit('database:ready', null) }),
  close: vi.fn(async () => {}),
  on: vi.fn((event: string, cb: Listener) => {
    listeners[event] = listeners[event] || []
    listeners[event].push(cb)
  }),
  off: vi.fn((event: string, cb: Listener) => {
    listeners[event] = (listeners[event] || []).filter(l => l !== cb)
  }),
  get: vi.fn(async (store: string, id: string) => stores[store]?.get(id)),
  create: vi.fn(async (store: string, record: any) => {
    const id = record.id || `test-${Math.random().toString(36).slice(2)}`
    const finalRec = { id, created: Date.now(), lastModified: Date.now(), ...record }
    stores[store].set(id, finalRec)
    emit(`${store}:created`, finalRec)
    return id
  }),
  update: vi.fn(async (store: string, id: string, updates: any) => {
    const existing = stores[store].get(id) || { id }
    const merged = { ...existing, ...updates, lastModified: Date.now() }
    stores[store].set(id, merged)
    emit(`${store}:updated`, merged)
  }),
  list: vi.fn(async (store: string) => Array.from(stores[store].values())),
  // Specific helpers referenced in real service methods
  getSetting: vi.fn(async () => undefined),
  setSetting: vi.fn(async () => {}),
}

export default databaseService

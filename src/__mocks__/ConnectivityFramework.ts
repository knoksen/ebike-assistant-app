// Test mock for ConnectivityFramework to suppress heavy initialization & logs
import { vi } from 'vitest'
export const connectivityFramework = {
  startRide: vi.fn(async () => 'test-ride-id'),
  stopRide: vi.fn(async () => ({ id: 'test-ride-id', distance: 0 })),
  // add no-op methods that production code may call
  pauseRide: vi.fn(),
  resumeRide: vi.fn(),
}

export default connectivityFramework
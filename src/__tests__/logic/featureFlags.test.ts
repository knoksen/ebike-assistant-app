import { describe, expect, it } from 'vitest'
import { resolveFeatureFlags } from '../../logic/featureFlags'

describe('resolveFeatureFlags', () => {
  it('defaults firmware flash to false', () => {
    const flags = resolveFeatureFlags({})
    expect(flags.firmwareFlash).toBe(false)
  })

  it('enables firmware flash when the env flag is true', () => {
    const flags = resolveFeatureFlags({ VITE_FEATURE_FIRMWARE_FLASH: 'true' })
    expect(flags.firmwareFlash).toBe(true)
  })
})

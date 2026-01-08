export type FeatureFlags = {
  firmwareFlash: boolean
}

const parseBooleanFlag = (value: unknown): boolean => {
  if (typeof value === 'boolean') {
    return value
  }
  if (typeof value === 'string') {
    return ['true', '1', 'yes', 'on'].includes(value.toLowerCase())
  }
  return false
}

export const resolveFeatureFlags = (env: Record<string, unknown> = {}): FeatureFlags => {
  return {
    firmwareFlash: parseBooleanFlag(env.VITE_FEATURE_FIRMWARE_FLASH),
  }
}

export const getFeatureFlags = (): FeatureFlags => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const meta: any = typeof import.meta !== 'undefined' ? import.meta : {}
  return resolveFeatureFlags(meta.env || {})
}

export const isFirmwareFlashEnabled = (flags: FeatureFlags = getFeatureFlags()): boolean => {
  return flags.firmwareFlash
}

export type FirmwareSafetyStatus = {
  isBikeConnected: boolean
  batteryPercentage: number
  isStationary: boolean
}

export type FirmwareSafetyIssue = {
  code: string
  message: string
  severity: 'error' | 'warning'
}

export type FirmwareFlashRequest = {
  targetVersion: string
  confirmed: boolean
}

export type FirmwareFlashResult = {
  ok: boolean
  issues: FirmwareSafetyIssue[]
}

export const getDefaultFirmwareSafetyStatus = (): FirmwareSafetyStatus => {
  return {
    isBikeConnected: false,
    batteryPercentage: 0,
    isStationary: true,
  }
}

export const evaluateFirmwareSafety = (status: FirmwareSafetyStatus): FirmwareSafetyIssue[] => {
  const issues: FirmwareSafetyIssue[] = []

  if (!status.isBikeConnected) {
    issues.push({
      code: 'bike-not-connected',
      message: 'Connect your e-bike before flashing firmware.',
      severity: 'error',
    })
  }

  if (status.batteryPercentage < 50) {
    issues.push({
      code: 'battery-too-low',
      message: 'Battery level must be at least 50% before flashing firmware.',
      severity: 'error',
    })
  }

  if (!status.isStationary) {
    issues.push({
      code: 'bike-moving',
      message: 'Ensure the bike is stationary before flashing firmware.',
      severity: 'error',
    })
  }

  return issues
}

export const flashFirmware = async (
  request: FirmwareFlashRequest,
  status: FirmwareSafetyStatus,
): Promise<FirmwareFlashResult> => {
  const issues = evaluateFirmwareSafety(status)

  if (!request.confirmed) {
    issues.push({
      code: 'confirmation-required',
      message: 'Firmware flash requires explicit confirmation.',
      severity: 'error',
    })
  }

  if (issues.length > 0) {
    return { ok: false, issues }
  }

  return { ok: true, issues: [] }
}

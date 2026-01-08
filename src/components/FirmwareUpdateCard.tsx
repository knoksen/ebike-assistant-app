import { useState } from 'react'
import { isFirmwareFlashEnabled } from '../logic/featureFlags'
import {
  evaluateFirmwareSafety,
  flashFirmware,
  FirmwareSafetyIssue,
  getDefaultFirmwareSafetyStatus,
} from '../services/FirmwareService'

type FirmwareUpdateState = 'idle' | 'checking' | 'blocked' | 'flashing' | 'done'

interface FirmwareUpdateCardProps {
  featureEnabled?: boolean
}

export const FirmwareUpdateCard = ({ featureEnabled }: FirmwareUpdateCardProps) => {
  const firmwareEnabled = featureEnabled ?? isFirmwareFlashEnabled()
  const [state, setState] = useState<FirmwareUpdateState>('idle')
  const [issues, setIssues] = useState<FirmwareSafetyIssue[]>([])

  const runFirmwareFlash = async () => {
    if (!firmwareEnabled) return

    setIssues([])

    const confirmed = confirm(
      'Firmware flashing can permanently affect your bike. Ensure the bike is connected, stationary, and sufficiently charged before continuing.'
    )

    if (!confirmed) {
      setState('idle')
      return
    }

    setState('checking')

    const safetyStatus = getDefaultFirmwareSafetyStatus()
    const safetyIssues = evaluateFirmwareSafety(safetyStatus)

    if (safetyIssues.length > 0) {
      setIssues(safetyIssues)
      setState('blocked')
      return
    }

    setState('flashing')
    const result = await flashFirmware(
      {
        confirmed,
        targetVersion: 'latest',
      },
      safetyStatus,
    )

    if (!result.ok) {
      setIssues(result.issues)
      setState('blocked')
      return
    }

    setState('done')
  }

  const buttonLabel = firmwareEnabled
    ? state === 'flashing'
      ? 'Flashing…'
      : 'Start Firmware Flash'
    : 'Firmware Flash Unavailable'

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
      <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-3">
        <span className="w-8 h-8 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
          🧯
        </span>
        Firmware Update
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
        Flash the latest firmware only when your bike is connected, stationary, and adequately charged.
      </p>

      {!firmwareEnabled && (
        <div className="mb-4 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 p-4 text-sm text-gray-500 dark:text-gray-400">
          Firmware updates are unavailable in this build. Contact support if you need access.
        </div>
      )}

      {issues.length > 0 && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-200">
          <p className="font-semibold">Safety checks failed:</p>
          <ul className="mt-2 list-disc list-inside space-y-1">
            {issues.map((issue) => (
              <li key={issue.code}>{issue.message}</li>
            ))}
          </ul>
        </div>
      )}

      {state === 'done' && (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-900/20 dark:text-emerald-200">
          Firmware flash placeholder completed. Replace with real device update logic when ready.
        </div>
      )}

      <button
        type="button"
        onClick={runFirmwareFlash}
        disabled={!firmwareEnabled || state === 'flashing'}
        className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
          firmwareEnabled
            ? 'bg-red-600 text-white hover:bg-red-700'
            : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
        }`}
      >
        {buttonLabel}
      </button>
    </div>
  )
}

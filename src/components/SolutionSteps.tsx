import { useState } from 'react'
import type { FaultInfo } from '../logic/diagnostics'

export type SolutionStepsProps = {
  steps: string[] | undefined
  faultInfo?: FaultInfo
  onBack: () => void
}

export function SolutionSteps({ steps, faultInfo, onBack }: SolutionStepsProps) {
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())

  if (!steps || !faultInfo) return null

  const toggleStep = (index: number) => {
    const newCompleted = new Set(completedSteps)
    if (newCompleted.has(index)) {
      newCompleted.delete(index)
    } else {
      newCompleted.add(index)
    }
    setCompletedSteps(newCompleted)
  }

  const completionPercentage = Math.round((completedSteps.size / steps.length) * 100)

  const getSeverityColor = (severity: FaultInfo['severity']) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div className="mb-6">
        <button 
          onClick={onBack}
          className="flex items-center text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 mb-4 transition-colors"
        >
          ← Back to problems
        </button>
        
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">
            Troubleshooting: {faultInfo.question}
          </h2>
          
          {/* Fault Info */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(faultInfo.severity)}`}>
              {faultInfo.severity} priority
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              ⏱️ Estimated time: {faultInfo.estimatedTime}
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
              📂 {faultInfo.category}
            </span>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
            <span>Progress</span>
            <span>{completedSteps.size}/{steps.length} steps completed ({completionPercentage}%)</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div 
              className="bg-green-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
          Follow these steps in order:
        </h3>
        
        {steps.map((step, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg border-2 transition-all duration-200 ${
              completedSteps.has(index)
                ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                : 'border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500'
            }`}
          >
            <div className="flex items-start">
              <button
                onClick={() => toggleStep(index)}
                className={`flex-shrink-0 w-7 h-7 rounded-full border-2 mr-4 mt-0.5 transition-all flex items-center justify-center text-sm font-medium ${
                  completedSteps.has(index)
                    ? 'bg-green-500 border-green-500 text-white'
                    : 'border-gray-300 dark:border-gray-500 hover:border-blue-500 dark:hover:border-blue-400 text-gray-500 dark:text-gray-400'
                }`}
              >
                {completedSteps.has(index) ? '✓' : index + 1}
              </button>
              
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Step {index + 1} of {steps.length}
                  </span>
                </div>
                <p className={`text-gray-800 dark:text-white leading-relaxed ${
                  completedSteps.has(index) ? 'line-through opacity-75' : ''
                }`}>
                  {step}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Success Message */}
      {completedSteps.size === steps.length && (
        <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 rounded">
          <div className="flex items-center">
            <div className="text-green-500 mr-3 text-xl">🎉</div>
            <div>
              <h4 className="font-semibold text-green-800 dark:text-green-200">
                Excellent work! You've completed all troubleshooting steps.
              </h4>
              <p className="text-sm text-green-600 dark:text-green-300 mt-1">
                If the issue persists after following these steps, consider consulting a professional 
                e-bike technician or contacting your manufacturer's support team.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Additional Help */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <div className="flex items-start">
          <div className="text-blue-500 mr-2">ℹ️</div>
          <div className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Need additional help?</strong> If these steps don't resolve your issue, 
            consider taking photos of the problem area and consulting your local e-bike shop 
            or the manufacturer's technical support.
          </div>
        </div>
      </div>
    </div>
  )
}

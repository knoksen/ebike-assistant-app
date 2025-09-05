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
    <div>
      <div className="mb-8">
        <button 
          onClick={onBack}
          className="group flex items-center space-x-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 mb-6 transition-colors"
        >
          <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          <span>Back to diagnostics</span>
        </button>
        
        <div className="relative mb-6">
          <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/10 via-green-500/10 to-blue-500/10 rounded-2xl blur-xl"></div>
          <div className="relative">
            <h2 className="text-2xl font-semibold bg-gradient-to-r from-blue-600 to-green-600 dark:from-blue-400 dark:to-green-400 bg-clip-text text-transparent mb-3">
              Troubleshooting Guide
            </h2>
            <p className="text-lg text-gray-800 dark:text-white mb-4">
              {faultInfo.question}
            </p>
          
          {/* Fault Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-xl blur-lg"></div>
              <div className="relative p-4 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50">
                <div className="flex items-center space-x-3">
                  <div className="relative w-10 h-10">
                    <div className="absolute inset-0 bg-red-500 rounded-lg opacity-20 blur"></div>
                    <div className="relative flex items-center justify-center w-full h-full bg-white dark:bg-gray-800 rounded-lg">
                      <span className="text-xl">⚡</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Priority Level</div>
                    <div className={`font-semibold ${getSeverityColor(faultInfo.severity)}`}>
                      {faultInfo.severity.toUpperCase()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl blur-lg"></div>
              <div className="relative p-4 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50">
                <div className="flex items-center space-x-3">
                  <div className="relative w-10 h-10">
                    <div className="absolute inset-0 bg-blue-500 rounded-lg opacity-20 blur"></div>
                    <div className="relative flex items-center justify-center w-full h-full bg-white dark:bg-gray-800 rounded-lg">
                      <span className="text-xl">⏱️</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Est. Time</div>
                    <div className="font-semibold text-gray-900 dark:text-gray-100">
                      {faultInfo.estimatedTime}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-teal-500/10 rounded-xl blur-lg"></div>
              <div className="relative p-4 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50">
                <div className="flex items-center space-x-3">
                  <div className="relative w-10 h-10">
                    <div className="absolute inset-0 bg-green-500 rounded-lg opacity-20 blur"></div>
                    <div className="relative flex items-center justify-center w-full h-full bg-white dark:bg-gray-800 rounded-lg">
                      <span className="text-xl">📂</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Category</div>
                    <div className="font-semibold text-gray-900 dark:text-gray-100 capitalize">
                      {faultInfo.category}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* end relative container */}
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="relative mb-8">
          <div className="absolute -inset-4 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-2xl blur-xl"></div>
          <div className="relative p-4 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center space-x-2">
                <div className="relative w-8 h-8">
                  <div className="absolute inset-0 bg-green-500 rounded-lg opacity-20 blur"></div>
                  <div className="relative flex items-center justify-center w-full h-full bg-white dark:bg-gray-800 rounded-lg">
                    <span className="text-lg">📊</span>
                  </div>
                </div>
                <span className="font-semibold text-gray-900 dark:text-gray-100">Progress Tracker</span>
              </div>
              <div className="text-sm">
                <span className="font-semibold text-green-600 dark:text-green-400">{completedSteps.size}</span>
                <span className="text-gray-500 dark:text-gray-400"> / {steps.length} steps</span>
              </div>
            </div>
            <div className="relative">
              <div className="progress-bar h-4">
                <div
                  className="progress-bar__fill bg-gradient-to-r from-green-500 via-emerald-500 to-blue-500"
                  style={{ width: `${completionPercentage}%` }}
                >
                  <span className="progress-bar__shine" />
                </div>
              </div>
              <div className="absolute -right-1 top-1/2 transform -translate-y-1/2">
                <span className="bg-gray-900 text-white text-xs px-2 py-1 rounded-md shadow-lg">
                  {completionPercentage}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="relative">
          <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/10 to-green-500/10 rounded-2xl blur-xl"></div>
          <div className="relative">
            <h3 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-green-600 dark:from-blue-400 dark:to-green-400 bg-clip-text text-transparent mb-6">
              Step-by-Step Solution Guide
            </h3>
            
            {steps.map((step, index) => (
              <div key={index} className="group relative mb-4 last:mb-0">
                <div className={`absolute -inset-0.5 rounded-xl transition-all duration-300 ${
                  completedSteps.has(index)
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 opacity-20'
                    : 'bg-gradient-to-r from-blue-500 to-green-500 opacity-0 group-hover:opacity-20'
                } blur`}></div>
                <div className={`relative p-4 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border transition-all duration-300 ${
                  completedSteps.has(index)
                    ? 'border-green-200/50 dark:border-green-800/50'
                    : 'border-gray-200/50 dark:border-gray-700/50 group-hover:border-blue-200/50 dark:group-hover:border-blue-700/50'
                }`}>
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <button
                        onClick={() => toggleStep(index)}
                        className={`relative w-10 h-10 rounded-lg transition-all duration-300 ${
                          completedSteps.has(index)
                            ? 'bg-green-500 text-white'
                            : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 group-hover:text-blue-500'
                        }`}
                      >
                        <div className={`absolute inset-0 rounded-lg transition-opacity duration-300 ${
                          completedSteps.has(index)
                            ? 'opacity-20 bg-green-500'
                            : 'opacity-0 group-hover:opacity-20 bg-blue-500'
                        } blur`}></div>
                        <div className="relative flex items-center justify-center w-full h-full text-lg font-medium">
                          {completedSteps.has(index) ? '✓' : index + 1}
                        </div>
                      </button>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className={`text-sm font-medium ${
                          completedSteps.has(index)
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          Step {index + 1} of {steps.length}
                        </span>
                        {completedSteps.has(index) && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            Completed
                          </span>
                        )}
                      </div>
                      <p className={`text-gray-900 dark:text-gray-100 leading-relaxed ${
                        completedSteps.has(index) ? 'line-through opacity-75' : ''
                      }`}>
                        {step}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Success Message */}
        {completedSteps.size === steps.length && (
          <div className="relative mt-8">
            <div className="absolute -inset-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl blur-xl"></div>
            <div className="relative p-6 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-green-200/50 dark:border-green-800/50">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="relative w-12 h-12">
                    <div className="absolute inset-0 bg-green-500 rounded-xl opacity-20 blur"></div>
                    <div className="relative flex items-center justify-center w-full h-full bg-white dark:bg-gray-800 rounded-xl">
                      <span className="text-2xl">🎉</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
                    Congratulations! All steps completed
                  </h4>
                  <p className="text-green-600 dark:text-green-300">
                    You've successfully completed all troubleshooting steps. If the issue persists, 
                    consider consulting a professional e-bike technician.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Additional Help */}
        <div className="relative mt-8">
          <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl blur-xl"></div>
          <div className="relative p-6 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-blue-200/50 dark:border-blue-800/50">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="relative w-12 h-12">
                  <div className="absolute inset-0 bg-blue-500 rounded-xl opacity-20 blur"></div>
                  <div className="relative flex items-center justify-center w-full h-full bg-white dark:bg-gray-800 rounded-xl">
                    <span className="text-2xl">💡</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">
                  Need Additional Support?
                </h4>
                <p className="text-blue-600 dark:text-blue-300">
                  If these steps don't resolve your issue, document the problem with photos and 
                  reach out to your local e-bike shop or manufacturer's support team for expert assistance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

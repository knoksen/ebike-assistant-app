import type { FaultInfo } from '../logic/diagnostics'

export type FaultSelectorProps = {
  faults: FaultInfo[]
  onSelect: (id: string) => void
}

const getCategoryIcon = (category: FaultInfo['category']) => {
  switch (category) {
    case 'electrical': return '🔋'
    case 'mechanical': return '⚙️'
    case 'display': return '📺'
    case 'performance': return '📊'
    default: return '🔧'
  }
}

// (Removed unused getSeverityColor helper during cleanup)

const getSeverityBadge = (severity: FaultInfo['severity']) => {
  switch (severity) {
    case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
  }
}

export function FaultSelector({ faults, onSelect }: FaultSelectorProps) {
  const categories = Array.from(new Set(faults.map(f => f.category)))
  
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-semibold mb-2 bg-gradient-to-r from-blue-600 to-green-600 dark:from-blue-400 dark:to-green-400 bg-clip-text text-transparent">
            Diagnostic Assistant
          </h2>
          <p className="text-gray-600 dark:text-gray-400">Select the issue you're experiencing</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">System Status:</span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            <span className="w-2 h-2 mr-1.5 bg-green-400 rounded-full animate-pulse"></span>
            Online
          </span>
        </div>
      </div>

      {/* Categories */}
      {categories.map(category => (
        <div key={category} className="mb-8 last:mb-0">
          <div className="flex items-center space-x-3 mb-4">
            <div className="relative w-10 h-10">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg opacity-20 blur"></div>
              <div className="relative flex items-center justify-center w-full h-full bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <span className="text-xl">{getCategoryIcon(category)}</span>
              </div>
            </div>
            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 capitalize">
              {category} Issues
            </h3>
          </div>
          
          <div className="space-y-4">
            {faults.filter(f => f.category === category).map(f => (
              <button
                key={f.id}
                onClick={() => onSelect(f.id)}
                className="group w-full text-left"
              >
                <div className="relative">
                  <div className={`absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-green-500 rounded-xl opacity-0 group-hover:opacity-20 blur transition duration-300 ${
                    f.severity === 'high' ? 'from-red-500 to-orange-500' :
                    f.severity === 'medium' ? 'from-yellow-500 to-orange-500' :
                    'from-blue-500 to-green-500'
                  }`}></div>
                  <div className="relative p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700
                                hover:shadow-lg transition-all duration-300 group-hover:scale-[1.02]">
                    <div className="flex items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-3">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getSeverityBadge(f.severity)}`}>
                            {f.severity === 'high' ? '🚨' : f.severity === 'medium' ? '⚠️' : '✓'} {f.severity} priority
                          </span>
                          <div className="flex items-center space-x-3 text-sm text-gray-500 dark:text-gray-400">
                            <span className="flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {f.estimatedTime}
                            </span>
                            <span className="flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                              </svg>
                              {f.steps.length} steps
                            </span>
                          </div>
                        </div>
                        <div className="font-medium text-gray-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {f.question}
                        </div>
                      </div>
                      <div className="ml-4 text-blue-500 dark:text-blue-400 transform group-hover:translate-x-1 transition-transform">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}
      
      <div className="mt-8">
        <div className="relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-green-500 rounded-xl opacity-10 blur"></div>
          <div className="relative p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200/50 dark:border-blue-800/50">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="relative w-10 h-10">
                  <div className="absolute inset-0 bg-blue-500 rounded-lg opacity-20 blur"></div>
                  <div className="relative flex items-center justify-center w-full h-full bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                    <span className="text-xl">💡</span>
                  </div>
                </div>
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">Safety First</h4>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Before starting diagnostics, ensure your e-bike is on a stable surface, 
                  the battery is properly connected, and you have basic tools available. If you're not comfortable 
                  with any step, consult a professional technician.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

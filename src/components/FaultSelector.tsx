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

const getSeverityColor = (severity: FaultInfo['severity']) => {
  switch (severity) {
    case 'high': return 'border-red-200 dark:border-red-600 hover:border-red-500 dark:hover:border-red-400'
    case 'medium': return 'border-yellow-200 dark:border-yellow-600 hover:border-yellow-500 dark:hover:border-yellow-400'
    case 'low': return 'border-green-200 dark:border-green-600 hover:border-green-500 dark:hover:border-green-400'
    default: return 'border-gray-200 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400'
  }
}

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
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-6 text-gray-800 dark:text-white">
        What issue are you experiencing?
      </h2>

      {/* Categories */}
      {categories.map(category => (
        <div key={category} className="mb-8 last:mb-0">
          <h3 className="text-lg font-medium mb-4 text-gray-700 dark:text-gray-300 capitalize">
            {getCategoryIcon(category)} {category} Issues
          </h3>
          
          <div className="space-y-3">
            {faults.filter(f => f.category === category).map(f => (
              <button
                key={f.id}
                onClick={() => onSelect(f.id)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 hover:bg-blue-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${getSeverityColor(f.severity)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-gray-800 dark:text-white mb-2">
                      {f.question}
                    </div>
                    <div className="flex items-center space-x-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityBadge(f.severity)}`}>
                        {f.severity} priority
                      </span>
                      <span className="text-gray-500 dark:text-gray-400">
                        ⏱️ {f.estimatedTime}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400">
                        {f.steps.length} steps
                      </span>
                    </div>
                  </div>
                  <div className="text-gray-400 ml-4">
                    →
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}
      
      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <div className="flex items-start">
          <div className="text-blue-500 mr-2">💡</div>
          <div className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Safety First:</strong> Before starting diagnostics, ensure your e-bike is on a stable surface, 
            the battery is properly connected, and you have basic tools available. If you're not comfortable 
            with any step, consult a professional technician.
          </div>
        </div>
      </div>
    </div>
  )
}

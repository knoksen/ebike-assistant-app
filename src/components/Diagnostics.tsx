import { useState } from 'react'
import { listFaults, getFaultInfo } from '../logic/diagnostics'
import { FaultSelector } from './FaultSelector'
import { SolutionSteps } from './SolutionSteps'

export function Diagnostics() {
  const [selected, setSelected] = useState<string | null>(null)

  const faults = listFaults()
  const selectedFault = selected ? getFaultInfo(selected) : undefined

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
          🔧 E-Bike Diagnostics
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Step-by-step troubleshooting for common e-bike issues
        </p>
      </div>
      
      {selected ? (
        <SolutionSteps 
          steps={selectedFault?.steps} 
          faultInfo={selectedFault}
          onBack={() => setSelected(null)} 
        />
      ) : (
        <FaultSelector faults={faults} onSelect={id => setSelected(id)} />
      )}
    </div>
  )
}

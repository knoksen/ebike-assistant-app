import { useState } from 'react'
import { listFaults, getFaultInfo } from '../logic/diagnostics'
import { FaultSelector } from './FaultSelector'
import { SolutionSteps } from './SolutionSteps'

export function Diagnostics() {
  const [selected, setSelected] = useState<string | null>(null)

  const faults = listFaults()
  const selectedFault = selected ? getFaultInfo(selected) : undefined

  return (
    <div className="max-w-4xl mx-auto px-4">
      <div className="relative text-center mb-12">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-green-500/10 to-blue-500/10 rounded-3xl blur-3xl transform -translate-y-1/2"></div>
        <div className="relative">
          <div className="inline-block mb-6">
            <div className="relative w-20 h-20 mx-auto">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-green-500 rounded-2xl opacity-20 blur-lg transform rotate-12 group-hover:rotate-0 transition-transform duration-300"></div>
              <div className="relative flex items-center justify-center w-full h-full bg-white dark:bg-gray-800 rounded-2xl shadow-lg transform -rotate-12 group-hover:rotate-0 transition-transform duration-300">
                <span className="text-4xl transform group-hover:scale-110 transition-transform duration-300">🔧</span>
              </div>
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 dark:from-blue-400 dark:to-green-400 bg-clip-text text-transparent mb-4">
            E-Bike Diagnostics
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Interactive troubleshooting system for common e-bike issues
          </p>
        </div>
      </div>
      
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-green-500/5 to-blue-500/5 rounded-2xl blur-xl"></div>
        <div className="relative bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
          {selected ? (
            <div className="slide-in">
              <SolutionSteps 
                steps={selectedFault?.steps} 
                faultInfo={selectedFault}
                onBack={() => setSelected(null)} 
              />
            </div>
          ) : (
            <div className="fade-in">
              <FaultSelector faults={faults} onSelect={id => setSelected(id)} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

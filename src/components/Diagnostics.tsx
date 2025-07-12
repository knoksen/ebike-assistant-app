import { useState } from 'react'
import { listFaults, getSteps } from '../logic/diagnostics'
import { FaultSelector } from './FaultSelector'
import { SolutionSteps } from './SolutionSteps'

export function Diagnostics() {
  const [selected, setSelected] = useState<string | null>(null)

  const faults = listFaults()
  const steps = selected ? getSteps(selected) : undefined

  return (
    <div>
      <h1>E-Bike Diagnostics</h1>
      {selected ? (
        <SolutionSteps steps={steps} onBack={() => setSelected(null)} />
      ) : (
        <FaultSelector faults={faults} onSelect={id => setSelected(id)} />
      )}
    </div>
  )
}

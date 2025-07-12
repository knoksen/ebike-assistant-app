import type { FaultInfo } from '../logic/diagnostics'

export type FaultSelectorProps = {
  faults: FaultInfo[]
  onSelect: (id: string) => void
}

export function FaultSelector({ faults, onSelect }: FaultSelectorProps) {
  return (
    <div>
      <h2>Select a problem:</h2>
      <ul>
        {faults.map(f => (
          <li key={f.id}>
            <button onClick={() => onSelect(f.id)}>{f.question}</button>
          </li>
        ))}
      </ul>
    </div>
  )
}

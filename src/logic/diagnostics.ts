export type FaultInfo = {
  id: string
  question: string
  steps: string[]
}

const faults: FaultInfo[] = [
  {
    id: 'battery',
    question: 'Battery will not charge',
    steps: [
      'Verify the charger is properly connected to the outlet and bike',
      'Inspect battery terminals for corrosion or debris',
      'Try a different power outlet or charger if available'
    ]
  },
  {
    id: 'motor',
    question: 'Motor does not run',
    steps: [
      'Ensure the battery is fully charged',
      'Check that the motor cutoff switch or brake sensors are not engaged',
      'Inspect wiring for loose or damaged connections'
    ]
  },
  {
    id: 'display',
    question: 'Display will not power on',
    steps: [
      'Confirm the battery is connected and switched on',
      'Check display wiring harness for damage',
      'Reset the system by disconnecting and reconnecting the battery'
    ]
  }
]

export function listFaults(): FaultInfo[] {
  return faults
}

export function getSteps(id: string): string[] | undefined {
  return faults.find(f => f.id === id)?.steps
}

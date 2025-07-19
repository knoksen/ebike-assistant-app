export type FaultInfo = {
  id: string
  question: string
  steps: string[]
  category: 'electrical' | 'mechanical' | 'display' | 'performance'
  severity: 'low' | 'medium' | 'high'
  estimatedTime: string
}

const faults: FaultInfo[] = [
  {
    id: 'battery-not-charging',
    question: 'Battery will not charge',
    category: 'electrical',
    severity: 'high',
    estimatedTime: '15-30 minutes',
    steps: [
      'Verify the charger is properly connected to both the wall outlet and the battery charging port',
      'Check that the charger LED indicator is functioning - it should show a red or orange light when connected',
      'Inspect the battery charging port and charger connector for any debris, corrosion, or physical damage',
      'Try a different power outlet to rule out electrical issues with the original outlet',
      'If available, test with a different compatible charger to isolate the problem',
      'Check the battery temperature - batteries may not charge if too hot or too cold',
      'Inspect the battery case for any signs of damage, swelling, or moisture ingress'
    ]
  },
  {
    id: 'motor-not-running',
    question: 'Motor does not run or assist',
    category: 'electrical',
    severity: 'high',
    estimatedTime: '20-45 minutes',
    steps: [
      'Ensure the battery is fully charged and properly seated in its mount',
      'Check that the main power switch is in the ON position',
      'Verify the display unit is powered on and showing normal readings',
      'Test that brake sensors are not preventing motor operation - lift rear wheel and spin pedals gently',
      'Inspect all visible wiring connections for looseness, damage, or corrosion',
      'Check the pedal assist sensor (PAS) for proper alignment and cleanliness',
      'Verify the throttle (if equipped) is not stuck or damaged',
      'Look for any error codes displayed on the control unit'
    ]
  },
  {
    id: 'display-not-working',
    question: 'Display will not power on',
    category: 'display',
    severity: 'medium',
    estimatedTime: '10-25 minutes',
    steps: [
      'Confirm the battery is connected, charged, and the main power switch is ON',
      'Check the display wiring harness connection at both the display and controller ends',
      'Look for any visible damage to the display unit, wiring, or connectors',
      'Try disconnecting and reconnecting the battery to reset the system',
      'Check for loose connections at the display mounting bracket',
      'Inspect the display cable for cuts, pinches, or wear from steering movement',
      'If removable, try reseating the display unit in its mounting dock'
    ]
  },
  {
    id: 'reduced-range',
    question: 'Battery range is much lower than expected',
    category: 'performance',
    severity: 'medium',
    estimatedTime: '15-30 minutes',
    steps: [
      'Check the battery charge level and ensure it reaches 100% when fully charged',
      'Verify tire pressure is within the recommended range (check tire sidewall)',
      'Inspect tires for excessive wear or damage that could increase rolling resistance',
      'Ensure the chain is properly lubricated and not dragging or skipping',
      'Check brake pads are not dragging against the rotors or rims',
      'Consider riding conditions - hills, headwinds, and cold weather reduce range',
      'Review your riding style - higher assist levels and speeds consume more battery',
      'Check if the battery is several years old - lithium batteries naturally degrade over time'
    ]
  },
  {
    id: 'strange-noises',
    question: 'Motor makes unusual noises',
    category: 'mechanical',
    severity: 'medium',
    estimatedTime: '20-35 minutes',
    steps: [
      'Identify when the noise occurs - during acceleration, constant speed, or when pedaling',
      'Check if the noise is coming from the motor, chain, or other drivetrain components',
      'Inspect the chain for proper lubrication, tension, and wear',
      'Examine the motor mounting bolts for tightness and proper torque',
      'Look for any debris or foreign objects caught in the motor housing or spokes',
      'Check derailleur adjustment and shifting quality if noise occurs during gear changes',
      'Listen carefully to distinguish between mechanical and electrical motor sounds',
      'Document the specific type of noise (grinding, clicking, whining) for professional diagnosis if needed'
    ]
  },
  {
    id: 'charging-slow',
    question: 'Battery charges very slowly',
    category: 'electrical',
    severity: 'low',
    estimatedTime: '10-20 minutes',
    steps: [
      'Verify you are using the original charger or a manufacturer-approved replacement',
      'Check the charger output specifications match the battery requirements',
      'Ensure the charging environment temperature is within normal range (50-80°F)',
      'Inspect charger and battery contacts for cleanliness and good connection',
      'Try charging at a different time of day to rule out electrical supply issues',
      'Monitor the charging process - some batteries charge faster initially and slower as they near full capacity',
      'Consider battery age - older batteries naturally charge more slowly and hold less capacity'
    ]
  }
]

export function listFaults(): FaultInfo[] {
  return faults
}

export function getSteps(id: string): string[] | undefined {
  return faults.find(f => f.id === id)?.steps
}

export function getFaultInfo(id: string): FaultInfo | undefined {
  return faults.find(f => f.id === id)
}

export function getFaultsByCategory(category: FaultInfo['category']): FaultInfo[] {
  return faults.filter(f => f.category === category)
}

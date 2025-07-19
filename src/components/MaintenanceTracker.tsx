import { useState, useEffect } from 'react'

type MaintenanceRecord = {
  id: string
  date: Date
  type: string
  description: string
  mileage?: number
  cost?: number
  nextDue?: Date
}

type MaintenanceType = {
  id: string
  name: string
  icon: string
  intervalMiles?: number
  intervalMonths?: number
  description: string
}

const MAINTENANCE_TYPES: MaintenanceType[] = [
  {
    id: 'chain-clean',
    name: 'Chain Cleaning',
    icon: '⚙️',
    intervalMiles: 100,
    description: 'Clean and lubricate the chain'
  },
  {
    id: 'brake-check',
    name: 'Brake Inspection',
    icon: '🛑',
    intervalMiles: 500,
    description: 'Check brake pads and adjust as needed'
  },
  {
    id: 'tire-pressure',
    name: 'Tire Pressure Check',
    icon: '🛞',
    intervalMiles: 50,
    description: 'Check and adjust tire pressure'
  },
  {
    id: 'battery-check',
    name: 'Battery Health Check',
    icon: '🔋',
    intervalMonths: 3,
    description: 'Test battery capacity and connections'
  },
  {
    id: 'general-tune',
    name: 'General Tune-up',
    icon: '🔧',
    intervalMiles: 1000,
    intervalMonths: 6,
    description: 'Complete bike inspection and adjustment'
  }
]

export function MaintenanceTracker() {
  const [records, setRecords] = useState<MaintenanceRecord[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [currentMileage, setCurrentMileage] = useState(0)

  // Load data from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('maintenance-records')
    if (saved) {
      const parsed = JSON.parse(saved)
      setRecords(parsed.map((r: any) => ({
        ...r,
        date: new Date(r.date),
        nextDue: r.nextDue ? new Date(r.nextDue) : undefined
      })))
    }

    const savedMileage = localStorage.getItem('current-mileage')
    if (savedMileage) {
      setCurrentMileage(parseInt(savedMileage))
    }
  }, [])

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('maintenance-records', JSON.stringify(records))
    localStorage.setItem('current-mileage', currentMileage.toString())
  }, [records, currentMileage])

  const addRecord = (type: string, description: string, cost?: number) => {
    const maintenanceType = MAINTENANCE_TYPES.find(t => t.id === type)
    const newRecord: MaintenanceRecord = {
      id: Date.now().toString(),
      date: new Date(),
      type,
      description,
      mileage: currentMileage,
      cost,
      nextDue: maintenanceType?.intervalMiles 
        ? new Date(Date.now() + (maintenanceType.intervalMiles * 7 * 24 * 60 * 60 * 1000)) // Estimate based on miles
        : maintenanceType?.intervalMonths 
        ? new Date(Date.now() + (maintenanceType.intervalMonths * 30 * 24 * 60 * 60 * 1000))
        : undefined
    }

    setRecords(prev => [newRecord, ...prev])
    setShowAddForm(false)
  }

  const getUpcomingMaintenance = () => {
    const upcoming: { type: MaintenanceType; dueIn: string; overdue: boolean }[] = []
    
    MAINTENANCE_TYPES.forEach(type => {
      const lastRecord = records.find(r => r.type === type.id)
      let dueIn = ''
      let overdue = false

      if (type.intervalMiles) {
        const milesSinceLastService = lastRecord 
          ? currentMileage - (lastRecord.mileage || 0)
          : currentMileage
        
        if (milesSinceLastService >= type.intervalMiles) {
          dueIn = 'Overdue'
          overdue = true
        } else {
          const remaining = type.intervalMiles - milesSinceLastService
          dueIn = `${remaining} miles`
        }
      } else if (type.intervalMonths) {
        const monthsSinceLastService = lastRecord
          ? (Date.now() - lastRecord.date.getTime()) / (1000 * 60 * 60 * 24 * 30)
          : 999
        
        if (monthsSinceLastService >= type.intervalMonths) {
          dueIn = 'Overdue'
          overdue = true
        } else {
          const remaining = Math.ceil(type.intervalMonths - monthsSinceLastService)
          dueIn = `${remaining} months`
        }
      }

      upcoming.push({ type, dueIn, overdue })
    })

    return upcoming.sort((a, b) => {
      if (a.overdue && !b.overdue) return -1
      if (!a.overdue && b.overdue) return 1
      return 0
    })
  }

  const upcoming = getUpcomingMaintenance()

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
          🔧 Maintenance Tracker
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Keep track of your e-bike maintenance and stay ahead of issues
        </p>
      </div>

      {/* Current Mileage */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
          Current Odometer
        </h2>
        <div className="flex items-center space-x-4">
          <input
            type="number"
            value={currentMileage}
            onChange={(e) => setCurrentMileage(parseInt(e.target.value) || 0)}
            className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white"
            placeholder="Enter current mileage"
          />
          <span className="text-gray-600 dark:text-gray-300">miles</span>
        </div>
      </div>

      {/* Upcoming Maintenance */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
          Upcoming Maintenance
        </h2>
        <div className="space-y-3">
          {upcoming.map(({ type, dueIn, overdue }) => (
            <div
              key={type.id}
              className={`flex items-center justify-between p-4 rounded-lg border ${
                overdue 
                  ? 'border-red-300 bg-red-50 dark:bg-red-900/20' 
                  : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{type.icon}</span>
                <div>
                  <h3 className={`font-medium ${overdue ? 'text-red-800 dark:text-red-200' : 'text-gray-800 dark:text-white'}`}>
                    {type.name}
                  </h3>
                  <p className={`text-sm ${overdue ? 'text-red-600 dark:text-red-300' : 'text-gray-600 dark:text-gray-300'}`}>
                    {type.description}
                  </p>
                </div>
              </div>
              <div className={`font-semibold ${overdue ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'}`}>
                {dueIn}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Maintenance Record */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            Maintenance Records
          </h2>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            {showAddForm ? 'Cancel' : 'Add Record'}
          </button>
        </div>

        {showAddForm && (
          <div className="border-t pt-4 mb-4">
            <h3 className="font-medium text-gray-800 dark:text-white mb-3">Add New Maintenance Record</h3>
            <div className="grid gap-4">
              {MAINTENANCE_TYPES.map(type => (
                <button
                  key={type.id}
                  onClick={() => {
                    const description = prompt(`Enter details for ${type.name}:`, type.description)
                    if (description) {
                      const costStr = prompt('Enter cost (optional):')
                      const cost = costStr ? parseFloat(costStr) : undefined
                      addRecord(type.id, description, cost)
                    }
                  }}
                  className="flex items-center space-x-3 p-3 text-left border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <span className="text-xl">{type.icon}</span>
                  <div>
                    <div className="font-medium text-gray-800 dark:text-white">{type.name}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">{type.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Records List */}
        <div className="space-y-3">
          {records.slice(0, 10).map(record => {
            const type = MAINTENANCE_TYPES.find(t => t.id === record.type)
            return (
              <div key={record.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-xl">{type?.icon || '🔧'}</span>
                  <div>
                    <h3 className="font-medium text-gray-800 dark:text-white">
                      {type?.name || record.type}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {record.description}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {record.date.toLocaleDateString()}
                      {record.mileage && ` • ${record.mileage} miles`}
                      {record.cost && ` • $${record.cost}`}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
          
          {records.length === 0 && (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">
              No maintenance records yet. Add your first record above!
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

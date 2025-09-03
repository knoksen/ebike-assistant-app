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
            Maintenance Tracker
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Advanced monitoring system for your e-bike maintenance schedule
          </p>
        </div>
      </div>

      {/* Current Mileage */}
      <div className="relative mb-8">
        <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/5 via-green-500/5 to-blue-500/5 rounded-2xl blur-xl"></div>
        <div className="relative bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 bg-blue-500 rounded-xl opacity-20 blur"></div>
                <div className="relative flex items-center justify-center w-full h-full bg-white dark:bg-gray-800 rounded-xl">
                  <span className="text-2xl">📊</span>
                </div>
              </div>
              <div>
                <h2 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-green-600 dark:from-blue-400 dark:to-green-400 bg-clip-text text-transparent">
                  Odometer Reading
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Track your e-bike's total mileage</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">Last updated:</span>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {new Date().toLocaleDateString()}
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-xs">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-green-500 rounded-xl opacity-10 blur group-hover:opacity-20 transition-opacity duration-300"></div>
              <input
                type="number"
                value={currentMileage}
                onChange={(e) => setCurrentMileage(parseInt(e.target.value) || 0)}
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700
                         text-2xl font-bold text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500
                         focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
                         transition-all duration-300"
                placeholder="Enter mileage"
              />
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 dark:from-blue-400 dark:to-green-400 bg-clip-text text-transparent">
                miles
              </span>
              <div className="text-xs text-gray-500 dark:text-gray-400">total</div>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Maintenance */}
      <div className="relative mb-8">
        <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/5 via-green-500/5 to-blue-500/5 rounded-2xl blur-xl"></div>
        <div className="relative bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 bg-blue-500 rounded-xl opacity-20 blur"></div>
                <div className="relative flex items-center justify-center w-full h-full bg-white dark:bg-gray-800 rounded-xl">
                  <span className="text-2xl">⚡</span>
                </div>
              </div>
              <div>
                <h2 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-green-600 dark:from-blue-400 dark:to-green-400 bg-clip-text text-transparent">
                  Maintenance Schedule
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Upcoming and overdue maintenance tasks
                </p>
              </div>
            </div>
            <div className="flex items-center">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                <span className="w-2 h-2 mr-1.5 bg-blue-400 rounded-full animate-pulse"></span>
                Real-time tracking
              </span>
            </div>
          </div>

          <div className="grid gap-4">
            {upcoming.map(({ type, dueIn, overdue }) => (
              <div key={type.id} className="group relative">
                <div className={`absolute -inset-0.5 rounded-xl blur transition-all duration-300 ${
                  overdue 
                    ? 'bg-gradient-to-r from-red-500 to-orange-500 opacity-20'
                    : 'bg-gradient-to-r from-blue-500 to-green-500 opacity-0 group-hover:opacity-20'
                }`}></div>
                <div className={`relative p-4 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border transition-all duration-300 ${
                  overdue
                    ? 'border-red-200/50 dark:border-red-800/50'
                    : 'border-gray-200/50 dark:border-gray-700/50'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="relative w-12 h-12">
                        <div className={`absolute inset-0 rounded-lg opacity-20 blur ${
                          overdue ? 'bg-red-500' : 'bg-blue-500'
                        }`}></div>
                        <div className="relative flex items-center justify-center w-full h-full bg-white dark:bg-gray-800 rounded-lg">
                          <span className="text-2xl">{type.icon}</span>
                        </div>
                      </div>
                      <div>
                        <h3 className={`font-medium text-lg ${
                          overdue ? 'text-red-800 dark:text-red-200' : 'text-gray-800 dark:text-white'
                        }`}>
                          {type.name}
                        </h3>
                        <p className={`text-sm ${
                          overdue ? 'text-red-600 dark:text-red-300' : 'text-gray-600 dark:text-gray-300'
                        }`}>
                          {type.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        overdue
                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      }`}>
                        <span className={`w-2 h-2 mr-1.5 rounded-full ${
                          overdue ? 'bg-red-400 animate-pulse' : 'bg-green-400'
                        }`}></span>
                        {overdue ? 'Overdue' : 'On Track'}
                      </div>
                      <div className={`mt-2 text-sm font-medium ${
                        overdue ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'
                      }`}>
                        {dueIn}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Maintenance Record */}
      <div className="relative bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg rounded-2xl shadow-xl p-6 mb-12 border border-gray-200/50 dark:border-gray-700/50">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold bg-gradient-to-r from-blue-600 to-green-600 dark:from-blue-400 dark:to-green-400 bg-clip-text text-transparent">
            Maintenance Records
          </h2>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn-primary px-6 py-2 text-base shadow-lg hover:scale-105 active:scale-95 transition-all duration-200"
          >
            <span className="mr-2">{showAddForm ? '✖️' : '➕'}</span>
            {showAddForm ? 'Cancel' : 'Add Record'}
          </button>
        </div>

        {showAddForm && (
          <div className="border-t pt-4 mb-4 fade-in">
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
                  className="group flex items-center space-x-3 p-3 text-left border border-gray-200 dark:border-gray-600 rounded-lg bg-white/70 dark:bg-gray-800/70 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all duration-200 shadow-sm hover:shadow-lg"
                >
                  <span className="text-2xl group-hover:scale-110 transition-transform">{type.icon}</span>
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
        <div className="space-y-4 mt-6">
          {records.slice(0, 10).map(record => {
            const type = MAINTENANCE_TYPES.find(t => t.id === record.type)
            return (
              <div key={record.id} className="group relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-green-500 rounded-xl opacity-0 group-hover:opacity-20 blur transition duration-300"></div>
                <div className="relative flex items-center justify-between p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-sm hover:shadow-lg transition-all duration-300 group-hover:scale-[1.02]">
                  <div className="flex items-center space-x-4">
                    <span className="text-2xl drop-shadow-sm">{type?.icon || '🔧'}</span>
                    <div>
                      <h3 className="font-medium text-lg text-gray-800 dark:text-white">
                        {type?.name || record.type}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {record.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
                        <span>{record.date.toLocaleDateString()}</span>
                        {record.mileage && <span>• {record.mileage} miles</span>}
                        {record.cost && <span>• ${record.cost}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-blue-100 to-green-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      <svg className="w-4 h-4 mr-1 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                      Saved
                    </span>
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
        {/* Floating Action Button */}
        <button
          onClick={() => setShowAddForm(true)}
          className="fixed bottom-10 right-10 z-50 btn-primary rounded-full w-16 h-16 flex items-center justify-center text-3xl shadow-2xl hover:scale-110 transition-transform duration-300"
          title="Add Maintenance Record"
          style={{ boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)' }}
        >
          ➕
        </button>
      </div>
    </div>
  )
}

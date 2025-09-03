import React, { useState } from 'react'

const PARTS = [
  { name: '48V 10Ah Lithium Battery', price: 199.99 },
  { name: 'Hydraulic Disc Brake Kit', price: 89.99 },
  { name: 'Puncture-Resistant Tire', price: 59.95 },
  { name: 'Heavy Duty Chain', price: 34.99 }
]

const PartsSearch: React.FC = () => {
  const [query, setQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)

  const filtered = PARTS.filter(part =>
    part.name.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div className="slide-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="relative w-8 h-8">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg opacity-20 blur"></div>
            <div className="relative flex items-center justify-center w-full h-full bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <span className="text-xl">🔍</span>
            </div>
          </div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-green-600 dark:from-blue-400 dark:to-green-400 bg-clip-text text-transparent">
            Parts Search
          </h2>
        </div>
        <div className="flex items-center space-x-2">
          <span className="badge-success animate-pulse">Real-time</span>
        </div>
      </div>
      <div className="relative group">
        <div className={`absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg opacity-20 blur transition duration-300 ${isFocused ? 'opacity-30' : 'group-hover:opacity-30'}`}></div>
        <div className="relative">
          <input
            className="w-full px-10 py-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700
                     text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500
                     focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
                     transition-all duration-300"
            placeholder="Search for parts..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
          <div className="absolute inset-y-0 left-3 flex items-center text-gray-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>
      <div className="mt-6 space-y-3">
        {filtered.map((part, i) => (
          <div 
            key={i} 
            className="group relative"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg opacity-0 group-hover:opacity-20 blur transition duration-300"></div>
            <div className="relative flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700
                          hover:shadow-lg transition-all duration-300 group-hover:scale-[1.02]">
              <div className="flex items-center space-x-4">
                <div className="relative w-10 h-10">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg opacity-20 group-hover:opacity-30 blur transition duration-300"></div>
                  <div className="relative flex items-center justify-center w-full h-full bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                    <span className="text-xl transform group-hover:scale-110 transition-transform duration-300">🔧</span>
                  </div>
                </div>
                <div>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{part.name}</span>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Part ID: #{(i + 1).toString().padStart(4, '0')}</div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className="font-bold text-lg bg-gradient-to-r from-green-600 to-blue-600 dark:from-green-400 dark:to-blue-400 bg-clip-text text-transparent">
                  ${part.price}
                </span>
                <button className="btn-primary py-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <div className="relative w-16 h-16 mx-auto mb-4">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-green-500 rounded-full opacity-20 blur"></div>
              <div className="relative flex items-center justify-center w-full h-full bg-white dark:bg-gray-800 rounded-full">
                <span className="text-4xl">🔍</span>
              </div>
            </div>
            <p className="text-lg">No parts found</p>
            <p className="text-sm text-gray-400">Try a different search term</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default PartsSearch

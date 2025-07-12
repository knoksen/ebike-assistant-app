import React, { useState } from 'react'

const PARTS = [
  { name: '48V 10Ah Lithium Battery', price: 199.99 },
  { name: 'Hydraulic Disc Brake Kit', price: 89.99 },
  { name: 'Puncture-Resistant Tire', price: 59.95 },
  { name: 'Heavy Duty Chain', price: 34.99 }
]

const PartsSearch: React.FC = () => {
  const [query, setQuery] = useState('')

  const filtered = PARTS.filter(part =>
    part.name.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md mt-4">
      <h2 className="text-lg font-bold mb-2">Parts Search</h2>
      <input
        className="w-full p-2 rounded border dark:bg-gray-700 dark:text-white mb-2"
        placeholder="Type to search for parts…"
import { useState } from 'react'
import PartItem, { Part } from './PartItem'

const inventory: Part[] = [
  { id: 1, name: 'Battery Pack' },
  { id: 2, name: 'Brake Pads' },
  { id: 3, name: 'Controller' },
  { id: 4, name: 'Tire Tube' }
]

export default function PartsSearch() {
  const [query, setQuery] = useState('')
  const results = inventory.filter(p =>
    p.name.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div>
      <h1>Search Parts</h1>
      <input
        placeholder="Search for parts..."
        value={query}
        onChange={e => setQuery(e.target.value)}
      />
      <ul>
        {filtered.map((part, i) => (
          <li key={i} className="py-1 border-b border-gray-200 dark:border-gray-700">
            <span>{part.name}</span>
            <span className="float-right font-bold text-green-600">
              ${part.price}
            </span>
          </li>
        ))}
        {filtered.length === 0 && (
          <li className="text-gray-500">No parts found.</li>
        )}
        {results.map(p => (
          <PartItem key={p.id} part={p} />
        ))}
      </ul>
    </div>
  )
}

export default PartsSearch

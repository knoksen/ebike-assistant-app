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
        {results.map(p => (
          <PartItem key={p.id} part={p} />
        ))}
      </ul>
    </div>
  )
}

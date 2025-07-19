import { useState } from 'react'
import PartsSearch from '../components/PartsSearch'
import PartItem from '../components/PartItem'

// Enhanced parts data with more details
const PARTS_CATEGORIES = [
  {
    name: 'Battery & Power',
    icon: '🔋',
    parts: [
      { 
        id: 'bat001',
        name: '48V 10Ah Lithium Battery', 
        price: 199.99,
        category: 'Battery & Power',
        compatibility: ['Mountain bikes', 'City bikes'],
        description: 'High-capacity lithium-ion battery with BMS protection',
        inStock: true
      },
      { 
        id: 'bat002',
        name: '36V 12Ah Lithium Battery', 
        price: 179.99,
        category: 'Battery & Power',
        compatibility: ['City bikes', 'Folding bikes'],
        description: 'Compact and lightweight battery for urban commuting',
        inStock: true
      },
      { 
        id: 'chr001',
        name: '48V 2A Smart Charger', 
        price: 49.99,
        category: 'Battery & Power',
        compatibility: ['48V batteries'],
        description: 'Smart charger with LED indicators and automatic cutoff',
        inStock: false
      }
    ]
  },
  {
    name: 'Braking System',
    icon: '🛑',
    parts: [
      { 
        id: 'brk001',
        name: 'Hydraulic Disc Brake Kit', 
        price: 89.99,
        category: 'Braking System',
        compatibility: ['Mountain bikes', 'Road bikes'],
        description: 'Professional grade hydraulic disc brake system',
        inStock: true
      },
      { 
        id: 'brk002',
        name: 'Brake Pads (Organic)', 
        price: 24.99,
        category: 'Braking System',
        compatibility: ['Most disc brakes'],
        description: 'High-performance organic brake pads',
        inStock: true
      }
    ]
  },
  {
    name: 'Wheels & Tires',
    icon: '🛞',
    parts: [
      { 
        id: 'tir001',
        name: 'Puncture-Resistant Tire 26"', 
        price: 59.95,
        category: 'Wheels & Tires',
        compatibility: ['26" wheels'],
        description: 'Kevlar-reinforced tire for maximum puncture protection',
        inStock: true
      },
      { 
        id: 'tir002',
        name: 'Puncture-Resistant Tire 28"', 
        price: 64.95,
        category: 'Wheels & Tires',
        compatibility: ['28" wheels'],
        description: 'Premium touring tire with excellent grip and durability',
        inStock: true
      }
    ]
  },
  {
    name: 'Drive Train',
    icon: '⚙️',
    parts: [
      { 
        id: 'chn001',
        name: 'Heavy Duty Chain KMC X11', 
        price: 34.99,
        category: 'Drive Train',
        compatibility: ['11-speed systems'],
        description: 'Durable chain designed for e-bike torque loads',
        inStock: true
      },
      { 
        id: 'chn002',
        name: '9-Speed Chain', 
        price: 24.99,
        category: 'Drive Train',
        compatibility: ['9-speed systems'],
        description: 'Standard replacement chain for 9-speed drivetrains',
        inStock: true
      }
    ]
  }
]

const ALL_PARTS = PARTS_CATEGORIES.flatMap(category => category.parts)

export default function Parts() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredParts = selectedCategory 
    ? ALL_PARTS.filter(part => part.category === selectedCategory)
    : ALL_PARTS

  const searchFilteredParts = filteredParts.filter(part =>
    part.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    part.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    part.compatibility.some(comp => comp.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
            🔍 E-Bike Parts & Components
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Find compatible replacement parts and upgrades for your e-bike
          </p>
        </div>

        {/* Search */}
        <div className="max-w-md mx-auto mb-8">
          <input
            type="text"
            placeholder="Search parts, compatibility, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-full transition-colors ${
              selectedCategory === null
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            All Categories
          </button>
          {PARTS_CATEGORIES.map(category => (
            <button
              key={category.name}
              onClick={() => setSelectedCategory(category.name)}
              className={`px-4 py-2 rounded-full transition-colors ${
                selectedCategory === category.name
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {category.icon} {category.name}
            </button>
          ))}
        </div>

        {/* Results */}
        <div className="mb-4">
          <p className="text-gray-600 dark:text-gray-400 text-center">
            Showing {searchFilteredParts.length} parts
            {selectedCategory && ` in ${selectedCategory}`}
            {searchQuery && ` matching "${searchQuery}"`}
          </p>
        </div>

        {/* Parts Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {searchFilteredParts.map(part => (
            <PartItem key={part.id} part={part} />
          ))}
        </div>

        {searchFilteredParts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
              No parts found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your search terms or category filter
            </p>
          </div>
        )}

        {/* Quick Search Component */}
        <div className="max-w-2xl mx-auto mt-12">
          <h2 className="text-2xl font-semibold text-center mb-6 text-gray-800 dark:text-white">
            Quick Search
          </h2>
          <PartsSearch />
        </div>
      </div>
    </div>
  )
}

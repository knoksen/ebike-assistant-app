import { useState } from 'react'

type Guide = {
  id: string
  title: string
  category: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  readTime: string
  content: string[]
  tools?: string[]
  safety?: string[]
}

const GUIDES: Guide[] = [
  {
    id: 'chain-maintenance',
    title: 'How to Clean and Lubricate Your E-Bike Chain',
    category: 'Maintenance',
    difficulty: 'Beginner',
    readTime: '5 min',
    content: [
      'A clean and well-lubricated chain is essential for smooth operation and extending the life of your drivetrain.',
      'Start by shifting to the smallest chainring and cassette cog to reduce chain tension.',
      'Use a degreaser and chain cleaning tool to remove old lubricant and dirt buildup.',
      'Rinse thoroughly with water and dry completely with a clean cloth.',
      'Apply e-bike specific chain lubricant to each link while slowly rotating the pedals.',
      'Wipe off excess lubricant with a clean cloth to prevent attracting dirt.',
      'Test the chain by shifting through all gears to ensure smooth operation.'
    ],
    tools: ['Chain cleaner', 'Degreaser', 'Clean cloths', 'Chain lubricant'],
    safety: [
      'Ensure the bike is stable and secure before starting',
      'Keep fingers clear of moving parts',
      'Use appropriate degreaser for your chain type'
    ]
  },
  {
    id: 'tire-pressure',
    title: 'Maintaining Proper Tire Pressure',
    category: 'Maintenance',
    difficulty: 'Beginner',
    readTime: '3 min',
    content: [
      'Proper tire pressure is crucial for performance, comfort, and preventing flats.',
      'Check the recommended pressure range printed on your tire sidewall.',
      'Use a quality pressure gauge for accurate readings.',
      'Check pressure when tires are cool, not after riding.',
      'For e-bikes, maintain pressure at the higher end of the recommended range due to added weight.',
      'Adjust pressure based on riding conditions - lower for trail riding, higher for road riding.',
      'Inspect tires for wear, cuts, or embedded objects while checking pressure.'
    ],
    tools: ['Tire pressure gauge', 'Floor pump', 'Hand pump (backup)'],
    safety: [
      'Never exceed the maximum pressure listed on the tire',
      'Replace worn or damaged tires promptly',
      'Check pressure weekly for optimal performance'
    ]
  },
  {
    id: 'battery-care',
    title: 'E-Bike Battery Care and Storage',
    category: 'Battery',
    difficulty: 'Beginner',
    readTime: '4 min',
    content: [
      'Proper battery care significantly extends battery life and maintains performance.',
      'Store batteries at room temperature (60-70°F) when possible.',
      'For long-term storage, charge to 50-60% capacity.',
      'Avoid completely draining the battery - recharge when it reaches 20-30%.',
      'Clean battery contacts regularly with a dry cloth.',
      'Remove battery during washing or pressure cleaning.',
      'Use only the manufacturer-approved charger for your specific battery.',
      'Allow batteries to cool down before charging after heavy use.'
    ],
    tools: ['Soft cloth', 'Appropriate charger'],
    safety: [
      'Never attempt to open or repair the battery yourself',
      'Store away from heat sources and direct sunlight',
      'Dispose of old batteries at proper recycling centers'
    ]
  },
  {
    id: 'brake-adjustment',
    title: 'Basic Brake Adjustment and Maintenance',
    category: 'Maintenance',
    difficulty: 'Intermediate',
    readTime: '8 min',
    content: [
      'Well-maintained brakes are essential for safe e-bike operation.',
      'Check brake pads for wear - replace when less than 1mm thick.',
      'Ensure brake levers feel firm and engage at proper distance from handlebars.',
      'For disc brakes, check rotor for warping by spinning wheel and watching for wobble.',
      'Clean rotors with isopropyl alcohol and a clean cloth regularly.',
      'Adjust cable tension if brakes feel loose or require excessive lever pull.',
      'Check that brake pads contact the rotor evenly across their surface.',
      'Test brakes at low speed before each ride to ensure proper function.'
    ],
    tools: ['Allen keys', 'Cable cutters', 'Isopropyl alcohol', 'Clean cloths'],
    safety: [
      'Test brakes thoroughly after any adjustment',
      'If uncertain about brake work, consult a professional',
      'Replace worn components promptly for safety'
    ]
  },
  {
    id: 'motor-maintenance',
    title: 'E-Bike Motor Care and Troubleshooting',
    category: 'Motor',
    difficulty: 'Intermediate',
    readTime: '6 min',
    content: [
      'E-bike motors require minimal maintenance but benefit from regular care.',
      'Keep the motor housing clean and dry - avoid pressure washing directly.',
      'Check all electrical connections for tightness and corrosion monthly.',
      'Listen for unusual noises during operation - grinding or clicking sounds need attention.',
      'Ensure proper chain line and derailleur adjustment to reduce motor strain.',
      'Keep firmware updated if your system supports updates.',
      'Monitor motor temperature - allow cooling time after intensive use.',
      'Have motor serviced annually by qualified technician for optimal performance.'
    ],
    tools: ['Soft brush', 'Clean cloths', 'Dielectric grease'],
    safety: [
      'Never immerse motor in water',
      'Turn off system before cleaning or inspection',
      'Professional service recommended for internal motor issues'
    ]
  },
  {
    id: 'winter-storage',
    title: 'Preparing Your E-Bike for Winter Storage',
    category: 'Storage',
    difficulty: 'Beginner',
    readTime: '10 min',
    content: [
      'Proper winter storage protects your e-bike and ensures it\'s ready for spring.',
      'Clean the bike thoroughly, removing all dirt and salt residue.',
      'Charge battery to 50-60% and store in a temperature-controlled environment.',
      'Lubricate the chain and apply frame protection as needed.',
      'Inflate tires to proper pressure to prevent flat spots.',
      'Store in a dry location away from temperature extremes.',
      'Cover with breathable material to prevent dust accumulation.',
      'Check on the bike monthly and top up tire pressure as needed.',
      'Recharge battery every 2-3 months during long-term storage.'
    ],
    tools: ['Bike cleaner', 'Chain lubricant', 'Tire pump', 'Bike cover'],
    safety: [
      'Ensure storage area is secure and dry',
      'Remove battery if storing in unheated areas',
      'Check with manufacturer for specific storage recommendations'
    ]
  }
]

export function TipsAndGuides() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null)

  const categories = Array.from(new Set(GUIDES.map(g => g.category)))
  const filteredGuides = selectedCategory 
    ? GUIDES.filter(g => g.category === selectedCategory)
    : GUIDES

  if (selectedGuide) {
    return (
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => setSelectedGuide(null)}
          className="flex items-center text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 mb-6"
        >
          ← Back to Guides
        </button>

        <article className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <header className="mb-8">
            <div className="flex items-center space-x-4 mb-4">
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm rounded-full">
                {selectedGuide.category}
              </span>
              <span className={`px-3 py-1 text-sm rounded-full ${
                selectedGuide.difficulty === 'Beginner' 
                  ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                  : selectedGuide.difficulty === 'Intermediate'
                  ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                  : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
              }`}>
                {selectedGuide.difficulty}
              </span>
              <span className="text-gray-500 dark:text-gray-400 text-sm">
                {selectedGuide.readTime} read
              </span>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
              {selectedGuide.title}
            </h1>
          </header>

          {selectedGuide.tools && (
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                🔧 Tools Needed
              </h3>
              <ul className="text-sm text-blue-700 dark:text-blue-300">
                {selectedGuide.tools.map((tool, index) => (
                  <li key={index} className="flex items-center">
                    <span className="text-blue-500 mr-2">•</span>
                    {tool}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {selectedGuide.safety && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <h3 className="font-semibold text-red-800 dark:text-red-200 mb-2">
                ⚠️ Safety Notes
              </h3>
              <ul className="text-sm text-red-700 dark:text-red-300">
                {selectedGuide.safety.map((note, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-red-500 mr-2 mt-1">•</span>
                    {note}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="prose dark:prose-invert max-w-none">
            {selectedGuide.content.map((paragraph, index) => (
              <p key={index} className="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        </article>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
          📚 Tips & Guides
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Learn how to maintain and care for your e-bike with our comprehensive guides
        </p>
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
          All Guides
        </button>
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-full transition-colors ${
              selectedCategory === category
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Guides Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGuides.map(guide => (
          <div
            key={guide.id}
            onClick={() => setSelectedGuide(guide)}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer"
          >
            <div className="flex items-center space-x-2 mb-3">
              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded">
                {guide.category}
              </span>
              <span className={`px-2 py-1 text-xs rounded ${
                guide.difficulty === 'Beginner' 
                  ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                  : guide.difficulty === 'Intermediate'
                  ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                  : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
              }`}>
                {guide.difficulty}
              </span>
            </div>
            
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
              {guide.title}
            </h3>
            
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
              {guide.content[0]}
            </p>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-500 dark:text-gray-400 text-sm">
                {guide.readTime} read
              </span>
              <span className="text-blue-600 hover:text-blue-700 dark:text-blue-400 text-sm font-medium">
                Read Guide →
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

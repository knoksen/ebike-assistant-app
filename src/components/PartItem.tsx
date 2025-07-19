export type Part = {
  id: string
  name: string
  price: number
  category: string
  compatibility: string[]
  description: string
  inStock: boolean
}

export default function PartItem({ part }: { part: Part }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
          {part.name}
        </h3>
        <div className="flex items-center">
          <span className="text-xl font-bold text-green-600 dark:text-green-400">
            ${part.price}
          </span>
        </div>
      </div>

      {/* Stock Status */}
      <div className="mb-3">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          part.inStock 
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
        }`}>
          {part.inStock ? '✓ In Stock' : '⚠ Out of Stock'}
        </span>
      </div>

      {/* Description */}
      <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
        {part.description}
      </p>

      {/* Compatibility */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Compatible with:
        </h4>
        <div className="flex flex-wrap gap-1">
          {part.compatibility.slice(0, 3).map((comp, index) => (
            <span 
              key={index}
              className="inline-block bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs px-2 py-1 rounded-full"
            >
              {comp}
            </span>
          ))}
          {part.compatibility.length > 3 && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              +{part.compatibility.length - 3} more
            </span>
          )}
        </div>
      </div>

      {/* Action Button */}
      <button 
        className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
          part.inStock
            ? 'bg-blue-600 hover:bg-blue-700 text-white'
            : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
        }`}
        disabled={!part.inStock}
      >
        {part.inStock ? 'View Details' : 'Notify When Available'}
      </button>
    </div>
  )
}

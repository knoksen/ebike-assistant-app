import BoostSettings from '../components/BoostSettings'

export default function Boost() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Power Boost Settings</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Configure your e-bike's power assistance profiles and boost settings
        </p>
      </div>
      
      <BoostSettings />
    </div>
  )
}

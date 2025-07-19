import { Link } from 'react-router-dom'
import PartsSearch from '../components/PartsSearch'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="mb-6">
            <img 
              src={import.meta.env.BASE_URL + 'ebike-icon.svg'} 
              alt="E-Bike Assistant" 
              className="w-24 h-24 mx-auto mb-4"
            />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
            E-Bike Assistant
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Your comprehensive companion for e-bike maintenance, troubleshooting, and parts management
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="text-3xl mb-4">🔧</div>
            <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">
              Diagnostics & Troubleshooting
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Step-by-step guidance to identify and fix common e-bike issues
            </p>
            <Link 
              to="/diagnostics" 
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Start Diagnostics
            </Link>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="text-3xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">
              Parts Search
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Find compatible components and replacement parts for your e-bike
            </p>
            <Link 
              to="/parts" 
              className="inline-block bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Browse Parts
            </Link>
          </div>
        </div>

        {/* Quick Parts Search */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-semibold text-center mb-6 text-gray-800 dark:text-white">
            Quick Parts Search
          </h2>
          <PartsSearch />
        </div>

        {/* App Features */}
        <div className="mt-12 text-center">
          <h2 className="text-2xl font-semibold mb-8 text-gray-800 dark:text-white">
            Why Choose E-Bike Assistant?
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl mb-2">📱</div>
              <h4 className="font-semibold mb-2 text-gray-800 dark:text-white">Progressive Web App</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Install on mobile devices for offline access
              </p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">🖥️</div>
              <h4 className="font-semibold mb-2 text-gray-800 dark:text-white">Desktop Application</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Native support for Windows, macOS, and Linux
              </p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">⚡</div>
              <h4 className="font-semibold mb-2 text-gray-800 dark:text-white">Fast & Responsive</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Built with modern web technologies
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

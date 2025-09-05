import { Link } from 'react-router-dom'
import PartsSearch from '../components/PartsSearch'
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const viteBase: string = ((import.meta as any).env && (import.meta as any).env.BASE_URL) || '/'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="relative text-center mb-12 fade-in">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 to-transparent dark:from-blue-500/5 rounded-3xl blur-3xl"></div>
          <div className="relative">
            <div className="mb-6 transform hover:scale-105 transition-transform duration-300">
              <img
                src={`${viteBase}ebike-icon.svg`}
                alt="E-Bike Assistant"
                className="w-24 h-24 mx-auto mb-4 drop-shadow-lg"
              />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-green-600 dark:from-blue-400 dark:to-green-400 bg-clip-text text-transparent mb-4">
              E-Bike Assistant
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
              Your comprehensive companion for e-bike maintenance, troubleshooting, and parts management
            </p>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 mb-12">
          <div className="card p-6 slide-in group">
            <div className="relative mb-4 w-16 h-16 mx-auto">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-green-500 rounded-xl opacity-20 group-hover:opacity-30 blur transition-opacity duration-300"></div>
              <div className="relative flex items-center justify-center w-full h-full bg-white dark:bg-gray-800 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <span className="text-3xl">🔧</span>
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
              Diagnostics
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
              Step-by-step guidance to identify and fix common e-bike issues
            </p>
            <Link 
              to="/diagnostics" 
              className="btn-primary text-sm group-hover:shadow-lg group-hover:shadow-blue-500/25 transition-all duration-300"
            >
              Start Diagnostics
            </Link>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="text-3xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">
              Parts Search
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
              Find compatible components and replacement parts for your e-bike
            </p>
            <Link 
              to="/parts" 
              className="inline-block bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
            >
              Browse Parts
            </Link>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="text-3xl mb-4">📋</div>
            <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">
              Maintenance
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
              Keep track of maintenance schedules and service history
            </p>
            <Link 
              to="/maintenance" 
              className="inline-block bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
            >
              Track Maintenance
            </Link>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="text-3xl mb-4">📚</div>
            <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">
              Tips & Guides
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
              Learn maintenance techniques and best practices
            </p>
            <Link 
              to="/guides" 
              className="inline-block bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
            >
              Read Guides
            </Link>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="text-3xl mb-4">🚴‍♂️</div>
            <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">
              Ride Tracker
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
              Log your rides and track your e-bike adventures and statistics
            </p>
            <Link 
              to="/rides" 
              className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
            >
              Track Rides
            </Link>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="text-3xl mb-4">⚙️</div>
            <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">
              Settings
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
              Customize your preferences and manage your e-bike profile
            </p>
            <Link 
              to="/settings" 
              className="inline-block bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
            >
              Open Settings
            </Link>
          </div>
        </div>

        {/* Quick Parts Search */}
        <div className="max-w-2xl mx-auto relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-green-500/5 to-blue-500/5 rounded-2xl blur-2xl transform scale-105"></div>
          <div className="relative bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
            <h2 className="text-2xl font-semibold text-center mb-6 bg-gradient-to-r from-blue-600 to-green-600 dark:from-blue-400 dark:to-green-400 bg-clip-text text-transparent">
              Quick Parts Search
            </h2>
            <div className="glass p-4 rounded-xl">
              <PartsSearch />
            </div>
          </div>
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

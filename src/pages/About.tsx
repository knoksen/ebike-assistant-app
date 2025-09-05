// Vite env types provided globally via tsconfig.
import { withBase } from '../env'
export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="mb-6">
              <img
                src={withBase('ebike-icon.svg')}
                alt="E-Bike Assistant"
                className="w-20 h-20 mx-auto mb-4"
              />
            </div>
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
              About E-Bike Assistant
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Your comprehensive companion for e-bike maintenance and troubleshooting
            </p>
          </div>

          {/* Mission */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">
              🎯 Our Mission
            </h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              The E-Bike Assistant is designed to help e-bike owners diagnose issues, find compatible parts, 
              and maintain their electric bicycles with confidence. We believe that everyone should have access 
              to reliable troubleshooting tools and comprehensive parts information, whether you're a seasoned 
              cyclist or new to the world of e-bikes.
            </p>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="text-3xl mb-4">🔧</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-white">
                Smart Diagnostics
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Step-by-step troubleshooting guides for common e-bike issues including battery problems, 
                motor failures, and display malfunctions.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="text-3xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-white">
                Parts Database
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Comprehensive database of e-bike components with compatibility information, 
                pricing, and availability status.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="text-3xl mb-4">📱</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-white">
                Cross-Platform
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Available as a Progressive Web App for mobile devices and native desktop applications 
                for Windows, macOS, and Linux.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="text-3xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-white">
                Fast & Offline
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Built with modern web technologies for lightning-fast performance and offline capability 
                when you need it most.
              </p>
            </div>
          </div>

          {/* Technology */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-white">
              🛠️ Technology Stack
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl mb-2">⚛️</div>
                <h4 className="font-semibold mb-2 text-gray-800 dark:text-white">React 19</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Modern UI framework for interactive components
                </p>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">📘</div>
                <h4 className="font-semibold mb-2 text-gray-800 dark:text-white">TypeScript</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Type safety and enhanced developer experience
                </p>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">🎨</div>
                <h4 className="font-semibold mb-2 text-gray-800 dark:text-white">Tailwind CSS</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Utility-first CSS framework for rapid UI development
                </p>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">⚡</div>
                <h4 className="font-semibold mb-2 text-gray-800 dark:text-white">Vite</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Next-generation frontend tooling
                </p>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">🖥️</div>
                <h4 className="font-semibold mb-2 text-gray-800 dark:text-white">Electron</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Cross-platform desktop application framework
                </p>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">📱</div>
                <h4 className="font-semibold mb-2 text-gray-800 dark:text-white">PWA</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Progressive Web App capabilities
                </p>
              </div>
            </div>
          </div>

          {/* Open Source */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">
              🚀 Open Source
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              E-Bike Assistant is open source software released under the MIT License. 
              We welcome contributions from the community to help improve the app and add new features.
            </p>
            <div className="flex items-center space-x-4">
              <a 
                href="https://github.com/knoksen/ebike-assistant-app" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-gray-900 dark:bg-gray-600 text-white rounded-lg hover:bg-gray-800 dark:hover:bg-gray-500 transition-colors"
              >
                <span className="mr-2">🔗</span>
                View on GitHub
              </a>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Version 1.0.0
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

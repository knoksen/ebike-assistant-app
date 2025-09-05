import React from 'react'
import { Link, useLocation } from 'react-router-dom'
imp        {/* Mobile Navigation */}
        <nav aria-label="Mobile navigation" className="md:hidden py-2 overflow-x-auto whitespace-nowrap scrollbar-thin">
          <div className="flex space-x-2 px-2">{ { useTheme } from '../context/useTheme'
import ProgressBar from './ProgressBar'

const Header: React.FC = () => {
  const { isDark, toggleDarkMode } = useTheme()
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path

  const navItems = [
    { path: '/', label: 'Home', icon: '🏠' },
    { path: '/diagnostics', label: 'Diagnostics', icon: '🔧' },
    { path: '/tuneup', label: 'Tuneup', icon: '🔨' },
    { path: '/parts', label: 'Parts', icon: '⚙️' },
    { path: '/maintenance', label: 'Maintenance', icon: '🛠️' },
    { path: '/guides', label: 'Guides', icon: '📖' },
    { path: '/rides', label: 'Rides', icon: '🚲' },
    { path: '/settings', label: 'Settings', icon: '⚙️' },
    { path: '/about', label: 'About', icon: 'ℹ️' }
  ]

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg shadow-sm border-b border-gray-200 dark:border-gray-700">
      <ProgressBar />
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Title */}
          <Link to="/" className="group flex items-center space-x-2">
            <div className="relative">
              <div className="absolute -inset-2 bg-gradient-to-r from-blue-500 to-green-500 rounded-full opacity-0 group-hover:opacity-100 blur transition duration-500"></div>
              <img 
                src="./public/ebike-icon.svg"
                alt="E-Bike Assistant" 
                className="w-8 h-8 relative transform group-hover:scale-110 transition-transform duration-300"
              />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-green-600 dark:from-blue-400 dark:to-green-400 bg-clip-text text-transparent transition-colors duration-300">
              E-Bike Assistant
            </span>
          </Link>

          {/* Navigation */}
          <nav aria-label="Desktop navigation" className="hidden md:flex items-center space-x-2">
            {navItems.map(({ path, label, icon }) => (
              <Link
                key={path}
                to={path}
                className={`px-4 py-2 rounded-lg transition-all duration-300 flex items-center space-x-2
                  ${isActive(path)
                    ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 transform scale-105 shadow-lg'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50 hover:text-gray-800 dark:hover:text-white'
                  } hover:shadow-md backdrop-blur-sm`}
              >
                <span className="text-lg">{icon}</span>
                <span className={`font-medium ${isActive(path) ? 'font-semibold' : ''}`}>{label}</span>
              </Link>
            ))}
          </nav>

          {/* Theme Toggle */}
          <button
            onClick={toggleDarkMode}
            className="relative p-2 rounded-lg bg-gradient-to-br from-blue-500/10 to-green-500/10 hover:from-blue-500/20 hover:to-green-500/20 
                     dark:from-blue-400/5 dark:to-green-400/5 dark:hover:from-blue-400/10 dark:hover:to-green-400/10
                     transition-all duration-300 group overflow-hidden"
            title="Toggle dark mode"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-green-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            <div className="relative transform transition-transform duration-500 rotate-0 dark:-rotate-180">
              {isDark ? (
                <svg aria-label="dark mode" className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              ) : (
                <svg aria-label="light mode" className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              )}
            </div>
          </button>
        </div>

        {/* Mobile Navigation */}
        <nav className="md:hidden py-2 overflow-x-auto whitespace-nowrap scrollbar-thin">
          <div className="flex space-x-2 px-2">
            {navItems.map(({ path, label, icon }) => (
              <Link
                key={path}
                to={path}
                className={`px-3 py-2 rounded-lg text-sm transition-all duration-300 flex flex-col items-center space-y-1
                  ${isActive(path)
                    ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 transform scale-105 shadow-lg'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50 hover:text-gray-800 dark:hover:text-white'
                  } hover:shadow-md backdrop-blur-sm`}
              >
                <span className="text-lg">{icon}</span>
                <span className={`font-medium ${isActive(path) ? 'font-semibold' : ''}`}>{label}</span>
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </header>
  )
}

export default Header

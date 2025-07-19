import React, { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

const Header: React.FC = () => {
  const [dark, setDark] = useState(() =>
    window.matchMedia('(prefers-color-scheme: dark)').matches
  )
  const location = useLocation()

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  const isActive = (path: string) => location.pathname === path

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Title */}
          <Link to="/" className="flex items-center space-x-2">
            <img 
              src={import.meta.env.BASE_URL + 'ebike-icon.svg'} 
              alt="E-Bike Assistant" 
              className="w-8 h-8"
            />
            <span className="text-xl font-bold text-gray-800 dark:text-white">
              E-Bike Assistant
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              to="/" 
              className={`transition-colors ${
                isActive('/') 
                  ? 'text-blue-600 dark:text-blue-400 font-medium' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white'
              }`}
            >
              Home
            </Link>
            <Link 
              to="/diagnostics" 
              className={`transition-colors ${
                isActive('/diagnostics') 
                  ? 'text-blue-600 dark:text-blue-400 font-medium' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white'
              }`}
            >
              Diagnostics
            </Link>
            <Link 
              to="/parts" 
              className={`transition-colors ${
                isActive('/parts') 
                  ? 'text-blue-600 dark:text-blue-400 font-medium' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white'
              }`}
            >
              Parts
            </Link>
            <Link 
              to="/maintenance" 
              className={`transition-colors ${
                isActive('/maintenance') 
                  ? 'text-blue-600 dark:text-blue-400 font-medium' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white'
              }`}
            >
              Maintenance
            </Link>
            <Link 
              to="/guides" 
              className={`transition-colors ${
                isActive('/guides') 
                  ? 'text-blue-600 dark:text-blue-400 font-medium' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white'
              }`}
            >
              Guides
            </Link>
            <Link 
              to="/about" 
              className={`transition-colors ${
                isActive('/about') 
                  ? 'text-blue-600 dark:text-blue-400 font-medium' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white'
              }`}
            >
              About
            </Link>
            <Link 
              to="/rides" 
              className={`transition-colors ${
                isActive('/rides') 
                  ? 'text-blue-600 dark:text-blue-400 font-medium' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white'
              }`}
            >
              Rides
            </Link>
            <Link 
              to="/settings" 
              className={`transition-colors ${
                isActive('/settings') 
                  ? 'text-blue-600 dark:text-blue-400 font-medium' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white'
              }`}
            >
              Settings
            </Link>
          </nav>

          {/* Theme Toggle */}
          <button
            onClick={() => setDark(v => !v)}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            title="Toggle dark mode"
          >
            {dark ? '🌙' : '☀️'}
          </button>
        </div>

        {/* Mobile Navigation */}
        <nav className="md:hidden pb-4">
          <div className="grid grid-cols-4 gap-2 text-center">
            <Link 
              to="/" 
              className={`text-sm transition-colors ${
                isActive('/') 
                  ? 'text-blue-600 dark:text-blue-400 font-medium' 
                  : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              Home
            </Link>
            <Link 
              to="/diagnostics" 
              className={`text-sm transition-colors ${
                isActive('/diagnostics') 
                  ? 'text-blue-600 dark:text-blue-400 font-medium' 
                  : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              Diagnostics
            </Link>
            <Link 
              to="/parts" 
              className={`text-sm transition-colors ${
                isActive('/parts') 
                  ? 'text-blue-600 dark:text-blue-400 font-medium' 
                  : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              Parts
            </Link>
            <Link 
              to="/maintenance" 
              className={`text-sm transition-colors ${
                isActive('/maintenance') 
                  ? 'text-blue-600 dark:text-blue-400 font-medium' 
                  : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              Maintenance
            </Link>
          </div>
          <div className="grid grid-cols-4 gap-2 text-center mt-2">
            <Link 
              to="/guides" 
              className={`text-sm transition-colors ${
                isActive('/guides') 
                  ? 'text-blue-600 dark:text-blue-400 font-medium' 
                  : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              Guides
            </Link>
            <Link 
              to="/rides" 
              className={`text-sm transition-colors ${
                isActive('/rides') 
                  ? 'text-blue-600 dark:text-blue-400 font-medium' 
                  : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              Rides
            </Link>
            <Link 
              to="/settings" 
              className={`text-sm transition-colors ${
                isActive('/settings') 
                  ? 'text-blue-600 dark:text-blue-400 font-medium' 
                  : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              Settings
            </Link>
            <Link 
              to="/about" 
              className={`text-sm transition-colors ${
                isActive('/about') 
                  ? 'text-blue-600 dark:text-blue-400 font-medium' 
                  : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              About
            </Link>
          </div>
        </nav>
      </div>
    </header>
  )
}

export default Header

import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import DeviceConnectButton from './DeviceConnectButton'

const items = [
  { to: '/', label: 'Home', icon: '🏠' },
  { to: '/diagnostics', label: 'Diag', icon: '🔧' },
  { to: '/boost', label: 'Boost', icon: '⚡' },
  { to: '/settings', label: 'Settings', icon: '⚙️' }
]

export const MobileDock: React.FC = () => {
  const location = useLocation()
  return (
    <nav aria-label="Quick navigation" className="md:hidden fixed bottom-0 inset-x-0 z-40">
      <div className="mx-auto max-w-xl bg-white/90 dark:bg-gray-900/90 backdrop-blur border-t border-gray-200 dark:border-gray-700 shadow-lg">
        <div className="grid grid-cols-5 items-stretch">
          {items.map(i => {
            const active = location.pathname === i.to
            return (
              <Link
                key={i.to}
                to={i.to}
                aria-label={`Navigate to ${i.label}`}
                aria-current={active ? 'page' : undefined}
                className={`flex flex-col items-center justify-center gap-1 py-3 text-xs font-medium transition touch-manipulation min-h-[64px] ${active ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}`}
              >
                <span className="text-lg leading-none">{i.icon}</span>
                <span className="font-medium">{i.label}</span>
                {active && <span className="mt-1 w-8 h-0.5 rounded-full bg-blue-500" />}
              </Link>
            )
          })}
          <div className="flex items-center justify-center py-2">
            <DeviceConnectButton compact className="" />
          </div>
        </div>
      </div>
    </nav>
  )
}

export default MobileDock

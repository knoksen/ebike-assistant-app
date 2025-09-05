import { screen, fireEvent, within } from '@testing-library/react'
import '@testing-library/jest-dom'
import { test, expect, beforeEach, vi } from 'vitest'
import Header from '../../components/Header'
import { renderWithProviders } from '../../test/test-utils'

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

// Common class names for active and inactive links
const activeClasses = [
  'bg-blue-100', 'dark:bg-blue-900/50',
  'text-blue-600', 'dark:text-blue-400',
  'transform', 'scale-105', 'shadow-lg'
]

const inactiveClasses = [
  'text-gray-600', 'dark:text-gray-300',
  'hover:bg-gray-100', 'dark:hover:bg-gray-800/50', 
  'hover:text-gray-800', 'dark:hover:text-white',
  'hover:shadow-md', 'backdrop-blur-sm'
]

describe('Header', () => {
  beforeEach(() => {
    document.documentElement.classList.remove('dark')
  })

  test('renders brand elements', () => {
  renderWithProviders(<Header />)
  
  const link = screen.getByRole('link', { name: /e-bike assistant/i })
  expect(link).toBeInTheDocument()
  expect(link).toHaveAttribute('href', '/')
  expect(link).toHaveClass('group', 'flex', 'items-center', 'space-x-2')
  
  const logo = within(link).getByAltText('E-Bike Assistant')
  expect(logo).toBeInTheDocument()
  expect(logo.tagName).toBe('IMG')
  expect(logo).toHaveAttribute('src', expect.stringContaining('ebike-icon'))
  expect(logo).toHaveClass('w-8', 'h-8', 'relative', 'transform')
  
  const title = within(link).getByText('E-Bike Assistant')
  expect(title).toBeInTheDocument()
  expect(title).toHaveClass(
    'text-xl', 'font-bold',
    'bg-gradient-to-r', 'from-blue-600', 'to-green-600',
    'dark:from-blue-400', 'dark:to-green-400',
    'bg-clip-text', 'text-transparent'
  )
})

test('renders desktop navigation', () => {
  renderWithProviders(<Header />, { route: '/' })
  
  const desktopNav = screen.getByRole('navigation', { name: /desktop/i })
  expect(desktopNav).toHaveClass('hidden', 'md:flex', 'items-center', 'space-x-2')
  
  navItems.forEach(({ label, icon, path }) => {
    const link = within(desktopNav).getByRole('link', { name: new RegExp(`${icon}.*${label}`, 'i') })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', path)
    expect(link).toHaveClass('px-4', 'py-2', 'rounded-lg', 'transition-all', 'duration-300', 'flex', 'items-center', 'space-x-2')
    
    if (path === '/') {
      expect(link).toHaveClass(
        ...activeClasses.slice(0, 4) // Only take the first color classes
      )
    } else {
      expect(link).toHaveClass(
        ...inactiveClasses
      )
    }
  })
})

test('renders mobile navigation', () => {
  renderWithProviders(<Header />, { route: '/diagnostics' })
  
  const allNavs = screen.getAllByRole('navigation')
  const mobileNav = allNavs.find(nav => nav.classList.contains('md:hidden'))
  expect(mobileNav).toBeDefined()
  expect(mobileNav).toHaveClass('md:hidden', 'py-2', 'overflow-x-auto', 'whitespace-nowrap', 'scrollbar-thin')
  
  navItems.forEach(({ label, icon, path }) => {
    const link = within(mobileNav!).getByRole('link', { name: new RegExp(`${icon}.*${label}`, 'i') })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', path)
    expect(link).toHaveClass(
      'px-3', 'py-2', 'rounded-lg', 'text-sm', 
      'transition-all', 'duration-300', 'flex', 'flex-col', 
      'items-center', 'space-y-1'
    )
    
    if (path === '/diagnostics') {
      expect(link).toHaveClass(
        ...activeClasses
      )
    } else {
      expect(link).toHaveClass(
        ...inactiveClasses
      )
    }
  })
})

test('toggles theme mode', () => {
  renderWithProviders(<Header />, { theme: { isDark: false } })
  
  const themeButton = screen.getByTitle('Toggle dark mode')
  expect(themeButton).toBeInTheDocument()
  expect(themeButton).toHaveClass(
    'relative', 'p-2', 'rounded-lg',
    'bg-gradient-to-br', 'from-blue-500/10', 'to-green-500/10',
    'dark:from-blue-400/5', 'dark:to-green-400/5',
    'transition-all', 'duration-300', 'group', 'overflow-hidden'
  )
  
  // Initial state (light mode)
  const sunSvg = screen.getByLabelText('light mode')
  expect(sunSvg).toBeInTheDocument()
  
  // Toggle to dark mode
  fireEvent.click(themeButton)
  const moonSvg = screen.getByLabelText('dark mode')
  expect(moonSvg).toBeInTheDocument()
})

test('persists theme preference', () => {
  renderWithProviders(<Header />, { theme: { isDark: false } })
  const themeButton = screen.getByTitle('Toggle dark mode')
  
  // Initial state is light mode
  const sunSvg = screen.getByLabelText('light mode')
  expect(sunSvg).toBeInTheDocument()
  
  // Toggle to dark mode
  fireEvent.click(themeButton)
  const moonSvg = screen.getByLabelText('dark mode')
  expect(moonSvg).toBeInTheDocument()
  expect(document.documentElement.classList.contains('dark')).toBe(true)
  
  // Toggle back to light mode
  fireEvent.click(themeButton)
  const newSunSvg = screen.getByLabelText('light mode')
  expect(newSunSvg).toBeInTheDocument()
  expect(document.documentElement.classList.contains('dark')).toBe(false)
})

test('applies correct styles to home link', () => {
  const { getByLabelText } = renderWithProviders(<Header />, { route: '/' })
  const desktopNav = getByLabelText('Desktop navigation')
  
  // Home should be active
  const homeLink = within(desktopNav).getByRole('link', { name: /🏠.*home/i })
  expect(homeLink).toHaveClass(...activeClasses)

  // Other links should be inactive
  navItems
    .filter(item => item.path !== '/')
    .forEach(({ label, icon }) => {
      const link = within(desktopNav).getByRole('link', { name: new RegExp(`${icon}.*${label}`, 'i') })
      expect(link).toHaveClass(...inactiveClasses.slice(0, 2)) // Test base colors only
      expect(link).not.toHaveClass(...activeClasses)
    })
})

test('applies correct styles to diagnostics link', () => {
  const { getByLabelText } = renderWithProviders(<Header />, { route: '/diagnostics' })
  const desktopNav = getByLabelText('Desktop navigation')
  
  // Diagnostics should be active
  const diagnosticsLink = within(desktopNav).getByRole('link', { name: /🔧.*diagnostics/i })
  expect(diagnosticsLink).toHaveClass(...activeClasses)

  // Other links should be inactive
  navItems
    .filter(item => item.path !== '/diagnostics')
    .forEach(({ label, icon }) => {
      const link = within(desktopNav).getByRole('link', { name: new RegExp(`${icon}.*${label}`, 'i') })
      expect(link).toHaveClass(...inactiveClasses.slice(0, 2)) // Test base colors only
      expect(link).not.toHaveClass(...activeClasses)
    })
})
test('toggles mobile menu visibility', () => {
    renderWithProviders(<Header />)
    
    // Mobile nav should start hidden
    const [mobileNav] = screen.getAllByRole('navigation', { name: /mobile/i })
    expect(mobileNav).toBeInTheDocument()
    expect(mobileNav).toHaveClass('hidden')
    
    // Click menu button to show nav
    const menuButton = screen.getByRole('button', { name: /menu/i })
    fireEvent.click(menuButton)
    expect(mobileNav).not.toHaveClass('hidden')
    
    // Click menu button again to hide nav  
    fireEvent.click(menuButton)
    expect(mobileNav).toHaveClass('hidden')
  })
})

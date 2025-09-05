import { screen, fireEvent, within } from '@testing-library/react'
import '@testing-library/jest-dom'
import { test, expect, beforeEach, describe } from 'vitest'
import Header from '../../components/Header'
import { renderWithProviders } from '../../test/test-utils'

const navItems = [
  { path: '/', label: 'Home', icon: '🏠' },
  { path: '/diagnostics', label: 'Diagnostics', icon: '🔧' },
  { path: '/tuneup', label: 'Tuneup', icon: '🔨' },
  { path: '/parts', label: 'Parts', icon: '⚙️' },
  { path: '/maintenance', label: 'Maintenance', icon: '🛠️' },
  { path: '/guides', label: 'Guides', icon: '📖' },
  { path: '/rides', label: 'Rides', icon: '🚲' }
]

describe('Header', () => {
  beforeEach(() => {
    document.documentElement.classList.remove('dark')
  })

  test('renders brand elements', () => {
    renderWithProviders(<Header />)
    
    const logo = screen.getByAltText('E-Bike Assistant')
    expect(logo).toBeInTheDocument()
    expect(logo.tagName).toBe('IMG')
    expect(logo).toHaveAttribute('src', expect.stringContaining('ebike-icon'))
    
    const title = screen.getByText('E-Bike Assistant')
    expect(title).toBeInTheDocument()
    expect(title).toHaveClass('text-xl', 'font-bold')
  })

  test('renders desktop navigation', () => {
    renderWithProviders(<Header />, { route: '/' })
    
    const desktopNav = screen.getAllByRole('navigation')[0]
    expect(desktopNav).toHaveClass('hidden', 'md:flex')
    
    navItems.forEach(({ label, icon, path }) => {
      const link = within(desktopNav).getByRole('link', { name: new RegExp(`${icon}.*${label}`, 'i') })
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', path)
      
      if (path === '/') {
        expect(link).toHaveClass('bg-blue-100', 'text-blue-600')
      } else {
        expect(link).not.toHaveClass('bg-blue-100', 'text-blue-600')
      }
    })
  })

  test('renders mobile navigation', () => {
    renderWithProviders(<Header />, { route: '/diagnostics' })
    
    const mobileNav = screen.getAllByRole('navigation')[1]
    expect(mobileNav).toHaveClass('fixed', 'bottom-0', 'md:hidden')
    
    navItems.forEach(({ label, icon, path }) => {
      const link = within(mobileNav).getByRole('link', { name: new RegExp(`${icon}.*${label}`, 'i') })
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', path)
      
      if (path === '/diagnostics') {
        expect(link).toHaveClass('bg-blue-100', 'text-blue-600')
      } else {
        expect(link).not.toHaveClass('bg-blue-100', 'text-blue-600')
      }
    })
  })

  test('toggles theme mode', () => {
    renderWithProviders(<Header />)
    
    const themeButton = screen.getByRole('button', { name: /toggle dark mode/i })
    expect(themeButton).toHaveAttribute('title', 'Toggle dark mode')
    expect(themeButton).toBeInTheDocument()
    
    // Initial state (light mode)
    expect(document.documentElement.classList.contains('dark')).toBe(false)
    expect(themeButton).toHaveClass('text-gray-500')
    
    // Toggle to dark mode
    fireEvent.click(themeButton)
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(themeButton).toHaveClass('text-yellow-400')
    
    // Toggle back to light mode
    fireEvent.click(themeButton)
    expect(document.documentElement.classList.contains('dark')).toBe(false)
    expect(themeButton).toHaveClass('text-gray-500')
  })

  test('persists theme preference', () => {
    renderWithProviders(<Header />)
    
    const themeButton = screen.getByRole('button', { name: /toggle dark mode/i })
    
    // Toggle to dark mode
    fireEvent.click(themeButton)
    expect(localStorage.getItem('theme')).toBe('dark')
    
    // Toggle back to light mode
    fireEvent.click(themeButton)
    expect(localStorage.getItem('theme')).toBe('light')
  })

  test('updates active styles on navigation', () => {
    // Home page
    renderWithProviders(<Header />, { route: '/' })
    const homeLink = screen.getAllByRole('link', { name: /🏠.*home/i })[0]
    expect(homeLink).toHaveClass('bg-blue-100', 'text-blue-600')
    
    // Diagnostics page
    renderWithProviders(<Header />, { route: '/diagnostics' })
    const diagnosticsLink = screen.getAllByRole('link', { name: /🔧.*diagnostics/i })[0]
    expect(diagnosticsLink).toHaveClass('bg-blue-100', 'text-blue-600')
  })
})

import { screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import App from '../App'
import { renderWithProviders } from '../test/test-utils'

// Mock database service
vi.mock('../services/DatabaseService', () => ({
  default: {
    instance: {
      initialize: vi.fn().mockResolvedValue(null),
      ensureDb: vi.fn().mockResolvedValue({ objectStoreNames: [] }),
      create: vi.fn().mockResolvedValue(null),
    }
  }
}))

describe('App', () => {
  it('renders primary navigation elements', () => {
    renderWithProviders(<App />)
    
    // Check for main navigation links
    expect(screen.getByRole('link', { name: /home/i })).toBeTruthy()
    expect(screen.getByRole('link', { name: /diagnostics/i })).toBeTruthy()
    expect(screen.getByRole('link', { name: /maintenance/i })).toBeTruthy()
    expect(screen.getByRole('link', { name: /parts/i })).toBeTruthy()
  })

  it('renders header with theme toggle', () => {
    renderWithProviders(<App />)
    const themeToggle = screen.getByRole('button', { name: /toggle theme/i })
    expect(themeToggle).toBeTruthy()
    
    // Test theme toggle functionality
    fireEvent.click(themeToggle)
    expect(document.documentElement.classList.contains('dark')).toBeTruthy()
    
    fireEvent.click(themeToggle)
    expect(document.documentElement.classList.contains('dark')).toBeFalsy()
  })

  it('renders settings page when clicking settings', async () => {
    renderWithProviders(<App />)
    const settingsLink = screen.getByRole('link', { name: /settings/i })
    fireEvent.click(settingsLink)
    
    // Wait for settings page to render
    const settingsHeading = await screen.findByRole('heading', { name: /settings/i })
    expect(settingsHeading).toBeTruthy()
  })
})

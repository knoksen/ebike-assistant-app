import { screen, fireEvent, within } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import App from '../App'
import { renderWithTheme } from '../test/test-utils'

// Service mocks (Database, Network, Connectivity) are defined in shared setup.

describe('App', () => {
  it('renders primary navigation elements', () => {
    renderWithTheme(<App />)
    
    // Get desktop navigation
    const desktopNav = screen.getByLabelText('Desktop navigation')
    expect(desktopNav).toBeInTheDocument()
    
    // Check for main navigation links in desktop nav
    const links = ['Home', 'Diagnostics', 'Maintenance', 'Parts'].map(name => 
      within(desktopNav).getByRole('link', { name: new RegExp(name, 'i') })
    )
    links.forEach(link => expect(link).toBeInTheDocument())
  })

  it('renders header with theme toggle', () => {
    renderWithTheme(<App />)
    const themeToggle = screen.getByTitle('Toggle dark mode')
    expect(themeToggle).toBeInTheDocument()
    
    // Test theme toggle functionality
    fireEvent.click(themeToggle)
    expect(document.documentElement.classList.contains('dark')).toBeTruthy()
    
    fireEvent.click(themeToggle)
    expect(document.documentElement.classList.contains('dark')).toBeFalsy()
  })

  it('renders settings page when clicking settings', async () => {
    renderWithTheme(<App />)
    // Get settings link from desktop nav
    const desktopNav = screen.getByLabelText('Desktop navigation')
    const settingsLink = within(desktopNav).getByRole('link', { name: /settings/i })
    fireEvent.click(settingsLink)
    
    // Wait for settings page to render
    const advancedSettingsHeading = await screen.findByRole('heading', { name: /advanced settings/i })
    expect(advancedSettingsHeading).toBeInTheDocument()
  })
})

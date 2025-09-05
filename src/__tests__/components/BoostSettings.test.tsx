import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import BoostSettings from '../../components/BoostSettings'

const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn()
}

// Replace the localStorage global with our mock
global.localStorage = mockLocalStorage as any

describe('BoostSettings', () => {
  beforeEach(() => {
    mockLocalStorage.getItem.mockClear()
    mockLocalStorage.setItem.mockClear()
    document.documentElement.classList.remove('dark')
  })

  test('renders default profiles', () => {
    render(<BoostSettings />)
    
    // Check all profile buttons are present
    const ecoButton = screen.getByRole('button', { name: /eco/i })
    const normalButton = screen.getByRole('button', { name: /normal/i })
    const boostButton = screen.getByRole('button', { name: /boost/i })
    const customButton = screen.getByRole('button', { name: /custom/i })
    
    expect(ecoButton).toBeInTheDocument()
    expect(normalButton).toBeInTheDocument()
    expect(boostButton).toBeInTheDocument()
    expect(customButton).toBeInTheDocument()

    // Check default values are shown
    expect(ecoButton).toHaveTextContent('200W')
    expect(normalButton).toHaveTextContent('350W')
    expect(boostButton).toHaveTextContent('500W')
    expect(customButton).toHaveTextContent('400W')
  })

  test('loads saved settings from localStorage', () => {
    const savedSettings = {
      selectedProfile: 'boost',
      profiles: {
        boost: {
          mode: 'boost',
          maxSpeed: 40,
          maxPowerOutput: 600,
          assistanceLevel: 4,
          boostDuration: 20,
          cooldownPeriod: 90,
          enabled: true
        }
      }
    }

    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(savedSettings))
    render(<BoostSettings />)

    // The boost profile should be active
    const boostButton = screen.getByRole('button', { name: /boost/i })
    expect(boostButton).toHaveClass('scale-105')

    // Settings should reflect saved values
    const speedInput = screen.getByLabelText(/max speed/i)
    const powerInput = screen.getByLabelText(/max power output/i)
    const assistanceInput = screen.getByLabelText(/assistance level/i)
    
    expect(speedInput).toHaveValue(40)
    expect(powerInput).toHaveValue(600)
    expect(assistanceInput).toHaveValue(4)
  })

  test('saves settings to localStorage when updated', async () => {
    render(<BoostSettings />)

    // Change to boost profile
    const boostButton = screen.getByRole('button', { name: /boost/i })
    fireEvent.click(boostButton)

    // Update some settings
    const speedInput = screen.getByLabelText(/max speed/i)
    fireEvent.change(speedInput, { target: { value: '42' } })

    // Save changes
    const saveButton = screen.getByRole('button', { name: /save changes/i })
    fireEvent.click(saveButton)

    // Wait for save confirmation
    await waitFor(() => {
      expect(mockLocalStorage.setItem).toHaveBeenCalled()
      expect(screen.getByText('Saved!')).toBeInTheDocument()
    })

    // Settings should be saved to localStorage
    const savedSettings = JSON.parse(mockLocalStorage.setItem.mock.calls[0][1])
    expect(savedSettings.profiles.boost.maxSpeed).toBe(42)
  })

  test('shows error feedback on save failure', async () => {
    // Mock localStorage.setItem to throw an error
    mockLocalStorage.setItem.mockImplementation(() => {
      throw new Error('Storage full')
    })

    render(<BoostSettings />)

    // Try to save
    const saveButton = screen.getByRole('button', { name: /save changes/i })
    fireEvent.click(saveButton)

    // Should show error message
    await waitFor(() => {
      expect(screen.getByText('Error!')).toBeInTheDocument()
    })
  })

  test('updates profile when slider controls are changed', () => {
    render(<BoostSettings />)

    // Switch to custom profile
    const customButton = screen.getByRole('button', { name: /custom/i })
    fireEvent.click(customButton)

    // Change some settings
    const speedInput = screen.getByLabelText(/max speed/i)
    const powerInput = screen.getByLabelText(/max power output/i)
    const assistanceInput = screen.getByLabelText(/assistance level/i)

    fireEvent.change(speedInput, { target: { value: '38' } })
    fireEvent.change(powerInput, { target: { value: '450' } })
    fireEvent.change(assistanceInput, { target: { value: '3' } })

    // Check if values are updated in the UI
    expect(speedInput).toHaveValue(38)
    expect(powerInput).toHaveValue(450)
    expect(assistanceInput).toHaveValue(3)

    // Current values should be displayed
    expect(screen.getByText('Current: 38 km/h')).toBeInTheDocument()
    expect(screen.getByText('Current: 450 W')).toBeInTheDocument()
    expect(screen.getByText('Level 3')).toBeInTheDocument()
  })

  test('toggles profile enabled state', () => {
    render(<BoostSettings />)

    // Switch to custom profile
    const customButton = screen.getByRole('button', { name: /custom/i })
    fireEvent.click(customButton)

    // Find and click the enable toggle
    const enableToggle = screen.getByRole('button', { name: /enable profile/i })
    fireEvent.click(enableToggle)

    // Get the toggle's container div and check its class
    const toggleContainer = enableToggle.querySelector('div')
    expect(toggleContainer).toHaveClass('from-blue-600', 'to-purple-600')

    // Click again to disable
    fireEvent.click(enableToggle)
    expect(toggleContainer).not.toHaveClass('from-blue-600', 'to-purple-600')
  })
})

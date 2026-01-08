import { fireEvent, renderWithTheme, screen } from '../../test/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { FirmwareUpdateCard } from '../../components/FirmwareUpdateCard'

describe('FirmwareUpdateCard', () => {
  it('disables firmware flash when the feature flag is off', () => {
    renderWithTheme(<FirmwareUpdateCard featureEnabled={false} />)

    const button = screen.getByRole('button', { name: /firmware flash unavailable/i })
    expect(button).toBeDisabled()
    expect(screen.getByText(/firmware updates are unavailable/i)).toBeInTheDocument()
  })

  it('shows safety issues after confirmation when checks fail', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)

    renderWithTheme(<FirmwareUpdateCard featureEnabled={true} />)

    const button = screen.getByRole('button', { name: /start firmware flash/i })
    fireEvent.click(button)

    expect(await screen.findByText(/safety checks failed/i)).toBeInTheDocument()
    expect(screen.getByText(/connect your e-bike/i)).toBeInTheDocument()

    confirmSpy.mockRestore()
  })
})

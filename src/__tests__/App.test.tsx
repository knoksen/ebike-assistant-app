import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import App from '../App'

describe('App', () => {
  it('renders heading', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: /vite \+ react/i })).toBeTruthy()
  })

  it('increments counter on click', () => {
    render(<App />)
    const button = screen.getAllByRole('button', { name: /count is 0/i })[0]
    fireEvent.click(button)
    expect(screen.getByRole('button', { name: /count is 1/i })).toBeTruthy()
  })
})

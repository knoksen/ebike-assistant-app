import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, beforeAll } from 'vitest'
import App from '../App'

beforeAll(() => {
  window.matchMedia = window.matchMedia ||
    (((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    })) as unknown as typeof window.matchMedia)
})

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

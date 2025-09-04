import { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { ThemeProvider } from '../context/ThemeContext'
import { render } from '@testing-library/react'

interface TestWrapperProps {
  children: ReactNode
  initialEntries?: string[]
}

export const TestWrapper = ({ children, initialEntries = ['/'] }: TestWrapperProps) => {
  return (
    <MemoryRouter initialEntries={initialEntries}>
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </MemoryRouter>
  )
}

export const renderWithProviders = (ui: React.ReactElement, { route = '/' } = {}) => {
  return render(
    <TestWrapper initialEntries={[route]}>
      {ui}
    </TestWrapper>
  )
}

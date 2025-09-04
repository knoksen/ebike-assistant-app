import { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { ThemeProvider } from '../context/ThemeContext'
import { render } from '@testing-library/react'

interface TestWrapperProps {
  children: ReactNode
  initialEntries?: string[]
  skipRouter?: boolean
}

export const TestWrapper = ({ children, initialEntries = ['/'], skipRouter = false }: TestWrapperProps) => {
  let element = (
    <ThemeProvider>
      {children}
    </ThemeProvider>
  )

  if (!skipRouter) {
    element = (
      <MemoryRouter initialEntries={initialEntries}>
        {element}
      </MemoryRouter>
    )
  }

  return element
}

export const renderWithProviders = (ui: React.ReactElement, { route = '/', skipRouter = false } = {}) => {
  return render(
    <TestWrapper initialEntries={[route]} skipRouter={skipRouter}>
      {ui}
    </TestWrapper>
  )
}

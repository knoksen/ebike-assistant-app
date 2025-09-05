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

interface RenderOptions {
  route?: string;
  theme?: {
    isDark?: boolean;
  };
}

export const renderWithProviders = (ui: React.ReactElement, { route = '/', theme }: RenderOptions = {}) => {
  const utils = render(
    <MemoryRouter initialEntries={[route]}>
      <ThemeProvider initialState={theme}>
        {ui}
      </ThemeProvider>
    </MemoryRouter>
  )

  return {
    ...utils,
    rerender: (rerenderUi: React.ReactElement) => utils.rerender(
      <TestWrapper initialEntries={[route]}>
        {rerenderUi}
      </TestWrapper>
    )
  }
}

export * from '@testing-library/react'

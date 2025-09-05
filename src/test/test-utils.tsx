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
  const initialMemoryEntries = [route]
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <MemoryRouter initialEntries={initialMemoryEntries}>
      <ThemeProvider initialState={theme}>
        {children}
      </ThemeProvider>
    </MemoryRouter>
  )

  return {
    ...render(ui, { wrapper: Wrapper }),
    rerender: (rerenderUi: React.ReactElement, newRoute?: string) => {
      if (newRoute) initialMemoryEntries[0] = newRoute
      return render(rerenderUi, { wrapper: Wrapper })
    }
  }
}

export const renderWithTheme = (ui: React.ReactElement, { theme }: Omit<RenderOptions, 'route'> = {}) => {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <ThemeProvider initialState={theme}>
      {children}
    </ThemeProvider>
  )

  return render(ui, { wrapper: Wrapper })
}

export * from '@testing-library/react'

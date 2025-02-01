import React from 'react'
import { render as rtlRender } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from '@/components/theme-provider'
import { useStore } from '@/store'

// Create a custom render function that includes providers
function render(ui: React.ReactElement, { ...options } = {}) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="light" storageKey="ui-theme">
          {children}
        </ThemeProvider>
      </QueryClientProvider>
    )
  }

  return rtlRender(ui, { wrapper: Wrapper, ...options })
}

// Re-export everything
export * from '@testing-library/react'

// Override render method
export { render }

// Helper to reset Zustand store between tests
export const resetStore = () => {
  useStore.setState({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    ui: {
      theme: 'light',
      sidebarOpen: false,
    },
  })
}

// Helper to mock authenticated state
export const mockAuthenticatedState = () => {
  useStore.setState({
    user: {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
    },
    isAuthenticated: true,
    isLoading: false,
  })
}

// Helper to wait for loading state
export const waitForLoadingToFinish = () =>
  new Promise((resolve) => {
    const interval = setInterval(() => {
      if (!useStore.getState().isLoading) {
        clearInterval(interval)
        resolve(true)
      }
    }, 100)
  }) 
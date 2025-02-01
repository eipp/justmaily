import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock window.fetch
global.fetch = vi.fn()

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock window.ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock window.IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock crypto for API key generation
Object.defineProperty(global, 'crypto', {
  value: {
    getRandomValues: (arr: any) => require('crypto').randomBytes(arr.length),
    subtle: {
      digest: vi.fn().mockImplementation(async (algorithm, data) => {
        return new Uint8Array(32).buffer // Mock 256-bit hash
      })
    }
  }
})

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn()
}
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn()
}
Object.defineProperty(window, 'sessionStorage', { value: sessionStorageMock })

// Mock console methods for cleaner test output
global.console = {
  ...console,
  // Keep native behaviour for other methods, use those to print out things in your own tests
  log: vi.fn(),
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
}

// Clean up after each test
afterEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
  sessionStorage.clear()
  fetch.mockClear()
})

// Add custom matchers
expect.extend({
  toHaveBeenCalledOnceWith(received: any, ...expected: any[]) {
    const pass = received.mock.calls.length === 1 &&
      JSON.stringify(received.mock.calls[0]) === JSON.stringify(expected)

    return {
      pass,
      message: () =>
        pass
          ? `expected ${received.getMockName()} not to have been called once with ${expected}`
          : `expected ${received.getMockName()} to have been called once with ${expected}`
    }
  },
  toHaveBeenCalledAfter(received: any, expected: any) {
    const receivedCalls = received.mock.invocationCallOrder
    const expectedCalls = expected.mock.invocationCallOrder

    const pass = receivedCalls.some((receivedCall: number) =>
      expectedCalls.some((expectedCall: number) => receivedCall > expectedCall)
    )

    return {
      pass,
      message: () =>
        pass
          ? `expected ${received.getMockName()} not to have been called after ${expected.getMockName()}`
          : `expected ${received.getMockName()} to have been called after ${expected.getMockName()}`
    }
  }
}) 
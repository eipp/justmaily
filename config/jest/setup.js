'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
require('@testing-library/jest-dom');
const vitest_1 = require('vitest');
// Mock window.fetch
global.fetch = vitest_1.vi.fn();
// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vitest_1.vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vitest_1.vi.fn(),
    removeListener: vitest_1.vi.fn(),
    addEventListener: vitest_1.vi.fn(),
    removeEventListener: vitest_1.vi.fn(),
    dispatchEvent: vitest_1.vi.fn(),
  })),
});
// Mock window.ResizeObserver
global.ResizeObserver = vitest_1.vi.fn().mockImplementation(() => ({
  observe: vitest_1.vi.fn(),
  unobserve: vitest_1.vi.fn(),
  disconnect: vitest_1.vi.fn(),
}));
// Mock window.IntersectionObserver
global.IntersectionObserver = vitest_1.vi.fn().mockImplementation(() => ({
  observe: vitest_1.vi.fn(),
  unobserve: vitest_1.vi.fn(),
  disconnect: vitest_1.vi.fn(),
}));
// Mock crypto for API key generation
Object.defineProperty(global, 'crypto', {
  value: {
    getRandomValues: (arr) => require('crypto').randomBytes(arr.length),
    subtle: {
      digest: vitest_1.vi.fn().mockImplementation(async (algorithm, data) => {
        return new Uint8Array(32).buffer; // Mock 256-bit hash
      }),
    },
  },
});
// Mock localStorage
const localStorageMock = {
  getItem: vitest_1.vi.fn(),
  setItem: vitest_1.vi.fn(),
  removeItem: vitest_1.vi.fn(),
  clear: vitest_1.vi.fn(),
  length: 0,
  key: vitest_1.vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });
// Mock sessionStorage
const sessionStorageMock = {
  getItem: vitest_1.vi.fn(),
  setItem: vitest_1.vi.fn(),
  removeItem: vitest_1.vi.fn(),
  clear: vitest_1.vi.fn(),
  length: 0,
  key: vitest_1.vi.fn(),
};
Object.defineProperty(window, 'sessionStorage', { value: sessionStorageMock });
// Mock console methods for cleaner test output
global.console = Object.assign(Object.assign({}, console), {
  // Keep native behaviour for other methods, use those to print out things in your own tests
  log: vitest_1.vi.fn(),
  debug: vitest_1.vi.fn(),
  info: vitest_1.vi.fn(),
  warn: vitest_1.vi.fn(),
  error: vitest_1.vi.fn(),
});
// Clean up after each test
afterEach(() => {
  vitest_1.vi.clearAllMocks();
  localStorage.clear();
  sessionStorage.clear();
  fetch.mockClear();
});
// Add custom matchers
expect.extend({
  toHaveBeenCalledOnceWith(received, ...expected) {
    const pass =
      received.mock.calls.length === 1 &&
      JSON.stringify(received.mock.calls[0]) === JSON.stringify(expected);
    return {
      pass,
      message: () =>
        pass
          ? `expected ${received.getMockName()} not to have been called once with ${expected}`
          : `expected ${received.getMockName()} to have been called once with ${expected}`,
    };
  },
  toHaveBeenCalledAfter(received, expected) {
    const receivedCalls = received.mock.invocationCallOrder;
    const expectedCalls = expected.mock.invocationCallOrder;
    const pass = receivedCalls.some((receivedCall) =>
      expectedCalls.some((expectedCall) => receivedCall > expectedCall),
    );
    return {
      pass,
      message: () =>
        pass
          ? `expected ${received.getMockName()} not to have been called after ${expected.getMockName()}`
          : `expected ${received.getMockName()} to have been called after ${expected.getMockName()}`,
    };
  },
});

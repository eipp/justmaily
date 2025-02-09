import { render as rtlRender } from '@testing-library/react'
import { SupabaseProvider } from '../providers/supabase'
import { vi } from 'vitest'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    refresh: vi.fn(),
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn()
  }))
}))

// Mock Supabase client
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(),
      signOut: vi.fn(),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      resetPasswordForEmail: vi.fn(),
      updateUser: vi.fn(),
      mfa: {
        enroll: vi.fn(),
        challenge: vi.fn(),
        verify: vi.fn(),
        unenroll: vi.fn(),
        listFactors: vi.fn()
      }
    }
  }))
}))

// Mock MetricsService
vi.mock('../../monitoring', () => ({
  MetricsService: vi.fn(() => ({
    recordLatency: vi.fn(),
    recordAuthSuccess: vi.fn(),
    recordAuthFailure: vi.fn(),
    recordError: vi.fn(),
    incrementCounter: vi.fn()
  }))
}))

// Mock SecurityService
vi.mock('../../security', () => ({
  SecurityService: vi.fn(() => ({
    logAuditEvent: vi.fn(),
    logSecurityEvent: vi.fn()
  }))
}))

// Custom render function that includes providers
function render(ui: React.ReactElement, { ...options } = {}) {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <SupabaseProvider>
      {children}
    </SupabaseProvider>
  )

  return rtlRender(ui, { wrapper: Wrapper, ...options })
}

// Helper to create a mock session
function createMockSession(overrides = {}) {
  return {
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
      role: 'authenticated',
      ...overrides.user
    },
    access_token: 'test-access-token',
    refresh_token: 'test-refresh-token',
    expires_in: 3600,
    ...overrides
  }
}

// Helper to create mock auth error
function createMockAuthError(message = 'Authentication error', status = 401) {
  return {
    message,
    status
  }
}

// Helper to mock Supabase client responses
function mockSupabaseResponse(methodPath: string[], response: any) {
  const client = createClient('', '')
  let current: any = client

  // Navigate to the method's parent object
  for (let i = 0; i < methodPath.length - 1; i++) {
    current = current[methodPath[i]]
  }

  // Mock the method
  const methodName = methodPath[methodPath.length - 1]
  vi.spyOn(current, methodName).mockImplementation(() => Promise.resolve(response))

  return client
}

// Helper to wait for auth state changes
async function waitForAuthStateChange() {
  const client = createClient('', '')
  return new Promise((resolve) => {
    client.auth.onAuthStateChange((event, session) => {
      resolve({ event, session })
    })
  })
}

// Helper to simulate MFA challenge response
function createMockMFAChallenge(factorId: string) {
  return {
    data: {
      id: `challenge_${Date.now()}`,
      factor_id: factorId,
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 300000).toISOString()
    },
    error: null
  }
}

// Helper to simulate MFA verification response
function createMockMFAVerification(factorId: string, status = 'verified') {
  return {
    data: {
      id: factorId,
      status,
      updated_at: new Date().toISOString()
    },
    error: null
  }
}

// Helper to get mock router
function getMockRouter() {
  return useRouter()
}

// Export all helpers
export {
  render,
  createMockSession,
  createMockAuthError,
  mockSupabaseResponse,
  waitForAuthStateChange,
  createMockMFAChallenge,
  createMockMFAVerification,
  getMockRouter
} 
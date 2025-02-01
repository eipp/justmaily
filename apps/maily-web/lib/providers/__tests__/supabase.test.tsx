import { render, act, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { SupabaseProvider } from '../supabase'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    refresh: vi.fn(),
    push: vi.fn()
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

describe('SupabaseProvider', () => {
  let mockRouter: ReturnType<typeof useRouter>
  let mockSupabaseClient: ReturnType<typeof createClient>

  beforeEach(() => {
    mockRouter = useRouter()
    mockSupabaseClient = createClient('', '')
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Authentication State', () => {
    it('should initialize with no session', async () => {
      vi.mocked(mockSupabaseClient.auth.getSession).mockResolvedValueOnce({
        data: { session: null },
        error: null
      })

      const { result } = renderHook(() => useSupabase(), {
        wrapper: ({ children }) => (
          <SupabaseProvider>{children}</SupabaseProvider>
        )
      })

      await waitFor(() => {
        expect(result.current.session).toBeNull()
        expect(result.current.user).toBeNull()
      })
    })

    it('should handle successful session initialization', async () => {
      const mockSession = {
        user: { id: 'user123', email: 'test@example.com' },
        access_token: 'token123',
        refresh_token: 'refresh123'
      }

      vi.mocked(mockSupabaseClient.auth.getSession).mockResolvedValueOnce({
        data: { session: mockSession },
        error: null
      })

      const { result } = renderHook(() => useSupabase(), {
        wrapper: ({ children }) => (
          <SupabaseProvider>{children}</SupabaseProvider>
        )
      })

      await waitFor(() => {
        expect(result.current.session).toEqual(mockSession)
        expect(result.current.user).toEqual(mockSession.user)
      })
    })

    it('should handle session error', async () => {
      vi.mocked(mockSupabaseClient.auth.getSession).mockResolvedValueOnce({
        data: { session: null },
        error: new Error('Failed to get session')
      })

      const { result } = renderHook(() => useSupabase(), {
        wrapper: ({ children }) => (
          <SupabaseProvider>{children}</SupabaseProvider>
        )
      })

      await waitFor(() => {
        expect(result.current.session).toBeNull()
        expect(result.current.user).toBeNull()
      })
    })
  })

  describe('Authentication Methods', () => {
    it('should handle sign in with password', async () => {
      const mockCredentials = {
        email: 'test@example.com',
        password: 'password123'
      }

      vi.mocked(mockSupabaseClient.auth.signInWithPassword).mockResolvedValueOnce({
        data: {
          user: { id: 'user123', email: mockCredentials.email },
          session: { access_token: 'token123' }
        },
        error: null
      })

      const { result } = renderHook(() => useSupabase(), {
        wrapper: ({ children }) => (
          <SupabaseProvider>{children}</SupabaseProvider>
        )
      })

      await act(async () => {
        await result.current.signIn(mockCredentials)
      })

      expect(mockSupabaseClient.auth.signInWithPassword).toHaveBeenCalledWith(mockCredentials)
      expect(mockRouter.refresh).toHaveBeenCalled()
    })

    it('should handle sign in errors', async () => {
      const mockCredentials = {
        email: 'test@example.com',
        password: 'wrong'
      }

      vi.mocked(mockSupabaseClient.auth.signInWithPassword).mockResolvedValueOnce({
        data: { user: null, session: null },
        error: new Error('Invalid credentials')
      })

      const { result } = renderHook(() => useSupabase(), {
        wrapper: ({ children }) => (
          <SupabaseProvider>{children}</SupabaseProvider>
        )
      })

      await act(async () => {
        const { error } = await result.current.signIn(mockCredentials)
        expect(error).toBeTruthy()
        expect(error?.message).toBe('Invalid credentials')
      })

      expect(mockRouter.refresh).not.toHaveBeenCalled()
    })

    it('should handle sign up', async () => {
      const mockCredentials = {
        email: 'new@example.com',
        password: 'password123'
      }

      vi.mocked(mockSupabaseClient.auth.signUp).mockResolvedValueOnce({
        data: {
          user: { id: 'user123', email: mockCredentials.email },
          session: null
        },
        error: null
      })

      const { result } = renderHook(() => useSupabase(), {
        wrapper: ({ children }) => (
          <SupabaseProvider>{children}</SupabaseProvider>
        )
      })

      await act(async () => {
        const { error } = await result.current.signUp(mockCredentials)
        expect(error).toBeNull()
      })

      expect(mockSupabaseClient.auth.signUp).toHaveBeenCalledWith(mockCredentials)
    })

    it('should handle sign out', async () => {
      vi.mocked(mockSupabaseClient.auth.signOut).mockResolvedValueOnce({
        error: null
      })

      const { result } = renderHook(() => useSupabase(), {
        wrapper: ({ children }) => (
          <SupabaseProvider>{children}</SupabaseProvider>
        )
      })

      await act(async () => {
        await result.current.signOut()
      })

      expect(mockSupabaseClient.auth.signOut).toHaveBeenCalled()
      expect(mockRouter.refresh).toHaveBeenCalled()
    })
  })

  describe('MFA Methods', () => {
    it('should handle MFA enrollment', async () => {
      const mockFactorId = 'totp_123'
      vi.mocked(mockSupabaseClient.auth.mfa.enroll).mockResolvedValueOnce({
        data: {
          id: mockFactorId,
          type: 'totp',
          status: 'pending',
          totp: {
            qr_code: 'qr_data',
            secret: 'secret123'
          }
        },
        error: null
      })

      const { result } = renderHook(() => useSupabase(), {
        wrapper: ({ children }) => (
          <SupabaseProvider>{children}</SupabaseProvider>
        )
      })

      await act(async () => {
        const { data, error } = await result.current.enrollMFA()
        expect(error).toBeNull()
        expect(data).toHaveProperty('id', mockFactorId)
        expect(data).toHaveProperty('totp.qr_code')
      })
    })

    it('should handle MFA verification', async () => {
      const mockFactorId = 'totp_123'
      const mockCode = '123456'

      vi.mocked(mockSupabaseClient.auth.mfa.verify).mockResolvedValueOnce({
        data: {
          id: mockFactorId,
          type: 'totp',
          status: 'verified'
        },
        error: null
      })

      const { result } = renderHook(() => useSupabase(), {
        wrapper: ({ children }) => (
          <SupabaseProvider>{children}</SupabaseProvider>
        )
      })

      await act(async () => {
        const { data, error } = await result.current.verifyMFA(mockFactorId, mockCode)
        expect(error).toBeNull()
        expect(data).toHaveProperty('status', 'verified')
      })
    })

    it('should handle MFA challenge', async () => {
      const mockFactorId = 'totp_123'

      vi.mocked(mockSupabaseClient.auth.mfa.challenge).mockResolvedValueOnce({
        data: {
          id: 'challenge_123',
          factor_id: mockFactorId,
          expires_at: new Date(Date.now() + 300000).toISOString()
        },
        error: null
      })

      const { result } = renderHook(() => useSupabase(), {
        wrapper: ({ children }) => (
          <SupabaseProvider>{children}</SupabaseProvider>
        )
      })

      await act(async () => {
        const { data, error } = await result.current.challengeMFA(mockFactorId)
        expect(error).toBeNull()
        expect(data).toHaveProperty('factor_id', mockFactorId)
      })
    })

    it('should handle listing MFA factors', async () => {
      vi.mocked(mockSupabaseClient.auth.mfa.listFactors).mockResolvedValueOnce({
        data: {
          all: [
            {
              id: 'totp_123',
              type: 'totp',
              status: 'verified'
            }
          ],
          totp: [
            {
              id: 'totp_123',
              type: 'totp',
              status: 'verified'
            }
          ]
        },
        error: null
      })

      const { result } = renderHook(() => useSupabase(), {
        wrapper: ({ children }) => (
          <SupabaseProvider>{children}</SupabaseProvider>
        )
      })

      await act(async () => {
        const { data, error } = await result.current.listMFAFactors()
        expect(error).toBeNull()
        expect(data?.all).toHaveLength(1)
        expect(data?.totp).toHaveLength(1)
      })
    })
  })

  describe('Password Reset', () => {
    it('should handle password reset request', async () => {
      const mockEmail = 'test@example.com'

      vi.mocked(mockSupabaseClient.auth.resetPasswordForEmail).mockResolvedValueOnce({
        data: {},
        error: null
      })

      const { result } = renderHook(() => useSupabase(), {
        wrapper: ({ children }) => (
          <SupabaseProvider>{children}</SupabaseProvider>
        )
      })

      await act(async () => {
        const { error } = await result.current.resetPassword(mockEmail)
        expect(error).toBeNull()
      })

      expect(mockSupabaseClient.auth.resetPasswordForEmail).toHaveBeenCalledWith(
        mockEmail,
        expect.any(Object)
      )
    })

    it('should handle password update', async () => {
      const mockNewPassword = 'newpassword123'

      vi.mocked(mockSupabaseClient.auth.updateUser).mockResolvedValueOnce({
        data: { user: { id: 'user123' } },
        error: null
      })

      const { result } = renderHook(() => useSupabase(), {
        wrapper: ({ children }) => (
          <SupabaseProvider>{children}</SupabaseProvider>
        )
      })

      await act(async () => {
        const { error } = await result.current.updatePassword(mockNewPassword)
        expect(error).toBeNull()
      })

      expect(mockSupabaseClient.auth.updateUser).toHaveBeenCalledWith({
        password: mockNewPassword
      })
    })
  })
}) 
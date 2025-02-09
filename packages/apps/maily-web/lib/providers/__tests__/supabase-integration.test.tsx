import { render, act, waitFor, screen } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { SupabaseProvider } from '../supabase'
import { useSupabase } from '../../hooks/use-supabase'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import {
  createMockSession,
  createMockAuthError,
  mockSupabaseResponse,
  waitForAuthStateChange
} from '../../test/test-utils'

describe('Supabase Authentication Integration Tests', () => {
  let mockRouter: ReturnType<typeof useRouter>
  let mockSupabaseClient: ReturnType<typeof createClient>

  beforeEach(() => {
    mockRouter = useRouter()
    mockSupabaseClient = createClient('', '')
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Authentication Flow', () => {
    it('should handle complete sign up and sign in flow with MFA', async () => {
      // 1. Sign up
      const signUpCredentials = {
        email: 'new@example.com',
        password: 'password123'
      }

      vi.mocked(mockSupabaseClient.auth.signUp).mockResolvedValueOnce({
        data: {
          user: { id: 'user123', email: signUpCredentials.email },
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
        const { error } = await result.current.signUp(signUpCredentials)
        expect(error).toBeNull()
      })

      // 2. Sign in
      vi.mocked(mockSupabaseClient.auth.signInWithPassword).mockResolvedValueOnce({
        data: {
          user: { id: 'user123', email: signUpCredentials.email },
          session: { access_token: 'token123' }
        },
        error: null
      })

      await act(async () => {
        const { error } = await result.current.signIn(signUpCredentials)
        expect(error).toBeNull()
      })

      expect(mockRouter.refresh).toHaveBeenCalled()

      // 3. Enroll MFA
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

      await act(async () => {
        const { data, error } = await result.current.enrollMFA()
        expect(error).toBeNull()
        expect(data).toHaveProperty('id', mockFactorId)
      })

      // 4. Verify MFA
      vi.mocked(mockSupabaseClient.auth.mfa.verify).mockResolvedValueOnce({
        data: {
          id: mockFactorId,
          type: 'totp',
          status: 'verified'
        },
        error: null
      })

      await act(async () => {
        const { data, error } = await result.current.verifyMFA(mockFactorId, '123456')
        expect(error).toBeNull()
        expect(data).toHaveProperty('status', 'verified')
      })

      // 5. Sign out
      vi.mocked(mockSupabaseClient.auth.signOut).mockResolvedValueOnce({
        error: null
      })

      await act(async () => {
        await result.current.signOut()
      })

      expect(mockRouter.refresh).toHaveBeenCalled()
    })

    it('should handle password reset flow', async () => {
      const email = 'test@example.com'
      const newPassword = 'newpassword123'

      // 1. Request password reset
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
        const { error } = await result.current.resetPassword(email)
        expect(error).toBeNull()
      })

      // 2. Update password
      vi.mocked(mockSupabaseClient.auth.updateUser).mockResolvedValueOnce({
        data: { user: { id: 'user123' } },
        error: null
      })

      await act(async () => {
        const { error } = await result.current.updatePassword(newPassword)
        expect(error).toBeNull()
      })

      // 3. Sign in with new password
      vi.mocked(mockSupabaseClient.auth.signInWithPassword).mockResolvedValueOnce({
        data: {
          user: { id: 'user123', email },
          session: { access_token: 'token123' }
        },
        error: null
      })

      await act(async () => {
        const { error } = await result.current.signIn({
          email,
          password: newPassword
        })
        expect(error).toBeNull()
      })
    })
  })

  describe('Session Management', () => {
    it('should handle session refresh', async () => {
      const mockSession = createMockSession()

      // Initial session
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
      })

      // Session change
      const newSession = createMockSession({
        access_token: 'new_token'
      })

      await act(async () => {
        const { event, session } = await waitForAuthStateChange()
        expect(event).toBe('SIGNED_IN')
        expect(session).toEqual(newSession)
      })
    })

    it('should handle session expiry', async () => {
      const mockSession = createMockSession({
        expires_in: 0
      })

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
        expect(result.current.session).toBeNull()
      })

      expect(mockRouter.push).toHaveBeenCalledWith('/auth/signin')
    })
  })

  describe('Error Handling', () => {
    it('should handle authentication errors', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'wrong'
      }

      vi.mocked(mockSupabaseClient.auth.signInWithPassword).mockResolvedValueOnce({
        data: { user: null, session: null },
        error: createMockAuthError('Invalid credentials')
      })

      const { result } = renderHook(() => useSupabase(), {
        wrapper: ({ children }) => (
          <SupabaseProvider>{children}</SupabaseProvider>
        )
      })

      await act(async () => {
        const { error } = await result.current.signIn(credentials)
        expect(error).toBeTruthy()
        expect(error?.message).toBe('Invalid credentials')
      })

      expect(mockRouter.refresh).not.toHaveBeenCalled()
    })

    it('should handle MFA errors', async () => {
      const mockFactorId = 'totp_123'

      // MFA challenge error
      vi.mocked(mockSupabaseClient.auth.mfa.challenge).mockResolvedValueOnce({
        data: null,
        error: createMockAuthError('Factor not found')
      })

      const { result } = renderHook(() => useSupabase(), {
        wrapper: ({ children }) => (
          <SupabaseProvider>{children}</SupabaseProvider>
        )
      })

      await act(async () => {
        const { error } = await result.current.challengeMFA(mockFactorId)
        expect(error).toBeTruthy()
        expect(error?.message).toBe('Factor not found')
      })

      // MFA verification error
      vi.mocked(mockSupabaseClient.auth.mfa.verify).mockResolvedValueOnce({
        data: null,
        error: createMockAuthError('Invalid code')
      })

      await act(async () => {
        const { error } = await result.current.verifyMFA(mockFactorId, '123456')
        expect(error).toBeTruthy()
        expect(error?.message).toBe('Invalid code')
      })
    })

    it('should handle network errors', async () => {
      vi.mocked(mockSupabaseClient.auth.getSession).mockRejectedValueOnce(
        new Error('Network error')
      )

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

  describe('Concurrent Operations', () => {
    it('should handle multiple auth state changes', async () => {
      const mockSession1 = createMockSession()
      const mockSession2 = createMockSession({
        access_token: 'token2'
      })

      vi.mocked(mockSupabaseClient.auth.getSession)
        .mockResolvedValueOnce({
          data: { session: mockSession1 },
          error: null
        })
        .mockResolvedValueOnce({
          data: { session: mockSession2 },
          error: null
        })

      const { result } = renderHook(() => useSupabase(), {
        wrapper: ({ children }) => (
          <SupabaseProvider>{children}</SupabaseProvider>
        )
      })

      await waitFor(() => {
        expect(result.current.session).toEqual(mockSession1)
      })

      await act(async () => {
        const [change1, change2] = await Promise.all([
          waitForAuthStateChange(),
          waitForAuthStateChange()
        ])

        expect(change1.session).not.toEqual(change2.session)
      })
    })

    it('should handle rapid auth method calls', async () => {
      const { result } = renderHook(() => useSupabase(), {
        wrapper: ({ children }) => (
          <SupabaseProvider>{children}</SupabaseProvider>
        )
      })

      // Multiple rapid sign-in attempts
      const signInPromises = Array.from({ length: 3 }, () =>
        result.current.signIn({
          email: 'test@example.com',
          password: 'password123'
        })
      )

      vi.mocked(mockSupabaseClient.auth.signInWithPassword)
        .mockResolvedValueOnce({
          data: { user: null, session: null },
          error: createMockAuthError('Rate limited')
        })

      await act(async () => {
        const results = await Promise.all(signInPromises)
        expect(results.some(r => r.error?.message === 'Rate limited')).toBe(true)
      })
    })
  })
}) 
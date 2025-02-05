import { createContext, useContext, useEffect, useState } from 'react'
import createBrowserClient from '@/lib/supabase-ssr'
import { useRouter } from 'next/navigation'
import { Database } from '@/types/supabase'
import { User } from '@supabase/supabase-js'
import { MetricsService } from '@/lib/metrics'
import { SecurityService } from '@/lib/security'

interface MFAFactor {
  id: string
  type: 'totp' | 'sms'
  status: 'verified' | 'unverified'
  createdAt: string
}

interface AuthError extends Error {
  status?: number
  code?: string
}

interface SupabaseContextType {
  supabase: ReturnType<typeof createBrowserClient<Database>>
  user: User | null
  loading: boolean
  error: AuthError | null
  signIn: (emailOrProvider: string, password?: string) => Promise<void>
  signUp: (email: string, password: string, metadata?: any) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updateProfile: (updates: any) => Promise<void>
  setupMFA: () => Promise<{ secret: string; qrCode: string }>
  verifyMFA: (code: string) => Promise<void>
  disableMFA: () => Promise<void>
  getMFAFactors: () => Promise<MFAFactor[]>
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined)

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [supabase] = useState(() =>
    createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true,
        },
        global: {
          headers: {
            'x-client-info': 'maily-web',
          },
        },
      }
    )
  )

  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<AuthError | null>(null)
  const router = useRouter()
  const metrics = MetricsService
  const security = SecurityService

  useEffect(() => {
    const startTime = Date.now()

    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
      metrics.recordLatency('auth_session_check', Date.now() - startTime)
    })

    // Listen for changes on auth state (logged in, signed out, etc.)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
      router.refresh()

      // Log security events
      security.logSecurityEvent({
        type: 'auth_state_change',
        details: { event, userId: session?.user?.id }
      })
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router, supabase, metrics, security])

  const handleError = (error: any): AuthError => {
    const authError: AuthError = new Error(error.message || 'An error occurred')
    authError.status = error.status
    authError.code = error.code

    // Log error metrics
    metrics.recordError('auth_error', {
      code: error.code,
      message: error.message
    })

    return authError
  }

  const signIn = async (emailOrProvider: string, password?: string) => {
    const startTime = Date.now()

    try {
      setError(null)
      let result

      if (password) {
        // Email/password sign in
        result = await supabase.auth.signInWithPassword({
          email: emailOrProvider,
          password,
        })
      } else {
        // OAuth sign in
        result = await supabase.auth.signInWithOAuth({
          provider: emailOrProvider as any,
          options: {
            redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
          },
        })
      }

      if (result.error) throw result.error

      metrics.recordLatency('auth_sign_in', Date.now() - startTime)
      security.logSecurityEvent({
        type: 'user_sign_in',
        details: {
          method: password ? 'password' : 'oauth',
          provider: emailOrProvider
        }
      })
    } catch (error: any) {
      setError(handleError(error))
      throw error
    }
  }

  const signUp = async (email: string, password: string, metadata?: any) => {
    const startTime = Date.now()

    try {
      setError(null)
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
          emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
        },
      })

      if (error) throw error

      metrics.recordLatency('auth_sign_up', Date.now() - startTime)
      security.logSecurityEvent({
        type: 'user_sign_up',
        details: { email }
      })
    } catch (error: any) {
      setError(handleError(error))
      throw error
    }
  }

  const signOut = async () => {
    const startTime = Date.now()

    try {
      setError(null)
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      metrics.recordLatency('auth_sign_out', Date.now() - startTime)
      security.logSecurityEvent({
        type: 'user_sign_out',
        details: { userId: user?.id }
      })
    } catch (error: any) {
      setError(handleError(error))
      throw error
    }
  }

  const resetPassword = async (email: string) => {
    const startTime = Date.now()

    try {
      setError(null)
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
      })

      if (error) throw error

      metrics.recordLatency('auth_reset_password', Date.now() - startTime)
      security.logSecurityEvent({
        type: 'password_reset_requested',
        details: { email }
      })
    } catch (error: any) {
      setError(handleError(error))
      throw error
    }
  }

  const updateProfile = async (updates: any) => {
    const startTime = Date.now()

    try {
      setError(null)
      const { error } = await supabase.auth.updateUser(updates)
      if (error) throw error

      metrics.recordLatency('auth_update_profile', Date.now() - startTime)
      security.logSecurityEvent({
        type: 'profile_updated',
        details: { userId: user?.id }
      })
    } catch (error: any) {
      setError(handleError(error))
      throw error
    }
  }

  const setupMFA = async () => {
    const startTime = Date.now()

    try {
      setError(null)
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp'
      })

      if (error) throw error

      metrics.recordLatency('auth_setup_mfa', Date.now() - startTime)
      security.logSecurityEvent({
        type: 'mfa_setup_initiated',
        details: { userId: user?.id }
      })

      return {
        secret: data.totp.secret,
        qrCode: data.totp.uri
      }
    } catch (error: any) {
      setError(handleError(error))
      throw error
    }
  }

  const verifyMFA = async (code: string) => {
    const startTime = Date.now()

    try {
      setError(null)
      const { error } = await supabase.auth.mfa.verify({
        factorId: 'totp',
        code
      })

      if (error) throw error

      metrics.recordLatency('auth_verify_mfa', Date.now() - startTime)
      security.logSecurityEvent({
        type: 'mfa_verified',
        details: { userId: user?.id }
      })
    } catch (error: any) {
      setError(handleError(error))
      throw error
    }
  }

  const disableMFA = async () => {
    const startTime = Date.now()

    try {
      setError(null)
      const { error } = await supabase.auth.mfa.unenroll({
        factorId: 'totp'
      })

      if (error) throw error

      metrics.recordLatency('auth_disable_mfa', Date.now() - startTime)
      security.logSecurityEvent({
        type: 'mfa_disabled',
        details: { userId: user?.id }
      })
    } catch (error: any) {
      setError(handleError(error))
      throw error
    }
  }

  const getMFAFactors = async () => {
    const startTime = Date.now()

    try {
      setError(null)
      const { data, error } = await supabase.auth.mfa.listFactors()
      if (error) throw error

      metrics.recordLatency('auth_get_mfa_factors', Date.now() - startTime)

      return data.totp.map(factor => ({
        id: factor.id,
        type: 'totp' as const,
        status: factor.status as 'verified' | 'unverified',
        createdAt: factor.created_at
      }))
    } catch (error: any) {
      setError(handleError(error))
      throw error
    }
  }

  return (
    <SupabaseContext.Provider
      value={{
        supabase,
        user,
        loading,
        error,
        signIn,
        signUp,
        signOut,
        resetPassword,
        updateProfile,
        setupMFA,
        verifyMFA,
        disableMFA,
        getMFAFactors
      }}
    >
      {children}
    </SupabaseContext.Provider>
  )
}

export function useSupabase() {
  const context = useContext(SupabaseContext)
  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider')
  }
  return context
}

// Alias for compatibility
export const useSupabaseContext = useSupabase

export function useUser() {
  const { supabase } = useSupabase()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  return { user, loading }
}

export function useSession() {
  const { supabase } = useSupabase()
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session)
        setLoading(false)
      }
    )

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  return { session, loading }
}

export default createBrowserClient; 
import { createContext, useContext, useEffect, useState } from 'react'
import flagsmith from 'flagsmith'
import { IState, IFlags } from 'flagsmith/types'
import { useUser } from './supabase'

interface FlagsmithContextType {
  flags: IFlags
  isLoading: boolean
  error: Error | null
  hasFeature: (key: string) => boolean
  getValue: (key: string) => string | number | boolean | null
  identify: (userId: string, traits?: Record<string, any>) => Promise<void>
}

const FlagsmithContext = createContext<FlagsmithContextType | undefined>(undefined)

export function FlagsmithProvider({ children }: { children: React.ReactNode }) {
  const [flags, setFlags] = useState<IFlags>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const { user } = useUser()

  useEffect(() => {
    const initFlagsmith = async () => {
      try {
        await flagsmith.init({
          environmentID: process.env.NEXT_PUBLIC_FLAGSMITH_ENV_KEY!,
          api: process.env.NEXT_PUBLIC_FLAGSMITH_API_URL,
          defaultFlags: {
            default_flag: true,
          },
          onChange: (oldFlags: IState, params: IState) => {
          },
          onError: (err: Error) => {
            console.error('Flagsmith error:', err)
            setError(err)
          },
          cacheFlags: true,
          enableAnalytics: process.env.NODE_ENV === 'production',
          preventFetch: false,
        })

        if (user?.id) {
          await flagsmith.identify(user.id, {
            email: user.email,
            created_at: user.created_at,
          })
        }

        const state = flagsmith.getState()
        setFlags(state.flags)
        setIsLoading(false)
      } catch (err) {
        setError(err as Error)
        setIsLoading(false)
      }
    }

    initFlagsmith()

    return () => {
      flagsmith.logout()
    }
  }, [user])

  const hasFeature = (key: string): boolean => {
    try {
      return flagsmith.hasFeature(key)
    } catch (err) {
      console.error(`Error checking feature ${key}:`, err)
      return false
    }
  }

  const getValue = (key: string): string | number | boolean | null => {
    try {
      return flagsmith.getValue(key)
    } catch (err) {
      console.error(`Error getting value for ${key}:`, err)
      return null
    }
  }

  const identify = async (userId: string, traits?: Record<string, any>) => {
    try {
      await flagsmith.identify(userId, traits)
      const state = flagsmith.getState()
      setFlags(state.flags)
    } catch (err) {
      console.error('Error identifying user:', err)
      throw err
    }
  }

  return (
    <FlagsmithContext.Provider
      value={{
        flags,
        isLoading,
        error,
        hasFeature,
        getValue,
        identify,
      }}
    >
      {children}
    </FlagsmithContext.Provider>
  )
}

export function useFlagsmith() {
  const context = useContext(FlagsmithContext)
  if (context === undefined) {
    throw new Error('useFlagsmith must be used within a FlagsmithProvider')
  }
  return context
}

export function useFeature(key: string) {
  const { hasFeature } = useFlagsmith()
  return hasFeature(key)
}

export function useFeatureValue(key: string) {
  const { getValue } = useFlagsmith()
  return getValue(key)
} 
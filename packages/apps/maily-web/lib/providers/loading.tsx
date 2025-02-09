import { createContext, useContext, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import NProgress from 'nprogress'
import { useEffect } from 'react'

interface LoadingContextType {
  isLoading: boolean
  progress: number
  startLoading: (key?: string) => void
  stopLoading: (key?: string) => void
  setProgress: (progress: number) => void
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined)

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [loadingKeys, setLoadingKeys] = useState<Set<string>>(new Set())
  const router = useRouter()

  // Configure NProgress
  useEffect(() => {
    NProgress.configure({
      minimum: 0.1,
      showSpinner: false,
      trickleSpeed: 200,
      easing: 'ease',
      speed: 500,
    })
  }, [])

  // Handle route changes
  useEffect(() => {
    const handleStart = () => {
      NProgress.start()
      setIsLoading(true)
    }

    const handleStop = () => {
      NProgress.done()
      setIsLoading(false)
      setProgress(0)
    }

    router.events?.on('routeChangeStart', handleStart)
    router.events?.on('routeChangeComplete', handleStop)
    router.events?.on('routeChangeError', handleStop)

    return () => {
      router.events?.off('routeChangeStart', handleStart)
      router.events?.off('routeChangeComplete', handleStop)
      router.events?.off('routeChangeError', handleStop)
    }
  }, [router])

  const startLoading = useCallback((key?: string) => {
    if (key) {
      setLoadingKeys((prev) => new Set(prev).add(key))
    }
    setIsLoading(true)
    NProgress.start()
  }, [])

  const stopLoading = useCallback((key?: string) => {
    if (key) {
      setLoadingKeys((prev) => {
        const next = new Set(prev)
        next.delete(key)
        if (next.size === 0) {
          setIsLoading(false)
          NProgress.done()
          setProgress(0)
        }
        return next
      })
    } else {
      setLoadingKeys(new Set())
      setIsLoading(false)
      NProgress.done()
      setProgress(0)
    }
  }, [])

  const updateProgress = useCallback((value: number) => {
    const clampedValue = Math.min(Math.max(value, 0), 100)
    setProgress(clampedValue)
    if (clampedValue > 0 && clampedValue < 100) {
      NProgress.set(clampedValue / 100)
    } else if (clampedValue === 100) {
      NProgress.done()
    }
  }, [])

  return (
    <LoadingContext.Provider
      value={{
        isLoading,
        progress,
        startLoading,
        stopLoading,
        setProgress: updateProgress,
      }}
    >
      {children}
    </LoadingContext.Provider>
  )
}

export function useLoading() {
  const context = useContext(LoadingContext)
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider')
  }
  return context
}

export function useLoadingCallback<T extends (...args: any[]) => Promise<any>>(
  callback: T,
  key?: string
): T {
  const { startLoading, stopLoading } = useLoading()

  return (async (...args: Parameters<T>) => {
    try {
      startLoading(key)
      const result = await callback(...args)
      return result
    } finally {
      stopLoading(key)
    }
  }) as T
}

export function useLoadingProgress() {
  const { progress, setProgress } = useLoading()
  return { progress, setProgress }
} 
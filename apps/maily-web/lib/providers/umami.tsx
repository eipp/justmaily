import { useEffect } from 'react'
import Script from 'next/script'
import { usePathname, useSearchParams } from 'next/navigation'

declare global {
  interface Window {
    umami?: {
      track: (eventName: string, data?: Record<string, any>) => void
      trackEvent: (
        eventName: string,
        eventData?: Record<string, any>,
        url?: string,
        websiteId?: string
      ) => void
      trackView: (url?: string, referrer?: string, websiteId?: string) => void
    }
  }
}

export function UmamiProvider() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Track page views
    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '')
    window.umami?.trackView(url)
  }, [pathname, searchParams])

  if (!process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID) {
    return null
  }

  return (
    <Script
      async
      defer
      data-website-id={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}
      src={process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL}
      data-domains={process.env.NEXT_PUBLIC_APP_URL}
      data-cache="true"
      data-auto-track="true"
      data-do-not-track="true"
      data-respect-dnt="true"
    />
  )
}

export function trackEvent(
  eventName: string,
  eventData?: Record<string, any>,
  url?: string
) {
  if (typeof window === 'undefined' || !window.umami) {
    return
  }

  try {
    window.umami.trackEvent(
      eventName,
      eventData,
      url,
      process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID
    )
  } catch (error) {
    console.error('Failed to track event:', error)
  }
}

export function useTrackEvent() {
  return trackEvent
}

export function usePageView(pageName: string) {
  useEffect(() => {
    trackEvent('page_view', { page: pageName })
  }, [pageName])
}

export function useTrackConversion(
  conversionName: string,
  conversionData?: Record<string, any>
) {
  return () => {
    trackEvent(`conversion_${conversionName}`, {
      ...conversionData,
      timestamp: new Date().toISOString(),
    })
  }
}

export function useTrackFeatureUsage(featureName: string) {
  return (actionName: string, actionData?: Record<string, any>) => {
    trackEvent(`feature_${featureName}_${actionName}`, {
      ...actionData,
      feature: featureName,
      action: actionName,
      timestamp: new Date().toISOString(),
    })
  }
}

export function useTrackError() {
  return (error: Error, context?: Record<string, any>) => {
    trackEvent('error', {
      ...context,
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    })
  }
}

export function useTrackTiming(category: string, variable: string) {
  const startTime = Date.now()

  return () => {
    const duration = Date.now() - startTime
    trackEvent('timing', {
      category,
      variable,
      duration,
      timestamp: new Date().toISOString(),
    })
    return duration
  }
} 
'use client'

import * as React from 'react'
import * as Sentry from '@sentry/nextjs'
import { Button } from '@/components/ui/atoms/button'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  React.useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html>
      <body>
        <div className="flex h-[100vh] flex-col items-center justify-center">
          <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
            <div className="mb-4 text-7xl font-bold">Oops!</div>
            <h1 className="mb-2 text-2xl font-bold">
              A critical error occurred
            </h1>
            <p className="mb-4 text-muted-foreground">
              We've been notified about this issue and are working to fix it.
              Please try again later.
            </p>
            <div className="flex space-x-4">
              <Button variant="outline" onClick={() => reset()}>
                Try again
              </Button>
              <Button onClick={() => window.location.reload()}>
                Refresh page
              </Button>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
} 
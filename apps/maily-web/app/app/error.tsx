'use client'

import * as React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/atoms/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  React.useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex h-[100vh] flex-col items-center justify-center">
      <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
        <div className="mb-4 text-7xl font-bold">500</div>
        <h1 className="mb-2 text-2xl font-bold">Something went wrong!</h1>
        <p className="mb-4 text-muted-foreground">
          {error.message || 'An unexpected error occurred. Please try again later.'}
        </p>
        <div className="flex space-x-4">
          <Button variant="outline" onClick={() => reset()}>
            Try again
          </Button>
          <Button asChild>
            <Link href="/">Go back home</Link>
          </Button>
        </div>
      </div>
    </div>
  )
} 
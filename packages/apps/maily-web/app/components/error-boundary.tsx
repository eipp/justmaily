'use client'

import * as React from 'react'
import * as Sentry from '@sentry/nextjs'
import { XCircle } from 'lucide-react'

import { Button } from '@/components/ui/atoms/button'
import { toast } from '@/components/ui/atoms/use-toast'

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    Sentry.captureException(error, { extra: errorInfo })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 rounded-lg border bg-background p-8 text-center">
          <XCircle className="h-12 w-12 text-destructive" />
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Something went wrong</h2>
            <p className="text-muted-foreground">
              {this.state.error?.message ||
                'An unexpected error occurred. Please try again later.'}
            </p>
          </div>
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => {
                window.location.reload()
              }}
            >
              Refresh Page
            </Button>
            <Button
              onClick={() => {
                this.setState({ hasError: false, error: null })
                toast({
                  title: 'Retrying...',
                  description: 'Attempting to recover from the error.',
                })
              }}
            >
              Try Again
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
} 
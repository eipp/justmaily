import { Component, ErrorInfo, ReactNode } from 'react'
import * as Sentry from '@sentry/nextjs'
import { Button } from '@/components/ui/button'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo)
    
    Sentry.withScope((scope) => {
      scope.setExtras(errorInfo)
      Sentry.captureException(error)
    })
  }

  private handleReload = () => {
    window.location.reload()
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
          <h1 className="mb-4 text-4xl font-bold">Something went wrong</h1>
          <p className="mb-8 text-lg text-muted-foreground">
            We apologize for the inconvenience. Please try reloading the page.
          </p>
          <Button onClick={this.handleReload} size="lg">
            Reload Page
          </Button>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <div className="mt-8 max-w-2xl overflow-auto rounded-lg bg-muted p-4 text-left">
              <p className="mb-2 font-mono text-sm">
                {this.state.error.toString()}
              </p>
              {this.state.errorInfo && (
                <pre className="text-xs">
                  {this.state.errorInfo.componentStack}
                </pre>
              )}
            </div>
          )}
        </div>
      )
    }

    return this.props.children
  }
} 
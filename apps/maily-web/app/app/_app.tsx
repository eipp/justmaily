import type { AppProps } from 'next/app'
import { Analytics } from '@vercel/analytics/react'
import { ThemeProvider } from 'next-themes'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { AppShell } from '@/components/layout/app-shell'
import { Toaster } from '@/components/ui/toaster'
import { performanceMonitor } from '@/lib/monitoring/performance'
import '@/styles/globals.css'

if (typeof window !== 'undefined') {
  performanceMonitor.getInstance()
}

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ErrorBoundary>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <AppShell>
          <Component {...pageProps} />
          <Toaster />
        </AppShell>
        <Analytics />
      </ThemeProvider>
    </ErrorBoundary>
  )
} 
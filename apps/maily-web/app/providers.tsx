'use client'

import { Suspense } from 'react'
import { Toaster } from 'sonner'
import { OpenCanvasProvider } from '@opencanvas/react'
import { SupabaseProvider } from '@/lib/providers/supabase'
import { VercelAIProvider } from '@/lib/providers/vercel-ai'
import { UmamiProvider } from '@/lib/providers/umami'
import { MatrixProvider } from '@/lib/providers/matrix'
import { FlagsmithProvider } from '@/lib/providers/flagsmith'
import { LoadingProvider } from '@/lib/providers/loading'
import { ErrorBoundary } from '@/components/error-boundary'
import { ThemeProvider } from '@/components/theme-provider'
import { ProjectMemoryProvider } from '@/lib/providers/project-memory'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <SupabaseProvider>
          <FlagsmithProvider>
            <LoadingProvider>
              <ProjectMemoryProvider>
                <OpenCanvasProvider>
                  <VercelAIProvider>
                    <MatrixProvider>
                      <UmamiProvider />
                      <Suspense fallback={null}>
                        {children}
                        <Toaster position="bottom-right" />
                      </Suspense>
                    </MatrixProvider>
                  </VercelAIProvider>
                </OpenCanvasProvider>
              </ProjectMemoryProvider>
            </LoadingProvider>
          </FlagsmithProvider>
        </SupabaseProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
} 
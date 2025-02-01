import { createContext, useContext, useEffect, useState } from 'react'
import { OpenCanvas, CanvasOptions, CanvasState } from '@opencanvas/core'
import { useMatrix } from './matrix'
import { useSession } from './supabase'
import { useTrackEvent } from './umami'

interface OpenCanvasContextType {
  canvas: OpenCanvas | null
  state: CanvasState | null
  isLoading: boolean
  error: Error | null
  createCanvas: (options: CanvasOptions) => Promise<void>
  joinCanvas: (canvasId: string) => Promise<void>
  leaveCanvas: () => Promise<void>
  updateCanvas: (updates: Partial<CanvasState>) => Promise<void>
  exportCanvas: () => Promise<Blob>
}

const OpenCanvasContext = createContext<OpenCanvasContextType | undefined>(
  undefined
)

export function OpenCanvasProvider({ children }: { children: React.ReactNode }) {
  const [canvas, setCanvas] = useState<OpenCanvas | null>(null)
  const [state, setState] = useState<CanvasState | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const { client: matrixClient } = useMatrix()
  const { session } = useSession()
  const trackEvent = useTrackEvent()

  useEffect(() => {
    return () => {
      if (canvas) {
        canvas.destroy()
      }
    }
  }, [canvas])

  const createCanvas = async (options: CanvasOptions) => {
    try {
      setIsLoading(true)
      setError(null)

      const newCanvas = new OpenCanvas({
        ...options,
        userId: session?.user?.id,
        apiKey: process.env.NEXT_PUBLIC_OPENCANVAS_API_KEY,
        matrixClient,
      })

      await newCanvas.initialize()

      newCanvas.on('stateChange', (newState) => {
        setState(newState)
        trackEvent('canvas_state_change', {
          canvasId: newCanvas.id,
          userId: session?.user?.id,
        })
      })

      newCanvas.on('error', (err) => {
        setError(err)
        trackEvent('canvas_error', {
          canvasId: newCanvas.id,
          error: err.message,
        })
      })

      setCanvas(newCanvas)
      setState(newCanvas.getState())
      trackEvent('canvas_created', {
        canvasId: newCanvas.id,
        userId: session?.user?.id,
      })
    } catch (err) {
      setError(err as Error)
      trackEvent('canvas_creation_error', {
        error: (err as Error).message,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const joinCanvas = async (canvasId: string) => {
    try {
      setIsLoading(true)
      setError(null)

      const newCanvas = new OpenCanvas({
        id: canvasId,
        userId: session?.user?.id,
        apiKey: process.env.NEXT_PUBLIC_OPENCANVAS_API_KEY,
        matrixClient,
      })

      await newCanvas.join()

      newCanvas.on('stateChange', (newState) => {
        setState(newState)
        trackEvent('canvas_state_change', {
          canvasId,
          userId: session?.user?.id,
        })
      })

      newCanvas.on('error', (err) => {
        setError(err)
        trackEvent('canvas_error', {
          canvasId,
          error: err.message,
        })
      })

      setCanvas(newCanvas)
      setState(newCanvas.getState())
      trackEvent('canvas_joined', {
        canvasId,
        userId: session?.user?.id,
      })
    } catch (err) {
      setError(err as Error)
      trackEvent('canvas_join_error', {
        canvasId,
        error: (err as Error).message,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const leaveCanvas = async () => {
    if (!canvas) return

    try {
      await canvas.leave()
      trackEvent('canvas_left', {
        canvasId: canvas.id,
        userId: session?.user?.id,
      })
    } catch (err) {
      setError(err as Error)
      trackEvent('canvas_leave_error', {
        canvasId: canvas.id,
        error: (err as Error).message,
      })
    } finally {
      setCanvas(null)
      setState(null)
    }
  }

  const updateCanvas = async (updates: Partial<CanvasState>) => {
    if (!canvas) throw new Error('No active canvas')

    try {
      await canvas.update(updates)
      trackEvent('canvas_updated', {
        canvasId: canvas.id,
        userId: session?.user?.id,
      })
    } catch (err) {
      setError(err as Error)
      trackEvent('canvas_update_error', {
        canvasId: canvas.id,
        error: (err as Error).message,
      })
      throw err
    }
  }

  const exportCanvas = async () => {
    if (!canvas) throw new Error('No active canvas')

    try {
      const blob = await canvas.export()
      trackEvent('canvas_exported', {
        canvasId: canvas.id,
        userId: session?.user?.id,
      })
      return blob
    } catch (err) {
      setError(err as Error)
      trackEvent('canvas_export_error', {
        canvasId: canvas.id,
        error: (err as Error).message,
      })
      throw err
    }
  }

  return (
    <OpenCanvasContext.Provider
      value={{
        canvas,
        state,
        isLoading,
        error,
        createCanvas,
        joinCanvas,
        leaveCanvas,
        updateCanvas,
        exportCanvas,
      }}
    >
      {children}
    </OpenCanvasContext.Provider>
  )
}

export function useOpenCanvas() {
  const context = useContext(OpenCanvasContext)
  if (context === undefined) {
    throw new Error('useOpenCanvas must be used within an OpenCanvasProvider')
  }
  return context
}

export function useCanvasState() {
  const { state } = useOpenCanvas()
  return state
}

export function useCanvasActions() {
  const { createCanvas, joinCanvas, leaveCanvas, updateCanvas, exportCanvas } =
    useOpenCanvas()
  return { createCanvas, joinCanvas, leaveCanvas, updateCanvas, exportCanvas }
} 
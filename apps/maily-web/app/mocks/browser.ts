import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

export const worker = setupWorker(...handlers)

// Conditionally start the worker
if (process.env.NEXT_PUBLIC_API_MOCKING === 'enabled') {
  worker.start({
    onUnhandledRequest: 'warn',
  }).catch(console.error)
} 
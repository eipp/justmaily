import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { headers } from 'next/headers'
import { performanceMonitor } from '@/lib/monitoring/performance'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(input: string | number): string {
  const date = new Date(input)
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export function absoluteUrl(path: string) {
  return `${process.env.NEXT_PUBLIC_APP_URL}${path}`
}

// Cache management
export function getCache<T>(key: string): T | null {
  if (typeof window === 'undefined') return null
  const cached = localStorage.getItem(key)
  if (!cached) return null
  
  try {
    const { value, expiry } = JSON.parse(cached)
    if (expiry && Date.now() > expiry) {
      localStorage.removeItem(key)
      return null
    }
    return value as T
  } catch {
    return null
  }
}

export function setCache<T>(key: string, value: T, ttl?: number): void {
  if (typeof window === 'undefined') return
  const data = {
    value,
    expiry: ttl ? Date.now() + ttl : null,
  }
  localStorage.setItem(key, JSON.stringify(data))
}

// Performance monitoring
export function withPerformanceTracking<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  name: string
): T {
  return (async (...args: Parameters<T>) => {
    const start = performance.now()
    try {
      const result = await fn(...args)
      const duration = performance.now() - start
      performanceMonitor.trackCustomMetric(name, duration)
      return result
    } catch (error) {
      const duration = performance.now() - start
      performanceMonitor.trackCustomMetric(`${name}-error`, duration)
      throw error
    }
  }) as T
}

// Edge utilities
export function getCountryFromIP(): string {
  const headersList = headers()
  return headersList.get('x-vercel-ip-country') || 'unknown'
}

export function getDeviceType(): string {
  const headersList = headers()
  const ua = headersList.get('user-agent') || ''
  if (/mobile/i.test(ua)) return 'mobile'
  if (/tablet/i.test(ua)) return 'tablet'
  return 'desktop'
}

// Type safety
export function assertNonNull<T>(value: T | null | undefined, message?: string): T {
  if (value === null || value === undefined) {
    throw new Error(message || 'Value is null or undefined')
  }
  return value
}

export function isEdgeRuntime(): boolean {
  return process.env.NEXT_RUNTIME === 'edge'
}

// Error handling
export function handleError(error: unknown): Error {
  if (error instanceof Error) return error
  return new Error(String(error))
}

export function isValidEmail(email: string) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function truncate(str: string, length: number) {
  return str.length > length ? `${str.substring(0, length)}...` : str
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }

    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  let lastResult: ReturnType<T>

  return function(...args: Parameters<T>): void {
    if (!inThrottle) {
      inThrottle = true
      lastResult = func(...args)
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

export function formatBytes(bytes: number, decimals = 2) {
  if (!+bytes) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

export function generateId(length = 9): string {
  return Math.random().toString(36).substring(2, length + 2)
}

export function retry<T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 1000
): Promise<T> {
  return fn().catch((error) => {
    if (retries === 0) throw error
    return sleep(delay).then(() => retry(fn, retries - 1, delay * 2))
  })
}

export function groupBy<T>(
  array: T[],
  key: keyof T
): { [key: string]: T[] } {
  return array.reduce((result, currentValue) => {
    const groupKey = String(currentValue[key])
    ;(result[groupKey] = result[groupKey] || []).push(currentValue)
    return result
  }, {} as { [key: string]: T[] })
}

// Add more utility functions as needed
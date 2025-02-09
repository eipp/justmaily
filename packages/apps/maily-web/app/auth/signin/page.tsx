'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabase } from '@/lib/providers/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Github } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function SignIn() {
  const router = useRouter()
  const { signIn } = useSupabase()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      await signIn(email, password)
      router.push('/dashboard')
    } catch (error) {
      setError('Invalid email or password')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuthSignIn = async (provider: 'github' | 'google') => {
    setIsLoading(true)
    setError(null)

    try {
      await signIn(provider)
      router.push('/dashboard')
    } catch (error) {
      setError(`Failed to sign in with ${provider}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-lg dark:bg-gray-800">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Sign in to JustMaily
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Or{' '}
            <a
              href="/auth/signup"
              className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
            >
              create a new account
            </a>
          </p>
        </div>

        <div className="space-y-6">
          <form onSubmit={handleEmailSignIn} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Email address
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1"
                placeholder="you@example.com"
                disabled={isLoading}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1"
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/50">
                <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:focus:ring-blue-400"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-gray-900 dark:text-gray-100"
                >
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a
                  href="/auth/reset-password"
                  className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Forgot your password?
                </a>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                Or continue with
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOAuthSignIn('github')}
              disabled={isLoading}
              className={cn(
                'w-full',
                isLoading ? 'cursor-not-allowed opacity-50' : ''
              )}
            >
              <Github className="mr-2 h-4 w-4" />
              GitHub
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOAuthSignIn('google')}
              disabled={isLoading}
              className={cn(
                'w-full',
                isLoading ? 'cursor-not-allowed opacity-50' : ''
              )}
            >
              Google
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 
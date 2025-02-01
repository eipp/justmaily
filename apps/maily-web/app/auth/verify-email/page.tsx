'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabase } from '@/lib/providers/supabase'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Mail } from 'lucide-react'

export default function VerifyEmail() {
  const router = useRouter()
  const { user, signOut } = useSupabase()
  const [isResending, setIsResending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleResendEmail = async () => {
    setIsResending(true)
    setError(null)
    setSuccess(false)

    try {
      // Implement resend verification email logic
      setSuccess(true)
    } catch (error) {
      setError('Failed to resend verification email')
    } finally {
      setIsResending(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/auth/signin')
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-lg dark:bg-gray-800">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
            <Mail className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Verify your email
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            We sent a verification link to{' '}
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {user?.email}
            </span>
            . Click the link to verify your email address.
          </p>
        </div>

        <div className="space-y-6">
          {error && (
            <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/50">
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          {success && (
            <div className="rounded-md bg-green-50 p-4 dark:bg-green-900/50">
              <p className="text-sm text-green-800 dark:text-green-200">
                A new verification email has been sent. Please check your inbox.
              </p>
            </div>
          )}

          <div className="flex flex-col space-y-4">
            <Button
              onClick={handleResendEmail}
              disabled={isResending}
              className="w-full"
            >
              {isResending ? 'Resending...' : 'Resend verification email'}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                  or
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={handleSignOut}
              className="w-full"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Sign out and try another email
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 
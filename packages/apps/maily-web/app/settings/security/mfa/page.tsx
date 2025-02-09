'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabase } from '@/lib/providers/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Shield, AlertTriangle } from 'lucide-react'
import QRCode from 'qrcode.react'

export default function MFASetup() {
  const router = useRouter()
  const { user, setupMFA, verifyMFA, disableMFA, getMFAFactors } = useSupabase()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [secret, setSecret] = useState<string | null>(null)
  const [verificationCode, setVerificationCode] = useState('')
  const [hasMFA, setHasMFA] = useState(false)

  useEffect(() => {
    checkMFAStatus()
  }, [])

  const checkMFAStatus = async () => {
    try {
      const factors = await getMFAFactors()
      setHasMFA(factors.some(factor => factor.status === 'verified'))
    } catch (error) {
      console.error('Failed to check MFA status:', error)
    }
  }

  const handleSetupMFA = async () => {
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const { secret, qrCode } = await setupMFA()
      setSecret(secret)
      setQrCode(qrCode)
    } catch (error) {
      setError('Failed to setup MFA')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyMFA = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      await verifyMFA(verificationCode)
      setSuccess(true)
      setHasMFA(true)
      setQrCode(null)
      setSecret(null)
    } catch (error) {
      setError('Invalid verification code')
    } finally {
      setIsLoading(false)
      setVerificationCode('')
    }
  }

  const handleDisableMFA = async () => {
    setIsLoading(true)
    setError(null)

    try {
      await disableMFA()
      setHasMFA(false)
      setSuccess(true)
    } catch (error) {
      setError('Failed to disable MFA')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto max-w-2xl py-8">
      <div className="space-y-8">
        <div className="flex items-center space-x-4">
          <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900">
            <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Two-Factor Authentication</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Add an extra layer of security to your account
            </p>
          </div>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/50">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <p className="ml-3 text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="rounded-md bg-green-50 p-4 dark:bg-green-900/50">
            <p className="text-sm text-green-800 dark:text-green-200">
              {hasMFA
                ? 'Two-factor authentication has been enabled'
                : 'Two-factor authentication has been disabled'}
            </p>
          </div>
        )}

        {!hasMFA ? (
          <div className="space-y-6">
            {!qrCode ? (
              <Button
                onClick={handleSetupMFA}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Setting up...' : 'Set up two-factor authentication'}
              </Button>
            ) : (
              <div className="space-y-6">
                <div className="rounded-lg border p-6 dark:border-gray-800">
                  <div className="flex justify-center">
                    <QRCode value={qrCode} size={200} />
                  </div>
                  <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
                    Scan this QR code with your authenticator app
                  </p>
                  <div className="mt-4">
                    <p className="text-center text-sm font-medium text-gray-900 dark:text-gray-100">
                      Or enter this code manually:
                    </p>
                    <p className="mt-2 text-center font-mono text-sm">{secret}</p>
                  </div>
                </div>

                <form onSubmit={handleVerifyMFA} className="space-y-4">
                  <div>
                    <label
                      htmlFor="verificationCode"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Enter verification code
                    </label>
                    <Input
                      id="verificationCode"
                      type="text"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      required
                      className="mt-1"
                      placeholder="000000"
                      pattern="[0-9]*"
                      maxLength={6}
                      disabled={isLoading}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading || verificationCode.length !== 6}
                  >
                    {isLoading ? 'Verifying...' : 'Verify and enable'}
                  </Button>
                </form>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-900/50">
              <p className="text-sm text-green-800 dark:text-green-200">
                Two-factor authentication is currently enabled
              </p>
            </div>

            <Button
              variant="destructive"
              onClick={handleDisableMFA}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Disabling...' : 'Disable two-factor authentication'}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
} 
import * as wf from '@temporalio/workflow'
import type { ActivityResult } from '../types'
import { config } from '../config'

interface EmailBatchInput {
  campaignId: string
  content: {
    subject: string
    body: string
    template: string
  }
  recipients: Array<{
    id: string
    email: string
    metadata: Record<string, any>
  }>
  settings: {
    trackOpens: boolean
    trackClicks: boolean
    retryAttempts: number
  }
}

const { sendEmail } = wf.proxyActivities({
  startToCloseTimeout: config.temporal.activityTimeout,
  retry: {
    maximumAttempts: config.temporal.retryAttempts,
    initialInterval: config.temporal.retryInterval,
  },
})

// Custom rate limiter for workflow
class RateLimiter {
  private tokens: number
  private lastRefillTime: number

  constructor(private maxTokens: number) {
    this.tokens = maxTokens
    this.lastRefillTime = Date.now()
  }

  async acquire(): Promise<void> {
    while (this.tokens <= 0) {
      const now = Date.now()
      const timeSinceLastRefill = now - this.lastRefillTime
      const tokensToAdd = Math.floor(timeSinceLastRefill / 1000) // Refill every second

      if (tokensToAdd > 0) {
        this.tokens = Math.min(this.maxTokens, this.tokens + tokensToAdd)
        this.lastRefillTime = now
      }

      if (this.tokens <= 0) {
        await wf.sleep(100) // Wait 100ms before checking again
      }
    }

    this.tokens--
  }

  release(): void {
    this.tokens = Math.min(this.maxTokens, this.tokens + 1)
  }
}

export async function sendEmailBatchWorkflow(
  input: EmailBatchInput
): Promise<ActivityResult> {
  const startTime = new Date().toISOString()
  const results: Array<{
    recipientId: string
    success: boolean
    error?: { code: string; message: string }
  }> = []

  try {
    // Process each recipient in parallel with rate limiting
    const rateLimiter = new RateLimiter(config.rateLimiting.maxActivitiesPerSecond)
    const promises = input.recipients.map(async (recipient) => {
      await rateLimiter.acquire()
      try {
        const result = await sendEmail({
          campaignId: input.campaignId,
          recipientId: recipient.id,
          email: recipient.email,
          subject: input.content.subject,
          body: input.content.body,
          template: input.content.template,
          metadata: recipient.metadata,
          settings: input.settings,
        })

        results.push({
          recipientId: recipient.id,
          success: true,
        })

        return result
      } catch (error) {
        results.push({
          recipientId: recipient.id,
          success: false,
          error: {
            code: 'SEND_FAILED',
            message: error instanceof Error ? error.message : 'Unknown error',
          },
        })
        throw error
      } finally {
        rateLimiter.release()
      }
    })

    // Wait for all sends to complete
    await Promise.allSettled(promises)

    // Calculate success rate
    const successCount = results.filter((r) => r.success).length
    const successRate = (successCount / results.length) * 100

    return {
      success: successRate >= 90, // Consider batch successful if 90% or more emails sent
      data: {
        totalProcessed: results.length,
        successCount,
        failureCount: results.length - successCount,
        successRate,
        results,
      },
      metadata: {
        duration: Date.now() - new Date(startTime).getTime(),
        startTime,
        endTime: new Date().toISOString(),
        attempts: 1,
      },
    }
  } catch (error) {
    return {
      success: false,
      data: {
        totalProcessed: results.length,
        successCount: results.filter((r) => r.success).length,
        failureCount: results.filter((r) => !r.success).length,
        successRate: (results.filter((r) => r.success).length / results.length) * 100,
        results,
      },
      error: {
        code: 'BATCH_FAILED',
        message: error instanceof Error ? error.message : 'Unknown error',
        details: error,
      },
      metadata: {
        duration: Date.now() - new Date(startTime).getTime(),
        startTime,
        endTime: new Date().toISOString(),
        attempts: 1,
      },
    }
  }
} 
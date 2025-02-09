import { Context } from '@temporalio/activity'
import type {
  ActivityResult,
  AudienceFilter,
  EmailTemplate,
  CampaignGoal,
  AnalyticsData,
} from '../types'
import { AIClientFactory } from '@justmaily/ai-core'
import { activityMetrics, logger } from '../monitoring'
import { postalService } from '../services/postal'
import { db } from '../db'
import { MetricsService } from '../monitoring/metrics'
import { EmailService } from '../services/email'
import { AnalyticsService } from '../services/analytics'
import { AIService } from '../services/ai'
import { OptimizationService } from '../services/optimization'

// Initialize AI client
const aiClient = AIClientFactory.createClient(
  'openai',
  process.env.OPENAI_API_KEY!,
  process.env.OPENAI_API_ENDPOINT
)

interface ActivityMetrics {
  delivery: {
    sent: number
    failed: number
    bounces: number
  }
  engagement: {
    opens: number
    clicks: number
    complaints: number
    unsubscribes: number
  }
}

export class EmailActivities {
  constructor(
    private emailService: EmailService,
    private analyticsService: AnalyticsService,
    private aiService: AIService,
    private optimizationService: OptimizationService,
    private metrics: MetricsService
  ) {}

  async analyzeAudience(
    audienceData: any,
    parameters: any
  ): Promise<{
    segments: any[]
    preferences: any
    recommendations: any[]
  }> {
    const startTime = Date.now()

    try {
      const result = await this.aiService.analyzeAudience(audienceData, parameters)
      
      const duration = Date.now() - startTime
      await this.metrics.recordLatency('analyze_audience', duration)
      await this.metrics.recordEvent('audience_analyzed')
      
      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      await this.metrics.recordError('analyze_audience', errorMessage)
      throw error
    }
  }

  async generateContent(
    parameters: any,
    preferences: any
  ): Promise<{
    content: string
    metadata: any
  }> {
    const startTime = Date.now()

    try {
      const result = await this.aiService.generateContent(parameters, preferences)
      
      const duration = Date.now() - startTime
      await this.metrics.recordLatency('generate_content', duration)
      await this.metrics.recordEvent('content_generated')
      
      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      await this.metrics.recordError('generate_content', errorMessage)
      throw error
    }
  }

  async personalizeContent(
    content: string,
    recipient: any
  ): Promise<string> {
    const startTime = Date.now()

    try {
      const result = await this.aiService.personalizeContent(content, recipient)
      
      const duration = Date.now() - startTime
      await this.metrics.recordLatency('personalize_content', duration)
      await this.metrics.recordEvent('content_personalized')
      
      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      await this.metrics.recordError('personalize_content', errorMessage)
      throw error
    }
  }

  async optimizeContent(
    content: string,
    preferences: any
  ): Promise<{
    content: string
    improvements: string[]
    confidence: number
  }> {
    const startTime = Date.now()

    try {
      const result = await this.optimizationService.optimizeContent(content, preferences)
      
      const duration = Date.now() - startTime
      await this.metrics.recordLatency('optimize_content', duration)
      await this.metrics.recordEvent('content_optimized')
      
      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      await this.metrics.recordError('optimize_content', errorMessage)
      throw error
    }
  }

  async sendEmail(
    recipient: string,
    content: string,
    options: any
  ): Promise<{
    messageId: string
    status: string
  }> {
    const startTime = Date.now()

    try {
      const result = await this.emailService.send(recipient, content, options)
      
      const duration = Date.now() - startTime
      await this.metrics.recordLatency('send_email', duration)
      await this.metrics.recordEvent('email_sent')
      
      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      await this.metrics.recordError('send_email', errorMessage)
      throw error
    }
  }

  async trackEngagement(
    messageId: string,
    recipient: string
  ): Promise<{
    opens: number
    clicks: number
    complaints: number
    unsubscribes: number
  }> {
    const startTime = Date.now()

    try {
      const result = await this.analyticsService.trackEngagement(messageId, recipient)
      
      const duration = Date.now() - startTime
      await this.metrics.recordLatency('track_engagement', duration)
      await this.metrics.recordEvent('engagement_tracked')
      
      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      await this.metrics.recordError('track_engagement', errorMessage)
      throw error
    }
  }

  async analyzeResults(
    campaignId: string
  ): Promise<{
    deliveryRate: number
    openRate: number
    clickRate: number
    bounceRate: number
    complaintRate: number
    unsubscribeRate: number
  }> {
    const startTime = Date.now()

    try {
      const metrics: ActivityMetrics = {
        delivery: {
          sent: 0,
          failed: 0,
          bounces: 0
        },
        engagement: {
          opens: 0,
          clicks: 0,
          complaints: 0,
          unsubscribes: 0
        }
      }

      // Get campaign metrics from analytics service
      const campaignMetrics = await this.analyticsService.getCampaignMetrics(campaignId)
      
      // Update metrics
      metrics.delivery = campaignMetrics.delivery
      metrics.engagement = campaignMetrics.engagement

      // Calculate rates
      const result = {
        deliveryRate:
          (metrics.delivery.sent /
            (metrics.delivery.sent + metrics.delivery.failed)) *
          100,
        openRate: (metrics.engagement.opens / metrics.delivery.sent) * 100,
        clickRate: (metrics.engagement.clicks / metrics.delivery.sent) * 100,
        bounceRate: (metrics.delivery.bounces / metrics.delivery.sent) * 100,
        complaintRate:
          (metrics.engagement.complaints / metrics.delivery.sent) * 100,
        unsubscribeRate:
          (metrics.engagement.unsubscribes / metrics.delivery.sent) * 100,
      }

      const duration = Date.now() - startTime
      await this.metrics.recordLatency('analyze_results', duration)
      await this.metrics.recordEvent('results_analyzed')
      
      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      await this.metrics.recordError('analyze_results', errorMessage)
      throw error
    }
  }
}

// Helper function to track activity execution
async function trackActivity<T>(
  type: string,
  fn: () => Promise<T>
): Promise<ActivityResult> {
  const startTime = new Date().toISOString()
  await activityMetrics.started.add(1, { type })

  try {
    const data = await fn()
    await activityMetrics.completed.add(1, { type })

    return {
      success: true,
      data,
      metadata: {
        duration: Date.now() - new Date(startTime).getTime(),
        startTime,
        endTime: new Date().toISOString(),
        attempts: Context.current().info.attempt,
      },
    }
  } catch (error) {
    await activityMetrics.failed.add(1, { type })
    logger.error(`Activity ${type} failed:`, error)

    if (Context.current().info.attempt > 1) {
      await activityMetrics.retries.add(1, { type })
    }

    return {
      success: false,
      data: null,
      error: {
        code: 'ACTIVITY_FAILED',
        message: error instanceof Error ? error.message : 'Unknown error',
        details: error,
      },
      metadata: {
        duration: Date.now() - new Date(startTime).getTime(),
        startTime,
        endTime: new Date().toISOString(),
        attempts: Context.current().info.attempt,
      },
    }
  }
}

// Activity implementations
export async function analyzeAudience(input: {
  campaignId: string
  audience: AudienceFilter
}): Promise<ActivityResult> {
  return trackActivity('analyze_audience', async () => {
    // Use AI to analyze audience and generate insights
    const result = await aiClient.complete({
      messages: [
        {
          role: 'system',
          content: 'You are an expert in audience analysis and segmentation.',
        },
        {
          role: 'user',
          content: `Analyze this audience segment and provide insights: ${JSON.stringify(
            input.audience
          )}`,
        },
      ],
      modelConfig: {
        provider: 'openai',
        model: 'gpt-4',
        temperature: 0.7,
      },
    })

    // Fetch recipients based on audience filter
    const recipients = await db.recipients.findMany({
      where: {
        AND: [
          input.audience.demographics?.age
            ? {
                age: {
                  in: input.audience.demographics.age,
                },
              }
            : {},
          input.audience.demographics?.gender
            ? {
                gender: {
                  in: input.audience.demographics.gender,
                },
              }
            : {},
          input.audience.demographics?.location
            ? {
                location: {
                  in: input.audience.demographics.location,
                },
              }
            : {},
          input.audience.behavior?.lastActive
            ? {
                lastActiveAt: {
                  gte: new Date(input.audience.behavior.lastActive),
                },
              }
            : {},
          input.audience.behavior?.purchaseHistory
            ? {
                purchases: {
                  some: {
                    type: {
                      in: input.audience.behavior.purchaseHistory,
                    },
                  },
                },
              }
            : {},
          input.audience.behavior?.interests
            ? {
                interests: {
                  hasAny: input.audience.behavior.interests,
                },
              }
            : {},
          {
            status: 'active',
            unsubscribedAt: null,
            bounceCount: {
              lt: 3,
            },
          },
        ],
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        metadata: true,
      },
    })

    // Generate segments based on AI analysis
    const segments = await aiClient.complete({
      messages: [
        {
          role: 'system',
          content: 'You are an expert in audience segmentation.',
        },
        {
          role: 'user',
          content: `Based on these recipients, suggest optimal segments: ${JSON.stringify(recipients)}`,
        },
      ],
      modelConfig: {
        provider: 'openai',
        model: 'gpt-4',
        temperature: 0.7,
      },
    })

    // Generate recommendations based on segments
    const recommendations = await aiClient.complete({
      messages: [
        {
          role: 'system',
          content: 'You are an expert in email marketing strategy.',
        },
        {
          role: 'user',
          content: `Based on these segments, provide recommendations: ${segments.choices[0].message.content}`,
        },
      ],
      modelConfig: {
        provider: 'openai',
        model: 'gpt-4',
        temperature: 0.7,
      },
    })

    return {
      insights: result.choices[0].message.content,
      segments: JSON.parse(segments.choices[0].message.content),
      recommendations: JSON.parse(recommendations.choices[0].message.content),
      recipients,
    }
  })
}

export async function generateContent(input: {
  campaignId: string
  template: EmailTemplate
  audience: any
  goal: CampaignGoal
}): Promise<ActivityResult> {
  return trackActivity('generate_content', async () => {
    // Use AI to generate content based on template and audience
    const result = await aiClient.complete({
      messages: [
        {
          role: 'system',
          content: 'You are an expert email marketing copywriter.',
        },
        {
          role: 'user',
          content: `Generate email content based on this template: ${JSON.stringify(
            input.template
          )}, for this audience: ${JSON.stringify(
            input.audience
          )}, with goal: ${input.goal}`,
        },
      ],
      modelConfig: {
        provider: 'openai',
        model: 'gpt-4',
        temperature: 0.7,
      },
    })

    // Extract subject line
    const subjectResult = await aiClient.complete({
      messages: [
        {
          role: 'system',
          content: 'You are an expert in email subject line optimization.',
        },
        {
          role: 'user',
          content: `Generate an optimized subject line for this email content: ${result.choices[0].message.content}`,
        },
      ],
      modelConfig: {
        provider: 'openai',
        model: 'gpt-4',
        temperature: 0.7,
      },
    })

    // Extract variables from content
    const variables = new Set<string>()
    const content = result.choices[0].message.content
    const matches = content.matchAll(/\{\{([^}]+)\}\}/g)
    for (const match of matches) {
      variables.add(match[1].trim())
    }

    return {
      subject: subjectResult.choices[0].message.content,
      body: content,
      template: input.template.id,
      variables: Array.from(variables),
    }
  })
}

export async function personalizeContent(input: {
  campaignId: string
  content: any
  audience: any
}): Promise<ActivityResult> {
  return trackActivity('personalize_content', async () => {
    // Generate personalization variants for each segment
    const variants = await Promise.all(
      input.audience.segments.map(async (segment: any) => {
        const result = await aiClient.complete({
          messages: [
            {
              role: 'system',
              content: 'You are an expert in content personalization.',
            },
            {
              role: 'user',
              content: `Personalize this content: ${JSON.stringify(
                input.content
              )}, for this segment: ${JSON.stringify(segment)}`,
            },
          ],
          modelConfig: {
            provider: 'openai',
            model: 'gpt-4',
            temperature: 0.7,
          },
        })

        return {
          segmentId: segment.id,
          content: result.choices[0].message.content,
        }
      })
    )

    // Generate targeting rules for each variant
    const rules = variants.reduce((acc, variant) => {
      acc[variant.segmentId] = {
        conditions: input.audience.segments.find(
          (s: any) => s.id === variant.segmentId
        ).conditions,
        content: variant.content,
      }
      return acc
    }, {})

    return {
      variants,
      rules,
      defaultContent: input.content.body,
    }
  })
}

export async function optimizeContent(input: {
  campaignId: string
  content: any
  goal: CampaignGoal
}): Promise<ActivityResult> {
  return trackActivity('optimize_content', async () => {
    // Use AI to optimize content for the goal
    const result = await aiClient.complete({
      messages: [
        {
          role: 'system',
          content: 'You are an expert in email marketing optimization.',
        },
        {
          role: 'user',
          content: `Optimize this content: ${JSON.stringify(
            input.content
          )}, for goal: ${input.goal}`,
        },
      ],
      modelConfig: {
        provider: 'openai',
        model: 'gpt-4',
        temperature: 0.7,
      },
    })

    // Generate list of improvements made
    const improvements = await aiClient.complete({
      messages: [
        {
          role: 'system',
          content: 'You are an expert in email content analysis.',
        },
        {
          role: 'user',
          content: `List the improvements made between the original and optimized versions:
Original: ${JSON.stringify(input.content)}
Optimized: ${result.choices[0].message.content}`,
        },
      ],
      modelConfig: {
        provider: 'openai',
        model: 'gpt-4',
        temperature: 0.7,
      },
    })

    // Calculate optimization score
    const scoreResult = await aiClient.complete({
      messages: [
        {
          role: 'system',
          content: 'You are an expert in email content scoring.',
        },
        {
          role: 'user',
          content: `Score these improvements on a scale of 0-100:
${improvements.choices[0].message.content}`,
        },
      ],
      modelConfig: {
        provider: 'openai',
        model: 'gpt-4',
        temperature: 0,
      },
    })

    return {
      optimizedContent: result.choices[0].message.content,
      improvements: JSON.parse(improvements.choices[0].message.content),
      score: parseInt(scoreResult.choices[0].message.content, 10),
    }
  })
}

export async function sendEmail(input: {
  campaignId: string
  recipientId: string
  email: string
  subject: string
  body: string
  template: string
  metadata: Record<string, any>
  settings: {
    trackOpens: boolean
    trackClicks: boolean
    retryAttempts: number
  }
}): Promise<ActivityResult> {
  return trackActivity('send_email', async () => {
    const response = await postalService.sendEmail({
      to: [input.email],
      subject: input.subject,
      htmlBody: input.body,
      trackOpens: input.settings.trackOpens,
      trackClicks: input.settings.trackClicks,
      tag: input.campaignId,
      metadata: {
        ...input.metadata,
        campaignId: input.campaignId,
        recipientId: input.recipientId,
        template: input.template,
      },
    })

    return {
      messageId: response.messageId,
      status: response.status,
      timestamp: response.timestamp,
    }
  })
}

export async function trackEngagement(input: {
  campaignId: string
  settings: {
    trackOpens: boolean
    trackClicks: boolean
  }
}): Promise<ActivityResult> {
  return trackActivity('track_engagement', async () => {
    // Fetch engagement metrics from database
    const [opens, clicks, bounces, complaints, unsubscribes] = await Promise.all([
      db.engagement.count({
        where: {
          campaignId: input.campaignId,
          type: 'open',
        },
      }),
      db.engagement.count({
        where: {
          campaignId: input.campaignId,
          type: 'click',
        },
      }),
      db.messages.count({
        where: {
          campaignId: input.campaignId,
          status: 'bounced',
        },
      }),
      db.messages.count({
        where: {
          campaignId: input.campaignId,
          status: 'complained',
        },
      }),
      db.unsubscribes.count({
        where: {
          campaignId: input.campaignId,
        },
      }),
    ])

    return {
      opens,
      clicks,
      bounces,
      complaints,
      unsubscribes,
    }
  })
}

export async function analyzeResults(input: {
  campaignId: string
  activities: ActivityResult[]
  engagementResults: ActivityResult[]
}): Promise<ActivityResult> {
  return trackActivity('analyze_results', async () => {
    // Calculate metrics
    const metrics = {
      delivery: {
        sent: input.activities.filter((a) => a.success).length,
        failed: input.activities.filter((a) => !a.success).length,
        bounces: input.engagementResults.reduce(
          (sum, r) => sum + (r.data?.bounces || 0),
          0
        ),
      },
      engagement: {
        opens: input.engagementResults.reduce(
          (sum, r) => sum + (r.data?.opens || 0),
          0
        ),
        clicks: input.engagementResults.reduce(
          (sum, r) => sum + (r.data?.clicks || 0),
          0
        ),
        complaints: input.engagementResults.reduce(
          (sum, r) => sum + (r.data?.complaints || 0),
          0
        ),
        unsubscribes: input.engagementResults.reduce(
          (sum, r) => sum + (r.data?.unsubscribes || 0),
          0
        ),
      },
      rates: {
        deliveryRate:
          (metrics.delivery.sent /
            (metrics.delivery.sent + metrics.delivery.failed)) *
          100,
        openRate: (metrics.engagement.opens / metrics.delivery.sent) * 100,
        clickRate: (metrics.engagement.clicks / metrics.delivery.sent) * 100,
        bounceRate: (metrics.delivery.bounces / metrics.delivery.sent) * 100,
        complaintRate:
          (metrics.engagement.complaints / metrics.delivery.sent) * 100,
        unsubscribeRate:
          (metrics.engagement.unsubscribes / metrics.delivery.sent) * 100,
      },
    }

    // Use AI to analyze results
    const result = await aiClient.complete({
      messages: [
        {
          role: 'system',
          content: 'You are an expert in email marketing analytics.',
        },
        {
          role: 'user',
          content: `Analyze these campaign results: ${JSON.stringify({
            activities: input.activities,
            engagement: input.engagementResults,
            metrics,
          })}`,
        },
      ],
      modelConfig: {
        provider: 'openai',
        model: 'gpt-4',
        temperature: 0.7,
      },
    })

    // Generate insights
    const insights = await aiClient.complete({
      messages: [
        {
          role: 'system',
          content: 'You are an expert in identifying email marketing insights.',
        },
        {
          role: 'user',
          content: `Based on this analysis, provide key insights: ${result.choices[0].message.content}`,
        },
      ],
      modelConfig: {
        provider: 'openai',
        model: 'gpt-4',
        temperature: 0.7,
      },
    })

    // Generate recommendations
    const recommendations = await aiClient.complete({
      messages: [
        {
          role: 'system',
          content:
            'You are an expert in providing actionable email marketing recommendations.',
        },
        {
          role: 'user',
          content: `Based on these insights, provide recommendations: ${insights.choices[0].message.content}`,
        },
      ],
      modelConfig: {
        provider: 'openai',
        model: 'gpt-4',
        temperature: 0.7,
      },
    })

    return {
      analysis: result.choices[0].message.content,
      metrics,
      insights: JSON.parse(insights.choices[0].message.content),
      recommendations: JSON.parse(recommendations.choices[0].message.content),
    }
  })
} 
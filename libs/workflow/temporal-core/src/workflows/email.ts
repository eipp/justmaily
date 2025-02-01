import { proxyActivities } from '@temporalio/workflow'
import { EmailActivities } from '../activities/email'
import { AnalyticsActivities } from '../activities/analytics'
import { OptimizationActivities } from '../activities/optimization'
import { Message, CampaignConfig, TestConfig, AnalyticsData } from '../types'

const {
  sendEmail,
  validateEmail,
  checkSpamScore,
  optimizeContent
} = proxyActivities<EmailActivities>({
  startToCloseTimeout: '1 minute'
})

const {
  recordMetrics,
  aggregateAnalytics,
  exportToGrafana
} = proxyActivities<AnalyticsActivities>({
  startToCloseTimeout: '5 minutes'
})

const {
  runABTest,
  optimizeSchedule,
  predictDeliveryTime
} = proxyActivities<OptimizationActivities>({
  startToCloseTimeout: '10 minutes'
})

export async function sendEmailWorkflow(
  message: Message,
  config: CampaignConfig
): Promise<void> {
  // Validate and optimize content
  await validateEmail(message)
  const spamScore = await checkSpamScore(message.content)
  
  if (spamScore > config.spamThreshold) {
    throw new Error('Content failed spam check')
  }

  if (config.optimizeContent) {
    message.content = await optimizeContent(message.content)
  }

  // Send email with automatic retries and failover
  try {
    await sendEmail(message)
  } catch (error) {
    await recordMetrics('email_send_failure', 1)
    throw error
  }

  await recordMetrics('email_sent', 1)
}

export async function abTestWorkflow(
  variants: Message[],
  testConfig: TestConfig
): Promise<Message> {
  // Run A/B test with specified variants
  const results = await runABTest(variants, testConfig)
  
  // Record test results
  await recordMetrics('ab_test_complete', 1)
  await aggregateAnalytics(results)
  
  return results.winner
}

export async function campaignOptimizationWorkflow(
  campaign: CampaignConfig,
  analytics: AnalyticsData
): Promise<CampaignConfig> {
  // Optimize campaign parameters based on historical data
  const optimizedSchedule = await optimizeSchedule(campaign, analytics)
  const deliveryPrediction = await predictDeliveryTime(campaign)
  
  // Export optimization results to monitoring
  await exportToGrafana({
    campaign: campaign.id,
    optimizations: {
      schedule: optimizedSchedule,
      prediction: deliveryPrediction
    }
  })

  return {
    ...campaign,
    schedule: optimizedSchedule,
    predictedDelivery: deliveryPrediction
  }
}

export async function analyticsAggregationWorkflow(
  timeframe: { start: Date; end: Date }
): Promise<AnalyticsData> {
  // Aggregate analytics across all providers
  const analytics = await aggregateAnalytics(timeframe)
  
  // Export to monitoring systems
  await exportToGrafana(analytics)
  
  return analytics
} 
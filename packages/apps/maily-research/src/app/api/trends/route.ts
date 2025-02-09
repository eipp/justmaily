import { createAPIHandler, json } from '@/lib/api'
import { searchRequestSchema } from '@/lib/validation'
import { ExaClient } from '@exa/client'
import { config } from '@/api/config'

// Initialize Exa client
const exa = new ExaClient({
  apiKey: process.env.EXA_API_KEY!,
})

// PATCH /api/trends - Analyze industry trends
export const PATCH = createAPIHandler(
  async (req, { data }) => {
    const {
      query,
      filters,
      timeframe = {
        start: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        end: new Date().toISOString(),
      },
      interval = '1d',
    } = data

    // Build search query
    const searchQuery = {
      query,
      date_start: timeframe.start,
      date_end: timeframe.end,
      interval,
      ...buildFilters(filters),
    }

    // Execute trend analysis
    const result = await exa.analyzeTrends(searchQuery)

    // Calculate trend metrics
    const metrics = calculateTrendMetrics(result.timeseries)

    // Format response
    return json({
      data: {
        timeseries: result.timeseries.map((point) => ({
          date: point.date,
          value: point.value,
          sentiment: point.sentiment,
          articles: point.articles.map((article) => ({
            id: article.id,
            title: article.title,
            url: article.url,
            source: article.source,
            date: article.date,
            sentiment: article.sentiment,
          })),
        })),
        topics: result.topics.map((topic) => ({
          name: topic.name,
          weight: topic.weight,
          sentiment: topic.sentiment,
          trend: topic.trend,
          related: topic.related,
        })),
        entities: result.entities.map((entity) => ({
          name: entity.name,
          type: entity.type,
          mentions: entity.mentions,
          sentiment: entity.sentiment,
          trend: entity.trend,
        })),
        metrics: {
          total: metrics.total,
          average: metrics.average,
          median: metrics.median,
          min: metrics.min,
          max: metrics.max,
          stdDev: metrics.stdDev,
          trend: metrics.trend,
          momentum: metrics.momentum,
          volatility: metrics.volatility,
        },
      },
      metadata: {
        timeframe: {
          start: timeframe.start,
          end: timeframe.end,
          interval,
        },
        took: result.took,
        total: result.total,
      },
    })
  },
  {
    schema: searchRequestSchema,
    requireAuth: true,
    cors: {
      origin: config.security.corsOrigins,
      methods: ['PATCH'],
      credentials: true,
    },
  }
)

// Helper to build filters
function buildFilters(filters?: Record<string, any>) {
  if (!filters) return {}

  const searchFilters: Record<string, any> = {}

  // Source filter
  if (filters.source?.length) {
    searchFilters.sources = filters.source
  }

  // Language filter
  if (filters.language?.length) {
    searchFilters.languages = filters.language
  }

  // Topic filter
  if (filters.topic?.length) {
    searchFilters.topics = filters.topic
  }

  // Sentiment filter
  if (filters.sentiment?.length) {
    searchFilters.sentiments = filters.sentiment
  }

  return searchFilters
}

// Helper to calculate trend metrics
function calculateTrendMetrics(timeseries: any[]) {
  if (!timeseries.length) {
    return {
      total: 0,
      average: 0,
      median: 0,
      min: 0,
      max: 0,
      stdDev: 0,
      trend: 0,
      momentum: 0,
      volatility: 0,
    }
  }

  const values = timeseries.map((point) => point.value)
  const total = values.reduce((sum, val) => sum + val, 0)
  const average = total / values.length
  const sortedValues = [...values].sort((a, b) => a - b)
  const median =
    values.length % 2 === 0
      ? (sortedValues[values.length / 2 - 1] + sortedValues[values.length / 2]) / 2
      : sortedValues[Math.floor(values.length / 2)]
  const min = Math.min(...values)
  const max = Math.max(...values)

  // Calculate standard deviation
  const squaredDiffs = values.map((val) => Math.pow(val - average, 2))
  const avgSquaredDiff = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length
  const stdDev = Math.sqrt(avgSquaredDiff)

  // Calculate trend (linear regression slope)
  const xValues = Array.from({ length: values.length }, (_, i) => i)
  const xAvg = (values.length - 1) / 2
  const numerator = xValues.reduce((sum, x, i) => sum + (x - xAvg) * (values[i] - average), 0)
  const denominator = xValues.reduce((sum, x) => sum + Math.pow(x - xAvg, 2), 0)
  const trend = numerator / denominator

  // Calculate momentum (recent trend vs overall trend)
  const recentValues = values.slice(-Math.min(7, values.length))
  const recentAvg = recentValues.reduce((sum, val) => sum + val, 0) / recentValues.length
  const momentum = ((recentAvg - average) / average) * 100

  // Calculate volatility (coefficient of variation)
  const volatility = (stdDev / average) * 100

  return {
    total,
    average,
    median,
    min,
    max,
    stdDev,
    trend,
    momentum,
    volatility,
  }
} 
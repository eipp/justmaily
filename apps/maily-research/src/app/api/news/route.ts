import { createAPIHandler, json } from '@/lib/api'
import { searchRequestSchema } from '@/lib/validation'
import { ExaClient } from '@exa/client'
import { config } from '@/api/config'

// Initialize Exa client
const exa = new ExaClient({
  apiKey: process.env.EXA_API_KEY!,
})

// GET /api/news - Search for news articles
export const GET = createAPIHandler(
  async (req, { data }) => {
    const {
      query,
      filters,
      sort = { field: 'date', order: 'desc' },
      page = 1,
      limit = 10,
    } = data

    // Build search query
    const searchQuery = {
      query,
      num_results: limit,
      start: (page - 1) * limit,
      sort_by: sort.field,
      sort_order: sort.order,
      ...buildFilters(filters),
    }

    // Execute search
    const result = await exa.searchNews(searchQuery)

    // Format response
    return json({
      data: result.articles.map((article) => ({
        id: article.id,
        title: article.title,
        description: article.description,
        url: article.url,
        source: {
          name: article.source.name,
          domain: article.source.domain,
          favicon: article.source.favicon,
        },
        author: article.author,
        date: article.date,
        image: article.image,
        language: article.language,
        sentiment: article.sentiment,
        entities: article.entities,
        topics: article.topics,
        keywords: article.keywords,
        readingTime: article.readingTime,
        score: article.score,
      })),
      total: result.total,
      page,
      pageSize: limit,
      facets: {
        sources: result.facets?.sources,
        languages: result.facets?.languages,
        topics: result.facets?.topics,
        sentiments: result.facets?.sentiments,
      },
      metadata: {
        took: result.took,
        maxScore: result.maxScore,
      },
    })
  },
  {
    schema: searchRequestSchema,
    requireAuth: true,
    cors: {
      origin: config.security.corsOrigins,
      methods: ['GET'],
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

  // Date range filter
  if (filters.date) {
    searchFilters.date_start = filters.date.min
    searchFilters.date_end = filters.date.max
  }

  // Score range filter
  if (filters.score) {
    searchFilters.min_score = filters.score.min
    searchFilters.max_score = filters.score.max
  }

  return searchFilters
} 
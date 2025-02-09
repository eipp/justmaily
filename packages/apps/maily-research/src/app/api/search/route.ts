import { createAPIHandler, json } from '@/lib/api'
import { searchRequestSchema } from '@/lib/validation'
import { search } from '@/lib/db'
import { config } from '@/api/config'

// POST /api/search - Search for companies and contacts
export const POST = createAPIHandler(
  async (req, { data }) => {
    const {
      query,
      filters,
      sort = { field: '_score', order: 'desc' },
      page = 1,
      limit = 10,
    } = data

    // Build search query
    const searchQuery = {
      query: {
        multi_match: {
          query,
          fields: [
            'name^3',
            'domain^2',
            'description',
            'industry',
            'location',
            'technologies',
            'email^3',
            'firstName^2',
            'lastName^2',
            'title',
            'company',
            'skills',
          ],
          type: 'best_fields',
          operator: 'and',
          fuzziness: 'AUTO',
        },
      },
      filter: buildFilters(filters),
      sort: buildSort(sort),
      from: (page - 1) * limit,
      size: limit,
      track_total_hits: true,
      aggs: {
        industries: {
          terms: { field: 'industry.keyword', size: 10 },
        },
        locations: {
          terms: { field: 'location.keyword', size: 10 },
        },
        sizes: {
          terms: { field: 'size.keyword', size: 10 },
        },
        technologies: {
          terms: { field: 'technologies.keyword', size: 10 },
        },
      },
    }

    // Execute search
    const result = await search.search('companies,contacts', searchQuery)

    // Format response
    return json({
      data: result.hits.hits.map((hit) => ({
        ...hit._source,
        score: hit._score,
        type: hit._index,
      })),
      total: result.hits.total.value,
      page,
      pageSize: limit,
      facets: {
        industries: result.aggregations?.industries.buckets,
        locations: result.aggregations?.locations.buckets,
        sizes: result.aggregations?.sizes.buckets,
        technologies: result.aggregations?.technologies.buckets,
      },
      metadata: {
        took: result.took,
        maxScore: result.hits.max_score,
      },
    })
  },
  {
    schema: searchRequestSchema,
    requireAuth: true,
    cors: {
      origin: config.security.corsOrigins,
      methods: ['POST'],
      credentials: true,
    },
  }
)

// Helper to build filters
function buildFilters(filters?: Record<string, any>) {
  if (!filters) return []

  const filterClauses = []

  // Industry filter
  if (filters.industry?.length) {
    filterClauses.push({
      terms: { 'industry.keyword': filters.industry },
    })
  }

  // Location filter
  if (filters.location?.length) {
    filterClauses.push({
      terms: { 'location.keyword': filters.location },
    })
  }

  // Size filter
  if (filters.size?.length) {
    filterClauses.push({
      terms: { 'size.keyword': filters.size },
    })
  }

  // Technology filter
  if (filters.technology?.length) {
    filterClauses.push({
      terms: { 'technologies.keyword': filters.technology },
    })
  }

  // Founded range filter
  if (filters.founded) {
    filterClauses.push({
      range: {
        founded: {
          gte: filters.founded.min,
          lte: filters.founded.max,
        },
      },
    })
  }

  // Employee count range filter
  if (filters.employees) {
    filterClauses.push({
      range: {
        'employees.count': {
          gte: filters.employees.min,
          lte: filters.employees.max,
        },
      },
    })
  }

  // Revenue range filter
  if (filters.revenue) {
    filterClauses.push({
      range: {
        'revenue.amount': {
          gte: filters.revenue.min,
          lte: filters.revenue.max,
        },
      },
    })
  }

  // Funding range filter
  if (filters.funding) {
    filterClauses.push({
      range: {
        'funding.total': {
          gte: filters.funding.min,
          lte: filters.funding.max,
        },
      },
    })
  }

  // Last active filter
  if (filters.lastActive) {
    filterClauses.push({
      range: {
        'metadata.lastActive': {
          gte: filters.lastActive.min,
          lte: filters.lastActive.max,
        },
      },
    })
  }

  // Confidence score filter
  if (filters.confidence) {
    filterClauses.push({
      range: {
        'metadata.confidence': {
          gte: filters.confidence.min,
          lte: filters.confidence.max,
        },
      },
    })
  }

  return filterClauses
}

// Helper to build sort
function buildSort(sort: { field: string; order: 'asc' | 'desc' }) {
  if (sort.field === '_score') {
    return [{ _score: sort.order }]
  }

  return [
    { [`${sort.field}.keyword`]: sort.order },
    { _score: 'desc' },
  ]
} 
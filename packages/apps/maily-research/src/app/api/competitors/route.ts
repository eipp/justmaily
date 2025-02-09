import { createAPIHandler, json } from '@/lib/api'
import { searchRequestSchema } from '@/lib/validation'
import { search } from '@/lib/db'
import { config } from '@/api/config'

// PUT /api/competitors - Find similar companies
export const PUT = createAPIHandler(
  async (req, { data }) => {
    const {
      companyId,
      filters,
      sort = { field: '_score', order: 'desc' },
      page = 1,
      limit = 10,
    } = data

    // Get company details
    const company = await search.getById('companies', companyId)
    if (!company) {
      throw new Error('Company not found')
    }

    // Build search query
    const searchQuery = {
      query: {
        bool: {
          must: [
            {
              more_like_this: {
                fields: [
                  'description',
                  'industry',
                  'technologies',
                  'products',
                  'services',
                ],
                like: [
                  {
                    _index: 'companies',
                    _id: companyId,
                  },
                ],
                min_term_freq: 1,
                max_query_terms: 25,
                min_doc_freq: 1,
                minimum_should_match: '30%',
              },
            },
          ],
          must_not: [
            {
              ids: {
                values: [companyId],
              },
            },
          ],
          filter: buildFilters(filters),
        },
      },
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
        funding_ranges: {
          range: {
            field: 'funding.total',
            ranges: [
              { to: 1000000 },
              { from: 1000000, to: 10000000 },
              { from: 10000000, to: 50000000 },
              { from: 50000000, to: 100000000 },
              { from: 100000000 },
            ],
          },
        },
        employee_ranges: {
          range: {
            field: 'employees.count',
            ranges: [
              { to: 10 },
              { from: 10, to: 50 },
              { from: 50, to: 200 },
              { from: 200, to: 1000 },
              { from: 1000 },
            ],
          },
        },
      },
    }

    // Execute search
    const result = await search.search('companies', searchQuery)

    // Format response
    return json({
      data: result.hits.hits.map((hit) => ({
        ...hit._source,
        score: hit._score,
        similarity: calculateSimilarity(company, hit._source),
      })),
      total: result.hits.total.value,
      page,
      pageSize: limit,
      facets: {
        industries: result.aggregations?.industries.buckets,
        locations: result.aggregations?.locations.buckets,
        sizes: result.aggregations?.sizes.buckets,
        technologies: result.aggregations?.technologies.buckets,
        fundingRanges: result.aggregations?.funding_ranges.buckets,
        employeeRanges: result.aggregations?.employee_ranges.buckets,
      },
      metadata: {
        took: result.took,
        maxScore: result.hits.max_score,
        baseCompany: {
          id: company._id,
          name: company._source.name,
          domain: company._source.domain,
        },
      },
    })
  },
  {
    schema: searchRequestSchema,
    requireAuth: true,
    cors: {
      origin: config.security.corsOrigins,
      methods: ['PUT'],
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

// Helper to calculate similarity score
function calculateSimilarity(company1: any, company2: any) {
  let score = 0
  let total = 0

  // Industry match
  if (company1.industry === company2.industry) {
    score += 25
  }
  total += 25

  // Size match
  if (company1.size === company2.size) {
    score += 15
  }
  total += 15

  // Location match
  if (company1.location === company2.location) {
    score += 10
  }
  total += 10

  // Technologies overlap
  const tech1 = new Set(company1.technologies || [])
  const tech2 = new Set(company2.technologies || [])
  const techOverlap = new Set([...tech1].filter(x => tech2.has(x)))
  if (tech1.size > 0 && tech2.size > 0) {
    score += 25 * (techOverlap.size / Math.max(tech1.size, tech2.size))
  }
  total += 25

  // Funding range match
  const fundingDiff = Math.abs(
    (company1.funding?.total || 0) - (company2.funding?.total || 0)
  )
  if (fundingDiff === 0) {
    score += 15
  } else if (fundingDiff < 1000000) {
    score += 10
  } else if (fundingDiff < 10000000) {
    score += 5
  }
  total += 15

  // Employee count range match
  const employeeDiff = Math.abs(
    (company1.employees?.count || 0) - (company2.employees?.count || 0)
  )
  if (employeeDiff === 0) {
    score += 10
  } else if (employeeDiff < 10) {
    score += 7
  } else if (employeeDiff < 50) {
    score += 3
  }
  total += 10

  return Math.round((score / total) * 100)
} 
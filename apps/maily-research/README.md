# Maily Research Service

The research service is responsible for enriching company and contact data through web scraping, data enrichment, and search capabilities. It provides a robust API for discovering and analyzing business information.

## Features

- Company data enrichment
- Contact data enrichment
- Company and contact search
- News search and analysis
- Competitor analysis
- Industry trend analysis
- Rate limiting and caching
- Error handling and monitoring
- Authentication and authorization

## API Routes

### Enrichment

- `POST /api/enrich` - Batch enrich multiple URLs
- `GET /api/enrich/:url` - Get enrichment data for a specific URL

### Search

- `POST /api/search` - Search for companies and contacts
- `GET /api/news` - Search for news articles
- `PUT /api/competitors` - Find similar companies
- `PATCH /api/trends` - Analyze industry trends

## Architecture

The service is built using:

- Next.js for the API framework
- Supabase for authentication and data storage
- Upstash Redis for caching and rate limiting
- Vespa for search functionality
- Firecrawl for web scraping
- Exa for data enrichment
- OpenTelemetry and Prometheus for monitoring
- Sentry for error tracking

## Directory Structure

```
apps/maily-research/
├── src/
│   ├── app/
│   │   └── api/
│   │       ├── enrich/
│   │       ├── search/
│   │       ├── news/
│   │       ├── competitors/
│   │       └── trends/
│   ├── lib/
│   │   ├── api/
│   │   ├── cache/
│   │   ├── db/
│   │   ├── errors/
│   │   ├── monitoring/
│   │   ├── services/
│   │   └── validation/
│   ├── types/
│   │   ├── models.ts
│   │   └── supabase.ts
│   └── middleware.ts
├── public/
├── tests/
├── .env.example
├── .env.local
├── next.config.js
├── package.json
├── README.md
└── tsconfig.json
```

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Copy `.env.example` to `.env.local` and fill in the required values:
   ```bash
   cp .env.example .env.local
   ```
4. Start the development server:
   ```bash
   pnpm dev
   ```

## Environment Variables

- `NEXT_PUBLIC_APP_URL` - Application URL
- `NEXT_PUBLIC_API_URL` - API URL
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `UPSTASH_REDIS_REST_URL` - Upstash Redis REST URL
- `UPSTASH_REDIS_REST_TOKEN` - Upstash Redis REST token
- `VESPA_ENDPOINT` - Vespa search endpoint
- `VESPA_API_KEY` - Vespa API key
- `FIRECRAWL_API_KEY` - Firecrawl API key
- `EXA_API_KEY` - Exa API key
- `SENTRY_DSN` - Sentry DSN

## API Documentation

### Enrichment

#### POST /api/enrich

Batch enrich multiple URLs with company and contact data.

Request:
```json
{
  "urls": [
    "https://example.com",
    "https://example.org"
  ]
}
```

Response:
```json
{
  "results": [
    {
      "url": "https://example.com",
      "company": {
        "name": "Example Inc",
        "domain": "example.com",
        "description": "...",
        "industry": "Technology",
        "size": "51-200",
        "location": "San Francisco, CA",
        "technologies": ["React", "Node.js"],
        "social": {
          "linkedin": "https://linkedin.com/company/example"
        }
      },
      "contacts": [
        {
          "firstName": "John",
          "lastName": "Doe",
          "email": "john@example.com",
          "title": "CEO"
        }
      ],
      "metadata": {
        "lastEnriched": "2024-01-23T00:00:00Z",
        "confidence": 85,
        "source": "firecrawl+exa"
      }
    }
  ],
  "failed": []
}
```

### Search

#### POST /api/search

Search for companies and contacts.

Request:
```json
{
  "query": "software companies in san francisco",
  "filters": {
    "industry": ["Technology"],
    "size": ["51-200"],
    "technology": ["React"]
  },
  "sort": {
    "field": "_score",
    "order": "desc"
  },
  "page": 1,
  "limit": 10
}
```

Response:
```json
{
  "data": [
    {
      "id": "...",
      "type": "company",
      "name": "Example Inc",
      "domain": "example.com",
      "score": 0.95
    }
  ],
  "total": 100,
  "page": 1,
  "pageSize": 10,
  "facets": {
    "industries": [
      {
        "key": "Technology",
        "doc_count": 50
      }
    ]
  },
  "metadata": {
    "took": 45,
    "maxScore": 0.95
  }
}
```

## Error Handling

The service uses a standardized error response format:

```json
{
  "error": {
    "message": "Error message",
    "code": "ERROR_CODE",
    "details": {
      "field": "Additional error details"
    }
  }
}
```

Common error codes:
- `VALIDATION_ERROR` - Invalid request data
- `AUTHENTICATION_ERROR` - Missing or invalid authentication
- `AUTHORIZATION_ERROR` - Insufficient permissions
- `NOT_FOUND_ERROR` - Resource not found
- `RATE_LIMIT_ERROR` - Rate limit exceeded
- `TIMEOUT_ERROR` - Request timeout
- `INTERNAL_SERVER_ERROR` - Unexpected error

## Rate Limiting

The service implements rate limiting based on IP address:
- 100 requests per minute for authenticated users
- 20 requests per minute for unauthenticated users

Rate limit headers:
- `X-RateLimit-Limit` - Maximum requests per window
- `X-RateLimit-Remaining` - Remaining requests in current window
- `X-RateLimit-Reset` - Time when the rate limit resets

## Monitoring

The service exposes metrics at `/metrics` in Prometheus format:
- Request counts and durations
- Error counts by type
- Cache hit/miss ratios
- Rate limit hits
- External service metrics

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a pull request

## License

MIT License 
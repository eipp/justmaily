# API Documentation

## Overview

Maily provides a comprehensive RESTful API for managing email marketing campaigns, content generation, and analytics.

## Authentication

All API requests must be authenticated using an API key. Include the API key in the `Authorization` header:

```http
Authorization: Bearer mk_test_123...
```

## Base URL

```
https://api.maily.ai/v1
```

## Rate Limiting

- 100 requests per minute per API key
- 429 Too Many Requests response when exceeded
- Exponential backoff recommended

## Common Headers

```
Authorization: Bearer <token>
Content-Type: application/json
Accept: application/json
```

## API Endpoints

### Campaign Management

#### Create Campaign
```http
POST /campaigns
Content-Type: application/json

{
  "name": "Summer Sale 2024",
  "description": "Promotional campaign for summer products",
  "audience": {
    "segments": ["active_users", "summer_buyers"],
    "filters": {
      "age": {"min": 18, "max": 65},
      "location": ["US", "CA"]
    }
  },
  "schedule": {
    "startDate": "2024-06-01T00:00:00Z",
    "endDate": "2024-08-31T23:59:59Z",
    "timezone": "America/New_York"
  }
}
```

#### List Campaigns
```http
GET /campaigns
Query Parameters:
- page (default: 1)
- limit (default: 20)
- status (active|draft|completed)
- sort (created_at|updated_at|name)
```

#### Get Campaign
```http
GET /campaigns/{campaignId}
```

#### Update Campaign
```http
PUT /campaigns/{campaignId}
Content-Type: application/json

{
  "name": "Updated Campaign Name",
  "description": "Updated campaign description"
}
```

#### Delete Campaign
```http
DELETE /campaigns/{campaignId}
```

### Content Management

#### Generate Content
```http
POST /content/generate
Content-Type: application/json

{
  "type": "email",
  "parameters": {
    "tone": "professional",
    "length": "medium",
    "subject": true,
    "personalization": {
      "firstName": true,
      "companyName": true
    }
  },
  "context": {
    "industry": "technology",
    "purpose": "product_launch",
    "keywords": ["innovation", "AI", "future"]
  }
}
```

#### List Templates
```http
GET /templates
Query Parameters:
- category (newsletter|promotion|announcement)
- page (default: 1)
- limit (default: 20)
```

#### Create Template
```http
POST /templates
Content-Type: application/json

{
  "name": "Product Launch Template",
  "category": "announcement",
  "content": {
    "subject": "Introducing {{product_name}}",
    "body": "..."
  },
  "variables": ["product_name", "launch_date", "features"]
}
```

### Analytics

#### Campaign Performance
```http
GET /analytics/campaigns/{campaignId}
Query Parameters:
- startDate
- endDate
- metrics (opens|clicks|conversions|all)
```

#### Audience Insights
```http
GET /analytics/audience
Query Parameters:
- segment
- timeframe (7d|30d|90d)
- metrics (engagement|demographics|behavior)
```

### User Management

#### Create User
```http
POST /users
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "admin"
}
```

#### Get User
```http
GET /users/{userId}
```

#### Update User
```http
PUT /users/{userId}
Content-Type: application/json

{
  "firstName": "Updated",
  "lastName": "Name"
}
```

## Error Handling

### Error Response Format
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {
      "field": "Additional error context"
    }
  }
}
```

### Common Error Codes

- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `422`: Validation Error
- `429`: Rate Limit Exceeded
- `500`: Internal Server Error

## Webhooks

### Available Events

- `campaign.created`
- `campaign.updated`
- `campaign.deleted`
- `email.sent`
- `email.opened`
- `email.clicked`
- `email.bounced`
- `email.complained`

### Webhook Format
```json
{
  "event": "email.opened",
  "timestamp": "2024-03-15T12:00:00Z",
  "data": {
    "campaignId": "camp_123",
    "emailId": "email_456",
    "recipient": "user@example.com",
    "metadata": {
      "userAgent": "...",
      "ipAddress": "..."
    }
  }
}
```

## SDKs & Libraries

- [Node.js SDK](https://github.com/maily/node-sdk)
- [Python SDK](https://github.com/maily/python-sdk)
- [Ruby SDK](https://github.com/maily/ruby-sdk)
- [Java SDK](https://github.com/maily/java-sdk)
- [Go SDK](https://github.com/maily/go-sdk)

## Best Practices

1. Always use HTTPS
2. Implement proper error handling
3. Cache responses when appropriate
4. Use pagination for large datasets
5. Implement retry logic with exponential backoff
6. Keep authentication tokens secure
7. Monitor API usage and errors
8. Version your API endpoints
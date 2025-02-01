# Maily-Deliver Service

The email delivery and tracking service for JustMaily platform.

## Features

- High-performance email delivery
- Multiple provider support (SendGrid, Amazon SES)
- Webhook handling for delivery events
- Comprehensive monitoring and logging
- Delivery status tracking
- Bounce handling
- Rate limiting
- Email validation
- Analytics integration

## Tech Stack

- Node.js/TypeScript
- SendGrid/Amazon SES as fallback
- Redis for rate limiting
- Prometheus for metrics
- Supabase for data storage

## Development

1. Install dependencies: `pnpm install`
2. Configure environment variables
3. Start development server: `pnpm dev`

## API Endpoints

- `POST /api/deliver/send` - Send email
- `POST /api/deliver/validate` - Validate email
- `GET /api/deliver/status/:id` - Get delivery status
- `POST /api/deliver/webhook` - Handle provider webhooks 
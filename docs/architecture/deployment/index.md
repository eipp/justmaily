<!--
NOTE: This document has been updated to reflect the new vision and strategic objectives of the Maily platform.
Please refer to docs/PROJECT_STRATEGY.md for full details.
-->

# Deployment Guide

Welcome to the Deployment Guide for Maily, our adaptive, self-healing, AI-driven email marketing platform. This guide provides comprehensive instructions for deploying your system in a manner that supports dynamic tool generation, continuous resilience, zero-downtime operations, and agile scalability.

## Automated Deployment Script

Maily includes an automated deployment script located at `infrastructure/scripts/deploy.sh`. This script:
- Backs up the database via `pg_dump`
- Runs database migrations (using `npm run migrate`)
- Builds a Docker image and deploys it via Docker Compose

Refer to the [Deployment Instructions](../README.md#deployment-instructions) in the main documentation for details.

## Deployment Environments

- **Production:** See [Production Deployment](./production.md)
- **Kubernetes:** See [Kubernetes Setup](./kubernetes.md)
- **Monitoring:** See [Monitoring Guide](./monitoring.md)
- **Scaling:** See [Scaling Guide](./scaling.md)

## Prerequisites

- Node.js 20.x or later
- pnpm 8.x or later
- Vercel CLI
- Vercel account and team setup

## Environment Setup

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Link your project:
```bash
vercel link
```

## Configuration

1. Set up environment variables in Vercel dashboard:
   - Go to Project Settings > Environment Variables
   - Add all required variables from `.env.example`
   - Mark variables as Production/Preview/Development as needed

2. Configure project settings:
   - Framework Preset: Next.js
   - Build Command: `pnpm build`
   - Output Directory: `dist`
   - Install Command: `pnpm install`

3. Configure domains and aliases:
   - Add your custom domain
   - Configure SSL/TLS settings
   - Set up redirects if needed

## Deployment Process

### Manual Deployment

1. Deploy to preview:
```bash
vercel
```

2. Deploy to production:
```bash
vercel --prod
```

### Automatic Deployment

1. Push to main branch triggers:
   - Build process
   - Preview deployment
   - Production deployment (if configured)

2. Pull request creates:
   - Preview deployment
   - Deploy comment in PR
   - Status checks

## Monitoring

1. Vercel Dashboard:
   - Deployment status
   - Build logs
   - Function invocations
   - Edge network metrics

2. Integration with monitoring tools:
   - Datadog for metrics
   - Sentry for error tracking

## Rollback Process

1. Instant rollback via Vercel dashboard:
   - Select previous deployment
   - Click "Promote to Production"

2. Manual rollback via CLI:
```bash
vercel rollback
```

## Best Practices

1. Environment Management:
   - Use different environments (Production/Preview/Development)
   - Secure sensitive environment variables
   - Regular rotation of API keys

2. Performance:
   - Enable Edge Caching
   - Optimize static assets
   - Use Edge Functions where appropriate

3. Security:
   - Configure security headers
   - Enable DDoS protection
   - Regular security scans

4. Monitoring:
   - Set up alerts for critical metrics
   - Monitor edge function performance
   - Track deployment success rates 
# JustMaily - Autonomous Email Marketing Platform

JustMaily is a cutting-edge SaaS/PaaS email marketing platform that leverages AI and automation to deliver exceptional email marketing capabilities.

## Architecture Overview

Our platform consists of several key microservices:

- **Maily (Main Orchestrator)**: Coordinates all services and handles user interactions
- **Maily-Research**: Handles data enrichment and web scraping
- **Maily-Synthesize**: Manages content generation and personalization
- **Maily-Optimize**: Handles A/B testing and campaign optimization
- **Maily-Deliver**: Manages email delivery and tracking
- **Maily-Analyze**: Provides analytics and reporting

### Tech Stack

- **Frontend**: Next.js + Tailwind CSS + OpenCanvas
- **Backend**: Vercel Serverless Functions
- **Database**: Supabase (PostgreSQL)
- **Caching**: Redis
- **Workflow**: Temporal + Apache Airflow
- **Email**: SendGrid, Amazon SES
- **AI Models**: DeepSeek v3, OpenAI GPT-4, Claude 3.5 Sonnet, Gemini 2.0
- **Search**: Haystack + Vespa
- **Monitoring**: Prometheus + Grafana + Sentry

## Project Structure

- `apps/maily-web/`: Frontend application built with Next.js.
  - `app/`: Contains Next.js pages and layouts.
  - `components/`: Reusable UI components.
  - `styles/`: CSS/SCSS files.

- `api/`: Backend endpoints and serverless functions.
  - `api/auth/`: Authentication endpoints using Next‑Auth.
  - `api/campaigns/`: REST endpoints for campaign operations.
  - `api/contacts/`: REST endpoints for contacts management.

- `config/env/`: Environment configuration files for different environments.

## Key Dependencies

- `next`, `react`, `react-dom` – Base framework.
- `next‑auth` – For user authentication and session management.
- `react‑chartjs‑2` and `chart.js` – For analytics dashboard components.

## Getting Started

1. Clone the repository
2. Install dependencies: `pnpm install`
3. Copy `.env.example` to `.env` and configure
4. Start development: `pnpm dev`

## Development

Each service can be developed independently:

```bash
# Start frontend
pnpm dev:web

# Start specific service
pnpm dev:research
pnpm dev:synthesize
pnpm dev:optimize
pnpm dev:deliver
pnpm dev:analyze
```

## Deployment

We use Vercel for deployment. Each service is automatically deployed when changes are pushed to main.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

This project is licensed under the terms of the [LICENSE](LICENSE) file. 
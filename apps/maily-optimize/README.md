# Maily-Optimize Service

The campaign optimization and A/B testing service for JustMaily platform.

## Features

- A/B testing engine
- Predictive scheduling
- Spam check and content optimization
- ML-based optimization
- Performance tracking

## Tech Stack

- Node.js/TypeScript
- Apache Airflow for scheduling
- Custom A/B testing engine
- ML models for optimization
- Spam detection system
- Redis for caching

## Development

1. Install dependencies: `pnpm install`
2. Configure environment variables
3. Start development server: `pnpm dev`

## API Endpoints

- `POST /api/optimize/test` - Create A/B test
- `POST /api/optimize/schedule` - Schedule campaign
- `POST /api/optimize/check` - Check content quality
- `GET /api/optimize/results` - Get test results
# Maily-Analyze Service

The analytics and reporting service for JustMaily platform.

## Features

- Real-time metrics tracking
- Campaign performance analysis
- Predictive analytics
- Custom report generation
- Data visualization
- Anomaly detection

## Tech Stack

- Node.js/TypeScript
- Prometheus for metrics collection
- Grafana for visualization
- Sentry for error tracking
- ML models for predictions
- Supabase for data storage

## Development

1. Install dependencies: `pnpm install`
2. Configure environment variables
3. Start development server: `pnpm dev`

## API Endpoints

- `GET /api/analyze/metrics` - Get campaign metrics
- `POST /api/analyze/report` - Generate custom report
- `GET /api/analyze/predict` - Get performance predictions
- `GET /api/analyze/anomalies` - Detect anomalies
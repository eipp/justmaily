<!--
NOTE: This document has been updated to reflect the new vision and strategic objectives of the Maily platform.
Please refer to docs/PROJECT_STRATEGY.md for full details.
-->

# Maily – Autonomous AI-First Email Marketing Platform

Maily is an autonomous, AI-first email marketing platform that empowers brands with dynamically adaptive, self-healing campaigns. Our advanced AI agents continuously learn, optimize, and even build missing integrations on the fly, ensuring hyper-personalized and ethically compliant email experiences.

## Core Vision & Strategic Objectives
Our goal is to empower marketers to deliver ethically adaptive, infinitely customizable email experiences with minimal human intervention. Key pillars include:
- **Agent Autonomy:** Autonomous AI agents that debug, optimize, and dynamically generate missing integrations.
- **Model Agnosticism:** Seamless flexibility to swap between state-of-the-art language models.
- **Self-Hosted Control:** Complete control over MLOps, data sovereignty, and regulatory compliance.
- **Self-Healing Workflows:** Automated detection and remediation for uninterrupted campaign performance.
- **Ethical AI & Compliance:** Robust guardrails ensuring brand safety, privacy, and adherence to global standards.
- **Future-Proofing:** Continuous system evolution through dynamic tool generation and adaptive learning.

## System Architecture
Maily's infrastructure leverages advanced AI, long-term memory integration, and dynamically adaptive, self-healing workflows. Built on a scalable, containerized microservices architecture, our platform integrates real-time zero-party data and ensures ethical, privacy-first operations.

## Technology Stack
- **Frontend:** Next.js 15, Tailwind CSS, and Radix UI providing a seamless, accessible experience.
- **Backend:** Azure AI, Kubernetes, and serverless functions ensuring resilient, agile performance.
- **AI Models:** DeepSeek R1 as the core model, with fallback support from Claude 3.5 and Llama 3.1 via Fireworks.ai.
- **Data & Streaming:** Powered by Snowflake, Apache Iceberg/Delta Lake, Redis, and Redpanda for real-time, robust data processing.
- **Monitoring:** Utilizing Datadog, Prometheus, and Grafana to continuously optimize system health.

## Documentation
For detailed documentation including core concepts, AI agent architecture, data infrastructure, UI/UX, API reference, deployment, security, and compliance details, please refer to the [docs/README.md](docs/README.md) file.

## License
This project is proprietary software. All rights reserved.

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
- **AI Models**: DeepSeek R1, OpenAI GPT-o3-mini, Claude 3.5 Sonnet, Gemini 2.0
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

## Workflow Orchestration POC (Sprint 1)
A new workflow orchestration proof-of-concept has been implemented in the `apps/workflow-engine` module. It demonstrates:
- Automated task retries and granular error handling
- Self-healing mechanisms with recovery/alert triggers
- Basic real-time observability via logging and a health-check endpoint

For setup and execution details, please refer to [docs/workflow-orchestration.md](docs/workflow-orchestration.md).

<!-- Security Enhancements Start -->
## Security Enhancements

This release introduces several security enhancements:

- **Centralized Secrets Management:** Integration with HashiCorp Vault, including a Node.js Vault client for secure retrieval and caching of secrets, with support for Shamir Secret Sharing during initialization. 
- **Future-Proof Encryption:** A roadmap for integrating NIST-standard CRYSTALS-Kyber post-quantum cryptography into our TLS and data encryption layers. See [docs/crypto-roadmap.md](docs/crypto-roadmap.md) for details.
- **Zero Trust & Network Hardening:** Initial integration steps for Cloudflare Zero Trust, eBPF-based network monitoring (e.g., Cilium), and Kubernetes network policy enhancements. Refer to [docs/network-security.md](docs/network-security.md) for our strategy.
<!-- Security Enhancements End -->

# Justmaily
+Note: The repository has been refactored. Centralized configurations (ESLint, Prettier, Jest) are now in the config/ folders, shared utilities have been consolidated in packages/core, and individual microservice applications reside in packages/apps. 
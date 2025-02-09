<!--
NOTE: This document has been updated to reflect the new vision and strategic objectives of the Maily platform.
Please refer to docs/PROJECT_STRATEGY.md for full details.
-->

# Maily Documentation

Welcome to the official Maily documentation portal, now completely aligned with our new vision of dynamic, self-healing email marketing powered by autonomous AI agents.

## Overview

Maily is an autonomous, self-healing, AI-first email marketing platform that empowers brands to deliver intelligently adaptive, ethically compliant, and hyper-personalized email campaigns. Leveraging advanced dynamic tool generation and decentralized agent orchestration, Maily continuously evolves to meet the demands of modern digital marketing.

This documentation covers:
- The updated core vision and strategic objectives
- A detailed overview of our containerized, microservices-based system architecture
- Comprehensive API, integration, and deployment guides
- Security, compliance, and best practices for developers and operators

## Getting Started

To begin, explore the following sections:
- **Project Strategy:** Detailed vision, objectives, and architectural principles in [PROJECT_STRATEGY.md](PROJECT_STRATEGY.md).
- **Core Concepts:** Fundamental design and architectural elements that drive our platform, including autonomous agents and self-healing workflows.
- **API Reference:** Guidelines for integrating with Maily's dynamic endpoints that support self-healing and dynamic integration generation.
- **Deployment:** Instructions for continuous, resilient, zero-downtime deployments.
- **Developer Guides:** Best practices and troubleshooting tips to get the most out of our platform.

Happy exploring!

## Documentation Structure

This portal is organized to ensure easy access to all information needed to work with Maily:

1. **Core Vision & Strategic Objectives:** Understand the mission and strategic pillars driving our innovations.
2. **System Architecture:** In-depth details on our AI agents, data management, security, and compliance practices.
3. **Development & Integration:** Start here for setup guides, API documentation, and developer tools.
4. **Support, Testing & Future Roadmap:** Learn about our support tiers, testing strategies, and the long-term vision for Maily.

For the most comprehensive view, please begin with the [PROJECT_STRATEGY.md](PROJECT_STRATEGY.md) document.

## Table of Contents

1. [Getting Started](./guides/getting-started.md)
2. [Core Concepts](./concepts/README.md)
    - [Vision & Strategic Objectives](./Vision_and_Strategic_Objectives.md)
    - [AI Agent Architecture](./concepts/ai-agent-architecture.md)
    - [Data Architecture](./concepts/data-architecture.md)
    - [UI/UX & Accessibility](./concepts/ui-ux-accessibility.md)
3. [API Reference](./api/README.md)
4. [Guides](./guides/README.md)
5. [Development](./development/README.md)
6. [Deployment](./deployment/README.md)
7. [Security](./security/README.md)

## Core Features

### Content Generation
- AI-powered email content creation
- Smart template management
- Dynamic personalization
- Multi-language support
- Brand voice consistency

### Campaign Management
- Visual campaign builder
- Automated workflows
- Smart scheduling
- A/B testing
- Performance tracking

### Audience Management
- AI-driven segmentation
- Behavioral targeting
- Preference management
- List cleaning and validation
- Engagement scoring

### Analytics & Optimization
- Real-time performance metrics
- AI-powered insights
- Conversion tracking
- ROI analysis
- Trend detection

## System Architecture

Maily is built on a modern, scalable architecture designed for AI-driven email marketing:

- **Autonomous Agent Orchestration**: Utilizes CrewAI 2.0 and Autogen Studio to coordinate specialized AI agents.
- **Model Agnostic LLM Infrastructure**: Based on DeepSeek R1, swappable with other models via Fireworks.ai, deployed on Azure AI.
- **Zero-Party Data Hub**: Employs Snowflake Cortex and Decodable for real-time collection and processing of user preferences.
- **Behavioral Data Lake**: Stores interaction data in Apache Iceberg and Delta Lake for AI agent training.
- **Real-Time Data Streaming**: Uses Redpanda and Materialize for sub-second latency data delivery to AI agents.
- **Privacy & Compliance Engine**: Integrates OneTrust and Immuta for automated GDPR/CCPA compliance and PII redaction.
- **Accessible UI/UX**:  Built with Next.js 15, Radix UI, and Tailwind CSS, ensuring WCAG 2.2 AA compliance and optimized for modern devices.

## Getting Started

1. [Installation Guide](./guides/installation.md)
2. [Quick Start Tutorial](./guides/quick-start.md)
3. [Configuration Guide](./guides/configuration.md)
4. [API Documentation](./api/README.md)

## Development

- [Local Development Setup](./development/local-setup.md)
- [Contributing Guidelines](./development/contributing.md)
- [Code Style Guide](./development/code-style.md)
- [Testing Guide](./development/testing.md)

## Deployment

- [Production Deployment](./deployment/production.md)
- [Kubernetes Setup](./deployment/kubernetes.md)
- [Monitoring Guide](./deployment/monitoring.md)
- [Scaling Guide](./deployment/scaling.md)

## Security

- [Security Best Practices](./security/best-practices.md)
- [Authentication Guide](./security/authentication.md)
- [Data Protection](./security/data-protection.md)
- [Compliance Guide](./security/compliance.md)

## Support

- [Troubleshooting Guide](./guides/troubleshooting.md)
- [FAQ](./guides/faq.md)
- [Community Resources](./community/README.md)

## Dependency Management

This repository uses **pnpm** as its sole package manager.

To set up the project:
1. Install pnpm globally if not already installed:
   ```
   npm install -g pnpm
   ```
2. Install dependencies:
   ```
   pnpm install
   ```
3. To run linting, tests, and security audits, use:
   ```
   pnpm run lint
   pnpm run test
   pnpm audit
   ```

Please ensure that you use pnpm for all dependency management tasks.

## License

This project is proprietary software. All rights reserved.
# Maily Infrastructure Scripts

This directory contains scripts for managing the Maily infrastructure and development workflow in alignment with our AI-first, autonomous platform vision. These scripts not only handle continuous integration and deployments, but also support self-healing orchestration, automated canary deployments, and ethical compliance checks through our autonomous agent framework.

## Directory Structure

```
infrastructure/scripts/
├── ci/                     # Continuous Integration scripts for automated build, deployment, and self-healing checks
│   ├── build-and-deploy.sh    # Build and deploy services with autonomous rollouts
│   ├── canary-deploy.sh       # Deploy canary instances with dynamic weighting
│   ├── check-canary-health.sh # Monitor canary health and trigger auto-remediation
│   ├── lint-test.sh           # Run linting, tests, and ethical compliance checks
│   ├── rollback-canary.sh     # Rollback failed canary deployments
│   └── secrets-decrypt.sh     # Securely decrypt environment secrets
├── dev/                    # Development workflow scripts
│   ├── start-all.sh          # Start all services locally with real-time monitoring
│   ├── stop-all.sh           # Stop all services
│   └── loadtest.sh           # Run load tests for performance and compliance
├── maintenance/            # Maintenance scripts
│   └── db-migrate.sh         # Database migration and health checks
├── setup/                  # Setup and generation scripts
│   ├── generate-library.sh   # Generate new library modules with standardized structure
│   └── generate-service.sh   # Scaffold new services aligned with Maily's autonomous architecture
└── standardization/        # Code standardization scripts
    ├── standardize-services.sh # Enforce uniform service structure
    ├── standardize-libs.sh     # Enforce uniform library structure
    ├── standardize-configs.sh  # Standardize configuration files for autonomous deployments
    └── standardize-tests.sh    # Standardize tests to ensure reliability and ethical compliance

## Usage

### Deployment

Deploy all services in an automated, self-healing manner:
```bash
./deploy.sh [environment] [region]
```

Example:
```bash
./deploy.sh production us-west-2
```

### Canary Deployments

Deploy a canary instance with autonomous health monitoring:
```bash
./ci/canary-deploy.sh [service] [environment] [weight]
```

Example:
```bash
./ci/canary-deploy.sh maily-ai production 10
```

Check canary health and trigger remediation:
```bash
./ci/check-canary-health.sh [service] [environment] [threshold]
```

Rollback canary deployment if anomalies are detected:
```bash
./ci/rollback-canary.sh [service] [environment]
```

### Development

Start all services locally for iterative improvements:
```bash
./dev/start-all.sh
```

Stop all services:
```bash
./dev/stop-all.sh
```

Run load tests to validate performance and ethical constraints:
```bash
./dev/loadtest.sh [service] [users] [duration]
```

### Setup

Generate new libraries or services that are pre-configured for autonomous operation:
```bash
./setup/generate-library.sh [name]
```

```bash
./setup/generate-service.sh [name]
```

### Standardization

Enforce standardized structures to maintain code quality and compliance:
```bash
./standardize-services.sh
```

```bash
./standardize-libs.sh
```

## Environment Variables

The following environment variables are required:

- `NODE_ENV`: Environment (development|staging|production)
- `AWS_REGION`: AWS region
- `GITHUB_SHA`: Git commit SHA (for deployments)
- `REGISTRY`: Container registry URL

## Services

Current services managed by these scripts include:

- maily-ai
- api-gateway
- content-generation
- campaign-management
- audience-segmentation
- notification-service
- attachment-service

## Contributing

When adding new scripts:

1. Add robust error handling and environment validation
2. Use consistent naming (with maily- prefix)
3. Implement color-coded output for clarity
4. Update this README with any new changes
5. Include comprehensive documentation within your scripts (including autonomous and ethical compliance features) 
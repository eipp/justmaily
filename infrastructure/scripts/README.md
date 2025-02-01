# Maily Infrastructure Scripts

This directory contains scripts for managing the Maily infrastructure and development workflow.

## Directory Structure

```
infrastructure/scripts/
├── ci/                     # Continuous Integration scripts
│   ├── build-and-deploy.sh # Build and deploy services
│   ├── canary-deploy.sh    # Deploy canary instances
│   ├── check-canary-health.sh # Check canary health
│   ├── lint-test.sh        # Run linting and tests
│   ├── rollback-canary.sh  # Rollback canary deployments
│   └── secrets-decrypt.sh  # Decrypt environment secrets
├── dev/                    # Development workflow scripts
│   ├── start-all.sh       # Start all services locally
│   ├── stop-all.sh        # Stop all services
│   └── loadtest.sh        # Run load tests
├── maintenance/            # Maintenance scripts
│   └── db-migrate.sh      # Database migration
├── setup/                  # Setup and generation scripts
│   ├── generate-library.sh # Generate new library
│   └── generate-service.sh # Generate new service
└── standardization/        # Code standardization scripts
    ├── standardize-services.sh # Standardize service structure
    ├── standardize-libs.sh     # Standardize library structure
    ├── standardize-configs.sh  # Standardize configurations
    └── standardize-tests.sh    # Standardize test structure

## Usage

### Deployment

Deploy all services:
```bash
./deploy.sh [environment] [region]
```

Example:
```bash
./deploy.sh production us-west-2
```

### Canary Deployments

Deploy a canary instance:
```bash
./ci/canary-deploy.sh [service] [environment] [weight]
```

Example:
```bash
./ci/canary-deploy.sh maily-ai production 10
```

Check canary health:
```bash
./ci/check-canary-health.sh [service] [environment] [threshold]
```

Rollback canary:
```bash
./ci/rollback-canary.sh [service] [environment]
```

### Development

Start all services locally:
```bash
./dev/start-all.sh
```

Stop all services:
```bash
./dev/stop-all.sh
```

Run load tests:
```bash
./dev/loadtest.sh [service] [users] [duration]
```

### Setup

Generate a new library:
```bash
./setup/generate-library.sh [name]
```

Generate a new service:
```bash
./setup/generate-service.sh [name]
```

### Standardization

Standardize service structure:
```bash
./standardize-services.sh
```

Standardize library structure:
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

Current services managed by these scripts:

- maily-ai
- api-gateway
- content-generation
- campaign-management
- audience-segmentation
- notification-service
- attachment-service

## Contributing

When adding new scripts:

1. Add proper error handling
2. Add environment validation
3. Use consistent naming (maily- prefix)
4. Add color-coded output
5. Update this README
6. Add proper documentation within the script 
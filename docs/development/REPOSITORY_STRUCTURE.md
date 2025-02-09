NOTE: This document has been updated to reflect the new vision and strategic objectives of the Maily platform.

/*
Repository Structure Documentation
*/

# Repository Structure

This document outlines the current production-ready repository structure as of Sprint 1.

## Directories
- apps/                - Application-specific code and components.
- ci/                  - CI/CD configuration files including production pipeline.
- config/              - Environment and configuration files.
- contracts/           - Smart contracts or integration contract definitions.
- data/                - Data storage and processing scripts.
- docs/                - Documentation, including design, implementation, and setup reports.
- dr/                  - Disaster recovery related configurations.
- infrastructure/      - Infrastructure as Code (IaC) configurations.
- k8s/                 - Kubernetes deployment manifests and configurations.
- libs/                - Shared libraries and utility functions.
- observability/       - Monitoring, logging, and health check configurations.
- pages/               - Webpage or UI components.
- production-api/      - API endpoints and production-grade business logic.
- remediation/         - Automated remediation and self-healing scripts.
- scripts/             - Deployment, build, and automation scripts.
- security/            - Security-related code, configurations, and audits.
- src/                 - Core application source code.
- tests/               - Automated tests for all components.
- workflow/            - Workflow and orchestration configurations.

## Files
Notable files include:
- README.md              - Project overview and instructions.
- app.py                 - Primary application entry point.
- orchestrator.py        - Orchestration and process management.
- self_healing.py        - Automated remediation and self-healing logic.

NOTE: Generated files such as node_modules/ are managed via package.json and package-lock.json, and are excluded from version control. 
NOTE: This document has been updated to reflect the new vision and strategic objectives of the Maily platform.

# Proposed Monorepo Structure for Maily Repository

This document proposes a new modular structure for the Maily repository. The main goals are to:

- Separate shared library code (core functionalities) from app-specific code.
- Clearly define the boundaries of each microservice application.
- Isolate infrastructure, deployment scripts, and legacy/experimental code.

## Root Directory Structure

```
/ (Repository Root)
├── packages/
│   ├── core/                  # Shared libraries extracted from the root-level src
│   │   ├── components/        # Reusable UI components (if applicable)
│   │   ├── theme/             # Theme providers and styling utilities
│   │   ├── etl/               # ETL and data processing modules
│   │   ├── ai-orchestration/  # Core AI orchestration and workflow modules
│   │   ├── data/              # Data infrastructure and integration modules
│   │   ├── agents/            # Agent orchestration, controllers, and orchestrator logic
│   │   ├── guardrails/        # Ethical and safety guardrails
│   │   ├── memory/            # Memory and state management modules
│   │   ├── inference/         # Model inference wrappers
│   │   └── llm/               # Large language model tooling
│   │
│   └── apps/                  # Microservice applications
│       ├── maily-web/         # Frontend application (Next.js)
│       ├── maily-synthesize/  # Handles content synthesis and personalization
│       ├── maily-optimize/    # Used for A/B testing and optimization
│       ├── maily-deliver/     # Manages email delivery and tracking
│       ├── maily-analyze/     # Provides analytics and reporting
│       ├── maily-research/    # Performs data enrichment and research
│       └── workflow-engine/   # Workflow orchestration engine (POC)
│
├── infrastructure/            # Infrastructure as Code, CI/CD, deployment scripts
│   ├── ci/
│   ├── k8s/
│   └── config/
│
├── docs/                      # Documentation (updated REPOSITORY_STRUCTURE.md, refactoring docs, etc.)
├── legacy/                    # Archive for legacy/experimental directories (e.g., dr, remediation, extra workflow setups)
└── other-root-items           # Additional root files (README.md, package.json, etc.), which will be updated or migrated as part of the refactoring.
```

## Migration Strategy

1. **Extract Core Modules:**
   - Move applicable modules from the root-level `src` into `packages/core/` following their functionality.
   - Update import paths in apps to reference these new locations.

2. **Reorganize Applications:**
   - For each microservice in the `apps/` directory, ensure self-contained structure with updated dependencies on `@maily/core`.
   - Remove duplicate code now centralized in `packages/core/`.

3. **Isolate Infrastructure and Legacy Code:**
   - Move CI/CD, deployment, and configuration files into the `infrastructure/` directory.
   - Archive experimental or legacy directories (like `dr/`, `remediation/`, etc.) into a new `legacy/` directory to declutter the main codebase.

4. **Update Documentation:**
   - Revise docs/REPOSITORY_STRUCTURE.md and developer guides to reflect the new structure.
   - Document migration steps and update build/test workflows in the CI/CD pipelines.

## Conclusion

This proposed monorepo structure will improve clarity, maintainability, and scalability by enforcing clear module boundaries and reducing duplication. It sets the stage for incremental migration and further refactoring with defined milestones. 
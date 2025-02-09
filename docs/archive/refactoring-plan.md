NOTE: This document has been updated to reflect the new vision and strategic objectives of the Maily platform.

# Refactoring Plan for Maily Repository

## Overview
The Maily repository is a complex monorepo that includes multiple apps (e.g., maily-web, maily-synthesize, maily-analyze) and a rich core library (in the root-level src directory) containing core functionalities (AI orchestration, ETL, data processing, agents, guardrails, etc.).

This plan outlines the steps to analyze, audit, and refactor the repository to:

- Identify core, shared modules vs. app-specific code
- Consolidate duplicate functionality across apps and the core library
- Adopt a clear modular structure (potentially using a monorepo tool like Turborepo or Yarn Workspaces)
- Update documentation to reflect the new structure

## Step 1: Automated Dependency Analysis

1. **Tooling:**
   - Use a combination of search commands (e.g., grep) and static analysis tools to map out how modules are imported across the repository. For example:
     - `grep -R "from src/" .` to find references to core modules
     - Use tools like Madge (https://github.com/pahen/madge) for JavaScript/TypeScript dependency graphs, and possibly custom scripts for Python files.

2. **Objective:**
   - Identify dependencies between the root-level src modules and each app (especially maily-web, maily-synthesize, etc.).
   - Document any duplicate functionality (e.g., similar orchestrator or logging modules).

## Step 2: Inventory & Categorization of Code

1. **Audit Each Directory:**
   - **Root-Level src:** Inventory modules in components, theme, etl_pipeline.py, ai_orchestration, data, workflow, agents, guardrails, memory, inference, llm.
   - **Apps:** Inventory the internal src and other subdirectories for each active app (maily-web, maily-synthesize, maily-analyze), noting any overlapping or duplicate UI components, utilities, or business logic.
   - **Legacy/Experimental Directories:** Map directories like dr, remediation, workflow (if not active), and parts of data/.

2. **Documentation:**
   - Create a table listing each directory/module, its purpose, and its usage. This documentation will be updated in the repository (e.g., in a section of REFACTORING_PLAN.md or a new file Inventory.md).

## Step 3: Define a New Modular Structure

1. **Monorepo Setup:**
   - Evaluate using a monorepo tool like Turborepo, Yarn Workspaces, or Lerna to split the repo into clearly defined packages:
     - **Core Packages:** Shared libraries for AI orchestration, ETL/data processing, utilities, etc. (extracted from the root-level src)
     - **Applications:** Each microservice (maily-web, maily-synthesize, maily-analyze) lives in its own package with explicit dependencies on the core libraries.
     - **Infrastructure/DevOps:** Consider separating CI, deployment, and infrastructure scripts into a dedicated package if needed.

2. **Clear Boundaries:**
   - Decide which code is production-critical and which is experimental or legacy. Plan to archive, deprecate, or retire legacy modules that no longer align with the active platform.

## Step 4: Incremental Migration

Note: Prior to migrating shared functionalities, ensure that all legacy modules that are no longer aligned with the active platform are retired.

1. **Create Shared Library Modules:**
   - Gradually extract common functionality (e.g., logging, error handling, orchestration logic) from the root-level src and consolidate them into a shared package (e.g., `@maily/core`).
   - Update apps to import from the shared package rather than duplicating code.

2. **Refactor Apps:**
   - For each app, review their internal structure (UI components, API endpoints, business logic) and ensure they follow the new guidelines.
   - Remove duplicated components that are now centralized.

## Step 5: Documentation & Testing

1. **Update Documentation:**
   - Revise docs/REPOSITORY_STRUCTURE.md to reflect the new modular structure.
   - Create developer guides explaining how to work with the new monorepo setup, dependency management, and build processes.

2. **Testing & CI:**
   - Update CI/CD pipelines to handle the new project structure (e.g., updating build/test scripts per package).
   - Ensure comprehensive tests are executed for core packages and each app.

## Step 6: Team Review & Iteration

1. **Stakeholder Meeting:**
   - Present the findings from the dependency analysis and the proposed modular structure to the team.
   - Gather feedback and iterate on the plan.

2. **Finalization & Rollout:**
   - Set milestones for progressive refactoring.
   - Monitor and adjust based on issues observed while migrating code.

## Conclusion

This refactoring plan aims to streamline the complex repository into a modular monorepo with clear boundaries between shared core functionality and individual microservices. By methodically analyzing dependencies, consolidating duplicate code, and updating documentation, we can enhance maintainability, clarity, and scalability across the entire Maily platform.

*End of Refactoring Plan*

Note: Future iterations will incorporate autonomous feedback loops from our monitoring agents to continuously refine repository structure and processes. 
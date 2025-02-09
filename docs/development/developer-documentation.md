NOTE: This document has been updated to reflect the new vision and strategic objectives of the Maily platform.

# Developer Documentation

This document provides detailed integration and developer guidance for the Production API, a robust platform supporting AI-powered Tier 1 support and a fully integrated bug bounty program.

## Overview

The Production API is engineered as a comprehensive solution offering:

- A production-grade AI-powered support system with escalation protocols
- A robust bug bounty program with secure endpoints for submitting and reviewing reports
- Extensive production-grade documentation including a complete OpenAPI specification
- Integrated community infrastructure for developer outreach via a dedicated Discord channel and an AI-enhanced knowledge base

## API Endpoints

### Support API

- **POST /support/query**
  - Accepts a JSON body with a `query` parameter.
  - Returns a simulated chatbot response.
  - Automatically escalates queries containing keywords like "error", "complex", "failed", or "urgent", creating a Tier 2 support ticket.

### Bug Bounty API

- **POST /bug-bounty/submit**
  - Submit a detailed bug bounty report.
  - Required fields: `title`, `description`, `severity`, `reporterEmail`.
  - Severity must be one of: low, medium, high, critical.

- **GET /bug-bounty/guidelines**
  - Retrieves the bug bounty program guidelines including scope, rules, safe harbor, reward structure, and submission process.

- **GET /bug-bounty/reports**
  - Retrieves a list of all submitted bug bounty reports (admin endpoint; authentication required in production).

## OpenAPI Specification

A full OpenAPI (Swagger) specification is available in the [swagger.yaml](./swagger.yaml) file. This provides detailed information on request/response formats and can be used for generating client SDKs.

## Community Infrastructure

Our community hub is built with enterprise-grade integration:

### Discord Channel

- **URL**: https://discord.gg/your-channel-link
- **Purpose**: Connect with the development team and the community, share ideas, and receive real-time support.

### AI-Enhanced Knowledge Base

An AI-enhanced knowledge base powered by tools such as Zep is integrated into our platform to provide context-aware support and advanced search capabilities. This enables developers to find solutions and get comprehensive answers efficiently.

## Sandbox Instructions

To set up a local instance for development and testing:

1. Clone the repository.
2. Navigate to the `production-api` directory and run `npm install` to install dependencies.
3. Start the Production API with `npm start`.
4. Use the provided Swagger UI or Postman collection for testing the endpoints. The API will be available on `http://localhost:3000`.

## Additional Guidelines

- All endpoints include production-grade error handling, robust input validation, and logging using Winston.
- Integration tests are located in the `production-api/test` directory.
- For any support or escalation queries, the system automatically generates Tier 2 support tickets, ensuring a seamless support workflow.

This documentation aims to provide a complete guide for developers working with or integrating our Production API. For further inquiries, please join our Discord channel or refer to the support documentation. 
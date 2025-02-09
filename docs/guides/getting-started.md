NOTE: This document has been updated to reflect the new vision and strategic objectives of the Maily platform.

# Getting Started with Maily

Welcome to Maily! This guide will help you set up your development environment and contribute effectively to the project.

## Prerequisites

- Node.js and npm for frontend development.
- Go for backend development.
- Git for version control.

## Installation

1. Clone the repository:
   ```bash
git clone <repo-url>
   ```
2. Install frontend dependencies:
   ```bash
cd frontend && npm install
   ```
3. For backend services:
   ```bash
cd backend && go mod download
   ```

## Development Workflow

### Code Style and Quality

- Our project enforces consistent code style using ESLint and Prettier. 
- Please refer to our [CODE_STYLE guidelines](../CODE_STYLE.md).

### Testing

- **Frontend:** We use Jest for unit and integration tests. Run tests using:
   ```bash
npm test
   ```
- **Backend:** We use Go Test for running tests. Run tests using:
   ```bash
go test ./...
   ```

### Running the Application

- For frontend development:
   ```bash
npm start
   ```
- For backend services:
   ```bash
go run main.go
   ```

## Further Documentation

- **Concepts:** Learn more from the [Maily Conceptual Overview](../concepts/maily.md).
- **API:** Check out our [OpenAPI Specifications](../api/openapi-specifications.md) for API endpoint details.
- **Developer Guide:** Detailed development practices are documented in [Development Guide](../development/README.md).

Happy Coding! 
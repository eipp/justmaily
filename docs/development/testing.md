NOTE: This document has been updated to reflect the new vision and strategic objectives of the Maily platform.

# Testing Frameworks and Guidelines

## Overview
This document outlines the testing strategies, frameworks, and best practices for our project, covering both frontend and backend services. Our goal is to ensure that our code is reliable, maintainable, and that any regressions are caught early.

## Frontend Unit Testing
- **Framework:** Jest
- **Environment:** jsdom
- **Configuration:** See jest.config.js for details.
- **Test File Conventions:**
  - Place tests under __tests__ directories or use the naming convention *.test.js or *.spec.js
  - Ensure tests are written concurrently with feature development

## Backend Testing
- **Framework:** Go's built-in testing package
- **Test File Conventions:**
  - Use *_test.go suffix for test files
  - Organize tests close to corresponding code for easier maintenance
- **Command:** Run `go test ./...` to execute all backend tests

## Integration Testing
- **Scope:** Validate the integration between components, simulating real-world scenarios
- **Organization:** Maintain a clear separation between unit tests and integration tests
- **Best Practices:**
  - Ensure external dependencies and services are mocked or stubbed appropriately
  - Include critical user flows and inter-component interactions

## Running Tests
- **Frontend Tests:** `npm run test` (with optional `npm run test:coverage` for coverage reports)
- **Backend Tests:** `go test ./...`
- **Combined Testing (if applicable):** A combined script can be configured to run all tests sequentially

## Best Practices
- Write tests in parallel with new feature development
- Maintain a high level of test coverage, focusing on critical functionalities
- Review and update tests alongside code refactoring and enhancements
- Use continuous integration to automate the testing process and catch issues early

## Workflow Orchestration POC Tests

The following tests can be performed to validate the new Workflow Orchestration service:

1. **Local Service Test**
   - Navigate to the `apps/workflow-engine` directory.
   - Install dependencies using `npm install`.
   - Start the service: `node index.js`.
   - Verify that the console logs display attempts and retries, and that the workflow eventually completes or fails after the maximum retries.

2. **Health Check Endpoint Test**
   - With the service running, send an HTTP request to `http://localhost:3000/health` (e.g., using `curl http://localhost:3000/health`).
   - Verify that the response is `OK` with an HTTP status code 200.

3. **Docker Container Test**
   - Build the Docker image from `apps/workflow-engine/Dockerfile`:
     ```sh
     docker build -t workflow-engine apps/workflow-engine
     ```
   - Run the container:
     ```sh
     docker run -p 3000:3000 workflow-engine
     ```
   - Verify the health check endpoint is accessible: `curl http://localhost:3000/health` should return `OK`.

4. **Kubernetes Deployment Test**
   - Apply the manifests in the `k8s/` directory:
     ```sh
     kubectl apply -f k8s/
     ```
   - Monitor the deployment with `kubectl get pods` and `kubectl describe pod <pod-name>` to verify readiness and liveness probes.
   - Verify that the Horizontal Pod Autoscaler is scaling as expected based on CPU metrics.

These tests ensure that the service follows expected behavior under local, containerized, and orchestrated environments. 
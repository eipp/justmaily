NOTE: This document has been updated to reflect the new vision and strategic objectives of the Maily platform.

# Workflow Orchestration Proof-of-Concept (POC)

## Overview

This document details the workflow orchestration POC implemented in the `apps/workflow-engine` module. The service demonstrates:

- Automated retries and granular error handling
- Self-healing mechanisms with recovery/alert triggers
- Basic real-time observability through logging and a health check endpoint

The service is built with Node.js and designed for containerized deployment using Docker and Kubernetes.

## Local Setup and Execution

1. Navigate to the `apps/workflow-engine` directory:
   ```sh
   cd apps/workflow-engine
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the service:
   ```sh
   node index.js
   ```
   The service will run a sample workflow with automated retries and log outputs to the console.

## Docker Container Deployment

The provided Dockerfile in `apps/workflow-engine/Dockerfile` handles building the Node.js application and setting up a health check endpoint:

1. Build the Docker image:
   ```sh
   docker build -t workflow-engine .
   ```
2. Run the container:
   ```sh
   docker run -p 3000:3000 workflow-engine
   ```
   The container exposes port 3000 and includes a health check on `/health`.

## Kubernetes Integration

Kubernetes manifests are provided for deployment and autoscaling:

- `k8s/workflow-engine-deployment.yaml`: Deploys the service with readiness and liveness probes pointing to the `/health` endpoint.
- `k8s/hpa-workflow-engine.yaml`: Configures a Horizontal Pod Autoscaler (HPA) based on CPU utilization (average target: 50%).

To deploy on Kubernetes:

1. Apply the manifests:
   ```sh
   kubectl apply -f k8s/
   ```

## Monitoring and Logging

- The service logs are sent to standard output. Centralized logging is recommended for production.
- Health checks via the `/health` endpoint can be used to monitor service availability.

## Conclusion

This POC lays the foundation for a robust and scalable workflow orchestration system. Future improvements may include advanced task scheduling, enhanced observability, and more comprehensive self-healing mechanisms. Additionally, integrate autonomous feedback loops to continuously optimize workflow performance based on real-time data.

Refer to the main [README.md](../README.md) for overall project details and additional documentation. 
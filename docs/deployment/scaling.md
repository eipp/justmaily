# Scaling Guide

Scaling Maily involves ensuring both application and infrastructure can handle increased load.

## Horizontal Scaling

- **Web Service Scaling:**  
  Increase the number of replicas in your Docker Compose, Kubernetes deployments, or service configuration.
  
  For Kubernetes, modify the `replicas` section in your deployment YAML and apply changes:
  
  ```bash
  kubectl scale deployment myapp --replicas=5
  ```

## Vertical Scaling

- Scale the resources (CPU, memory) allocated to your containers. Update resource requests/limits as needed.

## Load Balancing

- Ensure load balancing is set up automatically (using Kubernetes Service with type LoadBalancer or a dedicated load balancer).
- Use health checks and auto-scaling policies to handle traffic spikes.

## Database Scaling

- Use read replicas or sharding for the PostgreSQL service.
- Monitor and optimize queries to reduce load. 
# Maily Infrastructure

This directory contains all infrastructure-related code and configurations for Maily.

## Directory Structure

```
infrastructure/
├── terraform/                # Infrastructure as Code
│   ├── modules/             # Reusable Terraform modules
│   │   ├── gke/            # Google Kubernetes Engine
│   │   ├── network/        # VPC and networking
│   │   ├── redis/          # Redis instance
│   │   └── storage/        # Cloud Storage buckets
│   └── environments/        # Environment-specific configs
│       ├── dev/            # Development
│       ├── staging/        # Staging
│       └── prod/           # Production
├── k8s/                     # Kubernetes manifests
│   ├── base/               # Base configurations
│   └── overlays/           # Environment overlays
├── docker/                  # Container configurations
│   ├── Dockerfile.base     # Base image
│   └── compose/            # Docker Compose files
└── scripts/                # Infrastructure management
    ├── setup/              # Setup scripts
    └── maintenance/        # Maintenance scripts
```

## Components

### Terraform Modules

#### GKE Module
- Creates and manages GKE clusters
- Configures node pools and autoscaling
- Sets up workload identity and security

#### Network Module
- VPC and subnet configuration
- Secondary IP ranges for GKE
- Cloud NAT and firewall rules
- Internal networking setup

#### Redis Module (TODO)
- Managed Redis instances
- Memory and version configuration
- Network security setup

#### Storage Module (TODO)
- Cloud Storage bucket creation
- CORS and lifecycle policies
- IAM and security configuration

### Kubernetes

- Base configurations for core services
- Environment-specific overlays
- Service mesh setup
- Monitoring and logging

### Docker

- Base images for services
- Development environments
- CI/CD configurations

## Usage

### Setting Up Development Environment

1. Initialize Terraform:
```bash
cd terraform/environments/dev
terraform init
```

2. Apply infrastructure:
```bash
terraform apply -var-file=terraform.tfvars
```

3. Configure kubectl:
```bash
gcloud container clusters get-credentials maily-cluster-dev
```

### Deploying Services

1. Build containers:
```bash
cd docker
docker-compose build
```

2. Apply Kubernetes configs:
```bash
cd k8s
kubectl apply -k overlays/dev
```

## Security

1. Network Security
   - Private GKE clusters
   - VPC-native networking
   - Cloud NAT for outbound traffic
   - Internal load balancing

2. Access Control
   - Workload identity
   - Service accounts
   - RBAC policies
   - Network policies

3. Data Security
   - Encryption at rest
   - TLS everywhere
   - Secret management

## Maintenance

1. Infrastructure Updates
   - Regular provider updates
   - Security patches
   - Performance optimization

2. Monitoring
   - Resource utilization
   - Cost optimization
   - Performance metrics
   - Security alerts

3. Backup and Recovery
   - State file backups
   - Database backups
   - Disaster recovery plans 
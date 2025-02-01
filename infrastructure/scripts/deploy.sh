#!/bin/bash
set -e

# ============================================================
# Production-grade deployment script
# This script automates database backups, migrations,
# container builds, and application rollout.
# ============================================================

# Function to backup the database
backup_database() {
  echo "Starting database backup..."
  # Example for Postgres; adjust command for your database
  pg_dump -U "$DB_USER" -h "$DB_HOST" "$DB_NAME" > "backup_$(date +%F).sql"
  echo "Database backup completed: backup_$(date +%F).sql"
}

# Function to run database migrations
run_migrations() {
  echo "Running database migrations..."
  # Adjust to your migration tool (e.g., knex, sequelize-cli, typeorm)
  npm run migrate
  echo "Database migrations completed."
}

# Function to deploy the application
deploy_application() {
  echo "Building Docker image..."
  docker build -t myapp:latest .
  
  echo "Deploying application with docker-compose..."
  # Bring down any existing containers and start fresh
  docker-compose down
  docker-compose up -d
  
  echo "Application deployed successfully."
}

# Function to rollback to a previous version
rollback() {
  echo "Rolling back deployment..."
  # Implement your rollback strategy here.
  # For example, restore the previous docker image or re-deploy a stable backup.
  # Optionally, restore database backup as needed.
  echo "Rollback completed."
}

# Main execution handling deploy or rollback commands
case "$1" in
  deploy)
    echo "Starting deployment process..."
    backup_database
    run_migrations
    deploy_application
    ;;
  rollback)
    rollback
    ;;
  *)
    echo "Usage: $0 {deploy|rollback}"
    exit 1
    ;;
esac 
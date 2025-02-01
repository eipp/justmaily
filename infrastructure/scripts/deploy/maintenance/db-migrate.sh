#!/bin/bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Function to print status messages
print_status() {
    echo -e "${GREEN}==>${NC} $1"
}

print_error() {
    echo -e "${RED}Error:${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}Warning:${NC} $1"
}

# Check required environment variables
check_env() {
    if [ -z "$DB_HOST" ] || [ -z "$DB_PORT" ] || [ -z "$DB_NAME" ] || [ -z "$DB_USER" ] || [ -z "$DB_PASSWORD" ]; then
        print_error "Missing required environment variables. Please set: DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD"
        exit 1
    fi
}

# Wait for database to be ready
wait_for_db() {
    print_status "Waiting for database to be ready..."
    until PGPASSWORD=$DB_PASSWORD psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c '\q'; do
        print_warning "Database is unavailable - sleeping"
        sleep 1
    done
    print_status "Database is ready!"
}

# Run migrations for a specific service
run_service_migrations() {
    local service=$1
    print_status "Running migrations for $service..."
    
    if [ ! -d "apps/$service/migrations" ]; then
        print_warning "No migrations found for $service"
        return
    fi
    
    cd "apps/$service"
    
    # Check if using Prisma
    if [ -f "prisma/schema.prisma" ]; then
        print_status "Running Prisma migrations..."
        npx prisma migrate deploy
    # Check if using TypeORM
    elif [ -f "ormconfig.json" ] || [ -f "ormconfig.js" ]; then
        print_status "Running TypeORM migrations..."
        npx typeorm migration:run
    else
        print_error "No supported migration system found for $service"
        exit 1
    fi
    
    cd ../..
}

# Main execution
main() {
    check_env
    wait_for_db
    
    # List of services that need migrations
    services=(
        "api-gateway"
        "campaign-management"
        "audience-segmentation"
        "analytics-service"
        "project-management"
    )
    
    # Run migrations for each service
    for service in "${services[@]}"; do
        run_service_migrations "$service"
    done
    
    print_status "All migrations completed successfully! 🎉"
}

main 
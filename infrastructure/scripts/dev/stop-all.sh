#!/bin/bash
set -e

# Stop all containers
echo "Stopping all services..."
docker-compose -f config/docker-compose.yml down

# Clean up any orphaned containers
echo "Cleaning up orphaned containers..."
docker container prune -f

# Clean up unused volumes (optional)
read -p "Clean up unused volumes? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  docker volume prune -f
fi

echo "All services stopped successfully!" 
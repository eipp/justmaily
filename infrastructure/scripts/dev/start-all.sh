#!/bin/bash
set -e

# Load environment variables
if [ -f .env ]; then
  source .env
else
  echo "Warning: .env file not found"
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  pnpm install
fi

# Build shared libraries first
echo "Building shared libraries..."
for lib in libs/*; do
  if [ -d "$lib" ]; then
    echo "Building $lib..."
    (cd "$lib" && pnpm build)
  fi
done

# Start all services
echo "Starting all services..."
docker-compose -f config/docker-compose.yml up -d

# Wait for services to be healthy
echo "Waiting for services to be healthy..."
sleep 10

echo "All services started successfully!"
echo "API Gateway available at: http://localhost:3000" 
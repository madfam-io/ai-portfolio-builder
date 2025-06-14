#!/bin/bash

# PRISMA Portfolio Builder - Development Environment with PostHog
# This script starts both the main development environment and PostHog analytics

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_message() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# Function to check if a service is healthy
check_service() {
    local service_name=$1
    local port=$2
    local max_attempts=30
    local attempt=1

    print_message $YELLOW "⏳ Waiting for $service_name to be ready..."
    
    while [ $attempt -le $max_attempts ]; do
        if nc -z localhost $port 2>/dev/null; then
            print_message $GREEN "✅ $service_name is ready!"
            return 0
        fi
        echo -n "."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    print_message $RED "❌ $service_name failed to start after $max_attempts attempts"
    return 1
}

# Main script
print_message $GREEN "🚀 Starting PRISMA Development Environment with PostHog Analytics"

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    print_message $RED "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Stop any existing containers
print_message $YELLOW "🛑 Stopping existing containers..."
docker-compose -f docker-compose.dev.yml down 2>/dev/null || true
docker-compose -f docker-compose.posthog.yml down 2>/dev/null || true

# Create necessary directories
print_message $YELLOW "📁 Creating necessary directories..."
mkdir -p posthog-plugins

# Start services
print_message $YELLOW "🐳 Starting services..."
docker-compose -f docker-compose.dev.yml -f docker-compose.posthog.yml up -d

# Wait for services to be ready
print_message $GREEN "\n🔍 Checking service health..."

check_service "PostgreSQL" 5432
check_service "Redis" 6379
check_service "Next.js App" 3000
check_service "pgAdmin" 5050
check_service "PostHog" 8000
check_service "ClickHouse" 8123

print_message $GREEN "\n✨ All services are up and running!"
print_message $GREEN "\n📍 Access points:"
echo "  - Next.js App: http://localhost:3000"
echo "  - pgAdmin: http://localhost:5050 (admin@madfam.io / admin)"
echo "  - PostHog: http://localhost:8000"
echo "  - PostgreSQL: localhost:5432"
echo "  - Redis: localhost:6379"
echo "  - ClickHouse: localhost:8123"

print_message $YELLOW "\n📝 To view logs:"
echo "  docker-compose -f docker-compose.dev.yml -f docker-compose.posthog.yml logs -f"

print_message $YELLOW "\n🛑 To stop all services:"
echo "  docker-compose -f docker-compose.dev.yml -f docker-compose.posthog.yml down"

print_message $GREEN "\n🎉 Happy coding!"
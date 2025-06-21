#!/bin/bash

#!/bin/bash
# MADFAM Code Available License (MCAL) v1.0
# Copyright (c) 2025-present MADFAM. All rights reserved.
# Commercial use prohibited except by MADFAM and licensed partners.
# For licensing: licensing@madfam.com


# Local Development Deployment Script
set -e

echo "🏠 Setting up PRISMA AI Portfolio Builder - LOCAL DEVELOPMENT environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker first."
    exit 1
fi

print_status "Docker is running ✅"

# Check Node.js version
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18 or higher."
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version 18 or higher is required. Current version: $(node --version)"
    exit 1
fi

print_status "Node.js version is compatible ✅"

# Check if .env.local exists
if [ ! -f .env.local ]; then
    print_warning ".env.local not found. Creating from template..."
    cp .env.example .env.local
    print_warning "Please update .env.local with your API keys before continuing."
    read -p "Press Enter to continue once you've configured .env.local..."
fi

print_status ".env.local configuration exists ✅"

# Install dependencies
print_status "Installing dependencies..."
if command -v pnpm &> /dev/null; then
    pnpm install --frozen-lockfile
else
    print_warning "pnpm not found. Installing with npm..."
    npm ci
fi

print_success "Dependencies installed ✅"

# Run type checking
print_status "Running type checking..."
if command -v pnpm &> /dev/null; then
    pnpm type-check
else
    npm run type-check
fi

print_success "Type checking passed ✅"

# Start Docker development environment
print_status "Starting Docker development services..."
docker-compose -f docker-compose.dev.yml down --remove-orphans
docker-compose -f docker-compose.dev.yml build --no-cache
docker-compose -f docker-compose.dev.yml up -d

# Wait for services to be ready
print_status "Waiting for services to be ready..."
sleep 15

# Health check
print_status "Performing health checks..."

# Check PostgreSQL
if docker-compose -f docker-compose.dev.yml exec -T postgres pg_isready > /dev/null 2>&1; then
    print_success "PostgreSQL is ready ✅"
else
    print_error "PostgreSQL is not ready ❌"
fi

# Check Redis
if docker-compose -f docker-compose.dev.yml exec -T redis redis-cli ping > /dev/null 2>&1; then
    print_success "Redis is ready ✅"
else
    print_error "Redis is not ready ❌"
fi

# Start the Next.js development server
print_status "Starting Next.js development server..."
if command -v pnpm &> /dev/null; then
    pnpm dev &
else
    npm run dev &
fi

DEV_PID=$!

# Wait for the app to be ready
print_status "Waiting for the application to be ready..."
sleep 10

# Check if the app is responding
if curl -f http://localhost:3000/api/v1/health > /dev/null 2>&1; then
    print_success "Application is ready and responding ✅"
else
    print_warning "Application may still be starting up..."
fi

# Display environment information
echo ""
echo "🎉 LOCAL DEVELOPMENT environment is ready!"
echo ""
echo "📊 Service URLs:"
echo "   🌐 Application:     http://localhost:3000"
echo "   🗄️  pgAdmin:        http://localhost:5050"
echo "      Email:          admin@madfam.io"
echo "      Password:       Check PGADMIN_DEFAULT_PASSWORD in .env.local"
echo "   📊 Redis:           localhost:6379"
echo "   🐘 PostgreSQL:      localhost:5432"
echo ""
echo "🛠️  Development Commands:"
echo "   📝 View app logs:    tail -f dev.log"
echo "   🐳 View Docker logs: docker-compose -f docker-compose.dev.yml logs -f"
echo "   🛑 Stop Docker:      docker-compose -f docker-compose.dev.yml down"
echo "   🔄 Restart app:      pnpm dev:clean"
echo ""
echo "🧪 Testing Commands:"
echo "   🃏 Run tests:        pnpm test"
echo "   📊 Test coverage:    pnpm test:coverage"
echo "   🎭 E2E tests:        pnpm test:e2e"
echo ""
echo "📋 Next Steps:"
echo "   1. Configure your API keys in .env.local"
echo "   2. Run database migrations if needed"
echo "   3. Start developing! 🚀"
echo ""

# Keep the script running to show logs
if [ "$1" != "--no-logs" ]; then
    print_status "Showing application logs (Ctrl+C to exit)..."
    wait $DEV_PID
fi
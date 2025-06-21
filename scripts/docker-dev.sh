#!/bin/bash

#!/bin/bash
# MADFAM Code Available License (MCAL) v1.0
# Copyright (c) 2025-present MADFAM. All rights reserved.
# Commercial use prohibited except by MADFAM and licensed partners.
# For licensing: licensing@madfam.com


# Docker Development Setup Script
set -e

echo "🐳 Setting up MADFAM AI Portfolio Builder development environment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local from template..."
    cp .env.example .env.local
    echo "⚠️  Please update .env.local with your API keys before running the application."
fi

# Build and start development environment
echo "🏗️  Building development environment..."
docker-compose -f docker-compose.dev.yml build

echo "🚀 Starting development services..."
docker-compose -f docker-compose.dev.yml up -d

echo "⏳ Waiting for services to be ready..."
sleep 10

# Check if services are running
if docker-compose -f docker-compose.dev.yml ps | grep -q "Up"; then
    echo "✅ Development environment is ready!"
    echo ""
    echo "🌐 Application: http://localhost:3000"
    echo "🗄️  pgAdmin: http://localhost:5050 (admin@madfam.io / admin)"
    echo "📊 Redis: localhost:6379"
    echo "🐘 PostgreSQL: localhost:5432"
    echo ""
    echo "📝 To view logs: docker-compose -f docker-compose.dev.yml logs -f"
    echo "🛑 To stop: docker-compose -f docker-compose.dev.yml down"
else
    echo "❌ Some services failed to start. Check logs with:"
    echo "docker-compose -f docker-compose.dev.yml logs"
fi
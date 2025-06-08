#!/bin/bash

# Docker Production Setup Script
set -e

echo "🐳 Setting up MADFAM AI Portfolio Builder production environment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ .env.local not found. Please create it with production environment variables."
    exit 1
fi

# Build production image
echo "🏗️  Building production image..."
docker-compose build --no-cache

echo "🚀 Starting production services..."
docker-compose up -d

echo "⏳ Waiting for services to be ready..."
sleep 15

# Check if services are running
if docker-compose ps | grep -q "Up"; then
    echo "✅ Production environment is ready!"
    echo ""
    echo "🌐 Application: http://localhost:3000"
    echo "🗄️  Database: localhost:5432"
    echo "📊 Redis: localhost:6379"
    echo ""
    echo "📝 To view logs: docker-compose logs -f"
    echo "🛑 To stop: docker-compose down"
else
    echo "❌ Some services failed to start. Check logs with:"
    echo "docker-compose logs"
fi
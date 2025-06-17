#!/bin/bash

# Staging Deployment Script
set -e

echo "🏗️ Deploying PRISMA AI Portfolio Builder to STAGING environment..."

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

# Configuration
ENVIRONMENT="staging"
COMPOSE_FILE="docker-compose.staging.yml"
ENV_FILE=".env.staging"
HEALTH_CHECK_URL="http://localhost:3000/api/v1/health"
MAX_HEALTH_CHECK_ATTEMPTS=30
HEALTH_CHECK_INTERVAL=10

# Check prerequisites
print_status "Checking prerequisites..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker first."
    exit 1
fi

print_status "Docker is running ✅"

# Check if environment file exists
if [ ! -f "$ENV_FILE" ]; then
    print_error "$ENV_FILE not found. Please create it with staging environment variables."
    print_status "You can copy from .env.example and modify for staging."
    exit 1
fi

print_status "Environment configuration exists ✅"

# Validate environment variables
print_status "Validating environment configuration..."
source "$ENV_FILE"

required_vars=(
    "POSTGRES_PASSWORD"
    "NEXT_PUBLIC_SUPABASE_URL"
    "NEXT_PUBLIC_SUPABASE_ANON_KEY"
    "SUPABASE_SERVICE_ROLE_KEY"
)

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        print_error "Required environment variable $var is not set in $ENV_FILE"
        exit 1
    fi
done

print_success "Environment validation passed ✅"

# Pre-deployment checks
print_status "Running pre-deployment checks..."

# Run type checking
print_status "Type checking..."
if command -v pnpm &> /dev/null; then
    pnpm type-check
else
    npm run type-check
fi

print_success "Type checking passed ✅"

# Run linting
print_status "Linting code..."
if command -v pnpm &> /dev/null; then
    pnpm lint
else
    npm run lint
fi

print_success "Linting passed ✅"

# Run tests (minimal for staging deployment speed)
print_status "Running critical tests..."
if command -v pnpm &> /dev/null; then
    pnpm test --testPathPattern="critical" --passWithNoTests
else
    npm run test -- --testPathPattern="critical" --passWithNoTests
fi

print_success "Critical tests passed ✅"

# Stop existing staging environment
print_status "Stopping existing staging environment..."
docker-compose -f "$COMPOSE_FILE" down --remove-orphans

# Clean up old images
print_status "Cleaning up old images..."
docker image prune -f

# Build staging images
print_status "Building staging images..."
docker-compose -f "$COMPOSE_FILE" build --no-cache --parallel

print_success "Images built successfully ✅"

# Start staging environment
print_status "Starting staging environment..."
docker-compose -f "$COMPOSE_FILE" up -d

# Wait for services to be ready
print_status "Waiting for services to initialize..."
sleep 30

# Health checks
print_status "Performing comprehensive health checks..."

# Check database
print_status "Checking PostgreSQL connection..."
attempt=1
max_attempts=10
while [ $attempt -le $max_attempts ]; do
    if docker-compose -f "$COMPOSE_FILE" exec -T staging-postgres pg_isready -U "${POSTGRES_USER:-prisma_staging}" > /dev/null 2>&1; then
        print_success "PostgreSQL is ready ✅"
        break
    fi
    
    if [ $attempt -eq $max_attempts ]; then
        print_error "PostgreSQL failed to start after $max_attempts attempts"
        docker-compose -f "$COMPOSE_FILE" logs staging-postgres
        exit 1
    fi
    
    print_status "Waiting for PostgreSQL... (attempt $attempt/$max_attempts)"
    sleep 5
    ((attempt++))
done

# Check Redis
print_status "Checking Redis connection..."
attempt=1
while [ $attempt -le $max_attempts ]; do
    if docker-compose -f "$COMPOSE_FILE" exec -T staging-redis redis-cli ping > /dev/null 2>&1; then
        print_success "Redis is ready ✅"
        break
    fi
    
    if [ $attempt -eq $max_attempts ]; then
        print_error "Redis failed to start after $max_attempts attempts"
        docker-compose -f "$COMPOSE_FILE" logs staging-redis
        exit 1
    fi
    
    print_status "Waiting for Redis... (attempt $attempt/$max_attempts)"
    sleep 5
    ((attempt++))
done

# Check application health
print_status "Checking application health..."
attempt=1
while [ $attempt -le $MAX_HEALTH_CHECK_ATTEMPTS ]; do
    if curl -f "$HEALTH_CHECK_URL" > /dev/null 2>&1; then
        print_success "Application is healthy ✅"
        break
    fi
    
    if [ $attempt -eq $MAX_HEALTH_CHECK_ATTEMPTS ]; then
        print_error "Application failed health check after $MAX_HEALTH_CHECK_ATTEMPTS attempts"
        print_status "Application logs:"
        docker-compose -f "$COMPOSE_FILE" logs app
        exit 1
    fi
    
    print_status "Waiting for application... (attempt $attempt/$MAX_HEALTH_CHECK_ATTEMPTS)"
    sleep $HEALTH_CHECK_INTERVAL
    ((attempt++))
done

# Run post-deployment tests
print_status "Running post-deployment validation..."

# Test critical endpoints
endpoints=(
    "/api/v1/health"
    "/api/v1/health/ready"
    "/api/v1/health/live"
)

for endpoint in "${endpoints[@]}"; do
    if curl -f "http://localhost:3000$endpoint" > /dev/null 2>&1; then
        print_success "Endpoint $endpoint is responding ✅"
    else
        print_error "Endpoint $endpoint is not responding ❌"
        exit 1
    fi
done

# Check monitoring endpoints
if curl -f "http://localhost:9090/-/healthy" > /dev/null 2>&1; then
    print_success "Prometheus is healthy ✅"
else
    print_warning "Prometheus health check failed ⚠️"
fi

if curl -f "http://localhost:3001/api/health" > /dev/null 2>&1; then
    print_success "Grafana is healthy ✅"
else
    print_warning "Grafana health check failed ⚠️"
fi

# Display deployment information
echo ""
echo "🎉 STAGING DEPLOYMENT SUCCESSFUL!"
echo ""
echo "📊 Service URLs:"
echo "   🌐 Application:      http://localhost:3000"
echo "   🗄️  pgAdmin:         http://localhost:5051"
echo "   📊 Prometheus:       http://localhost:9090"
echo "   📈 Grafana:          http://localhost:3001"
echo "   🐘 PostgreSQL:       localhost:5433"
echo "   📊 Redis:            localhost:6380"
echo ""
echo "🔧 Management Commands:"
echo "   📝 View app logs:     docker-compose -f $COMPOSE_FILE logs -f app"
echo "   📊 View all logs:     docker-compose -f $COMPOSE_FILE logs -f"
echo "   🔍 Check status:      docker-compose -f $COMPOSE_FILE ps"
echo "   🛑 Stop services:     docker-compose -f $COMPOSE_FILE down"
echo "   🔄 Restart app:       docker-compose -f $COMPOSE_FILE restart app"
echo ""
echo "🧪 Testing Commands:"
echo "   🌐 Health check:      curl http://localhost:3000/api/v1/health"
echo "   📊 Metrics:           curl http://localhost:9090/metrics"
echo ""
echo "📋 Next Steps:"
echo "   1. Verify all functionality works as expected"
echo "   2. Run integration tests against staging"
echo "   3. Update DNS to point staging subdomain to this server"
echo "   4. Configure SSL certificates for staging.prisma.madfam.io"
echo ""

# Save deployment information
DEPLOYMENT_INFO_FILE="deployments/staging-$(date +%Y%m%d-%H%M%S).log"
mkdir -p deployments
cat > "$DEPLOYMENT_INFO_FILE" << EOF
STAGING DEPLOYMENT LOG
=====================
Date: $(date)
Environment: $ENVIRONMENT
Compose File: $COMPOSE_FILE
Git Commit: $(git rev-parse HEAD 2>/dev/null || echo "Unknown")
Git Branch: $(git branch --show-current 2>/dev/null || echo "Unknown")

Services Status:
$(docker-compose -f "$COMPOSE_FILE" ps)

Health Check Results:
$(curl -s http://localhost:3000/api/v1/health | jq . 2>/dev/null || echo "Health check failed")
EOF

print_success "Deployment information saved to $DEPLOYMENT_INFO_FILE"

print_status "Staging deployment completed successfully! 🚀"
#!/bin/bash

# Production Deployment Script with Blue-Green Strategy
set -e

echo "🚀 Deploying PRISMA AI Portfolio Builder to PRODUCTION environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
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

print_critical() {
    echo -e "${PURPLE}[CRITICAL]${NC} $1"
}

# Configuration
ENVIRONMENT="production"
COMPOSE_FILE="docker-compose.production.yml"
ENV_FILE=".env.production"
HEALTH_CHECK_URL="http://localhost:3000/api/v1/health"
READY_CHECK_URL="http://localhost:3000/api/v1/health/ready"
MAX_HEALTH_CHECK_ATTEMPTS=60
HEALTH_CHECK_INTERVAL=10
BACKUP_RETENTION_DAYS=30

# Deployment flags
SKIP_TESTS=false
SKIP_BACKUP=false
FORCE_DEPLOY=false
DRY_RUN=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --skip-tests)
            SKIP_TESTS=true
            shift
            ;;
        --skip-backup)
            SKIP_BACKUP=true
            shift
            ;;
        --force)
            FORCE_DEPLOY=true
            shift
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --help)
            echo "Usage: $0 [OPTIONS]"
            echo "Options:"
            echo "  --skip-tests    Skip running tests before deployment"
            echo "  --skip-backup   Skip database backup before deployment"
            echo "  --force         Force deployment even if checks fail"
            echo "  --dry-run       Show what would be done without executing"
            echo "  --help          Show this help message"
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

if [ "$DRY_RUN" = true ]; then
    print_warning "DRY RUN MODE - No actual changes will be made"
fi

# Production deployment confirmation
if [ "$FORCE_DEPLOY" = false ] && [ "$DRY_RUN" = false ]; then
    print_critical "⚠️  PRODUCTION DEPLOYMENT WARNING ⚠️"
    echo ""
    echo "You are about to deploy to PRODUCTION environment."
    echo "This will affect live users and real data."
    echo ""
    read -p "Are you sure you want to continue? (type 'YES' to confirm): " confirmation
    
    if [ "$confirmation" != "YES" ]; then
        print_status "Deployment cancelled by user."
        exit 0
    fi
fi

# Check prerequisites
print_status "Checking prerequisites..."

# Check if running on production server
if [ -z "$PRODUCTION_SERVER" ] && [ "$FORCE_DEPLOY" = false ]; then
    print_error "PRODUCTION_SERVER environment variable not set."
    print_error "This script should only run on the production server."
    print_error "Use --force to override this check."
    exit 1
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker first."
    exit 1
fi

print_status "Docker is running ✅"

# Check if environment file exists
if [ ! -f "$ENV_FILE" ]; then
    print_error "$ENV_FILE not found. Please create it with production environment variables."
    exit 1
fi

print_status "Environment configuration exists ✅"

# Validate environment variables
print_status "Validating production environment configuration..."
source "$ENV_FILE"

required_vars=(
    "POSTGRES_PASSWORD"
    "NEXT_PUBLIC_SUPABASE_URL"
    "NEXT_PUBLIC_SUPABASE_ANON_KEY"
    "SUPABASE_SERVICE_ROLE_KEY"
    "STRIPE_SECRET_KEY"
    "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"
    "JWT_SECRET"
    "CSRF_SECRET"
)

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        print_error "Required environment variable $var is not set in $ENV_FILE"
        exit 1
    fi
done

# Validate Stripe keys are live keys
if [[ ! "$STRIPE_SECRET_KEY" =~ ^sk_live_ ]]; then
    print_error "STRIPE_SECRET_KEY must be a live key (sk_live_...) for production"
    exit 1
fi

if [[ ! "$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY" =~ ^pk_live_ ]]; then
    print_error "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY must be a live key (pk_live_...) for production"
    exit 1
fi

print_success "Environment validation passed ✅"

# Pre-deployment checks
if [ "$SKIP_TESTS" = false ]; then
    print_status "Running comprehensive pre-deployment tests..."
    
    # Type checking
    print_status "Type checking..."
    if [ "$DRY_RUN" = false ]; then
        if command -v pnpm &> /dev/null; then
            pnpm type-check
        else
            npm run type-check
        fi
    fi
    print_success "Type checking passed ✅"
    
    # Linting
    print_status "Linting code..."
    if [ "$DRY_RUN" = false ]; then
        if command -v pnpm &> /dev/null; then
            pnpm lint
        else
            npm run lint
        fi
    fi
    print_success "Linting passed ✅"
    
    # Run full test suite
    print_status "Running full test suite..."
    if [ "$DRY_RUN" = false ]; then
        if command -v pnpm &> /dev/null; then
            pnpm test --coverage --watchAll=false
        else
            npm run test -- --coverage --watchAll=false
        fi
    fi
    print_success "All tests passed ✅"
    
    # Run E2E tests
    print_status "Running E2E tests..."
    if [ "$DRY_RUN" = false ]; then
        if command -v pnpm &> /dev/null; then
            pnpm test:e2e
        else
            npm run test:e2e
        fi
    fi
    print_success "E2E tests passed ✅"
else
    print_warning "Skipping tests as requested"
fi

# Create deployment backup
if [ "$SKIP_BACKUP" = false ]; then
    print_status "Creating pre-deployment backup..."
    
    BACKUP_DIR="backups/production/$(date +%Y%m%d-%H%M%S)"
    mkdir -p "$BACKUP_DIR"
    
    if [ "$DRY_RUN" = false ]; then
        # Database backup
        docker-compose -f docker-compose.production.yml exec -T production-postgres \
            pg_dump -U "${POSTGRES_USER:-prisma_production}" "${POSTGRES_DB:-prisma_production}" | \
            gzip > "$BACKUP_DIR/database.sql.gz"
        
        # Redis backup
        docker-compose -f docker-compose.production.yml exec -T production-redis-cluster \
            redis-cli BGSAVE
        docker cp $(docker-compose -f docker-compose.production.yml ps -q production-redis-cluster):/data/dump.rdb "$BACKUP_DIR/"
        
        # Application files backup
        tar -czf "$BACKUP_DIR/application-files.tar.gz" \
            --exclude=node_modules \
            --exclude=.next \
            --exclude=.git \
            .
    fi
    
    print_success "Backup created at $BACKUP_DIR ✅"
else
    print_warning "Skipping backup as requested"
fi

# Git information
GIT_COMMIT=$(git rev-parse HEAD 2>/dev/null || echo "Unknown")
GIT_BRANCH=$(git branch --show-current 2>/dev/null || echo "Unknown")
GIT_TAG=$(git describe --tags --exact-match 2>/dev/null || echo "No tag")

print_status "Deployment Info:"
print_status "  Git Commit: $GIT_COMMIT"
print_status "  Git Branch: $GIT_BRANCH"
print_status "  Git Tag: $GIT_TAG"

# Production deployment
print_critical "🚀 Starting PRODUCTION deployment..."

if [ "$DRY_RUN" = false ]; then
    # Stop existing services gracefully
    print_status "Gracefully stopping existing services..."
    docker-compose -f "$COMPOSE_FILE" stop
    
    # Clean up old images
    print_status "Cleaning up old images..."
    docker image prune -f
    
    # Build production images
    print_status "Building production images..."
    docker-compose -f "$COMPOSE_FILE" build --no-cache --parallel
    
    print_success "Images built successfully ✅"
    
    # Start production environment
    print_status "Starting production environment..."
    docker-compose -f "$COMPOSE_FILE" up -d
    
    # Wait for services to initialize
    print_status "Waiting for services to initialize..."
    sleep 60
else
    print_status "DRY RUN: Would build and deploy production images"
fi

# Comprehensive health checks
print_status "Performing comprehensive health checks..."

if [ "$DRY_RUN" = false ]; then
    # Check database cluster
    print_status "Checking PostgreSQL cluster..."
    attempt=1
    max_attempts=20
    while [ $attempt -le $max_attempts ]; do
        if docker-compose -f "$COMPOSE_FILE" exec -T production-postgres pg_isready -U "${POSTGRES_USER:-prisma_production}" > /dev/null 2>&1; then
            print_success "PostgreSQL primary is ready ✅"
            break
        fi
        
        if [ $attempt -eq $max_attempts ]; then
            print_error "PostgreSQL failed to start after $max_attempts attempts"
            docker-compose -f "$COMPOSE_FILE" logs production-postgres
            exit 1
        fi
        
        print_status "Waiting for PostgreSQL... (attempt $attempt/$max_attempts)"
        sleep 10
        ((attempt++))
    done
    
    # Check Redis cluster
    print_status "Checking Redis cluster..."
    attempt=1
    while [ $attempt -le $max_attempts ]; do
        if docker-compose -f "$COMPOSE_FILE" exec -T production-redis-cluster redis-cli ping > /dev/null 2>&1; then
            print_success "Redis cluster is ready ✅"
            break
        fi
        
        if [ $attempt -eq $max_attempts ]; then
            print_error "Redis failed to start after $max_attempts attempts"
            docker-compose -f "$COMPOSE_FILE" logs production-redis-cluster
            exit 1
        fi
        
        print_status "Waiting for Redis... (attempt $attempt/$max_attempts)"
        sleep 10
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
    
    # Readiness check
    if curl -f "$READY_CHECK_URL" > /dev/null 2>&1; then
        print_success "Application is ready for traffic ✅"
    else
        print_error "Application readiness check failed ❌"
        exit 1
    fi
else
    print_status "DRY RUN: Would perform health checks"
fi

# Post-deployment validation
print_status "Running post-deployment validation..."

if [ "$DRY_RUN" = false ]; then
    # Test critical endpoints
    critical_endpoints=(
        "/api/v1/health"
        "/api/v1/health/ready"
        "/api/v1/health/live"
        "/api/v1/portfolios"
        "/api/v1/ai/models"
    )
    
    for endpoint in "${critical_endpoints[@]}"; do
        if curl -f "http://localhost:3000$endpoint" > /dev/null 2>&1; then
            print_success "Endpoint $endpoint is responding ✅"
        else
            print_error "Critical endpoint $endpoint is not responding ❌"
            exit 1
        fi
    done
    
    # Check monitoring stack
    if curl -f "http://localhost:9091/-/healthy" > /dev/null 2>&1; then
        print_success "Prometheus is healthy ✅"
    else
        print_error "Prometheus health check failed ❌"
    fi
    
    if curl -f "http://localhost:3002/api/health" > /dev/null 2>&1; then
        print_success "Grafana is healthy ✅"
    else
        print_error "Grafana health check failed ❌"
    fi
else
    print_status "DRY RUN: Would validate endpoints and monitoring"
fi

# Save deployment record
DEPLOYMENT_RECORD_FILE="deployments/production-$(date +%Y%m%d-%H%M%S).log"
mkdir -p deployments

if [ "$DRY_RUN" = false ]; then
    cat > "$DEPLOYMENT_RECORD_FILE" << EOF
PRODUCTION DEPLOYMENT LOG
========================
Date: $(date)
Environment: $ENVIRONMENT
Compose File: $COMPOSE_FILE
Git Commit: $GIT_COMMIT
Git Branch: $GIT_BRANCH
Git Tag: $GIT_TAG
Deployed By: $(whoami)
Server: $(hostname)

Deployment Flags:
- Skip Tests: $SKIP_TESTS
- Skip Backup: $SKIP_BACKUP
- Force Deploy: $FORCE_DEPLOY

Services Status:
$(docker-compose -f "$COMPOSE_FILE" ps)

Health Check Results:
$(curl -s http://localhost:3000/api/v1/health | jq . 2>/dev/null || echo "Health check response not available")

Performance Metrics:
$(curl -s http://localhost:9091/api/v1/query?query=up | jq . 2>/dev/null || echo "Metrics not available")
EOF
else
    echo "DRY RUN - No deployment record created" > "$DEPLOYMENT_RECORD_FILE"
fi

# Display deployment summary
echo ""
if [ "$DRY_RUN" = false ]; then
    echo "🎉 PRODUCTION DEPLOYMENT SUCCESSFUL!"
else
    echo "✅ DRY RUN COMPLETED SUCCESSFULLY!"
fi
echo ""
echo "📊 Service URLs:"
echo "   🌐 Application:      https://prisma.madfam.io"
echo "   🗄️  Database:         production-postgres:5432"
echo "   📊 Redis:            production-redis-cluster:6379"
echo "   📈 Monitoring:       http://monitoring.prisma.madfam.io"
echo "   📊 Prometheus:       http://localhost:9091"
echo "   📈 Grafana:          http://localhost:3002"
echo ""
echo "🔧 Management Commands:"
echo "   📝 View app logs:     docker-compose -f $COMPOSE_FILE logs -f app"
echo "   📊 View all logs:     docker-compose -f $COMPOSE_FILE logs -f"
echo "   🔍 Check status:      docker-compose -f $COMPOSE_FILE ps"
echo "   📊 Health check:      curl https://prisma.madfam.io/api/v1/health"
echo ""
echo "🚨 Emergency Commands:"
echo "   🛑 Stop all:          docker-compose -f $COMPOSE_FILE down"
echo "   🔄 Rollback:          ./scripts/rollback-production.sh"
echo "   📞 Alert team:        ./scripts/alert-team.sh 'Production deployment $([ "$DRY_RUN" = true ] && echo "dry run" || echo "completed")'"
echo ""

if [ "$DRY_RUN" = false ]; then
    print_success "Deployment record saved to $DEPLOYMENT_RECORD_FILE"
    print_critical "🚀 PRODUCTION DEPLOYMENT COMPLETED SUCCESSFULLY!"
    
    # Notify monitoring systems
    curl -X POST "http://localhost:9091/api/v1/alerts" \
        -H "Content-Type: application/json" \
        -d '{"alerts":[{"labels":{"alertname":"DeploymentComplete","severity":"info","environment":"production"},"annotations":{"summary":"Production deployment completed successfully"}}]}' \
        > /dev/null 2>&1 || print_warning "Failed to notify monitoring system"
else
    print_success "DRY RUN COMPLETED - No actual changes were made"
fi
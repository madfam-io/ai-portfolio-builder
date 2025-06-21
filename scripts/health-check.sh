#!/bin/bash

#!/bin/bash
# MADFAM Code Available License (MCAL) v1.0
# Copyright (c) 2025-present MADFAM. All rights reserved.
# Commercial use prohibited except by MADFAM and licensed partners.
# For licensing: licensing@madfam.com


# Universal Health Check Script for All Environments
set -e

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

# Default configuration
ENVIRONMENT="local"
APP_URL="http://localhost:3000"
TIMEOUT=10
VERBOSE=false
JSON_OUTPUT=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -u|--url)
            APP_URL="$2"
            shift 2
            ;;
        -t|--timeout)
            TIMEOUT="$2"
            shift 2
            ;;
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        -j|--json)
            JSON_OUTPUT=true
            shift
            ;;
        -h|--help)
            echo "Universal Health Check Script"
            echo ""
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  -e, --environment ENV   Environment to check (local, staging, production)"
            echo "  -u, --url URL          Base URL to check (default: http://localhost:3000)"
            echo "  -t, --timeout SECONDS  Timeout for each check (default: 10)"
            echo "  -v, --verbose          Show detailed output"
            echo "  -j, --json             Output results in JSON format"
            echo "  -h, --help             Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0                                    # Check local environment"
            echo "  $0 -e staging -u http://staging.example.com"
            echo "  $0 -e production -u https://example.com -j"
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            echo "Use -h or --help for usage information"
            exit 1
            ;;
    esac
done

# Set environment-specific configurations
case $ENVIRONMENT in
    local)
        COMPOSE_FILE="docker-compose.dev.yml"
        DB_PORT=5432
        REDIS_PORT=6379
        ;;
    staging)
        COMPOSE_FILE="docker-compose.staging.yml"
        DB_PORT=5433
        REDIS_PORT=6380
        if [[ "$APP_URL" == "http://localhost:3000" ]]; then
            APP_URL="http://localhost:3000"  # staging still on localhost for now
        fi
        ;;
    production)
        COMPOSE_FILE="docker-compose.production.yml"
        DB_PORT=5434
        REDIS_PORT=6381
        if [[ "$APP_URL" == "http://localhost:3000" ]]; then
            APP_URL="https://prisma.madfam.io"
        fi
        ;;
    *)
        print_error "Unknown environment: $ENVIRONMENT"
        print_error "Supported environments: local, staging, production"
        exit 1
        ;;
esac

# Initialize results
RESULTS=()
OVERALL_STATUS="healthy"
CHECKS_PASSED=0
CHECKS_FAILED=0
CHECKS_WARNING=0

# Function to add result
add_result() {
    local service="$1"
    local status="$2"
    local message="$3"
    local response_time="$4"
    
    RESULTS+=("{\"service\":\"$service\",\"status\":\"$status\",\"message\":\"$message\",\"response_time\":\"${response_time:-0}ms\"}")
    
    case $status in
        "healthy")
            CHECKS_PASSED=$((CHECKS_PASSED + 1))
            ;;
        "degraded")
            CHECKS_WARNING=$((CHECKS_WARNING + 1))
            if [[ "$OVERALL_STATUS" == "healthy" ]]; then
                OVERALL_STATUS="degraded"
            fi
            ;;
        "unhealthy")
            CHECKS_FAILED=$((CHECKS_FAILED + 1))
            OVERALL_STATUS="unhealthy"
            ;;
    esac
}

# Function to check HTTP endpoint
check_http_endpoint() {
    local name="$1"
    local url="$2"
    local expected_status="${3:-200}"
    
    if [[ "$VERBOSE" == "true" ]]; then
        print_status "Checking $name at $url..."
    fi
    
    local start_time=$(date +%s%3N)
    local http_code
    local response_time
    
    http_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time "$TIMEOUT" "$url" 2>/dev/null || echo "000")
    local end_time=$(date +%s%3N)
    response_time=$((end_time - start_time))
    
    if [[ "$http_code" == "$expected_status" ]]; then
        add_result "$name" "healthy" "HTTP $http_code - OK" "$response_time"
        if [[ "$VERBOSE" == "true" ]]; then
            print_success "$name is healthy (${response_time}ms)"
        fi
    else
        add_result "$name" "unhealthy" "HTTP $http_code - Expected $expected_status" "$response_time"
        if [[ "$VERBOSE" == "true" ]]; then
            print_error "$name is unhealthy (HTTP $http_code)"
        fi
    fi
}

# Function to check Docker service
check_docker_service() {
    local service_name="$1"
    local container_name="$2"
    
    if [[ "$VERBOSE" == "true" ]]; then
        print_status "Checking Docker service: $service_name..."
    fi
    
    if docker-compose -f "$COMPOSE_FILE" ps "$container_name" 2>/dev/null | grep -q "Up"; then
        # Check if service is responding
        local health_status=$(docker-compose -f "$COMPOSE_FILE" ps "$container_name" --format "table {{.State}}" | tail -n +2)
        if [[ "$health_status" == *"healthy"* ]] || [[ "$health_status" == "Up" ]]; then
            add_result "$service_name" "healthy" "Container running and healthy"
            if [[ "$VERBOSE" == "true" ]]; then
                print_success "$service_name container is healthy"
            fi
        else
            add_result "$service_name" "degraded" "Container running but not healthy"
            if [[ "$VERBOSE" == "true" ]]; then
                print_warning "$service_name container is running but not healthy"
            fi
        fi
    else
        add_result "$service_name" "unhealthy" "Container not running"
        if [[ "$VERBOSE" == "true" ]]; then
            print_error "$service_name container is not running"
        fi
    fi
}

# Function to check database connectivity
check_database() {
    local db_name="$1"
    local port="$2"
    
    if [[ "$VERBOSE" == "true" ]]; then
        print_status "Checking database connectivity on port $port..."
    fi
    
    if nc -z localhost "$port" 2>/dev/null; then
        add_result "$db_name" "healthy" "Database accepting connections on port $port"
        if [[ "$VERBOSE" == "true" ]]; then
            print_success "$db_name is accepting connections"
        fi
    else
        add_result "$db_name" "unhealthy" "Database not accepting connections on port $port"
        if [[ "$VERBOSE" == "true" ]]; then
            print_error "$db_name is not accepting connections"
        fi
    fi
}

# Function to check Redis
check_redis() {
    local port="$1"
    
    if [[ "$VERBOSE" == "true" ]]; then
        print_status "Checking Redis on port $port..."
    fi
    
    if nc -z localhost "$port" 2>/dev/null; then
        add_result "Redis" "healthy" "Redis accepting connections on port $port"
        if [[ "$VERBOSE" == "true" ]]; then
            print_success "Redis is accepting connections"
        fi
    else
        add_result "Redis" "degraded" "Redis not accepting connections (fallback to memory cache)"
        if [[ "$VERBOSE" == "true" ]]; then
            print_warning "Redis is not available (using memory cache fallback)"
        fi
    fi
}

# Start health checks
if [[ "$JSON_OUTPUT" == "false" ]]; then
    echo "🏥 Health Check Report - Environment: $ENVIRONMENT"
    echo "🌐 Base URL: $APP_URL"
    echo "⏰ Timestamp: $(date)"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
fi

# Check core application endpoints
check_http_endpoint "Health Check" "$APP_URL/api/v1/health" "200"
check_http_endpoint "Readiness Check" "$APP_URL/api/v1/health/ready" "200"
check_http_endpoint "Liveness Check" "$APP_URL/api/v1/health/live" "200"

# Check API endpoints
check_http_endpoint "AI Models API" "$APP_URL/api/v1/ai/models" "200"
check_http_endpoint "Portfolios API" "$APP_URL/api/v1/portfolios" "200"

# Check main application routes
check_http_endpoint "Landing Page" "$APP_URL/" "200"
check_http_endpoint "Dashboard" "$APP_URL/dashboard" "200"

# Check Docker services (if available)
if command -v docker-compose &> /dev/null && [ -f "$COMPOSE_FILE" ]; then
    case $ENVIRONMENT in
        local)
            check_docker_service "App Container" "app"
            check_docker_service "PostgreSQL" "postgres"
            check_docker_service "Redis" "redis"
            ;;
        staging)
            check_docker_service "App Container" "app"
            check_docker_service "PostgreSQL" "staging-postgres"
            check_docker_service "Redis" "staging-redis"
            check_docker_service "Prometheus" "staging-prometheus"
            check_docker_service "Grafana" "staging-grafana"
            ;;
        production)
            check_docker_service "App Container" "app"
            check_docker_service "PostgreSQL Primary" "production-postgres"
            check_docker_service "PostgreSQL Replica" "production-postgres-replica"
            check_docker_service "Redis Cluster" "production-redis-cluster"
            check_docker_service "Prometheus" "production-prometheus"
            check_docker_service "Grafana" "production-grafana"
            ;;
    esac
fi

# Check database connectivity
check_database "PostgreSQL" "$DB_PORT"

# Check Redis connectivity
check_redis "$REDIS_PORT"

# Check monitoring endpoints (if available)
if [[ "$ENVIRONMENT" != "local" ]]; then
    case $ENVIRONMENT in
        staging)
            check_http_endpoint "Prometheus" "http://localhost:9090/-/healthy" "200"
            check_http_endpoint "Grafana" "http://localhost:3001/api/health" "200"
            ;;
        production)
            check_http_endpoint "Prometheus" "http://localhost:9091/-/healthy" "200"
            check_http_endpoint "Grafana" "http://localhost:3002/api/health" "200"
            ;;
    esac
fi

# Generate output
if [[ "$JSON_OUTPUT" == "true" ]]; then
    # JSON output
    echo "{"
    echo "  \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\","
    echo "  \"environment\": \"$ENVIRONMENT\","
    echo "  \"base_url\": \"$APP_URL\","
    echo "  \"overall_status\": \"$OVERALL_STATUS\","
    echo "  \"summary\": {"
    echo "    \"total_checks\": $((CHECKS_PASSED + CHECKS_WARNING + CHECKS_FAILED)),"
    echo "    \"passed\": $CHECKS_PASSED,"
    echo "    \"warnings\": $CHECKS_WARNING,"
    echo "    \"failed\": $CHECKS_FAILED"
    echo "  },"
    echo "  \"checks\": ["
    
    local first=true
    for result in "${RESULTS[@]}"; do
        if [[ "$first" == "true" ]]; then
            first=false
        else
            echo ","
        fi
        echo "    $result"
    done
    
    echo "  ]"
    echo "}"
else
    # Human-readable output
    echo ""
    echo "📊 Summary:"
    echo "   ✅ Passed: $CHECKS_PASSED"
    echo "   ⚠️  Warnings: $CHECKS_WARNING"
    echo "   ❌ Failed: $CHECKS_FAILED"
    echo "   🏥 Overall Status: $OVERALL_STATUS"
    echo ""
    
    if [[ "$OVERALL_STATUS" == "healthy" ]]; then
        print_success "All systems are healthy! 🎉"
    elif [[ "$OVERALL_STATUS" == "degraded" ]]; then
        print_warning "System is operational but some services are degraded ⚠️"
    else
        print_error "System has critical issues that need attention! 🚨"
    fi
    
    if [[ "$VERBOSE" == "false" && "$CHECKS_FAILED" -gt 0 ]]; then
        echo ""
        echo "💡 Run with -v or --verbose for detailed information"
    fi
fi

# Exit with appropriate code
case $OVERALL_STATUS in
    "healthy")
        exit 0
        ;;
    "degraded")
        exit 1
        ;;
    "unhealthy")
        exit 2
        ;;
esac
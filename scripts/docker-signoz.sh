#!/bin/bash

#!/bin/bash
# MADFAM Code Available License (MCAL) v1.0
# Copyright (c) 2025-present MADFAM. All rights reserved.
# Commercial use prohibited except by MADFAM and licensed partners.
# For licensing: licensing@madfam.com


# Docker SigNoz Management Script
# Manages SigNoz APM stack for development

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[SigNoz]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if Docker is running
check_docker() {
    if ! docker info >/dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker first."
        exit 1
    fi
}

# Function to create necessary config files
create_configs() {
    print_status "Creating SigNoz configuration files..."
    
    # Create prometheus.yml
    if [ ! -f "prometheus.yml" ]; then
        cat > prometheus.yml << 'EOF'
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'signoz'
    static_configs:
      - targets: ['localhost:8080']
EOF
    fi
    
    # Create ClickHouse configs
    if [ ! -f "clickhouse-config.xml" ]; then
        cat > clickhouse-config.xml << 'EOF'
<clickhouse>
    <listen_host>0.0.0.0</listen_host>
    <http_port>8123</http_port>
    <tcp_port>9000</tcp_port>
    <max_connections>4096</max_connections>
    <keep_alive_timeout>3</keep_alive_timeout>
    <max_concurrent_queries>100</max_concurrent_queries>
</clickhouse>
EOF
    fi
    
    if [ ! -f "clickhouse-users.xml" ]; then
        cat > clickhouse-users.xml << 'EOF'
<clickhouse>
    <users>
        <admin>
            <password>27ff0399-0d3a-4bd8-919d-17c2181e6fb9</password>
            <networks>
                <ip>::/0</ip>
            </networks>
            <profile>default</profile>
            <quota>default</quota>
        </admin>
    </users>
</clickhouse>
EOF
    fi
}

# Function to start SigNoz
start_signoz() {
    print_status "Starting SigNoz APM stack..."
    
    create_configs
    
    # Start SigNoz services
    docker-compose -f docker-compose.signoz.yml up -d
    
    print_status "Waiting for services to be ready..."
    sleep 10
    
    # Check service health
    if docker-compose -f docker-compose.signoz.yml ps | grep -q "unhealthy"; then
        print_warning "Some services may not be healthy yet. Checking again in 20 seconds..."
        sleep 20
    fi
    
    print_status "SigNoz is starting up!"
    print_status "Access points:"
    echo "  - SigNoz UI: http://localhost:3301"
    echo "  - Query Service: http://localhost:8080"
    echo "  - OTLP HTTP: http://localhost:4318"
    echo "  - OTLP gRPC: localhost:4317"
}

# Function to stop SigNoz
stop_signoz() {
    print_status "Stopping SigNoz APM stack..."
    docker-compose -f docker-compose.signoz.yml down
}

# Function to view logs
view_logs() {
    print_status "Viewing SigNoz logs..."
    docker-compose -f docker-compose.signoz.yml logs -f
}

# Function to restart services
restart_signoz() {
    stop_signoz
    sleep 2
    start_signoz
}

# Function to clean up data
clean_data() {
    print_warning "This will delete all SigNoz data. Are you sure? (y/N)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        stop_signoz
        print_status "Removing SigNoz volumes..."
        docker volume rm ai-portfolio-builder_clickhouse-data ai-portfolio-builder_alertmanager-data ai-portfolio-builder_signoz-data ai-portfolio-builder_otel-data 2>/dev/null || true
        print_status "SigNoz data cleaned."
    else
        print_status "Cleanup cancelled."
    fi
}

# Function to show status
show_status() {
    print_status "SigNoz service status:"
    docker-compose -f docker-compose.signoz.yml ps
}

# Main script logic
check_docker

case "${1:-start}" in
    start)
        start_signoz
        ;;
    stop)
        stop_signoz
        ;;
    restart)
        restart_signoz
        ;;
    logs)
        view_logs
        ;;
    status)
        show_status
        ;;
    clean)
        clean_data
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|logs|status|clean}"
        echo ""
        echo "Commands:"
        echo "  start   - Start SigNoz APM stack"
        echo "  stop    - Stop SigNoz APM stack"
        echo "  restart - Restart SigNoz APM stack"
        echo "  logs    - View SigNoz logs"
        echo "  status  - Show service status"
        echo "  clean   - Remove all SigNoz data"
        exit 1
        ;;
esac
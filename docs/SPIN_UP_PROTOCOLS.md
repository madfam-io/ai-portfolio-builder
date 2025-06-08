# 🚀 MADFAM AI Portfolio Builder - Spin Up/Down Protocols

> Last Updated: January 2025

This document provides comprehensive instructions for spinning up and shutting down the MADFAM AI Portfolio Builder across all environments.

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Local Development](#local-development)
3. [Staging Environment](#staging-environment)
4. [Production Environment](#production-environment)
5. [Troubleshooting](#troubleshooting)
6. [Health Checks](#health-checks)

---

## 🚀 Quick Start

### Spin Up (One Command)

```bash
./scripts/docker-dev.sh
```

### Access Points

- 🌐 **Application**: http://localhost:3000
- 🗄️ **pgAdmin**: http://localhost:5050 (admin@madfam.io / admin)
- 📊 **PostgreSQL**: localhost:5432
- 🔴 **Redis**: localhost:6379

### Spin Down

```bash
docker-compose -f docker-compose.dev.yml down
```

---

## 💻 Local Development

### Prerequisites

- Docker Desktop installed and running
- Docker Compose v2.22+
- Git repository cloned
- 8GB RAM available
- Ports 3000, 5432, 5050, 6379 available

### Spin Up Process

#### 1. Initial Setup (First Time Only)

```bash
# Clone repository
git clone https://github.com/madfam-io/ai-portfolio-builder.git
cd ai-portfolio-builder

# Create environment file
cp .env.example .env.local
# Edit .env.local with your API keys (optional for basic development)
```

#### 2. Start Services

**Option A: Automated Script (Recommended)**

```bash
./scripts/docker-dev.sh
```

**Option B: Manual Docker Commands**

```bash
# Build images
docker-compose -f docker-compose.dev.yml build

# Start all services
docker-compose -f docker-compose.dev.yml up -d

# Wait for services to be ready
sleep 10

# Verify services are running
docker-compose -f docker-compose.dev.yml ps
```

#### 3. Verify Services

```bash
# Check container status
docker ps

# View application logs
docker logs ai-portfolio-builder-app-1 -f

# Test application
curl http://localhost:3000
```

### Spin Down Process

#### Complete Shutdown

```bash
# Stop and remove containers
docker-compose -f docker-compose.dev.yml down

# Remove volumes (WARNING: Deletes all data)
docker-compose -f docker-compose.dev.yml down -v

# Remove images (for clean rebuild)
docker-compose -f docker-compose.dev.yml down --rmi all
```

#### Partial Shutdown

```bash
# Stop specific service
docker-compose -f docker-compose.dev.yml stop app

# Restart specific service
docker-compose -f docker-compose.dev.yml restart app

# View logs for debugging
docker-compose -f docker-compose.dev.yml logs -f app
```

### Service Management

#### Individual Service Commands

```bash
# PostgreSQL Management
docker exec -it ai-portfolio-builder-postgres-1 psql -U postgres -d portfolio_builder

# Redis CLI
docker exec -it ai-portfolio-builder-redis-1 redis-cli

# App Shell Access
docker exec -it ai-portfolio-builder-app-1 sh

# pgAdmin Access
# Open browser to http://localhost:5050
# Login: admin@madfam.io / admin
# Add server: Host: postgres, Port: 5432, Username: postgres, Password: postgres
```

#### Database Operations

```bash
# Backup database
docker exec ai-portfolio-builder-postgres-1 pg_dump -U postgres portfolio_builder > backup.sql

# Restore database
docker exec -i ai-portfolio-builder-postgres-1 psql -U postgres portfolio_builder < backup.sql

# Reset database
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml up -d
```

---

## 🔧 Staging Environment

### Prerequisites

- Access to staging infrastructure
- Staging environment variables
- VPN access (if required)

### Spin Up Process

#### 1. Environment Setup

```bash
# Use staging environment file
cp .env.staging .env

# Verify staging configuration
cat docker-compose.staging.yml
```

#### 2. Deploy to Staging

```bash
# Build with staging configuration
docker-compose -f docker-compose.staging.yml build

# Deploy services
docker-compose -f docker-compose.staging.yml up -d

# Run database migrations
docker-compose -f docker-compose.staging.yml exec app pnpm supabase:migrate
```

#### 3. Health Checks

```bash
# Check service health
docker-compose -f docker-compose.staging.yml ps

# Run smoke tests
docker-compose -f docker-compose.staging.yml exec app pnpm test:e2e:staging
```

### Spin Down Process

```bash
# Graceful shutdown
docker-compose -f docker-compose.staging.yml down

# Emergency shutdown
docker-compose -f docker-compose.staging.yml kill
```

---

## 🏭 Production Environment

### Prerequisites

- Production deployment credentials
- SSL certificates configured
- Monitoring tools access
- Backup procedures in place

### Spin Up Process

#### 1. Pre-deployment Checks

```bash
# Verify production readiness
./scripts/pre-deploy-check.sh

# Check current version
git describe --tags --always

# Verify environment variables
./scripts/verify-env.sh production
```

#### 2. Production Deployment

**Using Vercel (Recommended)**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to production
vercel --prod

# Monitor deployment
vercel logs --prod
```

**Using Docker (Self-hosted)**

```bash
# Build production image
docker build -f Dockerfile -t madfam/portfolio-builder:latest .

# Push to registry
docker push madfam/portfolio-builder:latest

# Deploy via orchestration (Kubernetes example)
kubectl apply -f k8s/production/

# Verify deployment
kubectl get pods -n production
kubectl get services -n production
```

#### 3. Post-deployment

```bash
# Run health checks
curl https://api.madfam.io/health

# Check metrics
curl https://api.madfam.io/metrics

# Monitor logs
kubectl logs -f deployment/portfolio-builder -n production
```

### Spin Down Process

#### Maintenance Mode

```bash
# Enable maintenance mode
kubectl apply -f k8s/maintenance.yaml

# Perform maintenance
# ...

# Disable maintenance mode
kubectl delete -f k8s/maintenance.yaml
```

#### Emergency Shutdown

```bash
# Scale down to 0 replicas
kubectl scale deployment portfolio-builder --replicas=0 -n production

# Full shutdown (CAUTION)
kubectl delete deployment portfolio-builder -n production
```

---

## 🩺 Health Checks

### Local Environment

```bash
# Application health
curl http://localhost:3000/api/health

# Database connectivity
docker exec ai-portfolio-builder-app-1 curl http://localhost:3000/api/health/db

# Redis connectivity
docker exec ai-portfolio-builder-redis-1 redis-cli ping

# Container health
docker inspect ai-portfolio-builder-app-1 | jq '.[0].State.Health'
```

### Monitoring Commands

```bash
# Resource usage
docker stats

# Container logs
docker-compose -f docker-compose.dev.yml logs -f --tail=100

# Network inspection
docker network inspect ai-portfolio-builder_dev-network

# Volume inspection
docker volume ls
docker volume inspect ai-portfolio-builder_postgres_dev_data
```

---

## 🔧 Troubleshooting

### Common Issues

#### Port Already in Use

```bash
# Find process using port
lsof -i :3000
kill -9 <PID>

# Or change port in docker-compose.yml
ports:
  - "3001:3000"
```

#### Container Won't Start

```bash
# Check logs
docker logs ai-portfolio-builder-app-1

# Rebuild from scratch
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml build --no-cache
docker-compose -f docker-compose.dev.yml up -d
```

#### Database Connection Issues

```bash
# Verify database is running
docker exec ai-portfolio-builder-postgres-1 pg_isready

# Check connection from app
docker exec ai-portfolio-builder-app-1 \
  psql postgresql://postgres:postgres@postgres:5432/portfolio_builder
```

#### Out of Disk Space

```bash
# Clean up Docker resources
docker system prune -a --volumes

# Check disk usage
docker system df
```

### Reset Everything

```bash
# Nuclear option - removes everything
docker-compose -f docker-compose.dev.yml down -v --rmi all
docker system prune -a --volumes -f
rm -rf node_modules .next
pnpm install
./scripts/docker-dev.sh
```

---

## 📊 Performance Optimization

### Development Environment

```bash
# Limit resource usage
docker-compose -f docker-compose.dev.yml up -d --scale app=1

# Use production build locally
docker-compose -f docker-compose.yml up -d
```

### Memory Management

```yaml
# Add to docker-compose.yml
services:
  app:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
```

---

## 🔐 Security Notes

1. **Never commit .env files** with real credentials
2. **Use secrets management** for production
3. **Rotate credentials regularly**
4. **Monitor access logs**
5. **Keep Docker images updated**

---

## 📝 Quick Reference

### Essential Commands

```bash
# Start
./scripts/docker-dev.sh

# Stop
docker-compose -f docker-compose.dev.yml down

# Restart
docker-compose -f docker-compose.dev.yml restart

# Logs
docker-compose -f docker-compose.dev.yml logs -f

# Shell access
docker exec -it ai-portfolio-builder-app-1 sh

# Database access
docker exec -it ai-portfolio-builder-postgres-1 psql -U postgres

# Clean everything
docker-compose -f docker-compose.dev.yml down -v --rmi all
```

### Service URLs

- **App**: http://localhost:3000
- **pgAdmin**: http://localhost:5050
- **API Health**: http://localhost:3000/api/health
- **Metrics**: http://localhost:3000/api/metrics (when implemented)

For additional help, see [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) or contact the development team.

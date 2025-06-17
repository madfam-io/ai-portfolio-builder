# 3-Tiered Deployment Guide

This guide covers the complete deployment process for the PRISMA AI Portfolio Builder across all three environments: Local Development, Staging, and Production.

## 🏗️ Environment Overview

| Environment    | Purpose                | URL                              | Database        | Redis      | Monitoring |
| -------------- | ---------------------- | -------------------------------- | --------------- | ---------- | ---------- |
| **Local**      | Development & Testing  | http://localhost:3000            | PostgreSQL:5432 | Redis:6379 | Basic      |
| **Staging**    | Pre-production Testing | https://staging.prisma.madfam.io | PostgreSQL:5433 | Redis:6380 | Full Stack |
| **Production** | Live Application       | https://prisma.madfam.io         | PostgreSQL:5434 | Redis:6381 | Enterprise |

## 📋 Prerequisites

### System Requirements

- **Docker & Docker Compose**: Latest stable versions
- **Node.js**: Version 18 or higher
- **pnpm**: Preferred package manager (npm also supported)
- **Git**: For version control

### Required Environment Files

```bash
.env.local      # Local development
.env.staging    # Staging environment
.env.production # Production environment
```

## 🏠 Local Development Deployment

### Quick Start

```bash
# Simple deployment
pnpm deploy:local

# Or step by step:
pnpm install
pnpm type-check
pnpm docker:dev:up
pnpm dev
```

### Manual Setup

```bash
# 1. Clone and setup
git clone <repository>
cd ai-portfolio-builder

# 2. Install dependencies
pnpm install

# 3. Configure environment
cp .env.example .env.local
# Edit .env.local with your API keys

# 4. Start services
./scripts/deploy-local.sh

# 5. Access services
# App: http://localhost:3000
# pgAdmin: http://localhost:5050
# PostgreSQL: localhost:5432
# Redis: localhost:6379
```

### Development Commands

```bash
# Health check
pnpm health:check

# View logs
pnpm docker:dev:logs

# Stop services
pnpm docker:dev:down

# Restart development server
pnpm dev:clean
```

## 🏗️ Staging Deployment

### Prerequisites

- Staging server with Docker installed
- `.env.staging` file configured
- SSL certificates (optional but recommended)

### Deployment Process

```bash
# 1. Prepare staging environment
cp .env.staging.example .env.staging
# Configure all staging-specific variables

# 2. Deploy to staging
pnpm deploy:staging

# 3. Verify deployment
pnpm health:check:staging
```

### Staging-Specific Configuration

```bash
# Environment variables to configure:
NODE_ENV=staging
NEXT_PUBLIC_ENVIRONMENT=staging
NEXT_PUBLIC_APP_URL=https://staging.prisma.madfam.io

# Database
POSTGRES_DB=prisma_staging
POSTGRES_USER=prisma_staging
POSTGRES_PASSWORD=<strong_password>

# Stripe (Test Mode)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Monitoring
APM_ENABLED=true
ENABLE_PERFORMANCE_MONITORING=true
```

### Staging Services

```bash
# Access URLs:
# App: http://localhost:3000 (or your staging domain)
# pgAdmin: http://localhost:5051
# Prometheus: http://localhost:9090
# Grafana: http://localhost:3001
# PostgreSQL: localhost:5433
# Redis: localhost:6380

# Management commands:
pnpm docker:staging:logs    # View logs
pnpm docker:staging:down    # Stop staging
pnpm docker:staging:up      # Start staging
```

## 🚀 Production Deployment

### Critical Prerequisites

- Production server with Docker Swarm or Kubernetes
- `.env.production` file with production secrets
- SSL certificates configured
- Backup strategy in place
- Monitoring alerts configured

### Pre-Deployment Checklist

- [ ] All tests passing
- [ ] Security audit completed
- [ ] Performance benchmarks met
- [ ] Database migrations ready
- [ ] Backup created
- [ ] Team notified
- [ ] Rollback plan prepared

### Production Deployment

```bash
# 1. Dry run (recommended)
pnpm deploy:production:dry-run

# 2. Full deployment
pnpm deploy:production

# 3. Emergency deployment (skip tests/backup)
./scripts/deploy-production.sh --skip-tests --skip-backup --force
```

### Production Configuration

```bash
# Critical environment variables:
NODE_ENV=production
NEXT_PUBLIC_ENVIRONMENT=production
NEXT_PUBLIC_APP_URL=https://prisma.madfam.io

# Stripe (Live Mode)
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

# Security
JWT_SECRET=<64_char_random_string>
CSRF_SECRET=<64_char_random_string>
ENCRYPTION_KEY=<64_char_random_string>

# Performance
REDIS_CLUSTER_ENABLED=true
BACKUP_ENABLED=true
RATE_LIMIT_ENABLED=true
```

### Production Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Load Balancer │    │   App Replicas  │    │   Monitoring    │
│    (Nginx)      │━━━▶│   (3x Next.js)  │━━━▶│  (Prometheus)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   PostgreSQL    │    │  Redis Cluster  │    │    Grafana      │
│   (Primary +    │    │  (Multi-node)   │    │  (Dashboards)   │
│    Replica)     │    └─────────────────┘    └─────────────────┘
└─────────────────┘
```

## 🔧 Environment Management

### Environment Variables

Each environment has specific configuration:

```bash
# Local (.env.local)
NODE_ENV=development
DEBUG=true
APM_ENABLED=false

# Staging (.env.staging)
NODE_ENV=staging
DEBUG=true
APM_ENABLED=true
EXPERIMENT_SAMPLING_RATE=1.0

# Production (.env.production)
NODE_ENV=production
DEBUG=false
APM_ENABLED=true
EXPERIMENT_SAMPLING_RATE=0.1
```

### Database Management

```bash
# Local: PostgreSQL on port 5432
# Staging: PostgreSQL on port 5433
# Production: PostgreSQL on port 5434 + replica

# Migration commands:
docker-compose -f docker-compose.dev.yml exec postgres psql -U postgres -d portfolio_builder
docker-compose -f docker-compose.staging.yml exec staging-postgres psql -U prisma_staging -d prisma_staging
docker-compose -f docker-compose.production.yml exec production-postgres psql -U prisma_production -d prisma_production
```

### Health Monitoring

```bash
# Universal health check
./scripts/health-check.sh -e <environment> -u <url>

# Environment-specific checks
pnpm health:check                    # Local
pnpm health:check:staging           # Staging
pnpm health:check:production        # Production

# JSON output for automation
pnpm health:check:json
```

## 🚨 Troubleshooting

### Common Issues

#### 1. Container Startup Failures

```bash
# Check logs
docker-compose -f docker-compose.<env>.yml logs <service>

# Restart specific service
docker-compose -f docker-compose.<env>.yml restart <service>

# Rebuild and restart
docker-compose -f docker-compose.<env>.yml up --build -d <service>
```

#### 2. Database Connection Issues

```bash
# Check PostgreSQL status
docker-compose -f docker-compose.<env>.yml exec <db-service> pg_isready

# Check database logs
docker-compose -f docker-compose.<env>.yml logs <db-service>

# Connect to database
docker-compose -f docker-compose.<env>.yml exec <db-service> psql -U <user> -d <database>
```

#### 3. Redis Connection Issues

```bash
# Check Redis status
docker-compose -f docker-compose.<env>.yml exec <redis-service> redis-cli ping

# Check Redis logs
docker-compose -f docker-compose.<env>.yml logs <redis-service>

# Connect to Redis
docker-compose -f docker-compose.<env>.yml exec <redis-service> redis-cli
```

#### 4. Health Check Failures

```bash
# Verbose health check
./scripts/health-check.sh -v -e <environment>

# Check specific endpoint
curl -v http://localhost:3000/api/v1/health

# Check application logs
docker-compose -f docker-compose.<env>.yml logs app
```

### Emergency Procedures

#### Production Rollback

```bash
# Stop current deployment
docker-compose -f docker-compose.production.yml down

# Restore from backup
# (Follow backup restoration procedure)

# Deploy previous version
git checkout <previous-tag>
pnpm deploy:production --skip-tests
```

#### Service Recovery

```bash
# Restart all services
docker-compose -f docker-compose.<env>.yml restart

# Restart specific service
docker-compose -f docker-compose.<env>.yml restart <service>

# Full reset (CAUTION: Data loss possible)
docker-compose -f docker-compose.<env>.yml down -v
docker-compose -f docker-compose.<env>.yml up -d
```

## 📊 Monitoring & Observability

### Metrics Access

- **Prometheus**: http://localhost:9090 (staging), http://localhost:9091 (production)
- **Grafana**: http://localhost:3001 (staging), http://localhost:3002 (production)
- **Health Checks**: Available at `/api/v1/health` endpoints

### Alert Configuration

Configure alerts for:

- Application health failures
- Database connection issues
- High response times (> 2s)
- Error rates (> 5%)
- Resource utilization (> 80%)

### Log Management

```bash
# View logs by service
docker-compose -f docker-compose.<env>.yml logs -f <service>

# View all logs
docker-compose -f docker-compose.<env>.yml logs -f

# Search logs
docker-compose -f docker-compose.<env>.yml logs | grep "ERROR"
```

## 🔐 Security Considerations

### Environment Security

- **Local**: Relaxed security for development
- **Staging**: Production-like security with test data
- **Production**: Maximum security with live data

### Key Management

- Use different secrets for each environment
- Rotate secrets regularly
- Store secrets securely (e.g., HashiCorp Vault)
- Never commit secrets to version control

### Network Security

- **Local**: Open access for development
- **Staging**: VPN or IP-restricted access
- **Production**: HTTPS only, strict firewall rules

## 📈 Performance Optimization

### Environment-Specific Optimizations

- **Local**: Fast rebuild, hot reloading, detailed debugging
- **Staging**: Production-like performance, full monitoring
- **Production**: Maximum performance, minimal resource usage

### Caching Strategy

- **Local**: In-memory cache only
- **Staging**: Redis with basic clustering
- **Production**: Redis cluster with persistence

### Resource Allocation

```yaml
# Production resource limits
services:
  app:
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: '0.5'
        reservations:
          memory: 512M
          cpus: '0.25'
```

## 🚀 Best Practices

### Deployment Workflow

1. **Develop** → Local environment
2. **Test** → Staging environment
3. **Deploy** → Production environment
4. **Monitor** → All environments

### Version Control

- Use semantic versioning
- Tag releases before production deployment
- Maintain deployment logs
- Document configuration changes

### Testing Strategy

- Unit tests in all environments
- Integration tests in staging
- E2E tests before production
- Performance tests in staging

### Backup Strategy

- **Local**: Git commits
- **Staging**: Daily automated backups
- **Production**: Automated backups + manual pre-deployment

---

This deployment guide ensures consistent, reliable deployments across all environments while maintaining security, performance, and observability standards.

# 🐳 Docker Setup Guide

This guide explains how to run the MADFAM AI Portfolio Builder using Docker for both development and production environments.

## 📋 Prerequisites

- [Docker](https://www.docker.com/get-started) (version 20.10 or higher)
- [Docker Compose](https://docs.docker.com/compose/install/) (usually included with Docker Desktop)

## 🏃‍♂️ Quick Start

### Development Environment

```bash
# 1. Clone and enter the repository
git clone https://github.com/madfam/ai-portfolio-builder.git
cd ai-portfolio-builder

# 2. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API keys

# 3. Start development environment
pnpm docker:dev

# 4. Access the application
# - App: http://localhost:3000
# - pgAdmin: http://localhost:5050 (admin@madfam.io / admin)
# - PostgreSQL: localhost:5432
# - Redis: localhost:6379
```

### Production Environment

```bash
# 1. Ensure .env.local has production values
# 2. Start production environment
pnpm docker:prod

# 3. Access the application at http://localhost:3000
```

## 🛠️ Available Commands

### Development Commands

```bash
# Start development environment
pnpm docker:dev

# Start services manually
pnpm docker:dev:up

# Stop services
pnpm docker:dev:down

# View logs
pnpm docker:dev:logs

# Shell into app container
docker-compose -f docker-compose.dev.yml exec app sh
```

### Production Commands

```bash
# Start production environment
pnpm docker:prod

# Start services manually
pnpm docker:prod:up

# Stop services
pnpm docker:prod:down

# View logs
pnpm docker:prod:logs

# Shell into app container
docker-compose exec app sh
```

## 🏗️ Architecture

### Development Stack

- **Next.js App**: Development server with hot reload
- **PostgreSQL**: Local database for development
- **Redis**: Caching layer
- **pgAdmin**: Database management UI

### Production Stack

- **Next.js App**: Optimized production build
- **PostgreSQL**: Production database
- **Redis**: Caching layer

## 🔧 Configuration

### Environment Variables

The application requires several environment variables. Copy `.env.example` to `.env.local` and configure:

```env
# Essential Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=your_openai_api_key
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Database (for local development)
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/portfolio_builder

# Redis
REDIS_URL=redis://redis:6379
```

### Docker Compose Services

#### Development (`docker-compose.dev.yml`)

- `app`: Next.js development server with hot reload
- `postgres`: PostgreSQL 15 database
- `redis`: Redis cache
- `pgadmin`: Database management interface

#### Production (`docker-compose.yml`)

- `app`: Optimized Next.js production build
- `postgres`: PostgreSQL 15 database
- `redis`: Redis cache

## 🗃️ Database Management

### Using pgAdmin (Development)

1. Access http://localhost:5050
2. Login: `admin@madfam.io` / `admin`
3. Add server:
   - Host: `postgres`
   - Port: `5432`
   - Database: `portfolio_builder`
   - Username: `postgres`
   - Password: `postgres`

### Direct PostgreSQL Access

```bash
# Connect to PostgreSQL container
docker-compose -f docker-compose.dev.yml exec postgres psql -U postgres -d portfolio_builder
```

## 🐛 Troubleshooting

### Common Issues

#### Port Already in Use

```bash
# Check what's using the port
lsof -i :3000

# Stop conflicting services
docker-compose -f docker-compose.dev.yml down
```

#### Database Connection Issues

```bash
# Check if PostgreSQL is running
docker-compose -f docker-compose.dev.yml ps postgres

# View PostgreSQL logs
docker-compose -f docker-compose.dev.yml logs postgres

# Reset database
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml up -d
```

#### Build Issues

```bash
# Clean build cache
docker system prune -a

# Rebuild from scratch
docker-compose -f docker-compose.dev.yml build --no-cache
```

### Performance Optimization

#### Docker Resources

- Ensure Docker has adequate memory (4GB+ recommended)
- Enable Docker Desktop's experimental features for better performance

#### Volume Mounts

- Development uses bind mounts for hot reload
- Production uses optimized image layers

## 🔄 CI/CD Integration

The Docker setup is designed to work with various CI/CD platforms:

```bash
# Build production image
docker build -t madfam/ai-portfolio-builder .

# Run tests in container
docker run --rm madfam/ai-portfolio-builder pnpm test

# Health check
curl http://localhost:3000/api/health
```

## 📊 Monitoring

### Container Health

```bash
# Check service status
docker-compose ps

# Monitor resource usage
docker stats

# View all logs
docker-compose logs -f
```

### Application Metrics

- Application logs: `docker-compose logs app`
- Database logs: `docker-compose logs postgres`
- Redis logs: `docker-compose logs redis`

## 🚀 Deployment

For production deployment, see [DEPLOYMENT.md](./DEPLOYMENT.md) for platform-specific instructions:

- Vercel (recommended)
- Railway
- DigitalOcean App Platform
- AWS ECS
- Google Cloud Run

## 📝 Notes

- The development environment includes hot reload and debugging tools
- Production build is optimized for performance and security
- All data is persisted in Docker volumes
- Environment variables are loaded from `.env.local`

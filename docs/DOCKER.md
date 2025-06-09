# 🐳 Docker Setup Guide

This guide explains how to run the MADFAM AI Portfolio Builder using Docker for both development and production environments.

> **Current Status**: Foundation Development Phase - Complete Docker environment with PostgreSQL, Redis, and pgAdmin for development and production deployment readiness.

## 📋 Prerequisites

- [Docker](https://www.docker.com/get-started) (version 20.10 or higher)
- [Docker Compose](https://docs.docker.com/compose/install/) (usually included with Docker Desktop)

## 🏃‍♂️ Quick Start

### Development Environment

```bash
# 1. Clone and enter the repository
git clone https://github.com/madfam/ai-portfolio-builder.git
cd ai-portfolio-builder

# 2. Start development environment (one command setup)
./scripts/docker-dev.sh

# Or use npm/pnpm scripts:
pnpm docker:dev

# 3. Access the application
# 🌐 App: http://localhost:3000 (with multilanguage support)
# 🗄️ pgAdmin: http://localhost:5050 (admin@madfam.io / admin)
# 📊 Database: localhost:5432
# 🔴 Redis: localhost:6379
```

**Current Features Available:**

- ✅ Multilanguage landing page (Spanish/English)
- ✅ Responsive design with dark mode
- ✅ Component-based architecture
- ✅ Hot reload development environment
- ✅ Database and Redis containers ready for future features

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

**Current Status**: For the foundation phase (landing page), environment variables are optional. The application will run with defaults.

```env
# Basic Development Configuration (Optional)
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Future: Database Configuration (when implementing SaaS features)
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/portfolio_builder

# Future: Redis Configuration (when implementing caching)
REDIS_URL=redis://redis:6379

# Future: AI Services (when implementing AI features)
DEEPSEEK_API_KEY=your_deepseek_api_key
HUGGINGFACE_API_KEY=your_huggingface_token

# Future: Supabase Configuration (when implementing auth/database)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**Quick Start**: No environment file needed - just run `./scripts/docker-dev.sh`

### Docker Compose Services

#### Development (`docker-compose.dev.yml`) ✅ Implemented

- **`app`**: Next.js 14 development server with hot reload and multilanguage support
- **`postgres`**: PostgreSQL 15 database (ready for future features)
- **`redis`**: Redis 7 cache (ready for future features)
- **`pgadmin`**: Database management interface at localhost:5050

#### Production (`docker-compose.yml`) 🔄 Ready

- **`app`**: Optimized Next.js production build
- **`postgres`**: PostgreSQL 15 database with persistence
- **`redis`**: Redis cache with data persistence

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

# Type checking
docker run --rm madfam/ai-portfolio-builder pnpm type-check

# Linting
docker run --rm madfam/ai-portfolio-builder pnpm lint

# Health check (foundation phase)
curl http://localhost:3000

# Future: API health check (when implementing API routes)
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

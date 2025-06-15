# 🏗️ PRISMA Architecture Overview

## 📋 Table of Contents

- [System Architecture](#system-architecture)
- [Frontend Architecture](#frontend-architecture)
- [Backend Architecture](#backend-architecture)
- [Data Flow](#data-flow)
- [Security Architecture](#security-architecture)
- [Infrastructure](#infrastructure)
- [Architecture Decision Records](#architecture-decision-records)

## 🎯 System Architecture

PRISMA follows a modern, scalable architecture designed for rapid development and future growth.

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
├─────────────────────────────────────────────────────────────┤
│  Next.js App (React 18)  │  Mobile App (Future)  │   API    │
├─────────────────────────────────────────────────────────────┤
│                      Application Layer                       │
├────────────────────┬────────────────────┬──────────────────┤
│   Auth Service     │   Portfolio Service │    AI Service    │
│   (Supabase)       │   (Next.js API)     │   (HuggingFace)  │
├────────────────────┴────────────────────┴──────────────────┤
│                        Data Layer                            │
├────────────────────┬────────────────────┬──────────────────┤
│   PostgreSQL       │      Redis         │   File Storage   │
│   (Supabase)       │   (Caching)        │   (Supabase)     │
└────────────────────┴────────────────────┴──────────────────┘
```

### Key Architectural Principles

1. **Separation of Concerns**: Clear boundaries between layers
2. **Scalability First**: Designed to handle growth
3. **Developer Experience**: Easy to understand and extend
4. **Performance**: Optimized for speed and efficiency
5. **Security**: Defense in depth approach

## 🎨 Frontend Architecture

### Technology Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5.3 (Strict Mode)
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod
- **Testing**: Jest + React Testing Library

### Component Architecture

```
components/
├── ui/                 # shadcn/ui components
│   ├── button.tsx
│   ├── card.tsx
│   └── dialog.tsx
├── features/          # Feature-specific components
│   ├── portfolio/
│   ├── auth/
│   └── analytics/
├── layouts/           # Layout components
│   ├── dashboard-layout.tsx
│   └── landing-layout.tsx
└── shared/            # Shared components
    ├── navbar.tsx
    └── footer.tsx
```

### State Management Architecture

```typescript
// Zustand Store Structure
lib/store/
├── auth-store.ts      // User authentication
├── portfolio-store.ts // Portfolio management
├── ui-store.ts       // UI preferences
├── ai-store.ts       // AI model preferences
└── types.ts          // Shared types
```

### Routing Strategy

- **Public Routes**: Landing, pricing, about
- **Protected Routes**: Dashboard, editor, settings
- **API Routes**: `/api/v1/*` with versioning
- **Dynamic Routes**: `/[username]` for portfolios

## 🔧 Backend Architecture

### API Design

#### RESTful Endpoints

```
/api/v1/
├── auth/              # Authentication
├── portfolios/        # Portfolio CRUD
├── ai/               # AI enhancements
│   ├── enhance-bio/
│   ├── optimize-project/
│   └── recommend-template/
├── analytics/         # Usage analytics
└── admin/            # Admin endpoints
```

#### API Versioning Strategy

- URL-based versioning (`/api/v1/`)
- Backward compatibility for 6 months
- Clear deprecation notices
- Migration guides provided

### Service Architecture

```typescript
// Service Layer Pattern
services/
├── auth/
│   ├── auth.service.ts
│   ├── auth.types.ts
│   └── auth.test.ts
├── portfolio/
│   ├── portfolio.service.ts
│   ├── portfolio.repository.ts
│   └── portfolio.types.ts
└── ai/
    ├── ai.service.ts
    ├── providers/
    │   └── huggingface.ts
    └── ai.types.ts
```

### Database Schema

```sql
-- Core Tables
users
portfolios
portfolio_versions
templates
experiments
analytics_events

-- Relationships
user_portfolios
portfolio_variants
experiment_participants
```

## 🔄 Data Flow

### Portfolio Creation Flow

```
User Input → Validation → AI Enhancement → Preview → Save → Publish
     ↓           ↓             ↓              ↓        ↓        ↓
   Forms      Zod/RHF    HuggingFace    React/Next  Supabase  CDN
```

### AI Enhancement Pipeline

```
1. User submits content
2. Content validation and sanitization
3. AI model selection based on task
4. HuggingFace API call with retry logic
5. Response processing and quality scoring
6. Cache result for 7 days
7. Return enhanced content
```

### Authentication Flow

```
1. User initiates login
2. Supabase Auth handles credentials
3. JWT token generated
4. Token stored in httpOnly cookie
5. Middleware validates on each request
6. User context available throughout app
```

## 🔐 Security Architecture

### Authentication & Authorization

- **Provider**: Supabase Auth
- **Methods**: Email/Password, OAuth (GitHub, LinkedIn)
- **Session**: JWT with httpOnly cookies
- **RBAC**: Role-based access control

### Security Layers

1. **Network Security**
   - HTTPS everywhere
   - CORS configuration
   - Rate limiting

2. **Application Security**
   - Input validation (Zod)
   - SQL injection prevention (Prisma)
   - XSS protection (React)
   - CSRF tokens

3. **Data Security**
   - Encryption at rest (AES-256)
   - Encryption in transit (TLS 1.3)
   - PII handling compliance

### API Security

```typescript
// Middleware Stack
export const middleware = [
  corsMiddleware,
  rateLimitMiddleware,
  authMiddleware,
  validationMiddleware,
  loggingMiddleware
];
```

## 🏗️ Infrastructure

### Development Environment

```yaml
# docker-compose.dev.yml
services:
  app:
    - Next.js development server
    - Hot reload enabled
    - Port 3000
  
  postgres:
    - PostgreSQL 14
    - Port 5432
    - Persistent volume
  
  redis:
    - Redis 7
    - Port 6379
    - Memory cache
  
  pgadmin:
    - pgAdmin 4
    - Port 5050
    - Database management
```

### Production Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Vercel    │────▶│  Supabase   │────▶│ HuggingFace │
│  (Frontend) │     │  (Backend)  │     │    (AI)     │
└─────────────┘     └─────────────┘     └─────────────┘
       │                    │
       └────────┬───────────┘
                │
         ┌──────▼──────┐
         │    CDN      │
         │ (Cloudflare)│
         └─────────────┘
```

### Deployment Strategy

1. **Frontend**: Vercel (automatic from GitHub)
2. **Database**: Supabase (managed PostgreSQL)
3. **Caching**: Redis (Upstash for production)
4. **Storage**: Supabase Storage (for images)
5. **Analytics**: PostHog (self-hosted option)

## 📚 Architecture Decision Records

Key architectural decisions are documented in ADRs:

1. [ADR-001: API Versioning Strategy](./adr/001-api-versioning.md)
2. [ADR-002: State Management with Zustand](./adr/002-state-management-zustand.md)
3. [ADR-003: Caching Strategy](./adr/003-caching-strategy.md)
4. [ADR-004: AI Service Architecture](./adr/004-ai-service-architecture.md) (Coming soon)
5. [ADR-005: Authentication Strategy](./adr/005-authentication-strategy.md) (Coming soon)

## 🔄 Evolution Strategy

### Current Phase (v0.3.0-beta)

- Monolithic Next.js application
- Serverless functions for API
- Managed services for infrastructure

### Future Architecture (v1.0+)

- Microservices for specific domains
- Event-driven architecture
- GraphQL gateway (optional)
- Native mobile apps

## 📊 Performance Targets

- **Page Load**: < 3 seconds
- **API Response**: < 500ms (p95)
- **AI Processing**: < 5 seconds
- **Database Queries**: < 100ms
- **Cache Hit Rate**: > 80%

## 🧪 Testing Architecture

```
Testing Pyramid
     ┌───┐
    /     \ E2E (Playwright)
   /───────\ Integration (API tests)
  /─────────\ Unit Tests (Jest)
 /───────────\ Static Analysis (TypeScript, ESLint)
```

## 📈 Monitoring & Observability

- **Application Monitoring**: Vercel Analytics
- **Error Tracking**: Sentry (planned)
- **Performance Monitoring**: Web Vitals
- **User Analytics**: PostHog
- **Uptime Monitoring**: BetterUptime (planned)

---

For more detailed information, explore the specific documentation in each section or check our [ADRs](./adr/) for architectural decisions.
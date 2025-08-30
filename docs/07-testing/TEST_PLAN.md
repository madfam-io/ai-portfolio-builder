# 🎯 Test Coverage Plan - Path to 100%

## Current Status

- **Coverage**: ~3.91%
- **Test Files**: 21 (+3 new)
- **Source Files**: 451
- **Passing Tests**: 277/375
- **New Tests Added**: optimize-project, recommend-template, portfolios/[id]

## Phase 1: Fix Infrastructure & Core Tests (Current)

### ✅ Completed

- [x] Remove @tanstack/react-query mock
- [x] Fix ErrorLogger tests (enable test logs)
- [x] Fix retry handler tests (use fake timers)
- [x] Fix API error handler tests
- [x] Fix Supabase mocks

### 🚧 In Progress

- [ ] Fix remaining 68 failing tests
- [ ] Stabilize test environment

## Phase 2: API Route Tests (20% coverage target)

### Priority 1 - Core API Routes

- [x] `/api/v1/ai/optimize-project/route.ts` ✅
- [x] `/api/v1/ai/recommend-template/route.ts` ✅
- [x] `/api/v1/portfolios/[id]/route.ts` ✅
- [ ] `/api/v1/portfolios/[id]/publish/route.ts`
- [ ] `/api/v1/analytics/dashboard/route.ts`
- [ ] `/api/v1/analytics/github/[action]/route.ts`
- [ ] `/api/v1/experiments/route.ts`
- [ ] `/api/v1/experiments/[id]/route.ts`
- [ ] `/api/v1/upload/image/route.ts`
- [ ] `/api/v1/user/profile/route.ts`

### Priority 2 - Additional Routes

- [ ] `/api/v1/ai/analyze-portfolio/route.ts`
- [ ] `/api/v1/templates/route.ts`
- [ ] `/api/webhooks/posthog/route.ts`

## Phase 3: Service Layer Tests (40% coverage target)

### AI Services

- [ ] `lib/ai/huggingface-service.ts`
- [ ] `lib/ai/deepseek-service.ts`
- [ ] `lib/ai/unified-ai-service.ts`
- [ ] `lib/ai/geo/content-optimizer.ts`
- [ ] `lib/ai/geo/keyword-extractor.ts`

### Core Services

- [ ] `lib/services/portfolio/portfolio-service.ts`
- [ ] `lib/services/portfolio/portfolio-validator.ts`
- [ ] `lib/services/portfolio/portfolio-transformer.ts`
- [ ] `lib/services/analytics/analytics-service.ts`
- [ ] `lib/services/experiments/experiment-service.ts`
- [ ] `lib/services/user/user-service.ts`

### Infrastructure Services

- [ ] `lib/cache/redis-cache.ts`
- [ ] `lib/cache/memory-cache.ts`
- [ ] `lib/auth/auth.ts`
- [ ] `lib/auth/roles.ts`
- [ ] `lib/supabase/client.ts`
- [ ] `lib/supabase/server.ts`

## Phase 4: Component Tests (80% coverage target)

### Editor Components

- [ ] `components/editor/PortfolioEditor.tsx`
- [ ] `components/editor/EditorCanvas.tsx`
- [ ] `components/editor/EditorSidebar.tsx`
- [ ] `components/editor/PortfolioPreview.tsx`
- [ ] `components/editor/sections/*.tsx`

### UI Components

- [ ] All `components/ui/*.tsx` (shadcn components)
- [ ] `components/common/*.tsx`
- [ ] `components/auth/*.tsx`
- [ ] `components/landing/*.tsx`
- [ ] `components/admin/*.tsx`

### Provider Components

- [ ] `components/providers/*.tsx`

## Phase 5: Utility & Hook Tests (100% coverage target)

### Utilities

- [ ] `lib/utils/api-helpers.ts`
- [ ] `lib/utils/apiOptimization.ts`
- [ ] `lib/utils/validation.ts`
- [ ] `lib/utils/format.ts`
- [ ] `lib/utils/seo.ts`
- [ ] `lib/utils/url.ts`

### Hooks

- [ ] `hooks/useAuth.ts`
- [ ] `hooks/usePortfolio.ts`
- [ ] `hooks/useAnalytics.ts`
- [ ] `hooks/useExperiments.ts`
- [ ] `hooks/useAsync.ts`

### Middleware

- [ ] `middleware.ts`
- [ ] `middleware/api-version.ts`
- [ ] `middleware/security-headers.ts`
- [ ] `middleware/rate-limit.ts`

## Testing Strategy

### 1. API Route Testing Pattern

```typescript
describe('/api/v1/[route]', () => {
  // Test all HTTP methods
  // Test authentication/authorization
  // Test input validation
  // Test success cases
  // Test error cases
  // Test edge cases
});
```

### 2. Service Testing Pattern

```typescript
describe('ServiceName', () => {
  // Test initialization
  // Test main functionality
  // Test error handling
  // Test integrations
  // Test edge cases
});
```

### 3. Component Testing Pattern

```typescript
describe('ComponentName', () => {
  // Test rendering
  // Test user interactions
  // Test props/state changes
  // Test accessibility
  // Test edge cases
});
```

### 4. Utility Testing Pattern

```typescript
describe('utilityName', () => {
  // Test with various inputs
  // Test error cases
  // Test edge cases
  // Test performance (if applicable)
});
```

## Test Coverage Goals by Phase

| Phase   | Target Coverage | Files to Test  | Estimated Time |
| ------- | --------------- | -------------- | -------------- |
| Phase 1 | 5%              | Fix existing   | 2 hours        |
| Phase 2 | 20%             | 25 API routes  | 8 hours        |
| Phase 3 | 40%             | 30 services    | 10 hours       |
| Phase 4 | 80%             | 100 components | 20 hours       |
| Phase 5 | 100%            | 50 utils/hooks | 10 hours       |

## Commands

```bash
# Run all tests
pnpm test

# Run with coverage
pnpm test:coverage

# Run specific test file
pnpm test path/to/test

# Run in watch mode
pnpm test:watch

# Run tests matching pattern
pnpm test --testNamePattern="should enhance bio"
```

## Next Steps

1. Complete Phase 1: Fix remaining 68 failing tests
2. Begin Phase 2: Start with high-priority API routes
3. Use TDD approach for new tests
4. Update this document as tests are completed
5. Track coverage improvements after each phase

---

**Last Updated**: June 16, 2025
**Current Focus**: Phase 1 - Infrastructure fixes

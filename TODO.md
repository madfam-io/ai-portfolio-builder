# TODO & Technical Debt Tracker

This file tracks all TODO comments and technical debt in the codebase.

## 🔴 Critical Priority

### 1. Rate Limiting Implementation

- **File**: `middleware.ts` (line 35)
- **Issue**: Rate limiting is disabled for Vercel deployment due to Redis module compatibility
- **Solution**: Implement edge-compatible rate limiting using KV store or Upstash Redis
- **Impact**: Security vulnerability - API endpoints are not rate limited

### 2. External Logging Service

- **File**: `lib/utils/logger.ts` (line 76)
- **Issue**: No external logging service integration (Sentry, LogRocket, etc.)
- **Solution**: Integrate Sentry for error tracking and performance monitoring
- **Impact**: Limited production debugging capabilities

## 🟡 Medium Priority

### 3. Analytics Service - Average Time to First Review

- **File**: `lib/services/analyticsService.ts` (line 692)
- **Issue**: Missing calculation for average time to first review metric
- **Solution**: Implement the calculation using PR created date and first review date
- **Impact**: Incomplete analytics dashboard

### 4. Portfolio Publishing Implementation

- **File**: `app/api/v1/portfolios/[id]/publish/route.ts`
- **Issue**: Publishing endpoint is a stub - not implemented
- **Solution**: Implement full publishing flow with subdomain generation
- **Impact**: Core feature not available

### 5. Performance Observer Browser Support

- **File**: `lib/utils/performance.ts` (lines 106, 121, 140)
- **Issue**: Console warnings for browsers that don't support performance observers
- **Solution**: Use feature detection and graceful degradation
- **Impact**: Console noise in older browsers

## 🟢 Low Priority

### 6. I18n Date Formatting

- **File**: `lib/i18n/dateHelpers.ts`
- **Issue**: TODO comments for additional date formatting options
- **Solution**: Implement comprehensive date formatting for all locales
- **Impact**: Minor UX improvement

### 7. Sample Data Updates

- **File**: `lib/utils/sampleData.ts`
- **Issue**: Sample data needs updating with more realistic examples
- **Solution**: Create diverse, realistic sample portfolios
- **Impact**: Better demo experience

### 8. E2E Test Helpers

- **File**: `e2e/utils/test-helpers.ts`
- **Issue**: Missing helper functions for common E2E scenarios
- **Solution**: Implement comprehensive test utilities
- **Impact**: Slower test development

## 📋 Cleanup Tasks

### Remove Commented Code

- Multiple files have commented-out imports and code blocks
- Should be removed or properly documented if needed for reference

### Consolidate Error Handling

- Error handling patterns are inconsistent across API routes
- Create standardized error response utilities

### Update Dependencies

- 31 packages have newer major versions available
- Schedule regular dependency updates

## 🎯 Next Steps

1. **Immediate**: Fix rate limiting for production security
2. **This Sprint**: Implement Sentry integration for monitoring
3. **Next Sprint**: Complete portfolio publishing feature
4. **Ongoing**: Regular cleanup of technical debt

## 📊 Metrics

- Total TODO comments: 15 files affected
- Critical issues: 2
- Medium priority: 3
- Low priority: 3
- Estimated effort: ~2 weeks for complete cleanup

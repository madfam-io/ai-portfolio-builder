# ADR-003: Caching Strategy with Redis and In-Memory Fallback

**Date**: June 2025  
**Status**: Accepted  
**Decision Makers**: PRISMA Development Team

## Context

PRISMA needs an efficient caching strategy to:

- Reduce API response times
- Minimize database queries
- Handle AI enhancement results caching
- Support high traffic loads
- Maintain performance without Redis in development

Key requirements:

- Sub-500ms API response times
- Graceful degradation if Redis is unavailable
- Cost-effective for startup phase
- Easy local development

## Decision

Implement a two-tier caching strategy with Redis as primary and in-memory fallback:

### Architecture

```typescript
// Cache Service Implementation
class CacheService {
  private memoryCache: Map<string, CacheEntry>;
  private redisClient?: RedisClient;

  async get(key: string): Promise<T | null> {
    // Try Redis first
    if (this.redisClient?.isReady) {
      const data = await this.redisClient.get(key);
      if (data) return JSON.parse(data);
    }

    // Fallback to memory
    return this.memoryCache.get(key)?.data || null;
  }
}
```

### Caching Policies

1. **AI Enhancements**

   - TTL: 7 days
   - Key: `ai:enhance:{hash(content)}`
   - Rationale: AI results are deterministic for same input

2. **Portfolio Data**

   - TTL: 5 minutes
   - Key: `portfolio:{userId}:{portfolioId}`
   - Rationale: Balance freshness vs performance

3. **GitHub Analytics**

   - TTL: 1 hour
   - Key: `github:repo:{repoId}:metrics`
   - Rationale: Expensive to compute, changes slowly

4. **Template Metadata**
   - TTL: 24 hours
   - Key: `template:{templateId}`
   - Rationale: Rarely changes

### Memory Cache Limits

- Max size: 100MB
- LRU eviction policy
- Max entries: 10,000

## Consequences

### Positive

- Seamless development without Redis
- Production performance with Redis
- Reduced infrastructure costs in early stage
- Graceful degradation
- Simple deployment for MVPs

### Negative

- Memory cache not shared between instances
- Potential memory pressure in development
- Cache inconsistency in multi-instance deployments without Redis

### Neutral

- Standard caching patterns
- Well-understood technology choices

## Implementation Example

```typescript
// Usage in API route
export async function GET(request: Request) {
  const cacheKey = `portfolio:${userId}:${portfolioId}`;

  // Try cache first
  const cached = await cache.get(cacheKey);
  if (cached) {
    return Response.json(cached, {
      headers: { 'X-Cache': 'HIT' },
    });
  }

  // Fetch from database
  const data = await db.portfolio.findUnique({ where: { id } });

  // Cache for next time
  await cache.set(cacheKey, data, 300); // 5 minutes

  return Response.json(data, {
    headers: { 'X-Cache': 'MISS' },
  });
}
```

## References

- [Redis Documentation](https://redis.io/docs/)
- [Node.js Memory Caching](https://www.npmjs.com/package/node-cache)
- lib/cache/README.md in project

---

_ADR Created: June 2025_  
_Last Updated: June 15, 2025_

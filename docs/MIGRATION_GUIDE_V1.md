# API v1 Migration Guide

This guide helps you migrate your code to use the new versioned API structure.

## Quick Start

### 1. Update Direct API Calls

**Before:**

```typescript
// Direct fetch calls
const response = await fetch('/api/portfolios');
const data = await response.json();
```

**After:**

```typescript
// Using versioned API client
import { apiClient, API_ENDPOINTS } from '@/lib/api/client';

const { data, error } = await apiClient.get(API_ENDPOINTS.portfolios.list);
```

### 2. Update AI Service Calls

The AI client has been updated to use versioned endpoints automatically. No changes needed in your components:

```typescript
// This remains the same
import { aiClient } from '@/lib/ai/client';

const enhanced = await aiClient.enhanceBio(bio, context);
```

### 3. Update Custom API Calls

**Before:**

```typescript
async function fetchPortfolio(id: string) {
  const response = await fetch(`/api/portfolios/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch portfolio');
  }

  return response.json();
}
```

**After:**

```typescript
import { apiClient, API_ENDPOINTS } from '@/lib/api/client';

async function fetchPortfolio(id: string) {
  const { data, error } = await apiClient.get(API_ENDPOINTS.portfolios.get(id));

  if (error) {
    throw new Error(error);
  }

  return data;
}
```

## API Endpoint Reference

### Portfolio Endpoints

```typescript
API_ENDPOINTS.portfolios = {
  list: 'portfolios', // GET /api/v1/portfolios
  create: 'portfolios', // POST /api/v1/portfolios
  get: id => `portfolios/${id}`, // GET /api/v1/portfolios/:id
  update: id => `portfolios/${id}`, // PUT /api/v1/portfolios/:id
  delete: id => `portfolios/${id}`, // DELETE /api/v1/portfolios/:id
};
```

### AI Enhancement Endpoints

```typescript
API_ENDPOINTS.ai = {
  enhanceBio: 'ai/enhance-bio', // POST /api/v1/ai/enhance-bio
  models: 'ai/models', // GET /api/v1/ai/models
  modelSelection: 'ai/models/selection', // GET/PUT /api/v1/ai/models/selection
  optimizeProject: 'ai/optimize-project', // POST /api/v1/ai/optimize-project
  recommendTemplate: 'ai/recommend-template', // GET/POST /api/v1/ai/recommend-template
};
```

### Analytics Endpoints

```typescript
API_ENDPOINTS.analytics = {
  dashboard: 'analytics/dashboard', // GET /api/v1/analytics/dashboard
  repositories: 'analytics/repositories', // GET /api/v1/analytics/repositories
  repository: id => `analytics/repositories/${id}`, // GET /api/v1/analytics/repositories/:id
};
```

### Integration Endpoints

```typescript
API_ENDPOINTS.integrations = {
  github: {
    auth: 'integrations/github/auth', // GET /api/v1/integrations/github/auth
    callback: 'integrations/github/callback', // GET /api/v1/integrations/github/callback
  },
};
```

## Error Handling

### Standardized Error Response

All API errors now follow this format:

```typescript
{
  success: false,
  error: "Error message",
  data?: {
    details: [] // Optional additional error details
  },
  timestamp: "2025-01-11T12:00:00.000Z"
}
```

### Error Handling Example

```typescript
import { apiClient } from '@/lib/api/client';

try {
  const { data, error, status } = await apiClient.post(
    'portfolios',
    portfolioData
  );

  if (error) {
    // Handle specific error cases
    if (status === 401) {
      // Redirect to login
    } else if (status === 429) {
      // Show rate limit message
    } else {
      // Show generic error
      console.error('API Error:', error);
    }
    return;
  }

  // Success - use data
  console.log('Portfolio created:', data);
} catch (err) {
  // Network or other errors
  console.error('Request failed:', err);
}
```

## Testing with Versioned APIs

### Update Test Mocks

```typescript
// __tests__/utils/test-mocks.ts
import { API_ENDPOINTS } from '@/lib/api/client';

// Mock versioned endpoints
fetchMock.mockResponseOnce(
  JSON.stringify({
    success: true,
    data: mockPortfolios,
  }),
  {
    status: 200,
    headers: {
      'X-API-Version': 'v1',
      'Content-Type': 'application/json',
    },
  }
);
```

### Test Example

```typescript
it('should fetch portfolios using v1 API', async () => {
  const { result } = renderHook(() => usePortfolios());

  await waitFor(() => {
    expect(result.current.data).toBeDefined();
  });

  // Verify v1 endpoint was called
  expect(fetch).toHaveBeenCalledWith(
    expect.stringContaining('/api/v1/portfolios'),
    expect.any(Object)
  );
});
```

## Migration Checklist

- [ ] Update all direct `fetch()` calls to use `apiClient`
- [ ] Replace hardcoded endpoints with `API_ENDPOINTS` constants
- [ ] Update error handling to use standardized format
- [ ] Update tests to mock v1 endpoints
- [ ] Test all API integrations with new endpoints
- [ ] Monitor deprecation warnings in API responses
- [ ] Update any webhook URLs to use v1 endpoints

## Common Issues and Solutions

### Issue: 404 Not Found

**Solution**: Ensure you're using `/api/v1/` prefix in your endpoints

### Issue: CORS errors

**Solution**: The API client handles credentials automatically. Don't add custom CORS headers.

### Issue: Authentication errors

**Solution**: The API client includes auth headers automatically if a user is signed in.

### Issue: Old endpoints still work

**Note**: Unversioned endpoints will redirect to v1 automatically, but update your code to use explicit v1 endpoints.

## Need Help?

- Check the [API documentation](/docs/API_VERSIONING.md)
- Review the [API client source](/lib/api/client.ts)
- Test endpoints in development with detailed logging enabled

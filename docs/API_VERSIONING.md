# API Versioning Guide

## Overview

The PRISMA AI Portfolio Builder uses a comprehensive API versioning system to ensure backward compatibility while allowing for continuous improvement and evolution of the API.

## Current Version

- **Current Version**: v1
- **Base URL**: `https://your-domain.com/api/v1/`

## Versioning Strategy

### URL-based Versioning

All API endpoints include the version number in the URL path:

```
/api/v1/portfolios
/api/v1/ai/enhance-bio
/api/v1/analytics/dashboard
```

### Automatic Version Redirection

If a request is made to an unversioned endpoint, it will automatically redirect to the current version:

```
/api/portfolios → /api/v1/portfolios
```

## Response Headers

All API responses include version information headers:

- `X-API-Version`: The version used for this request
- `X-API-Current-Version`: The latest available API version
- `X-API-Supported-Versions`: Comma-separated list of all supported versions
- `X-API-Response-Time`: ISO timestamp of when the response was generated

### Deprecation Headers

When using a deprecated API version, additional headers are included:

- `X-API-Deprecation-Warning`: Human-readable deprecation message
- `X-API-Sunset-Date`: ISO date when the version will be removed
- `Sunset`: RFC-compliant sunset date header
- `Deprecation`: RFC-compliant deprecation header

## Using the API Client

### JavaScript/TypeScript

```typescript
import { apiClient, API_ENDPOINTS } from '@/lib/api/client';

// Automatic versioning - uses current version
const { data, error } = await apiClient.get(API_ENDPOINTS.portfolios.list);

// Create a portfolio
const { data: portfolio, error } = await apiClient.post(
  API_ENDPOINTS.portfolios.create,
  {
    name: 'My Portfolio',
    title: 'Senior Developer',
    template: 'developer'
  }
);

// Update a portfolio
const { data: updated, error } = await apiClient.patch(
  API_ENDPOINTS.portfolios.update(portfolioId),
  { bio: 'Updated bio text' }
);
```

### Direct HTTP Requests

```bash
# GET all portfolios
curl -X GET "https://your-domain.com/api/v1/portfolios" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Create a portfolio
curl -X POST "https://your-domain.com/api/v1/portfolios" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "My Portfolio", "template": "developer"}'
```

## Error Responses

All errors follow a consistent format:

```json
{
  "success": false,
  "error": "Error message",
  "data": {
    "details": [] // Optional additional error details
  },
  "timestamp": "2025-01-11T12:00:00.000Z"
}
```

### Version-specific Errors

```json
{
  "error": "Unsupported API Version",
  "message": "API version v0 is not supported. Supported versions: v1",
  "currentVersion": "v1"
}
```

## Migration Guide

### Updating from Unversioned to v1

1. **Update API calls**: Add `/v1` to all API endpoints
   ```typescript
   // Old
   fetch('/api/portfolios')
   
   // New
   fetch('/api/v1/portfolios')
   ```

2. **Use the API client**: For automatic version management
   ```typescript
   import { apiClient } from '@/lib/api/client';
   const { data } = await apiClient.get('portfolios');
   ```

3. **Handle version headers**: Check for deprecation warnings
   ```typescript
   const response = await fetch('/api/v1/portfolios');
   const deprecationWarning = response.headers.get('X-API-Deprecation-Warning');
   if (deprecationWarning) {
     console.warn('API Version Deprecation:', deprecationWarning);
   }
   ```

## API Endpoints

### Portfolio Management

- `GET /api/v1/portfolios` - List all portfolios
- `POST /api/v1/portfolios` - Create a new portfolio
- `GET /api/v1/portfolios/:id` - Get a specific portfolio
- `PUT /api/v1/portfolios/:id` - Update a portfolio
- `DELETE /api/v1/portfolios/:id` - Delete a portfolio

### AI Enhancement

- `POST /api/v1/ai/enhance-bio` - Enhance biography text
- `POST /api/v1/ai/optimize-project` - Optimize project descriptions
- `POST /api/v1/ai/recommend-template` - Get template recommendations
- `GET /api/v1/ai/models` - List available AI models
- `POST /api/v1/ai/models/selection` - Update model preferences

### Analytics

- `GET /api/v1/analytics/dashboard` - Get analytics dashboard data
- `GET /api/v1/analytics/repositories` - List GitHub repositories
- `GET /api/v1/analytics/repositories/:id` - Get repository analytics

### Integrations

- `GET /api/v1/integrations/github/auth` - Initiate GitHub OAuth
- `GET /api/v1/integrations/github/callback` - Handle GitHub OAuth callback

## Best Practices

1. **Always use versioned endpoints** in production code
2. **Monitor deprecation headers** to stay ahead of API changes
3. **Use the provided API client** for automatic version management
4. **Handle errors gracefully** with proper error boundaries
5. **Cache responses** when appropriate to reduce API calls

## Version History

### v1 (Current) - Released 2025-01-11

- Initial versioned API release
- Comprehensive portfolio management
- AI-powered content enhancement
- GitHub analytics integration
- OAuth authentication support

## Future Versions

When v2 is released:

- v1 will continue to be supported for at least 6 months
- Deprecation warnings will be added to v1 responses
- Migration guide will be provided
- Breaking changes will be clearly documented
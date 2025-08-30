# 🔌 API Documentation

> Complete API reference for Portfolio Builder v1 REST API

## Base URL

```
Production: https://portfolio-builder.madfam.io/api/v1
Development: http://localhost:3000/api/v1
```

## Authentication

All authenticated endpoints require a Bearer token in the Authorization header:

```http
Authorization: Bearer <your-jwt-token>
```

## Rate Limiting

| Tier | Requests/Min | Requests/Hour |
|------|--------------|---------------|
| **Free** | 60 | 1,000 |
| **Pro** | 300 | 10,000 |
| **Business** | 1,000 | 50,000 |
| **Enterprise** | Custom | Custom |

## API Endpoints

### 🏥 Health & Status

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/health` | API health check | No |
| GET | `/health/live` | Liveness probe | No |
| GET | `/health/ready` | Readiness probe | No |

### 🎨 Portfolios

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/portfolios` | List user portfolios | Yes |
| POST | `/portfolios` | Create new portfolio | Yes |
| GET | `/portfolios/:id` | Get portfolio details | Conditional |
| PUT | `/portfolios/:id` | Update portfolio | Yes |
| DELETE | `/portfolios/:id` | Delete portfolio | Yes |
| POST | `/portfolios/:id/publish` | Publish portfolio | Yes |
| GET | `/portfolios/:id/variants` | Get portfolio variants | Yes |
| POST | `/portfolios/check-subdomain` | Check subdomain availability | Yes |

### 🤖 AI Services

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/ai/enhance-bio` | Enhance biography with AI | Yes |
| POST | `/ai/optimize-project` | Optimize project description | Yes |
| POST | `/ai/suggest-skills` | Suggest relevant skills | Yes |
| POST | `/ai/recommend-template` | Recommend best template | Yes |
| POST | `/ai/analyze-competitor` | Analyze competitor portfolio | Yes |
| GET | `/ai/models` | List available AI models | Yes |
| POST | `/ai/models/selection` | Select optimal model | Yes |

### 💳 Payments & Billing

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/stripe/checkout` | Create checkout session | Yes |
| POST | `/stripe/checkout-credits` | Buy AI credits | Yes |
| POST | `/stripe/portal` | Access billing portal | Yes |
| POST | `/stripe/webhook` | Stripe webhook handler | Webhook |
| GET | `/payments/verify` | Verify payment status | Yes |

### 📊 Analytics

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/analytics/dashboard` | Dashboard metrics | Yes |
| GET | `/analytics/repositories` | GitHub repo analytics | Yes |
| GET | `/analytics/repositories/:id` | Repo details | Yes |
| POST | `/usage/track` | Track usage event | Yes |

### 🔗 Integrations

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/integrations/github/auth` | GitHub OAuth | Yes |
| GET | `/integrations/github/callback` | GitHub callback | OAuth |
| GET | `/integrations/github/status` | GitHub connection status | Yes |
| POST | `/integrations/github/disconnect` | Disconnect GitHub | Yes |
| GET | `/integrations/linkedin/auth` | LinkedIn OAuth | Yes |
| GET | `/integrations/linkedin/callback` | LinkedIn callback | OAuth |
| GET | `/integrations/linkedin/profile` | Get LinkedIn profile | Yes |
| POST | `/integrations/linkedin/import` | Import LinkedIn data | Yes |

### 🎁 Referral System

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/referral/create` | Create referral code | Yes |
| POST | `/referral/track` | Track referral | No |
| POST | `/referral/convert` | Convert referral | Yes |
| GET | `/referral/campaigns` | List campaigns | Yes |
| GET | `/referral/user/:userId/stats` | User referral stats | Yes |
| GET | `/referral/user/:userId/referrals` | User's referrals | Yes |
| GET | `/referral/user/:userId/rewards` | User's rewards | Yes |

### 🧪 Experiments & Features

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/experiments` | List experiments | Yes |
| GET | `/experiments/active` | Active experiments | Yes |
| POST | `/experiments/track` | Track experiment event | Yes |
| GET | `/variants/:id` | Get variant details | Yes |

### 👤 User Management

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/user/limits` | Get user limits | Yes |
| GET | `/user/profile` | Get user profile | Yes |
| PUT | `/user/profile` | Update profile | Yes |
| DELETE | `/user/account` | Delete account | Yes |

### 🌐 Geo & Localization

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/geo/analyze` | Analyze geo data | Yes |
| POST | `/geo/keywords` | Get local keywords | Yes |
| POST | `/geo/optimize` | Optimize for region | Yes |

### 📝 Feedback

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/feedback/submit` | Submit feedback | Yes |
| POST | `/feedback/survey` | Submit survey | Yes |

### 🔧 Admin (Protected)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/admin/revenue/metrics` | Revenue metrics | Admin |
| GET | `/admin/revenue/trends` | Revenue trends | Admin |
| GET | `/admin/experiments` | Manage experiments | Admin |
| POST | `/admin/experiments` | Create experiment | Admin |
| PUT | `/admin/experiments/:id` | Update experiment | Admin |

## Response Format

### Success Response

```json
{
  "success": true,
  "data": {
    // Response data
  },
  "meta": {
    "timestamp": "2025-08-30T12:00:00Z",
    "version": "v1"
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": {
      "field": "email",
      "reason": "Invalid email format"
    }
  },
  "meta": {
    "timestamp": "2025-08-30T12:00:00Z",
    "request_id": "req_123abc"
  }
}
```

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Missing or invalid authentication |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |
| `SERVICE_UNAVAILABLE` | 503 | Service temporarily unavailable |

## Pagination

List endpoints support pagination:

```http
GET /api/v1/portfolios?page=1&limit=20&sort=created_at&order=desc
```

Response includes pagination metadata:

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## Filtering & Sorting

### Filtering
```http
GET /api/v1/portfolios?status=published&template=developer
```

### Sorting
```http
GET /api/v1/portfolios?sort=created_at&order=desc
```

### Search
```http
GET /api/v1/portfolios?q=john+doe
```

## Webhooks

Configure webhooks in your dashboard to receive real-time events:

| Event | Description |
|-------|-------------|
| `portfolio.created` | New portfolio created |
| `portfolio.published` | Portfolio published |
| `portfolio.deleted` | Portfolio deleted |
| `payment.succeeded` | Payment successful |
| `payment.failed` | Payment failed |
| `referral.converted` | Referral converted |

## SDKs & Libraries

### JavaScript/TypeScript

```bash
npm install @madfam/portfolio-builder-sdk
```

```typescript
import { PortfolioBuilder } from '@madfam/portfolio-builder-sdk';

const client = new PortfolioBuilder({
  apiKey: 'your-api-key',
  environment: 'production'
});

const portfolio = await client.portfolios.create({
  name: 'John Doe',
  template: 'developer'
});
```

## Testing

### Test Environment
```
Base URL: https://staging.portfolio-builder.madfam.io/api/v1
```

### Test API Keys
Contact support@madfam.io for test API keys.

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| v1.0.0 | 2025-01-15 | Initial release |
| v1.1.0 | 2025-02-01 | Added referral system |
| v1.2.0 | 2025-03-01 | Enhanced AI features |
| v1.3.0 | 2025-04-01 | Portfolio variants |
| v1.4.0 | 2025-05-01 | Custom domains |
| v1.5.0 | 2025-08-30 | Performance optimizations |

## Support

- 📧 API Support: api@madfam.io
- 📖 Documentation: https://docs.portfolio-builder.madfam.io
- 🐛 Report Issues: https://github.com/aldoruizluna/labspace/ai-portfolio-builder/issues

---

<div align="center">
  <strong>Portfolio Builder API v1</strong><br>
  Enterprise-grade API for AI-powered portfolio generation
</div>
# 📡 PRISMA API Reference

Complete API documentation for the PRISMA AI Portfolio Builder platform.

**Last Updated**: June 15, 2025  
**Version**: v0.3.0-beta  
**API Version**: v1

## 📋 Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [AI Enhancement APIs](#ai-enhancement-apis)
4. [Portfolio Management APIs](#portfolio-management-apis)
5. [Portfolio Variants APIs](#portfolio-variants-apis)
6. [GitHub Analytics APIs](#github-analytics-apis)
7. [Experiments APIs](#experiments-apis)
8. [Admin APIs](#admin-apis)
9. [User Management APIs](#user-management-apis)
10. [Error Handling](#error-handling)
11. [Rate Limiting](#rate-limiting)
12. [Examples & SDKs](#examples--sdks)

## 🎯 Overview

### Base URL

- **Development**: `http://localhost:3000/api/v1`
- **Production**: `https://prisma.madfam.io/api/v1`

### API Versioning

- **Current Version**: v1 (explicit versioning)
- **Endpoint Structure**: `/api/v1/{resource}`
- **Deprecation Policy**: 6 months notice before version sunset
- **Version Headers**: `API-Version: v1` supported for future compatibility

### Response Format

All API responses follow this structure:

```typescript
interface APIResponse<T> {
  data?: T;           // Success response data
  error?: string;     // Error message if request failed
  message?: string;   // Success message
  timestamp?: string; // ISO timestamp
  version?: string;   // API version used
}

// Success Response
{
  "data": { ... },
  "message": "Portfolio created successfully",
  "timestamp": "2025-06-15T10:30:00Z",
  "version": "v1"
}

// Error Response
{
  "error": "Portfolio not found",
  "timestamp": "2025-06-15T10:30:00Z",
  "version": "v1"
}
```

### Content Types

- **Request**: `application/json`
- **Response**: `application/json`
- **File Upload**: `multipart/form-data`

## 🔐 Authentication

### Authentication Methods

#### 1. Session-Based (Web App)

```typescript
// Handled automatically by Next.js middleware
// Sessions managed by Supabase Auth
```

#### 2. API Key (Future)

```http
Authorization: Bearer your-api-key
```

#### 3. OAuth (GitHub Analytics)

```http
Authorization: Bearer github-oauth-token
```

### Protected Routes

All `/api/*` routes except public endpoints require authentication.

**Public Endpoints**:

- `GET /api/health`
- `GET /api/health`
- `GET /api/v1/ai/models` (limited info)

## 🤖 AI Enhancement APIs

### Bio Enhancement

#### POST `/api/v1/ai/enhance-bio`

Enhance professional bio using AI with customizable models and context.

**Request Body**:

```typescript
{
  bio: string;           // Original bio (max 1000 characters)
  context?: {
    industry?: string;   // e.g., "technology", "healthcare"
    experienceLevel?: "junior" | "mid" | "senior" | "executive";
    tone?: "professional" | "casual" | "creative";
    targetAudience?: string;
  };
  model?: string;        // Optional: specific model ID
  maxLength?: number;    // Optional: max output length (default: 150)
}
```

**Response**:

```typescript
{
  success: true,
  data: {
    content: string;         // Enhanced bio content
    originalLength: number;  // Character count of input
    enhancedLength: number;  // Character count of output
    improvements: string[];  // List of improvements made
    qualityScore: {
      overall: number;       // 0-100
      readability: number;
      professionalism: number;
      impact: number;
      completeness: number;
    };
    processingTime: number;  // MS taken to process
    modelUsed: string;      // Actual model used
    cost: number;           // Cost in USD
  }
}
```

**Example**:

```bash
curl -X POST http://localhost:3000/api/v1/ai/enhance-bio \
  -H "Content-Type: application/json" \
  -d '{
    "bio": "I am a software developer with 5 years of experience.",
    "context": {
      "industry": "technology",
      "experienceLevel": "senior",
      "tone": "professional"
    }
  }'
```

### Project Optimization

#### POST `/api/v1/ai/optimize-project`

Optimize project descriptions using STAR methodology.

**Request Body**:

```typescript
{
  title: string;
  description: string;
  technologies: string[];
  context?: {
    projectType?: "web" | "mobile" | "desktop" | "api" | "data" | "other";
    businessDomain?: string;
    targetAudience?: string;
    projectScale?: "personal" | "startup" | "enterprise";
  };
  model?: string;
}
```

**Response**:

```typescript
{
  success: true,
  data: {
    optimizedDescription: string;
    structure: {
      situation: string;    // Problem/context
      task: string;        // What needed to be done
      action: string;      // How you solved it
      result: string;      // Outcomes and impact
    };
    improvements: string[];
    technologiesHighlighted: string[];
    businessImpact: string[];
    qualityScore: QualityScore;
    processingTime: number;
    modelUsed: string;
  }
}
```

### Template Recommendation

#### POST `/api/v1/ai/recommend-template`

Get AI-powered template recommendations based on user profile.

**Request Body**:

```typescript
{
  profile: {
    industry: string;
    role: string;
    experienceLevel: "junior" | "mid" | "senior" | "executive";
    skills: string[];
    portfolioType: "technical" | "creative" | "business" | "academic";
    targetAudience: string;
  };
  preferences?: {
    colorScheme?: "light" | "dark" | "colorful" | "minimal";
    layoutStyle?: "single-page" | "multi-page" | "grid" | "timeline";
    contentFocus?: "projects" | "experience" | "skills" | "achievements";
  };
}
```

**Response**:

```typescript
{
  success: true,
  data: {
    recommendedTemplate: {
      templateId: string;
      templateName: string;
      confidence: number;        // 0-100
      reasoning: string;
      features: string[];
      previewUrl: string;
    };
    alternativeTemplates: Array<{
      templateId: string;
      templateName: string;
      confidence: number;
      reason: string;
    }>;
    matchingFactors: string[];
    confidenceScore: number;
  }
}
```

### Model Management

#### GET `/api/v1/ai/models`

Get available AI models and their capabilities.

**Response**:

```typescript
{
  success: true,
  data: {
    models: Array<{
      id: string;
      name: string;
      capabilities: ("bio" | "project" | "template" | "scoring")[];
      costPerRequest: number;
      avgResponseTime: number;    // milliseconds
      qualityRating: number;      // 0-100
      isRecommended: boolean;
      description: string;
      lastUpdated: string;
    }>;
    defaultSelections: {
      bio: string;
      project: string;
      template: string;
      scoring: string;
    };
  }
}
```

#### GET `/api/v1/ai/models/selection`

Get user's current model selections.

#### PUT `/api/v1/ai/models/selection`

Update user's model preferences.

**Request Body**:

```typescript
{
  taskType: 'bio' | 'project' | 'template' | 'scoring';
  modelId: string;
}
```

## 📁 Portfolio Management APIs

### Portfolio CRUD Operations

#### GET `/api/v1/portfolios`

Get user's portfolios with pagination and filtering.

**Query Parameters**:

- `page?: number` - Page number (default: 1)
- `limit?: number` - Items per page (default: 10, max: 50)
- `status?: "draft" | "published" | "archived"`
- `search?: string` - Search in title and description

**Response**:

```typescript
{
  success: true,
  data: {
    portfolios: Array<{
      id: string;
      title: string;
      description: string;
      templateId: string;
      status: "draft" | "published" | "archived";
      subdomain: string;
      customDomain?: string;
      publishedAt?: string;
      createdAt: string;
      updatedAt: string;
    }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }
}
```

#### POST `/api/v1/portfolios`

Create a new portfolio.

**Request Body**:

```typescript
{
  title: string;
  description?: string;
  templateId: string;
  content: {
    bio: string;
    projects: Array<{
      title: string;
      description: string;
      technologies: string[];
      imageUrl?: string;
      projectUrl?: string;
      githubUrl?: string;
    }>;
    skills: string[];
    experience: Array<{
      company: string;
      position: string;
      startDate: string;
      endDate?: string;
      description: string;
    }>;
    education?: Array<{
      institution: string;
      degree: string;
      field: string;
      graduationDate: string;
    }>;
    socialLinks?: {
      linkedin?: string;
      github?: string;
      website?: string;
      twitter?: string;
    };
  };
  settings: {
    theme: object;
    layout: object;
    seo: {
      title: string;
      description: string;
      keywords: string[];
    };
  };
}
```

#### GET `/api/v1/portfolios/[id]`

Get specific portfolio by ID.

#### PUT `/api/v1/portfolios/[id]`

Update portfolio (partial updates supported).

#### DELETE `/api/v1/portfolios/[id]`

Delete portfolio (soft delete).

### Portfolio Publishing

#### POST `/api/v1/portfolios/[id]/publish`

Publish portfolio to subdomain.

**Request Body**:

```typescript
{
  subdomain?: string;    // Custom subdomain (if available)
  customDomain?: string; // Custom domain (premium feature)
}
```

## 🔀 Portfolio Variants APIs

### Variant Management

#### GET `/api/v1/portfolios/[id]/variants`

Get all variants for a portfolio.

**Response**:

```typescript
{
  success: true,
  data: {
    variants: Array<{
      id: string;
      portfolioId: string;
      name: string;
      audience: {
        type: 'recruiter' | 'client' | 'investor' | 'general';
        industry?: string;
        seniority?: string;
      };
      customization: {
        bio?: string;
        highlights?: string[];
        projectsOrder?: string[];
      };
      performance: {
        views: number;
        conversions: number;
        averageTimeOnPage: number;
      };
      isActive: boolean;
      createdAt: string;
      updatedAt: string;
    }>;
  }
}
```

#### POST `/api/v1/portfolios/[id]/variants`

Create a new portfolio variant.

**Request Body**:

```typescript
{
  name: string;
  audience: {
    type: 'recruiter' | 'client' | 'investor' | 'general';
    industry?: string;
    seniority?: string;
  };
  customization: {
    bio?: string;
    highlights?: string[];
    projectsOrder?: string[];
  };
}
```

#### PUT `/api/v1/variants/[id]`

Update an existing variant.

#### DELETE `/api/v1/variants/[id]`

Delete a variant.

#### POST `/api/v1/variants/[id]/activate`

Activate a variant for A/B testing.

## 🧪 Experiments APIs

### Experiment Management

#### GET `/api/v1/experiments`

Get all experiments with filtering.

**Query Parameters**:

- `status?: 'draft' | 'running' | 'paused' | 'completed'`
- `page?: number`
- `limit?: number`

#### POST `/api/v1/experiments`

Create a new experiment.

**Request Body**:

```typescript
{
  name: string;
  description: string;
  type: 'ab_test' | 'multivariate' | 'feature_flag';
  targeting: {
    audience: string[];
    percentage: number;
  };
  variants: Array<{
    name: string;
    weight: number;
    changes: Record<string, any>;
  }>;
}
```

#### GET `/api/v1/experiments/[id]`

Get experiment details with performance metrics.

#### PUT `/api/v1/experiments/[id]`

Update experiment configuration.

#### POST `/api/v1/experiments/[id]/start`

Start an experiment.

#### POST `/api/v1/experiments/[id]/pause`

Pause a running experiment.

#### POST `/api/v1/experiments/[id]/complete`

Complete an experiment and analyze results.

#### POST `/api/v1/experiments/track`

Track experiment events.

**Request Body**:

```typescript
{
  experimentId: string;
  variantId: string;
  event: string;
  properties?: Record<string, any>;
}
```

## 📊 GitHub Analytics APIs

### GitHub Integration

#### POST `/api/integrations/github/auth`

Initiate GitHub OAuth flow.

**Response**:

```typescript
{
  success: true,
  data: {
    authUrl: string;     // Redirect user to this URL
    state: string;       // OAuth state parameter
  }
}
```

#### GET `/api/integrations/github/callback`

OAuth callback handler (called by GitHub).

### Repository Management

#### GET `/api/analytics/repositories`

Get user's GitHub repositories.

**Query Parameters**:

- `synced?: boolean` - Filter by sync status
- `page?: number`
- `limit?: number`

**Response**:

```typescript
{
  success: true,
  data: {
    repositories: Array<{
      id: string;
      githubId: number;
      name: string;
      fullName: string;
      description: string;
      language: string;
      stars: number;
      forks: number;
      isPrivate: boolean;
      lastSyncAt: string;
      createdAt: string;
      updatedAt: string;
    }>;
    pagination: object;
  }
}
```

#### POST `/api/analytics/repositories`

Sync repositories from GitHub.

**Request Body**:

```typescript
{
  force?: boolean;       // Force sync even if recently synced
  repositoryIds?: string[]; // Specific repos to sync
}
```

#### GET `/api/analytics/repositories/[id]`

Get detailed repository analytics.

**Response**:

```typescript
{
  success: true,
  data: {
    repository: {
      // Basic repo info
    };
    metrics: {
      current: {
        linesOfCode: number;
        fileCount: number;
        commitCount: number;
        contributorCount: number;
        pullRequestCount: number;
      };
      history: Array<{
        date: string;
        linesOfCode: number;
        commits: number;
        pullRequests: number;
      }>;
    };
    contributors: Array<{
      login: string;
      contributions: number;
      commits: number;
      additions: number;
      deletions: number;
    }>;
    languages: Array<{
      name: string;
      percentage: number;
      bytes: number;
    }>;
    pullRequests: {
      totalCount: number;
      openCount: number;
      closedCount: number;
      mergedCount: number;
      avgCycleTime: number;    // hours
      avgLeadTime: number;     // hours
    };
    commits: {
      totalCount: number;
      lastWeek: number;
      lastMonth: number;
      byDay: Array<{
        date: string;
        count: number;
      }>;
    };
  }
}
```

### Analytics Dashboard

#### GET `/api/analytics/dashboard`

Get aggregated analytics across all repositories.

**Response**:

```typescript
{
  success: true,
  data: {
    overview: {
      totalRepositories: number;
      totalCommits: number;
      totalPullRequests: number;
      totalContributors: number;
      totalLinesOfCode: number;
      avgCommitsPerDay: number;
    };
    recentActivity: Array<{
      type: "commit" | "pull_request" | "repository";
      repository: string;
      message: string;
      timestamp: string;
    }>;
    topRepositories: Array<{
      name: string;
      commits: number;
      stars: number;
      activity: number;
    }>;
    topContributors: Array<{
      login: string;
      totalContributions: number;
      repositories: number;
    }>;
    languageStats: Array<{
      language: string;
      percentage: number;
      repositories: number;
    }>;
    trends: {
      commitTrend: Array<{
        date: string;
        count: number;
      }>;
      pullRequestTrend: Array<{
        date: string;
        opened: number;
        merged: number;
        closed: number;
      }>;
    };
  }
}
```

## 👑 Admin APIs

### User Management

#### GET `/api/admin/users`

Get users with admin permissions (requires admin role).

**Query Parameters**:

- `page?: number`
- `limit?: number`
- `role?: string`
- `status?: string`
- `search?: string`

**Response**:

```typescript
{
  success: true,
  data: {
    users: Array<{
      id: string;
      email: string;
      name: string;
      accountType: "customer" | "admin";
      status: "active" | "suspended" | "pending";
      subscriptionPlan?: "free" | "pro" | "business" | "enterprise";
      createdAt: string;
      lastLoginAt: string;
      portfolioCount: number;
      usageStats: {
        aiEnhancementsUsed: number;
        portfoliosCreated: number;
        lastActivity: string;
      };
    }>;
    pagination: object;
    stats: {
      totalUsers: number;
      activeUsers: number;
      newUsersThisMonth: number;
      subscriptionDistribution: object;
    };
  }
}
```

#### POST `/api/admin/users/[id]/impersonate`

Impersonate user (requires support+ role).

#### POST `/api/admin/users/[id]/suspend`

Suspend user account (requires moderator+ role).

### System Analytics

#### GET `/api/admin/analytics`

Get system-wide analytics (requires admin role).

**Response**:

```typescript
{
  success: true,
  data: {
    usage: {
      totalPortfolios: number;
      totalAiRequests: number;
      totalUsers: number;
      activeUsers: number;
    };
    costs: {
      totalAiCosts: number;
      avgCostPerUser: number;
      costBreakdown: {
        bio: number;
        project: number;
        template: number;
      };
    };
    performance: {
      avgResponseTime: number;
      errorRate: number;
      uptime: number;
    };
    growth: {
      userGrowth: Array<{
        date: string;
        newUsers: number;
        totalUsers: number;
      }>;
      usageGrowth: Array<{
        date: string;
        portfolios: number;
        aiRequests: number;
      }>;
    };
  }
}
```

## 👤 User Management APIs

### User Profile

#### GET `/api/user/profile`

Get current user's profile.

#### PUT `/api/user/profile`

Update user profile.

**Request Body**:

```typescript
{
  name?: string;
  bio?: string;
  industry?: string;
  experience_level?: string;
  skills?: string[];
  social_links?: {
    linkedin?: string;
    github?: string;
    website?: string;
    twitter?: string;
  };
  preferences?: {
    language?: "es" | "en";
    currency?: "USD" | "EUR" | "MXN";
    timezone?: string;
    notifications?: {
      email: boolean;
      marketing: boolean;
      product_updates: boolean;
    };
  };
}
```

### Subscription Management

#### GET `/api/user/subscription`

Get user's subscription details.

#### POST `/api/user/subscription/upgrade`

Upgrade subscription (redirects to Stripe).

#### POST `/api/user/subscription/cancel`

Cancel subscription.

### Usage Analytics

#### GET `/api/user/usage`

Get user's usage statistics.

**Response**:

```typescript
{
  success: true,
  data: {
    currentPeriod: {
      portfoliosCreated: number;
      aiEnhancementsUsed: number;
      customDomainUsed: boolean;
      analyticsEnabled: boolean;
    };
    limits: {
      maxPortfolios: number;
      maxAiEnhancements: number;
      customDomain: boolean;
      analytics: boolean;
      prioritySupport: boolean;
    };
    usage: {
      portfoliosUsed: number;
      aiEnhancementsUsed: number;
      storageUsed: number; // MB
    };
    billingCycle: {
      startDate: string;
      endDate: string;
      daysRemaining: number;
    };
  }
}
```

## ⚠️ Error Handling

### Error Response Format

```typescript
{
  success: false,
  error: string,           // Human-readable error message
  code?: string,          // Machine-readable error code
  details?: object,       // Additional error details
  timestamp: string,
  requestId: string
}
```

### HTTP Status Codes

| Status | Meaning      | Description                   |
| ------ | ------------ | ----------------------------- |
| 200    | OK           | Request successful            |
| 201    | Created      | Resource created successfully |
| 400    | Bad Request  | Invalid request data          |
| 401    | Unauthorized | Authentication required       |
| 403    | Forbidden    | Insufficient permissions      |
| 404    | Not Found    | Resource not found            |
| 429    | Rate Limited | Too many requests             |
| 500    | Server Error | Internal server error         |

### Common Error Codes

```typescript
// Authentication Errors
'AUTH_REQUIRED'; // User not authenticated
'AUTH_INVALID'; // Invalid credentials
'AUTH_EXPIRED'; // Session expired

// Permission Errors
'PERMISSION_DENIED'; // Insufficient permissions
'RESOURCE_FORBIDDEN'; // Cannot access resource

// Validation Errors
'VALIDATION_FAILED'; // Request validation failed
'INVALID_INPUT'; // Invalid input data
'MISSING_REQUIRED'; // Required field missing

// Resource Errors
'RESOURCE_NOT_FOUND'; // Resource doesn't exist
'RESOURCE_CONFLICT'; // Resource already exists
'RESOURCE_LIMIT'; // Resource limit exceeded

// External Service Errors
'AI_SERVICE_ERROR'; // AI service failure
'GITHUB_API_ERROR'; // GitHub API error
'RATE_LIMIT_EXCEEDED'; // Rate limit exceeded

// System Errors
'INTERNAL_ERROR'; // Internal server error
'SERVICE_UNAVAILABLE'; // Service temporarily unavailable
```

## 🛡️ Rate Limiting

### Rate Limits by Endpoint

| Endpoint Pattern   | Limit         | Window     | Notes                    |
| ------------------ | ------------- | ---------- | ------------------------ |
| `/api/auth/*`      | 5 requests    | 15 minutes | Authentication endpoints |
| `/api/ai/*`        | 10 requests   | 1 minute   | AI enhancement endpoints |
| `/api/portfolios`  | 60 requests   | 1 hour     | Portfolio operations     |
| `/api/analytics/*` | 30 requests   | 1 minute   | Analytics endpoints      |
| `/api/admin/*`     | 100 requests  | 1 minute   | Admin endpoints          |
| Global             | 1000 requests | 1 hour     | All endpoints combined   |

### Rate Limit Headers

```http
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 7
X-RateLimit-Reset: 1640995200
Retry-After: 60
```

### Rate Limit Response

```typescript
{
  success: false,
  error: "Rate limit exceeded",
  code: "RATE_LIMIT_EXCEEDED",
  details: {
    limit: 10,
    windowSeconds: 60,
    retryAfter: 45
  }
}
```

## 📚 Examples & SDKs

### JavaScript/TypeScript SDK (Future)

```typescript
import { PrismaAPI } from '@prisma/sdk';

const prisma = new PrismaAPI({
  apiKey: 'your-api-key',
  baseUrl: 'https://prisma.madfam.io/api',
});

// Enhance bio
const enhanced = await prisma.ai.enhanceBio({
  bio: 'I am a developer',
  context: { industry: 'technology' },
});

// Get portfolios
const portfolios = await prisma.portfolios.list({
  page: 1,
  limit: 10,
});

// Create portfolio
const portfolio = await prisma.portfolios.create({
  title: 'My Portfolio',
  templateId: 'developer-template',
});
```

### cURL Examples

#### Enhance Bio

```bash
curl -X POST https://prisma.madfam.io/api/ai/enhance-bio \
  -H "Authorization: Bearer your-token" \
  -H "Content-Type: application/json" \
  -d '{
    "bio": "I am a software developer with 5 years of experience",
    "context": {
      "industry": "technology",
      "experienceLevel": "senior"
    }
  }'
```

#### Get Portfolio

```bash
curl -X GET https://prisma.madfam.io/api/portfolios/123 \
  -H "Authorization: Bearer your-token"
```

#### Create Portfolio

```bash
curl -X POST https://prisma.madfam.io/api/portfolios \
  -H "Authorization: Bearer your-token" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My Developer Portfolio",
    "templateId": "developer-template",
    "content": {
      "bio": "Experienced full-stack developer...",
      "projects": [...],
      "skills": [...]
    }
  }'
```

### Python Example

```python
import requests

class PrismaAPI:
    def __init__(self, base_url, api_key):
        self.base_url = base_url
        self.headers = {
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json'
        }

    def enhance_bio(self, bio, context=None):
        response = requests.post(
            f'{self.base_url}/ai/enhance-bio',
            json={'bio': bio, 'context': context},
            headers=self.headers
        )
        return response.json()

# Usage
prisma = PrismaAPI('https://prisma.madfam.io/api', 'your-api-key')
result = prisma.enhance_bio(
    bio='I am a data scientist',
    context={'industry': 'healthcare', 'experienceLevel': 'mid'}
)
```

---

This API reference covers all current and planned endpoints for the PRISMA platform. For additional help, see our [Development Guide](./DEVELOPMENT.md) or [AI Features Documentation](./AI_FEATURES.md).

---

_API Reference last updated: June 15, 2025_

# GitHub Analytics Feature Documentation

**Version**: 0.0.1-alpha (Phase 1 MVP)  
**Author**: PRISMA Development Team  
**Date**: January 9, 2025

## Overview

The GitHub Analytics feature is an enterprise-grade analytics dashboard that provides comprehensive insights into GitHub repositories, development metrics, and team productivity. This feature integrates seamlessly with the existing PRISMA portfolio builder platform.

## Table of Contents

1. [Features](#features)
2. [Architecture](#architecture)
3. [Setup and Configuration](#setup-and-configuration)
4. [API Documentation](#api-documentation)
5. [User Guide](#user-guide)
6. [Development Guide](#development-guide)
7. [Security Considerations](#security-considerations)
8. [Troubleshooting](#troubleshooting)

## Features

### Phase 1 MVP Features (Completed)

#### Core Analytics
- **Repository Sync**: Automatic synchronization of GitHub repositories
- **Code Metrics**: Lines of code, file counts, and language distribution
- **Commit Analytics**: Commit frequency, contributor activity, and trends
- **Pull Request Metrics**: PR cycle time, merge rates, and review statistics
- **Contributor Insights**: Top contributors, activity levels, and contribution patterns

#### Dashboard Components
- **Overview Dashboard**: Aggregated metrics across all repositories
- **Repository Detail View**: Deep dive into individual repository analytics
- **Interactive Charts**: Recharts-powered visualizations with PRISMA theming
- **Real-time Data**: Live synchronization with GitHub via OAuth

#### User Experience
- **GitHub OAuth Integration**: Secure authentication with GitHub
- **Responsive Design**: Mobile-first design following PRISMA brand guidelines
- **Multilingual Support**: Spanish and English translations
- **Rate Limit Handling**: Intelligent rate limiting for GitHub API calls

## Architecture

### Database Schema

The analytics feature extends the existing PRISMA database with the following tables:

```sql
-- Core tables
github_integrations    -- OAuth tokens and integration settings
repositories          -- GitHub repository metadata
code_metrics         -- Daily snapshots of code metrics
pull_requests        -- PR data and calculated metrics
contributors         -- GitHub user information
repository_contributors -- Repository-contributor relationships
commit_analytics     -- Aggregated commit data
analytics_cache      -- Pre-calculated analytics cache
```

### API Endpoints

```
POST   /api/integrations/github/auth      # Initiate GitHub OAuth
GET    /api/integrations/github/callback  # OAuth callback handler
GET    /api/analytics/repositories        # List user repositories
POST   /api/analytics/repositories        # Sync repositories from GitHub
GET    /api/analytics/repositories/[id]   # Get repository analytics
POST   /api/analytics/repositories/[id]   # Sync repository data
GET    /api/analytics/dashboard           # Get dashboard data
```

### Key Services

1. **GitHubAnalyticsClient** (`lib/analytics/github/client.ts`)
   - Handles all GitHub API interactions
   - Implements rate limiting and error handling
   - Transforms GitHub data to internal format

2. **AnalyticsService** (`lib/services/analyticsService.ts`)
   - High-level service layer for analytics operations
   - Coordinates between GitHub API and database
   - Provides dashboard and repository analytics

3. **Database Layer**
   - Row Level Security (RLS) policies
   - Automated updated_at triggers
   - Performance-optimized indexes

## Setup and Configuration

### Environment Variables

Add the following to your `.env.local` file:

```env
# GitHub OAuth (Required for analytics)
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# App URL (for OAuth callback)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### GitHub OAuth App Setup

1. Go to GitHub → Settings → Developer settings → OAuth Apps
2. Create a new OAuth App with:
   - **Application name**: PRISMA Analytics
   - **Homepage URL**: `https://your-domain.com`
   - **Authorization callback URL**: `https://your-domain.com/api/integrations/github/callback`
3. Copy the Client ID and Client Secret to your environment variables

### Database Migration

Run the analytics migration:

```bash
# Apply the migration
supabase db push

# Or if using raw SQL
psql -h localhost -p 5432 -U postgres -d postgres -f supabase/migrations/20250109000002_github_analytics.sql
```

### Dependencies Installation

Install the required packages:

```bash
pnpm install @octokit/rest @octokit/auth-app recharts d3
```

## API Documentation

### Authentication

All analytics endpoints require user authentication. The user must have an active GitHub integration.

### GET /api/analytics/dashboard

Returns aggregated analytics data for the user's repositories.

**Response:**
```json
{
  "success": true,
  "data": {
    "repositories": [...],
    "overview": {
      "totalRepositories": 5,
      "totalCommits": 1247,
      "totalPullRequests": 89,
      "totalContributors": 12,
      "totalLinesOfCode": 45230,
      "mostActiveRepository": {...},
      "topContributors": [...]
    },
    "recentActivity": {...},
    "trends": {...}
  }
}
```

### POST /api/analytics/repositories

Syncs repositories from GitHub to the database.

**Request Body:**
```json
{
  "force": false  // Optional: force sync even if recently synced
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "repositories": [...],
    "synced": 5,
    "timestamp": "2025-01-09T12:00:00Z"
  }
}
```

### GET /api/analytics/repositories/[id]

Returns detailed analytics for a specific repository.

**Response:**
```json
{
  "success": true,
  "data": {
    "repository": {...},
    "metrics": {
      "current": {...},
      "history": [...]
    },
    "contributors": [...],
    "pullRequests": {...},
    "commits": {...},
    "languages": [...]
  }
}
```

## User Guide

### Getting Started

1. **Connect GitHub**: Navigate to `/analytics` and click "Connect GitHub"
2. **Authorize Access**: Complete the GitHub OAuth flow
3. **Sync Repositories**: Click "Sync" to import your repositories
4. **Explore Analytics**: View dashboard and individual repository insights

### Dashboard Features

#### Overview Cards
- **Repositories**: Total number of tracked repositories
- **Commits**: Total commits across all repositories
- **Pull Requests**: Total pull requests created
- **Contributors**: Unique contributors across all repositories
- **Lines of Code**: Total lines of code across all repositories

#### Visualizations
- **Commits Over Time**: Line chart showing daily commit activity
- **Pull Requests by Week**: Bar chart showing PR open/merge/close trends
- **Language Distribution**: Pie chart of programming languages used
- **Top Contributors**: List of most active contributors

#### Repository Details
- **Code Metrics**: Lines of code, file count, and language breakdown
- **Pull Request Stats**: Average cycle time, lead time, and merge rate
- **Contributor Activity**: Individual contributor statistics
- **Commit Patterns**: Activity by time of day and day of week

### Best Practices

1. **Regular Syncing**: Sync repositories weekly for accurate metrics
2. **Rate Limit Awareness**: Avoid frequent syncs to preserve GitHub API quota
3. **Data Privacy**: Only connect repositories you want to analyze
4. **Team Insights**: Use contributor metrics to identify knowledge silos

## Development Guide

### Adding New Metrics

1. **Database Schema**: Add new columns to `code_metrics` table
2. **Data Collection**: Update `GitHubAnalyticsClient` to fetch new data
3. **Processing**: Add calculation logic to `AnalyticsService`
4. **API**: Update endpoints to return new metrics
5. **UI**: Add visualizations to dashboard components

### Extending Visualizations

1. **Chart Components**: Create new chart components in `components/analytics/`
2. **Data Transformation**: Format data for chart consumption
3. **Styling**: Follow PRISMA color scheme and responsive design
4. **Internationalization**: Add translations for new labels

### Adding New Data Sources

1. **Client Integration**: Create new API client (e.g., GitLab, Bitbucket)
2. **Database Schema**: Add new tables for additional data
3. **Service Layer**: Extend `AnalyticsService` with new methods
4. **API Endpoints**: Create endpoints for new data sources
5. **UI Components**: Add UI for new integrations

## Security Considerations

### OAuth Token Security

- **Storage**: Tokens are stored in the database (encryption recommended for production)
- **Scope**: Minimal required permissions (`repo`, `read:user`, `user:email`)
- **Rotation**: Implement token refresh mechanism for long-term usage

### API Security

- **Authentication**: All endpoints require valid user session
- **Authorization**: Row Level Security ensures users only access their data
- **Rate Limiting**: GitHub API rate limits are respected and monitored
- **Input Validation**: All user inputs are validated and sanitized

### Data Privacy

- **Access Control**: Users can only access their own repository data
- **Data Retention**: Implement configurable data retention policies
- **Audit Trail**: All significant actions are logged
- **GDPR Compliance**: Provide data export and deletion capabilities

## Troubleshooting

### Common Issues

#### "GitHub integration required" Error
- **Cause**: User hasn't connected GitHub or integration is expired
- **Solution**: Navigate to `/analytics` and connect GitHub account

#### "Rate limit exceeded" Error
- **Cause**: Too many GitHub API requests
- **Solution**: Wait for rate limit reset or implement request queuing

#### Repository Not Syncing
- **Cause**: Repository access permissions or API errors
- **Solution**: Check repository permissions and GitHub API status

#### Missing Metrics
- **Cause**: Initial sync in progress or data calculation pending
- **Solution**: Wait for background processing to complete

### Debug Information

Enable debug logging by setting:
```env
NODE_ENV=development
ENABLE_DEBUG=true
```

### Performance Optimization

1. **Database Indexes**: Ensure proper indexing on frequently queried columns
2. **Caching**: Implement Redis caching for expensive calculations
3. **Pagination**: Use pagination for large datasets
4. **Background Jobs**: Process heavy calculations asynchronously

## Phase 2 Roadmap

### Advanced Code Quality Metrics
- Cyclomatic complexity analysis
- Code duplication detection
- Test coverage integration
- Technical debt estimation

### Enhanced Visualizations
- Heatmaps for code activity
- Network graphs for collaboration
- Advanced time-series analysis
- Custom dashboard widgets

### Team Management
- Team creation and management
- Multi-repository aggregation
- Role-based access control
- Custom reporting

### Integrations
- CI/CD pipeline metrics
- Issue tracking integration
- Slack/Teams notifications
- Webhook-based real-time updates

## Support

For technical support or feature requests:

1. **Documentation**: Check this guide and API documentation
2. **GitHub Issues**: Report bugs or request features
3. **Development Team**: Contact PRISMA development team
4. **Community**: Join PRISMA community discussions

---

**Last Updated**: January 9, 2025  
**Next Review**: January 23, 2025
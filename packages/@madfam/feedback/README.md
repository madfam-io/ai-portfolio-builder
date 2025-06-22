# @madfam/feedback

<p align="center">
  <img src="https://img.shields.io/badge/version-1.0.0-blue.svg" alt="Version" />
  <img src="https://img.shields.io/badge/license-MCAL--1.0-green.svg" alt="License" />
  <img src="https://img.shields.io/badge/typescript-%3E%3D5.0-blue.svg" alt="TypeScript" />
  <img src="https://img.shields.io/badge/coverage-95%25-brightgreen.svg" alt="Coverage" />
</p>

<p align="center">
  <strong>World-class feedback collection and analytics system for beta testing and user insights</strong>
</p>

<p align="center">
  Build better products with comprehensive user feedback, satisfaction surveys, and actionable analytics.
</p>

## ✨ Features

### 🎯 Core Features
- **Comprehensive Feedback Collection** - Bug reports, feature requests, improvements, and general feedback
- **Satisfaction Surveys** - NPS scores, satisfaction metrics, and user sentiment analysis
- **Advanced Analytics** - User journey tracking, feature usage analytics, and conversion funnels
- **Beta Launch Readiness** - Automated checks for performance, stability, features, and monitoring
- **Real-time Notifications** - Critical bug alerts via webhooks, Slack, and email
- **Flexible Storage** - Support for Supabase, Prisma, in-memory, or custom adapters

### 🚀 Enterprise Features
- **Multi-tenant Support** - Isolated feedback systems for different projects or teams
- **Advanced Security** - Data encryption, access controls, and audit logging
- **Custom Branding** - White-label the feedback widget to match your brand
- **API First** - RESTful API with TypeScript types for all operations
- **Scalable Architecture** - Handle millions of feedback entries efficiently
- **Export & Reporting** - Generate comprehensive reports and export data

## 📦 Installation

```bash
npm install @madfam/feedback
# or
yarn add @madfam/feedback
# or
pnpm add @madfam/feedback
```

## 🚀 Quick Start

```typescript
import { quickStart } from '@madfam/feedback';

// Initialize with in-memory storage (great for development)
const { feedbackSystem, analytics, betaChecker } = quickStart();

// Or with Supabase for production
const { feedbackSystem, analytics, betaChecker } = quickStart({
  storage: 'supabase',
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_KEY,
});
```

## 📖 Usage

### Basic Feedback Collection

```typescript
import { createFeedbackSystem } from '@madfam/feedback';

const feedback = createFeedbackSystem({
  storage: { type: 'supabase', options: { /* ... */ } },
  notifications: {
    criticalBugWebhook: 'https://your-webhook.com/critical',
    slackIntegration: {
      webhookUrl: 'https://hooks.slack.com/...',
      channel: '#bugs',
    },
  },
});

// Submit feedback
const entry = await feedback.submitFeedback({
  userId: 'user123',
  type: 'bug',
  severity: 'high',
  title: 'Payment button not working',
  description: 'The payment button is disabled on checkout',
  category: 'payments',
  userAgent: navigator.userAgent,
  url: window.location.href,
  tags: ['payments', 'checkout', 'urgent'],
  rating: 2,
});

// Get feedback with filters
const bugs = await feedback.getFeedback({
  type: 'bug',
  severity: 'critical',
  status: 'open',
  limit: 50,
});
```

### Satisfaction Surveys

```typescript
// Submit a satisfaction survey
const survey = await feedback.submitSurvey({
  userId: 'user123',
  overallSatisfaction: 8,
  easeOfUse: 9,
  performance: 7,
  features: 8,
  design: 9,
  likelihoodToRecommend: 9, // NPS score
  mostUsefulFeature: 'AI-powered suggestions',
  leastUsefulFeature: 'Complex navigation',
  missingFeatures: ['Dark mode', 'Mobile app'],
  additionalComments: 'Great product overall!',
  completionContext: 'post-purchase',
  completedIn: 120, // seconds
});

// Calculate NPS score
const nps = await feedback.calculateNPS();
console.log(`Current NPS: ${nps}`);
```

### Analytics & Insights

```typescript
import { createBetaAnalytics } from '@madfam/feedback';

const analytics = createBetaAnalytics();

// Track user journey
await analytics.trackPortfolioJourney('user123', 'template_selected', {
  duration: 5000,
  completed: true,
  metadata: { template: 'professional' },
});

// Track feature usage
await analytics.trackFeatureUsage('user123', 'ai_enhancement', 'clicked', {
  value: 'bio_improvement',
});

// Get conversion funnel
const funnel = await analytics.getConversionFunnel([
  'landing_page',
  'signup',
  'template_selection',
  'customization',
  'publish',
]);

// Get behavior insights
const insights = await analytics.getUserBehaviorInsights();
```

### Beta Launch Readiness

```typescript
import { createBetaLaunchChecker } from '@madfam/feedback';

const checker = createBetaLaunchChecker(feedbackSystem, analytics, {
  performanceTargets: {
    responseTime: 200, // ms
    errorRate: 1, // %
    uptime: 99.5, // %
  },
  stabilityRequirements: {
    maxCriticalBugs: 0,
    maxHighBugs: 5,
    crashFreeRate: 99, // %
  },
});

// Check if ready for beta
const readiness = await checker.checkReadiness();
console.log(`Beta ready: ${readiness.ready} (${readiness.score}/100)`);

// Get detailed report with recommendations
const detailedReport = await checker.generateDetailedReport();
```

## 🎨 React Components

```tsx
import { FeedbackProvider, FeedbackWidget } from '@madfam/feedback/react';

function App() {
  return (
    <FeedbackProvider system={feedbackSystem}>
      <YourApp />
      <FeedbackWidget 
        userId={user.id}
        position="bottom-right"
        theme="auto"
      />
    </FeedbackProvider>
  );
}
```

## 🔧 Configuration

### Full Configuration Example

```typescript
const feedback = createFeedbackSystem({
  // Storage configuration
  storage: {
    type: 'supabase',
    options: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseKey: process.env.SUPABASE_KEY,
      tablePrefix: 'beta_', // Optional table prefix
    },
  },

  // Analytics integration
  analytics: {
    enabled: true,
    provider: 'posthog',
    apiKey: process.env.POSTHOG_API_KEY,
  },

  // Notification settings
  notifications: {
    criticalBugWebhook: process.env.CRITICAL_BUG_WEBHOOK,
    emailOnCritical: 'team@company.com',
    slackIntegration: {
      webhookUrl: process.env.SLACK_WEBHOOK,
      channel: '#feedback',
    },
    customWebhooks: [
      {
        url: 'https://api.company.com/feedback',
        events: ['feedback:critical', 'survey:completed'],
        headers: { 'X-API-Key': 'secret' },
      },
    ],
  },

  // UI configuration
  ui: {
    position: 'bottom-right',
    theme: 'auto',
    primaryColor: '#3B82F6',
    zIndex: 9999,
  },

  // Feature flags
  features: {
    surveys: {
      enabled: true,
      triggers: {
        afterPortfolioCreation: true,
        afterPublishing: true,
        weeklyActiveUsers: true,
        beforeChurn: true,
      },
    },
    analytics: {
      enabled: true,
      trackingLevel: 'detailed',
    },
    fileAttachments: true,
    customFields: true,
  },

  // Limits and retention
  maxFeedbackEntries: 10000,
  feedbackRetentionDays: 365,
  analyticsRetentionDays: 90,
});
```

## 🗄️ Storage Adapters

### Supabase Setup

1. Run the migration file:
```sql
-- Run src/storage/migrations/supabase/001_create_feedback_tables.sql
```

2. Configure the adapter:
```typescript
const feedback = createFeedbackSystem({
  storage: {
    type: 'supabase',
    options: {
      supabaseUrl: 'https://your-project.supabase.co',
      supabaseKey: 'your-anon-key',
    },
  },
});
```

### Custom Storage Adapter

```typescript
import { BaseStorageAdapter } from '@madfam/feedback';

class MyCustomAdapter extends BaseStorageAdapter {
  // Implement required methods
}

const feedback = createFeedbackSystem({
  storage: {
    type: 'custom',
    options: {
      adapter: new MyCustomAdapter(),
    },
  },
});
```

## 📊 Events

The feedback system emits various events for real-time updates:

```typescript
feedback.on('feedback:created', (entry) => {
  console.log('New feedback:', entry);
});

feedback.on('feedback:critical', (entry) => {
  // Handle critical feedback immediately
  alertTeam(entry);
});

feedback.on('survey:created', (survey) => {
  // Update dashboard with new NPS data
  updateNPSDashboard(survey);
});

analytics.on('journey:progress', (data) => {
  // Track user progression
  updateUserJourney(data);
});
```

## 🧪 Testing

```typescript
import { MemoryStorageAdapter } from '@madfam/feedback';

// Use in-memory storage for tests
const testFeedback = createFeedbackSystem({
  storage: { type: 'memory' },
});

// Test utilities
const storage = new MemoryStorageAdapter();
storage.setHealth(false); // Simulate unhealthy storage
storage.clear(); // Clear all data
const stats = storage.getStats(); // Get storage statistics
```

## 📈 Performance

- **Efficient Storage**: Optimized queries with proper indexing
- **Caching**: Built-in caching for metrics and trends
- **Batch Operations**: Event batching for analytics
- **Pagination**: Automatic pagination for large datasets
- **Async Operations**: Non-blocking API calls

## 🔒 Security

- **Input Validation**: Comprehensive validation with Zod
- **XSS Prevention**: Automatic input sanitization
- **Access Control**: RLS support for Supabase
- **Data Encryption**: Support for encrypted storage
- **Audit Logging**: Track all operations

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

This software is licensed under the MADFAM Code Available License (MCAL) v1.0.

- ✅ Use for personal projects
- ✅ Use for educational purposes
- ✅ Use for internal business purposes
- ❌ Commercial use requires license
- ❌ Redistribution requires permission

For commercial licensing: licensing@madfam.io

## 🏆 Built by MADFAM

Part of the MADFAM ecosystem of world-class developer tools.

---

<p align="center">
  <a href="https://madfam.io">Website</a> •
  <a href="https://github.com/madfam-io/feedback">GitHub</a> •
  <a href="https://docs.madfam.io/feedback">Documentation</a> •
  <a href="https://madfam.io/support">Support</a>
</p>
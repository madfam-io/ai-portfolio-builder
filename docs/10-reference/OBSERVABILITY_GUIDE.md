# Observability Guide: PostHog + SigNoz

This guide explains how PostHog (product analytics) and SigNoz (technical APM) work together to provide complete observability for the AI Portfolio Builder.

## Overview

### The Two Pillars of Observability

1. **PostHog**: Answers "What are users doing?"

   - User behavior tracking
   - Feature adoption metrics
   - Conversion funnels
   - A/B testing results

2. **SigNoz**: Answers "How is the system performing?"
   - Response times and latency
   - Error rates and exceptions
   - Resource utilization
   - Distributed tracing

### The Synergy

When combined, they answer: **"How does system performance impact user behavior?"**

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                        User Action                            │
└────────────────┬─────────────────────────┬───────────────────┘
                 │                         │
                 ▼                         ▼
        ┌────────────────┐        ┌────────────────┐
        │    PostHog     │        │    SigNoz      │
        │                │        │                │
        │ • User clicked │◀──────▶│ • API latency  │
        │ • Feature used │ Trace  │ • DB queries   │
        │ • Revenue      │   ID   │ • Errors       │
        └────────────────┘        └────────────────┘
                 │                         │
                 └─────────┬───────────────┘
                           ▼
                  ┌─────────────────┐
                  │ Unified Insights │
                  │                 │
                  │ "Slow API calls │
                  │ reduce feature  │
                  │ adoption by 40%"│
                  └─────────────────┘
```

## Implementation Examples

### 1. Basic Event Correlation

```typescript
import { track } from '@/lib/monitoring/unified/events';

// This single call creates data in both systems
await track.portfolio.create(
  portfolioId,
  async () => {
    // SigNoz traces the technical execution
    return await db.portfolio.create(data);
  },
  {
    // PostHog tracks the business context
    template: 'professional',
    ai_assisted: true,
  }
);
```

**Result**:

- PostHog: "User created portfolio with professional template"
- SigNoz: "DB insert took 45ms, total operation 120ms"
- Correlation: Both events share the same trace_id

### 2. AI Feature Monitoring

```typescript
// Track AI enhancement with full observability
const enhancedBio = await track.ai.enhance(
  'bio',
  'llama-3.1',
  async () => {
    // SigNoz tracks:
    // - HuggingFace API call duration
    // - Token processing time
    // - Any errors or retries

    const result = await huggingface.inference({
      model: 'llama-3.1',
      prompt: userBio,
    });

    return result;
  },
  {
    // PostHog tracks:
    portfolio_id: portfolioId,
    word_count: 150,
    quality_score: 0.85,
  }
);
```

**Insights you can derive**:

- Average AI generation time vs user satisfaction
- Token usage patterns by user segment
- Performance impact on feature adoption

### 3. Revenue Operations

```typescript
// Track payment with performance correlation
const payment = await track.revenue.payment(
  99.0,
  async () => {
    // SigNoz monitors Stripe API performance
    return await stripe.charges.create({
      amount: 9900,
      currency: 'usd',
      source: token,
    });
  },
  {
    plan: 'professional',
    payment_method: 'card',
  }
);
```

**Correlation insights**:

- Payment failures correlated with API timeouts
- Conversion rate impact of slow checkout
- Revenue loss from performance issues

## Correlation Patterns

### 1. User Journey Tracking

```typescript
// Create a correlated session
const session = new CorrelatedSession(userId);

// Track multiple actions in the journey
session.trackEvent('landing_page_viewed');
session.trackEvent('signup_started');

await track.user.signUp({
  method: 'email',
  source: 'landing_page',
});

session.trackEvent('onboarding_started');
session.end();
```

### 2. Performance-Aware Feature Flags

```typescript
// Disable features based on performance
const shouldEnableAI = async () => {
  const metrics = await getPerformanceMetrics();

  // Check if AI inference is performing well
  if (metrics.ai.p95_latency > 3000) {
    // Track why feature was disabled
    track.event('ai_feature_disabled', {
      reason: 'high_latency',
      p95_latency: metrics.ai.p95_latency,
    });
    return false;
  }

  return true;
};
```

### 3. Error Impact Analysis

```typescript
// Track how errors affect user behavior
export const withErrorTracking = handler => {
  return async (...args) => {
    try {
      return await handler(...args);
    } catch (error) {
      // SigNoz records the technical error
      span.recordException(error);

      // PostHog tracks the user impact
      captureEvent('feature_error_encountered', {
        feature: handler.name,
        error_type: error.constructor.name,
        user_journey_stage: getCurrentJourneyStage(),
      });

      throw error;
    }
  };
};
```

## Dashboards and Queries

### 1. Unified Performance Dashboard

Combine metrics from both systems:

```sql
-- SigNoz Query: API Performance
SELECT
  quantile(0.95)(duration) as p95_latency,
  count(*) as request_count,
  sum(error) / count(*) as error_rate
FROM spans
WHERE service_name = 'ai-portfolio-builder'
GROUP BY endpoint

-- PostHog Query: Feature Usage
SELECT
  properties.endpoint,
  count(distinct person_id) as unique_users,
  count(*) as total_events
FROM events
WHERE event = 'api_request'
GROUP BY properties.endpoint
```

### 2. Conversion Impact Analysis

```javascript
// Correlate performance with conversions
const performanceImpact = {
  // From SigNoz
  avgLatency: await signoz.query(`
    avg(duration) WHERE operation = 'portfolio.create'
  `),

  // From PostHog
  conversionRate: await posthog.query(`
    funnel(['landing_viewed', 'signup', 'portfolio_created'])
  `),

  // Correlation
  correlation: correlate(performanceMetrics, conversionMetrics),
};
```

### 3. AI Cost vs Value Dashboard

Track AI usage efficiency:

```typescript
const aiMetrics = {
  // Technical metrics (SigNoz)
  avgInferenceTime: 2.3, // seconds
  tokenUsage: 150000, // daily
  errorRate: 0.02,

  // Business metrics (PostHog)
  aiGenerations: 500, // daily
  acceptanceRate: 0.75,
  userSatisfaction: 4.2, // out of 5

  // Calculated metrics
  costPerGeneration: 0.05, // USD
  valuePerGeneration: 0.2, // based on conversion uplift
  roi: 4.0, // 400% ROI
};
```

## Alerts and Monitoring

### 1. Correlated Alerts

```yaml
# Alert when performance impacts business metrics
- name: high_latency_low_conversion
  condition: |
    signoz.latency.p95 > 3000 AND
    posthog.conversion_rate < 0.02
  severity: critical
  action: page_oncall
```

### 2. Proactive Monitoring

```typescript
// Monitor feature performance impact
const featureHealthCheck = async () => {
  const performance = await getPerformanceMetrics('ai_enhancement');
  const usage = await getUsageMetrics('ai_enhancement');

  if (performance.p95 > 5000 && usage.daily_count > 100) {
    // High latency with high usage = problem
    await createIncident({
      title: 'AI Enhancement Performance Degradation',
      impact: `${usage.daily_count} users affected`,
      metrics: { performance, usage },
    });
  }
};
```

## Best Practices

### 1. Consistent Event Naming

```typescript
// Good: Hierarchical and consistent
'user.signup.completed';
'portfolio.create.started';
'ai.enhance.bio.success';

// Bad: Inconsistent
'UserSignedUp';
'created_portfolio';
'bio-enhanced';
```

### 2. Rich Context

Always include relevant context:

```typescript
track.portfolio.update(portfolioId, operation, {
  // User context
  user_id: userId,
  user_plan: 'professional',

  // Feature context
  feature: 'drag_and_drop',
  section: 'experience',

  // Performance context
  client_render_time: 150,

  // Business context
  portfolio_value: 'high',
  engagement_score: 85,
});
```

### 3. Sampling Strategy

Balance data volume with insights:

```typescript
// Sample by user segment
const shouldTrack = (userId: string, event: string) => {
  const user = getUser(userId);

  // Always track paid users
  if (user.plan !== 'free') return true;

  // Sample 10% of free users
  if (hash(userId) % 10 === 0) return true;

  // Always track critical events
  if (criticalEvents.includes(event)) return true;

  return false;
};
```

## Troubleshooting Correlations

### Missing Trace IDs in PostHog

```typescript
// Verify trace context is available
console.log('Current trace ID:', getCurrentTraceId());

// Ensure correlation is enabled
console.log('Correlation enabled:', process.env.ENABLE_TRACE_CORRELATION);
```

### Metrics Mismatch

Common causes:

1. Different time windows
2. Sampling differences
3. Filter misalignment

Solution:

```typescript
// Use consistent time windows
const timeRange = {
  start: new Date('2024-01-01'),
  end: new Date('2024-01-31'),
};

const signozData = await querySignoz(timeRange);
const posthogData = await queryPostHog(timeRange);
```

## ROI and Business Value

### Quantifying Observability Value

1. **Performance → Revenue**

   ```
   1s latency reduction = 7% conversion increase
   7% conversion increase = $70K/month additional revenue
   ```

2. **Error Reduction → User Retention**

   ```
   50% error reduction = 20% better retention
   20% better retention = 15% higher LTV
   ```

3. **Feature Optimization → Engagement**
   ```
   AI response time < 2s = 85% feature adoption
   AI response time > 5s = 35% feature adoption
   ```

## Next Steps

1. Set up both PostHog and SigNoz
2. Implement unified tracking in critical paths
3. Create correlated dashboards
4. Set up alerts for business impact
5. Regular review of insights

Remember: The goal is not just to collect data, but to understand how technical performance drives business outcomes.

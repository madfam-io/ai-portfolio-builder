# 🧪 Experiments & A/B Testing System

## Overview

The PRISMA Experiments system provides a comprehensive framework for running A/B tests, multivariate experiments, and feature flags to optimize user experience and conversion rates.

**Last Updated**: December 2024  
**Version**: 0.3.0-beta

## 🎯 Purpose

Enable data-driven decision making through:

- **A/B Testing**: Compare two versions to find the winner
- **Multivariate Testing**: Test multiple variables simultaneously
- **Feature Flags**: Gradual rollouts and instant rollbacks
- **User Segmentation**: Target specific user groups

## 🏗️ Architecture

### System Overview

```
┌─────────────────────────────────────────────────────┐
│                 Experiments Engine                   │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐│
│  │  Targeting  │  │  Allocation │  │  Tracking   ││
│  │   Engine    │  │   System    │  │   System    ││
│  └─────────────┘  └─────────────┘  └─────────────┘│
│                                                     │
│  ┌─────────────────────────────────────────────┐  │
│  │           Statistical Analysis               │  │
│  │  Confidence | Significance | Sample Size     │  │
│  └─────────────────────────────────────────────┘  │
│                                                     │
│  ┌─────────────────────────────────────────────┐  │
│  │              Admin Dashboard                 │  │
│  │  Create | Monitor | Analyze | Decide         │  │
│  └─────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

### Data Model

```typescript
interface Experiment {
  id: string;
  name: string;
  description: string;
  hypothesis: string;

  // Experiment Configuration
  type: 'ab_test' | 'multivariate' | 'feature_flag';
  status: 'draft' | 'running' | 'paused' | 'completed';

  // Targeting Rules
  targeting: {
    audiences: string[];
    percentage: number; // 0-100
    conditions?: {
      userProperty?: string;
      operator: 'equals' | 'contains' | 'greater_than' | 'less_than';
      value: any;
    }[];
  };

  // Variants
  variants: Array<{
    id: string;
    name: string;
    description?: string;
    weight: number; // Traffic percentage
    changes: Record<string, any>;
    isControl?: boolean;
  }>;

  // Metrics
  primaryMetric: string;
  secondaryMetrics?: string[];

  // Results
  results?: {
    sampleSize: number;
    confidence: number;
    winner?: string;
    uplift?: number;
    variantResults: Record<string, VariantResult>;
  };

  // Timeline
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

## 🛠️ Admin Panel Usage

### 1. Creating an Experiment

Navigate to `/admin/experiments/new`:

```typescript
// Example: Homepage CTA Test
{
  name: "Homepage CTA Button Test",
  description: "Test different CTA button texts to improve conversion",
  hypothesis: "More action-oriented text will increase click-through rate",
  type: "ab_test",

  targeting: {
    audiences: ["all_users"],
    percentage: 50 // Run on 50% of traffic
  },

  variants: [
    {
      name: "Control",
      weight: 50,
      isControl: true,
      changes: {
        ctaText: "Get Started"
      }
    },
    {
      name: "Variant A",
      weight: 50,
      changes: {
        ctaText: "Start Building Now"
      }
    }
  ],

  primaryMetric: "cta_click_rate",
  secondaryMetrics: ["signup_rate", "time_to_signup"]
}
```

### 2. Managing Experiments

#### Dashboard View (`/admin/experiments`)

- **Active Experiments**: Real-time performance monitoring
- **Draft Experiments**: Experiments awaiting launch
- **Completed Experiments**: Historical results and learnings

#### Experiment Controls

```typescript
// Start an experiment
await startExperiment(experimentId);

// Pause for analysis
await pauseExperiment(experimentId);

// End and analyze
await completeExperiment(experimentId);

// Emergency stop
await killExperiment(experimentId);
```

### 3. Monitoring Performance

Real-time metrics displayed in the dashboard:

- **Sample Size**: Current participants per variant
- **Conversion Rates**: Primary metric performance
- **Statistical Significance**: Confidence level
- **Estimated Time to Significance**: Based on current traffic

## 📊 Implementation Guide

### 1. Client-Side Integration

```typescript
// Hook for accessing experiments
import { useExperiment } from '@/hooks/useExperiment';

export function Homepage() {
  const { variant, trackEvent } = useExperiment('homepage-cta-test');

  const handleCTAClick = () => {
    trackEvent('cta_clicked');
    // Navigate to signup
  };

  return (
    <Hero>
      <button onClick={handleCTAClick}>
        {variant?.changes?.ctaText || 'Get Started'}
      </button>
    </Hero>
  );
}
```

### 2. Server-Side Integration

```typescript
// API route with experiment allocation
export async function GET(request: Request) {
  const userId = getUserId(request);
  const experiment = await getActiveExperiment('pricing-test');

  const variant = await allocateVariant({
    experimentId: experiment.id,
    userId,
    userAttributes: await getUserAttributes(userId),
  });

  // Track exposure
  await trackExperimentExposure({
    experimentId: experiment.id,
    variantId: variant.id,
    userId,
  });

  return Response.json({
    pricing: variant.changes.pricing,
  });
}
```

### 3. Event Tracking

```typescript
// Track conversion events
import { trackExperimentEvent } from '@/lib/services/experiments';

// In your conversion flow
export async function handleSignup(userData: SignupData) {
  const user = await createUser(userData);

  // Track for all active experiments
  await trackExperimentEvent({
    userId: user.id,
    event: 'signup_completed',
    properties: {
      plan: userData.plan,
      source: userData.referralSource,
    },
  });

  return user;
}
```

## 🎯 Best Practices

### 1. Experiment Design

**DO:**

- Start with a clear hypothesis
- Define success metrics upfront
- Run experiments for full business cycles
- Document learnings regardless of outcome

**DON'T:**

- Change experiments mid-flight
- Stop tests too early
- Run conflicting experiments simultaneously
- Ignore secondary metrics

### 2. Sample Size Calculation

```typescript
// Use built-in calculator
const sampleSize = calculateSampleSize({
  baselineConversion: 0.05, // 5% current conversion
  minimumDetectableEffect: 0.01, // 1% improvement
  statisticalPower: 0.8, // 80% power
  significanceLevel: 0.05, // 95% confidence
});
// Result: 3,842 users per variant
```

### 3. Statistical Significance

Wait for 95% confidence before making decisions:

```typescript
const results = await getExperimentResults(experimentId);

if (results.confidence >= 0.95) {
  // Make decision
  if (results.winner === 'variant-a') {
    await promoteVariant('variant-a');
  }
} else {
  // Continue running
  console.log(`Need ${results.remainingSampleSize} more users`);
}
```

## 🔧 Advanced Features

### 1. Multivariate Testing

Test multiple elements simultaneously:

```typescript
const multivariateTest = {
  name: 'Landing Page Optimization',
  type: 'multivariate',
  variants: [
    {
      name: 'Headline A + Image 1 + CTA Blue',
      changes: {
        headline: 'Build Portfolios Fast',
        heroImage: 'speed-focused.jpg',
        ctaColor: '#0066cc',
      },
    },
    {
      name: 'Headline B + Image 2 + CTA Green',
      changes: {
        headline: 'Professional Portfolios Made Easy',
        heroImage: 'professional-focused.jpg',
        ctaColor: '#00aa00',
      },
    },
    // ... more combinations
  ],
};
```

### 2. User Segmentation

Target specific user groups:

```typescript
const segmentedExperiment = {
  name: 'Premium Upsell Test',
  targeting: {
    audiences: ['free_users'],
    conditions: [
      {
        userProperty: 'signupDate',
        operator: 'greater_than',
        value: '30_days_ago',
      },
      {
        userProperty: 'portfoliosCreated',
        operator: 'greater_than',
        value: 2,
      },
    ],
  },
};
```

### 3. Feature Flags

Gradual rollouts with kill switch:

```typescript
const featureFlag = {
  name: 'new-editor-rollout',
  type: 'feature_flag',
  targeting: {
    percentage: 10, // Start with 10%
  },
  variants: [
    {
      name: 'enabled',
      weight: 100,
      changes: { newEditor: true },
    },
  ],
};

// Gradual increase
await updateExperimentTargeting(featureFlag.id, {
  percentage: 25, // Increase to 25%
});
```

## 📈 Analytics Integration

### PostHog Events

Experiments automatically send events to PostHog:

```typescript
// Automatic events
posthog.capture('experiment_exposure', {
  experiment_id: 'homepage-cta-test',
  variant_id: 'variant-a',
  variant_name: 'Action-Oriented CTA',
});

posthog.capture('experiment_conversion', {
  experiment_id: 'homepage-cta-test',
  variant_id: 'variant-a',
  metric: 'signup_completed',
});
```

### Custom Dashboards

Create PostHog dashboards for experiment monitoring:

1. Experiment funnel analysis
2. Variant performance comparison
3. User segment breakdown
4. Time-series conversion rates

## 🚨 Troubleshooting

### Common Issues

1. **Low Statistical Power**

   - Increase traffic allocation
   - Extend experiment duration
   - Focus on bigger changes

2. **Conflicting Experiments**

   - Use mutual exclusion groups
   - Coordinate experiment calendar
   - Monitor interaction effects

3. **Implementation Bugs**
   - Use experiment preview mode
   - Implement proper QA process
   - Monitor error rates by variant

### Debug Tools

```typescript
// Enable debug mode
localStorage.setItem('experiments_debug', 'true');

// View current allocations
console.log(window.__EXPERIMENTS__);

// Force specific variant
localStorage.setItem(
  'experiment_overrides',
  JSON.stringify({
    'homepage-cta-test': 'variant-a',
  })
);
```

## 📚 Resources

- [Statistical Significance Calculator](https://www.optimizely.com/sample-size-calculator/)
- [A/B Testing Statistics Guide](https://www.evanmiller.org/ab-testing/)
- [Experimentation Best Practices](https://experimentguide.com/)

---

For support with the Experiments system, contact the PRISMA development team.

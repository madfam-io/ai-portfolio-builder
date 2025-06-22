# @madfam/experiments

<p align="center">
  <img src="https://img.shields.io/badge/version-1.0.0-blue.svg" alt="Version" />
  <img src="https://img.shields.io/badge/license-MIT-green.svg" alt="License" />
  <img src="https://img.shields.io/badge/typescript-%3E%3D5.0-blue.svg" alt="TypeScript" />
  <img src="https://img.shields.io/badge/coverage-95%25-brightgreen.svg" alt="Coverage" />
</p>

<p align="center">
  <strong>Enterprise-grade A/B testing and feature flags system with real-time analytics</strong>
</p>

<p align="center">
  Ship faster with confidence using powerful experimentation tools and feature management.
</p>

## ✨ Features

### 🎯 Core Features
- **A/B Testing** - Run split tests with multiple variations
- **Feature Flags** - Toggle features on/off without deployments
- **Multivariate Testing** - Test multiple variables simultaneously
- **Audience Targeting** - Target specific user segments
- **Real-time Analytics** - Track performance metrics instantly
- **Statistical Significance** - Built-in statistical analysis

### 🚀 Advanced Features
- **Progressive Rollouts** - Gradually release features to users
- **Kill Switches** - Instantly disable problematic features
- **Mutual Exclusion** - Prevent experiment conflicts
- **Sticky Bucketing** - Consistent user experiences
- **Custom Metrics** - Track any business metric
- **Integrations** - Works with popular analytics tools

## 📦 Installation

```bash
npm install @madfam/experiments
# or
yarn add @madfam/experiments
# or
pnpm add @madfam/experiments
```

## 🚀 Quick Start

### Basic Setup

```typescript
import { createExperiments } from '@madfam/experiments';

const experiments = createExperiments({
  enableAnalytics: true,
  cacheStrategy: {
    type: 'localStorage',
    ttl: 3600000, // 1 hour
  },
});

// Register an A/B test
await experiments.registerExperiment({
  id: 'checkout-flow-v2',
  name: 'Checkout Flow Redesign',
  status: 'running',
  type: 'a/b',
  variations: [
    { id: 'control', name: 'Current Flow', weight: 50, isControl: true },
    { id: 'treatment', name: 'New Flow', weight: 50 },
  ],
  metrics: [
    { id: 'conversion', name: 'Purchase Conversion', type: 'conversion' },
    { id: 'revenue', name: 'Revenue per User', type: 'revenue' },
  ],
});

// Get variation for user
const assignment = await experiments.getVariation('checkout-flow-v2', {
  userId: 'user-123',
  attributes: {
    country: 'US',
    isPremium: true,
  },
});
```

### React Integration

```tsx
import { ExperimentsProvider, Experiment, FeatureFlag } from '@madfam/experiments/react';

function App() {
  return (
    <ExperimentsProvider experiments={experiments} user={currentUser}>
      <HomePage />
    </ExperimentsProvider>
  );
}

function HomePage() {
  return (
    <>
      {/* A/B Test */}
      <Experiment
        experimentId="hero-banner-test"
        control={<HeroBannerV1 />}
        variations={{
          'new-design': <HeroBannerV2 />,
          'minimal': <HeroBannerMinimal />,
        }}
      />

      {/* Feature Flag */}
      <FeatureFlag flag="new-search">
        <EnhancedSearch />
      </FeatureFlag>
    </>
  );
}
```

## 📖 Usage

### Feature Flags

```typescript
// Simple boolean flag
await experiments.registerFlag({
  key: 'dark-mode',
  name: 'Dark Mode',
  enabled: true,
  defaultValue: false,
  rolloutPercentage: 20, // 20% of users
});

// Flag with variations
await experiments.registerFlag({
  key: 'pricing-model',
  name: 'Pricing Model Test',
  enabled: true,
  type: 'string',
  defaultValue: 'current',
  variations: [
    { id: 'current', value: 'current', weight: 60 },
    { id: 'simplified', value: 'simplified', weight: 20 },
    { id: 'tiered', value: 'tiered', weight: 20 },
  ],
});

// Evaluate flag
const { enabled, value } = await experiments.evaluateFlag('pricing-model', {
  userId: 'user-123',
});
```

### Audience Targeting

```typescript
await experiments.registerExperiment({
  id: 'premium-upsell',
  name: 'Premium Upsell Test',
  status: 'running',
  type: 'a/b',
  targeting: {
    enabled: true,
    audiences: [{
      id: 'free-users',
      name: 'Free Plan Users',
      conditions: [
        { attribute: 'plan', operator: 'equals', value: 'free' },
        { attribute: 'daysActive', operator: 'greater_than', value: 7 },
      ],
      operator: 'AND',
    }],
    percentage: 50, // Only 50% of eligible users
  },
  variations: [
    { id: 'control', weight: 50, isControl: true },
    { id: 'discount', weight: 25, changes: { discount: 0.2 } },
    { id: 'trial', weight: 25, changes: { trialDays: 14 } },
  ],
});
```

### Tracking Events

```typescript
// Track conversion
await experiments.trackConversion(
  'checkout-flow-v2',
  'user-123',
  'purchase_completed',
  {
    amount: 99.99,
    currency: 'USD',
    items: 3,
  }
);

// Track custom metric
await experiments.trackMetric(
  'search-algorithm-test',
  'user-123',
  'search_relevance_score',
  0.85,
  {
    query: 'javascript frameworks',
    resultsCount: 42,
  }
);
```

### React Hooks

```tsx
import { useExperiment, useFeatureFlag, useExperimentResults } from '@madfam/experiments/react';

function ProductPage() {
  // Use experiment
  const { variation, trackConversion } = useExperiment('product-page-layout');

  // Use feature flag
  const { enabled: showReviews } = useFeatureFlag('product-reviews');

  // Track conversion
  const handlePurchase = async () => {
    await trackConversion('purchase_completed', { productId: '123' });
  };

  return (
    <div className={variation?.id === 'new' ? 'new-layout' : 'default-layout'}>
      <ProductDetails />
      {showReviews && <ProductReviews />}
      <button onClick={handlePurchase}>Buy Now</button>
    </div>
  );
}

function ExperimentDashboard() {
  const { results, loading, refresh } = useExperimentResults('checkout-flow-v2');

  if (loading) return <div>Loading results...</div>;

  return (
    <div>
      <h2>Experiment Results</h2>
      <p>Status: {results?.status}</p>
      <p>Sample Size: {results?.sampleSize}</p>
      {results?.winner && (
        <p>Winner: {results.winner} (Confidence: {results.confidence}%)</p>
      )}
      <button onClick={refresh}>Refresh</button>
    </div>
  );
}
```

## 🎨 Components

### Experiment Component

```tsx
<Experiment
  experimentId="onboarding-flow"
  control={<OnboardingV1 />}
  variations={{
    'guided': <GuidedOnboarding />,
    'video': <VideoOnboarding />,
    'interactive': <InteractiveOnboarding />,
  }}
  fallback={<LoadingSpinner />}
  onExposure={(variationId) => {
    analytics.track('Experiment Viewed', { variationId });
  }}
/>
```

### Feature Flags

```tsx
// Simple flag
<FeatureFlag flag="new-header">
  <NewHeader />
</FeatureFlag>

// With fallback
<FeatureFlag flag="beta-feature" fallback={<ComingSoon />}>
  <BetaFeature />
</FeatureFlag>

// Inverted (show when disabled)
<FeatureFlag flag="maintenance-mode" invert>
  <MainApp />
</FeatureFlag>
```

### Feature Switch

```tsx
<FeatureSwitch
  flag="theme"
  cases={{
    'light': <LightTheme />,
    'dark': <DarkTheme />,
    'auto': <AutoTheme />,
  }}
  default={<LightTheme />}
/>
```

### Conditional Rendering

```tsx
// When flag equals specific value
<When flag="plan" is="premium">
  <PremiumFeatures />
</When>

// Unless flag equals value
<Unless flag="browser" is="ie11">
  <ModernFeatures />
</Unless>
```

## 🔧 Configuration

### Full Configuration Example

```typescript
const experiments = createExperiments({
  provider: {
    name: 'LaunchDarkly',
    type: 'launchdarkly',
    config: {
      sdkKey: process.env.LD_SDK_KEY,
      environment: 'production',
    },
  },

  defaultAllocation: {
    type: 'deterministic',
    sticky: true,
    seed: 'my-app-seed',
  },

  enableAnalytics: true,
  enableDebugMode: process.env.NODE_ENV === 'development',
  refreshInterval: 60000, // 1 minute

  cacheStrategy: {
    type: 'localStorage',
    ttl: 3600000, // 1 hour
    maxSize: 100,
  },

  logger: {
    level: 'info',
    enabled: true,
  },

  hooks: {
    beforeAssignment: async (experiment, user) => {
      // Custom logic before assignment
      console.log(`Assigning ${user.userId} to ${experiment.name}`);
    },

    onExposure: async (event) => {
      // Send to analytics
      await analytics.track('Experiment Exposure', event);
    },

    onConversion: async (event) => {
      // Send to analytics
      await analytics.track('Experiment Conversion', event);
    },

    onError: (error) => {
      // Error tracking
      errorReporter.log(error);
    },
  },
});
```

## 🧪 Testing

```typescript
import { createExperiments } from '@madfam/experiments';

// Create test instance
const testExperiments = createExperiments({
  enableAnalytics: false,
  cacheStrategy: { type: 'memory' },
});

// Register test experiment
await testExperiments.registerExperiment({
  id: 'test-experiment',
  name: 'Test Experiment',
  status: 'running',
  type: 'a/b',
  variations: [
    { id: 'control', weight: 50, isControl: true },
    { id: 'treatment', weight: 50 },
  ],
  allocation: {
    type: 'deterministic',
    overrides: [
      { userId: 'test-user-1', variationId: 'control' },
      { userId: 'test-user-2', variationId: 'treatment' },
    ],
  },
});
```

## 📊 Analytics & Reporting

```typescript
// Get experiment results
const results = await experiments.getResults('checkout-flow-v2');

console.log(`
  Experiment: ${results.experimentId}
  Status: ${results.status}
  Sample Size: ${results.sampleSize}
  
  Variations:
  ${results.variations.map(v => `
    - ${v.variationId}
      Exposures: ${v.exposures}
      Conversions: ${v.conversions}
      Conversion Rate: ${(v.conversions / v.exposures * 100).toFixed(2)}%
  `).join('\n')}
  
  ${results.winner ? `Winner: ${results.winner} (${results.confidence}% confidence)` : 'No significant winner yet'}
`);
```

## 🔒 Best Practices

1. **Experiment Design**
   - Always include a control group
   - Run experiments for statistical significance
   - Define success metrics upfront
   - Document experiment hypotheses

2. **Implementation**
   - Use deterministic allocation for consistency
   - Enable sticky bucketing for user experience
   - Implement proper error handling
   - Clean up completed experiments

3. **Analysis**
   - Wait for sufficient sample size
   - Consider multiple metrics
   - Look for negative impacts
   - Document learnings

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🏆 Built by MADFAM

Part of the MADFAM ecosystem of world-class developer tools.

---

<p align="center">
  <a href="https://madfam.io">Website</a> •
  <a href="https://github.com/madfam-io/experiments">GitHub</a> •
  <a href="https://docs.madfam.io/experiments">Documentation</a> •
  <a href="https://madfam.io/support">Support</a>
</p>
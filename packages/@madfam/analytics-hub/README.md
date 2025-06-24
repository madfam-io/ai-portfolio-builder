# @madfam/analytics-hub

Universal analytics abstraction with multi-provider support and type safety.

[![npm version](https://badge.fury.io/js/%40madfam%2Fanalytics-hub.svg)](https://badge.fury.io/js/%40madfam%2Fanalytics-hub)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- 🔄 **Multi-Provider Support** - Switch between PostHog, Mixpanel, Amplitude, Segment, or custom providers
- 🎯 **Type Safety** - Full TypeScript support with event catalog types
- ⚛️ **React Integration** - Hooks and context providers for React applications
- 🛡️ **Privacy-First** - Built-in GDPR compliance and Do Not Track support
- 📦 **Tree Shakeable** - Import only what you need
- 🎪 **Event Batching** - Automatic event batching for performance
- 📱 **Universal** - Works in browser, Node.js, and React Native
- 🔧 **Extensible** - Easy to add custom providers

## Quick Start

### Installation

```bash
npm install @madfam/analytics-hub
# or
yarn add @madfam/analytics-hub
# or
pnpm add @madfam/analytics-hub
```

### Basic Usage

```typescript
import { createAnalyticsClient, defaultConfigs } from '@madfam/analytics-hub';

// Create client with PostHog
const analytics = createAnalyticsClient(
  defaultConfigs.posthog('your-posthog-key')
);

// Initialize
await analytics.initialize();

// Track events
await analytics.track('user_signed_up', {
  method: 'email',
  plan: 'pro',
});

// Identify users
await analytics.identify('user-123', {
  email: 'user@example.com',
  plan: 'pro',
});
```

### React Integration

```typescript
import { AnalyticsProvider, useAnalytics } from '@madfam/analytics-hub/react';
import { defaultConfigs } from '@madfam/analytics-hub';

// Wrap your app
function App() {
  return (
    <AnalyticsProvider config={defaultConfigs.posthog('your-key')}>
      <YourApp />
    </AnalyticsProvider>
  );
}

// Use in components
function SignupButton() {
  const { track } = useAnalytics();

  const handleClick = () => {
    track('signup_button_clicked', {
      location: 'header'
    });
  };

  return <button onClick={handleClick}>Sign Up</button>;
}
```

## Providers

### PostHog

```typescript
import { defaultConfigs } from '@madfam/analytics-hub';

const config = defaultConfigs.posthog('ph_your_key', 'https://app.posthog.com');
```

### Mixpanel

```typescript
const config = defaultConfigs.mixpanel('your_mixpanel_token');
```

### Amplitude

```typescript
const config = defaultConfigs.amplitude('your_amplitude_key');
```

### Segment

```typescript
const config = defaultConfigs.segment('your_segment_write_key');
```

### Custom Provider

```typescript
const config = defaultConfigs.custom('https://your-api.com/events', {
  Authorization: 'Bearer your-token',
});
```

## Configuration

### Basic Configuration

```typescript
import { AnalyticsConfig } from '@madfam/analytics-hub';

const config: AnalyticsConfig = {
  provider: 'posthog',
  providers: {
    posthog: {
      apiKey: 'your-key',
      host: 'https://app.posthog.com',
      autocapture: true,
      sessionRecording: false,
    },
  },
  debug: process.env.NODE_ENV === 'development',
  batchEvents: true,
  batchSize: 10,
  flushInterval: 5000,
  privacy: {
    respectDNT: true,
    anonymizeIPs: true,
    cookieConsent: true,
  },
};
```

### Privacy Settings

```typescript
const config = {
  // ... other config
  privacy: {
    respectDNT: true, // Respect Do Not Track
    anonymizeIPs: true, // Anonymize IP addresses
    cookieConsent: true, // Wait for cookie consent
    dataRetentionDays: 365, // Data retention period
  },
};
```

## React Hooks

### useAnalytics

Main hook for tracking events:

```typescript
const { track, identify, page, group, reset, isReady } = useAnalytics();
```

### usePageTracking

Automatic page view tracking:

```typescript
usePageTracking('Dashboard', { section: 'analytics' });
```

### useUserTracking

Automatic user identification:

```typescript
const user = useUser(); // Your user hook
useUserTracking(user?.id, { email: user?.email });
```

### useEventTracker

Track events with dependencies:

```typescript
const trackPurchase = useEventTracker(
  'purchase_completed',
  {
    product_id: product.id,
    revenue: product.price,
  },
  {
    dependencies: [product.id],
  }
);

// Call trackPurchase() when needed
```

### useFormTracking

Track form interactions:

```typescript
const { trackFormStart, trackFormSubmit, trackFieldInteraction } =
  useFormTracking('signup_form');

// Use in form handlers
<form onFocus={trackFormStart} onSubmit={trackFormSubmit}>
  <input onFocus={() => trackFieldInteraction('email', 'focus')} />
</form>
```

### useVisibilityTracking

Track when elements become visible:

```typescript
const ref = useRef<HTMLDivElement>(null);

useVisibilityTracking(ref, 'section_viewed', {
  section_name: 'pricing',
}, {
  threshold: 0.5, // 50% visible
  once: true,     // Track only once
});

return <div ref={ref}>Pricing section</div>;
```

### usePerformanceTracking

Track performance metrics:

```typescript
const { trackPerformance } = usePerformanceTracking();

// Track custom metrics
trackPerformance('api_response_time', responseTime);
```

### useScrollTracking

Track scroll depth:

```typescript
useScrollTracking([25, 50, 75, 100]); // Track at these percentages
```

## Type Safety

Define your event catalog for complete type safety:

```typescript
// Define your events
interface MyEventCatalog {
  user_signed_up: {
    method: 'email' | 'oauth' | 'magic_link';
    provider?: string;
  };

  purchase_completed: {
    product_id: string;
    revenue: number;
    currency: string;
  };

  feature_used: {
    feature_name: string;
    user_plan: 'free' | 'pro' | 'enterprise';
  };
}

// Extend the default catalog
declare module '@madfam/analytics-hub' {
  interface EventCatalog extends MyEventCatalog {}
}

// Now get full type safety
const { track } = useAnalytics();

track('user_signed_up', {
  method: 'email', // ✅ Typed
  provider: 'google', // ✅ Typed
  // invalid_prop: 'test' // ❌ TypeScript error
});
```

## Advanced Usage

### Multiple Providers

```typescript
// Primary analytics
const analytics = createAnalyticsClient(defaultConfigs.posthog('key1'));

// Secondary analytics (e.g., for A/B testing)
const experiments = createAnalyticsClient(defaultConfigs.segment('key2'));

// Use both
await analytics.track('page_viewed', properties);
await experiments.track('experiment_exposure', properties);
```

### Custom Event Context

```typescript
await analytics.track('button_clicked', properties, {
  context: {
    page: {
      url: window.location.href,
      section: 'header',
    },
    campaign: {
      source: 'google',
      medium: 'cpc',
    },
  },
});
```

### Error Handling

```typescript
try {
  await analytics.track('event', properties);
} catch (error) {
  console.error('Analytics error:', error);
  // Analytics errors shouldn't break your app
}
```

## Testing

Mock analytics in tests:

```typescript
import { jest } from '@jest/globals';

// Mock the entire module
jest.mock('@madfam/analytics-hub', () => ({
  createAnalyticsClient: jest.fn(() => ({
    initialize: jest.fn(),
    track: jest.fn(),
    identify: jest.fn(),
    isReady: jest.fn(() => true),
  })),
}));

// Or mock specific providers
jest.mock('@madfam/analytics-hub/providers/posthog');
```

## Migration

### From PostHog

```typescript
// Before
import posthog from 'posthog-js';
posthog.init('key');
posthog.capture('event', properties);

// After
import { createAnalyticsClient, defaultConfigs } from '@madfam/analytics-hub';
const analytics = createAnalyticsClient(defaultConfigs.posthog('key'));
await analytics.initialize();
await analytics.track('event', properties);
```

### From Mixpanel

```typescript
// Before
import mixpanel from 'mixpanel-browser';
mixpanel.init('token');
mixpanel.track('event', properties);

// After
import { createAnalyticsClient, defaultConfigs } from '@madfam/analytics-hub';
const analytics = createAnalyticsClient(defaultConfigs.mixpanel('token'));
await analytics.initialize();
await analytics.track('event', properties);
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT © [MADFAM](https://madfam.io)

## Support

- 📧 Email: support@madfam.io
- 💬 Discord: [Join our community](https://discord.gg/madfam)
- 📖 Documentation: [docs.madfam.io](https://docs.madfam.io)
- 🐛 Issues: [GitHub Issues](https://github.com/madfam-io/analytics-hub/issues)

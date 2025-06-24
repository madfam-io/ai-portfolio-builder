# @madfam/experiments

Enterprise-grade A/B testing and feature flags system with real-time analytics and adapter support.

## Features

- 🧪 **A/B Testing**: Run sophisticated experiments with multiple variations
- 🚀 **Feature Flags**: Toggle features on/off for different user segments
- 🎯 **Advanced Targeting**: Target users by attributes, segments, and custom rules
- 📊 **Real-time Analytics**: Track exposures, conversions, and custom events
- 🔌 **Adapter System**: Pluggable storage, persistence, and analytics adapters
- ⚡ **Next.js Integration**: Built-in support for server-side rendering
- 🍪 **Cookie Persistence**: Maintain consistent assignments across sessions
- 📱 **Multi-platform**: Works in browser, Node.js, and edge environments

## Installation

```bash
npm install @madfam/experiments
# or
yarn add @madfam/experiments
# or
pnpm add @madfam/experiments
```

## Quick Start

### Basic Usage

```typescript
import { createExperimentsWithAdapters } from '@madfam/experiments';

const experiments = createExperimentsWithAdapters({
  enableAnalytics: true,
  enableDebugMode: true,
});

// A/B Testing
const assignment = await experiments.getVariation('homepage-hero', {
  userId: 'user-123',
  attributes: { plan: 'premium', country: 'US' }
});

console.log(`User assigned to: ${assignment.variation.name}`);

// Feature Flags
const isEnabled = await experiments.evaluateFlag('new-checkout', {
  userId: 'user-123',
  attributes: { plan: 'premium' }
});

console.log(`Feature enabled: ${isEnabled.enabled}`);
```

### With Next.js and Supabase

```typescript
import { createExperimentsWithAdapters, SupabaseStorageAdapter, NextJsPersistenceAdapter } from '@madfam/experiments';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(url, key);

const experiments = createExperimentsWithAdapters({
  storage: new SupabaseStorageAdapter(supabase),
  persistence: new NextJsPersistenceAdapter({
    maxAge: 90 * 24 * 60 * 60, // 90 days
  }),
  enableAnalytics: true,
});

// Load experiments from Supabase
await experiments.loadExperiments();
await experiments.loadFlags();
```

### Migration from Legacy Feature Flags

For existing applications using the old feature flag service:

```typescript
import { LegacyFeatureFlagService } from '@madfam/experiments/nextjs';

// Drop-in replacement for the old service
const experiment = await LegacyFeatureFlagService.getActiveExperiment({
  country: 'US',
  device: 'mobile',
});

await LegacyFeatureFlagService.recordConversion(
  experiment.experimentId,
  experiment.variantId
);
```

## Adapters

### Storage Adapters

Store experiments and feature flags in your preferred database:

- **MemoryStorageAdapter**: In-memory storage (testing/development)
- **SupabaseStorageAdapter**: PostgreSQL via Supabase
- **Custom**: Implement the `StorageAdapter` interface

### Persistence Adapters

Maintain user assignments across sessions:

- **MemoryPersistenceAdapter**: In-memory persistence
- **CookiePersistenceAdapter**: Browser cookies
- **NextJsPersistenceAdapter**: Next.js cookies (server + client)
- **Custom**: Implement the `PersistenceAdapter` interface

### Analytics Adapters

Track events in your analytics platform:

- **Custom**: Implement the `AnalyticsAdapter` interface for PostHog, Mixpanel, etc.

## API Reference

### Core Classes

- `Experiments`: Basic experiments engine
- `ExperimentsEnhanced`: Enhanced engine with adapter support
- `LegacyFeatureFlagService`: Migration wrapper for existing code

### Configuration

```typescript
interface ExperimentsConfigWithAdapters {
  storage?: StorageAdapter;
  persistence?: PersistenceAdapter;
  analytics?: AnalyticsAdapter;
  enableAnalytics?: boolean;
  enableDebugMode?: boolean;
  logger?: LoggerConfig;
  hooks?: ExperimentHooks;
}
```

### Methods

#### A/B Testing

```typescript
// Register an experiment
await experiments.registerExperiment(experiment);

// Get variation for user
const assignment = await experiments.getVariation(experimentId, userContext);

// Track conversion
await experiments.trackConversion(experimentId, userId, value, metadata);
```

#### Feature Flags

```typescript
// Register a feature flag
await experiments.registerFlag(flag);

// Evaluate flag for user
const result = await experiments.evaluateFlag(flagKey, userContext, defaultValue);

// Check if enabled
const isEnabled = result.enabled;
```

#### Analytics

```typescript
// Track custom event
await experiments.trackEvent('button_click', { button: 'signup' });

// Get experiment results
const results = await experiments.getExperimentResults(experimentId);
```

## Database Schema

For Supabase/PostgreSQL integration, create these tables:

```sql
-- Experiments table
CREATE TABLE experiments (
  id VARCHAR PRIMARY KEY,
  key VARCHAR UNIQUE NOT NULL,
  name VARCHAR NOT NULL,
  description TEXT,
  type VARCHAR NOT NULL,
  status VARCHAR NOT NULL,
  variations JSONB NOT NULL,
  metrics JSONB,
  targeting JSONB,
  allocation JSONB NOT NULL,
  schedule JSONB,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Feature flags table
CREATE TABLE feature_flags (
  key VARCHAR PRIMARY KEY,
  name VARCHAR NOT NULL,
  description TEXT,
  type VARCHAR NOT NULL,
  enabled BOOLEAN DEFAULT true,
  default_value JSONB,
  variations JSONB,
  targeting JSONB,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Events table
CREATE TABLE experiment_events (
  id SERIAL PRIMARY KEY,
  experiment_id VARCHAR NOT NULL,
  user_id VARCHAR NOT NULL,
  type VARCHAR NOT NULL,
  variation_id VARCHAR,
  timestamp TIMESTAMP DEFAULT NOW(),
  value NUMERIC,
  metadata JSONB
);
```

## License

MADFAM Code Available License (MCAL) v1.0

This source code is made available for viewing and educational purposes only.
Commercial use is strictly prohibited except by MADFAM and licensed partners.

For commercial licensing: licensing@madfam.io
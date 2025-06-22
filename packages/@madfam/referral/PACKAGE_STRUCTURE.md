# @madfam/referral Package Structure

## Overview

This package provides a world-class referral system with the following structure:

```
packages/@madfam/referral/
├── src/
│   ├── index.ts                 # Main entry point
│   ├── engine/
│   │   └── index.ts            # Core referral engine
│   ├── hooks/
│   │   ├── index.ts            # React hooks exports
│   │   ├── useReferral.ts      # Main referral hook
│   │   ├── useReferralCampaigns.ts
│   │   ├── useReferralStats.ts
│   │   └── useReferralShare.ts
│   ├── components/
│   │   ├── index.ts            # React components exports
│   │   ├── ReferralDashboard.tsx
│   │   ├── ShareHub.tsx
│   │   ├── RewardHistory.tsx
│   │   ├── CampaignSelector.tsx
│   │   └── ReferralStats.tsx
│   ├── types/
│   │   ├── index.ts            # Type definitions exports
│   │   ├── referral.ts         # Core referral types
│   │   ├── campaign.ts         # Campaign types
│   │   ├── reward.ts           # Reward types
│   │   ├── analytics.ts        # Analytics types
│   │   ├── fraud.ts            # Fraud detection types
│   │   ├── gamification.ts     # Gamification types
│   │   └── config.ts           # Configuration types
│   ├── utils/
│   │   ├── logger.ts           # Logging utility
│   │   └── analytics.ts        # Analytics utility
│   └── api/
│       └── client.ts           # API client
├── examples/
│   ├── basic-usage.ts          # Basic usage example
│   ├── react-integration.tsx   # React integration example
│   └── enterprise-setup.ts     # Enterprise setup example
├── dist/                       # Build output (generated)
├── package.json               # Package configuration
├── tsconfig.json              # TypeScript configuration
├── rollup.config.mjs          # Build configuration
├── README.md                  # Documentation
├── LICENSE                    # MCAL-1.0 License
├── CONTRIBUTING.md            # Contribution guidelines
└── .gitignore                 # Git ignore rules
```

## Key Features

1. **Core Engine** - Standalone referral engine with Supabase integration
2. **React Hooks** - Easy integration with React applications
3. **Components** - Pre-built UI components for rapid development
4. **Type Safety** - Full TypeScript support with comprehensive types
5. **Examples** - Real-world implementation examples
6. **Enterprise Ready** - Fraud detection, analytics, and scalability

## Usage

```typescript
// Engine usage
import { createReferralEngine } from '@madfam/referral/engine';

// React hooks
import { useReferral } from '@madfam/referral/hooks';

// Components
import { ReferralDashboard } from '@madfam/referral/components';

// Types
import type { Referral, ReferralCampaign } from '@madfam/referral/types';
```

## Building

```bash
npm install
npm run build
```

## Publishing

```bash
npm run release
```
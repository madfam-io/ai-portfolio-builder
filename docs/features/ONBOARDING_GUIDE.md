# Onboarding System Guide

This guide explains how to use and customize the guided onboarding system in the AI Portfolio Builder.

## Overview

The onboarding system provides:

- **Guided Flows**: Step-by-step walkthroughs for new, returning, and imported users
- **Product Tours**: Interactive tooltips that guide users through features
- **Progress Tracking**: Persistent tracking of onboarding completion
- **Contextual Hints**: Smart tooltips that appear at the right moment
- **Onboarding Checklist**: Visual progress tracker with actionable tasks

## Architecture

```
components/onboarding/
├── OnboardingProvider.tsx    # Main provider component
├── OnboardingModal.tsx       # Step-by-step modal flow
├── OnboardingChecklist.tsx   # Progress checklist widget
├── ProductTour.tsx           # Interactive feature tours
├── ContextualHint.tsx        # Smart contextual tooltips
└── index.ts                  # Barrel exports

lib/
├── store/onboarding-store.ts # Zustand store for state
└── hooks/useOnboarding.ts    # React hook for easy access
```

## Setup

### 1. Wrap Your App

Add the `OnboardingProvider` to your root layout:

```tsx
// app/layout.tsx
import { OnboardingProvider } from '@/components/onboarding';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <OnboardingProvider>{children}</OnboardingProvider>
      </body>
    </html>
  );
}
```

### 2. Add Tour Targets

Mark elements that should be highlighted in tours:

```tsx
<Button data-tour="create-portfolio-btn">
  Create Portfolio
</Button>

<div data-tour="portfolio-list">
  {/* Portfolio items */}
</div>
```

## Usage Examples

### Basic Onboarding Flow

```tsx
import { useOnboarding } from '@/components/onboarding';

function DashboardPage() {
  const { isOnboarding, currentStep, completeCurrentStep, skipCurrentStep } =
    useOnboarding();

  // Auto-starts for new users
  if (isOnboarding) {
    // Modal will show automatically
  }

  return <div>{/* Your dashboard content */}</div>;
}
```

### Manual Flow Control

```tsx
function ProfileSettings() {
  const { completeCurrentStep } = useOnboarding();

  const handleProfileSave = async data => {
    await saveProfile(data);

    // Mark onboarding step as complete
    completeCurrentStep({
      profileCompleted: true,
      fields: Object.keys(data),
    });
  };

  return <ProfileForm onSave={handleProfileSave} />;
}
```

### Product Tours

```tsx
function EditorPage() {
  const { startPageTour } = useOnboarding();

  useEffect(() => {
    // Start tour after page loads
    const timer = setTimeout(() => {
      startPageTour('editor');
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div>
      <Button data-tour="template-selector" onClick={selectTemplate}>
        Choose Template
      </Button>

      <Button data-tour="ai-enhance-btn" onClick={enhanceWithAI}>
        <Wand2 /> Enhance with AI
      </Button>
    </div>
  );
}
```

### Contextual Hints

```tsx
import { ContextualHint, CommonHints } from '@/components/onboarding';

function PortfolioEditor() {
  const [isFirstSave, setIsFirstSave] = useState(true);

  return (
    <div>
      {/* Show hint for first-time users */}
      {isFirstSave && CommonHints.AIEnhancement}

      {/* Custom hint */}
      <ContextualHint
        id="custom-feature-hint"
        title="New Feature!"
        content="Try our new template customization options"
        type="feature"
        targetSelector="[data-tour='customize-btn']"
        position="bottom"
        action={{
          label: 'Show me',
          onClick: () => openCustomizer(),
        }}
      />
    </div>
  );
}
```

### Onboarding Checklist

The checklist appears automatically for new users. To control it:

```tsx
function Dashboard() {
  const { showChecklist, toggleChecklist } = useOnboarding();

  return (
    <div>
      <Button onClick={toggleChecklist}>
        {showChecklist ? 'Hide' : 'Show'} Getting Started
      </Button>

      {/* Checklist will appear in bottom-right */}
    </div>
  );
}
```

## Customization

### Adding New Onboarding Steps

Edit the flows in `onboarding-store.ts`:

```typescript
const ONBOARDING_FLOWS = {
  new: {
    id: 'new-user-flow',
    name: 'New User Onboarding',
    steps: [
      {
        id: 'custom-step',
        title: 'Your Custom Step',
        description: 'Description here',
        completed: false,
        skipped: false,
      },
      // ... more steps
    ],
  },
};
```

### Custom Step Components

Add step components in `OnboardingModal.tsx`:

```tsx
const stepComponents: Record<string, React.ComponentType<any>> = {
  'custom-step': CustomStepComponent,
  // ... other steps
};

function CustomStepComponent({ step, onComplete }) {
  return (
    <div>
      <h3>Custom Step Content</h3>
      <Button onClick={onComplete}>Continue</Button>
    </div>
  );
}
```

### Tour Customization

Add tour steps in `ProductTour.tsx`:

```typescript
const tourSteps: Record<string, TourStep[]> = {
  dashboard: [
    {
      target: '[data-tour="your-element"]',
      title: 'Tour Step Title',
      content: 'Explanation of the feature',
      placement: 'bottom',
      action: {
        label: 'Try it',
        onClick: () => console.log('Action clicked'),
      },
    },
  ],
};
```

## Analytics Integration

The onboarding system automatically tracks:

- Flow starts and completions
- Step completions and skips
- Tour interactions
- Hint dismissals
- Time to complete

Events are sent to both PostHog and SigNoz for analysis.

## Best Practices

### 1. Progressive Disclosure

Don't overwhelm users. Show features gradually:

```tsx
const { getProgress } = useOnboarding();

// Show advanced features only after basic onboarding
if (getProgress() > 50) {
  return <AdvancedFeatures />;
}
```

### 2. Context-Aware Hints

Show hints based on user actions:

```tsx
const [saveCount, setSaveCount] = useState(0);

// Show hint after 3 saves
{
  saveCount === 3 && (
    <ContextualHint
      id="autosave-hint"
      title="Did you know?"
      content="Your work is automatically saved every 30 seconds"
      type="info"
    />
  );
}
```

### 3. Respect User Preferences

```tsx
const { preferences, updatePreferences } = useOnboarding();

if (preferences.skipTours) {
  // Don't show tours
  return null;
}

// Allow users to opt out
<Button onClick={() => updatePreferences({ skipTours: true })}>
  Don't show tours
</Button>;
```

### 4. Mobile Considerations

The onboarding system is responsive, but consider:

- Shorter flows on mobile
- Touch-friendly targets
- Simplified tours

```tsx
const isMobile = useMediaQuery('(max-width: 768px)');
const steps = isMobile ? mobileSteps : desktopSteps;
```

## Troubleshooting

### Onboarding Not Starting

1. Check if user is new:

   ```typescript
   const isNewUser =
     user.created_at &&
     new Date(user.created_at).getTime() > Date.now() - 5 * 60 * 1000;
   ```

2. Check completed flows:

   ```typescript
   console.log(completedFlows);
   ```

3. Manually trigger:
   ```typescript
   startOnboarding('new');
   ```

### Tour Not Finding Elements

1. Ensure elements have data-tour attributes
2. Check if elements are rendered when tour starts
3. Add delay if needed:
   ```typescript
   setTimeout(() => startPageTour('dashboard'), 1000);
   ```

### Persistent State Issues

Clear onboarding state:

```typescript
localStorage.removeItem('onboarding-storage');
```

## Advanced Usage

### Custom Flows Based on User Type

```tsx
function useCustomOnboarding() {
  const { user } = useAuthStore();
  const { startOnboarding } = useOnboardingStore();

  useEffect(() => {
    if (!user) return;

    if (user.imported_from_linkedin) {
      startOnboarding('imported');
    } else if (user.last_login_at) {
      startOnboarding('returning');
    } else {
      startOnboarding('new');
    }
  }, [user]);
}
```

### Conditional Step Completion

```tsx
const { completeStep, currentFlow } = useOnboardingStore();

// Complete multiple steps at once
if (userImportedData) {
  completeStep('profile-setup');
  completeStep('first-portfolio');
  // Jump to AI enhancement
  goToStep(3);
}
```

### Integration with Feature Flags

```tsx
const { isFeatureEnabled } = usePostHog();
const { currentStep } = useOnboarding();

// Show different content based on feature flags
if (currentStep?.id === 'explore-features') {
  if (isFeatureEnabled('new-analytics')) {
    return <NewAnalyticsOnboarding />;
  }
}
```

## Metrics to Track

Monitor these metrics to improve onboarding:

1. **Completion Rate**: % of users who finish onboarding
2. **Drop-off Points**: Which steps users skip/abandon
3. **Time to Complete**: Average time per step and total
4. **Feature Adoption**: Which onboarded features get used
5. **Return Rate**: Do onboarded users come back?

Query examples:

```sql
-- PostHog: Onboarding funnel
SELECT
  step_name,
  COUNT(DISTINCT user_id) as users,
  AVG(duration_ms) as avg_time
FROM events
WHERE event = 'onboarding_step_completed'
GROUP BY step_name

-- SigNoz: Performance impact
SELECT
  AVG(duration) as avg_load_time
FROM traces
WHERE operation = 'onboarding.modal.render'
```

## Future Enhancements

Planned improvements:

- [ ] Video tutorials integration
- [ ] Personalized flows based on user goals
- [ ] Onboarding email sequences
- [ ] Gamification elements
- [ ] A/B testing different flows
- [ ] Multi-language support

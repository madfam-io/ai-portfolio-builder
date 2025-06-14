# 📊 PostHog Analytics Integration

## Overview

PRISMA integrates PostHog for comprehensive product analytics, enabling data-driven decisions while maintaining user privacy through self-hosted infrastructure.

**Last Updated**: December 2024  
**Version**: 0.3.0-beta

## 🚀 Features

### Analytics Capabilities

- **User Journey Tracking**: Complete funnel analysis from landing to portfolio publish
- **Feature Usage**: Track which features users engage with most
- **Performance Metrics**: Page load times, API response times
- **Conversion Tracking**: Sign-up to paid conversion rates
- **Retention Analysis**: User engagement over time

### Privacy-First Approach

- **Self-Hosted Option**: Run PostHog on your infrastructure
- **GDPR Compliant**: Full data control and user consent management
- **No Third-Party Tracking**: All data stays within your control
- **Anonymous Mode**: Track usage without personal data

## 🛠️ Setup Guide

### 1. Environment Configuration

Add to your `.env.local`:

```bash
# PostHog Configuration
NEXT_PUBLIC_POSTHOG_KEY=phc_your_project_api_key
NEXT_PUBLIC_POSTHOG_HOST=https://your-posthog-instance.com
POSTHOG_PERSONAL_API_KEY=phx_your_personal_api_key
```

### 2. Self-Hosted Setup (Docker)

PostHog is included in our Docker development environment:

```bash
# Start with Docker Compose
docker-compose -f docker-compose.dev.yml up -d

# Access PostHog at http://localhost:8000
# Default credentials: admin@prisma.io / prisma-posthog-2025
```

### 3. Cloud Setup (Alternative)

1. Sign up at [PostHog Cloud](https://posthog.com)
2. Create a new project
3. Copy your project API key
4. Update environment variables

## 📈 Event Tracking

### Core Events

The following events are automatically tracked:

```typescript
// Page Views
posthog.capture('$pageview', {
  path: window.location.pathname,
  referrer: document.referrer,
});

// Portfolio Events
posthog.capture('portfolio_created', {
  template: 'developer',
  ai_enhanced: true,
  creation_time: 120, // seconds
});

posthog.capture('portfolio_published', {
  portfolio_id: 'uuid',
  subdomain: 'john-doe',
  template: 'designer',
});

// AI Enhancement Events
posthog.capture('ai_enhancement_used', {
  type: 'bio',
  model: 'llama-3.1',
  word_count_before: 50,
  word_count_after: 150,
});

// Conversion Events
posthog.capture('subscription_started', {
  plan: 'pro',
  monthly_price: 19,
  currency: 'USD',
});
```

### Custom Event Implementation

```typescript
import { posthog } from '@/lib/services/analytics/posthog';

// Track custom events
export function trackCustomEvent(
  eventName: string,
  properties?: Record<string, any>
) {
  if (posthog) {
    posthog.capture(eventName, {
      ...properties,
      timestamp: new Date().toISOString(),
    });
  }
}

// Example usage
trackCustomEvent('template_customized', {
  template: 'consultant',
  customizations: ['colors', 'fonts', 'layout'],
  time_spent: 300, // seconds
});
```

## 🎯 Feature Flags

### Implementation

```typescript
// Check feature flag
const showNewEditor = posthog?.isFeatureEnabled('new-portfolio-editor');

// Component usage
export function PortfolioEditor() {
  const showNewEditor = useFeatureFlag('new-portfolio-editor');

  if (showNewEditor) {
    return <NewEditorComponent />;
  }

  return <LegacyEditorComponent />;
}
```

### Available Flags

- `new-portfolio-editor`: Enable redesigned editor
- `ai-models-selection`: Allow users to choose AI models
- `portfolio-variants`: Enable A/B testing features
- `premium-templates`: Show premium template options

## 📊 Dashboard Configuration

### Key Dashboards

1. **User Journey**

   - Sign-up → Portfolio Creation → Publishing
   - Drop-off points identification
   - Conversion optimization

2. **Feature Adoption**

   - AI enhancement usage
   - Template popularity
   - Customization patterns

3. **Performance Monitoring**

   - Page load times by route
   - API response times
   - Error rates

4. **Revenue Analytics**
   - Trial to paid conversion
   - Churn analysis
   - Revenue per user

### Creating Custom Dashboards

1. Navigate to PostHog dashboard
2. Click "New Dashboard"
3. Add insights:
   - Funnels for conversion tracking
   - Trends for usage over time
   - Retention for user engagement
   - Paths for user flow analysis

## 🔒 Privacy & Compliance

### User Consent

```typescript
// Check for user consent
if (hasUserConsent()) {
  posthog.opt_in_capturing();
} else {
  posthog.opt_out_capturing();
}
```

### Data Anonymization

```typescript
// Initialize with anonymous mode
posthog.init(POSTHOG_KEY, {
  autocapture: false,
  capture_pageview: false,
  mask_all_text: true,
  mask_all_element_attributes: true,
});
```

### GDPR Compliance

- User data export endpoint
- Data deletion on request
- Consent management UI
- Privacy policy integration

## 🚨 Troubleshooting

### Common Issues

1. **Events not appearing**

   - Check API key configuration
   - Verify PostHog initialization
   - Check browser console for errors

2. **Self-hosted connection issues**

   - Verify Docker containers are running
   - Check firewall/proxy settings
   - Validate CORS configuration

3. **Feature flags not working**
   - Ensure user identification
   - Check flag rollout percentage
   - Verify flag conditions

### Debug Mode

Enable debug logging:

```typescript
posthog.debug();
```

## 📚 Resources

- [PostHog Documentation](https://posthog.com/docs)
- [Self-Hosting Guide](https://posthog.com/docs/self-host)
- [API Reference](https://posthog.com/docs/api)
- [Privacy Compliance](https://posthog.com/docs/privacy)

---

For additional support, contact the PRISMA development team or consult the PostHog community forums.

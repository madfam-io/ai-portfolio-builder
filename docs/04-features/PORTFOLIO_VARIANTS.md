# 🔀 Portfolio Variants System

## Overview

The Portfolio Variants system enables professionals to create multiple versions of their portfolio optimized for different audiences, with built-in A/B testing and performance tracking.

**Last Updated**: December 2024  
**Version**: 0.3.0-beta

## 🎯 Use Cases

### Multi-Audience Targeting

1. **Job Seekers**

   - Technical version for engineering roles
   - Leadership version for management positions
   - Startup version emphasizing adaptability

2. **Freelancers**

   - Client-focused highlighting results
   - Agency version emphasizing collaboration
   - Direct client version with pricing

3. **Consultants**
   - Industry-specific variants
   - Seniority-targeted versions
   - Service-focused presentations

## 🏗️ Architecture

### System Components

```
┌─────────────────────────────────────────────────────┐
│                   Variant Manager                    │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐│
│  │  Variant A  │  │  Variant B  │  │  Variant C  ││
│  │ (Recruiter) │  │  (Client)   │  │ (Investor)  ││
│  └─────────────┘  └─────────────┘  └─────────────┘│
│                                                     │
│  ┌─────────────────────────────────────────────┐  │
│  │          Performance Tracking                │  │
│  │  Views | Conversions | Time | Bounce Rate   │  │
│  └─────────────────────────────────────────────┘  │
│                                                     │
│  ┌─────────────────────────────────────────────┐  │
│  │           Smart Routing Engine               │  │
│  │  Context Detection → Variant Selection       │  │
│  └─────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

### Data Model

```typescript
interface PortfolioVariant {
  id: string;
  portfolioId: string;
  name: string;

  // Audience Definition
  audience: {
    type: 'recruiter' | 'client' | 'investor' | 'general';
    industry?: string;
    seniority?: 'junior' | 'mid' | 'senior' | 'executive';
    keywords?: string[];
  };

  // Content Customization
  customization: {
    bio?: string; // Audience-specific bio
    headline?: string; // Custom tagline
    highlights?: string[]; // Key achievements to emphasize
    projectsOrder?: string[]; // Project display order
    hiddenSections?: string[]; // Sections to hide
    customSections?: CustomSection[]; // Additional sections
  };

  // Visual Customization
  theme?: {
    template?: TemplateType;
    colors?: ColorScheme;
    fonts?: FontSelection;
  };

  // Performance Metrics
  performance: {
    views: number;
    uniqueVisitors: number;
    conversions: number;
    averageTimeOnPage: number;
    bounceRate: number;
    lastViewedAt?: Date;
  };

  // Management
  isActive: boolean;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

## 🛠️ Implementation Guide

### 1. Creating Variants

```typescript
// Using the Variant Manager component
import { VariantManager } from '@/components/portfolio/VariantManager';

export function PortfolioEditor({ portfolioId }) {
  return (
    <VariantManager
      portfolioId={portfolioId}
      onVariantCreated={(variant) => {
        console.log('New variant created:', variant);
      }}
    />
  );
}

// Programmatic creation
import { createVariant } from '@/lib/services/portfolio/variants';

const recruiterVariant = await createVariant({
  portfolioId: 'portfolio-123',
  name: 'Tech Recruiter Version',
  audience: {
    type: 'recruiter',
    industry: 'technology',
    keywords: ['react', 'typescript', 'node.js']
  },
  customization: {
    bio: 'Senior Full-Stack Engineer with 8+ years building scalable web applications...',
    highlights: [
      'Led team of 5 engineers',
      'Reduced load time by 60%',
      'Shipped 3 major products'
    ],
    projectsOrder: ['project-1', 'project-3', 'project-2']
  }
});
```

### 2. Variant Routing

The system automatically selects the best variant based on:

```typescript
// Context detection
const context = detectVisitorContext({
  referrer: document.referrer,
  utmSource: params.utm_source,
  userAgent: navigator.userAgent,
  geoLocation: await getGeoLocation(),
});

// Variant selection
const variant = await selectBestVariant({
  portfolioId,
  context,
  experimentRules: activeExperiments,
});
```

### 3. A/B Testing

```typescript
// Create an A/B test
const experiment = await createExperiment({
  name: 'Bio Length Test',
  portfolioId: 'portfolio-123',
  variants: [
    { id: 'variant-a', weight: 50 }, // 50% traffic
    { id: 'variant-b', weight: 50 }, // 50% traffic
  ],
  metrics: ['time_on_page', 'contact_clicks'],
});

// Track performance
trackVariantView({
  variantId: selectedVariant.id,
  experimentId: experiment.id,
  sessionId: session.id,
});
```

## 📊 Performance Tracking

### Key Metrics

1. **Engagement Metrics**

   - Views and unique visitors
   - Average time on page
   - Scroll depth
   - Interaction rate

2. **Conversion Metrics**

   - Contact form submissions
   - Resume downloads
   - Social media clicks
   - Call-to-action clicks

3. **Quality Metrics**
   - Bounce rate
   - Return visitor rate
   - Share rate
   - Feedback score

### Analytics Dashboard

```typescript
// Access variant analytics
import { useVariantAnalytics } from '@/hooks/useVariantAnalytics';

export function VariantPerformance({ variantId }) {
  const { data, isLoading } = useVariantAnalytics(variantId);

  return (
    <Dashboard>
      <MetricCard
        title="Conversion Rate"
        value={`${data.conversionRate}%`}
        trend={data.conversionTrend}
      />
      <MetricCard
        title="Avg. Time on Page"
        value={formatTime(data.averageTimeOnPage)}
        trend={data.timeTrend}
      />
      <ConversionFunnel data={data.funnel} />
    </Dashboard>
  );
}
```

## 🎯 Best Practices

### 1. Variant Strategy

- **Start Simple**: Begin with 2-3 variants maximum
- **Clear Differentiation**: Each variant should have a distinct purpose
- **Test One Thing**: Change one major element at a time
- **Sufficient Traffic**: Ensure enough views for statistical significance

### 2. Content Optimization

```typescript
// Good: Clear audience targeting
const clientVariant = {
  name: 'Client-Focused',
  customization: {
    bio: 'Results-driven consultant who has helped 50+ businesses increase revenue...',
    highlights: [
      '$2M+ in client revenue generated',
      '95% client satisfaction rate',
      'Average 3x ROI on projects',
    ],
  },
};

// Avoid: Generic content
const badVariant = {
  name: 'Alternative Version',
  customization: {
    bio: 'Experienced professional with various skills...',
  },
};
```

### 3. Performance Monitoring

- **Weekly Reviews**: Check variant performance weekly
- **Statistical Significance**: Wait for 95% confidence before decisions
- **Iterate**: Use insights to create better variants
- **Document Learnings**: Keep notes on what works

## 🔧 API Reference

### Variant Management Endpoints

```typescript
// List variants
GET /api/v1/portfolios/:portfolioId/variants

// Create variant
POST /api/v1/portfolios/:portfolioId/variants
Body: {
  name: string;
  audience: AudienceDefinition;
  customization: VariantCustomization;
}

// Update variant
PUT /api/v1/variants/:variantId
Body: Partial<PortfolioVariant>

// Delete variant
DELETE /api/v1/variants/:variantId

// Activate variant
POST /api/v1/variants/:variantId/activate

// Get analytics
GET /api/v1/variants/:variantId/analytics
Query: {
  startDate?: string;
  endDate?: string;
  metrics?: string[];
}
```

## 🚀 Advanced Features

### Smart Routing Rules

```typescript
// Define custom routing rules
const routingRules = [
  {
    condition: { referrer: 'linkedin.com' },
    variant: 'professional-network',
  },
  {
    condition: { utm_source: 'recruiter' },
    variant: 'recruiter-optimized',
  },
  {
    condition: {
      geoLocation: { country: 'US' },
      time: { hour: { $gte: 9, $lte: 17 } },
    },
    variant: 'business-hours-us',
  },
];
```

### Dynamic Content Generation

```typescript
// AI-powered variant suggestions
const suggestions = await generateVariantSuggestions({
  portfolio,
  targetAudience: 'venture-capital',
  industry: 'fintech',
});

// Auto-optimization
const optimizedVariant = await optimizeVariant({
  baseVariant: currentVariant,
  performanceData: last30Days,
  targetMetric: 'conversion_rate',
});
```

## 🎨 UI Components

### Variant Switcher

```typescript
import { VariantSwitcher } from '@/components/portfolio/VariantSwitcher';

// In portfolio preview
<VariantSwitcher
  portfolioId={portfolioId}
  currentVariantId={activeVariant.id}
  onSwitch={(variantId) => setActiveVariant(variantId)}
/>
```

### Variant Comparison

```typescript
import { VariantComparison } from '@/components/portfolio/VariantComparison';

// Compare performance
<VariantComparison
  variants={[variantA, variantB]}
  metrics={['views', 'conversions', 'timeOnPage']}
  dateRange="last30days"
/>
```

## 🔒 Security & Privacy

- **Access Control**: Only portfolio owners can create/edit variants
- **Data Isolation**: Variant data is isolated per user
- **Privacy**: Visitor tracking respects user consent
- **Performance Data**: Aggregated and anonymized

## 📚 Resources

- [A/B Testing Best Practices](https://www.optimizely.com/optimization-glossary/ab-testing/)
- [Conversion Rate Optimization](https://cxl.com/guides/conversion-optimization/)
- [Portfolio Design Patterns](https://www.awwwards.com/websites/portfolio/)

---

For support with the Portfolio Variants system, contact the PRISMA development team.

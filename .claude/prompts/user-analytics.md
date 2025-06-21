# Prompt Template: Implementing User Analytics

## Context
You're implementing analytics features to help users understand how their portfolios perform and provide insights for the PRISMA team to improve the platform.

## Analytics Architecture

### Current Implementation
- **PostHog**: User behavior tracking
- **Custom Events**: Portfolio-specific metrics
- **Privacy-First**: GDPR compliant, user consent
- **Real-Time**: Live visitor tracking

### Data Points Collected
1. **Portfolio Performance**: Views, engagement, conversions
2. **User Journey**: Creation flow, drop-off points
3. **Feature Usage**: Which features are most valuable
4. **Technical Metrics**: Load times, errors, device info

## Implementation Guide

### 1. Define Analytics Events

```typescript
// types/analytics.ts
export enum AnalyticsEvent {
  // Portfolio Events
  PORTFOLIO_VIEWED = 'portfolio_viewed',
  PORTFOLIO_CREATED = 'portfolio_created',
  PORTFOLIO_PUBLISHED = 'portfolio_published',
  PORTFOLIO_EDITED = 'portfolio_edited',
  
  // Engagement Events
  PROJECT_CLICKED = 'project_clicked',
  CONTACT_FORM_SUBMITTED = 'contact_form_submitted',
  RESUME_DOWNLOADED = 'resume_downloaded',
  SOCIAL_LINK_CLICKED = 'social_link_clicked',
  
  // Editor Events
  EDITOR_OPENED = 'editor_opened',
  SECTION_ADDED = 'section_added',
  TEMPLATE_CHANGED = 'template_changed',
  AI_ENHANCEMENT_USED = 'ai_enhancement_used',
  
  // User Journey Events
  ONBOARDING_STARTED = 'onboarding_started',
  ONBOARDING_COMPLETED = 'onboarding_completed',
  ONBOARDING_SKIPPED = 'onboarding_skipped',
  
  // Performance Events
  SLOW_PAGE_LOAD = 'slow_page_load',
  ERROR_OCCURRED = 'error_occurred',
}

export interface AnalyticsProperties {
  [AnalyticsEvent.PORTFOLIO_VIEWED]: {
    portfolioId: string;
    subdomain: string;
    referrer?: string;
    device: 'mobile' | 'tablet' | 'desktop';
  };
  
  [AnalyticsEvent.AI_ENHANCEMENT_USED]: {
    feature: 'bio' | 'project' | 'skills';
    model: string;
    accepted: boolean;
    processingTime: number;
  };
  
  // ... define for each event
}
```

### 2. Create Analytics Service

```typescript
// lib/analytics/analytics-service.ts
import { posthog } from 'posthog-js';
import type { AnalyticsEvent, AnalyticsProperties } from '@/types/analytics';

class AnalyticsService {
  private initialized = false;
  private userId: string | null = null;
  
  initialize(userId?: string) {
    if (this.initialized) return;
    
    // Check for consent
    if (!this.hasConsent()) return;
    
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
      loaded: (posthog) => {
        if (userId) {
          posthog.identify(userId);
        }
      },
    });
    
    this.initialized = true;
    this.userId = userId || null;
  }
  
  track<T extends AnalyticsEvent>(
    event: T,
    properties: AnalyticsProperties[T]
  ) {
    if (!this.initialized) return;
    
    // Add common properties
    const enrichedProperties = {
      ...properties,
      timestamp: new Date().toISOString(),
      sessionId: this.getSessionId(),
      platform: 'web',
      version: process.env.NEXT_PUBLIC_APP_VERSION,
    };
    
    // Send to PostHog
    posthog.capture(event, enrichedProperties);
    
    // Also log to our backend for custom analytics
    this.sendToBackend(event, enrichedProperties);
  }
  
  identify(userId: string, traits?: Record<string, any>) {
    if (!this.initialized) return;
    
    this.userId = userId;
    posthog.identify(userId, traits);
  }
  
  private async sendToBackend(event: string, properties: any) {
    try {
      await fetch('/api/v1/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event, properties }),
      });
    } catch (error) {
      console.error('Failed to send analytics', error);
    }
  }
  
  private hasConsent(): boolean {
    return localStorage.getItem('analytics-consent') === 'true';
  }
  
  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('session-id');
    if (!sessionId) {
      sessionId = generateUUID();
      sessionStorage.setItem('session-id', sessionId);
    }
    return sessionId;
  }
}

export const analytics = new AnalyticsService();
```

### 3. Portfolio Analytics Dashboard

```typescript
// app/dashboard/analytics/page.tsx
export default function AnalyticsDashboard() {
  const { portfolioId } = useParams();
  const [metrics, setMetrics] = useState<PortfolioMetrics | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>('week');
  
  useEffect(() => {
    loadAnalytics();
  }, [portfolioId, dateRange]);
  
  const loadAnalytics = async () => {
    const data = await fetchAnalytics(portfolioId, dateRange);
    setMetrics(data);
  };
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <MetricCard
            title="Total Views"
            value={metrics?.totalViews || 0}
            trend={metrics?.viewsTrend}
            icon={<Eye className="w-5 h-5" />}
          />
          <MetricCard
            title="Unique Visitors"
            value={metrics?.uniqueVisitors || 0}
            trend={metrics?.visitorsTrend}
            icon={<Users className="w-5 h-5" />}
          />
          <MetricCard
            title="Avg. Time on Site"
            value={formatDuration(metrics?.avgTimeOnSite || 0)}
            trend={metrics?.timeTrend}
            icon={<Clock className="w-5 h-5" />}
          />
          <MetricCard
            title="Contact Rate"
            value={`${metrics?.contactRate || 0}%`}
            trend={metrics?.contactTrend}
            icon={<Mail className="w-5 h-5" />}
          />
        </div>
        
        {/* Visitor Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Visitor Timeline</CardTitle>
            <DateRangePicker value={dateRange} onChange={setDateRange} />
          </CardHeader>
          <CardContent>
            <VisitorChart data={metrics?.visitorTimeline || []} />
          </CardContent>
        </Card>
        
        {/* Geographic Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Visitor Locations</CardTitle>
            </CardHeader>
            <CardContent>
              <WorldMap data={metrics?.geoData || []} />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Top Referrers</CardTitle>
            </CardHeader>
            <CardContent>
              <ReferrerList referrers={metrics?.topReferrers || []} />
            </CardContent>
          </Card>
        </div>
        
        {/* Engagement Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Engagement Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <EngagementMetric
                label="Projects Viewed"
                value={metrics?.projectViews || 0}
                total={metrics?.totalProjects || 0}
              />
              <EngagementMetric
                label="Resume Downloads"
                value={metrics?.resumeDownloads || 0}
                total={metrics?.uniqueVisitors || 0}
              />
              <EngagementMetric
                label="Contact Form Submissions"
                value={metrics?.contactSubmissions || 0}
                total={metrics?.uniqueVisitors || 0}
              />
              <EngagementMetric
                label="Social Link Clicks"
                value={metrics?.socialClicks || 0}
                total={metrics?.uniqueVisitors || 0}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
```

### 4. Real-Time Visitor Tracking

```typescript
// lib/analytics/real-time-tracker.ts
export class RealTimeTracker {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<Function>> = new Map();
  
  connect(portfolioId: string) {
    this.socket = io(process.env.NEXT_PUBLIC_REALTIME_URL!, {
      query: { portfolioId },
    });
    
    this.socket.on('visitor:join', (visitor) => {
      this.emit('visitorJoined', visitor);
    });
    
    this.socket.on('visitor:leave', (visitorId) => {
      this.emit('visitorLeft', visitorId);
    });
    
    this.socket.on('visitor:action', (action) => {
      this.emit('visitorAction', action);
    });
  }
  
  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }
  
  private emit(event: string, data: any) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(cb => cb(data));
    }
  }
}

// Component usage
function RealTimeVisitors() {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const tracker = useRef(new RealTimeTracker());
  
  useEffect(() => {
    tracker.current.connect(portfolioId);
    
    tracker.current.on('visitorJoined', (visitor: Visitor) => {
      setVisitors(prev => [...prev, visitor]);
    });
    
    tracker.current.on('visitorLeft', (visitorId: string) => {
      setVisitors(prev => prev.filter(v => v.id !== visitorId));
    });
    
    return () => tracker.current.disconnect();
  }, [portfolioId]);
  
  return (
    <div className="flex items-center space-x-2">
      <div className="flex -space-x-2">
        {visitors.slice(0, 3).map(visitor => (
          <Avatar key={visitor.id} className="w-8 h-8 border-2 border-white">
            <AvatarFallback>
              {visitor.country.flag}
            </AvatarFallback>
          </Avatar>
        ))}
      </div>
      {visitors.length > 3 && (
        <span className="text-sm text-gray-600">
          +{visitors.length - 3} more
        </span>
      )}
      <span className="text-sm font-medium">
        {visitors.length} viewing now
      </span>
    </div>
  );
}
```

### 5. Privacy-First Implementation

```typescript
// components/analytics/CookieConsent.tsx
export function CookieConsent() {
  const [show, setShow] = useState(false);
  
  useEffect(() => {
    const consent = localStorage.getItem('analytics-consent');
    if (consent === null) {
      setShow(true);
    } else {
      analytics.initialize();
    }
  }, []);
  
  const handleAccept = () => {
    localStorage.setItem('analytics-consent', 'true');
    analytics.initialize();
    setShow(false);
  };
  
  const handleDecline = () => {
    localStorage.setItem('analytics-consent', 'false');
    setShow(false);
  };
  
  if (!show) return null;
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 z-50">
      <div className="container mx-auto flex items-center justify-between">
        <p className="text-sm text-gray-700 max-w-2xl">
          We use analytics to understand how visitors interact with portfolios. 
          This helps creators improve their content. No personal data is collected.
        </p>
        <div className="flex space-x-3 ml-4">
          <Button variant="outline" size="sm" onClick={handleDecline}>
            Decline
          </Button>
          <Button size="sm" onClick={handleAccept}>
            Accept Analytics
          </Button>
        </div>
      </div>
    </div>
  );
}
```

### 6. Custom Analytics Hooks

```typescript
// hooks/useAnalytics.ts
export function useAnalytics() {
  const track = useCallback(<T extends AnalyticsEvent>(
    event: T,
    properties: AnalyticsProperties[T]
  ) => {
    analytics.track(event, properties);
  }, []);
  
  const trackClick = useCallback((
    element: string,
    properties?: Record<string, any>
  ) => {
    analytics.track(AnalyticsEvent.ELEMENT_CLICKED, {
      element,
      ...properties,
    });
  }, []);
  
  const trackTiming = useCallback((
    category: string,
    variable: string,
    time: number
  ) => {
    analytics.track(AnalyticsEvent.TIMING_RECORDED, {
      category,
      variable,
      time,
    });
  }, []);
  
  return { track, trackClick, trackTiming };
}

// Usage in components
function ProjectCard({ project }: { project: Project }) {
  const { track } = useAnalytics();
  
  const handleClick = () => {
    track(AnalyticsEvent.PROJECT_CLICKED, {
      projectId: project.id,
      projectTitle: project.title,
      position: project.order,
    });
  };
  
  return (
    <Card onClick={handleClick} className="cursor-pointer">
      {/* Project content */}
    </Card>
  );
}
```

### 7. Performance Analytics

```typescript
// lib/analytics/performance-analytics.ts
export class PerformanceAnalytics {
  static trackPageLoad() {
    if (typeof window === 'undefined') return;
    
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      // Core Web Vitals
      const fcp = performance.getEntriesByName('first-contentful-paint')[0];
      const lcp = performance.getEntriesByType('largest-contentful-paint')[0];
      
      analytics.track(AnalyticsEvent.PAGE_PERFORMANCE, {
        url: window.location.pathname,
        loadTime: navigation.loadEventEnd - navigation.fetchStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
        firstContentfulPaint: fcp?.startTime || 0,
        largestContentfulPaint: lcp?.startTime || 0,
        timeToInteractive: navigation.domInteractive - navigation.fetchStart,
      });
      
      // Track slow loads
      if (navigation.loadEventEnd - navigation.fetchStart > 3000) {
        analytics.track(AnalyticsEvent.SLOW_PAGE_LOAD, {
          url: window.location.pathname,
          loadTime: navigation.loadEventEnd - navigation.fetchStart,
          connectionType: (navigator as any).connection?.effectiveType || 'unknown',
        });
      }
    });
  }
  
  static trackApiCall(endpoint: string, duration: number, success: boolean) {
    analytics.track(AnalyticsEvent.API_CALL, {
      endpoint,
      duration,
      success,
      slow: duration > 1000,
    });
  }
}
```

### 8. A/B Testing Analytics

```typescript
// lib/analytics/ab-testing.ts
export class ABTest {
  private variant: string;
  
  constructor(
    private testName: string,
    private variants: string[]
  ) {
    this.variant = this.getOrAssignVariant();
    this.trackExposure();
  }
  
  private getOrAssignVariant(): string {
    const stored = localStorage.getItem(`ab-${this.testName}`);
    if (stored && this.variants.includes(stored)) {
      return stored;
    }
    
    // Random assignment
    const variant = this.variants[Math.floor(Math.random() * this.variants.length)];
    localStorage.setItem(`ab-${this.testName}`, variant);
    return variant;
  }
  
  private trackExposure() {
    analytics.track(AnalyticsEvent.AB_TEST_EXPOSURE, {
      testName: this.testName,
      variant: this.variant,
    });
  }
  
  getVariant(): string {
    return this.variant;
  }
  
  trackConversion(value?: number) {
    analytics.track(AnalyticsEvent.AB_TEST_CONVERSION, {
      testName: this.testName,
      variant: this.variant,
      value,
    });
  }
}

// Usage
function CTAButton() {
  const test = useMemo(() => 
    new ABTest('cta-button-text', ['Get Started', 'Create Portfolio', 'Start Free']),
    []
  );
  
  const handleClick = () => {
    test.trackConversion();
    // Navigate to signup
  };
  
  return (
    <Button onClick={handleClick}>
      {test.getVariant()}
    </Button>
  );
}
```

### 9. Analytics API Endpoints

```typescript
// app/api/v1/analytics/track/route.ts
export async function POST(request: NextRequest) {
  try {
    const { event, properties } = await request.json();
    
    // Validate event
    if (!Object.values(AnalyticsEvent).includes(event)) {
      return NextResponse.json(
        { error: 'Invalid event' },
        { status: 400 }
      );
    }
    
    // Enrich with server-side data
    const enriched = {
      ...properties,
      ip: request.headers.get('x-forwarded-for'),
      userAgent: request.headers.get('user-agent'),
      timestamp: new Date().toISOString(),
    };
    
    // Store in database
    await db.analytics.create({
      data: {
        event,
        properties: enriched,
        sessionId: properties.sessionId,
        userId: properties.userId,
      },
    });
    
    // Send to analytics warehouse
    await sendToWarehouse(event, enriched);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Analytics tracking failed', error);
    return NextResponse.json(
      { error: 'Failed to track event' },
      { status: 500 }
    );
  }
}
```

### 10. Analytics Dashboard Components

```typescript
// components/analytics/MetricCard.tsx
interface MetricCardProps {
  title: string;
  value: string | number;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon?: ReactNode;
}

export function MetricCard({ title, value, trend, icon }: MetricCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">{title}</span>
          {icon && <div className="text-gray-400">{icon}</div>}
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-bold">{value}</span>
          {trend && (
            <div className={cn(
              "flex items-center text-sm",
              trend.isPositive ? "text-green-600" : "text-red-600"
            )}>
              {trend.isPositive ? (
                <TrendingUp className="w-4 h-4 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 mr-1" />
              )}
              {Math.abs(trend.value)}%
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
```

## Best Practices

1. **User Privacy First**
   - Always get consent
   - Anonymize sensitive data
   - Provide opt-out options
   - Clear privacy policy

2. **Performance Impact**
   - Use async tracking
   - Batch events when possible
   - Avoid blocking main thread
   - Limit payload size

3. **Data Quality**
   - Validate events before sending
   - Use consistent naming
   - Document all events
   - Regular data audits

4. **Actionable Insights**
   - Focus on metrics that drive decisions
   - Provide context for numbers
   - Show trends, not just snapshots
   - Make recommendations

## Success Metrics for Analytics

- Event tracking accuracy: >99%
- Dashboard load time: <2 seconds
- Data freshness: <5 minute delay
- User adoption: >80% consent rate
- Actionable insights generated
- Performance impact: <50ms
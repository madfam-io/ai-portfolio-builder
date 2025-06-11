# PRISMA Error Handling & Fallback System

A comprehensive error boundary and fallback component system for the PRISMA portfolio builder, providing graceful error handling and user-friendly fallback states.

## 🏗️ Architecture Overview

The error handling system consists of three main layers:

1. **Error Boundaries** - Catch JavaScript errors in component tree
2. **Fallback Components** - Provide user-friendly error and loading states  
3. **Error Utilities** - Handle error processing, monitoring, and recovery

## 📁 Directory Structure

```
components/shared/
├── error-boundaries/
│   ├── RootErrorBoundary.tsx      # App-level error boundary
│   ├── RouteErrorBoundary.tsx     # Page-level error boundary
│   ├── WidgetErrorBoundary.tsx    # Component-level error boundary
│   ├── ErrorBoundaryExample.tsx   # Usage examples
│   └── index.ts                   # Exports
├── fallbacks/
│   ├── LoadingFallback.tsx        # Loading states & skeletons
│   ├── EmptyStateFallback.tsx     # Empty state displays
│   ├── ErrorStateFallback.tsx     # Error state displays
│   ├── OfflineStateFallback.tsx   # Offline state handling
│   ├── NotFoundFallback.tsx       # 404 and not found states
│   ├── PermissionDeniedFallback.tsx # Permission denied states
│   └── index.ts                   # Exports
├── ErrorBoundary.tsx              # Legacy error boundary (maintained for compatibility)
└── README.md                      # This documentation
```

## 🚨 Error Boundaries

### RootErrorBoundary

The top-level error boundary that catches all unhandled errors in the application.

```tsx
import { RootErrorBoundary } from '@/components/shared/error-boundaries';

function App() {
  return (
    <RootErrorBoundary>
      <MainApp />
    </RootErrorBoundary>
  );
}
```

**Features:**
- Full-page error display
- Error reporting to monitoring service
- Retry mechanism with exponential backoff
- User-friendly error messages
- Error context collection

### RouteErrorBoundary

Page-level error boundary for handling route-specific errors.

```tsx
import { RouteErrorBoundary } from '@/components/shared/error-boundaries';

function DashboardPage() {
  return (
    <RouteErrorBoundary routeName="Dashboard" inline>
      <DashboardContent />
    </RouteErrorBoundary>
  );
}
```

**Features:**
- Inline or full-page error display
- Route-specific error handling
- Navigation-aware recovery

### WidgetErrorBoundary

Component-level error boundary for granular error isolation.

```tsx
import { WidgetErrorBoundary } from '@/components/shared/error-boundaries';

function Dashboard() {
  return (
    <div>
      <WidgetErrorBoundary widgetName="Analytics Chart" compact>
        <AnalyticsChart />
      </WidgetErrorBoundary>
      
      <WidgetErrorBoundary widgetName="User Stats">
        <UserStats />
      </WidgetErrorBoundary>
    </div>
  );
}
```

**Features:**
- Compact or standard error display
- Component isolation
- Reset on props change
- Maximum retry limits

## 🔄 Fallback Components

### Loading States

Comprehensive loading indicators and skeleton screens.

```tsx
import { 
  FullPageLoader, 
  InlineLoader, 
  CardSkeleton,
  TableSkeleton 
} from '@/components/shared/fallbacks';

// Full page loading
<FullPageLoader message="Loading dashboard..." />

// Inline loading
<InlineLoader size="md" color="purple" />

// Skeleton screens
<CardSkeleton count={3} />
<TableSkeleton rows={5} columns={4} />
```

### Empty States

User-friendly empty state displays with call-to-action buttons.

```tsx
import { 
  NoPortfoliosState, 
  NoProjectsState,
  EmptyListState 
} from '@/components/shared/fallbacks';

// Specific empty states
<NoPortfoliosState 
  onCreatePortfolio={() => router.push('/create')} 
/>

<NoProjectsState 
  onAddProject={() => setShowAddProject(true)} 
/>

// Generic empty state
<EmptyListState
  itemType="templates"
  onAdd={() => handleAddTemplate()}
/>
```

### Error States

Various error displays for different error scenarios.

```tsx
import { 
  ErrorState,
  NetworkErrorState,
  AuthErrorState,
  PermissionDeniedState 
} from '@/components/shared/fallbacks';

// Generic error state
<ErrorState
  errorType="server"
  onRetry={() => refetch()}
  onReport={() => reportBug()}
/>

// Specific error states
<NetworkErrorState onRetry={() => refetch()} />
<AuthErrorState onLogin={() => signIn()} />
<PermissionDeniedState resource="admin panel" />
```

### Offline States

Handle offline scenarios gracefully.

```tsx
import { 
  OfflineState, 
  OfflineIndicator,
  useConnectionStatus 
} from '@/components/shared/fallbacks';

function App() {
  const { isOffline } = useConnectionStatus();
  
  if (isOffline) {
    return <OfflineState onRetry={() => window.location.reload()} />;
  }
  
  return (
    <>
      <MainApp />
      <OfflineIndicator />
    </>
  );
}
```

### Permission Denied

Handle access control with user-friendly displays.

```tsx
import { 
  PermissionDeniedPage,
  RoleBasedAccess,
  FeatureGate 
} from '@/components/shared/fallbacks';

// Full page permission denied
<PermissionDeniedPage 
  resource="Admin Dashboard"
  requiredRole="admin"
/>

// Role-based access control
<RoleBasedAccess requiredRole="premium" userRole={user.role}>
  <PremiumFeature />
</RoleBasedAccess>

// Feature gating
<FeatureGate feature="analytics" userFeatures={user.features}>
  <AnalyticsDashboard />
</FeatureGate>
```

## 🛠️ Error Utilities

### Error Processing

```tsx
import { 
  serializeError,
  getErrorType,
  getUserFriendlyMessage,
  formatErrorForDisplay 
} from '@/lib/utils/error-handling';

// Process error for logging
const serialized = serializeError(error);

// Get error type
const type = getErrorType(error); // 'network' | 'auth' | 'permission' | etc.

// Get user-friendly message
const message = getUserFriendlyMessage(error);

// Format for display
const { title, description, details } = formatErrorForDisplay(error);
```

### Error Monitoring

```tsx
import { captureError, errorMonitoring } from '@/lib/utils/error-handling';

// Capture error with context
await captureError(error, { 
  userId: user.id,
  action: 'portfolio_save',
  additionalContext: data 
});

// Add custom error filter
errorMonitoring.addFilter((error) => {
  return !error.message.includes('cancelled');
});

// Add custom error handler
errorMonitoring.addHandler(async (error, context) => {
  // Custom processing
  await sendToSlack(error, context);
});
```

## 🌍 Internationalization

All error messages support both English and Spanish through the i18n system.

```tsx
// Error messages are automatically translated
const { t } = useLanguage();

// Access error translations
t.errors.networkErrorTitle    // "Connection Problem" / "Problema de Conexión"
t.errors.tryAgain            // "Try Again" / "Intentar de Nuevo"
t.emptyStates.noPortfolios   // "No portfolios yet" / "Aún no hay portafolios"
```

## 🎯 Best Practices

### 1. Layered Error Boundaries

Use multiple layers of error boundaries for better isolation:

```tsx
function App() {
  return (
    <RootErrorBoundary>
      <Router>
        <RouteErrorBoundary routeName="Dashboard">
          <DashboardLayout>
            <WidgetErrorBoundary widgetName="Chart">
              <Chart />
            </WidgetErrorBoundary>
          </DashboardLayout>
        </RouteErrorBoundary>
      </Router>
    </RootErrorBoundary>
  );
}
```

### 2. Appropriate Fallbacks

Choose the right fallback for each context:

- **Full Page**: Critical errors, authentication required
- **Inline**: Section errors, widget failures
- **Compact**: Small components, non-critical features

### 3. Error Recovery

Provide meaningful recovery options:

```tsx
<ErrorState
  errorType="network"
  onRetry={() => refetch()}           // Try the same action
  onGoHome={() => router.push('/')}   // Navigate away
  onReport={() => reportBug()}        // Report the issue
/>
```

### 4. Progressive Enhancement

Gracefully degrade functionality:

```tsx
<WidgetErrorBoundary 
  fallback={<SimpleChart data={fallbackData} />}
  isolate={true}
>
  <AdvancedChart />
</WidgetErrorBoundary>
```

### 5. Error Context

Provide relevant context for debugging:

```tsx
const handleError = (error, errorInfo) => {
  captureError(error, {
    component: 'PortfolioEditor',
    portfolioId: portfolio.id,
    userAction: 'save',
    formData: sanitizeFormData(data)
  });
};
```

## 🧪 Testing

### Error Boundary Testing

```tsx
import { render, screen } from '@testing-library/react';
import { RootErrorBoundary } from '@/components/shared/error-boundaries';

function ThrowError() {
  throw new Error('Test error');
}

test('displays error boundary when child throws', () => {
  render(
    <RootErrorBoundary>
      <ThrowError />
    </RootErrorBoundary>
  );
  
  expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
});
```

### Fallback Component Testing

```tsx
import { render, screen } from '@testing-library/react';
import { NoPortfoliosState } from '@/components/shared/fallbacks';

test('displays create portfolio button', () => {
  const onCreatePortfolio = jest.fn();
  
  render(<NoPortfoliosState onCreatePortfolio={onCreatePortfolio} />);
  
  const button = screen.getByText(/create your first portfolio/i);
  expect(button).toBeInTheDocument();
});
```

## 📊 Monitoring Integration

The system integrates with error monitoring services:

```typescript
// Configure error monitoring
errorMonitoring.configure({
  enabled: process.env.NODE_ENV === 'production',
  endpoint: process.env.NEXT_PUBLIC_ERROR_MONITORING_ENDPOINT,
  apiKey: process.env.NEXT_PUBLIC_ERROR_MONITORING_API_KEY,
  sampleRate: 1.0,
  beforeSend: (report) => {
    // Filter sensitive data
    if (report.context.userId) {
      report.context.userId = 'REDACTED';
    }
    return report;
  }
});
```

## 🚀 Performance Considerations

- Error boundaries use React's built-in error catching mechanism
- Fallback components are lightweight and render quickly
- Skeleton screens match the layout of actual content
- Error monitoring includes sampling to reduce overhead
- Offline detection uses native browser APIs

## 🔧 Configuration

### Environment Variables

```env
# Error Monitoring (Optional)
NEXT_PUBLIC_ERROR_MONITORING_ENDPOINT=https://api.example.com/errors
NEXT_PUBLIC_ERROR_MONITORING_API_KEY=your-api-key

# Error Reporting Email
NEXT_PUBLIC_SUPPORT_EMAIL=support@prisma.madfam.io
```

### Error Monitoring Setup

1. **Sentry Integration** (Recommended)
```typescript
import * as Sentry from '@sentry/nextjs';

errorMonitoring.addHandler(async (error, context) => {
  Sentry.captureException(error, { extra: context });
});
```

2. **Custom API Integration**
```typescript
errorMonitoring.configure({
  endpoint: '/api/errors',
  beforeSend: (report) => ({
    ...report,
    environment: process.env.NODE_ENV,
    version: process.env.NEXT_PUBLIC_APP_VERSION
  })
});
```

## 📝 Migration Guide

### From Legacy ErrorBoundary

The legacy `ErrorBoundary.tsx` is maintained for backward compatibility, but new code should use the new system:

```tsx
// Old way
import ErrorBoundary from '@/components/shared/ErrorBoundary';

// New way
import { RootErrorBoundary } from '@/components/shared/error-boundaries';
```

### Gradual Migration

1. Start with `RootErrorBoundary` at the app level
2. Add `RouteErrorBoundary` to major pages
3. Wrap critical components with `WidgetErrorBoundary`
4. Replace custom loading states with standard fallbacks
5. Update empty states to use consistent patterns

## 🤝 Contributing

When adding new error boundaries or fallbacks:

1. Follow existing patterns and conventions
2. Add comprehensive TypeScript types
3. Include internationalization support
4. Write tests for error scenarios
5. Update this documentation
6. Consider accessibility requirements

## 📚 Related Documentation

- [PRISMA Component Architecture](../../../docs/ARCHITECTURE.md)
- [Internationalization Guide](../../lib/i18n/README.md)
- [Testing Strategy](../../../docs/TESTING.md)
- [Performance Guidelines](../../../docs/PERFORMANCE.md)
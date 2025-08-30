# SigNoz APM Setup Guide

This guide explains how to set up and use SigNoz for Application Performance Monitoring (APM) in the AI Portfolio Builder.

## Overview

SigNoz provides:

- **Distributed Tracing**: Track requests across your entire application
- **Metrics Collection**: Monitor performance metrics and business KPIs
- **Log Management**: Centralized logging with correlation to traces
- **Alerting**: Set up alerts for performance degradation

## Architecture

```
┌─────────────────┐     ┌──────────────┐     ┌─────────────────┐
│   Next.js App   │────▶│ OTEL Collector│────▶│   ClickHouse   │
│  (Instrumented) │     └──────────────┘     └─────────────────┘
└─────────────────┘              │                     │
         │                       ▼                     ▼
         │              ┌──────────────┐      ┌─────────────────┐
         └─────────────▶│ Query Service│◀─────│  SigNoz UI     │
                        └──────────────┘      └─────────────────┘
```

## Local Development Setup

### 1. Start SigNoz Stack

```bash
# Start SigNoz services
./scripts/docker-signoz.sh start

# Check service status
./scripts/docker-signoz.sh status

# View logs
./scripts/docker-signoz.sh logs
```

### 2. Configure Environment Variables

Add to your `.env.local`:

```env
# SigNoz Configuration
SIGNOZ_ENDPOINT=http://localhost:4318
OTEL_SERVICE_NAME=ai-portfolio-builder
OTEL_TRACE_ENABLED=true
OTEL_METRICS_ENABLED=true
OTEL_DEBUG=false
```

### 3. Access SigNoz UI

Open http://localhost:3301 in your browser.

Default credentials: None required for local setup.

## Production Deployment

### 1. SigNoz Cloud Setup

1. Sign up at https://signoz.io
2. Create a new team and get your ingestion key
3. Note your region endpoint

### 2. Environment Configuration

```env
# Production SigNoz
SIGNOZ_ENDPOINT=https://ingest.{region}.signoz.cloud:443
SIGNOZ_INGESTION_KEY=your-ingestion-key
OTEL_SERVICE_NAME=ai-portfolio-builder-prod
OTEL_RESOURCE_ATTRIBUTES=env=production,version=1.0.0
```

### 3. Docker Deployment

For self-hosted production:

```yaml
# docker-compose.production.yml
services:
  app:
    environment:
      - SIGNOZ_ENDPOINT=${SIGNOZ_ENDPOINT}
      - SIGNOZ_INGESTION_KEY=${SIGNOZ_INGESTION_KEY}
      - OTEL_TRACE_ENABLED=true
```

## Usage Patterns

### 1. Automatic Instrumentation

Most operations are automatically instrumented:

```typescript
// API routes are automatically traced
export async function GET(req: NextRequest) {
  // Automatic span creation
  const data = await fetchData();
  return NextResponse.json(data);
}
```

### 2. Manual Instrumentation

For custom operations:

```typescript
import { createChildSpan } from '@/lib/monitoring/signoz';

// Trace a custom operation
await createChildSpan('process_payment', async (span) => {
  span.setAttributes({
    'payment.amount': 100,
    'payment.currency': 'USD',
  });

  const result = await stripe.charges.create({...});

  span.setAttributes({
    'payment.id': result.id,
  });

  return result;
});
```

### 3. Correlated Events

Track business events with technical traces:

```typescript
import { track } from '@/lib/monitoring/unified/events';

// Portfolio creation with full observability
const portfolio = await track.portfolio.create(
  portfolioId,
  async () => {
    // Your portfolio creation logic
    return await createPortfolio(data);
  },
  {
    template: 'professional',
    ai_assisted: true,
  }
);
```

### 4. Performance Monitoring

```typescript
import { measureDuration } from '@/lib/monitoring/signoz/metrics';

// Measure operation duration
const result = await measureDuration(
  'dbQueryTime',
  async () => await db.query(sql),
  { query_type: 'select' }
);
```

## Creating Dashboards

### 1. Application Overview Dashboard

1. Go to Dashboards → New Dashboard
2. Add panels for:
   - Request rate (requests/sec)
   - Error rate (errors/sec)
   - P95 latency
   - Active users

### 2. Business Metrics Dashboard

```sql
-- Portfolios created per day
SELECT
  toDate(timestamp) as date,
  count(*) as portfolios_created
FROM signoz_metrics
WHERE metric_name = 'portfolio.created'
GROUP BY date
```

### 3. AI Performance Dashboard

Track AI operations:

- Model inference time
- Token usage
- Success/failure rates
- Cost per operation

## Setting Up Alerts

### 1. Performance Alerts

```yaml
# High latency alert
- name: high_api_latency
  condition: avg(api.response_time) > 1000
  for: 5m
  severity: warning

# Error rate alert
- name: high_error_rate
  condition: rate(api.errors) > 0.05
  for: 5m
  severity: critical
```

### 2. Business Alerts

```yaml
# Low conversion rate
- name: low_conversion_rate
  condition: rate(user.signups) / rate(portfolio.views) < 0.02
  for: 1h
  severity: warning
```

## Troubleshooting

### No traces appearing

1. Check OTEL is enabled:

   ```bash
   echo $OTEL_TRACE_ENABLED
   ```

2. Verify collector is running:

   ```bash
   curl http://localhost:4318/v1/traces
   ```

3. Check instrumentation logs:
   ```env
   OTEL_DEBUG=true
   ```

### High memory usage

1. Adjust batch size in `instrumentation.node.ts`
2. Reduce metric collection frequency
3. Enable sampling for high-volume endpoints

### Missing correlations

1. Ensure both PostHog and SigNoz are configured
2. Check trace IDs are being propagated
3. Verify ENABLE_TRACE_CORRELATION=true

## Best Practices

### 1. Span Naming

Use descriptive, hierarchical names:

- ✅ `payment.stripe.charge.create`
- ❌ `process`

### 2. Attribute Guidelines

Add meaningful attributes:

```typescript
span.setAttributes({
  'user.id': userId,
  'user.plan': 'professional',
  'feature.name': 'ai_enhancement',
});
```

### 3. Error Handling

Always record exceptions:

```typescript
try {
  await riskyOperation();
} catch (error) {
  span.recordException(error);
  span.setStatus({ code: SpanStatusCode.ERROR });
  throw error;
}
```

### 4. Sampling Strategy

For high-traffic production:

```typescript
// Sample 10% of requests
const sampler = new TraceIdRatioBasedSampler(0.1);
```

## Integration with PostHog

The unified monitoring system automatically correlates:

- User actions (PostHog) → Technical traces (SigNoz)
- Business metrics → Performance metrics
- Feature usage → System impact

Example correlation:

```typescript
// This creates linked data in both systems
await track.ai.enhance('bio', 'llama-3.1', async () => {
  return await generateAIContent(prompt);
});
```

## Monitoring Checklist

- [ ] SigNoz services running
- [ ] Environment variables configured
- [ ] Traces appearing in UI
- [ ] Metrics being collected
- [ ] Dashboards created
- [ ] Alerts configured
- [ ] PostHog correlation working
- [ ] Production deployment tested

## Resources

- [SigNoz Documentation](https://signoz.io/docs/)
- [OpenTelemetry JS Guide](https://opentelemetry.io/docs/languages/js/)
- [Next.js Instrumentation](https://nextjs.org/docs/app/building-your-application/optimizing/open-telemetry)

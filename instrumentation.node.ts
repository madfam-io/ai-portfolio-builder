/**
 * Node.js specific OpenTelemetry instrumentation
 *
 * This file configures OpenTelemetry for server-side Node.js runtime
 */

import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';

// Enable OpenTelemetry diagnostics for debugging
if (process.env.OTEL_DEBUG === 'true') {
  diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);
}

// Configure resource attributes
const resource = new Resource({
  [SemanticResourceAttributes.SERVICE_NAME]:
    process.env.OTEL_SERVICE_NAME || 'ai-portfolio-builder',
  [SemanticResourceAttributes.SERVICE_VERSION]:
    process.env.npm_package_version || '0.3.0-beta',
  [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]:
    process.env.NODE_ENV || 'development',
  [SemanticResourceAttributes.SERVICE_NAMESPACE]: 'prisma-portfolio',
  // Add custom attributes
  team: 'platform',
  'app.type': 'saas',
  'app.framework': 'nextjs',
});

// Configure trace exporter
const traceExporter = new OTLPTraceExporter({
  url: process.env.SIGNOZ_ENDPOINT
    ? `${process.env.SIGNOZ_ENDPOINT}/v1/traces`
    : 'http://localhost:4318/v1/traces',
  headers: process.env.SIGNOZ_INGESTION_KEY
    ? { 'signoz-ingestion-key': process.env.SIGNOZ_INGESTION_KEY }
    : {},
});

// Configure metric exporter
const metricExporter = new OTLPMetricExporter({
  url: process.env.SIGNOZ_ENDPOINT
    ? `${process.env.SIGNOZ_ENDPOINT}/v1/metrics`
    : 'http://localhost:4318/v1/metrics',
  headers: process.env.SIGNOZ_INGESTION_KEY
    ? { 'signoz-ingestion-key': process.env.SIGNOZ_INGESTION_KEY }
    : {},
});

// Initialize OpenTelemetry SDK
const sdk = new NodeSDK({
  resource,
  spanProcessor: new BatchSpanProcessor(traceExporter, {
    // Configure batching
    maxQueueSize: 2048,
    maxExportBatchSize: 512,
    scheduledDelayMillis: 5000,
    exportTimeoutMillis: 30000,
  }),
  metricReader: new PeriodicExportingMetricReader({
    exporter: metricExporter,
    exportIntervalMillis: 60000, // Export metrics every 60 seconds
  }),
  instrumentations: [
    getNodeAutoInstrumentations({
      // Disable some instrumentations that might cause issues
      '@opentelemetry/instrumentation-fs': {
        enabled: false,
      },
      '@opentelemetry/instrumentation-net': {
        enabled: false,
      },
      // Configure specific instrumentations
      '@opentelemetry/instrumentation-http': {
        enabled: true,
        // Ignore health check endpoints
        ignoreIncomingRequestHook: request => {
          const url = request.url;
          if (!url) return false;

          // Ignore health checks and static assets
          return (
            url.includes('/health') ||
            url.includes('/_next/') ||
            url.includes('/favicon') ||
            url.includes('.map')
          );
        },
      },
      '@opentelemetry/instrumentation-express': {
        enabled: true,
      },
      '@opentelemetry/instrumentation-redis-4': {
        enabled: true,
      },
    }),
  ],
});

// Handle shutdown gracefully
const gracefulShutdown = async () => {
  try {
    await sdk.shutdown();
    console.log('OpenTelemetry SDK shut down successfully');
  } catch (error) {
    console.error('Error shutting down OpenTelemetry SDK', error);
  } finally {
    process.exit(0);
  }
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Initialize the SDK
if (process.env.OTEL_TRACE_ENABLED !== 'false') {
  sdk
    .start()
    .then(() => {
      console.log('✅ OpenTelemetry instrumentation started successfully');
      console.log(
        `📊 Sending traces to: ${process.env.SIGNOZ_ENDPOINT || 'http://localhost:4318'}`
      );
    })
    .catch(error => {
      console.error('❌ Failed to initialize OpenTelemetry', error);
    });
} else {
  console.log('⏸️  OpenTelemetry tracing is disabled');
}

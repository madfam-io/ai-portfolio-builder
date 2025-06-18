/**
 * Node.js specific OpenTelemetry instrumentation
 *
 * This file configures OpenTelemetry for server-side Node.js runtime
 * Currently disabled due to version compatibility issues with OpenTelemetry v2
 */

// Temporarily disable OpenTelemetry instrumentation until dependency issues are resolved
// The build warnings about missing winston-transport and exporter-jaeger are from optional
// dependencies that are not needed for our use case
if (process.env.OTEL_ENABLED === 'true') {
  console.log('OpenTelemetry instrumentation is currently disabled');
}

export {};

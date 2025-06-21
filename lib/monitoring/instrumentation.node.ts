/**
 * MADFAM Code Available License (MCAL) v1.0
 * 
 * Copyright (c) 2025-present MADFAM. All rights reserved.
 * 
 * This source code is made available for viewing and educational purposes only.
 * Commercial use is strictly prohibited except by MADFAM and licensed partners.
 * 
 * For commercial licensing: licensing@madfam.com
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

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

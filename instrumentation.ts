/**
 * OpenTelemetry Instrumentation Configuration
 *
 * This file sets up OpenTelemetry instrumentation for the Next.js application.
 * It must be in the root directory (or src/ if using src folder).
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Import Node.js specific instrumentation
    await import('./instrumentation.node');
  }
}

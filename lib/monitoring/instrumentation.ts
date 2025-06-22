/**
 * MADFAM Code Available License (MCAL) v1.0
 *
 * Copyright (c) 2025-present MADFAM. All rights reserved.
 *
 * This source code is made available for viewing and educational purposes only.
 * Commercial use is strictly prohibited except by MADFAM and licensed partners.
 *
 * For commercial licensing: licensing@madfam.io
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

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

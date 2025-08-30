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

// Simplified health check using new infrastructure
import { infrastructure } from '@/lib/adapters/infrastructure-adapter';

export async function performHealthCheck() {
  return await infrastructure.healthCheck();
}

// Legacy exports for backward compatibility
export const healthCheck = performHealthCheck;
export const handleHealthCheck = performHealthCheck;
export const handleLivenessCheck = performHealthCheck;
export const handleReadinessCheck = performHealthCheck;

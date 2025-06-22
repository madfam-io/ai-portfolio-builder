/**
 * @license MIT
 * Copyright (c) 2025 MADFAM
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

/**
 * @madfam/experiments
 *
 * Allocation engine for experiment variations
 */

import murmurhash from 'murmurhash';
import type {
  Experiment,
  Variation,
  UserContext,
  AllocationStrategy,
  FeatureFlag,
  FeatureFlagVariation,
} from './types';

export class AllocationEngine {
  private defaultStrategy: AllocationStrategy;

  constructor(defaultStrategy?: AllocationStrategy) {
    this.defaultStrategy = defaultStrategy || {
      type: 'deterministic',
      sticky: true,
    };
  }

  /**
   * Allocate a user to a variation
   */
  allocate(
    experiment: Experiment,
    userContext: UserContext
  ): Promise<Variation> {
    const strategy = experiment.allocation || this.defaultStrategy;

    switch (strategy.type) {
      case 'random':
        return this.randomAllocation(experiment.variations);

      case 'deterministic':
        return this.deterministicAllocation(
          experiment.variations,
          userContext.userId,
          experiment.id,
          strategy.seed
        );

      case 'weighted':
        return this.weightedAllocation(
          experiment.variations,
          userContext.userId,
          experiment.id,
          strategy.seed
        );

      case 'percentage':
        return this.percentageAllocation(
          experiment.variations,
          userContext.userId,
          experiment.id
        );

      case 'custom':
        if (!strategy.customAllocator) {
          throw new Error('Custom allocator not provided');
        }
        return strategy.customAllocator(experiment, userContext);

      default:
        throw new Error(`Unknown allocation type: ${strategy.type}`);
    }
  }

  /**
   * Allocate a user to a feature flag variation
   */
  allocateFlag(
    flag: FeatureFlag,
    userContext: UserContext
  ): Promise<FeatureFlagVariation> {
    if (!flag.variations || flag.variations.length === 0) {
      throw new Error('Flag has no variations');
    }

    const bucket = this.getBucket(
      userContext.userId,
      flag.key,
      flag.key // Use flag key as salt
    );

    let cumulative = 0;
    for (const variation of flag.variations) {
      cumulative += variation.weight;
      if (bucket < cumulative) {
        return variation;
      }
    }

    // Fallback to last variation
    return flag.variations[flag.variations.length - 1];
  }

  /**
   * Random allocation
   */
  private randomAllocation(variations: Variation[]): Variation {
    const index = Math.floor(Math.random() * variations.length);
    return variations[index];
  }

  /**
   * Deterministic allocation based on user ID
   */
  private deterministicAllocation(
    variations: Variation[],
    userId: string,
    experimentId: string,
    seed?: string
  ): Variation {
    const bucket = this.getBucket(userId, experimentId, seed);

    // For equal weight variations
    if (this.hasEqualWeights(variations)) {
      const index = Math.floor((bucket / 100) * variations.length);
      return variations[index];
    }

    // For weighted variations
    return this.selectByWeight(variations, bucket);
  }

  /**
   * Weighted allocation
   */
  private weightedAllocation(
    variations: Variation[],
    userId: string,
    experimentId: string,
    seed?: string
  ): Variation {
    const bucket = this.getBucket(userId, experimentId, seed);
    return this.selectByWeight(variations, bucket);
  }

  /**
   * Percentage-based allocation
   */
  private percentageAllocation(
    variations: Variation[],
    userId: string,
    experimentId: string
  ): Variation {
    const bucket = this.getBucket(userId, experimentId);

    // Find control variation
    const control = variations.find(v => v.isControl) || variations[0];
    const treatment = variations.find(v => !v.isControl) || variations[1];

    // Allocate based on treatment weight
    return bucket < treatment.weight ? treatment : control;
  }

  /**
   * Get bucket value (0-100) for user
   */
  private getBucket(userId: string, namespace: string, seed?: string): number {
    const hashInput = seed
      ? `${seed}:${namespace}:${userId}`
      : `${namespace}:${userId}`;

    const hash = murmurhash.v3(hashInput);
    return Math.abs(hash % 100);
  }

  /**
   * Select variation by weight
   */
  private selectByWeight(variations: Variation[], bucket: number): Variation {
    let cumulative = 0;

    for (const variation of variations) {
      cumulative += variation.weight;
      if (bucket < cumulative) {
        return variation;
      }
    }

    // Fallback to last variation
    return variations[variations.length - 1];
  }

  /**
   * Check if all variations have equal weights
   */
  private hasEqualWeights(variations: Variation[]): boolean {
    if (variations.length === 0) return true;

    const firstWeight = variations[0].weight;
    return variations.every(v => v.weight === firstWeight);
  }

  /**
   * Validate allocation weights
   */
  validateWeights(variations: Variation[]): boolean {
    const totalWeight = variations.reduce((sum, v) => sum + v.weight, 0);
    return Math.abs(totalWeight - 100) < 0.01;
  }
}

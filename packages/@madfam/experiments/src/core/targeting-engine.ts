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
 * Targeting engine for experiment eligibility
 */

import type {
  TargetingRules,
  UserContext,
  TargetingCondition,
  Audience,
  ConditionOperator,
} from './types';
import type { TargetingValue, SegmentAttributes } from './value-types';

export class TargetingEngine {
  /**
   * Evaluate targeting rules for a user
   */
  async evaluate(
    rules: TargetingRules | undefined,
    userContext: UserContext
  ): Promise<boolean> {
    if (!rules || !rules.enabled) return true;

    // Check percentage targeting
    if (rules.percentage !== undefined && rules.percentage < 100) {
      const inPercentage = this.isInPercentage(
        userContext.userId,
        rules.percentage
      );
      if (!inPercentage) return false;
    }

    // Check segments
    if (rules.segments && rules.segments.length > 0) {
      const inSegment = this.evaluateSegments(rules.segments, userContext);
      if (!inSegment) return false;
    }

    // Check audiences
    if (rules.audiences && rules.audiences.length > 0) {
      const inAudience = await this.evaluateAudiences(
        rules.audiences,
        userContext
      );
      if (!inAudience) return false;
    }

    // Check conditions
    if (rules.conditions && rules.conditions.length > 0) {
      const meetsConditions = this.evaluateConditions(
        rules.conditions,
        userContext
      );
      if (!meetsConditions) return false;
    }

    return true;
  }

  /**
   * Check if user is in percentage
   */
  private isInPercentage(userId: string, percentage: number): boolean {
    // Simple hash-based percentage check
    const hash = this.hashUserId(userId);
    return hash % 100 < percentage;
  }

  /**
   * Evaluate segment membership
   */
  private evaluateSegments(
    segments: Array<{
      id?: string;
      userIds?: string[];
    }>,
    userContext: UserContext
  ): boolean {
    if (!userContext.segments) return false;

    return segments.some(segment => {
      if (segment.userIds && segment.userIds.includes(userContext.userId)) {
        return true;
      }

      if (segment.id && userContext.segments?.includes(segment.id)) {
        return true;
      }

      return false;
    });
  }

  /**
   * Evaluate audience membership
   */
  private async evaluateAudiences(
    audiences: Audience[],
    userContext: UserContext
  ): Promise<boolean> {
    for (const audience of audiences) {
      const matches = await this.evaluateAudience(audience, userContext);
      if (matches) return true;
    }
    return false;
  }

  /**
   * Evaluate single audience
   */
  private async evaluateAudience(
    audience: Audience,
    userContext: UserContext
  ): Promise<boolean> {
    const results = await Promise.all(
      audience.conditions.map(condition =>
        this.evaluateCondition(condition, userContext)
      )
    );

    if (audience.operator === 'AND') {
      return results.every(result => result);
    } else {
      return results.some(result => result);
    }
  }

  /**
   * Evaluate conditions
   */
  private evaluateConditions(
    conditions: TargetingCondition[],
    userContext: UserContext
  ): boolean {
    return conditions.every(condition =>
      this.evaluateCondition(condition, userContext)
    );
  }

  /**
   * Evaluate single condition
   */
  private evaluateCondition(
    condition: TargetingCondition,
    userContext: UserContext
  ): boolean {
    const attributeValue = this.getAttributeValue(
      condition.attribute,
      userContext
    );

    const result = this.compareValues(
      attributeValue,
      condition.value,
      condition.operator
    );

    return condition.negate ? !result : result;
  }

  /**
   * Get attribute value from user context
   */
  private getAttributeValue(
    attribute: string,
    userContext: UserContext
  ): TargetingValue | undefined {
    // Handle nested attributes
    const parts = attribute.split('.');
    let value: SegmentAttributes | TargetingValue | undefined =
      userContext.attributes;

    for (const part of parts) {
      if (value && typeof value === 'object') {
        value = value[part];
      } else {
        return undefined;
      }
    }

    return value;
  }

  /**
   * Compare values based on operator
   */
  private compareValues(
    attributeValue: TargetingValue | undefined,
    targetValue: TargetingValue,
    operator: ConditionOperator
  ): boolean {
    switch (operator) {
      case 'equals':
      case 'not_equals':
        return this.compareEquality(attributeValue, targetValue, operator);

      case 'contains':
      case 'not_contains':
      case 'starts_with':
      case 'ends_with':
        return this.compareStringOperations(
          attributeValue,
          targetValue,
          operator
        );

      case 'greater_than':
      case 'less_than':
      case 'greater_than_or_equal':
      case 'less_than_or_equal':
        return this.compareNumeric(attributeValue, targetValue, operator);

      case 'in':
      case 'not_in':
        return this.compareArrayMembership(
          attributeValue,
          targetValue,
          operator
        );

      case 'regex':
        return this.compareRegex(attributeValue, targetValue);

      case 'exists':
      case 'not_exists':
        return this.compareExistence(attributeValue, operator);

      default:
        return false;
    }
  }

  /**
   * Compare equality operations
   */
  private compareEquality(
    attributeValue: TargetingValue | undefined,
    targetValue: TargetingValue,
    operator: 'equals' | 'not_equals'
  ): boolean {
    const isEqual = attributeValue === targetValue;
    return operator === 'equals' ? isEqual : !isEqual;
  }

  /**
   * Compare string operations
   */
  private compareStringOperations(
    attributeValue: TargetingValue | undefined,
    targetValue: TargetingValue,
    operator: 'contains' | 'not_contains' | 'starts_with' | 'ends_with'
  ): boolean {
    const attrStr = String(attributeValue);
    const targetStr = String(targetValue);

    switch (operator) {
      case 'contains':
        return attrStr.includes(targetStr);
      case 'not_contains':
        return !attrStr.includes(targetStr);
      case 'starts_with':
        return attrStr.startsWith(targetStr);
      case 'ends_with':
        return attrStr.endsWith(targetStr);
      default:
        return false;
    }
  }

  /**
   * Compare numeric operations
   */
  private compareNumeric(
    attributeValue: TargetingValue | undefined,
    targetValue: TargetingValue,
    operator:
      | 'greater_than'
      | 'less_than'
      | 'greater_than_or_equal'
      | 'less_than_or_equal'
  ): boolean {
    const attrNum = Number(attributeValue);
    const targetNum = Number(targetValue);

    switch (operator) {
      case 'greater_than':
        return attrNum > targetNum;
      case 'less_than':
        return attrNum < targetNum;
      case 'greater_than_or_equal':
        return attrNum >= targetNum;
      case 'less_than_or_equal':
        return attrNum <= targetNum;
      default:
        return false;
    }
  }

  /**
   * Compare array membership operations
   */
  private compareArrayMembership(
    attributeValue: TargetingValue | undefined,
    targetValue: TargetingValue,
    operator: 'in' | 'not_in'
  ): boolean {
    if (!Array.isArray(targetValue)) {
      return operator === 'not_in';
    }

    const isIncluded = targetValue.includes(attributeValue);
    return operator === 'in' ? isIncluded : !isIncluded;
  }

  /**
   * Compare regex operations
   */
  private compareRegex(
    attributeValue: TargetingValue | undefined,
    targetValue: TargetingValue
  ): boolean {
    try {
      const regex = new RegExp(String(targetValue));
      return regex.test(String(attributeValue));
    } catch {
      return false;
    }
  }

  /**
   * Compare existence operations
   */
  private compareExistence(
    attributeValue: TargetingValue | undefined,
    operator: 'exists' | 'not_exists'
  ): boolean {
    const exists = attributeValue !== undefined && attributeValue !== null;
    return operator === 'exists' ? exists : !exists;
  }

  /**
   * Simple hash function for user IDs
   */
  private hashUserId(userId: string): number {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }
}

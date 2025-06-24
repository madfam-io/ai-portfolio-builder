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

import type { PersistenceAdapter } from '../types';
import type { Assignment, FeatureFlagAssignment } from '../../core/types';

/**
 * In-memory persistence adapter
 * Useful for testing and server-side environments
 */
export class MemoryPersistenceAdapter implements PersistenceAdapter {
  private assignments: Map<string, Assignment> = new Map();
  private flagAssignments: Map<string, FeatureFlagAssignment> = new Map();
  private visitorIds: Map<string, string> = new Map();
  private sessionVisitorId?: string;

  getAssignment(
    experimentId: string,
    userId: string
  ): Promise<Assignment | null> {
    const key = `${experimentId}:${userId}`;
    return this.assignments.get(key) || null;
  }

  saveAssignment(assignment: Assignment): Promise<void> {
    const key = `${assignment.experimentId}:${assignment.userId}`;
    this.assignments.set(key, assignment);
  }

  getUserAssignments(userId: string): Promise<Assignment[]> {
    const assignments: Assignment[] = [];

    for (const assignment of this.assignments.values()) {
      if (assignment.userId === userId) {
        assignments.push(assignment);
      }
    }

    return assignments;
  }

  clearUserAssignments(userId: string): Promise<void> {
    const keysToDelete: string[] = [];

    for (const [key, assignment] of this.assignments.entries()) {
      if (assignment.userId === userId) {
        keysToDelete.push(key);
      }
    }

    for (const key of keysToDelete) {
      this.assignments.delete(key);
    }
  }

  getFlagAssignment(
    flagKey: string,
    userId: string
  ): Promise<FeatureFlagAssignment | null> {
    const key = `${flagKey}:${userId}`;
    return this.flagAssignments.get(key) || null;
  }

  saveFlagAssignment(assignment: FeatureFlagAssignment): Promise<void> {
    const key = `${assignment.flagKey}:${assignment.userId}`;
    this.flagAssignments.set(key, assignment);
  }

  getOrCreateVisitorId(): Promise<string> {
    if (!this.sessionVisitorId) {
      this.sessionVisitorId = this.generateVisitorId();
    }
    return this.sessionVisitorId;
  }

  /**
   * Get or create visitor ID for a specific context
   * Useful for multi-tenant scenarios
   */
  getOrCreateVisitorIdForContext(context: string): Promise<string> {
    let visitorId = this.visitorIds.get(context);

    if (!visitorId) {
      visitorId = this.generateVisitorId();
      this.visitorIds.set(context, visitorId);
    }

    return visitorId;
  }

  /**
   * Clear all data (useful for testing)
   */
  clear(): void {
    this.assignments.clear();
    this.flagAssignments.clear();
    this.visitorIds.clear();
    this.sessionVisitorId = undefined;
  }

  /**
   * Generate a unique visitor ID
   */
  private generateVisitorId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}

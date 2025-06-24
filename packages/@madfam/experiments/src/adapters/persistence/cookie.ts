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

interface CookieOptions {
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
  maxAge?: number;
  path?: string;
  domain?: string;
}

interface CookieManager {
  get(name: string): string | undefined;
  set(name: string, value: string, options?: CookieOptions): void;
  delete(name: string): void;
}

/**
 * Cookie-based persistence adapter for browser environments
 * Stores experiment and feature flag assignments in cookies
 */
export class CookiePersistenceAdapter implements PersistenceAdapter {
  private readonly ASSIGNMENT_COOKIE = 'madfam_experiments';
  private readonly FLAG_COOKIE = 'madfam_flags';
  private readonly VISITOR_COOKIE = 'madfam_visitor_id';
  private readonly DEFAULT_MAX_AGE = 90 * 24 * 60 * 60; // 90 days

  constructor(
    private cookieManager: CookieManager,
    private options: CookieOptions = {}
  ) {
    // Set default options
    this.options = {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: this.DEFAULT_MAX_AGE,
      path: '/',
      ...options,
    };
  }

  getAssignment(
    experimentId: string,
    userId: string
  ): Assignment | null {
    const assignments = this.getAssignments();
    const key = `${experimentId}:${userId}`;
    return assignments[key] || null;
  }

  saveAssignment(assignment: Assignment): void {
    const assignments = this.getAssignments();
    const key = `${assignment.experimentId}:${assignment.userId}`;

    assignments[key] = assignment;

    this.cookieManager.set(
      this.ASSIGNMENT_COOKIE,
      JSON.stringify(assignments),
      this.options
    );
  }

  getUserAssignments(userId: string): Assignment[] {
    const assignments = this.getAssignments();
    return Object.values(assignments).filter(a => a.userId === userId);
  }

  clearUserAssignments(userId: string): void {
    const assignments = this.getAssignments();
    const filtered: Record<string, Assignment> = {};

    for (const [key, assignment] of Object.entries(assignments)) {
      if (assignment.userId !== userId) {
        filtered[key] = assignment;
      }
    }

    if (Object.keys(filtered).length === 0) {
      this.cookieManager.delete(this.ASSIGNMENT_COOKIE);
    } else {
      this.cookieManager.set(
        this.ASSIGNMENT_COOKIE,
        JSON.stringify(filtered),
        this.options
      );
    }
  }

  getFlagAssignment(
    flagKey: string,
    userId: string
  ): FeatureFlagAssignment | null {
    const flags = this.getFlags();
    const key = `${flagKey}:${userId}`;
    return flags[key] || null;
  }

  saveFlagAssignment(assignment: FeatureFlagAssignment): void {
    const flags = this.getFlags();
    const key = `${assignment.flagKey}:${assignment.userId}`;

    flags[key] = assignment;

    this.cookieManager.set(
      this.FLAG_COOKIE,
      JSON.stringify(flags),
      this.options
    );
  }

  getOrCreateVisitorId(): string {
    let visitorId = this.cookieManager.get(this.VISITOR_COOKIE);

    if (!visitorId) {
      visitorId = this.generateVisitorId();
      this.cookieManager.set(this.VISITOR_COOKIE, visitorId, this.options);
    }

    return visitorId;
  }

  /**
   * Get all assignments from cookie
   */
  private getAssignments(): Record<string, Assignment> {
    const cookie = this.cookieManager.get(this.ASSIGNMENT_COOKIE);
    if (!cookie) return {};

    try {
      return JSON.parse(decodeURIComponent(cookie));
    } catch {
      return {};
    }
  }

  /**
   * Get all feature flag assignments from cookie
   */
  private getFlags(): Record<string, FeatureFlagAssignment> {
    const cookie = this.cookieManager.get(this.FLAG_COOKIE);
    if (!cookie) return {};

    try {
      return JSON.parse(decodeURIComponent(cookie));
    } catch {
      return {};
    }
  }

  /**
   * Generate a unique visitor ID
   */
  private generateVisitorId(): string {
    // Generate a UUID v4
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}

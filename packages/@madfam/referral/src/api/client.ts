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
 * API client for referral system
 */

import type {
  CreateReferralRequest,
  CreateReferralResponse,
  TrackReferralClickRequest,
  TrackReferralClickResponse,
  ConvertReferralRequest,
  ConvertReferralResponse,
  Referral,
  ReferralCampaign,
  ReferralReward,
  UserReferralStats,
} from '../types';

export interface ReferralAPIConfig {
  baseUrl: string;
  apiKey?: string;
  timeout?: number;
}

export class ReferralAPIClient {
  private config: ReferralAPIConfig;

  constructor(config: ReferralAPIConfig) {
    this.config = {
      timeout: 30000,
      ...config,
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.config.baseUrl}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.config.apiKey) {
      headers['Authorization'] = `Bearer ${this.config.apiKey}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        error.message || `Request failed: ${response.statusText}`
      );
    }

    return response.json();
  }

  // Referral management
  createReferral(
    userId: string,
    request: CreateReferralRequest = {}
  ): CreateReferralResponse {
    return this.request('/referral/create', {
      method: 'POST',
      body: JSON.stringify({ userId, ...request }),
    });
  }

  trackClick(request: TrackReferralClickRequest): TrackReferralClickResponse {
    return this.request('/referral/track', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  convertReferral(request: ConvertReferralRequest): ConvertReferralResponse {
    return this.request('/referral/convert', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // User data
  getUserReferrals(userId: string): Referral[] {
    return this.request(`/referral/user/${userId}/referrals`);
  }

  getUserRewards(userId: string): ReferralReward[] {
    return this.request(`/referral/user/${userId}/rewards`);
  }

  getUserStats(userId: string): UserReferralStats {
    return this.request(`/referral/user/${userId}/stats`);
  }

  // Campaigns
  getCampaigns(userId?: string): ReferralCampaign[] {
    const params = userId ? `?userId=${userId}` : '';
    return this.request(`/referral/campaigns${params}`);
  }

  getCampaign(campaignId: string): ReferralCampaign {
    return this.request(`/referral/campaigns/${campaignId}`);
  }

  // Analytics
  getAnalytics(params: {
    startDate: string;
    endDate: string;
    campaignId?: string;
  }): unknown {
    const queryParams = new URLSearchParams(params);
    return this.request(`/referral/analytics?${queryParams}`);
  }

  // Leaderboard
  getLeaderboard(
    params: {
      period?: 'daily' | 'weekly' | 'monthly' | 'all-time';
      limit?: number;
    } = {}
  ): any[] {
    const queryParams = new URLSearchParams(params as any);
    return this.request(`/referral/leaderboard?${queryParams}`);
  }
}

// Factory function
export function createReferralAPIClient(
  config: ReferralAPIConfig
): ReferralAPIClient {
  return new ReferralAPIClient(config);
}

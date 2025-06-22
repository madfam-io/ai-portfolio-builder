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
 * Configuration types
 */

export type ReferralEngineConfig = {
  default_campaign_id?: string;
  fraud_detection_enabled: boolean;
  auto_approve_low_risk: boolean;
  max_referrals_per_user: number;
  conversion_window_days: number;
  code_length: number;
  enable_analytics: boolean;
  enable_gamification: boolean;
};

export type DatabaseConfig = {
  supabase_url: string;
  supabase_anon_key: string;
  supabase_service_key: string;
};

export type AnalyticsConfig = {
  posthog_project_id?: string;
  posthog_api_key?: string;
  custom_analytics_endpoint?: string;
  enable_detailed_tracking: boolean;
};

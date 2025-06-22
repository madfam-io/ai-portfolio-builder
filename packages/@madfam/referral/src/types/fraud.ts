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
 * Fraud detection types
 */

export interface FraudDetectionResult {
  risk_score: number; // 0-100
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  flags: FraudFlag[];
  recommended_action: 'approve' | 'review' | 'reject' | 'investigate';
  confidence: number;
}

export interface FraudFlag {
  type: FraudFlagType;
  severity: 'low' | 'medium' | 'high';
  description: string;
  evidence: Record<string, unknown>;
}

export type FraudFlagType =
  | 'velocity_abuse'
  | 'similarity_pattern'
  | 'device_fingerprint_match'
  | 'ip_address_abuse'
  | 'email_pattern_suspicious'
  | 'user_agent_suspicious'
  | 'geographic_anomaly'
  | 'payment_method_risk'
  | 'behavioral_anomaly'
  | 'ml_model_flag';

export class FraudDetectionError extends Error {
  constructor(
    message: string,
    public riskScore: number,
    public flags: FraudFlag[]
  ) {
    super(message);
    this.name = 'FraudDetectionError';
  }
}

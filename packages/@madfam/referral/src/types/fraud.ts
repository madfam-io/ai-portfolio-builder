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
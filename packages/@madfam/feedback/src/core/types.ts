/**
 * @madfam/feedback
 *
 * World-class feedback collection and analytics system
 *
 * @version 1.0.0
 * @license MCAL-1.0
 * @copyright 2025 MADFAM LLC
 *
 * This software is licensed under the MADFAM Code Available License (MCAL) v1.0.
 * You may use this software for personal, educational, and internal business purposes.
 * Commercial use, redistribution, and modification require explicit permission.
 *
 * For commercial licensing inquiries: licensing@madfam.io
 * For the full license text: https://madfam.com/licenses/mcal-1.0
 */

/**
 * Core Types and Interfaces
 *
 * Comprehensive type definitions for the feedback system
 */

import type { AnalyticsProvider } from '../analytics/types';

// ============================================
// Feedback Entry Types
// ============================================

export type FeedbackType =
  | 'bug'
  | 'feature_request'
  | 'improvement'
  | 'general'
  | 'usability';
export type FeedbackSeverity = 'low' | 'medium' | 'high' | 'critical';
export type FeedbackStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type NPSCategory = 'promoter' | 'passive' | 'detractor';

export interface FeedbackEntry {
  id: string;
  userId: string;
  type: FeedbackType;
  severity: FeedbackSeverity;
  title: string;
  description: string;
  category: string;
  userAgent: string;
  url: string;
  timestamp: Date;
  status: FeedbackStatus;
  attachments?: string[];
  reproductionSteps?: string[];
  expectedBehavior?: string;
  actualBehavior?: string;
  tags: string[];
  rating?: number; // 1-5 star rating
  userContext?: UserContext;
  metadata?: Record<string, string | number | boolean | string[] | null>;
}

export interface UserContext {
  plan: string;
  accountAge: number;
  portfoliosCreated: number;
  lastActivity: Date;
  customFields?: Record<string, string | number | boolean | Date | null>;
}

// ============================================
// Survey Types
// ============================================

export interface SatisfactionSurvey {
  id: string;
  userId: string;
  timestamp: Date;
  overallSatisfaction: number; // 1-10
  easeOfUse: number; // 1-10
  performance: number; // 1-10
  features: number; // 1-10
  design: number; // 1-10
  likelihoodToRecommend: number; // 1-10 (NPS)
  npsCategory: NPSCategory;
  mostUsefulFeature: string;
  leastUsefulFeature: string;
  missingFeatures: string[];
  additionalComments: string;
  completionContext: string;
  completedIn: number; // seconds
  metadata?: Record<string, string | number | boolean | string[] | null>;
}

// ============================================
// Analytics Types
// ============================================

export interface BetaMetrics {
  totalUsers: number;
  activeUsers: number;
  portfoliosCreated: number;
  avgTimeToFirstPortfolio: number;
  avgPortfolioCompletionRate: number;
  feedbackEntries: number;
  surveyResponses: number;
  averageNPS: number;
  criticalBugs: number;
  featureRequests: number;
  userRetention: UserRetention;
}

export interface UserRetention {
  day1: number;
  day7: number;
  day30: number;
}

export interface FeedbackEvent {
  id: string;
  referenceId: string; // feedback or survey ID
  eventType: string;
  userId: string;
  timestamp: Date;
  properties: Record<string, unknown>;
  metadata?: Record<string, string | number | boolean | string[] | null>;
}

export interface FeedbackTrend {
  date: string;
  bugs: number;
  features: number;
  improvements: number;
  total: number;
}

export interface FeedbackReport {
  summary: {
    totalFeedback: number;
    criticalIssues: number;
    averageRating: number;
    npsScore: number;
  };
  breakdown: {
    byType: Record<string, number>;
    bySeverity: Record<string, number>;
    byStatus: Record<string, number>;
  };
  topIssues: FeedbackEntry[];
  recentSurveys: SatisfactionSurvey[];
}

// ============================================
// Configuration Types
// ============================================

export interface FeedbackSystemConfig {
  apiEndpoint?: string;
  storage?: StorageConfig;
  analytics?: AnalyticsConfig;
  notifications?: NotificationConfig;
  ui?: UIConfig;
  features?: FeatureConfig;
  maxFeedbackEntries?: number;
  feedbackRetentionDays?: number;
  analyticsRetentionDays?: number;
}

export interface StorageConfig {
  type: 'supabase' | 'prisma' | 'memory' | 'custom';
  connectionString?: string;
  options?: Record<string, string | number | boolean>;
}

export interface AnalyticsConfig {
  enabled: boolean;
  provider?: 'posthog' | 'mixpanel' | 'amplitude' | 'custom';
  apiKey?: string;
  batchSize?: number;
  flushInterval?: number;
  options?: Record<string, string | number | boolean>;
  customProvider?: AnalyticsProvider;
}

export interface NotificationConfig {
  // Email configuration
  email?: {
    enabled: boolean;
    provider: 'sendgrid' | 'ses' | 'smtp' | 'resend';
    credentials?: Record<string, string>;
    criticalBugRecipients?: string[];
    newFeedbackRecipients?: string[];
    surveyRecipients?: string[];
    teamRecipients?: string[];
    userNotifications?: boolean;
    rateLimit?: {
      maxPerMinute: number;
      maxPerHour: number;
    };
    trackDelivery?: boolean;
    dashboardUrl?: string;
  };
  
  // Legacy webhook support
  criticalBugWebhook?: string;
  emailOnCritical?: string;
  slackIntegration?: {
    webhookUrl: string;
    channel?: string;
  };
  customWebhooks?: WebhookConfig[];
}

export interface WebhookConfig {
  url: string;
  events: string[];
  headers?: Record<string, string>;
}

export interface UIConfig {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  theme?: 'light' | 'dark' | 'auto';
  primaryColor?: string;
  zIndex?: number;
  customStyles?: Record<string, string>;
}

export interface FeatureConfig {
  surveys?: {
    enabled: boolean;
    triggers: SurveyTriggers;
  };
  analytics?: {
    enabled: boolean;
    trackingLevel: 'basic' | 'detailed' | 'full';
  };
  betaLaunchChecker?: boolean;
  fileAttachments?: boolean;
  customFields?: boolean;
}

export interface SurveyTriggers {
  afterPortfolioCreation: boolean;
  afterPublishing: boolean;
  weeklyActiveUsers: boolean;
  beforeChurn: boolean;
  customTriggers?: CustomTrigger[];
}

export interface CustomTrigger {
  name: string;
  condition: (context: UserContext) => boolean;
  delay?: number; // milliseconds
}

// ============================================
// API Types
// ============================================

export interface FeedbackFilter {
  type?: FeedbackType;
  severity?: FeedbackSeverity;
  status?: FeedbackStatus;
  userId?: string;
  category?: string;
  tags?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  limit?: number;
  offset?: number;
  sortBy?: 'date' | 'severity' | 'rating';
  sortOrder?: 'asc' | 'desc';
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  metadata?: {
    timestamp: Date;
    version: string;
    requestId: string;
  };
}

export interface PaginatedResponse<T> extends APIResponse<T[]> {
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

// ============================================
// Event Types
// ============================================

export interface AnalyticsEvent {
  userId: string;
  event: string;
  properties?: Record<string, unknown>;
  timestamp?: Date;
  context?: {
    ip?: string;
    userAgent?: string;
    referrer?: string;
    page?: string;
  };
}

export interface PortfolioJourneyEvent extends AnalyticsEvent {
  event: 'portfolio_journey';
  properties: {
    step: string;
    duration?: number;
    completed?: boolean;
    metadata?: Record<string, string | number | boolean | string[] | null>;
  };
}

export interface FeatureUsageEvent extends AnalyticsEvent {
  event: 'feature_usage';
  properties: {
    feature: string;
    action: string;
    value?: unknown;
    metadata?: Record<string, string | number | boolean | string[] | null>;
  };
}

export interface SessionEvent extends AnalyticsEvent {
  event: 'session_complete';
  properties: {
    duration: number;
    pagesViewed: string[];
    actionsPerformed: string[];
    exitPage: string;
    errors?: number;
  };
}

// ============================================
// Beta Launch Types
// ============================================

export interface ReadinessCheck {
  passed: boolean;
  message: string;
  details?: Record<string, unknown>;
}

export interface BetaReadinessReport {
  ready: boolean;
  score: number;
  checks: {
    performance: ReadinessCheck;
    stability: ReadinessCheck;
    features: ReadinessCheck;
    testing: ReadinessCheck;
    monitoring: ReadinessCheck;
  };
  recommendations: string[];
  timestamp: Date;
}

// ============================================
// Error Types
// ============================================

export class FeedbackError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'FeedbackError';
  }
}

export class StorageError extends FeedbackError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'STORAGE_ERROR', details);
    this.name = 'StorageError';
  }
}

export class ValidationError extends FeedbackError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

// ============================================
// Storage Interface
// ============================================

export interface StorageAdapter {
  // Feedback operations
  createFeedback(
    feedback: Omit<FeedbackEntry, 'id' | 'timestamp'>
  ): Promise<FeedbackEntry>;
  getFeedback(id: string): Promise<FeedbackEntry | null>;
  listFeedback(
    filter?: FeedbackFilter
  ): Promise<PaginatedResponse<FeedbackEntry>>;
  updateFeedback(
    id: string,
    updates: Partial<FeedbackEntry>
  ): Promise<FeedbackEntry>;
  deleteFeedback(id: string): Promise<boolean>;

  // Survey operations
  createSurvey(
    survey: Omit<SatisfactionSurvey, 'id' | 'timestamp'>
  ): Promise<SatisfactionSurvey>;
  getSurvey(id: string): Promise<SatisfactionSurvey | null>;
  listSurveys(
    filter?: Partial<FeedbackFilter>
  ): Promise<PaginatedResponse<SatisfactionSurvey>>;

  // Event operations
  trackEvent(event: Omit<FeedbackEvent, 'id' | 'timestamp'>): Promise<void>;
  getEvents(filter?: Partial<FeedbackFilter>): Promise<FeedbackEvent[]>;

  // Metrics
  getMetrics(): Promise<BetaMetrics>;
  getFeedbackTrends(days: number): Promise<FeedbackTrend[]>;

  // Utility
  health(): Promise<boolean>;
  migrate(): Promise<void>;
}

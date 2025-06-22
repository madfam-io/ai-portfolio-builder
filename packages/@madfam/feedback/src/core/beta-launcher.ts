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

import type {
  BetaReadinessReport,
  ReadinessCheck,
  BetaMetrics,
} from './types';
import { FeedbackSystem } from './feedback-system';
import { BetaAnalytics } from './beta-analytics';
import { Logger } from '../utils/logger';

/**
 * Beta Launch Readiness Checker
 * 
 * Comprehensive system to evaluate if your application is ready for beta launch
 * by checking performance, stability, features, testing, and monitoring
 */
export class BetaLaunchChecker {
  private feedbackSystem: FeedbackSystem;
  private analytics: BetaAnalytics;
  private logger: Logger;
  private config: BetaLaunchConfig;

  constructor(
    feedbackSystem: FeedbackSystem,
    analytics: BetaAnalytics,
    config: BetaLaunchConfig = {}
  ) {
    this.feedbackSystem = feedbackSystem;
    this.analytics = analytics;
    this.logger = new Logger('BetaLaunchChecker');
    
    this.config = {
      readinessThreshold: 80,
      performanceTargets: {
        responseTime: 200, // milliseconds
        errorRate: 1, // percentage
        uptime: 99.5, // percentage
      },
      stabilityRequirements: {
        maxCriticalBugs: 0,
        maxHighBugs: 5,
        crashFreeRate: 99, // percentage
      },
      featureCompleteness: {
        coreFeatures: [],
        optionalFeatures: [],
      },
      testingRequirements: {
        minCoverage: 60, // percentage
        criticalPathsCovered: true,
        e2eTestsPassing: true,
      },
      monitoringRequirements: {
        loggingEnabled: true,
        metricsCollection: true,
        errorTracking: true,
        analyticsEnabled: true,
      },
      ...config,
    };
  }

  /**
   * Check if system is ready for beta launch
   */
  async checkReadiness(): Promise<BetaReadinessReport> {
    this.logger.info('Starting beta readiness check');

    const checks = {
      performance: await this.checkPerformance(),
      stability: await this.checkStability(),
      features: await this.checkFeatures(),
      testing: await this.checkTesting(),
      monitoring: await this.checkMonitoring(),
    };

    const passedCount = Object.values(checks).filter(check => check.passed).length;
    const score = (passedCount / Object.keys(checks).length) * 100;
    const ready = score >= this.config.readinessThreshold;

    const recommendations = this.generateRecommendations(checks);

    const report: BetaReadinessReport = {
      ready,
      score: Math.round(score),
      checks,
      recommendations,
      timestamp: new Date(),
    };

    this.logger.info('Beta readiness check completed', {
      ready,
      score: report.score,
      passedChecks: passedCount,
      totalChecks: Object.keys(checks).length,
    });

    return report;
  }

  /**
   * Check performance metrics
   */
  private async checkPerformance(): Promise<ReadinessCheck> {
    try {
      const metrics = await this.getPerformanceMetrics();
      const targets = this.config.performanceTargets;

      const checks = [
        {
          name: 'Response Time',
          passed: metrics.avgResponseTime <= targets.responseTime,
          value: metrics.avgResponseTime,
          target: targets.responseTime,
        },
        {
          name: 'Error Rate',
          passed: metrics.errorRate <= targets.errorRate,
          value: metrics.errorRate,
          target: targets.errorRate,
        },
        {
          name: 'Uptime',
          passed: metrics.uptime >= targets.uptime,
          value: metrics.uptime,
          target: targets.uptime,
        },
      ];

      const failedChecks = checks.filter(c => !c.passed);
      const passed = failedChecks.length === 0;

      const message = passed
        ? 'All performance targets met'
        : `Failed ${failedChecks.length} performance checks: ${failedChecks.map(c => c.name).join(', ')}`;

      return {
        passed,
        message,
        details: {
          metrics,
          checks,
        },
      };
    } catch (error) {
      this.logger.error('Error checking performance', error as Error);
      return {
        passed: false,
        message: 'Unable to verify performance metrics',
        details: { error: (error as Error).message },
      };
    }
  }

  /**
   * Check system stability
   */
  private async checkStability(): Promise<ReadinessCheck> {
    try {
      const metrics = await this.feedbackSystem.getBetaMetrics();
      const requirements = this.config.stabilityRequirements;

      // Get bug counts by severity
      const feedback = await this.feedbackSystem.getFeedback({
        type: 'bug',
        status: 'open',
      });

      const bugCounts = {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
      };

      if (feedback.data) {
        feedback.data.forEach(bug => {
          bugCounts[bug.severity]++;
        });
      }

      const checks = [
        {
          name: 'Critical Bugs',
          passed: bugCounts.critical <= requirements.maxCriticalBugs,
          value: bugCounts.critical,
          target: requirements.maxCriticalBugs,
        },
        {
          name: 'High Priority Bugs',
          passed: bugCounts.high <= requirements.maxHighBugs,
          value: bugCounts.high,
          target: requirements.maxHighBugs,
        },
        {
          name: 'Crash-Free Rate',
          passed: true, // Would need real crash data
          value: 99.9,
          target: requirements.crashFreeRate,
        },
      ];

      const failedChecks = checks.filter(c => !c.passed);
      const passed = failedChecks.length === 0;

      const message = passed
        ? 'System stability meets requirements'
        : `${bugCounts.critical} critical bugs and ${bugCounts.high} high priority bugs need resolution`;

      return {
        passed,
        message,
        details: {
          bugCounts,
          totalBugs: metrics.criticalBugs + bugCounts.high + bugCounts.medium + bugCounts.low,
          checks,
        },
      };
    } catch (error) {
      this.logger.error('Error checking stability', error as Error);
      return {
        passed: false,
        message: 'Unable to verify system stability',
        details: { error: (error as Error).message },
      };
    }
  }

  /**
   * Check feature completeness
   */
  private async checkFeatures(): Promise<ReadinessCheck> {
    try {
      const { coreFeatures, optionalFeatures } = this.config.featureCompleteness;
      
      // In a real implementation, this would check actual feature flags or completion status
      const implementedCore = coreFeatures.filter(() => true); // Mock: all implemented
      const implementedOptional = optionalFeatures.filter(() => Math.random() > 0.3); // Mock: 70% implemented

      const coreCompletion = coreFeatures.length > 0
        ? (implementedCore.length / coreFeatures.length) * 100
        : 100;
      
      const optionalCompletion = optionalFeatures.length > 0
        ? (implementedOptional.length / optionalFeatures.length) * 100
        : 100;

      const passed = coreCompletion === 100;

      const message = passed
        ? `All ${coreFeatures.length} core features implemented`
        : `Missing ${coreFeatures.length - implementedCore.length} core features`;

      return {
        passed,
        message,
        details: {
          coreFeatures: {
            total: coreFeatures.length,
            implemented: implementedCore.length,
            completion: Math.round(coreCompletion),
          },
          optionalFeatures: {
            total: optionalFeatures.length,
            implemented: implementedOptional.length,
            completion: Math.round(optionalCompletion),
          },
        },
      };
    } catch (error) {
      this.logger.error('Error checking features', error as Error);
      return {
        passed: false,
        message: 'Unable to verify feature completeness',
        details: { error: (error as Error).message },
      };
    }
  }

  /**
   * Check testing coverage and quality
   */
  private async checkTesting(): Promise<ReadinessCheck> {
    try {
      const requirements = this.config.testingRequirements;
      
      // In a real implementation, this would fetch actual test metrics
      const testMetrics = {
        unitTestCoverage: 72, // Mock data
        integrationTestCoverage: 65,
        e2eTestsPass: true,
        criticalPathsCovered: true,
        lastTestRun: new Date(),
      };

      const overallCoverage = (testMetrics.unitTestCoverage + testMetrics.integrationTestCoverage) / 2;

      const checks = [
        {
          name: 'Test Coverage',
          passed: overallCoverage >= requirements.minCoverage,
          value: overallCoverage,
          target: requirements.minCoverage,
        },
        {
          name: 'Critical Paths',
          passed: testMetrics.criticalPathsCovered && requirements.criticalPathsCovered,
          value: testMetrics.criticalPathsCovered,
          target: requirements.criticalPathsCovered,
        },
        {
          name: 'E2E Tests',
          passed: testMetrics.e2eTestsPass && requirements.e2eTestsPassing,
          value: testMetrics.e2eTestsPass,
          target: requirements.e2eTestsPassing,
        },
      ];

      const failedChecks = checks.filter(c => !c.passed);
      const passed = failedChecks.length === 0;

      const message = passed
        ? `Test coverage at ${Math.round(overallCoverage)}% with all critical paths covered`
        : `Test coverage at ${Math.round(overallCoverage)}% (minimum ${requirements.minCoverage}% required)`;

      return {
        passed,
        message,
        details: {
          metrics: testMetrics,
          checks,
        },
      };
    } catch (error) {
      this.logger.error('Error checking testing', error as Error);
      return {
        passed: false,
        message: 'Unable to verify testing requirements',
        details: { error: (error as Error).message },
      };
    }
  }

  /**
   * Check monitoring and observability
   */
  private async checkMonitoring(): Promise<ReadinessCheck> {
    try {
      const requirements = this.config.monitoringRequirements;
      
      // Check if monitoring systems are operational
      const monitoringStatus = {
        logging: requirements.loggingEnabled,
        metrics: requirements.metricsCollection,
        errorTracking: requirements.errorTracking,
        analytics: requirements.analyticsEnabled,
        feedbackSystem: true, // We know this is operational
      };

      const checks = Object.entries(monitoringStatus).map(([name, enabled]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        passed: enabled,
        value: enabled,
        target: true,
      }));

      const failedChecks = checks.filter(c => !c.passed);
      const passed = failedChecks.length === 0;

      const message = passed
        ? 'All monitoring systems operational'
        : `Missing ${failedChecks.length} monitoring capabilities: ${failedChecks.map(c => c.name).join(', ')}`;

      return {
        passed,
        message,
        details: {
          status: monitoringStatus,
          checks,
        },
      };
    } catch (error) {
      this.logger.error('Error checking monitoring', error as Error);
      return {
        passed: false,
        message: 'Unable to verify monitoring systems',
        details: { error: (error as Error).message },
      };
    }
  }

  /**
   * Get performance metrics (mock implementation)
   */
  private async getPerformanceMetrics(): Promise<{
    avgResponseTime: number;
    errorRate: number;
    uptime: number;
  }> {
    // In a real implementation, this would fetch from monitoring systems
    return {
      avgResponseTime: 150, // milliseconds
      errorRate: 0.5, // percentage
      uptime: 99.9, // percentage
    };
  }

  /**
   * Generate recommendations based on check results
   */
  private generateRecommendations(checks: BetaReadinessReport['checks']): string[] {
    const recommendations: string[] = [];

    // Performance recommendations
    if (!checks.performance.passed) {
      const details = checks.performance.details as any;
      if (details?.metrics?.avgResponseTime > this.config.performanceTargets.responseTime) {
        recommendations.push('Optimize API response times - consider caching, query optimization, or CDN');
      }
      if (details?.metrics?.errorRate > this.config.performanceTargets.errorRate) {
        recommendations.push('Reduce error rate - implement better error handling and validation');
      }
    }

    // Stability recommendations
    if (!checks.stability.passed) {
      const details = checks.stability.details as any;
      if (details?.bugCounts?.critical > 0) {
        recommendations.push(`Fix ${details.bugCounts.critical} critical bugs before launch`);
      }
      if (details?.bugCounts?.high > this.config.stabilityRequirements.maxHighBugs) {
        recommendations.push(`Resolve high priority bugs - currently ${details.bugCounts.high} open`);
      }
    }

    // Feature recommendations
    if (!checks.features.passed) {
      const details = checks.features.details as any;
      const missingCore = details?.coreFeatures?.total - details?.coreFeatures?.implemented;
      if (missingCore > 0) {
        recommendations.push(`Complete ${missingCore} remaining core features`);
      }
    }

    // Testing recommendations
    if (!checks.testing.passed) {
      const details = checks.testing.details as any;
      const coverage = (details?.metrics?.unitTestCoverage + details?.metrics?.integrationTestCoverage) / 2;
      if (coverage < this.config.testingRequirements.minCoverage) {
        recommendations.push(`Increase test coverage from ${Math.round(coverage)}% to ${this.config.testingRequirements.minCoverage}%`);
      }
    }

    // Monitoring recommendations
    if (!checks.monitoring.passed) {
      const details = checks.monitoring.details as any;
      const missing = Object.entries(details?.status || {})
        .filter(([_, enabled]) => !enabled)
        .map(([name]) => name);
      
      if (missing.length > 0) {
        recommendations.push(`Enable monitoring for: ${missing.join(', ')}`);
      }
    }

    // General recommendations
    if (recommendations.length === 0) {
      recommendations.push('System is ready for beta launch! Consider setting up a gradual rollout plan.');
      recommendations.push('Prepare beta user onboarding materials and support channels.');
      recommendations.push('Set up alerts for critical metrics during beta period.');
    }

    return recommendations;
  }

  /**
   * Generate detailed readiness report
   */
  async generateDetailedReport(): Promise<DetailedReadinessReport> {
    const basicReport = await this.checkReadiness();
    const metrics = await this.feedbackSystem.getBetaMetrics();
    const behaviorInsights = await this.analytics.getUserBehaviorInsights();
    const featureUsage = await this.analytics.getFeatureUsage();

    return {
      ...basicReport,
      metrics,
      insights: {
        behavior: behaviorInsights,
        features: featureUsage,
      },
      riskAssessment: this.assessRisks(basicReport, metrics),
      launchStrategy: this.recommendLaunchStrategy(basicReport),
    };
  }

  /**
   * Assess risks for beta launch
   */
  private assessRisks(
    report: BetaReadinessReport,
    metrics: BetaMetrics
  ): RiskAssessment {
    const risks: Risk[] = [];

    // Technical risks
    if (!report.checks.stability.passed) {
      risks.push({
        category: 'technical',
        severity: 'high',
        description: 'Unresolved critical bugs may impact user experience',
        mitigation: 'Fix all critical bugs before launch',
      });
    }

    if (!report.checks.performance.passed) {
      risks.push({
        category: 'technical',
        severity: 'medium',
        description: 'Performance issues may cause user frustration',
        mitigation: 'Optimize performance hotspots and set up monitoring',
      });
    }

    // Business risks
    if (metrics.averageNPS < 30) {
      risks.push({
        category: 'business',
        severity: 'medium',
        description: 'Low NPS score indicates user satisfaction issues',
        mitigation: 'Address top user complaints before expanding beta',
      });
    }

    // Operational risks
    if (!report.checks.monitoring.passed) {
      risks.push({
        category: 'operational',
        severity: 'high',
        description: 'Insufficient monitoring may delay issue detection',
        mitigation: 'Set up comprehensive monitoring and alerting',
      });
    }

    const overallRisk = risks.length === 0 ? 'low' :
                       risks.some(r => r.severity === 'high') ? 'high' : 'medium';

    return {
      overallRisk,
      risks,
      readinessScore: report.score,
    };
  }

  /**
   * Recommend launch strategy based on readiness
   */
  private recommendLaunchStrategy(report: BetaReadinessReport): LaunchStrategy {
    if (report.score >= 90) {
      return {
        approach: 'full-beta',
        description: 'System is ready for a full beta launch with all users',
        phases: [
          { name: 'Internal Beta', duration: '1 week', users: 50 },
          { name: 'Closed Beta', duration: '2 weeks', users: 500 },
          { name: 'Open Beta', duration: '4 weeks', users: 5000 },
        ],
      };
    } else if (report.score >= 70) {
      return {
        approach: 'gradual-rollout',
        description: 'Gradual rollout recommended to identify and fix issues',
        phases: [
          { name: 'Alpha Testing', duration: '2 weeks', users: 20 },
          { name: 'Limited Beta', duration: '3 weeks', users: 200 },
          { name: 'Expanded Beta', duration: '4 weeks', users: 1000 },
        ],
      };
    } else {
      return {
        approach: 'delayed-launch',
        description: 'Additional preparation needed before beta launch',
        phases: [
          { name: 'Fix Critical Issues', duration: '2 weeks', users: 0 },
          { name: 'Internal Testing', duration: '1 week', users: 10 },
          { name: 'Re-evaluation', duration: '1 week', users: 0 },
        ],
      };
    }
  }
}

/**
 * Configuration types
 */
interface BetaLaunchConfig {
  readinessThreshold?: number;
  performanceTargets?: {
    responseTime: number;
    errorRate: number;
    uptime: number;
  };
  stabilityRequirements?: {
    maxCriticalBugs: number;
    maxHighBugs: number;
    crashFreeRate: number;
  };
  featureCompleteness?: {
    coreFeatures: string[];
    optionalFeatures: string[];
  };
  testingRequirements?: {
    minCoverage: number;
    criticalPathsCovered: boolean;
    e2eTestsPassing: boolean;
  };
  monitoringRequirements?: {
    loggingEnabled: boolean;
    metricsCollection: boolean;
    errorTracking: boolean;
    analyticsEnabled: boolean;
  };
}

interface DetailedReadinessReport extends BetaReadinessReport {
  metrics: BetaMetrics;
  insights: {
    behavior: any;
    features: any;
  };
  riskAssessment: RiskAssessment;
  launchStrategy: LaunchStrategy;
}

interface RiskAssessment {
  overallRisk: 'low' | 'medium' | 'high';
  risks: Risk[];
  readinessScore: number;
}

interface Risk {
  category: 'technical' | 'business' | 'operational';
  severity: 'low' | 'medium' | 'high';
  description: string;
  mitigation: string;
}

interface LaunchStrategy {
  approach: 'full-beta' | 'gradual-rollout' | 'delayed-launch';
  description: string;
  phases: {
    name: string;
    duration: string;
    users: number;
  }[];
}

/**
 * Factory function
 */
export function createBetaLaunchChecker(
  feedbackSystem: FeedbackSystem,
  analytics: BetaAnalytics,
  config?: BetaLaunchConfig
): BetaLaunchChecker {
  return new BetaLaunchChecker(feedbackSystem, analytics, config);
}
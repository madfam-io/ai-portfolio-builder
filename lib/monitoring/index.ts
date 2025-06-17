/**
 * Monitoring system entry point
 * Initializes all monitoring services
 */

export { 
  errorTracker, 
  withErrorTracking, 
  performanceMonitor,
  initializeMonitoring 
} from './error-tracking';

export { 
  apm, 
  withAPMTracking, 
  trackDatabaseOperation,
  trackAIOperation,
  trackExternalAPI,
  businessMetrics,
  useAPMTracking,
  getAPMDashboardData 
} from './apm';

export { 
  healthMonitor, 
  handleHealthCheck,
  handleReadinessCheck,
  handleLivenessCheck,
  initializeHealthMonitoring 
} from './health-check';

// Import the individual functions for internal use
import { initializeMonitoring } from './error-tracking';
import { initializeHealthMonitoring } from './health-check';

export type { 
  ErrorReport, 
  PerformanceMetric 
} from './error-tracking';

export type { 
  APMMetric, 
  TransactionTrace, 
  TransactionSpan 
} from './apm';

export type { 
  HealthCheck, 
  SystemHealth 
} from './health-check';

/**
 * Initialize all monitoring systems
 */
export function initializeAllMonitoring(): void {
  try {
    // Initialize error tracking and performance monitoring
    initializeMonitoring();
    console.log('✅ Error tracking and performance monitoring initialized');
    
    // Initialize health monitoring
    initializeHealthMonitoring();
    console.log('✅ Health monitoring initialized');
    
    // Start APM if in production
    if (process.env.NODE_ENV === 'production') {
      console.log('✅ APM enabled for production environment');
    }
    
    console.log('🚀 All monitoring systems initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize monitoring systems:', error);
  }
}
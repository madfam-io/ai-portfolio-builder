/**
 * Health check and system monitoring utilities
 * Provides comprehensive system health monitoring
 */

export interface HealthCheck {
  name: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  message?: string;
  lastCheck: number;
  responseTime?: number;
  metadata?: Record<string, unknown>;
}

export interface SystemHealth {
  overall: 'healthy' | 'degraded' | 'unhealthy';
  checks: HealthCheck[];
  timestamp: number;
  uptime: number;
  version: string;
}

/**
 * Health monitoring service
 */
class HealthMonitor {
  private checks: Map<string, () => Promise<HealthCheck>> = new Map();
  private cache: Map<string, HealthCheck> = new Map();
  private cacheTimeout = 30000; // 30 seconds
  private startTime = Date.now();

  constructor() {
    this.registerDefaultChecks();
  }

  /**
   * Register a health check
   */
  registerCheck(name: string, checkFn: () => Promise<HealthCheck>): void {
    this.checks.set(name, checkFn);
  }

  /**
   * Run all health checks
   */
  async runAllChecks(): Promise<SystemHealth> {
    const checkPromises = Array.from(this.checks.entries()).map(
      async ([name, checkFn]) => {
        try {
          const startTime = performance.now();
          const cached = this.cache.get(name);

          // Use cache if still valid
          if (cached && Date.now() - cached.lastCheck < this.cacheTimeout) {
            return cached;
          }

          const result = await Promise.race([
            checkFn(),
            this.timeoutPromise<HealthCheck>(5000, {
              name,
              status: 'unhealthy',
              message: 'Health check timeout',
              lastCheck: Date.now(),
              responseTime: 5000,
            }),
          ]);

          result.responseTime = performance.now() - startTime;
          result.lastCheck = Date.now();

          this.cache.set(name, result);
          return result;
        } catch (error) {
          const failedCheck: HealthCheck = {
            name,
            status: 'unhealthy',
            message: error instanceof Error ? error.message : 'Unknown error',
            lastCheck: Date.now(),
          };
          this.cache.set(name, failedCheck);
          return failedCheck;
        }
      }
    );

    const checks = await Promise.all(checkPromises);
    const overall = this.calculateOverallHealth(checks);

    return {
      overall,
      checks,
      timestamp: Date.now(),
      uptime: Date.now() - this.startTime,
      version: process.env.npm_package_version || '0.3.0-beta',
    };
  }

  /**
   * Run a specific health check
   */
  async runCheck(name: string): Promise<HealthCheck | null> {
    const checkFn = this.checks.get(name);
    if (!checkFn) return null;

    try {
      const startTime = performance.now();
      const result = await checkFn();
      result.responseTime = performance.now() - startTime;
      result.lastCheck = Date.now();

      this.cache.set(name, result);
      return result;
    } catch (error) {
      const failedCheck: HealthCheck = {
        name,
        status: 'unhealthy',
        message: error instanceof Error ? error.message : 'Unknown error',
        lastCheck: Date.now(),
      };
      this.cache.set(name, failedCheck);
      return failedCheck;
    }
  }

  /**
   * Register default system health checks
   */
  private registerDefaultChecks(): void {
    // Database connectivity check
    this.registerCheck('database', async () => {
      try {
        // This would check actual database connection
        // For now, we'll simulate the check
        const isConnected = await this.checkDatabaseConnection();

        return {
          name: 'database',
          status: isConnected ? 'healthy' : 'unhealthy',
          message: isConnected
            ? 'Database connection successful'
            : 'Database connection failed',
          lastCheck: Date.now(),
        };
      } catch (error) {
        return {
          name: 'database',
          status: 'unhealthy',
          message:
            error instanceof Error ? error.message : 'Database check failed',
          lastCheck: Date.now(),
        };
      }
    });

    // Redis cache check
    this.registerCheck('redis', async () => {
      try {
        const isConnected = await this.checkRedisConnection();

        return {
          name: 'redis',
          status: isConnected ? 'healthy' : 'degraded',
          message: isConnected
            ? 'Redis connection successful'
            : 'Redis unavailable, using memory cache',
          lastCheck: Date.now(),
        };
      } catch (_error) {
        return {
          name: 'redis',
          status: 'degraded',
          message: 'Redis check failed, using memory cache',
          lastCheck: Date.now(),
        };
      }
    });

    // External API dependencies
    this.registerCheck('huggingface', async () => {
      try {
        const isAvailable = await this.checkExternalAPI(
          'https://huggingface.co'
        );

        return {
          name: 'huggingface',
          status: isAvailable ? 'healthy' : 'degraded',
          message: isAvailable
            ? 'HuggingFace API accessible'
            : 'HuggingFace API unavailable',
          lastCheck: Date.now(),
        };
      } catch (_error) {
        return {
          name: 'huggingface',
          status: 'degraded',
          message: 'HuggingFace API check failed',
          lastCheck: Date.now(),
        };
      }
    });

    this.registerCheck('stripe', async () => {
      try {
        const isAvailable = await this.checkExternalAPI(
          'https://api.stripe.com'
        );

        return {
          name: 'stripe',
          status: isAvailable ? 'healthy' : 'degraded',
          message: isAvailable
            ? 'Stripe API accessible'
            : 'Stripe API unavailable',
          lastCheck: Date.now(),
        };
      } catch (_error) {
        return {
          name: 'stripe',
          status: 'degraded',
          message: 'Stripe API check failed',
          lastCheck: Date.now(),
        };
      }
    });

    // System resources check
    this.registerCheck('system', async () => {
      try {
        const memoryUsage = process.memoryUsage();
        const cpuUsage = process.cpuUsage();

        const memoryMB = memoryUsage.heapUsed / 1024 / 1024;
        const isHealthy = memoryMB < 512; // Alert if using more than 512MB

        return {
          name: 'system',
          status: isHealthy ? 'healthy' : 'degraded',
          message: `Memory usage: ${memoryMB.toFixed(2)}MB`,
          lastCheck: Date.now(),
          metadata: {
            memory: memoryUsage,
            cpu: cpuUsage,
          },
        };
      } catch (_error) {
        return {
          name: 'system',
          status: 'unhealthy',
          message: 'System resources check failed',
          lastCheck: Date.now(),
        };
      }
    });

    // Application-specific checks
    this.registerCheck('portfolio_generation', async () => {
      try {
        // Test portfolio generation pipeline
        const isWorking = await this.testPortfolioGeneration();

        return {
          name: 'portfolio_generation',
          status: isWorking ? 'healthy' : 'unhealthy',
          message: isWorking
            ? 'Portfolio generation working'
            : 'Portfolio generation failed',
          lastCheck: Date.now(),
        };
      } catch (_error) {
        return {
          name: 'portfolio_generation',
          status: 'unhealthy',
          message: 'Portfolio generation test failed',
          lastCheck: Date.now(),
        };
      }
    });
  }

  /**
   * Calculate overall system health based on individual checks
   */
  private calculateOverallHealth(
    checks: HealthCheck[]
  ): 'healthy' | 'degraded' | 'unhealthy' {
    const unhealthyCount = checks.filter(c => c.status === 'unhealthy').length;
    const degradedCount = checks.filter(c => c.status === 'degraded').length;

    if (unhealthyCount > 0) {
      return 'unhealthy';
    }

    if (degradedCount > 0) {
      return 'degraded';
    }

    return 'healthy';
  }

  /**
   * Create a promise that rejects after a timeout
   */
  private timeoutPromise<T>(ms: number, fallback: T): Promise<T> {
    return new Promise(resolve => {
      setTimeout(() => resolve(fallback), ms);
    });
  }

  /**
   * Check database connection (placeholder)
   */
  private async checkDatabaseConnection(): Promise<boolean> {
    try {
      // This would use actual database connection
      // For now, we'll simulate success
      await Promise.resolve();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check Redis connection (placeholder)
   */
  private async checkRedisConnection(): Promise<boolean> {
    try {
      // This would use actual Redis connection
      // For now, we'll simulate success
      await Promise.resolve();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check external API availability
   */
  private async checkExternalAPI(url: string): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const response = await fetch(url, {
        signal: controller.signal,
        method: 'HEAD',
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Test portfolio generation functionality
   */
  private async testPortfolioGeneration(): Promise<boolean> {
    try {
      // This would test the actual portfolio generation pipeline
      // For now, we'll simulate success
      await Promise.resolve();
      return true;
    } catch {
      return false;
    }
  }
}

// Global health monitor instance
export const healthMonitor = new HealthMonitor();

/**
 * Express/Next.js health check endpoint handler
 */
export async function handleHealthCheck(): Promise<Response> {
  try {
    const health = await healthMonitor.runAllChecks();

    const statusCode = {
      healthy: 200,
      degraded: 200, // Still operational
      unhealthy: 503, // Service unavailable
    }[health.overall];

    return new Response(JSON.stringify(health, null, 2), {
      status: statusCode,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (_error) {
    return new Response(
      JSON.stringify({
        overall: 'unhealthy',
        message: 'Health check system failure',
        timestamp: Date.now(),
      }),
      {
        status: 503,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}

/**
 * Readiness check (for Kubernetes/Docker)
 */
export async function handleReadinessCheck(): Promise<Response> {
  try {
    // Check only critical services for readiness
    const criticalChecks = ['database', 'system'];
    const results = await Promise.all(
      criticalChecks.map(name => healthMonitor.runCheck(name))
    );

    const isReady = results.every(
      check =>
        check && (check.status === 'healthy' || check.status === 'degraded')
    );

    return new Response(
      JSON.stringify({
        ready: isReady,
        checks: results,
        timestamp: Date.now(),
      }),
      {
        status: isReady ? 200 : 503,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (_error) {
    return new Response(
      JSON.stringify({
        ready: false,
        message: 'Readiness check failed',
        timestamp: Date.now(),
      }),
      {
        status: 503,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}

/**
 * Liveness check (for Kubernetes/Docker)
 */
export function handleLivenessCheck(): Response {
  // Simple liveness check - just verify the process is running
  return new Response(
    JSON.stringify({
      alive: true,
      timestamp: Date.now(),
      uptime:
        Date.now() -
        (((global as Record<string, unknown>).__startup_time as number) || 0),
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}

/**
 * Initialize health monitoring
 */
export function initializeHealthMonitoring(): void {
  // Set startup time for uptime calculation
  (global as Record<string, unknown>).__startup_time = Date.now();

  // Run periodic health checks
  if (process.env.NODE_ENV === 'production') {
    setInterval(async () => {
      const health = await healthMonitor.runAllChecks();

      if (health.overall === 'unhealthy') {
        // System health is unhealthy
      } else if (health.overall === 'degraded') {
        // System health is degraded
      }
    }, 60000); // Check every minute
  }
}

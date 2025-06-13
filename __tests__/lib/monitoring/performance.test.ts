import { performanceMonitor } from '@/lib/monitoring/performance';

// Mock timers
jest.useFakeTimers();

describe('Performance Monitor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  describe('Timer functionality', () => {
    it('should start and end a timer', () => {
      const timer = performanceMonitor.startTimer('test-operation');
      expect(timer).toBeDefined();
      expect(timer.end).toBeDefined();

      const duration = timer.end();
      expect(typeof duration).toBe('number');
    });

    it('should record metrics', () => {
      performanceMonitor.recordMetric('api-call', 100);
      const metrics = performanceMonitor.getMetrics();
      expect(metrics).toBeDefined();
    });
  });
});

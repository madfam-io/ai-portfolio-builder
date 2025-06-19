import { jest, describe, test, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { SpanStatusCode } from '@opentelemetry/api';

// Mock OpenTelemetry
jest.mock('@opentelemetry/api', () => ({
  trace: {
    getTracer: jest.fn(() => ({
      startSpan: jest.fn(() => ({
        end: jest.fn(),
        setAttribute: jest.fn(),
        setStatus: jest.fn(),
      })),
    })),
  },
  SpanStatusCode: {
    OK: 0,
    ERROR: 1,
  },
}));

/**
 * SigNoz Integration Tests
 */

import {   tracer,
  createSpan,
  getCurrentTraceId,
  withTracing,
  isOtelEnabled,
 } from '@/lib/monitoring/signoz';
import {   traceHttpRequest,
  traceDatabaseOperation,
  traceAIOperation,
 } from '@/lib/monitoring/signoz/tracing';
import {   recordBusinessMetric,
  recordPerformanceMetric,
  measureDuration,
 } from '@/lib/monitoring/signoz/metrics';

// Mock environment
const originalEnv = process.env;

beforeAll(() => {
  process.env = {
    ...originalEnv,
    OTEL_TRACE_ENABLED: 'true',
    NODE_ENV: 'test',
  };
});

afterAll(() => {
  process.env = originalEnv;
});

describe('SigNoz Integration', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  describe('Span Creation', () => {
    it('should create a span with attributes', async () => {
      const span = createSpan('test.operation', {
        attributes: {
          'test.attribute': 'value',
          'test.number': 123,
        },
      });

      expect(span).toBeDefined();
      if (span) {
        expect(span.spanContext).toBeDefined();
        expect(span.spanContext().traceId).toBeTruthy();
        span.end();
      }
    });

    it('should handle span creation when disabled', async () => {
      process.env.OTEL_TRACE_ENABLED = 'false';

      const span = createSpan('test.operation');
      expect(span).toBeUndefined();

      process.env.OTEL_TRACE_ENABLED = 'true';
    });
  });

  describe('Tracing Utilities', () => {
    it('should trace HTTP requests', async () => {
      const mockFetch = jest.fn().mockResolvedValue({ data: 'success' });

      const result = await traceHttpRequest(
        'GET',
        'https://api.example.com/data',
        mockFetch

      expect(result).toEqual({ data: 'success' });
      expect(mockFetch).toHaveBeenCalled();
    });

    it('should trace database operations', async () => {
      const mockQuery = jest.fn().mockResolvedValue({ rowCount: 5 });

      const result = await traceDatabaseOperation(
        'SELECT',
        'SELECT * FROM users',
        mockQuery

      expect(result).toEqual({ rowCount: 5 });
      expect(mockQuery).toHaveBeenCalled();
    });

    it('should trace AI operations', async () => {
      const mockAI = jest.fn().mockResolvedValue({
        text: 'Enhanced bio',
        usage: { total_tokens: 150 },
      });

      const result = await traceAIOperation('llama-3.1', 'enhance_bio', mockAI);

      expect(result.text).toBe('Enhanced bio');
      expect(mockAI).toHaveBeenCalled();
    });

    it('should handle errors in traced operations', async () => {
      const error = new Error('Operation failed');
      const mockFn = jest.fn().mockRejectedValue(error);

      await expect(
        traceHttpRequest('GET', 'https://api.example.com', mockFn)
      ).rejects.toThrow('Operation failed');
    });
  });

  describe('Metrics Recording', () => {
    it('should record business metrics', async () => {
      expect(() => {
        recordBusinessMetric('userSignups', 1, {
          source: 'landing_page',
        });
      }).not.toThrow();
    });

    it('should record performance metrics', async () => {
      expect(() => {
        recordPerformanceMetric('apiResponseTime', 150, {
          endpoint: '/api/v1/portfolios',
          method: 'GET',
        });
      }).not.toThrow();
    });

    it('should measure operation duration', async () => {
      const mockOperation = jest.fn(async () => {
        await new Promise(resolve => setTimeout(resolve, 50));
        return 'result';
      });

      const result = await measureDuration('apiResponseTime', mockOperation, {
        operation: 'test',
      });

      expect(result).toBe('result');
      expect(mockOperation).toHaveBeenCalled();
    });

    it('should record error metrics on failure', async () => {
      const error = new Error('Operation failed');
      const mockOperation = jest.fn().mockRejectedValue(error);

      await expect(
        measureDuration('apiResponseTime', mockOperation)
      ).rejects.toThrow('Operation failed');
    });
  });

  describe('Function Wrapping', () => {
    it('should wrap functions with tracing', async () => {
      const originalFn = jest.fn(async (a: number, b: number) => a + b);
      const tracedFn = withTracing(originalFn, 'math.add');

      const result = await tracedFn(2, 3);

      expect(result).toBe(5);
      expect(originalFn).toHaveBeenCalledWith(2, 3);
    });

    it('should handle errors in wrapped functions', async () => {
      const error = new Error('Calculation failed');
      const originalFn = jest.fn().mockRejectedValue(error);
      const tracedFn = withTracing(originalFn, 'math.divide');

      await expect(tracedFn(10, 0)).rejects.toThrow('Calculation failed');
    });
  });

  describe('Trace Context', () => {
    it('should get current trace ID', async () => {
      await withTracing(async () => {
        const traceId = getCurrentTraceId();
        expect(traceId).toBeTruthy();
        expect(typeof traceId).toBe('string');
      }, 'test.trace_id')();
    });

    it('should return undefined trace ID when no active span', async () => {
      const traceId = getCurrentTraceId();
      expect(traceId).toBeUndefined();
    });
  });

  describe('OpenTelemetry Status', () => {
    it('should correctly report enabled status', async () => {
      process.env.OTEL_TRACE_ENABLED = 'true';
      expect(isOtelEnabled()).toBe(true);
    });

    it('should correctly report disabled status', async () => {
      process.env.OTEL_TRACE_ENABLED = 'false';
      expect(isOtelEnabled()).toBe(false);

      process.env.OTEL_TRACE_ENABLED = 'true';
    });
  });
});

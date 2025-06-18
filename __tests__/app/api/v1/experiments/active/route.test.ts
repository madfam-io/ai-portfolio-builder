import { describe, test, it, expect, beforeEach, jest } from '@jest/globals';
import { NextRequest } from 'next/server';
import { headers } from 'next/headers';
import { GET } from '@/app/api/v1/experiments/active/route';
import { FeatureFlagService } from '@/lib/services/feature-flags/feature-flag-service';
import { logger } from '@/lib/utils/logger';


// Mock dependencies
jest.mock('next/headers');
jest.mock('@/lib/services/feature-flags/feature-flag-service');
jest.mock('@/lib/utils/logger');

describe('GET /api/v1/experiments/active', () => {
  let mockHeaders: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock headers
    mockHeaders = new Map([
      ['user-agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'],
      ['referer', 'https://google.com'],
      ['accept-language', 'en-US,en;q=0.9'],
    ]);

    (headers as jest.Mock).mockResolvedValue({
      get: (key: string) => mockHeaders.get(key),
    });

    // Mock logger
    (logger.error as jest.Mock).mockImplementation(() => {});
  });

  it('should return active experiment for desktop user', async () => {
    const mockExperiment = {
      id: 'exp-123',
      name: 'Homepage Test',
      variant: {
        id: 'var-456',
        name: 'Variant A',
        components: [],
      },
    };

    (FeatureFlagService.getActiveExperiment as jest.Mock).mockResolvedValue(
      mockExperiment

    const _request = new NextRequest(
      'http://localhost:3000/api/v1/experiments/active'

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(mockExperiment);
    expect(FeatureFlagService.getActiveExperiment).toHaveBeenCalledWith({
      country: undefined,
      device: 'desktop',
      language: 'en',
      referrer: 'https://google.com',
      utmSource: undefined,
    });
  });

  it('should detect mobile device from user agent', async () => {
    mockHeaders.set(
      'user-agent',
      'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)'

    (FeatureFlagService.getActiveExperiment as jest.Mock).mockResolvedValue(
      null

    const _request = new NextRequest(
      'http://localhost:3000/api/v1/experiments/active'

    await GET(request);

    expect(FeatureFlagService.getActiveExperiment).toHaveBeenCalledWith(
      expect.objectContaining({
        device: 'mobile',
      })
  });

  it('should detect tablet device from user agent', async () => {
    mockHeaders.set(
      'user-agent',
      'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X)'

    (FeatureFlagService.getActiveExperiment as jest.Mock).mockResolvedValue(
      null

    const _request = new NextRequest(
      'http://localhost:3000/api/v1/experiments/active'

    await GET(request);

    expect(FeatureFlagService.getActiveExperiment).toHaveBeenCalledWith(
      expect.objectContaining({
        device: 'tablet',
      })
  });

  it('should extract country from Vercel headers', async () => {
    mockHeaders.set('x-vercel-ip-country', 'US');

    (FeatureFlagService.getActiveExperiment as jest.Mock).mockResolvedValue(
      null

    const _request = new NextRequest(
      'http://localhost:3000/api/v1/experiments/active'

    await GET(request);

    expect(FeatureFlagService.getActiveExperiment).toHaveBeenCalledWith(
      expect.objectContaining({
        country: 'US',
      })
  });

  it('should extract country from Cloudflare headers', async () => {
    mockHeaders.set('cf-ipcountry', 'CA');

    (FeatureFlagService.getActiveExperiment as jest.Mock).mockResolvedValue(
      null

    const _request = new NextRequest(
      'http://localhost:3000/api/v1/experiments/active'

    await GET(request);

    expect(FeatureFlagService.getActiveExperiment).toHaveBeenCalledWith(
      expect.objectContaining({
        country: 'CA',
      })
  });

  it('should extract UTM parameters from URL', async () => {
    (FeatureFlagService.getActiveExperiment as jest.Mock).mockResolvedValue(
      null

    const _request = new NextRequest(
      'http://localhost:3000/api/v1/experiments/active?utm_source=facebook'

    await GET(request);

    expect(FeatureFlagService.getActiveExperiment).toHaveBeenCalledWith(
      expect.objectContaining({
        utmSource: 'facebook',
      })
  });

  it('should extract language from accept-language header', async () => {
    mockHeaders.set('accept-language', 'es-MX,es;q=0.9,en;q=0.8');

    (FeatureFlagService.getActiveExperiment as jest.Mock).mockResolvedValue(
      null

    const _request = new NextRequest(
      'http://localhost:3000/api/v1/experiments/active'

    await GET(request);

    expect(FeatureFlagService.getActiveExperiment).toHaveBeenCalledWith(
      expect.objectContaining({
        language: 'es',
      })
  });

  it('should default to Spanish when no language preference', async () => {
    mockHeaders.delete('accept-language');

    (FeatureFlagService.getActiveExperiment as jest.Mock).mockResolvedValue(
      null

    const _request = new NextRequest(
      'http://localhost:3000/api/v1/experiments/active'

    await GET(request);

    expect(FeatureFlagService.getActiveExperiment).toHaveBeenCalledWith(
      expect.objectContaining({
        language: 'es',
      })
  });

  it('should return null when no active experiment', async () => {
    (FeatureFlagService.getActiveExperiment as jest.Mock).mockResolvedValue(
      null

    const _request = new NextRequest(
      'http://localhost:3000/api/v1/experiments/active'

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toBeNull();
  });

  it('should handle missing headers gracefully', async () => {
    mockHeaders.clear();

    (FeatureFlagService.getActiveExperiment as jest.Mock).mockResolvedValue(
      null

    const _request = new NextRequest(
      'http://localhost:3000/api/v1/experiments/active'

    const response = await GET(request);

    expect(response.status).toBe(200);
    expect(FeatureFlagService.getActiveExperiment).toHaveBeenCalledWith({
      country: undefined,
      device: 'desktop',
      language: 'es',
      referrer: '',
      utmSource: undefined,
    });
  });

  it('should handle service errors', async () => {
    const error = new Error('Service unavailable');
    (FeatureFlagService.getActiveExperiment as jest.Mock).mockRejectedValue(
      error

    const _request = new NextRequest(
      'http://localhost:3000/api/v1/experiments/active'

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to get active experiment');
    expect(logger.error).toHaveBeenCalledWith(
      'Failed to get active experiment',
      error

  });

  it('should handle complex user agents', async () => {
    // Android Chrome
    mockHeaders.set(
      'user-agent',
      'Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36'

    (FeatureFlagService.getActiveExperiment as jest.Mock).mockResolvedValue(
      null

    const _request = new NextRequest(
      'http://localhost:3000/api/v1/experiments/active'

    await GET(request);

    expect(FeatureFlagService.getActiveExperiment).toHaveBeenCalledWith(
      expect.objectContaining({
        device: 'mobile',
      })
  });
});

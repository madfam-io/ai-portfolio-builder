/**
 * @fileoverview Tests for useRealTimePreview Hook
 *
 * Tests the real-time preview functionality including portfolio state management,
 * preview updates, device mode switching, and performance optimizations.
 */

import { renderHook, act } from '@testing-library/react';
import { useRealTimePreview } from '@/hooks/useRealTimePreview';
import { Portfolio } from '@/types/portfolio';

describe('useRealTimePreview', () => {
  const mockPortfolio: Portfolio = {
    id: 'test-portfolio-123',
    userId: 'test-user-456',
    name: 'John Doe',
    title: 'Software Developer',
    bio: 'Passionate developer with 5 years experience',
    template: 'developer',
    status: 'draft',
    contact: {
      email: 'john@example.com',
      phone: '+1 (555) 123-4567',
      location: 'San Francisco, CA',
    },
    social: {
      linkedin: 'https://linkedin.com/in/johndoe',
      github: 'https://github.com/johndoe',
      twitter: 'https://twitter.com/johndoe',
    },
    experience: [],
    education: [],
    projects: [],
    skills: [],
    certifications: [],
    customization: {
      primaryColor: '#3B82F6',
      secondaryColor: '#1E40AF',
      backgroundColor: '#FFFFFF',
      textColor: '#1F2937',
      fontFamily: 'system-ui',
      darkMode: false,
    },
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-02'),
  };

  it('initializes with default values', () => {
    const { result } = renderHook(() =>
      useRealTimePreview({ portfolio: mockPortfolio })
    );

    expect(result.current.previewConfig.mode).toBe('desktop');
    expect(result.current.previewConfig.state).toBe('editing');
    expect(result.current.previewDimensions.width).toBe('100%');
    expect(result.current.previewDimensions.height).toBe('100%');
  });

  it('changes preview mode', () => {
    const { result } = renderHook(() =>
      useRealTimePreview({ portfolio: mockPortfolio })
    );

    act(() => {
      result.current.setPreviewMode('mobile');
    });

    expect(result.current.previewConfig.mode).toBe('mobile');
    expect(result.current.previewDimensions.width).toBe('375px');
  });

  it('toggles fullscreen mode', () => {
    const { result } = renderHook(() =>
      useRealTimePreview({ portfolio: mockPortfolio })
    );

    act(() => {
      result.current.toggleFullscreen();
    });

    expect(result.current.previewConfig.state).toBe('fullscreen');

    act(() => {
      result.current.toggleFullscreen();
    });

    expect(result.current.previewConfig.state).toBe('preview');
  });

  it('sets zoom level', () => {
    const { result } = renderHook(() =>
      useRealTimePreview({ portfolio: mockPortfolio })
    );

    act(() => {
      result.current.setZoomLevel(1.5);
    });

    expect(result.current.previewConfig.zoomLevel).toBe(1.5);
    expect(result.current.previewDimensions.scale).toBe(1.5);
  });

  it('clamps zoom level within bounds', () => {
    const { result } = renderHook(() =>
      useRealTimePreview({ portfolio: mockPortfolio })
    );

    // Test upper bound
    act(() => {
      result.current.setZoomLevel(3);
    });

    expect(result.current.previewConfig.zoomLevel).toBe(2);

    // Test lower bound
    act(() => {
      result.current.setZoomLevel(0.1);
    });

    expect(result.current.previewConfig.zoomLevel).toBe(0.25);
  });

  it('provides responsive breakpoints', () => {
    const { result } = renderHook(() =>
      useRealTimePreview({ portfolio: mockPortfolio })
    );

    const breakpoints = result.current.getResponsiveBreakpoints();

    expect(breakpoints).toHaveLength(8);
    expect(breakpoints[0]).toEqual({
      name: 'Desktop Large',
      width: 1920,
      height: 1080,
    });
  });

  it('captures preview screenshot', async () => {
    const { result } = renderHook(() =>
      useRealTimePreview({ portfolio: mockPortfolio })
    );

    const screenshot = await result.current.capturePreviewScreenshot();

    // Returns placeholder for now
    expect(screenshot).toBe(
      'data:image/png;base64,placeholder-screenshot-data'
    );
  });

  it('exports preview HTML', () => {
    const { result } = renderHook(() =>
      useRealTimePreview({ portfolio: mockPortfolio })
    );

    const html = result.current.exportPreviewHTML();

    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('John Doe - Portfolio');
  });

  it('gets preview URL for published portfolio', () => {
    const publishedPortfolio = {
      ...mockPortfolio,
      status: 'published' as const,
      subdomain: 'john-doe',
    };

    const { result } = renderHook(() =>
      useRealTimePreview({ portfolio: publishedPortfolio })
    );

    const url = result.current.getPreviewUrl();

    expect(url).toBe('https://john-doe.prisma.madfam.io');
  });

  it('returns null for unpublished portfolio URL', () => {
    const { result } = renderHook(() =>
      useRealTimePreview({ portfolio: mockPortfolio })
    );

    const url = result.current.getPreviewUrl();

    expect(url).toBeNull();
  });
});

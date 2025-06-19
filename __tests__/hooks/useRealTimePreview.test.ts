import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import type { Portfolio } from '@/types/portfolio';
import { useRealTimePreview } from '@/hooks/useRealTimePreview';

/**
 * @jest-environment jsdom
 */

// Ensure React is available globally for hooks
global.React = React;


describe('useRealTimePreview', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  const mockPortfolio: Portfolio = {
    id: 'portfolio-123',
    userId: 'user-123',
    name: 'Test Portfolio',
    title: 'Developer',
    bio: 'Test bio',
    tagline: 'Test tagline',
    avatarUrl: 'https://example.com/avatar.jpg',
    contact: {
      email: 'test@example.com',
      phone: '123-456-7890',
      location: 'New York',
    },
    social: {
      github: 'https://github.com/test',
      linkedin: 'https://linkedin.com/in/test',
    },
    experience: [],
    education: [],
    projects: [],
    skills: [],
    certifications: [],
    template: 'developer',
    customization: {},
    aiSettings: {},
    status: 'draft',
    subdomain: 'test',
    views: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    // Mock DOM elements
    document.body.innerHTML = `
      <div data-preview-container>
        <div data-section="experience">Experience Section</div>
        <div data-section="projects">Projects Section</div>
      </div>
    `;
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('should import hook correctly', async () => {
    expect(typeof useRealTimePreview).toBe('function');
  });

  it('should initialize with default preview config', async () => {
    const { result } = renderHook(() =>
      useRealTimePreview({ portfolio: mockPortfolio })
    );

    expect(result.current).toBeDefined();
    expect(result.current.previewConfig).toEqual({
      mode: 'desktop',
      state: 'editing',
      activeSection: null,
      highlightedSection: null,
      showSectionBorders: false,
      showInteractiveElements: true,
      zoomLevel: 1,
    });

    expect(result.current.previewDimensions).toEqual({
      width: '100%',
      height: '100%',
      scale: 1,
    });
  });

  it('should change preview mode', async () => {
    const { result } = renderHook(() =>
      useRealTimePreview({ portfolio: mockPortfolio })
    );

    act(() => {
      result.current.setPreviewMode('tablet');
    });

    expect(result.current.previewConfig.mode).toBe('tablet');
    expect(result.current.previewDimensions).toEqual({
      width: '768px',
      height: '1024px',
      scale: 0.8,
    });

    act(() => {
      result.current.setPreviewMode('mobile');
    });

    expect(result.current.previewConfig.mode).toBe('mobile');
    expect(result.current.previewDimensions).toEqual({
      width: '375px',
      height: '667px',
      scale: 0.9,
    });
  });

  it('should change preview state', async () => {
    const { result } = renderHook(() =>
      useRealTimePreview({ portfolio: mockPortfolio })
    );

    act(() => {
      result.current.setPreviewState('preview');
    });

    expect(result.current.previewConfig.state).toBe('preview');

    act(() => {
      result.current.setPreviewState('fullscreen');
    });

    expect(result.current.previewConfig.state).toBe('fullscreen');
  });

  it('should toggle fullscreen', async () => {
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

  it('should set active section', async () => {
    const { result } = renderHook(() =>
      useRealTimePreview({ portfolio: mockPortfolio })
    );

    act(() => {
      result.current.setActiveSection('experience');
    });

    expect(result.current.previewConfig.activeSection).toBe('experience');

    act(() => {
      result.current.setActiveSection(null);
    });

    expect(result.current.previewConfig.activeSection).toBeNull();
  });

  it('should highlight section', async () => {
    const { result } = renderHook(() =>
      useRealTimePreview({ portfolio: mockPortfolio })
    );

    act(() => {
      result.current.highlightSection('projects');
    });

    expect(result.current.previewConfig.highlightedSection).toBe('projects');
  });

  it('should scroll to section', async () => {
    const scrollIntoViewMock = jest.fn().mockReturnValue(void 0);
    const mockElement = document.querySelector('[data-section="experience"]');
    if (mockElement) {
      mockElement.scrollIntoView = scrollIntoViewMock;
    }

    const { result } = renderHook(() =>
      useRealTimePreview({ portfolio: mockPortfolio })
    );

    act(() => {
      result.current.scrollToSection('experience');
    });

    expect(scrollIntoViewMock).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'start',
      inline: 'nearest',
    });
    
    expect(result.current.previewConfig.activeSection).toBe('experience');
  });

  it('should handle scrolling to non-existent section', async () => {
    const { result } = renderHook(() =>
      useRealTimePreview({ portfolio: mockPortfolio })
    );

    act(() => {
      result.current.scrollToSection('non-existent' as any);
    });

    // Should still set active section even if element doesn't exist
    expect(result.current.previewConfig.activeSection).toBe('non-existent');
  });

  it('should set zoom level with clamping', async () => {
    const { result } = renderHook(() =>
      useRealTimePreview({ portfolio: mockPortfolio })
    );

    act(() => {
      result.current.setZoomLevel(1.5);
    });

    expect(result.current.previewConfig.zoomLevel).toBe(1.5);
    expect(result.current.previewDimensions.scale).toBe(1.5);

    // Test clamping to max
    act(() => {
      result.current.setZoomLevel(5);
    });

    expect(result.current.previewConfig.zoomLevel).toBe(2);

    // Test clamping to min
    act(() => {
      result.current.setZoomLevel(0.1);
    });

    expect(result.current.previewConfig.zoomLevel).toBe(0.25);
  });

  it('should toggle section borders', async () => {
    const { result } = renderHook(() =>
      useRealTimePreview({ portfolio: mockPortfolio })
    );

    expect(result.current.previewConfig.showSectionBorders).toBe(false);

    act(() => {
      result.current.toggleSectionBorders();
    });

    expect(result.current.previewConfig.showSectionBorders).toBe(true);

    act(() => {
      result.current.toggleSectionBorders();
    });

    expect(result.current.previewConfig.showSectionBorders).toBe(false);
  });

  it('should toggle interactive elements', async () => {
    const { result } = renderHook(() =>
      useRealTimePreview({ portfolio: mockPortfolio })
    );

    expect(result.current.previewConfig.showInteractiveElements).toBe(true);

    act(() => {
      result.current.toggleInteractiveElements();
    });

    expect(result.current.previewConfig.showInteractiveElements).toBe(false);
  });

  it('should get responsive breakpoints', async () => {
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
    expect(breakpoints[6]).toEqual({
      name: 'Mobile',
      width: 375,
      height: 667,
    });
  });

  it('should test responsive breakpoint', async () => {
    const { result } = renderHook(() =>
      useRealTimePreview({ portfolio: mockPortfolio })
    );

    act(() => {
      result.current.testResponsiveBreakpoint(1024, 768);
    });

    expect(result.current.previewConfig.mode).toBe('desktop');
    expect(result.current.previewDimensions).toEqual({
      width: '1024px',
      height: '768px',
      scale: 1,
    });
  });

  it('should capture preview screenshot', async () => {
    const { result } = renderHook(() =>
      useRealTimePreview({ portfolio: mockPortfolio })
    );

    let screenshot: string | null = null;
    await act(async () => {
      screenshot = await result.current.capturePreviewScreenshot();
    });

    // Should return placeholder data for now
    expect(screenshot).toBe(
      'data:image/png;base64,placeholder-screenshot-data'
    );
  });

  it('should handle screenshot capture with no preview element', async () => {
    document.body.innerHTML = ''; // Remove preview container

    const { result } = renderHook(() =>
      useRealTimePreview({ portfolio: mockPortfolio })
    );

    let screenshot: string | null = null;
    await act(async () => {
      screenshot = await result.current.capturePreviewScreenshot();
    });

    expect(screenshot).toBeNull();
  });

  it('should export preview HTML', async () => {
    const { result } = renderHook(() =>
      useRealTimePreview({ portfolio: mockPortfolio })
    );

    const html = result.current.exportPreviewHTML();

    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('<title>Test Portfolio - Portfolio</title>');
    expect(html).toContain('data-preview-container');
    expect(html).toContain('Experience Section');
    expect(html).toContain('Projects Section');
  });

  it('should handle export HTML with no preview element', async () => {
    document.body.innerHTML = '';

    const { result } = renderHook(() =>
      useRealTimePreview({ portfolio: mockPortfolio })
    );

    const html = result.current.exportPreviewHTML();

    expect(html).toBe('');
  });

  it('should get preview URL for published portfolio', async () => {
    const publishedPortfolio = {
      ...mockPortfolio,
      status: 'published' as const,
      subdomain: 'my-portfolio',
    };

    const { result } = renderHook(() =>
      useRealTimePreview({ portfolio: publishedPortfolio })
    );

    const url = result.current.getPreviewUrl();

    expect(url).toBe('https://my-portfolio.prisma.madfam.io');
  });

  it('should return null preview URL for draft portfolio', async () => {
    const { result } = renderHook(() =>
      useRealTimePreview({ portfolio: mockPortfolio })
    );

    const url = result.current.getPreviewUrl();

    expect(url).toBeNull();
  });

  it('should call onPreviewChange callback', async () => {
    const onPreviewChange = jest.fn().mockReturnValue(void 0);

    const { result } = renderHook(() =>
      useRealTimePreview({ portfolio: mockPortfolio, onPreviewChange })
    );

    expect(onPreviewChange).toHaveBeenCalledWith(result.current.previewConfig);

    act(() => {
      result.current.setPreviewMode('tablet');
    });

    expect(onPreviewChange).toHaveBeenCalledTimes(2);
    expect(onPreviewChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ mode: 'tablet' })
    );
  });

  it('should reset custom dimensions when changing mode', async () => {
    const { result } = renderHook(() =>
      useRealTimePreview({ portfolio: mockPortfolio })
    );

    // Set custom dimensions
    act(() => {
      result.current.testResponsiveBreakpoint(800, 600);
    });

    expect(result.current.previewDimensions.width).toBe('800px');

    // Change mode
    act(() => {
      result.current.setPreviewMode('mobile');
    });

    // Should use mobile dimensions, not custom
    expect(result.current.previewDimensions.width).toBe('375px');
  });

  it('should apply zoom to custom dimensions', async () => {
    const { result } = renderHook(() =>
      useRealTimePreview({ portfolio: mockPortfolio })
    );

    act(() => {
      result.current.testResponsiveBreakpoint(1000, 800);
      result.current.setZoomLevel(0.5);
    });

    expect(result.current.previewDimensions).toEqual({
      width: '1000px',
      height: '800px',
      scale: 0.5,
    });
  });

  it('should use portfolio name in export title', async () => {
    const portfolioWithName = {
      ...mockPortfolio,
      name: 'John Doe Portfolio',
      title: 'Developer',
    };

    const { result } = renderHook(() =>
      useRealTimePreview({ portfolio: portfolioWithName })
    );

    const html = result.current.exportPreviewHTML();

    expect(html).toContain('<title>John Doe Portfolio - Portfolio</title>');
  });

  it('should use portfolio title as fallback in export', async () => {
    const portfolioWithoutName = {
      ...mockPortfolio,
      name: '',
      title: 'Senior Developer',
    };

    const { result } = renderHook(() =>
      useRealTimePreview({ portfolio: portfolioWithoutName })
    );

    const html = result.current.exportPreviewHTML();

    expect(html).toContain('<title>Senior Developer - Portfolio</title>');
  });
});

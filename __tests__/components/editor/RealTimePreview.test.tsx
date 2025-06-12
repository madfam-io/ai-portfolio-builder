
// Mock hooks
jest.mock('@/hooks/useDebounce', () => ({
  useDebounce: (value: any) => value,
}));

jest.mock('@/hooks/useRealTimePreview', () => ({
  useRealTimePreview: () => ({
    isConnected: true,
    isLoading: false,
    error: null,
    previewUrl: 'http://localhost:3000/preview/123',
    updatePreview: jest.fn(),
    reconnect: jest.fn(),
  }),
}));
/**
 * Tests for RealTimePreview component
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { RealTimePreview } from '@/components/editor/RealTimePreview';
import { Portfolio } from '@/types/portfolio';

// Mock hooks
jest.mock('@/hooks/useRealTimePreview', () => ({
  useRealTimePreview: jest.fn(() => ({
    isConnected: true,
    isLoading: false,
    error: null,
    previewUrl: 'http://localhost:3000/preview/123',
    updatePreview: jest.fn(),
    reconnect: jest.fn(),
  })),
}));

jest.mock('@/hooks/useDebounce', () => ({
  useDebounce: jest.fn(value => value),
}));

describe('RealTimePreview', () => {
  const mockPortfolio: Portfolio = {
    id: '1',
    userId: 'user-123',
    name: 'John Doe',
    title: 'Software Engineer',
    bio: 'Experienced developer',
    template: 'developer',
    status: 'draft',
    subdomain: 'johndoe',
    views: 0,
    contact: { email: 'john@example.com' },
    social: {},
    experience: [],
    education: [],
    projects: [],
    skills: [],
    certifications: [],
    customization: {},
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockOnTemplateChange = jest.fn() as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render preview iframe', () => {
      render(
        <RealTimePreview portfolio={mockPortfolio as any} template="developer" />
      );

      const iframe = screen.getByTitle('Portfolio Preview');
      expect(iframe).toBeInTheDocument();
      expect(iframe).toHaveAttribute(
        'src',
        'http://localhost:3000/preview/123'
      );
    });

    it('should render device selector', () => {
      render(
        <RealTimePreview portfolio={mockPortfolio as any} template="developer" />
      );

      expect(
        screen.getByRole('button', { name: /desktop/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /tablet/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /mobile/i })
      ).toBeInTheDocument();
    });

    it('should render template selector', () => {
      render(
        <RealTimePreview portfolio={mockPortfolio as any} template="developer" />
      );

      const templateSelector = screen.getByLabelText(/template/i);
      expect(templateSelector).toBeInTheDocument();
      expect(templateSelector).toHaveValue('developer');
    });
  });

  describe('Device Preview', () => {
    it('should switch to tablet view', async () => {
      const user = userEvent.setup();

      render(
        <RealTimePreview portfolio={mockPortfolio as any} template="developer" />
      );

      const tabletButton = screen.getByRole('button', { name: /tablet/i });
      await user.click(tabletButton);

      const previewContainer = screen.getByTestId('preview-container');
      expect(previewContainer).toHaveClass('tablet-view');
    });

    it('should switch to mobile view', async () => {
      const user = userEvent.setup();

      render(
        <RealTimePreview portfolio={mockPortfolio as any} template="developer" />
      );

      const mobileButton = screen.getByRole('button', { name: /mobile/i });
      await user.click(mobileButton);

      const previewContainer = screen.getByTestId('preview-container');
      expect(previewContainer).toHaveClass('mobile-view');
    });

    it('should maintain aspect ratio in different views', () => {
      render(
        <RealTimePreview portfolio={mockPortfolio as any} template="developer" />
      );

      const iframe = screen.getByTitle('Portfolio Preview');

      // Check desktop dimensions
      expect(iframe).toHaveStyle({ width: '100%', height: '100%' });
    });
  });

  describe('Template Switching', () => {
    it('should change template', async () => {
      const user = userEvent.setup();

      render(
        <RealTimePreview portfolio={mockPortfolio as any} template="developer" />
      );

      const templateSelector = screen.getByLabelText(/template/i);
      await user.selectOptions(templateSelector, 'designer');

      expect(mockOnTemplateChange).toHaveBeenCalledWith('designer');
    });

    it('should update preview when template changes', async () => {
      const { useRealTimePreview } = require('@/hooks/useRealTimePreview');
      const mockUpdatePreview = jest.fn() as jest.Mock;
      useRealTimePreview.mockReturnValue({
        isConnected: true,
        isLoading: false,
        error: null,
        previewUrl: 'http://localhost:3000/preview/123',
        updatePreview: mockUpdatePreview,
        reconnect: jest.fn(),
      });

      const user = userEvent.setup();

      render(
        <RealTimePreview portfolio={mockPortfolio as any} template="developer" />
      );

      const templateSelector = screen.getByLabelText(/template/i);
      await user.selectOptions(templateSelector, 'consultant');

      expect(mockUpdatePreview).toHaveBeenCalledWith(
        expect.objectContaining({ template: 'consultant' })
      );
    });
  });

  describe('Real-Time Updates', () => {
    it('should update preview when portfolio data changes', async () => {
      const { useRealTimePreview } = require('@/hooks/useRealTimePreview');
      const mockUpdatePreview = jest.fn() as jest.Mock;
      useRealTimePreview.mockReturnValue({
        isConnected: true,
        isLoading: false,
        error: null,
        previewUrl: 'http://localhost:3000/preview/123',
        updatePreview: mockUpdatePreview,
        reconnect: jest.fn(),
      });

      const { rerender } = render(
        <RealTimePreview portfolio={mockPortfolio as any} template="developer" />
      );

      const updatedPortfolio = {
        ...mockPortfolio,
        bio: 'Updated bio text',
      };

      rerender(
        <RealTimePreview
          portfolio={updatedPortfolio}
          template="developer"
        />
      );

      await waitFor(() => {
        expect(mockUpdatePreview).toHaveBeenCalledWith(updatedPortfolio);
      });
    });

    it('should debounce frequent updates', async () => {
      const { useDebounce } = require('@/hooks/useDebounce');
      const debouncedValue = { bio: 'Debounced value' };
      useDebounce.mockReturnValue(debouncedValue);

      const { useRealTimePreview } = require('@/hooks/useRealTimePreview');
      const mockUpdatePreview = jest.fn() as jest.Mock;
      useRealTimePreview.mockReturnValue({
        isConnected: true,
        isLoading: false,
        error: null,
        previewUrl: 'http://localhost:3000/preview/123',
        updatePreview: mockUpdatePreview,
        reconnect: jest.fn(),
      });

      render(
        <RealTimePreview portfolio={mockPortfolio as any} template="developer" />
      );

      expect(useDebounce).toHaveBeenCalledWith(mockPortfolio, 500);
    });
  });

  describe('Connection Status', () => {
    it('should show loading state', () => {
      const { useRealTimePreview } = require('@/hooks/useRealTimePreview');
      useRealTimePreview.mockReturnValue({
        isConnected: false,
        isLoading: true,
        error: null,
        previewUrl: null,
        updatePreview: jest.fn(),
        reconnect: jest.fn(),
      });

      render(
        <RealTimePreview portfolio={mockPortfolio as any} template="developer" />
      );

      expect(screen.getByText(/loading preview/i)).toBeInTheDocument();
    });

    it('should show disconnected state', () => {
      const { useRealTimePreview } = require('@/hooks/useRealTimePreview');
      useRealTimePreview.mockReturnValue({
        isConnected: false,
        isLoading: false,
        error: null,
        previewUrl: 'http://localhost:3000/preview/123',
        updatePreview: jest.fn(),
        reconnect: jest.fn(),
      });

      render(
        <RealTimePreview portfolio={mockPortfolio as any} template="developer" />
      );

      expect(screen.getByText(/disconnected/i)).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /reconnect/i })
      ).toBeInTheDocument();
    });

    it('should handle reconnection', async () => {
      const { useRealTimePreview } = require('@/hooks/useRealTimePreview');
      const mockReconnect = jest.fn() as jest.Mock;
      useRealTimePreview.mockReturnValue({
        isConnected: false,
        isLoading: false,
        error: null,
        previewUrl: 'http://localhost:3000/preview/123',
        updatePreview: jest.fn(),
        reconnect: mockReconnect,
      });

      const user = userEvent.setup();

      render(
        <RealTimePreview portfolio={mockPortfolio as any} template="developer" />
      );

      const reconnectButton = screen.getByRole('button', {
        name: /reconnect/i,
      });
      await user.click(reconnectButton);

      expect(mockReconnect).toHaveBeenCalled();
    });

    it('should show error state', () => {
      const { useRealTimePreview } = require('@/hooks/useRealTimePreview');
      useRealTimePreview.mockReturnValue({
        isConnected: false,
        isLoading: false,
        error: 'Failed to connect to preview server',
        previewUrl: null,
        updatePreview: jest.fn(),
        reconnect: jest.fn(),
      });

      render(
        <RealTimePreview portfolio={mockPortfolio as any} template="developer" />
      );

      expect(screen.getByText(/failed to connect/i)).toBeInTheDocument();
    });
  });

  describe('Preview Controls', () => {
    it('should refresh preview', async () => {
      const user = userEvent.setup();

      render(
        <RealTimePreview portfolio={mockPortfolio as any} template="developer" />
      );

      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      await user.click(refreshButton);

      const iframe = screen.getByTitle(
        'Portfolio Preview'
      ) as HTMLIFrameElement;
      // Check that iframe src was updated (timestamp added)
      expect(iframe.src).toContain('http://localhost:3000/preview/123');
      expect(iframe.src).toContain('t=');
    });

    it('should open preview in new window', async () => {
      const user = userEvent.setup();
      window.open = jest.fn();

      render(
        <RealTimePreview portfolio={mockPortfolio as any} template="developer" />
      );

      const newWindowButton = screen.getByRole('button', {
        name: /open in new/i,
      });
      await user.click(newWindowButton);

      expect(window.open).toHaveBeenCalledWith(
        'http://localhost:3000/preview/123',
        '_blank'
      );
    });

    it('should toggle fullscreen mode', async () => {
      const user = userEvent.setup();

      render(
        <RealTimePreview portfolio={mockPortfolio as any} template="developer" />
      );

      const fullscreenButton = screen.getByRole('button', {
        name: /fullscreen/i,
      });
      await user.click(fullscreenButton);

      const previewContainer = screen.getByTestId('preview-container');
      expect(previewContainer).toHaveClass('fullscreen');

      // Toggle off
      await user.click(fullscreenButton);
      expect(previewContainer).not.toHaveClass('fullscreen');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(
        <RealTimePreview portfolio={mockPortfolio as any} template="developer" />
      );

      expect(screen.getByLabelText(/device preview/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/template selector/i)).toBeInTheDocument();
    });

    it('should announce connection status changes', async () => {
      const { useRealTimePreview } = require('@/hooks/useRealTimePreview');
      const mockHook = {
        isConnected: true,
        isLoading: false,
        error: null,
        previewUrl: 'http://localhost:3000/preview/123',
        updatePreview: jest.fn(),
        reconnect: jest.fn(),
      };
      useRealTimePreview.mockReturnValue(mockHook);

      const { rerender } = render(
        <RealTimePreview portfolio={mockPortfolio as any} template="developer" />
      );

      // Change to disconnected
      mockHook.isConnected = false;
      rerender(
        <RealTimePreview portfolio={mockPortfolio as any} template="developer" />
      );

      const statusAnnouncement = screen.getByRole('status');
      expect(statusAnnouncement).toHaveTextContent(/disconnected/i);
    });
  });
});

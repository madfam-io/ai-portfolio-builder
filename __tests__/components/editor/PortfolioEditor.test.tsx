import { createMockPortfolio, createMockUser } from '../utils/test-helpers';

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
 * PortfolioEditor test suite - final version
 */

import { screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import PortfolioEditor from '@/components/editor/PortfolioEditor';

import { renderWithLanguage } from '../../utils/i18n-test-utils';

// Mock portfolioService
jest.mock('@/lib/services/portfolioService', () => ({
  portfolioService: {
    getPortfolio: jest.fn(),
    updatePortfolio: jest.fn(),
    publishPortfolio: jest.fn(),
    unpublishPortfolio: jest.fn(),
    updateTemplate: jest.fn(),
  },
}));

// Mock hooks
jest.mock('@/hooks/useDebounce', () => ({
  useDebounce: jest.fn(value => value),
}));

jest.mock('@/hooks/useAutoSave', () => ({
  useAutoSave: () => ({
    autoSave: jest.fn(),
    lastSaved: new Date(),
  }),
}));

jest.mock('@/hooks/useEditorHistory', () => ({
  useEditorHistory: () => ({
    pushToHistory: jest.fn(),
    undo: jest.fn(),
    redo: jest.fn(),
    canUndo: false,
    canRedo: false,
  }),
}));

const { portfolioService } = require('@/lib/services/portfolioService');

const mockPortfolio = {
  id: '1',
  userId: 'user-1',
  name: 'Test Portfolio',
  title: 'Software Engineer',
  bio: 'Test bio',
  tagline: '',
  avatarUrl: '',
  contact: {
    email: 'test@example.com',
    phone: '',
    location: '',
    availability: '',
  },
  social: {},
  experience: [],
  education: [],
  projects: [],
  skills: [],
  certifications: [],
  template: 'developer',
  customization: {},
  aiSettings: {
    enhanceBio: false,
    enhanceProjectDescriptions: false,
    generateSkillsFromExperience: false,
    tone: 'professional',
    targetLength: 'medium',
  },
  status: 'draft',
  subdomain: 'test',
  views: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('PortfolioEditor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    portfolioService.getPortfolio.mockResolvedValueOnce(mockPortfolio);
    portfolioService.updatePortfolio.mockResolvedValueOnce(mockPortfolio);
  });

  describe('Loading State', () => {
    test('shows loading state initially', async () => {
      portfolioService.getPortfolio.mockImplementation(
        () =>
          new Promise(resolve => setTimeout(() => resolve(mockPortfolio), 100))
      );

      renderWithLanguage(<PortfolioEditor portfolioId="1" userId="user-1" />);

      // Should show loading indicator
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    test('loads portfolio data', async () => {
      renderWithLanguage(<PortfolioEditor portfolioId="1" userId="user-1" />);

      await waitFor(() => {
        expect(portfolioService.getPortfolio).toHaveBeenCalledWith('1');
      });

      // Should display portfolio data
      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Portfolio')).toBeInTheDocument();
      });
    });
  });

  describe('Basic Editing', () => {
    test('updates portfolio name', async () => {
      const user = userEvent.setup();
      renderWithLanguage(<PortfolioEditor portfolioId="1" userId="user-1" />);

      // Wait for portfolio to load
      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Portfolio')).toBeInTheDocument();
      });

      const nameInput = screen.getByDisplayValue('Test Portfolio');
      await user.clear(nameInput);
      await user.type(nameInput, 'Updated Portfolio Name');

      await waitFor(() => {
        expect(portfolioService.updatePortfolio).toHaveBeenCalledWith(
          '1',
          expect.objectContaining({ name: 'Updated Portfolio Name' })
        );
      });
    });

    test('updates portfolio bio', async () => {
      const user = userEvent.setup();
      renderWithLanguage(<PortfolioEditor portfolioId="1" userId="user-1" />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test bio')).toBeInTheDocument();
      });

      const bioInput = screen.getByDisplayValue('Test bio');
      await user.clear(bioInput);
      await user.type(bioInput, 'Updated bio content');

      await waitFor(() => {
        expect(portfolioService.updatePortfolio).toHaveBeenCalledWith(
          '1',
          expect.objectContaining({ bio: 'Updated bio content' })
        );
      });
    });
  });

  describe('Publishing', () => {
    test('publishes draft portfolio', async () => {
      renderWithLanguage(<PortfolioEditor portfolioId="1" userId="user-1" />);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /publicar/i })
        ).toBeInTheDocument();
      });

      portfolioService.publishPortfolio.mockResolvedValueOnce({
        ...mockPortfolio,
        status: 'published',
      });

      fireEvent.click(screen.getByRole('button', { name: /publicar/i }));

      await waitFor(() => {
        expect(portfolioService.publishPortfolio).toHaveBeenCalledWith('1');
      });
    });

    test('unpublishes published portfolio', async () => {
      const publishedPortfolio = { ...mockPortfolio, status: 'published' };
      portfolioService.getPortfolio.mockResolvedValueOnce(publishedPortfolio);

      renderWithLanguage(<PortfolioEditor portfolioId="1" userId="user-1" />);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /despublicar/i })
        ).toBeInTheDocument();
      });

      portfolioService.unpublishPortfolio.mockResolvedValueOnce({
        ...publishedPortfolio,
        status: 'draft',
      });

      fireEvent.click(screen.getByRole('button', { name: /despublicar/i }));

      await waitFor(() => {
        expect(portfolioService.unpublishPortfolio).toHaveBeenCalledWith('1');
      });
    });
  });

  describe('Error Handling', () => {
    test('shows error when portfolio fails to load', async () => {
      portfolioService.getPortfolio.mockRejectedValue(
        new Error('Failed to load')
      );

      renderWithLanguage(<PortfolioEditor portfolioId="1" userId="user-1" />);

      await waitFor(() => {
        expect(screen.queryByText(/error/i) || screen.queryByText(/retry/i)).toBeInTheDocument();
      });
    });

    test('handles update errors gracefully', async () => {
      const user = userEvent.setup();
      portfolioService.updatePortfolio.mockRejectedValueOnce(
        new Error('Update failed')
      );

      renderWithLanguage(<PortfolioEditor portfolioId="1" userId="user-1" />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Portfolio')).toBeInTheDocument();
      });

      const nameInput = screen.getByDisplayValue('Test Portfolio');
      await user.clear(nameInput);
      await user.type(nameInput, 'New Name');

      // Should attempt update but handle error gracefully
      await waitFor(() => {
        expect(portfolioService.updatePortfolio).toHaveBeenCalled();
      });
    });
  });

  describe('Callbacks', () => {
    test('calls onUpdate callback when portfolio is updated', async () => {
      const mockOnUpdate = jest.fn() as jest.Mock;
      const user = userEvent.setup();

      renderWithLanguage(<PortfolioEditor portfolioId="1" userId="user-1" />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Portfolio')).toBeInTheDocument();
      });

      const nameInput = screen.getByDisplayValue('Test Portfolio');
      await user.clear(nameInput);
      await user.type(nameInput, 'Updated Name');

      await waitFor(() => {
        expect(mockOnUpdate).toHaveBeenCalled();
      });
    });

    test('calls onPublish callback when portfolio is published', async () => {
      const mockOnPublish = jest.fn() as jest.Mock;

      renderWithLanguage(
        <PortfolioEditor
          portfolioId="1"
          userId="user-1"
          onPublish={mockOnPublish as any}
        />
      );

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /publicar/i })
        ).toBeInTheDocument();
      });

      portfolioService.publishPortfolio.mockResolvedValueOnce({
        ...mockPortfolio,
        status: 'published',
      });

      fireEvent.click(screen.getByRole('button', { name: /publicar/i }));

      await waitFor(() => {
        expect(mockOnPublish).toHaveBeenCalled();
      });
    });
  });
});

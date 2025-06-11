/**
 * AIEnhancementButton Component test suite
 */

import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AIEnhancementButton from '@/components/editor/AIEnhancementButton';
import { renderWithLanguage } from '../../utils/i18n-test-utils';

// Mock fetch
global.fetch = jest.fn();

describe('AIEnhancementButton Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockReset();
  });

  describe('Bio Enhancement', () => {
    test('renders bio enhancement button', () => {
      renderWithLanguage(
        <AIEnhancementButton
          type="bio"
          content="Software developer"
          onEnhanced={jest.fn()}
        />
      );

      const button = screen.getByRole('button', { name: /enhance|mejorar/i });
      expect(button).toBeInTheDocument();
    });

    test('enhances bio content on click', async () => {
      const user = userEvent.setup();
      const onEnhanced = jest.fn();

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          enhanced:
            'Experienced software developer with 5+ years building scalable web applications. Specializes in React, Node.js, and cloud architecture.',
          confidence: 0.92,
        }),
      });

      renderWithLanguage(
        <AIEnhancementButton
          type="bio"
          content="Software developer"
          onEnhanced={onEnhanced}
        />
      );

      const button = screen.getByRole('button', { name: /enhance|mejorar/i });
      await user.click(button);

      await waitFor(() => {
        expect(onEnhanced).toHaveBeenCalledWith(
          'Experienced software developer with 5+ years building scalable web applications. Specializes in React, Node.js, and cloud architecture.'
        );
      });
    });

    test('shows loading state during enhancement', async () => {
      const user = userEvent.setup();

      (global.fetch as jest.Mock).mockImplementation(
        () =>
          new Promise(resolve =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: async () => ({ enhanced: 'Enhanced bio' }),
                }),
              100
            )
          )
      );

      renderWithLanguage(
        <AIEnhancementButton
          type="bio"
          content="Developer"
          onEnhanced={jest.fn()}
        />
      );

      const button = screen.getByRole('button', { name: /enhance|mejorar/i });
      await user.click(button);

      // Should show loading indicator
      expect(screen.getByRole('progressbar')).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
      });
    });
  });

  describe('Project Enhancement', () => {
    test('enhances project description', async () => {
      const user = userEvent.setup();
      const onEnhanced = jest.fn();

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          optimized: {
            title: 'E-commerce Platform Redesign',
            description:
              'Led complete redesign of e-commerce platform, resulting in 40% increase in conversion rates.',
            tags: ['UI/UX', 'React', 'Performance'],
          },
        }),
      });

      renderWithLanguage(
        <AIEnhancementButton
          type="project"
          content="Built an online store"
          metadata={{
            title: 'Store project',
            technologies: ['React', 'Node.js'],
          }}
          onEnhanced={onEnhanced}
        />
      );

      const button = screen.getByRole('button');
      await user.click(button);

      await waitFor(() => {
        expect(onEnhanced).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'E-commerce Platform Redesign',
            description: expect.stringContaining('40% increase'),
          })
        );
      });
    });
  });

  describe('Model Selection', () => {
    test('allows model selection for enhancement', async () => {
      const user = userEvent.setup();

      renderWithLanguage(
        <AIEnhancementButton
          type="bio"
          content="Developer"
          onEnhanced={jest.fn()}
          showModelSelector
        />
      );

      // Click to open model selector
      const dropdownButton = screen.getByRole('button', {
        name: /model|modelo/i,
      });
      await user.click(dropdownButton);

      // Should show model options
      expect(screen.getByText(/llama/i)).toBeInTheDocument();
      expect(screen.getByText(/phi/i)).toBeInTheDocument();
    });

    test('uses selected model for enhancement', async () => {
      const user = userEvent.setup();

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ enhanced: 'Enhanced content' }),
      });

      renderWithLanguage(
        <AIEnhancementButton
          type="bio"
          content="Developer"
          onEnhanced={jest.fn()}
          showModelSelector
        />
      );

      // Select a specific model
      const dropdownButton = screen.getByRole('button', {
        name: /model|modelo/i,
      });
      await user.click(dropdownButton);

      const modelOption = screen.getByText(/phi/i);
      await user.click(modelOption);

      // Enhance with selected model
      const enhanceButton = screen.getByRole('button', {
        name: /enhance|mejorar/i,
      });
      await user.click(enhanceButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            body: expect.stringContaining('Phi'),
          })
        );
      });
    });
  });

  describe('Error Handling', () => {
    test('shows error message on enhancement failure', async () => {
      const user = userEvent.setup();

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Enhancement failed' }),
      });

      renderWithLanguage(
        <AIEnhancementButton
          type="bio"
          content="Developer"
          onEnhanced={jest.fn()}
        />
      );

      const button = screen.getByRole('button', { name: /enhance|mejorar/i });
      await user.click(button);

      const errorMessage = await screen.findByText(/error|error/i);
      expect(errorMessage).toBeInTheDocument();
    });

    test('handles network errors gracefully', async () => {
      const user = userEvent.setup();

      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      );

      renderWithLanguage(
        <AIEnhancementButton
          type="bio"
          content="Developer"
          onEnhanced={jest.fn()}
        />
      );

      const button = screen.getByRole('button', { name: /enhance|mejorar/i });
      await user.click(button);

      const errorMessage = await screen.findByText(/error|error/i);
      expect(errorMessage).toBeInTheDocument();
    });
  });

  describe('Disabled State', () => {
    test('disables button when no content provided', () => {
      renderWithLanguage(
        <AIEnhancementButton type="bio" content="" onEnhanced={jest.fn()} />
      );

      const button = screen.getByRole('button', { name: /enhance|mejorar/i });
      expect(button).toBeDisabled();
    });

    test('disables button during enhancement', async () => {
      const user = userEvent.setup();

      (global.fetch as jest.Mock).mockImplementation(
        () =>
          new Promise(resolve =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: async () => ({ enhanced: 'Enhanced' }),
                }),
              100
            )
          )
      );

      renderWithLanguage(
        <AIEnhancementButton
          type="bio"
          content="Developer"
          onEnhanced={jest.fn()}
        />
      );

      const button = screen.getByRole('button', { name: /enhance|mejorar/i });
      await user.click(button);

      expect(button).toBeDisabled();

      await waitFor(() => {
        expect(button).not.toBeDisabled();
      });
    });
  });

  describe('Character Limit', () => {
    test('shows character count for bio', () => {
      renderWithLanguage(
        <AIEnhancementButton
          type="bio"
          content="This is my bio content that should be enhanced"
          onEnhanced={jest.fn()}
          showCharacterCount
        />
      );

      expect(screen.getByText(/46/)).toBeInTheDocument();
    });

    test('warns when approaching character limit', () => {
      const longBio = 'a'.repeat(140);

      renderWithLanguage(
        <AIEnhancementButton
          type="bio"
          content={longBio}
          onEnhanced={jest.fn()}
          showCharacterCount
          maxCharacters={150}
        />
      );

      // Should show warning color
      const charCount = screen.getByText(/140/);
      expect(charCount).toHaveClass('text-yellow-600');
    });
  });
});

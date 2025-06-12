/**
 * AIEnhancementButton Component test suite
 */

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { AIEnhancementButton } from '@/components/editor/AIEnhancementButton';
import { aiClient } from '@/lib/ai/client';

import { renderWithLanguage } from '../../utils/i18n-test-utils';

// Mock the AI client
jest.mock('@/lib/ai/client', () => ({
  aiClient: {
    enhanceBio: jest.fn(),
    optimizeProject: jest.fn(),
  },
}));

describe('AIEnhancementButton Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Bio Enhancement', () => {
    test('renders bio enhancement button', () => {
      renderWithLanguage(
        <AIEnhancementButton
          type="bio"
          content="Software developer"
          onEnhanced={jest.fn() as any}
        />
      );

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    test('enhances bio content on click', async () => {
      const user = userEvent.setup();
      const onEnhanced = jest.fn();
      const enhancedBio =
        'Experienced software developer with 5+ years building scalable web applications. Specializes in React, Node.js, and cloud architecture.';

      (aiClient.enhanceBio as jest.Mock).mockResolvedValueOnce({
        content: enhancedBio,
        confidence: 92,
        suggestions: [],
        wordCount: 25,
        qualityScore: 92,
        enhancementType: 'bio',
      });

      renderWithLanguage(
        <AIEnhancementButton
          type="bio"
          content="Software developer"
          onEnhanced={onEnhanced}
        />
      );

      const button = screen.getByRole('button');
      await user.click(button);

      await waitFor(() => {
        expect(onEnhanced).toHaveBeenCalledWith(enhancedBio, []);
      });
    });

    test('shows loading state during enhancement', async () => {
      const user = userEvent.setup();

      (aiClient.enhanceBio as jest.Mock).mockImplementation(
        () =>
          new Promise(resolve =>
            setTimeout(
              () =>
                resolve({
                  content: 'Enhanced bio',
                  confidence: 90,
                  suggestions: [],
                  wordCount: 15,
                  qualityScore: 90,
                  enhancementType: 'bio',
                }),
              100
            )
          )
      );

      renderWithLanguage(
        <AIEnhancementButton
          type="bio"
          content="Developer"
          onEnhanced={jest.fn() as any}
        />
      );

      const button = screen.getByRole('button');
      await user.click(button);

      // Should show loading indicator
      expect(button).toHaveTextContent(/enhancing|mejorando/i);

      await waitFor(() => {
        expect(button).not.toHaveTextContent(/enhancing|mejorando/i);
      });
    });
  });

  describe('Project Enhancement', () => {
    test('enhances project description', async () => {
      const user = userEvent.setup();
      const onEnhanced = jest.fn();

      (aiClient.optimizeProject as jest.Mock).mockResolvedValueOnce({
        title: 'E-commerce Platform Redesign',
        description:
          'Led complete redesign of e-commerce platform, resulting in 40% increase in conversion rates.',
        highlights: ['40% conversion increase', 'React/Node.js stack'],
        technologies: ['React', 'Node.js', 'PostgreSQL'],
        metrics: ['40% increase in conversion rates'],
        starFormat: {
          situation: 'Legacy e-commerce platform with poor UX',
          task: 'Complete platform redesign',
          action: 'Led frontend development team',
          result: '40% increase in conversion rates',
        },
      });

      renderWithLanguage(
        <AIEnhancementButton
          type="project"
          content="Built an online store"
          context={{
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
          expect.stringContaining('40% increase'),
          ['40% conversion increase', 'React/Node.js stack']
        );
      });
    });
  });

  describe('Error Handling', () => {
    test('shows error message on enhancement failure', async () => {
      const user = userEvent.setup();

      (aiClient.enhanceBio as jest.Mock).mockRejectedValueOnce(
        new Error('Enhancement failed')
      );

      renderWithLanguage(
        <AIEnhancementButton
          type="bio"
          content="Developer"
          onEnhanced={jest.fn() as any}
        />
      );

      const button = screen.getByRole('button');
      await user.click(button);

      // Button should show normal state after error
      await waitFor(() => {
        expect(button).not.toHaveTextContent(/enhancing|mejorando/i);
      });
    });

    test('handles network errors gracefully', async () => {
      const user = userEvent.setup();

      (aiClient.enhanceBio as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      );

      renderWithLanguage(
        <AIEnhancementButton
          type="bio"
          content="Developer"
          onEnhanced={jest.fn() as any}
        />
      );

      const button = screen.getByRole('button');
      await user.click(button);

      // Should return to normal state after error
      await waitFor(() => {
        expect(button).toBeEnabled();
      });
    });
  });

  describe('Disabled State', () => {
    test('disables button when no content provided', () => {
      renderWithLanguage(
        <AIEnhancementButton type="bio" content="" onEnhanced={jest.fn() as any} />
      );

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    test('disables button during enhancement', async () => {
      const user = userEvent.setup();

      (aiClient.enhanceBio as jest.Mock).mockImplementation(
        () =>
          new Promise(resolve =>
            setTimeout(
              () =>
                resolve({
                  enhanced: 'Enhanced',
                  qualityScore: { suggestions: [] },
                }),
              100
            )
          )
      );

      renderWithLanguage(
        <AIEnhancementButton
          type="bio"
          content="Developer"
          onEnhanced={jest.fn() as any}
        />
      );

      const button = screen.getByRole('button');
      await user.click(button);

      expect(button).toBeDisabled();

      await waitFor(() => {
        expect(button).not.toBeDisabled();
      });
    });

    test('disables button when explicitly disabled', () => {
      renderWithLanguage(
        <AIEnhancementButton
          type="bio"
          content="Developer"
          onEnhanced={jest.fn() as any}
          disabled={true}
        />
      );

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });
  });

  describe('Context Handling', () => {
    test('passes context to bio enhancement', async () => {
      const user = userEvent.setup();
      const bioContext = {
        title: 'Software Engineer',
        experience: [
          {
            company: 'Tech Corp',
            position: 'Senior Developer',
            yearsExperience: 5,
          },
        ],
        industry: 'Technology',
        tone: 'professional' as const,
        targetLength: 'concise' as const,
      };

      (aiClient.enhanceBio as jest.Mock).mockResolvedValueOnce({
        enhanced: 'Enhanced bio with context',
        qualityScore: { suggestions: [] },
      });

      renderWithLanguage(
        <AIEnhancementButton
          type="bio"
          content="Developer"
          context={bioContext}
          onEnhanced={jest.fn() as any}
        />
      );

      const button = screen.getByRole('button');
      await user.click(button);

      await waitFor(() => {
        expect(aiClient.enhanceBio).toHaveBeenCalledWith(
          'Developer',
          bioContext
        );
      });
    });
  });
});

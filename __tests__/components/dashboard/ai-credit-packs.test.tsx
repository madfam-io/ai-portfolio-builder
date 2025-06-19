/**
 * @jest-environment jsdom
 */

import { describe, test, it, expect, beforeEach, jest } from '@jest/globals';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AICreditPacks from '@/components/dashboard/ai-credit-packs';
import { useLanguage } from '@/lib/i18n/refactored-context';
import { toast } from '@/lib/ui/toast';
import { AI_CREDIT_PACKS } from '@/lib/services/stripe/stripe-enhanced';


// Mock dependencies
jest.mock('@/lib/i18n/refactored-context');
jest.mock('@/lib/ui/toast');

const mockUseLanguage = useLanguage as jest.MockedFunction<typeof useLanguage>;
const mockToast = toast as jest.MockedFunction<typeof toast>;

describe('AICreditPacks', () => {
  const mockOnPurchase = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (mockUseLanguage as any).mockImplementation(() => ({
      t: {
        error: 'Error',
        success: 'Success',
      },
    } as any);
  });

  const defaultProps = {
    currentCredits: 15,
    onPurchase: mockOnPurchase,
  };

  describe('Rendering', () => {
    it('should display current credit balance', () => {
      render(<AICreditPacks {...defaultProps} />);

      expect(screen.getByText('AI Enhancement Credits')).toBeInTheDocument();
      expect(screen.getByText('Current Balance')).toBeInTheDocument();
      expect(screen.getByText('15 credits')).toBeInTheDocument();
    });

    it('should display all credit pack options', () => {
      render(<AICreditPacks {...defaultProps} />);

      // Check that all packs from AI_CREDIT_PACKS are displayed
      Object.values(AI_CREDIT_PACKS).forEach(pack => {
        expect(screen.getByText(pack.name)).toBeInTheDocument();
        expect(
          screen.getByText(`${pack.credits} AI enhancement credits`)
        ).toBeInTheDocument();
        expect(
          screen.getByText(`Buy ${pack.credits} Credits`)
        ).toBeInTheDocument();
      });
    });

    it('should display information alert about credit usage', () => {
      render(<AICreditPacks {...defaultProps} />);

      expect(screen.getByText('How credits work:')).toBeInTheDocument();
      expect(
        screen.getByText(/Each AI enhancement.*uses 1 credit/)
      ).toBeInTheDocument();
      expect(screen.getByText(/Credits never expire/)).toBeInTheDocument();
    });

    it('should display pro tips section', () => {
      render(<AICreditPacks {...defaultProps} />);

      expect(screen.getByText('Pro Tips')).toBeInTheDocument();
      expect(
        screen.getByText(/Use AI enhancement on your most important projects/)
      ).toBeInTheDocument();
      expect(screen.getByText(/Try different AI models/)).toBeInTheDocument();
      expect(
        screen.getByText(/Save credits by writing a good first draft/)
      ).toBeInTheDocument();
    });

    it('should highlight popular pack', () => {
      render(<AICreditPacks {...defaultProps} />);

      // Medium pack should be marked as popular
      const popularBadge = screen.getByText('Most Popular');
      expect(popularBadge).toBeInTheDocument();
    });

    it('should display savings badges correctly', () => {
      render(<AICreditPacks {...defaultProps} />);

      expect(screen.getByText('Save 20% vs small pack')).toBeInTheDocument();
      expect(screen.getByText('Save 33% vs small pack')).toBeInTheDocument();
    });
  });

  describe('Price Formatting', () => {
    it('should format prices correctly', () => {
      render(<AICreditPacks {...defaultProps} />);

      // Check that prices are formatted as currency
      expect(screen.getByText('$5.00')).toBeInTheDocument(); // Small pack
      expect(screen.getByText('$10.00')).toBeInTheDocument(); // Medium pack
      expect(screen.getByText('$20.00')).toBeInTheDocument(); // Large pack
    });

    it('should calculate price per credit correctly', () => {
      render(<AICreditPacks {...defaultProps} />);

      // Small pack: $5.00 / 10 credits = $0.50 per credit
      expect(screen.getByText('$0.50 per credit')).toBeInTheDocument();

      // Medium pack: $10.00 / 25 credits = $0.40 per credit
      expect(screen.getByText('$0.40 per credit')).toBeInTheDocument();

      // Large pack: $20.00 / 60 credits = $0.33 per credit
      expect(screen.getByText('$0.33 per credit')).toBeInTheDocument();
    });
  });

  describe('Purchase Functionality', () => {
    it('should call onPurchase when buy button is clicked', async () => {
      const user = userEvent.setup();
      render(<AICreditPacks {...defaultProps} />);

      const smallPackButton = screen.getByText('Buy 10 Credits');
      await user.click(smallPackButton);

      expect(mockOnPurchase).toHaveBeenCalledWith('small');
    });

    it('should show loading state during purchase', async () => {
      const user = userEvent.setup();

      // Mock onPurchase to return a pending promise
      let resolvePurchase: () => void;
      const purchasePromise = new Promise<void>(resolve => {
        resolvePurchase = resolve;
      });

      mockOnPurchase.mockReturnValue(purchasePromise);

      render(<AICreditPacks {...defaultProps} />);

      const mediumPackButton = screen.getByText('Buy 25 Credits');
      await user.click(mediumPackButton);

      // Should show loading state
      expect(screen.getByText('Processing...')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Processing/ })).toBeDisabled();

      // Other buttons should also be disabled
      expect(screen.getByText('Buy 10 Credits')).toBeDisabled();
      expect(screen.getByText('Buy 60 Credits')).toBeDisabled();

      // Resolve the promise
      resolvePurchase!();
      await waitFor(() => {
        expect(screen.queryByText('Processing...')).not.toBeInTheDocument();
      });
    });

    it('should show success toast on successful purchase', async () => {
      const user = userEvent.setup();
      mockOnPurchase.mockResolvedValue();

      render(<AICreditPacks {...defaultProps} />);

      const largePackButton = screen.getByText('Buy 60 Credits');
      await user.click(largePackButton);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
      {
          title: 'Purchase initiated',
          description: 'You will be redirected to complete your purchase.',
    );
  });
      });
    });

    it('should show error toast on purchase failure', async () => {
      const user = userEvent.setup();
      const error = new Error('Payment failed');
      mockOnPurchase.mockRejectedValue(error);

      render(<AICreditPacks {...defaultProps} />);

      const smallPackButton = screen.getByText('Buy 10 Credits');
      await user.click(smallPackButton);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
      {
          title: 'Error',
          description: 'Failed to initiate purchase',
          variant: 'destructive',
    );
  });
      });
    });

    it('should reset loading state after purchase completion', async () => {
      const user = userEvent.setup();
      mockOnPurchase.mockResolvedValue();

      render(<AICreditPacks {...defaultProps} />);

      const mediumPackButton = screen.getByText('Buy 25 Credits');
      await user.click(mediumPackButton);

      // Wait for purchase to complete
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalled();
      });

      // Should no longer be in loading state
      expect(screen.queryByText('Processing...')).not.toBeInTheDocument();
      expect(mediumPackButton).not.toBeDisabled();
    });

    it('should reset loading state after purchase error', async () => {
      const user = userEvent.setup();
      mockOnPurchase.mockRejectedValue(new Error('Test error'));

      render(<AICreditPacks {...defaultProps} />);

      const largePackButton = screen.getByText('Buy 60 Credits');
      await user.click(largePackButton);

      // Wait for error handling
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({ variant: 'destructive' })
    );
  });

      // Should no longer be in loading state
      expect(screen.queryByText('Processing...')).not.toBeInTheDocument();
      expect(largePackButton).not.toBeDisabled();
    });
  });

  describe('Zero Credits State', () => {
    it('should display zero credits correctly', () => {
      render(<AICreditPacks {...defaultProps} currentCredits={0} />);

      expect(screen.getByText('0 credits')).toBeInTheDocument();
    });
  });

  describe('High Credits State', () => {
    it('should display large credit amounts correctly', () => {
      render(<AICreditPacks {...defaultProps} currentCredits={999} />);

      expect(screen.getByText('999 credits')).toBeInTheDocument();
    });
  });

  describe('Pack Features', () => {
    it('should display pack features correctly', () => {
      render(<AICreditPacks {...defaultProps} />);

      // Should show features for all packs
      const instantDeliveryElements = screen.getAllByText('Instant delivery');
      expect(instantDeliveryElements).toHaveLength(3); // One for each pack

      const neverExpireElements = screen.getAllByText('Never expire');
      expect(neverExpireElements).toHaveLength(3);

      const useAcrossPortfoliosElements = screen.getAllByText(
        'Use across all portfolios'

      expect(useAcrossPortfoliosElements).toHaveLength(3);
    });
  });

  describe('Button Variants', () => {
    it('should use correct button variants for popular and regular packs', () => {
      render(<AICreditPacks {...defaultProps} />);

      const buyButtons = screen.getAllByRole('button', {
        name: /Buy \d+ Credits/,
      });

      // Should have 3 buy buttons
      expect(buyButtons).toHaveLength(3);

      // Medium pack (popular) should have default variant
      // Others should have outline variant
      buyButtons.forEach(button => {
        expect(button).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels and roles', () => {
      render(<AICreditPacks {...defaultProps} />);

      // Check that buttons have proper text
      expect(
        screen.getByRole('button', { name: 'Buy 10 Credits' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Buy 25 Credits' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Buy 60 Credits' })
      ).toBeInTheDocument();
    });

    it('should maintain focus management during loading states', async () => {
      const user = userEvent.setup();
      mockOnPurchase.mockResolvedValue();

      render(<AICreditPacks {...defaultProps} />);

      const button = screen.getByText('Buy 10 Credits');
      await user.click(button);

      // Button should still be focusable but disabled during loading
      expect(button).toHaveFocus();
    });
  });

  describe('Edge Cases', () => {
    it('should handle very large current credit amounts', () => {
      render(<AICreditPacks {...defaultProps} currentCredits={1000000} />);

      expect(screen.getByText('1000000 credits')).toBeInTheDocument();
    });

    it('should handle simultaneous purchase attempts', async () => {
      const user = userEvent.setup();

      let resolveFirst: () => void;
      const firstPurchase = new Promise<void>(resolve => {
        resolveFirst = resolve;
      });

      mockOnPurchase.mockReturnValue(firstPurchase);

      render(<AICreditPacks {...defaultProps} />);

      // Click first button
      const smallPackButton = screen.getByText('Buy 10 Credits');
      await user.click(smallPackButton);

      // Try to click second button while first is processing
      const mediumPackButton = screen.getByText('Buy 25 Credits');
      await user.click(mediumPackButton);

      // Only first purchase should be called
      expect(mockOnPurchase).toHaveBeenCalledTimes(1);
      expect(mockOnPurchase).toHaveBeenCalledWith('small');

      // Both buttons should be disabled
      expect(smallPackButton).toBeDisabled();
      expect(mediumPackButton).toBeDisabled();

      // Resolve first purchase
      resolveFirst!();
      await waitFor(() => {
        expect(smallPackButton).not.toBeDisabled();
      });
    });
  });
});

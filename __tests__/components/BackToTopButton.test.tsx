import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BackToTopButton from '@/components/BackToTopButton';

// Mock window.scrollTo
const scrollToMock = jest.fn();
Object.defineProperty(window, 'scrollTo', {
  value: scrollToMock,
  writable: true,
});

describe('BackToTopButton Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset scroll position
    Object.defineProperty(window, 'pageYOffset', {
      value: 0,
      writable: true,
    });
  });

  describe('Visibility', () => {
    it('should not be visible initially when at top of page', () => {
      render(<BackToTopButton />);

      const button = screen.getByRole('button', { name: 'Back to top' });
      expect(button).not.toHaveClass('visible');
    });

    it('should become visible when scrolled down more than 300px', () => {
      render(<BackToTopButton />);

      const button = screen.getByRole('button', { name: 'Back to top' });
      
      // Simulate scroll
      Object.defineProperty(window, 'pageYOffset', {
        value: 400,
        writable: true,
      });
      fireEvent.scroll(window);

      expect(button).toHaveClass('visible');
    });

    it('should hide when scrolled back to less than 300px', () => {
      render(<BackToTopButton />);

      const button = screen.getByRole('button', { name: 'Back to top' });
      
      // Scroll down first
      Object.defineProperty(window, 'pageYOffset', {
        value: 400,
        writable: true,
      });
      fireEvent.scroll(window);
      expect(button).toHaveClass('visible');

      // Scroll back up
      Object.defineProperty(window, 'pageYOffset', {
        value: 200,
        writable: true,
      });
      fireEvent.scroll(window);
      expect(button).not.toHaveClass('visible');
    });

    it('should toggle visibility at exact 300px threshold', () => {
      render(<BackToTopButton />);

      const button = screen.getByRole('button', { name: 'Back to top' });
      
      // At 300px - should not be visible
      Object.defineProperty(window, 'pageYOffset', {
        value: 300,
        writable: true,
      });
      fireEvent.scroll(window);
      expect(button).not.toHaveClass('visible');

      // At 301px - should be visible
      Object.defineProperty(window, 'pageYOffset', {
        value: 301,
        writable: true,
      });
      fireEvent.scroll(window);
      expect(button).toHaveClass('visible');
    });
  });

  describe('Functionality', () => {
    it('should scroll to top when clicked', async () => {
      const user = userEvent.setup();
      render(<BackToTopButton />);

      const button = screen.getByRole('button', { name: 'Back to top' });
      
      // Make button visible first
      Object.defineProperty(window, 'pageYOffset', {
        value: 500,
        writable: true,
      });
      fireEvent.scroll(window);

      // Click the button
      await user.click(button);

      expect(scrollToMock).toHaveBeenCalledWith({
        top: 0,
        behavior: 'smooth',
      });
      expect(scrollToMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('Event Listeners', () => {
    it('should add scroll event listener on mount', () => {
      const addEventListenerSpy = jest.spyOn(window, 'addEventListener');
      
      render(<BackToTopButton />);

      expect(addEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
    });

    it('should remove scroll event listener on unmount', () => {
      const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
      
      const { unmount } = render(<BackToTopButton />);
      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
    });
  });

  describe('Accessibility', () => {
    it('should have proper aria-label', () => {
      render(<BackToTopButton />);

      const button = screen.getByRole('button', { name: 'Back to top' });
      expect(button).toHaveAttribute('aria-label', 'Back to top');
    });

    it('should have title attribute', () => {
      render(<BackToTopButton />);

      const button = screen.getByRole('button', { name: 'Back to top' });
      expect(button).toHaveAttribute('title', 'Back to top');
    });

    it('should be keyboard accessible', async () => {
      const user = userEvent.setup();
      render(<BackToTopButton />);

      const button = screen.getByRole('button', { name: 'Back to top' });
      
      // Make button visible
      Object.defineProperty(window, 'pageYOffset', {
        value: 500,
        writable: true,
      });
      fireEvent.scroll(window);

      // Tab to button and press Enter
      await user.tab();
      expect(button).toHaveFocus();
      
      await user.keyboard('{Enter}');
      expect(scrollToMock).toHaveBeenCalled();
    });
  });

  describe('Styling', () => {
    it('should have base button class', () => {
      render(<BackToTopButton />);

      const button = screen.getByRole('button', { name: 'Back to top' });
      expect(button).toHaveClass('back-to-top-button');
    });

    it('should contain chevron up icon', () => {
      render(<BackToTopButton />);

      const button = screen.getByRole('button', { name: 'Back to top' });
      const icon = button.querySelector('svg');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveClass('w-5', 'h-5');
    });
  });

  describe('Performance', () => {
    it('should handle rapid scroll events efficiently', () => {
      render(<BackToTopButton />);

      const button = screen.getByRole('button', { name: 'Back to top' });

      // Simulate multiple rapid scroll events
      for (let i = 0; i < 10; i++) {
        Object.defineProperty(window, 'pageYOffset', {
          value: i % 2 === 0 ? 400 : 200,
          writable: true,
        });
        fireEvent.scroll(window);
      }

      // Should end in the correct state
      expect(button).not.toHaveClass('visible');
    });
  });

  describe('Edge Cases', () => {
    it('should handle scroll position of 0', () => {
      render(<BackToTopButton />);

      const button = screen.getByRole('button', { name: 'Back to top' });
      
      Object.defineProperty(window, 'pageYOffset', {
        value: 0,
        writable: true,
      });
      fireEvent.scroll(window);

      expect(button).not.toHaveClass('visible');
    });

    it('should handle very large scroll values', () => {
      render(<BackToTopButton />);

      const button = screen.getByRole('button', { name: 'Back to top' });
      
      Object.defineProperty(window, 'pageYOffset', {
        value: 999999,
        writable: true,
      });
      fireEvent.scroll(window);

      expect(button).toHaveClass('visible');
    });

    it('should handle clicking when not visible', async () => {
      const user = userEvent.setup();
      render(<BackToTopButton />);

      const button = screen.getByRole('button', { name: 'Back to top' });
      
      // Button is not visible, but still clickable
      await user.click(button);

      expect(scrollToMock).toHaveBeenCalledWith({
        top: 0,
        behavior: 'smooth',
      });
    });
  });
});
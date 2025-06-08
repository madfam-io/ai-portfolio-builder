import { render, screen } from '@testing-library/react';
import HomePage from '@/app/page';

describe('HomePage', () => {
  describe('Rendering', () => {
    it('should render the MADFAM.AI logo', () => {
      render(<HomePage />);
      const logos = screen.getAllByText((_, element) => {
        return element?.textContent === 'MADFAM.AI';
      });
      expect(logos.length).toBeGreaterThan(0);
    });

    it('should render the main headline', () => {
      render(<HomePage />);
      expect(screen.getByText('Turn Your CV Into a')).toBeInTheDocument();
      expect(screen.getByText('Stunning Portfolio')).toBeInTheDocument();
      expect(screen.getByText('in 30 Minutes')).toBeInTheDocument();
    });

    it('should render the hero description', () => {
      render(<HomePage />);
      expect(
        screen.getByText(/Import from LinkedIn, GitHub, or upload your resume/)
      ).toBeInTheDocument();
    });

    it('should render call-to-action buttons', () => {
      render(<HomePage />);
      expect(screen.getByText('Watch Demo')).toBeInTheDocument();
      expect(screen.getByText('Start Free Trial')).toBeInTheDocument();
    });

    it('should render Get Started button in header', () => {
      render(<HomePage />);
      const getStartedButtons = screen.getAllByText('Get Started');
      expect(getStartedButtons.length).toBeGreaterThan(0);
    });
  });

  describe('Styling and Layout', () => {
    it('should have correct CSS classes for responsive design', () => {
      render(<HomePage />);
      const heroSection = screen
        .getByText('Turn Your CV Into a')
        .closest('section');
      expect(heroSection).toHaveClass('pt-24', 'pb-20', 'px-6');
    });

    it('should have gradient text styling on "Stunning Portfolio"', () => {
      render(<HomePage />);
      const gradientText = screen.getByText('Stunning Portfolio');
      expect(gradientText).toHaveClass(
        'bg-gradient-to-r',
        'from-purple-600',
        'to-blue-600',
        'bg-clip-text',
        'text-transparent'
      );
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      render(<HomePage />);
      const mainHeading = screen.getByRole('heading', { level: 1 });
      expect(mainHeading).toBeInTheDocument();
    });

    it('should have interactive buttons with proper roles', () => {
      render(<HomePage />);
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(10); // Multiple buttons throughout the page
    });
  });
});

import { render, screen } from '@testing-library/react';
import HomePage from '@/app/page';
import { LanguageProvider } from '@/lib/i18n/simple-context';

describe('HomePage', () => {
  const renderWithProvider = (component: React.ReactElement) => {
    return render(<LanguageProvider>{component}</LanguageProvider>);
  };

  describe('Rendering', () => {
    it('should render the MADFAM.AI logo', () => {
      renderWithProvider(<HomePage />);
      const logos = screen.getAllByText((_, element) => {
        return element?.textContent === 'MADFAM.AI';
      });
      expect(logos.length).toBeGreaterThan(0);
    });

    it('should render the main headline', () => {
      renderWithProvider(<HomePage />);
      expect(screen.getByText('Convierte tu CV en un')).toBeInTheDocument();
      expect(screen.getByText('Portafolio Impresionante')).toBeInTheDocument();
      expect(screen.getByText('en 30 Minutos')).toBeInTheDocument();
    });

    it('should render the hero description', () => {
      renderWithProvider(<HomePage />);
      expect(
        screen.getByText(/Importa desde LinkedIn, GitHub o sube tu currículum/)
      ).toBeInTheDocument();
    });

    it('should render call-to-action buttons', () => {
      renderWithProvider(<HomePage />);
      expect(screen.getByText('Ver Demo')).toBeInTheDocument();
      expect(screen.getByText('Prueba Gratuita')).toBeInTheDocument();
    });

    it('should render Get Started button in header', () => {
      renderWithProvider(<HomePage />);
      const getStartedButtons = screen.getAllByText('Comenzar');
      expect(getStartedButtons.length).toBeGreaterThan(0);
    });
  });

  describe('Styling and Layout', () => {
    it('should have correct CSS classes for responsive design', () => {
      renderWithProvider(<HomePage />);
      const heroSection = screen
        .getByText('Convierte tu CV en un')
        .closest('section');
      expect(heroSection).toHaveClass('pt-24', 'pb-20', 'px-6');
    });

    it('should have gradient text styling on "Portafolio Impresionante"', () => {
      renderWithProvider(<HomePage />);
      const gradientText = screen.getByText('Portafolio Impresionante');
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
      renderWithProvider(<HomePage />);
      const mainHeading = screen.getByRole('heading', { level: 1 });
      expect(mainHeading).toBeInTheDocument();
    });

    it('should have interactive buttons with proper roles', () => {
      renderWithProvider(<HomePage />);
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(5); // Multiple buttons throughout the page
    });
  });
});

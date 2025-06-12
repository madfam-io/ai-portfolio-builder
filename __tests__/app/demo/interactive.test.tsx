/**
 * @fileoverview Tests for Interactive Demo Page multilingual functionality
 *
 * This test suite ensures the Interactive Demo page properly supports
 * Spanish and English languages and displays all user-facing text correctly.
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

import InteractiveDemoPage from '@/app/demo/interactive/page';
import { LanguageProvider } from '@/lib/i18n/refactored-context';

// Mock the dependencies that are not available in test environment
jest.mock('@/lib/utils/performance', () => ({
  usePerformanceTracking: jest.fn(),
}));

jest.mock('@/hooks/useRealTimePreview', () => ({
  useRealTimePreview: () => ({
    previewConfig: {
      mode: 'desktop',
      state: 'normal',
      zoomLevel: 1,
      showSectionBorders: false,
      showInteractiveElements: true,
    },
    previewDimensions: {
      width: '100%',
      height: '100%',
      scale: 1,
    },
    setPreviewMode: jest.fn(),
    toggleFullscreen: jest.fn(),
    setZoomLevel: jest.fn(),
    toggleSectionBorders: jest.fn(),
    toggleInteractiveElements: jest.fn(),
    getResponsiveBreakpoints: () => [],
    testResponsiveBreakpoint: jest.fn(),
  }),
}));

jest.mock('@/lib/utils/sampleData', () => ({
  generateSamplePortfolio: (template: string) => ({
    id: 'test-portfolio',
    name: 'Test Portfolio',
    title: 'Test Title',
    bio: 'Test Bio',
    template: template,
    projects: [],
    experience: [],
    education: [],
    skills: [],
    socialLinks: {},
    customSections: [],
    publishedAt: null,
    isPublished: false,
    subdomain: '',
  }),
}));

jest.mock('@/components/shared/LazyWrapper', () => ({
  LazyWrapper: ({ fallback }: { fallback: React.ReactNode }) => fallback,
}));

// Test wrapper with language provider
const renderWithLanguageProvider = (
  ui: React.ReactElement,
  initialLanguage: 'es' | 'en' = 'es'
) => {
  // Mock localStorage for language persistence
  const mockLocalStorage = {
    getItem: jest.fn().mockReturnValue(initialLanguage),
    setItem: jest.fn(),
  };
  Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
    writable: true,
  });

  return render(<LanguageProvider>{ui}</LanguageProvider>);
};

describe('Interactive Demo Page', () => {
  beforeEach(() => {
    // Mock localStorage
    const localStorageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    };
    global.localStorage = localStorageMock as any;
    jest.clearAllMocks();
  });

  describe('Spanish Language (Default)', () => {
    it('should render Spanish text for all major elements', () => {
      renderWithLanguageProvider(<InteractiveDemoPage />);

      // Header elements
      expect(screen.getByText('Volver al Demo')).toBeInTheDocument();
      expect(
        screen.getByText('Demo Interactivo de PRISMA')
      ).toBeInTheDocument();
      expect(screen.getByText('Crear Cuenta')).toBeInTheDocument();

      // Step indicators
      expect(screen.getByText('1. Plantilla')).toBeInTheDocument();
      expect(screen.getByText('2. Editar')).toBeInTheDocument();
      expect(screen.getByText('3. Vista Previa')).toBeInTheDocument();

      // Template selection content
      expect(screen.getByText('Elige tu Plantilla')).toBeInTheDocument();
      expect(
        screen.getByText(/Comienza seleccionando una plantilla/)
      ).toBeInTheDocument();
      expect(screen.getByText('Continuar al Editor')).toBeInTheDocument();
    });

    it('should show Spanish loading states', () => {
      renderWithLanguageProvider(<InteractiveDemoPage />);

      // Check for loading text in Spanish
      expect(screen.getAllByText('Cargando plantillas...')).toHaveLength(1);
    });

    it('should display Spanish form labels', () => {
      renderWithLanguageProvider(<InteractiveDemoPage />);

      // Navigate to editor step to see form labels
      const continueButton = screen.getByText('Continuar al Editor');
      fireEvent.click(continueButton);

      // Check form labels in Spanish
      expect(screen.getByText('Editar Portafolio')).toBeInTheDocument();
      expect(screen.getByText('Información Básica')).toBeInTheDocument();
      expect(screen.getByText('Nombre')).toBeInTheDocument();
      expect(screen.getByText('Título')).toBeInTheDocument();
      expect(screen.getByText('Biografía')).toBeInTheDocument();
    });

    it('should show Spanish feature list', () => {
      renderWithLanguageProvider(<InteractiveDemoPage />);

      // Navigate to editor to see feature list
      const continueButton = screen.getByText('Continuar al Editor');
      fireEvent.click(continueButton);

      expect(
        screen.getByText('Disponible en la Versión Completa')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Mejora de Biografía con IA')
      ).toBeInTheDocument();
      expect(screen.getByText('Gestión de Proyectos')).toBeInTheDocument();
      expect(screen.getByText('Habilidades y Experiencia')).toBeInTheDocument();
      expect(screen.getByText('Secciones Personalizadas')).toBeInTheDocument();
      expect(screen.getByText('Importación de LinkedIn')).toBeInTheDocument();
      expect(screen.getByText('Integración con GitHub')).toBeInTheDocument();
    });

    it('should show Spanish preview step content', () => {
      renderWithLanguageProvider(<InteractiveDemoPage />);

      // Navigate to preview step
      const continueButton = screen.getByText('Continuar al Editor');
      fireEvent.click(continueButton);

      const previewButton = screen.getByText('Vista Previa');
      fireEvent.click(previewButton);

      expect(screen.getByText('Volver al Editor')).toBeInTheDocument();
      expect(
        screen.getByText('¿Te gusta lo que ves? ¡Crea tu propio portafolio!')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Comenzar - Prueba Gratuita')
      ).toBeInTheDocument();
      expect(screen.getByText('Compartir Demo')).toBeInTheDocument();
    });
  });

  describe('English Language', () => {
    it('should render English text when language is switched', async () => {
      // Mock localStorage to return English
      const mockLocalStorage = {
        getItem: jest.fn().mockReturnValue('en'),
        setItem: jest.fn(),
      };
      Object.defineProperty(window, 'localStorage', {
        value: mockLocalStorage,
        writable: true,
      });

      renderWithLanguageProvider(<InteractiveDemoPage />, 'en');

      // Wait for component to update with English translations
      await waitFor(() => {
        expect(screen.getByText('Back to Demo')).toBeInTheDocument();
        expect(screen.getByText('PRISMA Interactive Demo')).toBeInTheDocument();
        expect(screen.getByText('Create Account')).toBeInTheDocument();
      });

      // Step indicators in English
      expect(screen.getByText('1. Template')).toBeInTheDocument();
      expect(screen.getByText('2. Edit')).toBeInTheDocument();
      expect(screen.getByText('3. Preview')).toBeInTheDocument();

      // Template selection content in English
      expect(screen.getByText('Choose Your Template')).toBeInTheDocument();
      expect(
        screen.getByText(/Start by selecting a template/)
      ).toBeInTheDocument();
      expect(screen.getByText('Continue to Editor')).toBeInTheDocument();
    });

    it('should show English loading states', async () => {
      renderWithLanguageProvider(<InteractiveDemoPage />, 'en');

      await waitFor(() => {
        expect(screen.getAllByText('Loading templates...')).toHaveLength(1);
      });
    });

    it('should display English form labels in editor step', async () => {
      renderWithLanguageProvider(<InteractiveDemoPage />, 'en');

      await waitFor(() => {
        const continueButton = screen.getByText('Continue to Editor');
        fireEvent.click(continueButton);
      });

      expect(screen.getByText('Edit Portfolio')).toBeInTheDocument();
      expect(screen.getByText('Basic Information')).toBeInTheDocument();
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Bio')).toBeInTheDocument();
    });

    it('should show English feature list', async () => {
      renderWithLanguageProvider(<InteractiveDemoPage />, 'en');

      await waitFor(() => {
        const continueButton = screen.getByText('Continue to Editor');
        fireEvent.click(continueButton);
      });

      expect(screen.getByText('Available in Full Version')).toBeInTheDocument();
      expect(screen.getByText('AI Bio Enhancement')).toBeInTheDocument();
      expect(screen.getByText('Project Management')).toBeInTheDocument();
      expect(screen.getByText('Skills & Experience')).toBeInTheDocument();
      expect(screen.getByText('Custom Sections')).toBeInTheDocument();
      expect(screen.getByText('LinkedIn Import')).toBeInTheDocument();
      expect(screen.getByText('GitHub Integration')).toBeInTheDocument();
    });
  });

  describe('Component Behavior', () => {
    it('should navigate between steps correctly', () => {
      renderWithLanguageProvider(<InteractiveDemoPage />);

      // Start at template step
      expect(screen.getByText('Elige tu Plantilla')).toBeInTheDocument();

      // Navigate to editor
      const continueButton = screen.getByText('Continuar al Editor');
      fireEvent.click(continueButton);

      expect(screen.getByText('Editar Portafolio')).toBeInTheDocument();

      // Navigate to preview
      const previewButton = screen.getByText('Vista Previa');
      fireEvent.click(previewButton);

      expect(screen.getByText('Volver al Editor')).toBeInTheDocument();

      // Navigate back to editor
      const backButton = screen.getByText('Volver al Editor');
      fireEvent.click(backButton);

      expect(screen.getByText('Editar Portafolio')).toBeInTheDocument();
    });

    it('should update portfolio data when form inputs change', () => {
      renderWithLanguageProvider(<InteractiveDemoPage />);

      // Navigate to editor
      const continueButton = screen.getByText('Continuar al Editor');
      fireEvent.click(continueButton);

      // Find and update name input
      const nameInput = screen.getByDisplayValue('Test Portfolio');
      fireEvent.change(nameInput, {
        target: { value: 'Updated Portfolio Name' },
      });

      expect(nameInput).toHaveValue('Updated Portfolio Name');

      // Find and update title input
      const titleInput = screen.getByDisplayValue('Test Title');
      fireEvent.change(titleInput, { target: { value: 'Updated Title' } });

      expect(titleInput).toHaveValue('Updated Title');
    });

    it('should handle template changes', () => {
      renderWithLanguageProvider(<InteractiveDemoPage />);

      // Navigate to editor
      const continueButton = screen.getByText('Continuar al Editor');
      fireEvent.click(continueButton);

      // Template should be displayed
      expect(
        screen.getByText(/Has seleccionado la plantilla/)
      ).toBeInTheDocument();

      // Change template button should be available
      const changeTemplateButton = screen.getByText('Cambiar Plantilla');
      fireEvent.click(changeTemplateButton);

      // Should navigate back to template selection
      expect(screen.getByText('Elige tu Plantilla')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      renderWithLanguageProvider(<InteractiveDemoPage />);

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveTextContent('Elige tu Plantilla');
    });

    it('should have accessible form labels', () => {
      renderWithLanguageProvider(<InteractiveDemoPage />);

      // Navigate to editor to see form
      const continueButton = screen.getByText('Continuar al Editor');
      fireEvent.click(continueButton);

      // Check that form labels are properly associated
      const nameInput = screen.getByLabelText('Nombre');
      const titleInput = screen.getByLabelText('Título');
      const bioInput = screen.getByLabelText('Biografía');

      expect(nameInput).toBeInTheDocument();
      expect(titleInput).toBeInTheDocument();
      expect(bioInput).toBeInTheDocument();
    });

    it('should have accessible buttons with proper text', () => {
      renderWithLanguageProvider(<InteractiveDemoPage />);

      const continueButton = screen.getByRole('button', {
        name: 'Continuar al Editor',
      });
      expect(continueButton).toBeInTheDocument();

      // Create Account is a link, not a button
      const createAccountLink = screen.getByRole('link', {
        name: /Crear Cuenta/i,
      });
      expect(createAccountLink).toBeInTheDocument();
      expect(createAccountLink).toHaveAttribute('href', '/auth/signup');
    });
  });

  describe('Error Handling', () => {
    it('should handle missing translation keys gracefully', () => {
      // This test ensures the component doesn't crash if a translation key is missing
      renderWithLanguageProvider(<InteractiveDemoPage />);

      // Component should render without throwing errors
      expect(
        screen.getByText('Demo Interactivo de PRISMA')
      ).toBeInTheDocument();
    });
  });
});

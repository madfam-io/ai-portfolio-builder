/**
 * Comprehensive test setup utilities for PRISMA Portfolio Builder
 *
 * This module provides all necessary mocks and utilities for testing
 * the bilingual (Spanish/English) application with proper context providers
 */

import React, { ReactNode } from 'react';
import { render as rtlRender, RenderOptions } from '@testing-library/react';
import type { Language } from '@/lib/i18n/refactored-types';

// Comprehensive mock translations covering all components
export const mockTranslations = {
  es: {
    // Common translations
    loading: 'Cargando...',
    error: 'Error',
    success: 'Éxito',
    save: 'Guardar',
    cancel: 'Cancelar',
    delete: 'Eliminar',
    edit: 'Editar',
    view: 'Ver',
    back: 'Volver',
    next: 'Siguiente',
    previous: 'Anterior',
    close: 'Cerrar',

    // Landing page translations
    heroTitle: 'Convierte tu CV en un',
    heroTitle2: 'Portafolio Profesional',
    heroTitle3: 'que Impresiona',
    heroDesc:
      'PRISMA by MADFAM utiliza inteligencia artificial para transformar tu experiencia en un portafolio deslumbrante que destaca entre la competencia.',
    poweredByAi: 'Potenciado por IA',
    startFreeTrial: 'Comenzar gratis',
    watchDemo: 'Ver demo',
    features: 'Características',
    whatPrismaDoes: 'Qué hace PRISMA',
    pricing: 'Precios',
    getStartedToday: 'Accede hoy.',

    // How it works
    howItWorksTitle: 'Del CV al portafolio en 3 simples pasos',
    step1Number: '01',
    step1Title: 'Sube tu CV',
    step1Desc:
      'Nuestro analizador impulsado por IA extrae y organiza tu información profesional automáticamente.',
    step2Number: '02',
    step2Title: 'La IA lo mejora',
    step2Desc:
      'PRISMA optimiza tu contenido, sugiere mejoras y crea descripciones impactantes que resaltan tus logros.',
    step3Number: '03',
    step3Title: 'Publica y comparte',
    step3Desc:
      'Tu portafolio está listo al instante con un enlace personalizado. Comparte y destaca profesionalmente.',
    step4Number: '04',
    step4Title: 'Listo para el mundo',
    step4Desc:
      'Tu portafolio profesional está en línea y optimizado para destacar.',

    // Features
    feature1Title: 'Análisis inteligente de CV',
    feature1Description:
      'Extrae automáticamente tu experiencia, habilidades y logros profesionales',
    feature2Title: 'Mejora con IA',
    feature2Description:
      'Optimiza descripciones y destaca tus mejores cualidades profesionales',
    feature3Title: 'Plantillas profesionales',
    feature3Description:
      'Diseños modernos adaptados a tu industria y estilo personal',
    feature4Title: 'Publicación instantánea',
    feature4Description:
      'Tu portafolio en línea con dominio personalizado en minutos',
    feature5Title: 'Optimizado para móviles',
    feature5Description: 'Se ve perfecto en cualquier dispositivo, siempre',
    feature6Title: 'SEO incluido',
    feature6Description:
      'Mejor posicionamiento en Google para que te encuentren fácilmente',

    // Templates
    templatesTitle: 'Elige tu estilo perfecto',
    templatesSubtitle: 'Plantillas profesionales diseñadas para impresionar',
    developerTemplate: 'Desarrollador',
    developerTemplateDesc: 'Perfecto para programadores y profesionales tech',
    consultantTemplate: 'Consultor',
    consultantTemplateDesc: 'Ideal para consultores y asesores profesionales',
    designerTemplate: 'Diseñador',
    designerTemplateDesc: 'Creativo y visual para diseñadores y artistas',
    viewAllTemplates: 'Ver todas las plantillas',

    // Pricing
    pricingTitle: 'Planes y precios',
    pricingSubtitle: 'Elige el plan perfecto para ti',
    freeTitle: 'Gratis',
    freePrice: '$0',
    pricePerMonth: '/mes',
    starterTitle: 'Starter',
    starterPrice: '$99',
    professionalTitle: 'Profesional',
    professionalPrice: '$299',
    choosePlan: 'Elegir plan',

    // Dashboard
    dashboardTitle: 'Panel de Control',
    welcome: 'Bienvenido',
    createPortfolio: 'Crear Portafolio',
    myPortfolios: 'Mis Portafolios',
    noPortfolios: 'No tienes portafolios aún',
    published: 'Publicado',
    draft: 'Borrador',

    // Editor
    editorTitle: 'Editor de Portafolio',
    editorSave: 'Guardar',
    editorPublish: 'Publicar',
    editorPreview: 'Vista Previa',
    editorUnpublish: 'Despublicar',
    editorSaving: 'Guardando...',
    editorPublished: 'Publicado',
    editorDraft: 'Borrador',
    editorLastSaved: 'Último guardado',

    // Auth
    signIn: 'Iniciar sesión',
    signUp: 'Registrarse',
    signOut: 'Cerrar sesión',
    email: 'Correo electrónico',
    password: 'Contraseña',
    confirmPassword: 'Confirmar contraseña',
    forgotPassword: '¿Olvidaste tu contraseña?',
    alreadyHaveAccount: '¿Ya tienes cuenta?',
    dontHaveAccount: '¿No tienes cuenta?',

    // Footer
    aboutUs: 'Acerca de',
    careers: 'Carreras',
    blog: 'Blog',
    contact: 'Contacto',
    privacyPolicy: 'Política de privacidad',
    termsOfService: 'Términos de servicio',
    copyright: '© 2024 PRISMA by MADFAM. Todos los derechos reservados.',
  },
  en: {
    // Common translations
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    view: 'View',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    close: 'Close',

    // Landing page translations
    heroTitle: 'Turn Your CV Into a',
    heroTitle2: 'Professional Portfolio',
    heroTitle3: 'That Stands Out',
    heroDesc:
      'PRISMA by MADFAM uses artificial intelligence to transform your experience into a stunning portfolio that stands out from the competition.',
    poweredByAi: 'AI-Powered',
    startFreeTrial: 'Start free',
    watchDemo: 'Watch demo',
    features: 'Features',
    whatPrismaDoes: 'What PRISMA Does',
    pricing: 'Pricing',
    getStartedToday: 'Get started today.',

    // How it works
    howItWorksTitle: 'From CV to portfolio in 3 simple steps',
    step1Number: '01',
    step1Title: 'Upload your CV',
    step1Desc:
      'Our AI-powered analyzer extracts and organizes your professional information automatically.',
    step2Number: '02',
    step2Title: 'AI enhances it',
    step2Desc:
      'PRISMA optimizes your content, suggests improvements and creates impactful descriptions that highlight your achievements.',
    step3Number: '03',
    step3Title: 'Publish and share',
    step3Desc:
      'Your portfolio is instantly ready with a custom link. Share and stand out professionally.',
    step4Number: '04',
    step4Title: 'Ready for the world',
    step4Desc:
      'Your professional portfolio is online and optimized to stand out.',

    // Features
    feature1Title: 'Smart CV Analysis',
    feature1Description:
      'Automatically extracts your experience, skills and professional achievements',
    feature2Title: 'AI Enhancement',
    feature2Description:
      'Optimizes descriptions and highlights your best professional qualities',
    feature3Title: 'Professional Templates',
    feature3Description:
      'Modern designs tailored to your industry and personal style',
    feature4Title: 'Instant Publishing',
    feature4Description: 'Your portfolio online with custom domain in minutes',
    feature5Title: 'Mobile Optimized',
    feature5Description: 'Looks perfect on any device, always',
    feature6Title: 'SEO Included',
    feature6Description: 'Better Google ranking so you can be found easily',

    // Templates
    templatesTitle: 'Choose your perfect style',
    templatesSubtitle: 'Professional templates designed to impress',
    developerTemplate: 'Developer',
    developerTemplateDesc: 'Perfect for programmers and tech professionals',
    consultantTemplate: 'Consultant',
    consultantTemplateDesc: 'Ideal for consultants and professional advisors',
    designerTemplate: 'Designer',
    designerTemplateDesc: 'Creative and visual for designers and artists',
    viewAllTemplates: 'View all templates',

    // Pricing
    pricingTitle: 'Plans and pricing',
    pricingSubtitle: 'Choose the perfect plan for you',
    freeTitle: 'Free',
    freePrice: '$0',
    pricePerMonth: '/month',
    starterTitle: 'Starter',
    starterPrice: '$9',
    professionalTitle: 'Professional',
    professionalPrice: '$29',
    choosePlan: 'Choose plan',

    // Dashboard
    dashboardTitle: 'Dashboard',
    welcome: 'Welcome',
    createPortfolio: 'Create Portfolio',
    myPortfolios: 'My Portfolios',
    noPortfolios: 'You have no portfolios yet',
    published: 'Published',
    draft: 'Draft',

    // Editor
    editorTitle: 'Portfolio Editor',
    editorSave: 'Save',
    editorPublish: 'Publish',
    editorPreview: 'Preview',
    editorUnpublish: 'Unpublish',
    editorSaving: 'Saving...',
    editorPublished: 'Published',
    editorDraft: 'Draft',
    editorLastSaved: 'Last saved',

    // Auth
    signIn: 'Sign In',
    signUp: 'Sign Up',
    signOut: 'Sign Out',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    forgotPassword: 'Forgot password?',
    alreadyHaveAccount: 'Already have an account?',
    dontHaveAccount: "Don't have an account?",

    // Footer
    aboutUs: 'About',
    careers: 'Careers',
    blog: 'Blog',
    contact: 'Contact',
    privacyPolicy: 'Privacy Policy',
    termsOfService: 'Terms of Service',
    copyright: '© 2024 PRISMA by MADFAM. All rights reserved.',
  },
};

// Mock context values
export const mockAppContextValue = {
  isDarkMode: false,
  toggleDarkMode: jest.fn(),
  isMobileMenuOpen: false,
  setMobileMenuOpen: jest.fn(),
  currency: 'MXN' as const,
  setCurrency: jest.fn(),
};

export const mockAuthContextValue = {
  user: null,
  loading: false,
  error: null,
  signIn: jest.fn(),
  signUp: jest.fn(),
  signOut: jest.fn(),
};

// Language Context Provider for tests
export const TestLanguageProvider = ({
  children,
  initialLanguage = 'es',
}: {
  children: ReactNode;
  initialLanguage?: Language;
}) => {
  const [language, setLanguage] = React.useState<Language>(initialLanguage);
  const t = mockTranslations[language];

  const value = {
    language,
    setLanguage,
    t,
    availableLanguages: [
      { code: 'es' as Language, name: 'Español', flag: '🇲🇽' },
      { code: 'en' as Language, name: 'English', flag: '🇺🇸' },
    ],
    getNamespace: () => ({}),
    isLoaded: true,
  };

  return (
    <MockLanguageContext.Provider value={value}>
      {children}
    </MockLanguageContext.Provider>
  );
};

// Create mock context
const MockLanguageContext = React.createContext<any>(null);

// Mock hook
export const useTestLanguage = () => {
  const context = React.useContext(MockLanguageContext);
  if (!context) {
    return {
      language: 'es' as Language,
      setLanguage: jest.fn(),
      t: mockTranslations.es,
      availableLanguages: [
        { code: 'es' as Language, name: 'Español', flag: '🇲🇽' },
        { code: 'en' as Language, name: 'English', flag: '🇺🇸' },
      ],
      getNamespace: () => ({}),
      isLoaded: true,
    };
  }
  return context;
};

// Complete test wrapper with all providers
export const AllProviders = ({
  children,
  initialLanguage = 'es',
}: {
  children: ReactNode;
  initialLanguage?: Language;
}) => {
  return (
    <TestLanguageProvider initialLanguage={initialLanguage}>
      {children}
    </TestLanguageProvider>
  );
};

// Custom render with all providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialLanguage?: Language;
}

export function renderWithProviders(
  ui: React.ReactElement,
  options?: CustomRenderOptions
) {
  const { initialLanguage = 'es', ...renderOptions } = options || {};

  return rtlRender(ui, {
    wrapper: ({ children }) => (
      <AllProviders initialLanguage={initialLanguage}>{children}</AllProviders>
    ),
    ...renderOptions,
  });
}

// Re-export everything from testing library
export * from '@testing-library/react';
export { renderWithProviders as render };

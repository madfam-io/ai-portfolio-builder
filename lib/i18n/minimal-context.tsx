'use client';

import { createContext, useContext, useState } from 'react';

type Language = 'es' | 'en';

const translations = {
  es: {
    features: 'Características',
    howItWorks: 'Cómo Funciona',
    templates: 'Plantillas',
    pricing: 'Precios',
    getStarted: 'Comenzar',
    heroTitle: 'Convierte tu CV en un',
    heroTitle2: 'Portafolio Impresionante',
    heroTitle3: 'en 30 Minutos',
    heroDesc: 'Importa desde LinkedIn, GitHub o sube tu currículum. Nuestra IA transforma tu experiencia en un portafolio profesional y hermoso que te ayuda a conseguir trabajo.',
    watchDemo: 'Ver Demo',
    startFreeTrial: 'Prueba Gratuita',
    featuresTitle: 'Todo lo que Necesitas para',
    featuresSubtitle: 'Nuestra plataforma impulsada por IA maneja todo, desde la creación de contenido hasta el diseño, para que puedas enfocarte en lo que importa.',
    aiContentTitle: 'Mejora de Contenido con IA',
    aiContentDesc: 'Nuestra IA reescribe tu experiencia en narrativas convincentes que destacan tu valor y logros.',
    oneClickTitle: 'Importación con Un Clic',
    oneClickDesc: 'Conecta LinkedIn, GitHub o sube tu CV. Extraemos y organizamos todo automáticamente.',
    templatesTitle: 'Plantillas Profesionales',
    templatesDesc: 'Diseños específicos por industria que se adaptan a tu contenido. No necesitas habilidades de diseño.',
    customDomainTitle: 'Dominio Personalizado',
    customDomainDesc: 'Obtén una URL profesional como tunombre.com o usa nuestro subdominio gratuito.',
    analyticsTitle: 'Panel de Analíticas',
    analyticsDesc: 'Rastrea visitantes, ve qué proyectos reciben atención y optimiza tu portafolio.',
    mobileTitle: 'Optimizado para Móviles',
    mobileDesc: 'Tu portafolio se ve perfecto en cualquier dispositivo. Edita sobre la marcha con nuestro editor móvil.',
    howItWorksTitle: 'De Cero a Portafolio en',
    howItWorksSubtitle: 'No se requieren habilidades técnicas. Nuestra IA maneja todo.',
    step1Title: 'Importa tus Datos',
    step1Desc: 'Conecta LinkedIn, GitHub o sube tu CV. Toma menos de 2 minutos.',
    step2Title: 'Mejora con IA',
    step2Desc: 'Nuestra IA reescribe tu contenido, sugiere mejoras y elige la plantilla perfecta.',
    step3Title: 'Publica y Comparte',
    step3Desc: 'Revisa, personaliza si es necesario y publica. Tu portafolio está en vivo al instante.',
    templatesSecTitle: 'Plantillas Hermosas para',
    templatesSecSubtitle: 'La IA selecciona la plantilla perfecta basada en tu industria y contenido',
    useTemplate: 'Usar Esta Plantilla',
    minimalDev: 'Desarrollador Minimalista',
    minimalDevDesc: 'Diseño limpio, enfocado en código',
    creativeDesigner: 'Diseñador Creativo',
    creativeDesignerDesc: 'Diseño visual, centrado en portafolio',
    businessPro: 'Profesional de Negocios',
    businessProDesc: 'Corporativo, enfocado en logros',
    pricingTitle: 'Precios Simples,',
    pricingSubtitle: 'Comienza gratis, actualiza cuando necesites más',
    ctaTitle: '¿Listo para Crear tu Portafolio?',
    ctaSubtitle: 'Únete a miles de profesionales que han transformado sus carreras',
    ctaButton: 'Comenzar Gratis',
    ctaFooter: 'No se requiere tarjeta de crédito • Configuración en 30 minutos',
    noCreditCard: 'No se requiere tarjeta de crédito',
    joinProfessionals: 'Únete a 10,000+ profesionales',
    rating: 'calificación 4.9/5',
    trustedBy: 'Utilizado por profesionales de',
    footerTagline: 'Constructor de portafolios impulsado por IA para profesionales modernos',
  },
  en: {
    features: 'Features',
    howItWorks: 'How it Works',
    templates: 'Templates',
    pricing: 'Pricing',
    getStarted: 'Get Started',
    heroTitle: 'Turn Your CV Into a',
    heroTitle2: 'Stunning Portfolio',
    heroTitle3: 'in 30 Minutes',
    heroDesc: 'Import from LinkedIn, GitHub, or upload your resume. Our AI transforms your experience into a beautiful, professional portfolio that gets you hired.',
    watchDemo: 'Watch Demo',
    startFreeTrial: 'Start Free Trial',
    featuresTitle: 'Everything You Need to',
    featuresSubtitle: 'Our AI-powered platform handles everything from content creation to design, so you can focus on what matters.',
    aiContentTitle: 'AI Content Enhancement',
    aiContentDesc: 'Our AI rewrites your experience into compelling narratives that highlight your value and achievements.',
    oneClickTitle: 'One-Click Import',
    oneClickDesc: 'Connect LinkedIn, GitHub, or upload your CV. We automatically extract and organize everything.',
    templatesTitle: 'Professional Templates',
    templatesDesc: 'Industry-specific designs that adapt to your content. No design skills needed.',
    customDomainTitle: 'Custom Domain',
    customDomainDesc: 'Get a professional URL like yourname.com or use our free subdomain.',
    analyticsTitle: 'Analytics Dashboard',
    analyticsDesc: 'Track visitors, see which projects get attention, and optimize your portfolio.',
    mobileTitle: 'Mobile Optimized',
    mobileDesc: 'Your portfolio looks perfect on every device. Edit on the go with our mobile editor.',
    howItWorksTitle: 'From Zero to Portfolio in',
    howItWorksSubtitle: 'No technical skills required. Our AI handles everything.',
    step1Title: 'Import Your Data',
    step1Desc: 'Connect LinkedIn, GitHub, or upload your CV. Takes less than 2 minutes.',
    step2Title: 'AI Enhancement',
    step2Desc: 'Our AI rewrites your content, suggests improvements, and picks the perfect template.',
    step3Title: 'Publish & Share',
    step3Desc: 'Review, customize if needed, and publish. Your portfolio is live instantly.',
    templatesSecTitle: 'Beautiful Templates for',
    templatesSecSubtitle: 'AI selects the perfect template based on your industry and content',
    useTemplate: 'Use This Template',
    minimalDev: 'Minimal Developer',
    minimalDevDesc: 'Clean, code-focused design',
    creativeDesigner: 'Creative Designer',
    creativeDesignerDesc: 'Visual, portfolio-centric layout',
    businessPro: 'Business Professional',
    businessProDesc: 'Corporate, achievement-focused',
    pricingTitle: 'Simple Pricing,',
    pricingSubtitle: 'Start free, upgrade when you need more',
    ctaTitle: 'Ready to Build Your Portfolio?',
    ctaSubtitle: 'Join thousands of professionals who have transformed their careers',
    ctaButton: 'Get Started Free',
    ctaFooter: 'No credit card required • Setup in 30 minutes',
    noCreditCard: 'No credit card required',
    joinProfessionals: 'Join 10,000+ professionals',
    rating: '4.9/5 rating',
    trustedBy: 'Trusted by professionals from',
    footerTagline: 'AI-powered portfolio builder for modern professionals',
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations.es;
  availableLanguages: { code: Language; name: string; flag: string }[];
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    return {
      language: 'es' as Language,
      setLanguage: () => {},
      t: translations.es,
      availableLanguages: [
        { code: 'es' as Language, name: 'Español', flag: '🇪🇸' },
        { code: 'en' as Language, name: 'English', flag: '🇺🇸' },
      ],
    };
  }
  return context;
};

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguage] = useState<Language>('es');

  const availableLanguages = [
    { code: 'es' as Language, name: 'Español', flag: '🇪🇸' },
    { code: 'en' as Language, name: 'English', flag: '🇺🇸' },
  ];

  const value: LanguageContextType = {
    language,
    setLanguage,
    t: translations[language],
    availableLanguages,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
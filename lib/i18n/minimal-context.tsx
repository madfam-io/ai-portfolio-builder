/**
 * @fileoverview Internationalization (i18n) system for MADFAM AI Portfolio Builder
 * 
 * This module provides a complete multilingual system supporting Spanish (default) and English.
 * It manages language state, translations, and localStorage persistence for user preferences.
 * 
 * Key Features:
 * - Automatic language detection based on user's geographic location
 * - Spanish as default for Spanish-speaking countries (primary market)
 * - English as default for English-speaking countries (international expansion)
 * - Complete translation coverage for all user-facing content
 * - Automatic localStorage persistence of language preference
 * - TypeScript-safe translation keys with autocomplete
 * - React Context for global state management
 * 
 * Usage:
 * ```tsx
 * import { useLanguage } from '@/lib/i18n/minimal-context';
 * 
 * export default function MyComponent() {
 *   const { t, language, setLanguage, detectedCountry } = useLanguage();
 *   
 *   return (
 *     <div>
 *       <h1>{t.heroTitle}</h1>
 *       <button onClick={() => setLanguage('en')}>
 *         Switch to English {detectedCountry?.flag}
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 * 
 * @author MADFAM Development Team
 * @version 3.0.0 - Geolocation-based language detection
 */

'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { detectUserLanguage, detectUserLanguageSync, type LanguageDetectionResult } from '@/lib/utils/geolocation';

/**
 * Supported languages in the application
 * - 'es': Spanish (default for MADFAM's Mexican market focus)
 * - 'en': English (secondary language for international users)
 */
type Language = 'es' | 'en';

/**
 * Complete translation dictionary for all supported languages
 * 
 * Structure:
 * - Each key represents a UI element or content piece
 * - Keys are organized by section (hero, features, pricing, etc.)
 * - All translations must be provided for both Spanish and English
 * 
 * Translation Key Naming Convention:
 * - sectionName + ElementType: heroTitle, featuresSubtitle
 * - actionName: getStarted, startFreeTrial
 * - descriptive: powerfulFeatures, mostPopular
 * 
 * Guidelines:
 * - Spanish text should be natural and culturally appropriate for Mexico
 * - English text should be clear and professional for international audience
 * - Keep translation parity - same meaning in both languages
 * - Use concise, action-oriented language for buttons and CTAs
 */
const translations = {
  /**
   * Spanish translations (Default Language)
   * Target audience: Mexican and Latin American professionals
   */
  es: {
    features: 'Características',
    howItWorks: 'Cómo Funciona',
    templates: 'Plantillas',
    pricing: 'Precios',
    getStarted: 'Empezar Gratis',
    heroTitle: 'Tu portafolio, elevado por IA.',
    heroTitle2: 'Conecta tus perfiles. Mejora tu historia.',
    heroTitle3: 'Publica en minutos.',
    heroDesc: 'Presenta tu talento con estilo profesional, sin escribir una línea de código. Conecta tu LinkedIn, GitHub o CV y lanza tu portafolio con inteligencia artificial.',
    watchDemo: 'Ver Demo',
    startFreeTrial: 'Prueba Gratuita',
    featuresTitle: 'Qué hace PRISMA',
    featuresSubtitle: 'Hecho para profesionales que saben que su presencia digital importa.',
    aiContentTitle: 'IA que entiende tu perfil',
    aiContentDesc: 'Reescribe tu biografía y tus proyectos con claridad y persuasión.',
    oneClickTitle: 'Conexión inteligente',
    oneClickDesc: 'Importa datos desde LinkedIn, GitHub y otros formatos con un clic.',
    templatesTitle: 'Diseños que impactan',
    templatesDesc: 'Plantillas profesionales listas para destacar en cualquier dispositivo.',
    customDomainTitle: 'Subdominio o dominio propio',
    customDomainDesc: 'Hazlo tuyo. Usa un subdominio de PRISMA o conecta tu marca personal.',
    analyticsTitle: 'Publica en 30 minutos',
    analyticsDesc: 'Desde tu CV o LinkedIn hasta un sitio web funcional en menos de media hora.',
    mobileTitle: 'Para quien es PRISMA',
    mobileDesc: 'Freelancers, desarrolladores, consultores y creativos que quieren impresionar.',
    howItWorksTitle: 'Cómo Funciona PRISMA',
    howItWorksSubtitle: '4 pasos simples para transformar tu presencia profesional',
    step1Title: '1. Sube tu CV / conecta tu perfil',
    step1Desc: 'LinkedIn, GitHub o cualquier formato. Toma menos de 2 minutos.',
    step2Title: '2. IA analiza y mejora tu contenido',
    step2Desc: 'Reescribe automáticamente tu experiencia con claridad y impacto.',
    step3Title: '3. Elige diseño y colores',
    step3Desc: 'Plantillas profesionales que se adaptan a tu industria y estilo.',
    step4Title: '4. Publica y comparte tu portafolio',
    step4Desc: 'Tu sitio profesional está listo para impresionar en minutos.',
    templatesSecTitle: 'Para Cada Profesional',
    templatesSecSubtitle: 'Diseños específicos que hablan el idioma de tu industria',
    useTemplate: 'Ver Ejemplo',
    minimalDev: 'Desarrolladores',
    minimalDevDesc: 'Haz que tu GitHub hable por ti',
    creativeDesigner: 'Freelancers Creativos', 
    creativeDesignerDesc: 'De Behance a tu sitio personal en minutos',
    businessPro: 'Consultores y Coaches',
    businessProDesc: 'Deja de mandar PDFs. Envíales tu PRISMA',
    educatorSpeaker: 'Educadores y Speakers',
    educatorSpeakerDesc: 'Tu expertise merece ser proyectado con elegancia',
    pricingTitle: 'Accede hoy.',
    pricingSubtitle: 'Impresiona mañana.',
    ctaTitle: 'Tu talento merece ser visto.',
    ctaSubtitle: 'Con PRISMA, se proyecta.',
    ctaButton: 'Crear mi portafolio ahora',
    ctaFooter: 'Te lo prometemos: si no te impresiona, no pagas.',
    noCreditCard: 'No se requiere tarjeta de crédito',
    joinProfessionals: 'Únete a 10,000+ profesionales',
    rating: 'calificación 4.9/5',
    trustedBy: 'Utilizado por profesionales de',
    footerTagline: 'PRISMA - Constructor de portafolios impulsado por IA para profesionales modernos',
    
    // Pricing section
    powerfulFeatures: 'Características Poderosas',
    planFree: 'Gratis',
    planPro: 'PRO',
    planBusiness: 'PRISMA+',
    mostPopular: 'MÁS POPULAR',
    perMonth: '/mes',
    pricingProMx: 'MX$149',
    pricingBusinessMx: 'MX$399',
    portfolio1: '1 portafolio',
    basicTemplates: 'Plantillas básicas',
    madfamSubdomain: 'Subdominio PRISMA',
    publishIn30: 'Publicación en 30 min',
    publishIn15: '⚡ 15 minutos',
    basicAi: 'IA básica',
    advancedAi: '✅ Avanzada',
    betaFeatures: '🕓 Versión beta incluye funciones PRO por tiempo limitado',
    aiRewrites3: '3 reescrituras IA/mes',
    portfolios3: '3 portafolios',
    allTemplates: 'Todas las plantillas',
    customDomain: 'Dominio personalizado',
    unlimitedAiRewrites: 'Reescrituras IA ilimitadas',
    analyticsTools: 'Analíticas y herramientas SEO',
    unlimitedPortfolios: 'Portafolios ilimitados',
    whiteLabelOption: 'Opción marca blanca',
    apiAccess: 'Acceso API',
    teamCollaboration: 'Colaboración en equipo',
    prioritySupport: 'Soporte prioritario',
    startFree: 'Comenzar Gratis',
    startProTrial: 'Prueba Pro',
    contactSales: 'Contactar Ventas',
    
    // How it works
    simpleSteps: '3 Pasos Simples',
    
    // Back to top
    backToTop: 'Volver arriba',
    
    // Footer
    footerProduct: 'Producto',
    footerCompany: 'Empresa',
    footerFeatures: 'Características',
    footerTemplates: 'Plantillas',
    footerPricing: 'Precios',
    footerApi: 'API',
    footerAbout: 'Acerca de',
    footerBlog: 'Blog',
    footerCareers: 'Empleos',
    footerContact: 'Contacto',
    footerLegal: 'Legal',
    footerPrivacy: 'Privacidad',
    footerTerms: 'Términos',
    footerGdpr: 'GDPR',
    footerCopyright: '© 2025 PRISMA by MADFAM. Todos los derechos reservados.',
    
    // Hero section
    poweredByAi: 'Impulsado por GPT-4 & Claude AI',
    learnMoreAboutUs: 'Conoce más sobre nosotros',
    
    // Features section
    standOut: 'Destacar',
    
    // Templates section  
    everyProfessional: 'Cada Profesional',
    
    // Header tooltips
    switchCurrency: 'Cambiar moneda',
    current: 'actual',
    switchTo: 'Cambiar a',
    
    // Dashboard Page
    myPortfolios: 'Mis Portafolios',
    managePortfolios: 'Gestiona y crea tus portafolios profesionales',
    createNewPortfolio: 'Crear Nuevo Portafolio',
    totalPortfolios: 'Total de Portafolios',
    published: 'Publicados',
    totalViews: 'Vistas Totales',
    yourPortfolios: 'Tus Portafolios',
    portfolioName1: 'Mi Portafolio Profesional',
    portfolioName2: 'Portafolio Creativo',
    statusPublished: 'Publicado',
    statusDraft: 'Borrador',
    lastModified: 'Modificado',
    daysAgo: 'hace',
    weekAgo: 'hace 1 semana',
    views: 'vistas',
    noPortfoliosYet: 'Aún no tienes portafolios',
    createFirstPortfolio: 'Crea tu primer portafolio para comenzar',
    createPortfolio: 'Crear Portafolio',
    
    // About Page
    aboutTitle: 'Acerca de PRISMA',
    aboutSubtitle: 'Estamos en una misión de democratizar la creación de portafolios profesionales usando el poder de la inteligencia artificial.',
    ourMission: 'Nuestra Misión',
    missionText1: 'Todo profesional merece un portafolio impresionante que muestre sus habilidades y logros. La creación tradicional de portafolios consume tiempo, es costosa y a menudo requiere experiencia en diseño que no todos tienen. Creemos que la IA puede cambiar eso.',
    missionText2: 'PRISMA transforma tu información profesional existente en hermosos portafolios personalizados en menos de 30 minutos. Ya seas desarrollador, diseñador, consultor o profesional creativo, facilitamos presentar tu mejor trabajo al mundo.',
    trustedWorldwide: 'Confianza de Profesionales a Nivel Mundial',
    portfoliosCreated: 'Portafolios Creados',
    companiesHiring: 'Empresas Contratando',
    userSatisfaction: 'Satisfacción del Usuario',
    supportAvailable: 'Soporte Disponible',
    meetOurTeam: 'Conoce Nuestro Equipo',
    teamSubtitle: 'Profesionales apasionados construyendo el futuro de la creación de portafolios',
    alexJohnson: 'Alex Johnson',
    ceoCfounder: 'CEO y Fundador',
    alexBio: 'Ex líder técnico en Google con más de 10 años en IA y desarrollo de productos.',
    sarahChen: 'Sarah Chen',
    headOfDesign: 'Jefa de Diseño',
    sarahBio: 'Diseñadora galardonada que ha trabajado con empresas Fortune 500.',
    marcusRodriguez: 'Marcus Rodriguez',
    leadEngineer: 'Ingeniero Principal',
    marcusBio: 'Ingeniero full-stack apasionado por crear hermosas experiencias de usuario.',
    ourValues: 'Nuestros Valores',
    excellence: 'Excelencia',
    excellenceText: 'Nos esforzamos por la perfección en cada portafolio que ayudamos a crear, asegurando calidad que destaque.',
    accessibility: 'Accesibilidad',
    accessibilityText: 'La creación de portafolios profesionales debería estar disponible para todos, independientemente de las habilidades técnicas.',
    empowerment: 'Empoderamiento',
    empowermentText: 'Creemos en empoderar a los profesionales para mostrar sus talentos y logros únicos.',
    readyToCreate: '¿Listo para Crear tu Portafolio?',
    readySubtitle: 'Únete a miles de profesionales que ya han transformado sus carreras con hermosos portafolios impulsados por IA.',
    getStartedToday: 'Comenzar Hoy',
    
    // Editor Page
    backToDashboard: 'Volver al Panel',
    portfolioName: 'Nombre del Portafolio',
    preview: 'Vista Previa',
    save: 'Guardar',
    portfolioBuilder: 'Constructor de Portafolios',
    chooseTemplate: 'Elegir Plantilla',
    templateModern: 'Moderno',
    modernDesc: 'Diseño limpio y minimalista',
    templateCreative: 'Creativo',
    creativeDesc: 'Diseño audaz y artístico',
    templateProfessional: 'Profesional',
    professionalDesc: 'Estilo corporativo',
    contentSections: 'Secciones de Contenido',
    about: 'Acerca de',
    projects: 'Proyectos',
    experience: 'Experiencia',
    addSection: 'Agregar Sección',
    importData: 'Importar Datos',
    linkedinProfile: 'Perfil de LinkedIn',
    importProfessionalInfo: 'Importa tu información profesional',
    githubProjects: 'Proyectos de GitHub',
    addRepositories: 'Agrega tus repositorios',
    uploadCvResume: 'Subir CV/Currículum',
    extractFromPdf: 'Extraer desde PDF',
    portfolioPreview: 'Vista Previa del Portafolio',
    portfolioAppearHere: 'Tu portafolio aparecerá aquí mientras lo construyes',
    addFirstSection: 'Agregar tu Primera Sección',
    
    // Authentication
    signIn: 'Iniciar Sesión',
    signUp: 'Crear Cuenta',
    signOut: 'Cerrar Sesión',
    email: 'Correo electrónico',
    password: 'Contraseña',
    fullName: 'Nombre completo',
    forgotPassword: '¿Olvidaste tu contraseña?',
    resetPassword: 'Restablecer Contraseña',
    sendResetLink: 'Enviar Enlace',
    backToSignIn: 'Volver a Iniciar Sesión',
    orContinueWith: 'O continúa con',
    orSignUpWith: 'O regístrate con',
    createNewAccount: 'crea una cuenta nueva',
    signInToAccount: 'inicia sesión con tu cuenta existente',
    signingIn: 'Iniciando sesión...',
    creatingAccount: 'Creando cuenta...',
    accountCreated: '¡Cuenta Creada!',
    confirmEmailSent: 'Hemos enviado un enlace de confirmación a tu correo electrónico.',
    checkInboxMessage: 'Por favor revisa tu bandeja de entrada y haz clic en el enlace para activar tu cuenta.',
    emailSent: '¡Correo Enviado!',
    resetEmailSent: 'Hemos enviado un enlace para restablecer tu contraseña a tu correo electrónico.',
    checkInboxReset: 'Por favor revisa tu bandeja de entrada y haz clic en el enlace para restablecer tu contraseña.',
    resetPasswordMessage: 'Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.',
    passwordMinLength: 'Contraseña (mín. 12 caracteres con mayús., minús., números y símbolos)',
    goToSignIn: 'Ir a Iniciar Sesión',
    hello: 'Hola',
    loadingDashboard: 'Cargando tu panel...',
    sending: 'Enviando...',
    or: 'O',
    
    // Profile Management
    myProfile: 'Mi Perfil',
    profileInformation: 'Información del Perfil',
    changePassword: 'Cambiar Contraseña',
    personalInformation: 'Información Personal',
    bio: 'Biografía',
    company: 'Empresa',
    role: 'Cargo',
    socialLinks: 'Enlaces Sociales',
    website: 'Sitio Web',
    saveChanges: 'Guardar Cambios',
    saving: 'Guardando...',
    profileUpdated: 'Perfil actualizado exitosamente',
    newPassword: 'Nueva Contraseña',
    confirmNewPassword: 'Confirmar Nueva Contraseña',
    updatePassword: 'Actualizar Contraseña',
    updating: 'Actualizando...',
    passwordUpdated: 'Contraseña actualizada exitosamente',
    passwordsDoNotMatch: 'Las contraseñas no coinciden',
    passwordMinLength8: 'La contraseña debe tener al menos 8 caracteres',
    emailCannotBeChanged: 'El correo electrónico no se puede cambiar',
    tellUsAboutYourself: 'Cuéntanos sobre ti...',
    loadingProfile: 'Cargando perfil...',
    
    // Testimonials
    testimonial1: 'Con PRISMA mi perfil pasó de básico a impresionante. Ya tuve tres entrevistas en una semana.',
    testimonial1Author: 'Ana María F., UX Designer',
    testimonial2: 'Dejé de mandar mi CV en PDF. Ahora sólo envío mi link de PRISMA.',
    testimonial2Author: 'Diego A., Consultor independiente',
    testimonialsTitle: 'Lo que dicen nuestros usuarios',
    
    // Trust signals
    gdprCompliant: '✔ GDPR & cifrado',
    dataPrivacy: '✔ No compartimos ni revendemos tu información',
    madeInMexico: '✔ Hecho en 🇲🇽 para el mundo',
  },
  en: {
    features: 'Features',
    howItWorks: 'How it Works',
    templates: 'Templates',
    pricing: 'Pricing',
    getStarted: 'Start Free',
    heroTitle: 'Your portfolio, elevated by AI.',
    heroTitle2: 'Connect your profiles. Enhance your story.',
    heroTitle3: 'Publish in minutes.',
    heroDesc: 'Showcase your talent with professional style, without writing a line of code. Connect your LinkedIn, GitHub or CV and launch your portfolio with artificial intelligence.',
    watchDemo: 'Watch Demo',
    startFreeTrial: 'Start Free Trial',
    featuresTitle: 'What PRISMA does',
    featuresSubtitle: 'Built for professionals who know their digital presence matters.',
    aiContentTitle: 'AI that understands your profile',
    aiContentDesc: 'Rewrites your bio and projects with clarity and persuasion.',
    oneClickTitle: 'Smart connection',
    oneClickDesc: 'Import data from LinkedIn, GitHub and other formats with one click.',
    templatesTitle: 'Designs that impact',
    templatesDesc: 'Professional templates ready to stand out on any device.',
    customDomainTitle: 'Subdomain or own domain',
    customDomainDesc: 'Make it yours. Use a PRISMA subdomain or connect your personal brand.',
    analyticsTitle: 'Publish in 30 minutes',
    analyticsDesc: 'From your CV or LinkedIn to a functional website in less than half an hour.',
    mobileTitle: 'Who PRISMA is for',
    mobileDesc: 'Freelancers, developers, consultants and creatives who want to impress.',
    howItWorksTitle: 'How PRISMA Works',
    howItWorksSubtitle: '4 simple steps to transform your professional presence',
    step1Title: '1. Upload your CV / connect your profile',
    step1Desc: 'LinkedIn, GitHub or any format. Takes less than 2 minutes.',
    step2Title: '2. AI analyzes and improves your content',
    step2Desc: 'Automatically rewrites your experience with clarity and impact.',
    step3Title: '3. Choose design and colors',
    step3Desc: 'Professional templates that adapt to your industry and style.',
    step4Title: '4. Publish and share your portfolio',
    step4Desc: 'Your professional site is ready to impress in minutes.',
    templatesSecTitle: 'For Every Professional',
    templatesSecSubtitle: 'Specific designs that speak your industry language',
    useTemplate: 'See Example',
    minimalDev: 'Developers',
    minimalDevDesc: 'Make your GitHub speak for you',
    creativeDesigner: 'Creative Freelancers',
    creativeDesignerDesc: 'From Behance to your personal site in minutes',
    businessPro: 'Consultants and Coaches',
    businessProDesc: 'Stop sending PDFs. Send them your PRISMA',
    educatorSpeaker: 'Educators and Speakers',
    educatorSpeakerDesc: 'Your expertise deserves to be projected with elegance',
    pricingTitle: 'Access today.',
    pricingSubtitle: 'Impress tomorrow.',
    ctaTitle: 'Your talent deserves to be seen.',
    ctaSubtitle: 'With PRISMA, it projects.',
    ctaButton: 'Create my portfolio now',
    ctaFooter: 'We promise: if it doesn\'t impress you, you don\'t pay.',
    noCreditCard: 'No credit card required',
    joinProfessionals: 'Join 10,000+ professionals',
    rating: '4.9/5 rating',
    trustedBy: 'Trusted by professionals from',
    footerTagline: 'PRISMA - AI-powered portfolio builder for modern professionals',
    
    // Pricing section
    powerfulFeatures: 'Powerful Features',
    planFree: 'Free',
    planPro: 'PRO',
    planBusiness: 'PRISMA+',
    mostPopular: 'MOST POPULAR',
    perMonth: '/month',
    pricingProMx: '$19',
    pricingBusinessMx: '$49',
    portfolio1: '1 portfolio',
    basicTemplates: 'Basic templates',
    madfamSubdomain: 'PRISMA subdomain',
    publishIn30: 'Publish in 30 min',
    publishIn15: '⚡ 15 minutes',
    basicAi: 'Basic AI',
    advancedAi: '✅ Advanced',
    betaFeatures: '🕓 Beta version includes PRO features for limited time',
    aiRewrites3: '3 AI rewrites/month',
    portfolios3: '3 portfolios',
    allTemplates: 'All templates',
    customDomain: 'Custom domain',
    unlimitedAiRewrites: 'Unlimited AI rewrites',
    analyticsTools: 'Analytics & SEO tools',
    unlimitedPortfolios: 'Unlimited portfolios',
    whiteLabelOption: 'White-label option',
    apiAccess: 'API access',
    teamCollaboration: 'Team collaboration',
    prioritySupport: 'Priority support',
    startFree: 'Start Free',
    startProTrial: 'Start Pro Trial',
    contactSales: 'Contact Sales',
    
    // How it works
    simpleSteps: '3 Simple Steps',
    
    // Back to top
    backToTop: 'Back to top',
    
    // Footer
    footerProduct: 'Product',
    footerCompany: 'Company',
    footerFeatures: 'Features',
    footerTemplates: 'Templates',
    footerPricing: 'Pricing',
    footerApi: 'API',
    footerAbout: 'About',
    footerBlog: 'Blog',
    footerCareers: 'Careers',
    footerContact: 'Contact',
    footerLegal: 'Legal',
    footerPrivacy: 'Privacy',
    footerTerms: 'Terms',
    footerGdpr: 'GDPR',
    footerCopyright: '© 2025 PRISMA by MADFAM. All rights reserved.',
    
    // Hero section
    poweredByAi: 'Powered by GPT-4 & Claude AI',
    learnMoreAboutUs: 'Learn more about us',
    
    // Features section
    standOut: 'Stand Out',
    
    // Templates section  
    everyProfessional: 'Every Professional',
    
    // Header tooltips
    switchCurrency: 'Switch currency',
    current: 'current',
    switchTo: 'Switch to',
    
    // Dashboard Page
    myPortfolios: 'My Portfolios',
    managePortfolios: 'Manage and create your professional portfolios',
    createNewPortfolio: 'Create New Portfolio',
    totalPortfolios: 'Total Portfolios',
    published: 'Published',
    totalViews: 'Total Views',
    yourPortfolios: 'Your Portfolios',
    portfolioName1: 'My Professional Portfolio',
    portfolioName2: 'Creative Portfolio',
    statusPublished: 'Published',
    statusDraft: 'Draft',
    lastModified: 'Modified',
    daysAgo: 'days ago',
    weekAgo: '1 week ago',
    views: 'views',
    noPortfoliosYet: 'No portfolios yet',
    createFirstPortfolio: 'Create your first portfolio to get started',
    createPortfolio: 'Create Portfolio',
    
    // About Page
    aboutTitle: 'About PRISMA',
    aboutSubtitle: 'We\'re on a mission to democratize professional portfolio creation using the power of artificial intelligence.',
    ourMission: 'Our Mission',
    missionText1: 'Every professional deserves a stunning portfolio that showcases their skills and achievements. Traditional portfolio creation is time-consuming, expensive, and often requires design expertise that not everyone has. We believe AI can change that.',
    missionText2: 'PRISMA transforms your existing professional information into beautiful, personalized portfolios in under 30 minutes. Whether you\'re a developer, designer, consultant, or creative professional, we make it easy to present your best work to the world.',
    trustedWorldwide: 'Trusted by Professionals Worldwide',
    portfoliosCreated: 'Portfolios Created',
    companiesHiring: 'Companies Hiring',
    userSatisfaction: 'User Satisfaction',
    supportAvailable: 'Support Available',
    meetOurTeam: 'Meet Our Team',
    teamSubtitle: 'Passionate professionals building the future of portfolio creation',
    alexJohnson: 'Alex Johnson',
    ceoCfounder: 'CEO & Founder',
    alexBio: 'Former tech lead at Google with 10+ years in AI and product development.',
    sarahChen: 'Sarah Chen',
    headOfDesign: 'Head of Design',
    sarahBio: 'Award-winning designer who has worked with Fortune 500 companies.',
    marcusRodriguez: 'Marcus Rodriguez',
    leadEngineer: 'Lead Engineer',
    marcusBio: 'Full-stack engineer passionate about creating beautiful user experiences.',
    ourValues: 'Our Values',
    excellence: 'Excellence',
    excellenceText: 'We strive for perfection in every portfolio we help create, ensuring quality that stands out.',
    accessibility: 'Accessibility',
    accessibilityText: 'Professional portfolio creation should be available to everyone, regardless of technical skill.',
    empowerment: 'Empowerment',
    empowermentText: 'We believe in empowering professionals to showcase their unique talents and achievements.',
    readyToCreate: 'Ready to Create Your Portfolio?',
    readySubtitle: 'Join thousands of professionals who have already transformed their careers with beautiful, AI-powered portfolios.',
    getStartedToday: 'Get Started Today',
    
    // Editor Page
    backToDashboard: 'Back to Dashboard',
    portfolioName: 'Portfolio Name',
    preview: 'Preview',
    save: 'Save',
    portfolioBuilder: 'Portfolio Builder',
    chooseTemplate: 'Choose Template',
    templateModern: 'Modern',
    modernDesc: 'Clean and minimalist design',
    templateCreative: 'Creative',
    creativeDesc: 'Bold and artistic layout',
    templateProfessional: 'Professional',
    professionalDesc: 'Corporate style',
    contentSections: 'Content Sections',
    about: 'About',
    projects: 'Projects',
    experience: 'Experience',
    addSection: 'Add Section',
    importData: 'Import Data',
    linkedinProfile: 'LinkedIn Profile',
    importProfessionalInfo: 'Import your professional info',
    githubProjects: 'GitHub Projects',
    addRepositories: 'Add your repositories',
    uploadCvResume: 'Upload CV/Resume',
    extractFromPdf: 'Extract from PDF',
    portfolioPreview: 'Portfolio Preview',
    portfolioAppearHere: 'Your portfolio will appear here as you build it',
    addFirstSection: 'Add Your First Section',
    
    // Authentication
    signIn: 'Sign In',
    signUp: 'Create Account',
    signOut: 'Sign Out',
    email: 'Email address',
    password: 'Password',
    fullName: 'Full name',
    forgotPassword: 'Forgot your password?',
    resetPassword: 'Reset Password',
    sendResetLink: 'Send Reset Link',
    backToSignIn: 'Back to Sign In',
    orContinueWith: 'Or continue with',
    orSignUpWith: 'Or sign up with',
    createNewAccount: 'create a new account',
    signInToAccount: 'sign in to your existing account',
    signingIn: 'Signing in...',
    creatingAccount: 'Creating account...',
    accountCreated: 'Account Created!',
    confirmEmailSent: 'We sent a confirmation link to your email address.',
    checkInboxMessage: 'Please check your inbox and click the link to activate your account.',
    emailSent: 'Email Sent!',
    resetEmailSent: 'We sent a password reset link to your email address.',
    checkInboxReset: 'Please check your inbox and click the link to reset your password.',
    resetPasswordMessage: 'Enter your email address and we\'ll send you a link to reset your password.',
    passwordMinLength: 'Password (min. 12 chars with upper, lower, numbers & symbols)',
    goToSignIn: 'Go to Sign In',
    hello: 'Hello',
    loadingDashboard: 'Loading your dashboard...',
    sending: 'Sending...',
    or: 'Or',
    
    // Profile Management
    myProfile: 'My Profile',
    profileInformation: 'Profile Information',
    changePassword: 'Change Password',
    personalInformation: 'Personal Information',
    bio: 'Bio',
    company: 'Company',
    role: 'Role',
    socialLinks: 'Social Links',
    website: 'Website',
    saveChanges: 'Save Changes',
    saving: 'Saving...',
    profileUpdated: 'Profile updated successfully',
    newPassword: 'New Password',
    confirmNewPassword: 'Confirm New Password',
    updatePassword: 'Update Password',
    updating: 'Updating...',
    passwordUpdated: 'Password updated successfully',
    passwordsDoNotMatch: 'Passwords do not match',
    passwordMinLength8: 'Password must be at least 8 characters',
    emailCannotBeChanged: 'Email cannot be changed',
    tellUsAboutYourself: 'Tell us about yourself...',
    loadingProfile: 'Loading profile...',
    
    // Testimonials
    testimonial1: 'With PRISMA my profile went from basic to impressive. I already had three interviews in one week.',
    testimonial1Author: 'Ana María F., UX Designer',
    testimonial2: 'I stopped sending my CV in PDF. Now I just send my PRISMA link.',
    testimonial2Author: 'Diego A., Independent Consultant',
    testimonialsTitle: 'What our users say',
    
    // Trust signals
    gdprCompliant: '✔ GDPR & encryption',
    dataPrivacy: '✔ We don\'t share or resell your information',
    madeInMexico: '✔ Made in 🇲🇽 for the world',
  },
};

/**
 * Language context interface providing all i18n functionality
 */
interface LanguageContextType {
  /** Current active language code */
  language: Language;
  /** Function to change the active language and persist to localStorage */
  setLanguage: (lang: Language) => void;
  /** Translation object with all text content for the current language */
  t: typeof translations.es;
  /** Array of all available languages with display names and flags */
  availableLanguages: { code: Language; name: string; flag: string }[];
  /** Detected country information from geolocation */
  detectedCountry: LanguageDetectionResult | null;
  /** Whether geolocation detection is in progress */
  isDetecting: boolean;
}

/**
 * React Context for managing global language state
 * Uses null as default to enable graceful fallback when provider is missing
 */
const LanguageContext = createContext<LanguageContextType | null>(null);

/**
 * Custom hook for accessing language functionality throughout the app
 * 
 * Features:
 * - Automatic fallback to Spanish if context is unavailable
 * - Type-safe access to all translation keys
 * - Language switching with localStorage persistence
 * - Available languages list for UI components
 * 
 * @returns {LanguageContextType} Language context with translations and controls
 * 
 * @example
 * ```tsx
 * const { t, language, setLanguage, availableLanguages } = useLanguage();
 * 
 * return (
 *   <div>
 *     <h1>{t.heroTitle}</h1>
 *     <p>{t.heroDesc}</p>
 *     <button onClick={() => setLanguage('en')}>
 *       Switch to English
 *     </button>
 *   </div>
 * );
 * ```
 */
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  
  // Graceful fallback when provider is missing (e.g., in tests or isolated components)
  if (!context) {
    return {
      language: 'es' as Language,
      setLanguage: () => {
        console.warn('useLanguage: No LanguageProvider found. Language switching disabled.');
      },
      t: translations.es,
      availableLanguages: [
        { code: 'es' as Language, name: 'Español', flag: '🇲🇽' },
        { code: 'en' as Language, name: 'English', flag: '🇺🇸' },
      ],
      detectedCountry: null,
      isDetecting: false,
    };
  }
  return context;
};

/**
 * Language Provider component that wraps the app to provide i18n functionality
 * 
 * Features:
 * - Automatic language detection based on user's geographic location
 * - Manages global language state with React hooks
 * - Persists language preference to localStorage
 * - Defaults based on detected country (Spanish for LATAM, English for others)
 * - Validates saved language to prevent invalid states
 * - Provides context to all child components
 * - Includes geolocation detection result for UI components
 * 
 * Usage:
 * ```tsx
 * // Wrap your app or specific sections
 * <LanguageProvider>
 *   <App />
 * </LanguageProvider>
 * ```
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components that need i18n access
 * @returns {JSX.Element} Context provider with language state
 */
export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  // Language state - will be set based on geolocation detection
  const [language, setLanguageState] = useState<Language>('es');
  
  // Geolocation detection state
  const [detectedCountry, setDetectedCountry] = useState<LanguageDetectionResult | null>(null);
  const [isDetecting, setIsDetecting] = useState(true);

  /**
   * Initialize language preference with geolocation detection
   * Priority order:
   * 1. Saved language preference (user has explicitly chosen)
   * 2. Geolocation detection (automatic based on location)
   * 3. Spanish fallback (MADFAM's primary market)
   */
  useEffect(() => {
    const initializeLanguage = async () => {
      try {
        // Check if user has a saved language preference
        const savedLanguage = localStorage.getItem('language') as Language;
        
        if (savedLanguage && (savedLanguage === 'es' || savedLanguage === 'en')) {
          // User has explicitly chosen a language - respect their choice
          setLanguageState(savedLanguage);
          setIsDetecting(false);
          
          // Still detect country for UI purposes (flags, etc.)
          try {
            const detection = await detectUserLanguage();
            setDetectedCountry(detection);
          } catch (error) {
            console.debug('Geolocation detection failed for UI:', error);
            // Use sync detection as fallback
            const syncDetection = detectUserLanguageSync();
            setDetectedCountry(syncDetection);
          }
          
          return;
        }

        // No saved preference - detect based on geolocation
        const detection = await detectUserLanguage();
        setDetectedCountry(detection);
        
        // Set language based on detection
        setLanguageState(detection.language);
        localStorage.setItem('language', detection.language);
        
        console.debug(`Language auto-detected: ${detection.language} (${detection.method}, confident: ${detection.confident})`);
        
      } catch (error) {
        console.debug('Language detection failed, using fallback:', error);
        
        // Fallback to sync detection
        const syncDetection = detectUserLanguageSync();
        setDetectedCountry(syncDetection);
        setLanguageState(syncDetection.language);
        localStorage.setItem('language', syncDetection.language);
        
      } finally {
        setIsDetecting(false);
      }
    };

    initializeLanguage();
  }, []);

  /**
   * Updates language state and persists choice to localStorage
   * When user explicitly changes language, this overrides geolocation detection
   * 
   * @param {Language} lang - The language code to switch to
   */
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
    
    console.debug(`Language manually changed to: ${lang}`);
  };

  // Generate available languages with appropriate flags
  const availableLanguages = [
    { 
      code: 'es' as Language, 
      name: 'Español', 
      flag: detectedCountry?.countryCode && detectedCountry.language === 'es' 
        ? detectedCountry.flag 
        : '🇲🇽' 
    },
    { 
      code: 'en' as Language, 
      name: 'English', 
      flag: detectedCountry?.countryCode && detectedCountry.language === 'en' 
        ? detectedCountry.flag 
        : '🇺🇸' 
    },
  ];

  const value: LanguageContextType = {
    language,
    setLanguage,
    t: translations[language],
    availableLanguages,
    detectedCountry,
    isDetecting,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
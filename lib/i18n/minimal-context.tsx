/**
 * @fileoverview Internationalization (i18n) system for MADFAM AI Portfolio Builder
 * 
 * This module provides a complete multilingual system supporting Spanish (default) and English.
 * It manages language state, translations, and localStorage persistence for user preferences.
 * 
 * Key Features:
 * - Spanish as default language for first-time visitors
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
 *   const { t, language, setLanguage } = useLanguage();
 *   
 *   return (
 *     <div>
 *       <h1>{t.heroTitle}</h1>
 *       <button onClick={() => setLanguage('en')}>
 *         Switch to English
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 * 
 * @author MADFAM Development Team
 * @version 2.0.0 - Complete multilingual implementation
 */

'use client';

import { createContext, useContext, useState, useEffect } from 'react';

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
    
    // Pricing section
    powerfulFeatures: 'Características Poderosas',
    planFree: 'Gratis',
    planPro: 'Pro',
    planBusiness: 'Empresarial',
    mostPopular: 'MÁS POPULAR',
    perMonth: '/mes',
    portfolio1: '1 portafolio',
    basicTemplates: 'Plantillas básicas',
    madfamSubdomain: 'Subdominio MADFAM',
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
    footerCopyright: '© 2025 MADFAM. Todos los derechos reservados.',
    
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
    aboutTitle: 'Acerca de MADFAM.AI',
    aboutSubtitle: 'Estamos en una misión de democratizar la creación de portafolios profesionales usando el poder de la inteligencia artificial.',
    ourMission: 'Nuestra Misión',
    missionText1: 'Todo profesional merece un portafolio impresionante que muestre sus habilidades y logros. La creación tradicional de portafolios consume tiempo, es costosa y a menudo requiere experiencia en diseño que no todos tienen. Creemos que la IA puede cambiar eso.',
    missionText2: 'MADFAM.AI transforma tu información profesional existente en hermosos portafolios personalizados en menos de 30 minutos. Ya seas desarrollador, diseñador, consultor o profesional creativo, facilitamos presentar tu mejor trabajo al mundo.',
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
    
    // Pricing section
    powerfulFeatures: 'Powerful Features',
    planFree: 'Free',
    planPro: 'Pro',
    planBusiness: 'Business',
    mostPopular: 'MOST POPULAR',
    perMonth: '/month',
    portfolio1: '1 portfolio',
    basicTemplates: 'Basic templates',
    madfamSubdomain: 'MADFAM subdomain',
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
    footerCopyright: '© 2025 MADFAM. All rights reserved.',
    
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
    aboutTitle: 'About MADFAM.AI',
    aboutSubtitle: 'We\'re on a mission to democratize professional portfolio creation using the power of artificial intelligence.',
    ourMission: 'Our Mission',
    missionText1: 'Every professional deserves a stunning portfolio that showcases their skills and achievements. Traditional portfolio creation is time-consuming, expensive, and often requires design expertise that not everyone has. We believe AI can change that.',
    missionText2: 'MADFAM.AI transforms your existing professional information into beautiful, personalized portfolios in under 30 minutes. Whether you\'re a developer, designer, consultant, or creative professional, we make it easy to present your best work to the world.',
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
        { code: 'es' as Language, name: 'Español', flag: '🇪🇸' },
        { code: 'en' as Language, name: 'English', flag: '🇺🇸' },
      ],
    };
  }
  return context;
};

/**
 * Language Provider component that wraps the app to provide i18n functionality
 * 
 * Features:
 * - Manages global language state with React hooks
 * - Persists language preference to localStorage
 * - Defaults to Spanish for new users (MADFAM's target market)
 * - Validates saved language to prevent invalid states
 * - Provides context to all child components
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
  // Language state - defaults to Spanish for MADFAM's Mexican market focus
  const [language, setLanguageState] = useState<Language>('es');

  /**
   * Initialize language preference from localStorage on component mount
   * Validates saved language to ensure it's supported
   * Falls back to Spanish for new users or invalid saved values
   */
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && (savedLanguage === 'es' || savedLanguage === 'en')) {
      setLanguageState(savedLanguage);
    } else {
      // Default to Spanish for first-time visitors - aligns with target market
      localStorage.setItem('language', 'es');
    }
  }, []);

  /**
   * Updates language state and persists choice to localStorage
   * Ensures language preference survives browser sessions
   * 
   * @param {Language} lang - The language code to switch to
   */
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

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
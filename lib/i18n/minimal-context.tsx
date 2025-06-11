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
 * @version 0.0.1-alpha - Geolocation-based language detection
 */

'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import {
  detectUserLanguage,
  detectUserLanguageSync,
  type LanguageDetectionResult,
} from '@/lib/utils/geolocation';

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
    heroDesc:
      'Presenta tu talento con estilo profesional, sin escribir una línea de código. Conecta tu LinkedIn, GitHub o CV y lanza tu portafolio con inteligencia artificial.',
    watchDemo: 'Ver Demo',
    startFreeTrial: 'Prueba Gratuita',
    featuresTitle: 'Qué hace PRISMA',
    featuresSubtitle:
      'Hecho para profesionales que saben que su presencia digital importa.',
    aiContentTitle: 'IA que entiende tu perfil',
    aiContentDesc:
      'Reescribe tu biografía y tus proyectos con claridad y persuasión.',
    oneClickTitle: 'Conexión inteligente',
    oneClickDesc:
      'Importa datos desde LinkedIn, GitHub y otros formatos con un clic.',
    templatesTitle: 'Diseños que impactan',
    templatesDesc:
      'Plantillas profesionales listas para destacar en cualquier dispositivo.',
    customDomainTitle: 'Subdominio o dominio propio',
    customDomainDesc:
      'Hazlo tuyo. Usa un subdominio de PRISMA o conecta tu marca personal.',
    publishTitle: 'Publica en 30 minutos',
    analyticsDesc:
      'Desde tu CV o LinkedIn hasta un sitio web funcional en menos de media hora.',
    mobileTitle: 'Para quien es PRISMA',
    mobileDesc:
      'Freelancers, desarrolladores, consultores y creativos que quieren impresionar.',
    howItWorksTitle: 'Cómo Funciona PRISMA',
    howItWorksSubtitle:
      '4 pasos simples para transformar tu presencia profesional',
    step1Title: '1. Sube tu CV / conecta tu perfil',
    step1Desc: 'LinkedIn, GitHub o cualquier formato. Toma menos de 2 minutos.',
    step2Title: '2. IA analiza y mejora tu contenido',
    step2Desc:
      'Reescribe automáticamente tu experiencia con claridad y impacto.',
    step3Title: '3. Elige diseño y colores',
    step3Desc:
      'Plantillas profesionales que se adaptan a tu industria y estilo.',
    step4Title: '4. Publica y comparte tu portafolio',
    step4Desc: 'Tu sitio profesional está listo para impresionar en minutos.',
    templatesSecTitle: 'Plantillas Diseñadas para',
    templatesSecSubtitle:
      'Diseños específicos que hablan el idioma de tu industria',
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
    footerTagline:
      'PRISMA - Constructor de portafolios impulsado por IA para profesionales modernos',

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
    simpleSteps: '4 Pasos Simples',

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
    footerCopyright: `© ${new Date().getFullYear()} PRISMA by MADFAM. Todos los derechos reservados.`,
    footerAllRightsReserved: 'Todos los derechos reservados.',

    // Hero section
    poweredByAi: 'Impulsado por Llama 3.1 & Mistral AI',
    learnMoreAboutUs: 'Conoce más sobre nosotros',

    // Features section
    standOut: 'Destacar',

    // Templates section
    everyProfessional: 'Cada Industria',

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
    aboutSubtitle:
      'Estamos en una misión de democratizar la creación de portafolios profesionales usando el poder de la inteligencia artificial.',
    ourMission: 'Nuestra Misión',
    missionText1:
      'Todo profesional merece un portafolio impresionante que muestre sus habilidades y logros. La creación tradicional de portafolios consume tiempo, es costosa y a menudo requiere experiencia en diseño que no todos tienen. Creemos que la IA puede cambiar eso.',
    missionText2:
      'PRISMA transforma tu información profesional existente en hermosos portafolios personalizados en menos de 30 minutos. Ya seas desarrollador, diseñador, consultor o profesional creativo, facilitamos presentar tu mejor trabajo al mundo.',
    trustedWorldwide: 'Confianza de Profesionales a Nivel Mundial',
    portfoliosCreated: 'Portafolios Creados',
    companiesHiring: 'Empresas Contratando',
    userSatisfaction: 'Satisfacción del Usuario',
    supportAvailable: 'Soporte Disponible',
    meetOurTeam: 'Conoce Nuestro Equipo',
    teamSubtitle:
      'Profesionales apasionados construyendo el futuro de la creación de portafolios',
    alexJohnson: 'Alex Johnson',
    ceoCfounder: 'CEO y Fundador',
    alexBio:
      'Ex líder técnico en Google con más de 10 años en IA y desarrollo de productos.',
    sarahChen: 'Sarah Chen',
    headOfDesign: 'Jefa de Diseño',
    sarahBio:
      'Diseñadora galardonada que ha trabajado con empresas Fortune 500.',
    marcusRodriguez: 'Marcus Rodriguez',
    leadEngineer: 'Ingeniero Principal',
    marcusBio:
      'Ingeniero full-stack apasionado por crear hermosas experiencias de usuario.',
    ourValues: 'Nuestros Valores',
    excellence: 'Excelencia',
    excellenceText:
      'Nos esforzamos por la perfección en cada portafolio que ayudamos a crear, asegurando calidad que destaque.',
    accessibility: 'Accesibilidad',
    accessibilityText:
      'La creación de portafolios profesionales debería estar disponible para todos, independientemente de las habilidades técnicas.',
    empowerment: 'Empoderamiento',
    empowermentText:
      'Creemos en empoderar a los profesionales para mostrar sus talentos y logros únicos.',
    readyToCreate: '¿Listo para Crear tu Portafolio?',
    readySubtitle:
      'Únete a miles de profesionales que ya han transformado sus carreras con hermosos portafolios impulsados por IA.',
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
    confirmEmailSent:
      'Hemos enviado un enlace de confirmación a tu correo electrónico.',
    checkInboxMessage:
      'Por favor revisa tu bandeja de entrada y haz clic en el enlace para activar tu cuenta.',
    emailSent: '¡Correo Enviado!',
    resetEmailSent:
      'Hemos enviado un enlace para restablecer tu contraseña a tu correo electrónico.',
    checkInboxReset:
      'Por favor revisa tu bandeja de entrada y haz clic en el enlace para restablecer tu contraseña.',
    resetPasswordMessage:
      'Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.',
    passwordMinLength:
      'Contraseña (mín. 12 caracteres con mayús., minús., números y símbolos)',
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
    testimonial1:
      'Con PRISMA mi perfil pasó de básico a impresionante. Ya tuve tres entrevistas en una semana.',
    testimonial1Author: 'Ana María F., UX Designer',
    testimonial2:
      'Dejé de mandar mi CV en PDF. Ahora sólo envío mi link de PRISMA.',
    testimonial2Author: 'Diego A., Consultor independiente',
    testimonialsTitle: 'Lo que dicen nuestros usuarios',

    // Trust signals
    gdprCompliant: '✔ GDPR & cifrado',
    dataPrivacy: '✔ No compartimos ni revendemos tu información',
    madeInMexico: '✔ Hecho en 🇲🇽 para el mundo',

    // Portfolio Editor
    portfolioEditor: 'Editor de Portafolio',
    basicInfo: 'Información Básica',
    name: 'Nombre',
    title: 'Título',
    skills: 'Habilidades',
    addExperience: 'Agregar Experiencia',
    addEducation: 'Agregar Educación',
    addProject: 'Agregar Proyecto',
    template: 'Plantilla',
    customize: 'Personalizar',
    enhanceWithAI: 'Mejorar con IA',
    saved: 'Guardado',
    publishPortfolio: 'Publicar Portafolio',
    unpublish: 'Despublicar',
    deleteItem: 'Eliminar',
    editItem: 'Editar',
    publish: 'Publicar',
    // AI Enhancement
    enhance: 'Mejorar',
    enhancing: 'Mejorando...',
    enhanced: '¡Mejorado!',
    enhanceBioWithAI: 'Mejorar biografía con IA',
    enhanceProjectWithAI: 'Mejorar proyecto con IA',
    selectModelFor: 'Seleccionar modelo para',
    recommended: 'Recomendado',
    close: 'Cerrar',
    // Error messages
    aiEnhancementRequiresAuth:
      'Debes iniciar sesión para usar la mejora con IA',
    aiQuotaExceeded: 'Has alcanzado el límite de mejoras con IA',
    aiEnhancementFailed: 'Error al mejorar con IA, intenta de nuevo',

    // Analytics
    analytics: 'Analíticas',
    analyticsDashboard: 'Panel de Analíticas',
    githubAnalytics: 'Analíticas de GitHub',
    connectGitHub: 'Conectar GitHub',
    repositories: 'Repositorios',
    commits: 'Commits',
    pullRequests: 'Pull Requests',
    contributors: 'Contribuidores',
    linesOfCode: 'Líneas de Código',
    codeMetrics: 'Métricas de Código',
    syncRepositories: 'Sincronizar Repositorios',
    repositoryAnalytics: 'Analíticas del Repositorio',
    topContributors: 'Top Contribuidores',
    mostActiveRepository: 'Repositorio Más Activo',
    commitsOverTime: 'Commits en el Tiempo',
    pullRequestTrends: 'Tendencias de Pull Requests',
    githubIntegrationRequired: 'Integración con GitHub requerida',

    // Template descriptions
    developerTemplateDesc:
      'Perfecto para mostrar proyectos técnicos y repositorios de GitHub',
    designerTemplateDesc:
      'Diseño creativo con galería visual de portafolio y métricas sociales',
    consultantTemplateDesc:
      'Enfoque profesional de negocios con métricas y estudios de caso',

    // API Page
    apiPageSubtitle:
      'Integra las capacidades de generación de portafolios de PRISMA en tus aplicaciones con nuestra API RESTful completa.',
    apiRestfulTitle: 'API RESTful',
    apiRestfulDesc:
      'Endpoints REST simples e intuitivos para crear, gestionar y personalizar portafolios programáticamente.',
    apiAuthTitle: 'Autenticación API',
    apiAuthDesc:
      'Autenticación segura con clave API, limitación de velocidad y análisis de uso para todas las necesidades de integración.',
    apiDocsTitle: 'Documentación Completa',
    apiDocsDesc:
      'Documentación completa con ejemplos de código, SDKs y explorador de API interactivo.',
    apiEnterpriseTitle: 'Listo para Empresas',
    apiEnterpriseDesc:
      'Listo para producción con SLA de 99.9% uptime, soporte de webhooks y canales de soporte dedicados.',
    apiComingSoon: 'API Próximamente',
    apiWaitlistDesc:
      'Nuestra API está actualmente en desarrollo. Únete a la lista de espera para obtener acceso temprano y beneficios exclusivos para desarrolladores.',
    apiJoinWaitlist: 'Unirse a Lista de Espera API',
    apiPerfectFor: 'Perfecto para',
    apiHrPlatforms: 'Plataformas de RRHH',
    apiHrDesc:
      'Genera portafolios para candidatos automáticamente desde datos de currículum.',
    apiFreelanceMarketplaces: 'Mercados de Freelancers',
    apiFreelanceDesc:
      'Ayuda a freelancers a crear portafolios profesionales para ganar más clientes.',
    apiEducationalInstitutions: 'Instituciones Educativas',
    apiEducationalDesc:
      'Permite a estudiantes mostrar su trabajo y proyectos profesionalmente.',

    // Blog Page
    blogPageTitle: 'Blog de PRISMA',
    blogSubtitle:
      'Perspectivas, consejos y estrategias para ayudarte a crear portafolios destacados y avanzar en tu carrera profesional.',
    blogAllPosts: 'Todas las Publicaciones',
    blogDesign: 'Diseño',
    blogTechnology: 'Tecnología',
    blogBusiness: 'Negocios',
    blogCareerTips: 'Consejos de Carrera',
    blogCaseStudies: 'Casos de Estudio',
    blogReadMore: 'Leer Más',
    blogStayUpdated: 'Mantente Actualizado',
    blogNewsletterDesc:
      'Recibe los últimos consejos de portafolios, perspectivas de la industria y actualizaciones de PRISMA en tu bandeja de entrada.',
    blogEmailPlaceholder: 'Ingresa tu correo electrónico',
    blogSubscribe: 'Suscribirse',

    // Careers Page
    careersPageTitle: 'Únete al Equipo PRISMA',
    careersSubtitle:
      'Ayúdanos a revolucionar cómo los profesionales muestran su trabajo. Construye el futuro de la creación de portafolios con herramientas impulsadas por IA.',
    careersWhyMadfam: '¿Por qué MADFAM?',
    careersWhyDesc:
      'Estamos en una misión de democratizar el éxito profesional a través de la tecnología.',
    careersRemoteTitle: 'Cultura Remota Primero',
    careersRemoteDesc:
      'Trabaja desde cualquier lugar con horarios flexibles y comunicación asíncrona.',
    careersBenefitsTitle: 'Beneficios Integrales',
    careersBenefitsDesc:
      'Seguro médico, dental, visual más apoyo de salud mental.',
    careersGrowthTitle: 'Oportunidades de Crecimiento',
    careersGrowthDesc:
      'Presupuesto de aprendizaje, asistencia a conferencias y desarrollo de carrera.',
    careersInclusiveTitle: 'Equipo Inclusivo',
    careersInclusiveDesc:
      'Ambiente diverso y colaborativo donde la voz de todos importa.',
    careersOpenPositions: 'Posiciones Abiertas',
    careersApplyNow: 'Aplicar Ahora',
    careersKeyRequirements: 'Requisitos Clave:',
    careersNoMatch: '¿No ves una coincidencia perfecta?',
    careersNoMatchDesc:
      'Siempre estamos buscando individuos talentosos que compartan nuestra pasión por la innovación y la excelencia.',
    careersSendResume: 'Envíanos Tu Currículum',

    // GDPR Page
    gdprPageTitle: 'Cumplimiento GDPR',
    gdprSubtitle:
      'Tus derechos de protección de datos bajo el Reglamento General de Protección de Datos (GDPR) y cómo PRISMA respeta tu privacidad.',
    gdprCommitment: 'Nuestro Compromiso con Tu Privacidad',
    gdprCommitmentDesc:
      'MADFAM está comprometido a proteger tus datos personales y respetar tus derechos de privacidad. Cumplimos con los requisitos del GDPR e implementamos medidas técnicas y organizacionales apropiadas para salvaguardar tu información.',
    gdprContactDpo: 'Contactar Nuestro DPO',
    gdprYourRights: 'Tus Derechos de Protección de Datos',
    gdprRightToInfo: 'Derecho a la Información',
    gdprRightToInfoDesc:
      'Tienes derecho a saber qué datos personales recopilamos, cómo los usamos y con quién los compartimos.',
    gdprRightToRect: 'Derecho de Rectificación',
    gdprRightToRectDesc:
      'Puedes solicitar correcciones a cualquier dato personal inexacto o incompleto que tengamos sobre ti.',
    gdprRightToErase: 'Derecho de Supresión',
    gdprRightToEraseDesc:
      'Puedes solicitar la eliminación de tus datos personales cuando ya no sea necesario o retires el consentimiento.',
    gdprRightToPort: 'Derecho a la Portabilidad de Datos',
    gdprRightToPortDesc:
      'Puedes solicitar una copia de tus datos personales en un formato estructurado y legible por máquina.',
    gdprRightToObject: 'Derecho de Oposición',
    gdprRightToObjectDesc:
      'Puedes oponerte al procesamiento de tus datos personales para marketing directo u otros intereses legítimos.',
    gdprRightToRestrict: 'Derecho a Restringir el Procesamiento',
    gdprRightToRestrictDesc:
      'Puedes solicitar limitación del procesamiento bajo ciertas circunstancias mientras verificamos o corregimos datos.',
    gdprWhatWeCollect: 'Qué Datos Recopilamos',
    gdprAccountInfo: 'Información de Cuenta',
    gdprAccountInfoDesc:
      'Nombre, dirección de correo electrónico, contraseña (cifrada) e información de perfil que proporcionas.',
    gdprPortfolioData: 'Datos de Portafolio',
    gdprPortfolioDataDesc:
      'Contenido que creas, subes o generas usando nuestra plataforma incluyendo texto, imágenes e información de proyectos.',
    gdprUsageAnalytics: 'Análisis de Uso',
    gdprUsageAnalyticsDesc:
      'Datos agregados y anonimizados sobre cómo usas nuestra plataforma para mejorar nuestros servicios.',
    gdprTechnicalData: 'Datos Técnicos',
    gdprTechnicalDataDesc:
      'Dirección IP, tipo de navegador, información del dispositivo y cookies para seguridad y funcionalidad.',
    gdprLegalBasis: 'Base Legal para el Procesamiento',
    gdprContractPerf: 'Ejecución del Contrato',
    gdprContractPerfDesc:
      'Procesamiento necesario para proporcionar nuestros servicios de creación de portafolios como se describe en nuestros Términos de Servicio.',
    gdprLegitInterest: 'Interés Legítimo',
    gdprLegitInterestDesc:
      'Mejorar nuestros servicios, medidas de seguridad y proporcionar atención al cliente.',
    gdprConsent: 'Consentimiento',
    gdprConsentDesc:
      'Comunicaciones de marketing, análisis opcionales e integraciones de terceros que apruebas explícitamente.',
    gdprExerciseRights: 'Ejercer Tus Derechos',
    gdprExerciseDesc:
      'Para ejercer cualquiera de tus derechos GDPR, por favor contáctanos. Responderemos dentro de 30 días y podemos requerir verificación de identidad.',
    gdprSubmitRequest: 'Enviar Solicitud GDPR',
    gdprManageProfile: 'Gestionar Datos en Perfil',

    // Contact Page
    contactPageTitle: 'Contactar PRISMA',
    contactSubtitle:
      '¿Tienes preguntas? ¿Necesitas soporte? ¿Quieres discutir oportunidades de negocio? Estamos aquí para ayudar.',
    contactSendMessage: 'Envíanos un mensaje',
    contactMessageSent: '¡Mensaje Enviado!',
    contactThankYou:
      'Gracias por contactarnos. Te responderemos dentro de 24 horas.',
    contactFullName: 'Nombre Completo *',
    contactEmailAddress: 'Dirección de Correo Electrónico *',
    contactSubject: 'Asunto *',
    contactMessage: 'Mensaje *',
    contactInquiryType: 'Tipo de Consulta',
    contactGeneral: 'Consulta General',
    contactSupport: 'Soporte Técnico',
    contactBusinessSales: 'Negocios y Ventas',
    contactCareers: 'Oportunidades de Carrera',
    contactGdpr: 'Protección de Datos (GDPR)',
    contactPress: 'Prensa y Medios',
    contactSending: 'Enviando...',
    contactSendButton: 'Enviar Mensaje',
    contactGetInTouch: 'Ponte en Contacto',
    contactGeneralInquiries: 'Consultas Generales',
    contactBusinessSalesLabel: 'Negocios y Ventas',
    contactSupportLabel: 'Soporte',
    contactOffice: 'Oficina',
    contactMadfamHq: 'Sede de MADFAM',
    contactOfficeDesc:
      'Ciudad de México, México\nConstruyendo el futuro de los portafolios profesionales',
    contactResponseTime: 'Tiempo de Respuesta',
    contactGeneralTime: 'Consultas Generales:',
    contactTechnicalTime: 'Soporte Técnico:',
    contactBusinessTime: 'Consultas de Negocios:',
    contactTime24h: '24 horas',
    contactTime48h: '4-8 horas',
    contactTimeSameDay: 'Mismo día',
    contactQuickQuestion:
      '¿Tienes una pregunta rápida? Revisa nuestro FAQ primero.',
    contactViewFaq: 'Ver FAQ',
    contactFullNamePlaceholder: 'Tu nombre completo',
    contactEmailPlaceholder: 'tu.correo@ejemplo.com',
    contactSubjectPlaceholder: 'Breve descripción de tu consulta',
    contactMessagePlaceholder:
      'Por favor proporciona detalles sobre tu consulta...',

    // Demo Page
    demoPageTitle: 'Ver PRISMA en Acción',
    demoSubtitle:
      'Mira cómo PRISMA transforma un simple currículum en un portafolio profesional impresionante en menos de 5 minutos.',
    demoTryInteractive: 'Probar Demo Interactivo',
    demoWatchVideo: 'Ver Demo en Video',
    demoVideoComingSoon: 'Video Demo Próximamente',
    demoVideoComingSoonDesc: 'Mientras tanto, prueba nuestro demo interactivo',
    demoLaunchInteractive: 'Lanzar Demo Interactivo',
    demoPortfolioCreation: 'Demo de Creación de Portafolio',
    demoCompleteProcess: 'Ve el proceso completo de currículum a portafolio',
    demoStepByStep: '5 minutos • Recorrido paso a paso',
    demoHowItWorks: 'Cómo Funciona',
    demoStep1Title: 'Sube tu Currículum',
    demoStep1Desc:
      'Simplemente sube tu CV o currículum existente en formato PDF',
    demoStep1Duration: '30 segundos',
    demoStep2Title: 'Mejora con IA',
    demoStep2Desc:
      'Nuestra IA analiza y mejora tu contenido para máximo impacto',
    demoStep2Duration: '2 minutos',
    demoStep3Title: 'Elige Plantilla',
    demoStep3Desc:
      'Selecciona de plantillas profesionales adaptadas a tu industria',
    demoStep3Duration: '1 minuto',
    demoStep4Title: 'Personaliza y Publica',
    demoStep4Desc: 'Haz ajustes finales y publica tu portafolio impresionante',
    demoStep4Duration: '2 minutos',
    demoLiveExample: 'Ejemplo de Portafolio en Vivo',
    demoWhatYouGet: 'Lo que Obtienes',
    demoFeature1: 'Optimización de contenido impulsada por IA',
    demoFeature2: 'Plantillas específicas de industria',
    demoFeature3: 'Diseño responsivo para móviles',
    demoFeature4: 'Soporte de dominio personalizado',
    demoFeature5: 'Optimización SEO',
    demoFeature6: 'Panel de análisis',
    demoReadyToCreate: '¿Listo para Crear tu Portafolio?',
    demoReadySubtitle:
      'Únete a miles de profesionales que han transformado sus carreras con PRISMA.',
    demoStartFreeTrial: 'Iniciar Prueba Gratuita',
    demoTryDemo: 'Probar Demo Interactivo',

    // Pricing Component
    pricingLimitedOffer:
      '🎉 Tiempo Limitado: ¡Obtén 50% de descuento en tus primeros 3 meses en planes Pro y Business!',
    pricingOfferExpires: (() => {
      const deadline = new Date();
      deadline.setMonth(deadline.getMonth() + 6);
      const day = deadline.getDate();
      const month = deadline.toLocaleString('es-ES', { month: 'long' });
      const year = deadline.getFullYear();
      return `La oferta expira el ${day} de ${month} de ${year}`;
    })(),
    pricingMostPowerful: 'MÁS PODEROSO',
    pricingEverythingInBusiness: 'Todo en Business +',
    pricingWhiteLabelSolutions: 'Soluciones de marca blanca',
    pricingDedicatedManager: 'Gerente de cuenta dedicado',
    pricingCustomIntegrations: 'Integraciones personalizadas',
    pricing24Support: 'Soporte prioritario 24/7',
    pricingSlaGuarantees: 'Garantías SLA',
    pricingStartBusinessTrial: 'Iniciar Prueba Business',
    pricingContactSalesTeam: 'Contactar Equipo de Ventas',
    pricingStartEnterpriseTrial: 'Iniciar Prueba Enterprise',
    pricingRequestQuote: 'Solicitar Cotización Personalizada',
    pricingSecurePayment: '🔒 Pago seguro',
    pricingNoHiddenFees: '💳 Sin tarifas ocultas',
    pricingCancelAnytime: '🔄 Cancela en cualquier momento',
    pricingMoneyBack: '✓ Garantía de devolución de 14 días',
    pricingNoSetupFees: '✓ Sin tarifas de configuración',
    pricingFreeMigration: '✓ Soporte de migración gratuito',
    planEnterprise: 'Enterprise',

    // Interactive Demo Page
    demoBackToDemo: 'Volver al Demo',
    demoPrismaInteractiveDemo: 'Demo Interactivo de PRISMA',
    demoTemplate: 'Plantilla',
    demoEdit: 'Editar',
    demoPreview: 'Vista Previa',
    demoResetDemo: 'Restablecer Demo',
    demoCreateAccount: 'Crear Cuenta',
    demoChooseYourTemplate: 'Elige tu Plantilla',
    demoStartBySelecting:
      'Comienza seleccionando una plantilla que coincida con tu profesión y estilo. Cada plantilla está optimizada para industrias específicas y trayectorias profesionales.',
    demoContinueToEditor: 'Continuar al Editor',
    demoEditPortfolio: 'Editar Portafolio',
    demoBack: 'Atrás',
    demoInteractiveDemoMode: 'Modo Demo Interactivo',
    demoThisIsPreview:
      'Esta es una vista previa del editor de portafolios. En la versión completa, tendrás control total sobre todas las secciones, funciones de mejora con IA y colaboración en tiempo real.',
    demoBasicInformation: 'Información Básica',
    demoName: 'Nombre',
    demoTitle: 'Título',
    demoBio: 'Biografía',
    demoTemplateSelection: 'Selección de Plantilla',
    demoYouveSelected: 'Has seleccionado la plantilla',
    demoInFullEditor:
      'En el editor completo, puedes cambiar entre plantillas y ver vistas previas en vivo.',
    demoChangeTemplate: 'Cambiar Plantilla',
    demoAvailableInFullVersion: 'Disponible en la Versión Completa',
    demoAiBioEnhancement: 'Mejora de Biografía con IA',
    demoProjectManagement: 'Gestión de Proyectos',
    demoSkillsExperience: 'Habilidades y Experiencia',
    demoCustomSections: 'Secciones Personalizadas',
    demoLinkedinImport: 'Importación de LinkedIn',
    demoGithubIntegration: 'Integración con GitHub',
    demoLoadingTemplates: 'Cargando plantillas...',
    demoLoadingPreview: 'Cargando vista previa...',
    demoLoadingControls: 'Cargando controles...',
    demoBackToEditor: 'Volver al Editor',
    demoLoveWhatYouSee: '¿Te gusta lo que ves? ¡Crea tu propio portafolio!',
    demoGetStartedFreeTrial: 'Comenzar - Prueba Gratuita',
    demoShareDemo: 'Compartir Demo',

    // Analytics Dashboard
    analyticsTitle: 'Panel de Analíticas',
    analyticsSubtitle:
      'Perspectivas de repositorios de GitHub y métricas de desarrollo',
    analyticsSyncing: 'Sincronizando...',
    analyticsSync: 'Sincronizar',
    analyticsConnectGithub: 'Conectar GitHub',
    analyticsConnectYourGithub:
      'Conecta tu cuenta de GitHub para analizar tus repositorios y obtener perspectivas detalladas de desarrollo.',
    analyticsConnectWithGithub: 'Conectar con GitHub',
    analyticsError: 'Error',
    analyticsLoadingDashboard: 'Cargando panel de analíticas...',
    analyticsTryAgain: 'Intentar de Nuevo',
    analyticsRepositories: 'Repositorios',
    analyticsCommits: 'Commits',
    analyticsPullRequests: 'Pull Requests',
    analyticsContributors: 'Contribuidores',
    analyticsLinesOfCode: 'Líneas de Código',
    analyticsLoadingCommitsChart: 'Cargando gráfico de commits...',
    analyticsLoadingPullRequestsChart: 'Cargando gráfico de pull requests...',
    analyticsYourRepositories: 'Tus Repositorios',
    analyticsPrivate: 'Privado',
    analyticsNoDescription: 'Sin descripción',
    analyticsTopContributors: 'Top Contribuidores',
    analyticsMostActiveRepository: 'Repositorio Más Activo',
    analyticsViewDetails: 'Ver Detalles',
    analyticsGithubAuthDenied:
      'La autorización de GitHub fue denegada. Por favor, intenta de nuevo.',
    analyticsInvalidCallback:
      'Callback OAuth inválido. Por favor, intenta conectar GitHub nuevamente.',
    analyticsFailedTokenExchange:
      'Error al intercambiar el token OAuth. Por favor, intenta de nuevo.',

    // Template Components
    templateGetInTouch: 'Ponerse en Contacto',
    templateDownloadCv: 'Descargar CV',
    templateTechnicalSkills: 'Habilidades Técnicas',
    templateFeaturedProjects: 'Proyectos Destacados',
    templateLiveDemo: 'Demo en Vivo',
    templateCode: 'Código',
    templateExperience: 'Experiencia',
    templatePresent: 'Presente',
    templateLetsWorkTogether: 'Trabajemos Juntos',
    templateAlwaysInterested:
      'Siempre estoy interesado en nuevas oportunidades y proyectos emocionantes.',

    // Admin Dashboard
    adminAccessDenied: 'Acceso Denegado',
    adminNoPermission:
      'No tienes permiso para acceder a esta área administrativa.',
    adminUserView: 'Vista de Usuario',
    adminAdminView: 'Vista de Administrador',
    adminSwitchToUserView: 'Cambiar a Vista de Usuario',
    adminSwitchToAdminView: 'Cambiar a Vista de Administrador',
    adminImpersonatingUser: 'Suplantando Usuario',
    adminTotalUsers: 'Total de Usuarios',
    adminActiveSubscriptions: 'Suscripciones Activas',
    adminMonthlyRevenue: 'Ingresos Mensuales',
    adminPortfoliosCreated: 'Portafolios Creados',
    adminUserManagement: 'Gestión de Usuarios',
    adminManageUsers:
      'Gestiona cuentas de usuarios, suscripciones y configuraciones del sistema.',
    adminUser: 'Usuario',
    adminSubscription: 'Suscripción',
    adminStatus: 'Estado',
    adminPortfolios: 'Portafolios',
    adminLastActive: 'Última Actividad',
    adminActions: 'Acciones',
    adminViewAs: 'Ver Como',
    adminStop: 'Detener',
    adminWelcomeBack: '¡Bienvenido de nuevo, {name}!',
    adminCurrentlyViewing:
      'Actualmente estás viendo PRISMA desde la perspectiva de un usuario.',
    adminPortfoliosCreatedStat: 'Portafolios Creados',
    adminAiEnhancementsUsed: 'Mejoras de IA Utilizadas',
    adminMonthlyViews: 'Vistas Mensuales',
    adminStatusActive: 'activo',
    adminStatusSuspended: 'suspendido',
    adminPlanFree: 'GRATIS',
    adminPlanPro: 'PRO',
    adminPlanBusiness: 'BUSINESS',

    // Error Boundary
    errorSomethingWentWrong: 'Algo salió mal',
    errorDetails: 'Detalles del Error',
    errorMessage: 'Mensaje:',
    errorStack: 'Stack:',
    errorTryAgain: 'Intentar de Nuevo',
    errorGoToHomepage: 'Ir a la Página Principal',
    errorReportBug: 'Reportar Error',
    errorId: 'ID del Error:',
    errorConnectivityIssue:
      'Parece haber un problema de conectividad. Por favor, verifica tu conexión a internet.',
    errorSessionExpired:
      'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
    errorNoPermission: 'No tienes permiso para acceder a este recurso.',
    errorDataIssue:
      'Hubo un problema con los datos. Por favor, intenta refrescar la página.',
    errorServerIssue:
      'Nuestros servidores están experimentando problemas. Por favor, intenta de nuevo en unos momentos.',
    errorUnexpected:
      'Ocurrió un error inesperado. Nuestro equipo ha sido notificado.',
    errorSectionFailedToLoad: 'La sección falló al cargar',
    errorLoadingSection:
      'Ocurrió un error al cargar esta sección. Por favor, intenta de nuevo.',
    errorTryAgainButton: 'intentar de nuevo',

    // Terms of Service Page
    termsPageTitle: 'Términos de Servicio',
    termsLastUpdated: (() => {
      const date = new Date();
      const month = date.toLocaleString('es-ES', { month: 'long' });
      const year = date.getFullYear();
      const capitalizedMonth = month.charAt(0).toUpperCase() + month.slice(1);
      return `Última actualización: ${capitalizedMonth} ${year}`;
    })(),
    termsAcceptanceTitle: 'Aceptación de Términos',
    termsAcceptanceText:
      'Al acceder y usar PRISMA, aceptas estar sujeto a estos Términos de Servicio.',
    termsUseLicenseTitle: 'Licencia de Uso',
    termsUseLicenseText:
      'Se otorga permiso para usar temporalmente nuestro servicio para uso personal y comercial.',
    termsContactInfoTitle: 'Información de Contacto',
    termsContactInfoText:
      'Para preguntas sobre estos Términos, por favor contáctanos.',

    // Privacy Policy Page
    privacyPageTitle: 'Política de Privacidad',
    privacyInfoWeCollect: 'Información que Recopilamos',
    privacyHowWeUse: 'Cómo Usamos tu Información',
    privacyContactUs: 'Contáctanos',

    // Blog Page Keys
    blogPost1Title: '10 Tendencias de Diseño de Portafolio que Dominarán 2024',
    blogPost1Excerpt:
      'Descubre las últimas tendencias de diseño que harán que tu portafolio destaque de la competencia y atraiga más oportunidades.',
    blogPost1Author: 'Equipo de Diseño MADFAM',
    blogPost1ReadTime: '5 min de lectura',
    blogPost2Title:
      'Cómo la IA está Revolucionando los Portafolios Profesionales',
    blogPost2Excerpt:
      'Aprende cómo la inteligencia artificial está transformando la forma en que los profesionales crean, optimizan y gestionan sus portafolios en línea.',
    blogPost2Author: 'Dra. Sarah Johnson',
    blogPost2ReadTime: '7 min de lectura',
    blogPost3Title:
      'De LinkedIn a Portafolio: Convirtiendo Conexiones en Clientes',
    blogPost3Excerpt:
      'Domina el arte de convertir tu red de LinkedIn en un poderoso motor de adquisición de clientes usando tu portafolio profesional.',
    blogPost3Author: 'Marcus Rodriguez',
    blogPost3ReadTime: '6 min de lectura',

    // Contact Page Keys
    contactBusinessPlanInquiry: 'Consulta de Plan de Negocios',
    contactJobApplication: 'Solicitud de Empleo - Posición',
    contactGDPRRequest: 'Solicitud GDPR',
    contactGeneralInquiry: 'Consulta General',

    // Careers Position Keys
    careersPosition1Title: 'Desarrollador Full-Stack Senior',
    careersPosition1Department: 'Ingeniería',
    careersPosition1Location: 'Remoto',
    careersPosition1Type: 'Tiempo completo',
    careersPosition1Description:
      'Únete a nuestro equipo de ingeniería para construir la próxima generación de herramientas de portafolio impulsadas por IA. Trabaja con React, Node.js y tecnologías de IA de vanguardia.',
    careersPosition1Req1: '5+ años de experiencia en React/Node.js',
    careersPosition1Req2: 'Experiencia en integración de IA/ML',
    careersPosition1Req3: 'Experiencia en plataformas de portafolio o SaaS',
    careersPosition2Title: 'Diseñador de Producto',
    careersPosition2Department: 'Diseño',
    careersPosition2Location: 'Ciudad de México / Remoto',
    careersPosition2Type: 'Tiempo completo',
    careersPosition2Description:
      'Dale forma a la experiencia de usuario de PRISMA y ayuda a millones de profesionales a crear portafolios impresionantes. Diseña para plataformas web y móviles.',
    careersPosition2Req1: '3+ años de experiencia en diseño de producto',
    careersPosition2Req2: 'Competencia en Figma/Adobe Creative Suite',
    careersPosition2Req3: 'Experiencia en productos SaaS',
    careersPosition3Title: 'Ingeniero de Investigación en IA',
    careersPosition3Department: 'IA/ML',
    careersPosition3Location: 'Remoto',
    careersPosition3Type: 'Tiempo completo',
    careersPosition3Description:
      'Investiga y desarrolla modelos de IA para generación de contenido, recomendación de plantillas y optimización de portafolios usando las últimas técnicas de ML.',
    careersPosition3Req1: 'Doctorado o Maestría en IA/ML/CS',
    careersPosition3Req2: 'Experiencia con LLMs y NLP',
    careersPosition3Req3: 'Python, TensorFlow/PyTorch',
    careersPosition4Title: 'Gerente de Éxito del Cliente',
    careersPosition4Department: 'Éxito del Cliente',
    careersPosition4Location: 'Austin, TX / Remoto',
    careersPosition4Type: 'Tiempo completo',
    careersPosition4Description:
      'Impulsa la adopción y el éxito del cliente, asegurando que nuestros usuarios obtengan el máximo valor de PRISMA. Trabaja estrechamente con los equipos de producto e ingeniería.',
    careersPosition4Req1: '3+ años de experiencia en éxito del cliente',
    careersPosition4Req2: 'Experiencia en plataformas SaaS',
    careersPosition4Req3: 'Bilingüe (Inglés/Español) preferido',

    // Privacy Additional Keys
    privacyTitle: 'Política de Privacidad',
    privacyLastUpdated: 'Última actualización: Enero 2024',
    privacyInfoCollectTitle: 'Información que Recopilamos',
    privacyInfoCollectText:
      'Recopilamos información que nos proporcionas directamente y datos sobre cómo usas nuestros servicios.',
    privacyInfoCollectItem1:
      'Información de cuenta (nombre, correo electrónico, contraseña)',
    privacyInfoCollectItem2:
      'Contenido del portafolio (proyectos, biografía, imágenes)',
    privacyInfoCollectItem3:
      'Datos de uso (páginas visitadas, funciones utilizadas)',
    privacyInfoCollectItem4:
      'Información técnica (dirección IP, tipo de navegador)',
    privacyHowUseTitle: 'Cómo Usamos tu Información',
    privacyHowUseText:
      'Utilizamos la información recopilada para proporcionar, mantener y mejorar nuestros servicios.',
    privacyHowUseItem1: 'Proporcionar y personalizar nuestros servicios',
    privacyHowUseItem2: 'Comunicarnos contigo sobre tu cuenta',
    privacyHowUseItem3: 'Mejorar y desarrollar nuevas funciones',
    privacyHowUseItem4: 'Proteger contra el fraude y el abuso',
    privacyDataProtectionTitle: 'Protección de Datos',
    privacyDataProtectionText:
      'Implementamos medidas de seguridad técnicas y organizativas para proteger tu información personal contra el acceso no autorizado, la alteración, divulgación o destrucción.',
    privacyYourRightsTitle: 'Tus Derechos',
    privacyYourRightsText:
      'Tienes derecho a acceder, actualizar, eliminar o exportar tu información personal.',
    privacyYourRightsItem1: 'Acceder a tu información personal',
    privacyYourRightsItem2: 'Corregir datos inexactos',
    privacyYourRightsItem3: 'Eliminar tu cuenta y datos',
    privacyYourRightsItem4: 'Exportar tus datos',
    privacyCookiesTitle: 'Cookies',
    privacyCookiesText:
      'Utilizamos cookies para mejorar tu experiencia, analizar el tráfico del sitio y personalizar el contenido. Puedes controlar las cookies a través de la configuración de tu navegador.',
    privacyChangesTitle: 'Cambios a esta Política',
    privacyChangesText:
      'Podemos actualizar esta política de privacidad periódicamente. Te notificaremos sobre cambios significativos publicando la nueva política en esta página.',
    privacyContactTitle: 'Contáctanos',
    privacyContactText:
      'Si tienes preguntas sobre esta política de privacidad, por favor contáctanos en:',
    privacyContactAddress: 'Ciudad de México, México',
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
    heroDesc:
      'Showcase your talent with professional style, without writing a line of code. Connect your LinkedIn, GitHub or CV and launch your portfolio with artificial intelligence.',
    watchDemo: 'Watch Demo',
    startFreeTrial: 'Start Free Trial',
    featuresTitle: 'What PRISMA does',
    featuresSubtitle:
      'Built for professionals who know their digital presence matters.',
    aiContentTitle: 'AI that understands your profile',
    aiContentDesc:
      'Rewrites your bio and projects with clarity and persuasion.',
    oneClickTitle: 'Smart connection',
    oneClickDesc:
      'Import data from LinkedIn, GitHub and other formats with one click.',
    templatesTitle: 'Designs that impact',
    templatesDesc: 'Professional templates ready to stand out on any device.',
    customDomainTitle: 'Subdomain or own domain',
    customDomainDesc:
      'Make it yours. Use a PRISMA subdomain or connect your personal brand.',
    publishTitle: 'Publish in 30 minutes',
    analyticsDesc:
      'From your CV or LinkedIn to a functional website in less than half an hour.',
    mobileTitle: 'Who PRISMA is for',
    mobileDesc:
      'Freelancers, developers, consultants and creatives who want to impress.',
    howItWorksTitle: 'How PRISMA Works',
    howItWorksSubtitle:
      '4 simple steps to transform your professional presence',
    step1Title: '1. Upload your CV / connect your profile',
    step1Desc: 'LinkedIn, GitHub or any format. Takes less than 2 minutes.',
    step2Title: '2. AI analyzes and improves your content',
    step2Desc:
      'Automatically rewrites your experience with clarity and impact.',
    step3Title: '3. Choose design and colors',
    step3Desc: 'Professional templates that adapt to your industry and style.',
    step4Title: '4. Publish and share your portfolio',
    step4Desc: 'Your professional site is ready to impress in minutes.',
    templatesSecTitle: 'Templates Built for',
    templatesSecSubtitle: 'Specific designs that speak your industry language',
    useTemplate: 'See Example',
    minimalDev: 'Developers',
    minimalDevDesc: 'Make your GitHub speak for you',
    creativeDesigner: 'Creative Freelancers',
    creativeDesignerDesc: 'From Behance to your personal site in minutes',
    businessPro: 'Consultants and Coaches',
    businessProDesc: 'Stop sending PDFs. Send them your PRISMA',
    educatorSpeaker: 'Educators and Speakers',
    educatorSpeakerDesc:
      'Your expertise deserves to be projected with elegance',
    pricingTitle: 'Access today.',
    pricingSubtitle: 'Impress tomorrow.',
    ctaTitle: 'Your talent deserves to be seen.',
    ctaSubtitle: 'With PRISMA, it projects.',
    ctaButton: 'Create my portfolio now',
    ctaFooter: "We promise: if it doesn't impress you, you don't pay.",
    noCreditCard: 'No credit card required',
    joinProfessionals: 'Join 10,000+ professionals',
    rating: '4.9/5 rating',
    trustedBy: 'Trusted by professionals from',
    footerTagline:
      'PRISMA - AI-powered portfolio builder for modern professionals',

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
    simpleSteps: '4 Simple Steps',

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
    footerCopyright: `© ${new Date().getFullYear()} PRISMA by MADFAM. All rights reserved.`,
    footerAllRightsReserved: 'All rights reserved.',

    // Hero section
    poweredByAi: 'Powered by Llama 3.1 & Mistral AI',
    learnMoreAboutUs: 'Learn more about us',

    // Features section
    standOut: 'Stand Out',

    // Templates section
    everyProfessional: 'Every Industry',

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
    aboutSubtitle:
      "We're on a mission to democratize professional portfolio creation using the power of artificial intelligence.",
    ourMission: 'Our Mission',
    missionText1:
      'Every professional deserves a stunning portfolio that showcases their skills and achievements. Traditional portfolio creation is time-consuming, expensive, and often requires design expertise that not everyone has. We believe AI can change that.',
    missionText2:
      "PRISMA transforms your existing professional information into beautiful, personalized portfolios in under 30 minutes. Whether you're a developer, designer, consultant, or creative professional, we make it easy to present your best work to the world.",
    trustedWorldwide: 'Trusted by Professionals Worldwide',
    portfoliosCreated: 'Portfolios Created',
    companiesHiring: 'Companies Hiring',
    userSatisfaction: 'User Satisfaction',
    supportAvailable: 'Support Available',
    meetOurTeam: 'Meet Our Team',
    teamSubtitle:
      'Passionate professionals building the future of portfolio creation',
    alexJohnson: 'Alex Johnson',
    ceoCfounder: 'CEO & Founder',
    alexBio:
      'Former tech lead at Google with 10+ years in AI and product development.',
    sarahChen: 'Sarah Chen',
    headOfDesign: 'Head of Design',
    sarahBio:
      'Award-winning designer who has worked with Fortune 500 companies.',
    marcusRodriguez: 'Marcus Rodriguez',
    leadEngineer: 'Lead Engineer',
    marcusBio:
      'Full-stack engineer passionate about creating beautiful user experiences.',
    ourValues: 'Our Values',
    excellence: 'Excellence',
    excellenceText:
      'We strive for perfection in every portfolio we help create, ensuring quality that stands out.',
    accessibility: 'Accessibility',
    accessibilityText:
      'Professional portfolio creation should be available to everyone, regardless of technical skill.',
    empowerment: 'Empowerment',
    empowermentText:
      'We believe in empowering professionals to showcase their unique talents and achievements.',
    readyToCreate: 'Ready to Create Your Portfolio?',
    readySubtitle:
      'Join thousands of professionals who have already transformed their careers with beautiful, AI-powered portfolios.',
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
    checkInboxMessage:
      'Please check your inbox and click the link to activate your account.',
    emailSent: 'Email Sent!',
    resetEmailSent: 'We sent a password reset link to your email address.',
    checkInboxReset:
      'Please check your inbox and click the link to reset your password.',
    resetPasswordMessage:
      "Enter your email address and we'll send you a link to reset your password.",
    passwordMinLength:
      'Password (min. 12 chars with upper, lower, numbers & symbols)',
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
    testimonial1:
      'With PRISMA my profile went from basic to impressive. I already had three interviews in one week.',
    testimonial1Author: 'Ana María F., UX Designer',
    testimonial2:
      'I stopped sending my CV in PDF. Now I just send my PRISMA link.',
    testimonial2Author: 'Diego A., Independent Consultant',
    testimonialsTitle: 'What our users say',

    // Trust signals
    gdprCompliant: '✔ GDPR & encryption',
    dataPrivacy: "✔ We don't share or resell your information",
    madeInMexico: '✔ Made in 🇲🇽 for the world',

    // Portfolio Editor
    portfolioEditor: 'Portfolio Editor',
    basicInfo: 'Basic Information',
    name: 'Name',
    title: 'Title',
    skills: 'Skills',
    addExperience: 'Add Experience',
    addEducation: 'Add Education',
    addProject: 'Add Project',
    template: 'Template',
    customize: 'Customize',
    enhanceWithAI: 'Enhance with AI',
    saved: 'Saved',
    publishPortfolio: 'Publish Portfolio',
    unpublish: 'Unpublish',
    deleteItem: 'Delete',
    editItem: 'Edit',
    publish: 'Publish',
    // AI Enhancement
    enhance: 'Enhance',
    enhancing: 'Enhancing...',
    enhanced: 'Enhanced!',
    enhanceBioWithAI: 'Enhance bio with AI',
    enhanceProjectWithAI: 'Enhance project with AI',
    selectModelFor: 'Select model for',
    recommended: 'Recommended',
    close: 'Close',
    // Error messages
    aiEnhancementRequiresAuth: 'You must sign in to use AI enhancement',
    aiQuotaExceeded: 'You have reached your AI enhancement limit',
    aiEnhancementFailed: 'AI enhancement failed, please try again',

    // Analytics
    analytics: 'Analytics',
    analyticsDashboard: 'Analytics Dashboard',
    githubAnalytics: 'GitHub Analytics',
    connectGitHub: 'Connect GitHub',
    repositories: 'Repositories',
    commits: 'Commits',
    pullRequests: 'Pull Requests',
    contributors: 'Contributors',
    linesOfCode: 'Lines of Code',
    codeMetrics: 'Code Metrics',
    syncRepositories: 'Sync Repositories',
    repositoryAnalytics: 'Repository Analytics',
    topContributors: 'Top Contributors',
    mostActiveRepository: 'Most Active Repository',
    commitsOverTime: 'Commits Over Time',
    pullRequestTrends: 'Pull Request Trends',
    githubIntegrationRequired: 'GitHub integration required',

    // Template descriptions
    developerTemplateDesc:
      'Perfect for showcasing technical projects and GitHub repositories',
    designerTemplateDesc:
      'Creative layout with visual portfolio grid and social metrics',
    consultantTemplateDesc:
      'Professional business focus with metrics and case studies',

    // API Page
    apiPageSubtitle:
      "Integrate PRISMA's portfolio generation capabilities into your applications with our comprehensive RESTful API.",
    apiRestfulTitle: 'RESTful API',
    apiRestfulDesc:
      'Simple, intuitive REST endpoints for creating, managing, and customizing portfolios programmatically.',
    apiAuthTitle: 'API Authentication',
    apiAuthDesc:
      'Secure API key authentication with rate limiting and usage analytics for all integration needs.',
    apiDocsTitle: 'Comprehensive Docs',
    apiDocsDesc:
      'Complete documentation with code examples, SDKs, and interactive API explorer.',
    apiEnterpriseTitle: 'Enterprise Ready',
    apiEnterpriseDesc:
      'Production-ready with 99.9% uptime SLA, webhook support, and dedicated support channels.',
    apiComingSoon: 'API Coming Soon',
    apiWaitlistDesc:
      'Our API is currently in development. Join the waitlist to get early access and exclusive developer benefits.',
    apiJoinWaitlist: 'Join API Waitlist',
    apiPerfectFor: 'Perfect for',
    apiHrPlatforms: 'HR Platforms',
    apiHrDesc:
      'Generate portfolios for candidates automatically from resume data.',
    apiFreelanceMarketplaces: 'Freelance Marketplaces',
    apiFreelanceDesc:
      'Help freelancers create professional portfolios to win more clients.',
    apiEducationalInstitutions: 'Educational Institutions',
    apiEducationalDesc:
      'Enable students to showcase their work and projects professionally.',

    // Blog Page
    blogPageTitle: 'PRISMA Blog',
    blogSubtitle:
      'Insights, tips, and strategies to help you create outstanding portfolios and advance your professional career.',
    blogAllPosts: 'All Posts',
    blogDesign: 'Design',
    blogTechnology: 'Technology',
    blogBusiness: 'Business',
    blogCareerTips: 'Career Tips',
    blogCaseStudies: 'Case Studies',
    blogReadMore: 'Read More',
    blogStayUpdated: 'Stay Updated',
    blogNewsletterDesc:
      'Get the latest portfolio tips, industry insights, and PRISMA updates delivered to your inbox.',
    blogEmailPlaceholder: 'Enter your email',
    blogSubscribe: 'Subscribe',

    // Careers Page
    careersPageTitle: 'Join the PRISMA Team',
    careersSubtitle:
      'Help us revolutionize how professionals showcase their work. Build the future of portfolio creation with AI-powered tools.',
    careersWhyMadfam: 'Why MADFAM?',
    careersWhyDesc:
      "We're on a mission to democratize professional success through technology.",
    careersRemoteTitle: 'Remote-First Culture',
    careersRemoteDesc:
      'Work from anywhere with flexible hours and async communication.',
    careersBenefitsTitle: 'Comprehensive Benefits',
    careersBenefitsDesc:
      'Health, dental, vision insurance plus mental health support.',
    careersGrowthTitle: 'Growth Opportunities',
    careersGrowthDesc:
      'Learning budget, conference attendance, and career development.',
    careersInclusiveTitle: 'Inclusive Team',
    careersInclusiveDesc:
      "Diverse, collaborative environment where everyone's voice matters.",
    careersOpenPositions: 'Open Positions',
    careersApplyNow: 'Apply Now',
    careersKeyRequirements: 'Key Requirements:',
    careersNoMatch: "Don't see a perfect match?",
    careersNoMatchDesc:
      "We're always looking for talented individuals who share our passion for innovation and excellence.",
    careersSendResume: 'Send Us Your Resume',

    // GDPR Page
    gdprPageTitle: 'GDPR Compliance',
    gdprSubtitle:
      'Your data protection rights under the General Data Protection Regulation (GDPR) and how PRISMA respects your privacy.',
    gdprCommitment: 'Our Commitment to Your Privacy',
    gdprCommitmentDesc:
      'MADFAM is committed to protecting your personal data and respecting your privacy rights. We comply with GDPR requirements and implement appropriate technical and organizational measures to safeguard your information.',
    gdprContactDpo: 'Contact Our DPO',
    gdprYourRights: 'Your Data Protection Rights',
    gdprRightToInfo: 'Right to Information',
    gdprRightToInfoDesc:
      'You have the right to know what personal data we collect, how we use it, and who we share it with.',
    gdprRightToRect: 'Right to Rectification',
    gdprRightToRectDesc:
      'You can request corrections to any inaccurate or incomplete personal data we hold about you.',
    gdprRightToErase: 'Right to Erasure',
    gdprRightToEraseDesc:
      "You can request deletion of your personal data when it's no longer necessary or you withdraw consent.",
    gdprRightToPort: 'Right to Data Portability',
    gdprRightToPortDesc:
      'You can request a copy of your personal data in a structured, machine-readable format.',
    gdprRightToObject: 'Right to Object',
    gdprRightToObjectDesc:
      'You can object to processing of your personal data for direct marketing or other legitimate interests.',
    gdprRightToRestrict: 'Right to Restrict Processing',
    gdprRightToRestrictDesc:
      'You can request limitation of processing under certain circumstances while we verify or correct data.',
    gdprWhatWeCollect: 'What Data We Collect',
    gdprAccountInfo: 'Account Information',
    gdprAccountInfoDesc:
      'Name, email address, password (encrypted), and profile information you provide.',
    gdprPortfolioData: 'Portfolio Data',
    gdprPortfolioDataDesc:
      'Content you create, upload, or generate using our platform including text, images, and project information.',
    gdprUsageAnalytics: 'Usage Analytics',
    gdprUsageAnalyticsDesc:
      'Aggregated, anonymized data about how you use our platform to improve our services.',
    gdprTechnicalData: 'Technical Data',
    gdprTechnicalDataDesc:
      'IP address, browser type, device information, and cookies for security and functionality.',
    gdprLegalBasis: 'Legal Basis for Processing',
    gdprContractPerf: 'Contract Performance',
    gdprContractPerfDesc:
      'Processing necessary to provide our portfolio creation services as outlined in our Terms of Service.',
    gdprLegitInterest: 'Legitimate Interest',
    gdprLegitInterestDesc:
      'Improving our services, security measures, and providing customer support.',
    gdprConsent: 'Consent',
    gdprConsentDesc:
      'Marketing communications, optional analytics, and third-party integrations you explicitly approve.',
    gdprExerciseRights: 'Exercise Your Rights',
    gdprExerciseDesc:
      'To exercise any of your GDPR rights, please contact us. We will respond within 30 days and may require identity verification.',
    gdprSubmitRequest: 'Submit GDPR Request',
    gdprManageProfile: 'Manage Data in Profile',

    // Contact Page
    contactPageTitle: 'Contact PRISMA',
    contactSubtitle:
      "Have questions? Need support? Want to discuss business opportunities? We're here to help.",
    contactSendMessage: 'Send us a message',
    contactMessageSent: 'Message Sent!',
    contactThankYou:
      "Thank you for contacting us. We'll get back to you within 24 hours.",
    contactFullName: 'Full Name *',
    contactEmailAddress: 'Email Address *',
    contactSubject: 'Subject *',
    contactMessage: 'Message *',
    contactInquiryType: 'Inquiry Type',
    contactGeneral: 'General Inquiry',
    contactSupport: 'Technical Support',
    contactBusinessSales: 'Business & Sales',
    contactCareers: 'Career Opportunities',
    contactGdpr: 'Data Protection (GDPR)',
    contactPress: 'Press & Media',
    contactSending: 'Sending...',
    contactSendButton: 'Send Message',
    contactGetInTouch: 'Get in Touch',
    contactGeneralInquiries: 'General Inquiries',
    contactBusinessSalesLabel: 'Business & Sales',
    contactSupportLabel: 'Support',
    contactOffice: 'Office',
    contactMadfamHq: 'MADFAM HQ',
    contactOfficeDesc:
      'Mexico City, Mexico\nBuilding the future of professional portfolios',
    contactResponseTime: 'Response Time',
    contactGeneralTime: 'General Inquiries:',
    contactTechnicalTime: 'Technical Support:',
    contactBusinessTime: 'Business Inquiries:',
    contactTime24h: '24 hours',
    contactTime48h: '4-8 hours',
    contactTimeSameDay: 'Same day',
    contactQuickQuestion: 'Have a quick question? Check our FAQ first.',
    contactViewFaq: 'View FAQ',
    contactFullNamePlaceholder: 'Your full name',
    contactEmailPlaceholder: 'your.email@example.com',
    contactSubjectPlaceholder: 'Brief description of your inquiry',
    contactMessagePlaceholder: 'Please provide details about your inquiry...',

    // Demo Page
    demoPageTitle: 'See PRISMA in Action',
    demoSubtitle:
      'Watch how PRISMA transforms a simple resume into a stunning professional portfolio in under 5 minutes.',
    demoTryInteractive: 'Try Interactive Demo',
    demoWatchVideo: 'Watch Video Demo',
    demoVideoComingSoon: 'Demo Video Coming Soon',
    demoVideoComingSoonDesc: 'In the meantime, try our interactive demo',
    demoLaunchInteractive: 'Launch Interactive Demo',
    demoPortfolioCreation: 'Portfolio Creation Demo',
    demoCompleteProcess: 'See the complete process from resume to portfolio',
    demoStepByStep: '5 minutes • Step-by-step walkthrough',
    demoHowItWorks: 'How It Works',
    demoStep1Title: 'Upload Your Resume',
    demoStep1Desc: 'Simply upload your existing CV or resume in PDF format',
    demoStep1Duration: '30 seconds',
    demoStep2Title: 'AI Enhancement',
    demoStep2Desc:
      'Our AI analyzes and enhances your content for maximum impact',
    demoStep2Duration: '2 minutes',
    demoStep3Title: 'Choose Template',
    demoStep3Desc:
      'Select from professional templates tailored to your industry',
    demoStep3Duration: '1 minute',
    demoStep4Title: 'Customize & Publish',
    demoStep4Desc: 'Make final adjustments and publish your stunning portfolio',
    demoStep4Duration: '2 minutes',
    demoLiveExample: 'Live Portfolio Example',
    demoWhatYouGet: 'What You Get',
    demoFeature1: 'AI-powered content optimization',
    demoFeature2: 'Industry-specific templates',
    demoFeature3: 'Mobile-responsive design',
    demoFeature4: 'Custom domain support',
    demoFeature5: 'SEO optimization',
    demoFeature6: 'Analytics dashboard',
    demoReadyToCreate: 'Ready to Create Your Portfolio?',
    demoReadySubtitle:
      'Join thousands of professionals who have transformed their careers with PRISMA.',
    demoStartFreeTrial: 'Start Free Trial',
    demoTryDemo: 'Try Interactive Demo',

    // Pricing Component
    pricingLimitedOffer:
      '🎉 Limited Time: Get 50% off your first 3 months on Pro and Business plans!',
    pricingOfferExpires: (() => {
      const deadline = new Date();
      deadline.setMonth(deadline.getMonth() + 6);
      const monthName = deadline.toLocaleString('en-US', { month: 'long' });
      const day = deadline.getDate();
      const year = deadline.getFullYear();
      // Add ordinal suffix
      const suffix = [11, 12, 13].includes(day)
        ? 'th'
        : ['st', 'nd', 'rd'][(day - 1) % 10] || 'th';
      return `Offer expires ${monthName} ${day}${suffix}, ${year}`;
    })(),
    pricingMostPowerful: 'MOST POWERFUL',
    pricingEverythingInBusiness: 'Everything in Business +',
    pricingWhiteLabelSolutions: 'White-label solutions',
    pricingDedicatedManager: 'Dedicated account manager',
    pricingCustomIntegrations: 'Custom integrations',
    pricing24Support: '24/7 priority support',
    pricingSlaGuarantees: 'SLA guarantees',
    pricingStartBusinessTrial: 'Start Business Trial',
    pricingContactSalesTeam: 'Contact Sales Team',
    pricingStartEnterpriseTrial: 'Start Enterprise Trial',
    pricingRequestQuote: 'Request Custom Quote',
    pricingSecurePayment: '🔒 Secure payment',
    pricingNoHiddenFees: '💳 No hidden fees',
    pricingCancelAnytime: '🔄 Cancel anytime',
    pricingMoneyBack: '✓ 14-day money-back guarantee',
    pricingNoSetupFees: '✓ No setup fees',
    pricingFreeMigration: '✓ Free migration support',
    planEnterprise: 'Enterprise',

    // Interactive Demo Page
    demoBackToDemo: 'Back to Demo',
    demoPrismaInteractiveDemo: 'PRISMA Interactive Demo',
    demoTemplate: 'Template',
    demoEdit: 'Edit',
    demoPreview: 'Preview',
    demoResetDemo: 'Reset Demo',
    demoCreateAccount: 'Create Account',
    demoChooseYourTemplate: 'Choose Your Template',
    demoStartBySelecting:
      'Start by selecting a template that matches your profession and style. Each template is optimized for specific industries and career paths.',
    demoContinueToEditor: 'Continue to Editor',
    demoEditPortfolio: 'Edit Portfolio',
    demoBack: 'Back',
    demoInteractiveDemoMode: 'Interactive Demo Mode',
    demoThisIsPreview:
      "This is a preview of the portfolio editor. In the full version, you'll have complete control over all sections, AI enhancement features, and real-time collaboration.",
    demoBasicInformation: 'Basic Information',
    demoName: 'Name',
    demoTitle: 'Title',
    demoBio: 'Bio',
    demoTemplateSelection: 'Template Selection',
    demoYouveSelected: "You've selected the",
    demoInFullEditor:
      'In the full editor, you can switch between templates and see live previews.',
    demoChangeTemplate: 'Change Template',
    demoAvailableInFullVersion: 'Available in Full Version',
    demoAiBioEnhancement: 'AI Bio Enhancement',
    demoProjectManagement: 'Project Management',
    demoSkillsExperience: 'Skills & Experience',
    demoCustomSections: 'Custom Sections',
    demoLinkedinImport: 'LinkedIn Import',
    demoGithubIntegration: 'GitHub Integration',
    demoLoadingTemplates: 'Loading templates...',
    demoLoadingPreview: 'Loading preview...',
    demoLoadingControls: 'Loading controls...',
    demoBackToEditor: 'Back to Editor',
    demoLoveWhatYouSee: 'Love what you see? Create your own portfolio!',
    demoGetStartedFreeTrial: 'Get Started - Free Trial',
    demoShareDemo: 'Share Demo',

    // Analytics Dashboard
    analyticsTitle: 'Analytics Dashboard',
    analyticsSubtitle: 'GitHub repository insights and development metrics',
    analyticsSyncing: 'Syncing...',
    analyticsSync: 'Sync',
    analyticsConnectGithub: 'Connect GitHub',
    analyticsConnectYourGithub:
      'Connect your GitHub account to analyze your repositories and get detailed development insights.',
    analyticsConnectWithGithub: 'Connect with GitHub',
    analyticsError: 'Error',
    analyticsLoadingDashboard: 'Loading analytics dashboard...',
    analyticsTryAgain: 'Try Again',
    analyticsRepositories: 'Repositories',
    analyticsCommits: 'Commits',
    analyticsPullRequests: 'Pull Requests',
    analyticsContributors: 'Contributors',
    analyticsLinesOfCode: 'Lines of Code',
    analyticsLoadingCommitsChart: 'Loading commits chart...',
    analyticsLoadingPullRequestsChart: 'Loading pull requests chart...',
    analyticsYourRepositories: 'Your Repositories',
    analyticsPrivate: 'Private',
    analyticsNoDescription: 'No description',
    analyticsTopContributors: 'Top Contributors',
    analyticsMostActiveRepository: 'Most Active Repository',
    analyticsViewDetails: 'View Details',
    analyticsGithubAuthDenied:
      'GitHub authorization was denied. Please try again.',
    analyticsInvalidCallback:
      'Invalid OAuth callback. Please try connecting GitHub again.',
    analyticsFailedTokenExchange:
      'Failed to exchange OAuth token. Please try again.',

    // Template Components
    templateGetInTouch: 'Get In Touch',
    templateDownloadCv: 'Download CV',
    templateTechnicalSkills: 'Technical Skills',
    templateFeaturedProjects: 'Featured Projects',
    templateLiveDemo: 'Live Demo',
    templateCode: 'Code',
    templateExperience: 'Experience',
    templatePresent: 'Present',
    templateLetsWorkTogether: "Let's Work Together",
    templateAlwaysInterested:
      "I'm always interested in new opportunities and exciting projects.",

    // Admin Dashboard
    adminAccessDenied: 'Access Denied',
    adminNoPermission:
      "You don't have permission to access this administrative area.",
    adminUserView: 'User View',
    adminAdminView: 'Admin View',
    adminSwitchToUserView: 'Switch to User View',
    adminSwitchToAdminView: 'Switch to Admin View',
    adminImpersonatingUser: 'Impersonating User',
    adminTotalUsers: 'Total Users',
    adminActiveSubscriptions: 'Active Subscriptions',
    adminMonthlyRevenue: 'Monthly Revenue',
    adminPortfoliosCreated: 'Portfolios Created',
    adminUserManagement: 'User Management',
    adminManageUsers:
      'Manage user accounts, subscriptions, and system settings.',
    adminUser: 'User',
    adminSubscription: 'Subscription',
    adminStatus: 'Status',
    adminPortfolios: 'Portfolios',
    adminLastActive: 'Last Active',
    adminActions: 'Actions',
    adminViewAs: 'View As',
    adminStop: 'Stop',
    adminWelcomeBack: 'Welcome back, {name}!',
    adminCurrentlyViewing:
      "You're currently viewing PRISMA from a user's perspective.",
    adminPortfoliosCreatedStat: 'Portfolios Created',
    adminAiEnhancementsUsed: 'AI Enhancements Used',
    adminMonthlyViews: 'Monthly Views',
    adminStatusActive: 'active',
    adminStatusSuspended: 'suspended',
    adminPlanFree: 'FREE',
    adminPlanPro: 'PRO',
    adminPlanBusiness: 'BUSINESS',

    // Error Boundary
    errorSomethingWentWrong: 'Something went wrong',
    errorDetails: 'Error Details',
    errorMessage: 'Message:',
    errorStack: 'Stack:',
    errorTryAgain: 'Try Again',
    errorGoToHomepage: 'Go to Homepage',
    errorReportBug: 'Report Bug',
    errorId: 'Error ID:',
    errorConnectivityIssue:
      'There seems to be a connectivity issue. Please check your internet connection.',
    errorSessionExpired: 'Your session has expired. Please sign in again.',
    errorNoPermission: "You don't have permission to access this resource.",
    errorDataIssue:
      'There was an issue with the data. Please try refreshing the page.',
    errorServerIssue:
      'Our servers are currently experiencing issues. Please try again in a few moments.',
    errorUnexpected:
      'An unexpected error occurred. Our team has been notified.',
    errorSectionFailedToLoad: 'Section failed to load',
    errorLoadingSection:
      'An error occurred while loading this section. Please try again.',
    errorTryAgainButton: 'try again',

    // Terms of Service Page
    termsPageTitle: 'Terms of Service',
    termsLastUpdated: (() => {
      const date = new Date();
      const month = date.toLocaleString('en-US', { month: 'long' });
      const year = date.getFullYear();
      return `Last updated: ${month} ${year}`;
    })(),
    termsAcceptanceTitle: 'Acceptance of Terms',
    termsAcceptanceText:
      'By accessing and using PRISMA, you agree to be bound by these Terms of Service.',
    termsUseLicenseTitle: 'Use License',
    termsUseLicenseText:
      'Permission is granted to temporarily use our service for personal and commercial use.',
    termsContactInfoTitle: 'Contact Information',
    termsContactInfoText: 'For questions about these Terms, please contact us.',

    // Privacy Policy Page
    privacyPageTitle: 'Privacy Policy',
    privacyInfoWeCollect: 'Information We Collect',
    privacyHowWeUse: 'How We Use Your Information',
    privacyContactUs: 'Contact Us',

    // Blog Page Keys
    blogPost1Title: '10 Portfolio Design Trends That Will Dominate 2024',
    blogPost1Excerpt:
      'Discover the latest design trends that will make your portfolio stand out from the competition and attract more opportunities.',
    blogPost1Author: 'MADFAM Design Team',
    blogPost1ReadTime: '5 min read',
    blogPost2Title: 'How AI is Revolutionizing Professional Portfolios',
    blogPost2Excerpt:
      'Learn how artificial intelligence is transforming the way professionals create, optimize, and manage their online portfolios.',
    blogPost2Author: 'Dr. Sarah Johnson',
    blogPost2ReadTime: '7 min read',
    blogPost3Title:
      'From LinkedIn to Portfolio: Converting Connections to Clients',
    blogPost3Excerpt:
      'Master the art of turning your LinkedIn network into a powerful client acquisition engine using your professional portfolio.',
    blogPost3Author: 'Marcus Rodriguez',
    blogPost3ReadTime: '6 min read',

    // Contact Page Keys
    contactBusinessPlanInquiry: 'Business Plan Inquiry',
    contactJobApplication: 'Job Application - Position',
    contactGDPRRequest: 'GDPR Request',
    contactGeneralInquiry: 'General Inquiry',

    // Careers Position Keys
    careersPosition1Title: 'Senior Full-Stack Developer',
    careersPosition1Department: 'Engineering',
    careersPosition1Location: 'Remote',
    careersPosition1Type: 'Full-time',
    careersPosition1Description:
      'Join our engineering team to build the next generation of AI-powered portfolio tools. Work with React, Node.js, and cutting-edge AI technologies.',
    careersPosition1Req1: '5+ years React/Node.js experience',
    careersPosition1Req2: 'AI/ML integration experience',
    careersPosition1Req3: 'Portfolio or SaaS platform experience',
    careersPosition2Title: 'Product Designer',
    careersPosition2Department: 'Design',
    careersPosition2Location: 'Mexico City / Remote',
    careersPosition2Type: 'Full-time',
    careersPosition2Description:
      'Shape the user experience of PRISMA and help millions of professionals create stunning portfolios. Design for web and mobile platforms.',
    careersPosition2Req1: '3+ years product design experience',
    careersPosition2Req2: 'Figma/Adobe Creative Suite proficiency',
    careersPosition2Req3: 'SaaS product experience',
    careersPosition3Title: 'AI Research Engineer',
    careersPosition3Department: 'AI/ML',
    careersPosition3Location: 'Remote',
    careersPosition3Type: 'Full-time',
    careersPosition3Description:
      'Research and develop AI models for content generation, template recommendation, and portfolio optimization using latest ML techniques.',
    careersPosition3Req1: 'PhD or MS in AI/ML/CS',
    careersPosition3Req2: 'Experience with LLMs and NLP',
    careersPosition3Req3: 'Python, TensorFlow/PyTorch',
    careersPosition4Title: 'Customer Success Manager',
    careersPosition4Department: 'Customer Success',
    careersPosition4Location: 'Austin, TX / Remote',
    careersPosition4Type: 'Full-time',
    careersPosition4Description:
      'Drive customer adoption and success, ensuring our users get maximum value from PRISMA. Work closely with product and engineering teams.',
    careersPosition4Req1: '3+ years customer success experience',
    careersPosition4Req2: 'SaaS platform experience',
    careersPosition4Req3: 'Bilingual (English/Spanish) preferred',

    // Privacy Additional Keys
    privacyTitle: 'Privacy Policy',
    privacyLastUpdated: 'Last updated: January 2024',
    privacyInfoCollectTitle: 'Information We Collect',
    privacyInfoCollectText:
      'We collect information you provide directly to us and data about how you use our services.',
    privacyInfoCollectItem1: 'Account information (name, email, password)',
    privacyInfoCollectItem2: 'Portfolio content (projects, bio, images)',
    privacyInfoCollectItem3: 'Usage data (pages visited, features used)',
    privacyInfoCollectItem4: 'Technical information (IP address, browser type)',
    privacyHowUseTitle: 'How We Use Your Information',
    privacyHowUseText:
      'We use the collected information to provide, maintain, and improve our services.',
    privacyHowUseItem1: 'Provide and personalize our services',
    privacyHowUseItem2: 'Communicate with you about your account',
    privacyHowUseItem3: 'Improve and develop new features',
    privacyHowUseItem4: 'Protect against fraud and abuse',
    privacyDataProtectionTitle: 'Data Protection',
    privacyDataProtectionText:
      'We implement technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.',
    privacyYourRightsTitle: 'Your Rights',
    privacyYourRightsText:
      'You have the right to access, update, delete, or export your personal information.',
    privacyYourRightsItem1: 'Access your personal information',
    privacyYourRightsItem2: 'Correct inaccurate data',
    privacyYourRightsItem3: 'Delete your account and data',
    privacyYourRightsItem4: 'Export your data',
    privacyCookiesTitle: 'Cookies',
    privacyCookiesText:
      'We use cookies to improve your experience, analyze site traffic, and personalize content. You can control cookies through your browser settings.',
    privacyChangesTitle: 'Changes to this Policy',
    privacyChangesText:
      'We may update this privacy policy from time to time. We will notify you of significant changes by posting the new policy on this page.',
    privacyContactTitle: 'Contact Us',
    privacyContactText:
      'If you have questions about this privacy policy, please contact us at:',
    privacyContactAddress: 'Mexico City, Mexico',
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
        console.warn(
          'useLanguage: No LanguageProvider found. Language switching disabled.'
        );
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
export const LanguageProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  // Language state - will be set based on geolocation detection
  const [language, setLanguageState] = useState<Language>('es');

  // Geolocation detection state
  const [detectedCountry, setDetectedCountry] =
    useState<LanguageDetectionResult | null>(null);
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

        if (
          savedLanguage &&
          (savedLanguage === 'es' || savedLanguage === 'en')
        ) {
          // User has explicitly chosen a language - respect their choice
          setLanguageState(savedLanguage);
          setIsDetecting(false);

          // Still detect country for UI purposes (flags, etc.)
          try {
            const detection = await detectUserLanguage();
            setDetectedCountry(detection);
          } catch (error) {
            // Geolocation detection failed for UI - this is expected
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

        // Language auto-detected successfully
      } catch (error) {
        // Language detection failed, using fallback

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

    // Language manually changed
  };

  // Generate available languages with appropriate flags
  const availableLanguages = [
    {
      code: 'es' as Language,
      name: 'Español',
      flag:
        detectedCountry?.countryCode && detectedCountry.language === 'es'
          ? detectedCountry.flag
          : '🇲🇽',
    },
    {
      code: 'en' as Language,
      name: 'English',
      flag:
        detectedCountry?.countryCode && detectedCountry.language === 'en'
          ? detectedCountry.flag
          : '🇺🇸',
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

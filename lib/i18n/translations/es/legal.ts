/**
 * MADFAM Code Available License (MCAL) v1.0
 * 
 * Copyright (c) 2025-present MADFAM. All rights reserved.
 * 
 * This source code is made available for viewing and educational purposes only.
 * Commercial use is strictly prohibited except by MADFAM and licensed partners.
 * 
 * For commercial licensing: licensing@madfam.com
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

/**
 * @fileoverview Legal Spanish translations (Privacy, Terms, GDPR)
 * @module i18n/translations/es/legal
 */

export default {
  // Privacy Policy
  privacyPageTitle: 'Política de Privacidad',
  privacyTitle: 'Política de Privacidad',
  privacyLastUpdated: 'Última actualización: Enero 2024',
  privacyInfoWeCollect: 'Información que Recopilamos',
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
  privacyHowWeUse: 'Cómo Usamos tu Información',
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
  privacyContactUs: 'Contáctanos',
  privacyContactText:
    'Si tienes preguntas sobre esta política de privacidad, por favor contáctanos en:',
  privacyContactAddress: 'Ciudad de México, México',

  // Terms of Service
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

  // GDPR
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
  gdprWhatData: 'Qué Datos Recopilamos',
  gdprWhatDataTitle: 'Qué Datos Recopilamos',
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
  gdprLegalBasisTitle: 'Base Legal para el Procesamiento',
  gdprContractPerf: 'Ejecución del Contrato',
  gdprContractPerfDesc:
    'Procesamiento necesario para proporcionar nuestros servicios de creación de portafolios como se describe en nuestros Términos de Servicio.',
  gdprLegitInterest: 'Interés Legítimo',
  gdprLegitimateInterests: 'Interés Legítimo',
  gdprLegitInterestDesc:
    'Mejorar nuestros servicios, medidas de seguridad y proporcionar atención al cliente.',
  gdprLegitimateInterestsDesc:
    'Mejorar nuestros servicios, medidas de seguridad y proporcionar atención al cliente.',
  gdprConsent: 'Consentimiento',
  gdprConsentTitle: 'Consentimiento',
  gdprConsentDesc:
    'Comunicaciones de marketing, análisis opcionales e integraciones de terceros que apruebas explícitamente.',
  gdprExerciseRights: 'Ejercer Tus Derechos',
  gdprExerciseDesc:
    'Para ejercer cualquiera de tus derechos GDPR, por favor contáctanos. Responderemos dentro de 30 días y podemos requerir verificación de identidad.',
  gdprSubmitRequest: 'Enviar Solicitud GDPR',
  gdprManageProfile: 'Gestionar Datos en Perfil',
} as const;

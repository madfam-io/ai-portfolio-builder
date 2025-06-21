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
 * @fileoverview Error message Spanish translations
 * @module i18n/translations/es/errors
 */

export default {
  // General error actions
  tryAgain: 'Intentar de Nuevo',
  retry: 'Reintentar',
  goBack: 'Regresar',
  goToHomepage: 'Ir a la Página Principal',
  reloadPage: 'Recargar Página',
  reportBug: 'Reportar Error',
  requestAccess: 'Solicitar Acceso',
  clearSearch: 'Limpiar Búsqueda',
  showDetails: 'Mostrar Detalles',
  technicalDetails: 'Detalles Técnicos',
  correctErrors: 'Corregir Errores',
  errorId: 'ID del Error',

  // Root error boundary
  rootErrorTitle: 'Algo salió mal',
  persistentError:
    'Si este problema persiste, por favor contacta a nuestro equipo de soporte.',

  // Page errors
  pageError: 'Error de Página',
  sectionError: 'Error de Sección',
  widgetError: 'Error de Componente',
  widgetErrorDescription: 'Este componente falló al cargar correctamente.',

  // Generic errors
  error: 'Error',
  genericError: 'Ocurrió un error inesperado.',

  // Network errors
  networkErrorTitle: 'Problema de Conexión',
  networkErrorDescription:
    'No se puede conectar a nuestros servidores. Por favor verifica tu conexión a internet e intenta de nuevo.',
  timeoutErrorTitle: 'Tiempo de Espera Agotado',
  timeoutErrorDescription:
    'La solicitud tardó demasiado en completarse. Por favor intenta de nuevo.',

  // Authentication errors
  authErrorTitle: 'Autenticación Requerida',
  authErrorDescription:
    'Tu sesión ha expirado. Por favor inicia sesión nuevamente para continuar.',

  // Permission errors
  permissionErrorTitle: 'Acceso Denegado',
  permissionErrorDescription: 'No tienes permiso para acceder a este recurso.',
  permissionErrorDescriptionResource:
    'No tienes permiso para acceder a {resource}.',
  permissionResource: 'Necesitas permiso para acceder a {resource}.',
  permissionActionResource: 'Necesitas permiso para {action} {resource}.',
  permissionGeneric: 'No tienes los permisos necesarios para esta acción.',
  accessDenied: 'Acceso Denegado',
  requiredRole: 'Rol Requerido',
  privileges: 'privilegios',

  // Validation errors
  validationErrorTitle: 'Entrada Inválida',
  validationErrorDescription:
    'Por favor corrige los errores a continuación e intenta de nuevo.',

  // Server errors
  serverErrorTitle: 'Error del Servidor',
  serverErrorDescription:
    'Nuestros servidores están experimentando problemas. Por favor intenta de nuevo en unos momentos.',

  // Not found errors
  notFoundTitle: 'No Encontrado',
  notFoundDescription: 'La página o recurso que buscas no existe.',
  notFound: 'no encontrado',
  pageNotFoundTitle: 'Página No Encontrada',
  pageNotFoundDescription:
    'La página que buscas no existe. Puede haber sido movida, eliminada, o ingresaste una URL incorrecta.',
  resourceNotFoundDescription: 'El {type} que buscas no se pudo encontrar.',

  // Search errors
  noSearchResults: 'No Se Encontraron Resultados',
  noSearchResultsFor: 'No se encontraron resultados para',
  searchSuggestions: 'Prueba estas sugerencias',

  // Route errors
  invalidRoute: 'Ruta Inválida',
  isNotValid: 'no es una ruta válida',
  validOptions: 'Opciones válidas',

  // Unknown errors
  unknownErrorTitle: 'Error Inesperado',
  unknownErrorDescription:
    'Algo inesperado ocurrió. Nuestro equipo ha sido notificado.',

  // Maximum retries
  maxRetriesReached: 'Se alcanzó el máximo de intentos de reintento.',

  // Offline errors
  offlineTitle: 'Estás Sin Conexión',
  offlineDescription:
    'Por favor verifica tu conexión a internet e intenta de nuevo.',
  offlineMode: 'Modo Sin Conexión',
  offlineModeDescription: 'Algunas funciones pueden estar limitadas.',
  offlineBanner:
    'Actualmente estás sin conexión. Algunas funciones pueden no estar disponibles.',
  offlineContent: 'Contenido No Disponible Sin Conexión',
  offlineContentDescription: 'Este contenido requiere una conexión a internet.',
  offlineCapabilities: 'Mientras estés sin conexión, puedes:',
  offlineViewCached: 'Ver contenido cargado previamente',
  offlineEditLocal: 'Editar portafolios localmente',
  offlineSyncLater: 'Los cambios se sincronizarán al reconectarse',

  // Help and support
  needHelp: '¿Necesitas Ayuda?',
  contactSupport: 'Contacta a nuestro equipo de soporte',
  checkAccount: 'Verifica la configuración de tu cuenta',
  reviewPermissions: 'Revisa tus permisos',
  helpfulLinks: 'Enlaces Útiles',

  // Permission denied specific
  permissionDeniedTitle: 'Permiso Denegado',
  permissionDeniedResource: 'No tienes permiso para acceder a {resource}.',

  // API errors
  apiTimeout:
    'La solicitud ha excedido el tiempo de espera. Por favor, intenta de nuevo.',
  apiNotFound: 'El recurso solicitado no fue encontrado.',
  apiUnauthorized: 'No estás autorizado para realizar esta acción.',
  apiForbidden: 'El acceso a este recurso está prohibido.',
  apiServerError: 'Error del servidor. Por favor, intenta más tarde.',
  apiValidation: 'Error de validación. Por favor, verifica tu entrada.',

  // Form errors
  fieldRequired: 'Este campo es requerido',
  invalidEmail: 'Por favor ingresa un correo electrónico válido',
  passwordTooShort: 'La contraseña debe tener al menos 12 caracteres',
  passwordMismatch: 'Las contraseñas no coinciden',
  invalidUrl: 'Por favor ingresa una URL válida',
  fileTooLarge: 'El tamaño del archivo debe ser menor a 10MB',
  invalidFileType:
    'Tipo de archivo inválido. Por favor sube un archivo válido.',

  // Auth errors
  invalidCredentials: 'Correo electrónico o contraseña inválidos',
  accountExists: 'Ya existe una cuenta con este correo electrónico',
  accountNotFound: 'No se encontró una cuenta con este correo electrónico',
  emailNotVerified:
    'Por favor verifica tu correo electrónico antes de iniciar sesión',
  tooManyAttempts: 'Demasiados intentos. Por favor, intenta más tarde.',

  // Portfolio errors
  portfolioNotFound: 'Portafolio no encontrado',
  portfolioSaveFailed:
    'Error al guardar el portafolio. Por favor, intenta de nuevo.',
  portfolioDeleteFailed:
    'Error al eliminar el portafolio. Por favor, intenta de nuevo.',
  portfolioPublishFailed:
    'Error al publicar el portafolio. Por favor, intenta de nuevo.',

  // Payment errors
  paymentFailed: 'El pago falló. Por favor verifica tus detalles de pago.',
  subscriptionExpired:
    'Tu suscripción ha expirado. Por favor renueva para continuar.',
  planLimitReached: 'Has alcanzado el límite de tu plan actual.',

  // Empty states
  noTableData: 'No hay datos disponibles',
} as const;

/**
 * @fileoverview Error message Spanish translations
 * @module i18n/translations/es/errors
 */

export default {
  // Error boundary
  errorSomethingWentWrong: 'Algo salió mal',
  errorDetails: 'Detalles del Error',
  errorMessage: 'Mensaje:',
  errorStack: 'Stack:',
  errorTryAgain: 'Intentar de Nuevo',
  errorGoToHomepage: 'Ir a la Página Principal',
  errorReportBug: 'Reportar Error',
  errorId: 'ID del Error:',

  // Specific error types
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

  // Section errors
  errorSectionFailedToLoad: 'La sección falló al cargar',
  errorLoadingSection:
    'Ocurrió un error al cargar esta sección. Por favor, intenta de nuevo.',
  errorTryAgainButton: 'intentar de nuevo',

  // API errors
  errorApiTimeout:
    'La solicitud ha excedido el tiempo de espera. Por favor, intenta de nuevo.',
  errorApiNotFound: 'El recurso solicitado no fue encontrado.',
  errorApiUnauthorized: 'No estás autorizado para realizar esta acción.',
  errorApiForbidden: 'El acceso a este recurso está prohibido.',
  errorApiServerError: 'Error del servidor. Por favor, intenta más tarde.',
  errorApiValidation: 'Error de validación. Por favor, verifica tu entrada.',

  // Form errors
  errorFieldRequired: 'Este campo es requerido',
  errorInvalidEmail: 'Por favor ingresa un correo electrónico válido',
  errorPasswordTooShort: 'La contraseña debe tener al menos 12 caracteres',
  errorPasswordMismatch: 'Las contraseñas no coinciden',
  errorInvalidUrl: 'Por favor ingresa una URL válida',
  errorFileTooLarge: 'El tamaño del archivo debe ser menor a 10MB',
  errorInvalidFileType:
    'Tipo de archivo inválido. Por favor sube un archivo válido.',

  // Auth errors
  errorInvalidCredentials: 'Correo electrónico o contraseña inválidos',
  errorAccountExists: 'Ya existe una cuenta con este correo electrónico',
  errorAccountNotFound: 'No se encontró una cuenta con este correo electrónico',
  errorEmailNotVerified:
    'Por favor verifica tu correo electrónico antes de iniciar sesión',
  errorTooManyAttempts: 'Demasiados intentos. Por favor, intenta más tarde.',

  // Portfolio errors
  errorPortfolioNotFound: 'Portafolio no encontrado',
  errorPortfolioSaveFailed:
    'Error al guardar el portafolio. Por favor, intenta de nuevo.',
  errorPortfolioDeleteFailed:
    'Error al eliminar el portafolio. Por favor, intenta de nuevo.',
  errorPortfolioPublishFailed:
    'Error al publicar el portafolio. Por favor, intenta de nuevo.',

  // Payment errors
  errorPaymentFailed: 'El pago falló. Por favor verifica tus detalles de pago.',
  errorSubscriptionExpired:
    'Tu suscripción ha expirado. Por favor renueva para continuar.',
  errorPlanLimitReached: 'Has alcanzado el límite de tu plan actual.',
} as const;

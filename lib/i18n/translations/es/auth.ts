/**
 * @fileoverview Authentication Spanish translations
 * @module i18n/translations/es/auth
 */

export default {
  // Sign in/up
  signIn: 'Iniciar Sesión',
  signUp: 'Crear Cuenta',
  signOut: 'Cerrar Sesión',

  // Form fields
  email: 'Correo electrónico',
  password: 'Contraseña',
  confirmPassword: 'Confirmar Contraseña',
  fullName: 'Nombre completo',

  // Password reset
  forgotPassword: '¿Olvidaste tu contraseña?',
  resetPassword: 'Restablecer Contraseña',
  sendResetLink: 'Enviar Enlace',
  backToSignIn: 'Volver a Iniciar Sesión',
  resetPasswordMessage:
    'Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.',

  // Social auth
  orContinueWith: 'O continúa con',
  orSignUpWith: 'O regístrate con',

  // Account status
  createNewAccount: 'crea una cuenta nueva',
  signInToAccount: 'inicia sesión con tu cuenta existente',
  haveAccount: '¿Ya tienes una cuenta?',
  noAccount: '¿No tienes una cuenta?',

  // Loading states
  signingIn: 'Iniciando sesión...',
  creatingAccount: 'Creando cuenta...',
  sending: 'Enviando...',

  // Success messages
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
  loginSuccess: '¡Inicio de sesión exitoso!',
  signUpSuccess: '¡Cuenta creada exitosamente!',
  checkEmail: 'Por favor revisa tu correo para confirmar tu cuenta.',
  redirecting: 'Redirigiendo...',

  // Validation
  passwordMinLength:
    'Contraseña (mín. 12 caracteres con mayús., minús., números y símbolos)',
  passwordMinLength8: 'La contraseña debe tener al menos 8 caracteres',
  passwordsDoNotMatch: 'Las contraseñas no coinciden',
  emailCannotBeChanged: 'El correo electrónico no se puede cambiar',
  passwordMismatch: 'Las contraseñas no coinciden',
  passwordMismatchDescription: 'Por favor asegúrate de que ambas contraseñas sean iguales.',
  termsRequired: 'Aceptación de términos requerida',
  termsRequiredDescription: 'Debes aceptar los términos y condiciones para continuar.',

  // Navigation
  goToSignIn: 'Ir a Iniciar Sesión',

  // Welcome
  hello: 'Hola',
  welcomeBack: '¡Bienvenido de nuevo!',
  loadingDashboard: 'Cargando tu panel...',

  // Misc
  or: 'O',

  // Authentication callback
  authenticationSuccessful: 'Autenticación exitosa',
  authenticationFailed: 'Autenticación fallida',
  redirectingToDashboard: 'Redirigiendo al panel...',
  processingAuthentication: 'Procesando autenticación...',
  invalidAuthenticationState: 'Estado de autenticación inválido',
  sessionExpired: 'Sesión expirada',
  pleaseLoginAgain: 'Por favor, inicia sesión nuevamente',
  completingAuthentication: 'Completando autenticación...',
  authenticationSuccessfulRedirecting:
    '¡Autenticación exitosa! Redirigiendo...',
  authenticationFailedTitle: 'Fallo en la Autenticación',
  tryAgain: 'Intentar de Nuevo',

  // OAuth messages
  connectingWithProvider: 'Conectando con proveedor...',
  authorizationDenied: 'Autorización denegada',
  authorizationCancelled: 'Autorización cancelada',
  oauthError: 'Error de OAuth',

  // Error messages
  loginError: 'Error al iniciar sesión',
  signUpError: 'Error al crear cuenta',
  genericError: 'Ocurrió un error. Por favor intenta nuevamente.',

  // Placeholders
  emailPlaceholder: 'tu@ejemplo.com',
  passwordPlaceholder: 'Ingresa tu contraseña',
  fullNamePlaceholder: 'Juan Pérez',
  confirmPasswordPlaceholder: 'Confirma tu contraseña',

  // Additional copy
  loginDescription: 'Ingresa tus credenciales para acceder a tu cuenta',
  signUpDescription: 'Crea tu cuenta para empezar a construir portafolios increíbles',
  createAccount: 'Crear Cuenta',
  acceptTerms: 'Acepto los',
  termsOfService: 'Términos de Servicio',
  and: 'y',
  privacyPolicy: 'Política de Privacidad',
  alreadyHaveAccount: '¿Ya tienes una cuenta?',

  // Account states
  accountLocked: 'Cuenta bloqueada',
  accountSuspended: 'Cuenta suspendida',
  accountNotVerified: 'Cuenta no verificada',
  emailNotVerified: 'Correo electrónico no verificado',
  pleaseVerifyEmail: 'Por favor, verifica tu correo electrónico',
} as const;

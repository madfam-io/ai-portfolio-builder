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

  // Validation
  passwordMinLength:
    'Contraseña (mín. 12 caracteres con mayús., minús., números y símbolos)',
  passwordMinLength8: 'La contraseña debe tener al menos 8 caracteres',
  passwordsDoNotMatch: 'Las contraseñas no coinciden',
  emailCannotBeChanged: 'El correo electrónico no se puede cambiar',

  // Navigation
  goToSignIn: 'Ir a Iniciar Sesión',

  // Welcome
  hello: 'Hola',
  welcomeBack: '¡Bienvenido de nuevo!',
  loadingDashboard: 'Cargando tu panel...',

  // Misc
  or: 'O',
} as const;

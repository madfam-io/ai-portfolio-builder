/**
 * @fileoverview Authentication English translations
 * @module i18n/translations/en/auth
 */

export default {
  // Sign in/up
  signIn: 'Sign In',
  signUp: 'Sign Up',
  signOut: 'Sign Out',

  // Form fields
  email: 'Email',
  password: 'Password',
  confirmPassword: 'Confirm Password',
  fullName: 'Full Name',

  // Password reset
  forgotPassword: 'Forgot Password?',
  resetPassword: 'Reset Password',
  sendResetLink: 'Send Reset Link',
  backToSignIn: 'Back to Sign In',
  resetPasswordMessage:
    "Enter your email and we'll send you a link to reset your password.",

  // Social auth
  orContinueWith: 'Or continue with',
  orSignUpWith: 'Or sign up with',

  // Account status
  createNewAccount: 'create a new account',
  signInToAccount: 'sign in to your existing account',
  haveAccount: 'Already have an account?',
  noAccount: "Don't have an account?",

  // Loading states
  signingIn: 'Signing in...',
  creatingAccount: 'Creating account...',
  sending: 'Sending...',

  // Success messages
  accountCreated: 'Account Created!',
  confirmEmailSent: "We've sent a confirmation link to your email.",
  checkInboxMessage:
    'Please check your inbox and click the link to activate your account.',
  emailSent: 'Email Sent!',
  resetEmailSent: "We've sent a password reset link to your email.",
  checkInboxReset:
    'Please check your inbox and click the link to reset your password.',
  loginSuccess: 'Login successful!',
  signUpSuccess: 'Account created successfully!',
  checkEmail: 'Please check your email to confirm your account.',
  redirecting: 'Redirecting...',

  // Validation
  passwordMinLength:
    'Password (min. 12 characters with upper, lower, numbers and symbols)',
  passwordMinLength8: 'Password must be at least 8 characters',
  passwordsDoNotMatch: 'Passwords do not match',
  emailCannotBeChanged: 'Email cannot be changed',
  passwordMismatch: 'Passwords do not match',
  passwordMismatchDescription: 'Please make sure both passwords are the same.',
  termsRequired: 'Terms acceptance required',
  termsRequiredDescription: 'You must accept the terms and conditions to continue.',

  // Navigation
  goToSignIn: 'Go to Sign In',

  // Welcome
  hello: 'Hello',
  welcomeBack: 'Welcome back!',
  loadingDashboard: 'Loading your dashboard...',

  // Misc
  or: 'Or',

  // Authentication callback
  authenticationSuccessful: 'Authentication successful',
  authenticationFailed: 'Authentication failed',
  redirectingToDashboard: 'Redirecting to dashboard...',
  processingAuthentication: 'Processing authentication...',
  invalidAuthenticationState: 'Invalid authentication state',
  sessionExpired: 'Session expired',
  pleaseLoginAgain: 'Please login again',
  completingAuthentication: 'Completing authentication...',
  authenticationSuccessfulRedirecting:
    'Authentication successful! Redirecting...',
  authenticationFailedTitle: 'Authentication Failed',
  tryAgain: 'Try Again',

  // OAuth messages
  connectingWithProvider: 'Connecting with provider...',
  authorizationDenied: 'Authorization denied',
  authorizationCancelled: 'Authorization cancelled',
  oauthError: 'OAuth error',

  // Error messages
  loginError: 'Login failed',
  signUpError: 'Sign up failed',
  genericError: 'An error occurred. Please try again.',

  // Placeholders
  emailPlaceholder: 'you@example.com',
  passwordPlaceholder: 'Enter your password',
  fullNamePlaceholder: 'John Doe',
  confirmPasswordPlaceholder: 'Confirm your password',

  // Additional copy
  loginDescription: 'Enter your credentials to access your account',
  signUpDescription: 'Create your account to start building amazing portfolios',
  createAccount: 'Create Account',
  acceptTerms: 'I accept the',
  termsOfService: 'Terms of Service',
  and: 'and',
  privacyPolicy: 'Privacy Policy',
  alreadyHaveAccount: 'Already have an account?',

  // Account states
  accountLocked: 'Account locked',
  accountSuspended: 'Account suspended',
  accountNotVerified: 'Account not verified',
  emailNotVerified: 'Email not verified',
  pleaseVerifyEmail: 'Please verify your email',
} as const;

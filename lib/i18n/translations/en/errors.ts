/**
 * @fileoverview Error message English translations
 * @module i18n/translations/en/errors
 */

export default {
  // Error boundary
  errorSomethingWentWrong: 'Something went wrong',
  errorDetails: 'Error Details',
  errorMessage: 'Message:',
  errorStack: 'Stack:',
  errorTryAgain: 'Try Again',
  errorGoToHomepage: 'Go to Homepage',
  errorReportBug: 'Report Bug',
  errorId: 'Error ID:',

  // Specific error types
  errorConnectivityIssue:
    'There seems to be a connectivity issue. Please check your internet connection.',
  errorSessionExpired: 'Your session has expired. Please sign in again.',
  errorNoPermission: "You don't have permission to access this resource.",
  errorDataIssue:
    'There was a problem with the data. Please try refreshing the page.',
  errorServerIssue:
    'Our servers are experiencing issues. Please try again in a few moments.',
  errorUnexpected: 'An unexpected error occurred. Our team has been notified.',

  // Section errors
  errorSectionFailedToLoad: 'Section failed to load',
  errorLoadingSection:
    'An error occurred while loading this section. Please try again.',
  errorTryAgainButton: 'try again',

  // API errors
  errorApiTimeout: 'Request timed out. Please try again.',
  errorApiNotFound: 'The requested resource was not found.',
  errorApiUnauthorized: 'You are not authorized to perform this action.',
  errorApiForbidden: 'Access to this resource is forbidden.',
  errorApiServerError: 'Server error. Please try again later.',
  errorApiValidation: 'Validation error. Please check your input.',

  // Form errors
  errorFieldRequired: 'This field is required',
  errorInvalidEmail: 'Please enter a valid email address',
  errorPasswordTooShort: 'Password must be at least 12 characters',
  errorPasswordMismatch: 'Passwords do not match',
  errorInvalidUrl: 'Please enter a valid URL',
  errorFileTooLarge: 'File size must be less than 10MB',
  errorInvalidFileType: 'Invalid file type. Please upload a valid file.',

  // Auth errors
  errorInvalidCredentials: 'Invalid email or password',
  errorAccountExists: 'An account with this email already exists',
  errorAccountNotFound: 'No account found with this email',
  errorEmailNotVerified: 'Please verify your email before signing in',
  errorTooManyAttempts: 'Too many attempts. Please try again later.',

  // Portfolio errors
  errorPortfolioNotFound: 'Portfolio not found',
  errorPortfolioSaveFailed: 'Failed to save portfolio. Please try again.',
  errorPortfolioDeleteFailed: 'Failed to delete portfolio. Please try again.',
  errorPortfolioPublishFailed: 'Failed to publish portfolio. Please try again.',

  // Payment errors
  errorPaymentFailed: 'Payment failed. Please check your payment details.',
  errorSubscriptionExpired:
    'Your subscription has expired. Please renew to continue.',
  errorPlanLimitReached: 'You have reached the limit for your current plan.',
} as const;

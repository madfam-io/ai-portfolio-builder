/**
 * @fileoverview Error message English translations
 * @module i18n/translations/en/errors
 */

export default {
  // General error actions
  tryAgain: 'Try Again',
  retry: 'Retry',
  goBack: 'Go Back',
  goToHomepage: 'Go to Homepage',
  reloadPage: 'Reload Page',
  reportBug: 'Report Bug',
  requestAccess: 'Request Access',
  clearSearch: 'Clear Search',
  showDetails: 'Show Details',
  technicalDetails: 'Technical Details',
  correctErrors: 'Correct Errors',
  errorId: 'Error ID',

  // Root error boundary
  rootErrorTitle: 'Something went wrong',
  persistentError: 'If this problem persists, please contact our support team.',

  // Page errors
  pageError: 'Page Error',
  sectionError: 'Section Error',
  widgetError: 'Widget Error',
  widgetErrorDescription: 'This component failed to load properly.',

  // Generic errors
  error: 'Error',
  genericError: 'An unexpected error occurred.',
  
  // Network errors
  networkErrorTitle: 'Connection Problem',
  networkErrorDescription: 'Unable to connect to our servers. Please check your internet connection and try again.',
  timeoutErrorTitle: 'Request Timeout',
  timeoutErrorDescription: 'The request took too long to complete. Please try again.',

  // Authentication errors
  authErrorTitle: 'Authentication Required',
  authErrorDescription: 'Your session has expired. Please sign in again to continue.',

  // Permission errors
  permissionErrorTitle: 'Access Denied',
  permissionErrorDescription: 'You don\'t have permission to access this resource.',
  permissionErrorDescriptionResource: 'You don\'t have permission to access {resource}.',
  permissionResource: 'You need permission to access {resource}.',
  permissionActionResource: 'You need permission to {action} {resource}.',
  permissionGeneric: 'You don\'t have the necessary permissions for this action.',
  accessDenied: 'Access Denied',
  requiredRole: 'Required Role',
  privileges: 'privileges',

  // Validation errors
  validationErrorTitle: 'Invalid Input',
  validationErrorDescription: 'Please correct the errors below and try again.',

  // Server errors
  serverErrorTitle: 'Server Error',
  serverErrorDescription: 'Our servers are experiencing issues. Please try again in a few moments.',

  // Not found errors
  notFoundTitle: 'Not Found',
  notFoundDescription: 'The page or resource you\'re looking for doesn\'t exist.',
  notFound: 'not found',
  pageNotFoundTitle: 'Page Not Found',
  pageNotFoundDescription: 'The page you\'re looking for doesn\'t exist. It may have been moved, deleted, or you entered the wrong URL.',
  resourceNotFoundDescription: 'The {type} you\'re looking for could not be found.',

  // Search errors
  noSearchResults: 'No Results Found',
  noSearchResultsFor: 'No results found for',
  searchSuggestions: 'Try these suggestions',

  // Route errors
  invalidRoute: 'Invalid Route',
  isNotValid: 'is not a valid route',
  validOptions: 'Valid options',

  // Unknown errors
  unknownErrorTitle: 'Unexpected Error',
  unknownErrorDescription: 'Something unexpected happened. Our team has been notified.',

  // Maximum retries
  maxRetriesReached: 'Maximum retry attempts reached.',

  // Offline errors
  offlineTitle: 'You\'re Offline',
  offlineDescription: 'Please check your internet connection and try again.',
  offlineMode: 'Offline Mode',
  offlineModeDescription: 'Some features may be limited.',
  offlineBanner: 'You\'re currently offline. Some features may not be available.',
  offlineContent: 'Content Unavailable Offline',
  offlineContentDescription: 'This content requires an internet connection.',
  offlineCapabilities: 'While offline, you can:',
  offlineViewCached: 'View previously loaded content',
  offlineEditLocal: 'Edit portfolios locally',
  offlineSyncLater: 'Changes will sync when reconnected',

  // Help and support
  needHelp: 'Need Help?',
  contactSupport: 'Contact our support team',
  checkAccount: 'Check your account settings',
  reviewPermissions: 'Review your permissions',
  helpfulLinks: 'Helpful Links',

  // Permission denied specific
  permissionDeniedTitle: 'Permission Denied',
  permissionDeniedResource: 'You don\'t have permission to access {resource}.',

  // API errors
  apiTimeout: 'Request timed out. Please try again.',
  apiNotFound: 'The requested resource was not found.',
  apiUnauthorized: 'You are not authorized to perform this action.',
  apiForbidden: 'Access to this resource is forbidden.',
  apiServerError: 'Server error. Please try again later.',
  apiValidation: 'Validation error. Please check your input.',

  // Form errors
  fieldRequired: 'This field is required',
  invalidEmail: 'Please enter a valid email address',
  passwordTooShort: 'Password must be at least 12 characters',
  passwordMismatch: 'Passwords do not match',
  invalidUrl: 'Please enter a valid URL',
  fileTooLarge: 'File size must be less than 10MB',
  invalidFileType: 'Invalid file type. Please upload a valid file.',

  // Auth errors
  invalidCredentials: 'Invalid email or password',
  accountExists: 'An account with this email already exists',
  accountNotFound: 'No account found with this email',
  emailNotVerified: 'Please verify your email before signing in',
  tooManyAttempts: 'Too many attempts. Please try again later.',

  // Portfolio errors
  portfolioNotFound: 'Portfolio not found',
  portfolioSaveFailed: 'Failed to save portfolio. Please try again.',
  portfolioDeleteFailed: 'Failed to delete portfolio. Please try again.',
  portfolioPublishFailed: 'Failed to publish portfolio. Please try again.',

  // Payment errors
  paymentFailed: 'Payment failed. Please check your payment details.',
  subscriptionExpired: 'Your subscription has expired. Please renew to continue.',
  planLimitReached: 'You have reached the limit for your current plan.',

  // Empty states
  noTableData: 'No data available',
} as const;

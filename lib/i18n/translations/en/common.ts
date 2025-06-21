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
 * @fileoverview Common English translations used across the application
 * @module i18n/translations/en/common
 */

export default {
  // Navigation
  home: 'Home',
  features: 'Features',
  pricing: 'Pricing',
  templates: 'Templates',
  about: 'About',
  contact: 'Contact',
  blog: 'Blog',
  careers: 'Careers',
  privacy: 'Privacy',
  terms: 'Terms',
  gdpr: 'GDPR',
  dashboard: 'Dashboard',
  profile: 'Profile',
  analytics: 'Analytics',

  // Actions
  save: 'Save',
  cancel: 'Cancel',
  edit: 'Edit',
  delete: 'Delete',
  create: 'Create',
  update: 'Update',
  publish: 'Publish',
  unpublish: 'Unpublish',
  preview: 'Preview',
  download: 'Download',
  share: 'Share',
  export: 'Export',
  import: 'Import',

  // Status
  loading: 'Loading...',
  saving: 'Saving...',
  error: 'Error',
  success: 'Success',
  warning: 'Warning',
  info: 'Info',

  // Forms
  email: 'Email',
  password: 'Password',
  confirmPassword: 'Confirm Password',
  name: 'Name',
  firstName: 'First Name',
  lastName: 'Last Name',
  phone: 'Phone',
  message: 'Message',
  subject: 'Subject',

  // Validation
  required: 'This field is required',
  invalidEmail: 'Invalid email address',
  passwordTooShort: 'Password must be at least 12 characters',
  passwordMismatch: 'Passwords do not match',

  // Dates
  today: 'Today',
  yesterday: 'Yesterday',
  tomorrow: 'Tomorrow',
  thisWeek: 'This Week',
  lastWeek: 'Last Week',
  thisMonth: 'This Month',
  lastMonth: 'Last Month',

  // Currency
  currency: 'USD',
  currencySymbol: '$',

  // Common phrases
  welcomeBack: 'Welcome back',
  getStarted: 'Get Started',
  learnMore: 'Learn More',
  viewAll: 'View All',
  seeMore: 'See More',
  seeLess: 'See Less',
  backTo: 'Back to',
  nextStep: 'Next Step',
  previousStep: 'Previous Step',
  complete: 'Complete',
  continue: 'Continue',
  skip: 'Skip',
  close: 'Close',
  open: 'Open',
  yes: 'Yes',
  no: 'No',
  maybe: 'Maybe',

  // Time
  seconds: 'seconds',
  minutes: 'minutes',
  hours: 'hours',
  days: 'days',
  weeks: 'weeks',
  months: 'months',
  years: 'years',

  // File operations
  upload: 'Upload',
  uploadFile: 'Upload File',
  dragDropFile: 'Drag and drop file here',
  chooseFile: 'Choose File',
  noFileSelected: 'No file selected',

  // Search
  search: 'Search',
  searchPlaceholder: 'Search...',
  noResults: 'No results found',
  resultsFor: 'Results for',

  // Common actions
  add: 'Add',
  remove: 'Remove',
  retrying: 'Retrying...',
  tryAgain: 'Try Again',

  // Empty states
  emptyStates: {
    noResults: 'No results found',
    noSearchResults: 'No search results',
    noSearchResultsDescription: 'Try adjusting your search terms or filters',
    noPortfolios: 'No portfolios yet',
    noPortfoliosDescription: 'Create your first portfolio to get started',
    createFirstPortfolio: 'Create Your First Portfolio',
    noProjects: 'No projects added',
    noProjectsDescription: 'Add your first project to showcase your work',
    addFirstProject: 'Add Your First Project',
    noData: 'No data available',
    noDataDescription: 'There is no data to display at this time',
    noAnalyticsData: 'No analytics data',
    noAnalyticsDataDescription:
      'Analytics data will appear once you have activity',
    noUsers: 'No users found',
    noUsersDescription: 'No users match your current filters',
    noProducts: 'No products found',
    noProductsDescription: 'No products match your current filters',
    uploadTitle: 'Upload Files',
    uploadDescription: 'Drag and drop files here or click to browse',
    maxSize: 'Max size',
    noImages: 'No images uploaded',
    noImagesDescription: 'Upload images to enhance your portfolio',
    uploadImage: 'Upload Image',
    noItems: 'No {type} found',
    noItemsDescription: 'Start by adding your first {type}',
  },

  // Pagination
  page: 'Page',
  of: 'of',
  first: 'First',
  last: 'Last',
  previous: 'Previous',
  next: 'Next',

  // Auth
  signIn: 'Sign In',
  signUp: 'Sign Up',
  signOut: 'Sign Out',
  forgotPassword: 'Forgot Password?',
  resetPassword: 'Reset Password',
  createAccount: 'Create Account',
  haveAccount: 'Already have an account?',
  noAccount: "Don't have an account?",

  // Footer
  copyright: '© 2024 PRISMA by MADFAM. All rights reserved.',
  privacyPolicy: 'Privacy Policy',
  termsOfService: 'Terms of Service',
  cookiePolicy: 'Cookie Policy',

  // UI Elements
  backToTop: 'Back to top',
} as const;

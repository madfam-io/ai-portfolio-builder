/**
 * @fileoverview Admin dashboard Spanish translations
 * @module i18n/translations/es/admin
 */

export default {
  // Access control
  adminAccessDenied: 'Acceso Denegado',
  adminNoPermission:
    'No tienes permiso para acceder a esta área administrativa.',

  // View modes
  adminUserView: 'Vista de Usuario',
  adminAdminView: 'Vista de Administrador',
  adminSwitchToUserView: 'Cambiar a Vista de Usuario',
  adminSwitchToAdminView: 'Cambiar a Vista de Administrador',
  adminImpersonatingUser: 'Suplantando Usuario',

  // Dashboard stats
  adminTotalUsers: 'Total de Usuarios',
  adminActiveSubscriptions: 'Suscripciones Activas',
  adminMonthlyRevenue: 'Ingresos Mensuales',
  adminPortfoliosCreated: 'Portafolios Creados',
  adminPortfoliosCreatedStat: 'Portafolios Creados',
  adminAiEnhancementsUsed: 'Mejoras de IA Utilizadas',
  adminMonthlyViews: 'Vistas Mensuales',

  // User management
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

  // Welcome message
  adminWelcomeBack: '¡Bienvenido de nuevo, {name}!',
  adminCurrentlyViewing:
    'Actualmente estás viendo PRISMA desde la perspectiva de un usuario.',

  // Status values
  adminStatusActive: 'activo',
  adminStatusSuspended: 'suspendido',

  // Plan types
  adminPlanFree: 'GRATIS',
  adminPlanPro: 'PRO',
  adminPlanBusiness: 'BUSINESS',

  // Admin dashboard
  adminDashboard: 'Panel de Administración',
  adminPanel: 'Panel de Admin',
  adminOverview: 'Resumen',
  systemStatus: 'Estado del Sistema',

  // User details
  userId: 'ID de Usuario',
  email: 'Correo Electrónico',
  registeredDate: 'Fecha de Registro',
  lastLogin: 'Último Inicio de Sesión',
  accountType: 'Tipo de Cuenta',

  // System actions
  exportData: 'Exportar Datos',
  importData: 'Importar Datos',
  systemSettings: 'Configuración del Sistema',
  maintenanceMode: 'Modo de Mantenimiento',

  // Reports
  reports: 'Reportes',
  userActivityReport: 'Reporte de Actividad de Usuarios',
  revenueReport: 'Reporte de Ingresos',
  usageReport: 'Reporte de Uso',
  generateReport: 'Generar Reporte',

  // Notifications
  systemNotification: 'Notificación del Sistema',
  sendNotification: 'Enviar Notificación',
  notificationsSent: 'Notificaciones Enviadas',
} as const;

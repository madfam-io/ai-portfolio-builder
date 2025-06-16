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

  // Experiments
  experimentsTitle: 'Experimentos A/B',
  experimentsDescription:
    'Gestiona experimentos de páginas de destino y rastrea el rendimiento',
  experimentsNewExperiment: 'Nuevo Experimento',
  experimentsSearchPlaceholder: 'Buscar experimentos...',
  experimentsAllStatus: 'Todos los Estados',
  experimentsActive: 'Activo',
  experimentsPaused: 'Pausado',
  experimentsCompleted: 'Completado',
  experimentsDraft: 'Borrador',
  experimentsArchived: 'Archivado',
  experimentsVisitors: 'visitantes',
  experimentsConversion: 'conversión',
  experimentsCreated: 'Creado',
  experimentsPauseTitle: 'Pausar Experimento',
  experimentsResumeTitle: 'Reanudar Experimento',
  experimentsViewDetails: 'Ver Detalles',
  experimentsEditTitle: 'Editar Experimento',
  experimentsMarkCompleted: 'Marcar como Completado',
  experimentsArchive: 'Archivar',
  experimentsVariantPerformance: 'Rendimiento de Variantes',
  experimentsControl: 'Control',
  experimentsWinner: 'Ganador',
  experimentsTrafficAllocation: 'asignación de tráfico',
  experimentsConversions: 'Conversiones',
  experimentsRate: 'Tasa',
  experimentsNoResults:
    'No se encontraron experimentos que coincidan con tus filtros.',
  experimentsEmpty: 'Aún no se han creado experimentos.',
  experimentsCreateFirst: 'Crea Tu Primer Experimento',
  experimentsNotFound: 'Experimento no encontrado',
  experimentsLoading: 'Cargando experimentos...',
  experimentsRefresh: 'Actualizar',
  experimentsExport: 'Exportar Datos',
  experimentsTimeRange7d: 'Últimos 7 días',
  experimentsTimeRange14d: 'Últimos 14 días',
  experimentsTimeRange30d: 'Últimos 30 días',
  experimentsTimeRangeAll: 'Todo el tiempo',
} as const;

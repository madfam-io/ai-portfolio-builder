/**
 * @fileoverview Analytics Spanish translations
 * @module i18n/translations/es/analytics
 */

export default {
  // Page titles
  analytics: 'Analíticas',
  analyticsDashboard: 'Panel de Analíticas',
  analyticsTitle: 'Panel de Analíticas',
  analyticsSubtitle:
    'Perspectivas de repositorios de GitHub y métricas de desarrollo',
  githubAnalytics: 'Analíticas de GitHub',

  // Actions
  connectGitHub: 'Conectar GitHub',
  connectWithGithub: 'Conectar con GitHub',
  connectYourGithub:
    'Conecta tu cuenta de GitHub para analizar tus repositorios y obtener perspectivas detalladas de desarrollo.',
  syncRepositories: 'Sincronizar Repositorios',
  sync: 'Sincronizar',
  syncing: 'Sincronizando...',

  // Metrics
  repositories: 'Repositorios',
  commits: 'Commits',
  pullRequests: 'Pull Requests',
  contributors: 'Contribuidores',
  linesOfCode: 'Líneas de Código',
  codeMetrics: 'Métricas de Código',

  // Repository info
  repositoryAnalytics: 'Analíticas del Repositorio',
  yourRepositories: 'Tus Repositorios',
  topContributors: 'Top Contribuidores',
  mostActiveRepository: 'Repositorio Más Activo',
  commitsOverTime: 'Commits en el Tiempo',
  pullRequestTrends: 'Tendencias de Pull Requests',
  viewDetails: 'Ver Detalles',
  private: 'Privado',
  noDescription: 'Sin descripción',

  // Loading states
  loadingDashboard: 'Cargando panel de analíticas...',
  loadingCommitsChart: 'Cargando gráfico de commits...',
  loadingPullRequestsChart: 'Cargando gráfico de pull requests...',

  // Errors
  githubIntegrationRequired: 'Integración con GitHub requerida',
  githubAuthDenied:
    'La autorización de GitHub fue denegada. Por favor, intenta de nuevo.',
  invalidCallback:
    'Callback OAuth inválido. Por favor, intenta conectar GitHub nuevamente.',
  failedTokenExchange:
    'Error al intercambiar el token OAuth. Por favor, intenta de nuevo.',
  error: 'Error',
  tryAgain: 'Intentar de Nuevo',
} as const;

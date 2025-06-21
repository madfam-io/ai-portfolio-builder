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

  // Repository detail page
  loading: 'Cargando...',
  loadingRepository: 'Cargando repositorio...',
  loadingAnalytics: 'Cargando analíticas del repositorio...',
  errorLoadingRepository: 'Error al cargar repositorio',
  backToAnalytics: 'Volver a Analíticas',
  noDescriptionAvailable: 'Sin descripción disponible',
  viewOnGitHub: 'Ver en GitHub',
  syncData: 'Sincronizar Datos',
  lastUpdated: 'Última actualización',
  stars: 'Estrellas',
  forks: 'Bifurcaciones',
  watchers: 'Observadores',
  issues: 'Problemas',
  language: 'Lenguaje',
  createdAt: 'Creado el',
  updatedAt: 'Actualizado el',
  homepage: 'Página principal',
  topics: 'Temas',
  license: 'Licencia',
  visibility: 'Visibilidad',
  public: 'Público',

  // Metrics details
  totalCommits: 'Total de Commits',
  totalLOC: 'Total LOC',
  commitsLast30Days: 'Commits (30d)',
  recentPRs: 'PRs Recientes',
  totalPullRequests: 'Total de Pull Requests',
  openIssues: 'Problemas Abiertos',
  closedIssues: 'Problemas Cerrados',
  averageCommitsPerDay: 'Promedio de Commits/Día',
  contributorActivity: 'Actividad de Contribuidores',

  // Chart labels
  commitsPerMonth: 'Commits por Mes',
  pullRequestsPerMonth: 'Pull Requests por Mes',
  issuesOverTime: 'Problemas en el Tiempo',
  codeFrequency: 'Frecuencia de Código',
  commitActivity: 'Actividad de Commits',
  languageDistribution: 'Distribución de Lenguajes',
  recentPullRequests: 'Pull Requests Recientes',

  // Device dimensions
  desktop: 'Escritorio',
  tablet: 'Tableta',
  mobile: 'Móvil',

  // Time periods
  lastWeek: 'Última Semana',
  lastMonth: 'Último Mes',
  lastYear: 'Último Año',
  allTime: 'Todo el Tiempo',

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
  notFound: 'No encontrado',
  repositoryNotFound: 'Repositorio no encontrado',
  failedToFetchAnalytics: 'Error al obtener analíticas del repositorio',
  failedToSync: 'Error al sincronizar repositorio',

  // Pull Request Metrics
  pullRequestMetrics: 'Métricas de Pull Requests',
  avgCycleTime: 'Tiempo de Ciclo Prom.',
  avgLeadTime: 'Tiempo de Entrega Prom.',
  mergeRate: 'Tasa de Fusión',
  timeToReview: 'Tiempo de Revisión',

  // Pull Request States
  merged: 'fusionado',
  open: 'abierto',
  closed: 'cerrado',

  // Contributors
  by: 'por',
  commitsWithChanges: 'commits',

  // Formatting
  notAvailable: 'N/D',
  pullRequestNumber: '#{number}',
  codeChanges: '+{additions} -{deletions}',
} as const;

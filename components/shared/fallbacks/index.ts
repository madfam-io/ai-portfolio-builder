/**
 * @fileoverview Fallback Components Index
 * 
 * Central export point for all fallback components.
 */

// Loading fallbacks
export {
  FullPageLoader,
  InlineLoader,
  ButtonLoader,
  CardSkeleton,
  TableSkeleton,
  FormSkeleton,
  TextSkeleton,
  ImageSkeleton,
  ProfileSkeleton,
  StatsSkeleton,
  NavigationSkeleton,
  ContentLoader
} from './LoadingFallback';

// Empty state fallbacks
export {
  EmptyState,
  NoResultsState,
  NoPortfoliosState,
  NoProjectsState,
  NoDataState,
  UploadEmptyState,
  NoImagesState,
  EmptyListState,
  EmptyTableState,
  InlineEmptyState
} from './EmptyStateFallback';

// Error state fallbacks
export {
  ErrorState,
  NetworkErrorState,
  AuthErrorState,
  PermissionDeniedState,
  NotFoundState,
  ValidationErrorState,
  ServerErrorState,
  TimeoutErrorState
} from './ErrorStateFallback';

// Offline state fallbacks
export {
  OfflineState,
  OfflineIndicator,
  OfflineBanner,
  OfflineCard,
  useConnectionStatus
} from './OfflineStateFallback';

// Not found fallbacks
export {
  NotFoundPage,
  ResourceNotFound,
  SearchNotFound,
  DynamicNotFound
} from './NotFoundFallback';

// Permission denied fallbacks
export {
  PermissionDeniedPage,
  InlinePermissionDenied,
  RoleBasedAccess,
  FeatureGate
} from './PermissionDeniedFallback';
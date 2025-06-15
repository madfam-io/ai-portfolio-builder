import { NextRequest, NextResponse } from 'next/server';

export interface ApiVersionConfig {
  _currentVersion: string;
  supportedVersions: string[];
  deprecatedVersions: Map<
    string,
    { deprecatedAt: Date; sunsetDate: Date; message: string }
  >;
}

// API Version Configuration
export const API_VERSION_CONFIG: ApiVersionConfig = {
  _currentVersion: 'v1',
  supportedVersions: ['v1'],
  deprecatedVersions: new Map([
    // Example: ['v0', { deprecatedAt: new Date('2025-01-01'), sunsetDate: new Date('2025-06-01'), _message: 'Please upgrade to v1' }]
  ]),
};

/**
 * Extract API version from request URL
 */
export function extractApiVersion(pathname: string): string | null {
  const match = pathname.match(/^\/api\/(v\d+)\//);
  return match && match[1] ? match[1] : null;
}

/**
 * Validate if the API version is supported
 */
export function isVersionSupported(version: string): boolean {
  return API_VERSION_CONFIG.supportedVersions.includes(version);
}

/**
 * Check if API version is deprecated
 */
export function isVersionDeprecated(version: string): boolean {
  return API_VERSION_CONFIG.deprecatedVersions.has(version);
}

/**
 * Get deprecation info for a version
 */
export function getDeprecationInfo(version: string) {
  return API_VERSION_CONFIG.deprecatedVersions.get(version);
}

/**
 * API Version Middleware
 * Validates API version and adds appropriate headers
 */
export async function apiVersionMiddleware(
  request: NextRequest
): Promise<NextResponse> {
  const pathname = request.nextUrl.pathname;

  // Only process API routes
  if (!pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Extract version from URL
  const version = extractApiVersion(pathname);

  // If no version specified, redirect to current version
  const isApiRootPath = !version && pathname === '/api/';
  const isNonVersionedApiPath = pathname.match(/^\/api\/[^v]/) !== null;
  
  if (isApiRootPath || isNonVersionedApiPath) {
    const newPathname = pathname.replace(
      '/api/',
      `/api/${API_VERSION_CONFIG._currentVersion}/`
    );
    return NextResponse.redirect(new URL(newPathname, request.url));
  }

  // Create response that will be modified
  const response = NextResponse.next();

  // Add API version headers
  response.headers.set(
    'X-API-Version',
    version || API_VERSION_CONFIG._currentVersion
  );
  response.headers.set(
    'X-API-Current-Version',
    API_VERSION_CONFIG._currentVersion
  );
  response.headers.set(
    'X-API-Supported-Versions',
    API_VERSION_CONFIG.supportedVersions.join(', ')
  );

  // Check if version is supported
  if (version && !isVersionSupported(version)) {
    return NextResponse.json(
      {
        _error: 'Unsupported API Version',
        _message: `API version ${version} is not supported. Supported versions: ${API_VERSION_CONFIG.supportedVersions.join(', ')}`,
        _currentVersion: API_VERSION_CONFIG._currentVersion,
      },
      {
        status: 400,
        headers: response.headers,
      }
    );
  }

  // Check if version is deprecated
  if (version && isVersionDeprecated(version)) {
    const deprecationInfo = getDeprecationInfo(version);
    if (deprecationInfo !== null && deprecationInfo !== undefined) {
      response.headers.set(
        'X-API-Deprecation-Warning',
        deprecationInfo.message
      );
      response.headers.set(
        'X-API-Sunset-Date',
        deprecationInfo.sunsetDate.toISOString()
      );
      response.headers.set('Sunset', deprecationInfo.sunsetDate.toUTCString());
      response.headers.set(
        'Deprecation',
        `date="${deprecationInfo.deprecatedAt.toISOString()}"`
      );
    }
  }

  return response;
}

/**
 * Helper function to create versioned API response
 */
export function createVersionedResponse<T>(
  _data: T,
  options?: {
    status?: number;
    headers?: HeadersInit;
    version?: string;
  }
): NextResponse {
  const {
    status = 200,
    headers = {},
    version = API_VERSION_CONFIG._currentVersion,
  } = options || {};

  const response = NextResponse.json(_data, { status, headers });

  // Add standard API version headers
  response.headers.set('X-API-Version', version);
  response.headers.set('X-API-Response-Time', new Date().toISOString());

  return response;
}

/**
 * Helper to handle version-specific logic in route handlers
 */
function withApiVersion<T extends (...args: unknown[]) => unknown>(
  _handler: T,
  options?: {
    minVersion?: string;
    maxVersion?: string;
  }
): T {
  return (async (...args: Parameters<T>) => {
    const [request] = args as unknown as [NextRequest];
    const version =
      extractApiVersion(request.nextUrl.pathname) ||
      API_VERSION_CONFIG._currentVersion;

    // Version validation
    if (options?.minVersion && version < options.minVersion) {
      return NextResponse.json(
        {
          _error: 'Version Too Low',
          _message: `This endpoint requires API version ${options.minVersion} or higher. You are using ${version}.`,
          _currentVersion: API_VERSION_CONFIG._currentVersion,
        },
        { status: 400 }
      );
    }

    if (options?.maxVersion && version > options.maxVersion) {
      return NextResponse.json(
        {
          _error: 'Version Too High',
          _message: `This endpoint supports API version ${options.maxVersion} or lower. You are using ${version}.`,
          _currentVersion: API_VERSION_CONFIG._currentVersion,
        },
        { status: 400 }
      );
    }

    // Call the original handler with version context
    return _handler(...args, { _apiVersion: version });
  }) as T;
}

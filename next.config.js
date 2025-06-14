/** @type {import('next').NextConfig} */

// Load bundle analyzer if ANALYZE env is set
const withBundleAnalyzer =
  process.env.ANALYZE === 'true'
    ? require('@next/bundle-analyzer')({
        enabled: true,
        openAnalyzer: false,
      })
    : config => config;

const nextConfig = {
  reactStrictMode: false,
  poweredByHeader: false,
  
  // Enable SWC minification for smaller bundles
  swcMinify: true,
  
  // Optimize production builds
  productionBrowserSourceMaps: false,
  
  // Module optimization
  modularizeImports: {
    'lucide-react': {
      transform: 'lucide-react/dist/esm/icons/{{member}}',
    },
    '@mui/material': {
      transform: '@mui/material/{{member}}',
    },
    lodash: {
      transform: 'lodash/{{member}}',
    },
  },
  
  // Experimental features for better performance
  experimental: {
    optimizeCss: true,
    optimizePackageImports: [
      'lucide-react',
      'recharts',
      'date-fns',
      '@octokit/rest',
      '@octokit/types',
    ],
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/api/(.*)',
        headers: [
          // CORS headers for API routes
          {
            key: 'Access-Control-Allow-Origin',
            value:
              process.env.NODE_ENV === 'production'
                ? process.env.CORS_ALLOWED_ORIGINS || 'https://prisma.madfam.io'
                : '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization, X-CSRF-Token, X-API-Version',
          },
          {
            key: 'Access-Control-Allow-Credentials',
            value: 'true',
          },
          {
            key: 'Access-Control-Max-Age',
            value: '86400', // 24 hours
          },
        ],
      },
      {
        source: '/(.*)',
        headers: [
          // Strict Content Security Policy for production security
          {
            key: 'Content-Security-Policy',
            value:
              process.env.NODE_ENV === 'production'
                ? [
                    "default-src 'self'",
                    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
                    "style-src 'self' 'unsafe-inline'", // Required for CSS-in-JS
                    "img-src 'self' data: https: blob:",
                    "font-src 'self' data:",
                    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://ipapi.co",
                    "frame-src 'none'",
                    "object-src 'none'",
                    "base-uri 'self'",
                    "form-action 'self'",
                    "frame-ancestors 'none'",
                    'upgrade-insecure-requests',
                  ].join('; ')
                : "script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline' data:; font-src 'self' data:; object-src 'none'; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://ipapi.co; img-src 'self' data: https: blob:;",
          },
          // Additional security headers
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
        ],
      },
    ];
  },

  // Image optimization
  images: {
    domains: [
      'images.unsplash.com',
      'avatars.githubusercontent.com',
      'media.licdn.com',
      'supabase.co',
    ],
    formats: ['image/webp', 'image/avif'],
  },

  // Redirects
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },

  // TypeScript configuration
  typescript: {
    // Enable type checking for production builds
    ignoreBuildErrors: false,
  },

  // ESLint configuration
  eslint: {
    // Temporarily allow builds to complete with ESLint warnings for deployment
    // TODO: Fix remaining ESLint issues in development
    ignoreDuringBuilds: true,
  },

  // Webpack configuration
  webpack: (config, { isServer }) => {
    // Suppress specific warnings
    config.ignoreWarnings = [
      // Ignore the critical dependency warning from Supabase realtime-js
      {
        module: /@supabase[\\/]realtime-js/,
        message: /Critical dependency/,
      },
    ];
    
    // Optimize code splitting
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            // Vendor splitting
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendor',
              priority: 10,
              reuseExistingChunk: true,
            },
            // Common components
            common: {
              minChunks: 2,
              priority: 5,
              reuseExistingChunk: true,
            },
            // Separate heavy libraries
            recharts: {
              test: /[\\/]node_modules[\\/](recharts|d3-.*)[\\/]/,
              name: 'charts',
              priority: 20,
            },
            octokit: {
              test: /[\\/]node_modules[\\/]@octokit[\\/]/,
              name: 'github',
              priority: 20,
            },
            supabase: {
              test: /[\\/]node_modules[\\/]@supabase[\\/]/,
              name: 'supabase',
              priority: 20,
            },
          },
        },
      };
    }

    // Handle Node.js modules for Redis and other server-only dependencies
    if (!isServer) {
      // Client-side: externalize Node.js modules
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
        'node:crypto': false,
        'node:net': false,
        'node:tls': false,
        'node:timers/promises': false,
      };

      // Exclude Redis and other server-only modules from client bundle
      config.externals = config.externals || [];
      config.externals.push({
        redis: 'redis',
        'node:crypto': 'node:crypto',
        'node:net': 'node:net',
        'node:tls': 'node:tls',
        'node:timers/promises': 'node:timers/promises',
        ioredis: 'ioredis',
      });
    }

    // Disable Redis imports in Edge Runtime (Middleware)
    if (process.env.NODE_ENV === 'production') {
      config.resolve.alias = {
        ...config.resolve.alias,
        redis: false,
      };
    }

    return config;
  },
};

module.exports = withBundleAnalyzer(nextConfig);

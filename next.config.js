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

  // Security headers
  async headers() {
    return [
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
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: false,
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

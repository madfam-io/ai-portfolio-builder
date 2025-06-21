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
    // optimizeCss: true, // Disabled - requires 'critters' package
    optimizePackageImports: [
      'lucide-react',
      'recharts',
      'date-fns',
      '@octokit/rest',
      '@octokit/types',
    ],
    // instrumentationHook is now enabled by default in Next.js 15
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
                    "script-src 'self' 'unsafe-inline' https://prisma-brown.vercel.app https://*.vercel.app", // Allow Next.js inline scripts and external scripts
                    "style-src 'self' 'unsafe-inline'", // Required for CSS-in-JS and Tailwind
                    "img-src 'self' data: https: blob:",
                    "font-src 'self' data: https://fonts.gstatic.com",
                    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com https://ipapi.co https://huggingface.co",
                    "frame-src 'self' https://js.stripe.com",
                    "object-src 'none'",
                    "base-uri 'self'",
                    "form-action 'self' https://js.stripe.com",
                    "frame-ancestors 'none'",
                    "manifest-src 'self'",
                    "worker-src 'self' blob:",
                    'upgrade-insecure-requests',
                  ].join('; ')
                : "script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline' data:; font-src 'self' data:; object-src 'none'; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://ipapi.co https://api.stripe.com https://huggingface.co; img-src 'self' data: https: blob:; frame-src 'self' https://js.stripe.com;",
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
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          // Additional security headers for production
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'same-origin',
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'credentialless',
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'off',
          },
          {
            key: 'X-Download-Options',
            value: 'noopen',
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
    // Allow builds to complete with ESLint warnings
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

    // Enhanced code splitting and optimization
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          minSize: 20000,
          maxSize: 244000,
          cacheGroups: {
            // Framework chunks
            react: {
              test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
              name: 'react',
              priority: 30,
              reuseExistingChunk: true,
            },

            // Next.js chunks
            next: {
              test: /[\\/]node_modules[\\/]next[\\/]/,
              name: 'next',
              priority: 25,
              reuseExistingChunk: true,
            },

            // Heavy analytics and chart libraries
            analytics: {
              test: /[\\/]node_modules[\\/](recharts|d3-.*|@nivo|chart\.js)[\\/]/,
              name: 'analytics',
              priority: 20,
              reuseExistingChunk: true,
            },

            // GitHub/Git related
            github: {
              test: /[\\/]node_modules[\\/](@octokit|simple-git)[\\/]/,
              name: 'github',
              priority: 20,
              reuseExistingChunk: true,
            },

            // Database and auth
            database: {
              test: /[\\/]node_modules[\\/](@supabase|postgres)[\\/]/,
              name: 'database',
              priority: 20,
              reuseExistingChunk: true,
            },

            // Payment processing
            payments: {
              test: /[\\/]node_modules[\\/](stripe|@stripe)[\\/]/,
              name: 'payments',
              priority: 20,
              reuseExistingChunk: true,
            },

            // Date utilities
            dates: {
              test: /[\\/]node_modules[\\/](date-fns|moment|dayjs)[\\/]/,
              name: 'dates',
              priority: 15,
              reuseExistingChunk: true,
            },

            // UI libraries
            ui: {
              test: /[\\/]node_modules[\\/](@radix-ui|@headlessui|framer-motion)[\\/]/,
              name: 'ui',
              priority: 15,
              reuseExistingChunk: true,
            },

            // Utility libraries
            utils: {
              test: /[\\/]node_modules[\\/](lodash|ramda|uuid|zod)[\\/]/,
              name: 'utils',
              priority: 10,
              reuseExistingChunk: true,
            },

            // Default vendor chunk for remaining modules
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendor',
              priority: 5,
              reuseExistingChunk: true,
            },

            // Common application code
            common: {
              minChunks: 2,
              priority: 1,
              reuseExistingChunk: true,
            },
          },
        },

        // Module concatenation for better tree shaking
        concatenateModules: true,

        // Minimize duplicate code
        providedExports: true,
        usedExports: true,
        sideEffects: false,
      };

      // Enhanced terser configuration for production
      if (process.env.NODE_ENV === 'production') {
        config.optimization.minimizer = [
          ...(config.optimization.minimizer || []),
          // Additional optimization could be added here
        ];
      }
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

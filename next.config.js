/** @type {import('next').NextConfig} */
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
                    "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
                    "frame-src 'none'",
                    "object-src 'none'",
                    "base-uri 'self'",
                    "form-action 'self'",
                    "frame-ancestors 'none'",
                    'upgrade-insecure-requests',
                  ].join('; ')
                : "script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline' data:; font-src 'self' data:; object-src 'none'; connect-src 'self' https://*.supabase.co wss://*.supabase.co; img-src 'self' data: https: blob:;",
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
    // Enable type checking during build
    ignoreBuildErrors: false,
  },

  // ESLint configuration
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: false,
  },
};

module.exports = nextConfig;

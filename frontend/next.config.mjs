/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    reactCompiler: false,
  },
  async headers() {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001/api/v1';
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

    const getOrigin = (value) => {
      try {
        return new URL(value).origin;
      } catch {
        return null;
      }
    };

    const backendOrigin = getOrigin(backendUrl);
    const apiOrigin = getOrigin(apiUrl);

    const connectSrc = [
      "'self'",
      backendOrigin,
      backendOrigin ? backendOrigin.replace(/^http/, 'ws') : null,
      apiOrigin,
      apiOrigin ? apiOrigin.replace(/^http/, 'ws') : null,
    ].filter(Boolean);

    const csp = [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "frame-ancestors 'none'",
      "form-action 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      `connect-src ${connectSrc.join(' ')}`,
    ].join('; ');

    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: csp,
          },
        ],
      },
    ];
  },
};

export default nextConfig;

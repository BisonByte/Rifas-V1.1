/** @type {import('next').NextConfig} */
const nextConfig = {
  // Usar el directorio por defecto para assets de Next (_next)
  // Evita 404 de /_next/static en desarrollo
  eslint: {
    // Don't fail production builds on ESLint warnings/errors. We keep linting for dev.
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  },
};
// Important: keep config pure and static. Avoid DB calls or side effects here,
// Next.js loads this during build. Runtime config is initialized in app code.
module.exports = nextConfig;

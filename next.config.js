/** @type {import('next').NextConfig} */
const nextConfig = {
  // Use a non-dotted dist directory to avoid OneDrive file locking issues on Windows
  distDir: 'next',
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

module.exports = nextConfig;

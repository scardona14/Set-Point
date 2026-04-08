/** @type {import('next').NextConfig} */
const isPWA = process.env.BUILD_TARGET === 'pwa';

const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Exclude `.ts` routing files (like route.ts and middleware.ts) during PWA build
  // to prevent static export errors on API routes. Standard pages are `.tsx`.
  pageExtensions: isPWA ? ['tsx', 'jsx', 'js'] : ['tsx', 'ts', 'jsx', 'js'],
  // Default: standalone for Netlify/Docker deployment
  output: isPWA ? 'export' : 'standalone',
  ...(isPWA && {
    trailingSlash: true,
    distDir: 'out',
    // In static export mode, API routes are excluded automatically.
    // The native Capacitor app hits the live deployed server for API calls —
    // fetch() calls should use absolute URLs (e.g., NEXT_PUBLIC_API_URL env var)
    // or relative URLs that Capacitor resolves against capacitor.config.ts server.url.
    skipTrailingSlashRedirect: true,
  }),
};

export default nextConfig;


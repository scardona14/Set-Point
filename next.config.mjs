/** @type {import('next').NextConfig} */
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
  output: 'standalone',
  ...(process.env.BUILD_TARGET === 'pwa' && {
    output: 'export',
    trailingSlash: true,
    distDir: 'out',
  }),
}

export default nextConfig

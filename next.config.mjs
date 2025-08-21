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
  output: (process.env.BUILD_TARGET === 'capacitor' || process.env.BUILD_TARGET === 'pwa') ? 'export' : undefined,
  trailingSlash: (process.env.BUILD_TARGET === 'capacitor' || process.env.BUILD_TARGET === 'pwa') ? true : false,
  assetPrefix: process.env.BUILD_TARGET === 'capacitor' ? './' : undefined,
  experimental: {
    webpackBuildWorker: true,
  },
}

export default nextConfig

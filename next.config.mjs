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
  output: process.env.BUILD_TARGET === 'capacitor' ? 'export' : undefined,
  trailingSlash: process.env.BUILD_TARGET === 'capacitor' ? true : false,
  assetPrefix: process.env.BUILD_TARGET === 'capacitor' ? './' : undefined,
  experimental: {
    webpackBuildWorker: true,
  },
}

export default nextConfig

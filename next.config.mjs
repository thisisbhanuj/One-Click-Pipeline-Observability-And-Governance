/** @type {import('next').NextConfig} */
const nextConfig = {
  generateEtags: true,
  reactStrictMode: true,
  productionBrowserSourceMaps: false,
  poweredByHeader: false,
  experimental: {
    serverMinification: true,
    serverSourceMaps: false,
    webpackBuildWorker: true,
    workerThreads: true,
    parallelServerCompiles: true,
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  eslint: {
    ignoreDuringBuilds: true,
    dirs: [
      'app',
      'actions',
      'components',
      'lib',
      'hooks'
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
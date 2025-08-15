/** @type {import('next').NextConfig} */
const nextConfig = {
  generateEtags: true,
  reactStrictMode: true,
  poweredByHeader: false,
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
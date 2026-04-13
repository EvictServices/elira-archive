import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  trailingSlash: false,
  compress: true,
  images: {
    formats: ['image/avif', 'image/webp'],
  },
}

export default nextConfig

import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  trailingSlash: false,
  serverExternalPackages: ['xxhash-addon'],
}

export default nextConfig

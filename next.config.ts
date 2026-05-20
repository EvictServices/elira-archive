import type { NextConfig } from 'next'

const dashboardOrigin = process.env.DASHBOARD_URL ?? 'http://localhost:3001'

const nextConfig: NextConfig = {
  trailingSlash: false,
  async rewrites() {
    return [
      { source: '/dashboard', destination: `${dashboardOrigin}/dashboard` },
      { source: '/dashboard/:path*', destination: `${dashboardOrigin}/dashboard/:path*` },
      { source: '/api/guilds', destination: `${dashboardOrigin}/api/guilds` },
      { source: '/api/guilds/:path*', destination: `${dashboardOrigin}/api/guilds/:path*` },
      { source: '/api/auth', destination: `${dashboardOrigin}/api/auth` },
      { source: '/api/auth/:path*', destination: `${dashboardOrigin}/api/auth/:path*` },
    ]
  },
}

export default nextConfig

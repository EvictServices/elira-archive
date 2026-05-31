import type { NextConfig } from 'next'

const dashboardOrigin = process.env.DASHBOARD_URL ?? 'http://localhost:3001'
const isDev = process.env.NODE_ENV === 'development'

const nextConfig: NextConfig = {
  trailingSlash: false,
  async rewrites() {
    const rules: { source: string; destination: string }[] = []

    if (isDev) {
      rules.push(
        { source: '/dashboard', destination: `${dashboardOrigin}/dashboard` },
        { source: '/dashboard/:path*', destination: `${dashboardOrigin}/dashboard/:path*` },
        { source: '/api/guilds', destination: `${dashboardOrigin}/api/guilds` },
        { source: '/api/guilds/:path*', destination: `${dashboardOrigin}/api/guilds/:path*` },
        { source: '/api/auth', destination: `${dashboardOrigin}/api/auth` },
        { source: '/api/auth/:path*', destination: `${dashboardOrigin}/api/auth/:path*` },
      )
    } else if (process.env.DASHBOARD_URL) {
      rules.push(
        { source: '/dashboard', destination: `${dashboardOrigin}/dashboard` },
        { source: '/dashboard/:path*', destination: `${dashboardOrigin}/dashboard/:path*` },
        { source: '/api/guilds', destination: `${dashboardOrigin}/api/guilds` },
        { source: '/api/guilds/:path*', destination: `${dashboardOrigin}/api/guilds/:path*` },
      )
    }

    return rules
  },
}

export default nextConfig

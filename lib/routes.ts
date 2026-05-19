/** Canonical page paths (App Router URLs). */
export const routes = {
  home: '/',
  commands: '/commands',
  embeds: '/embeds',
  updates: '/updates',
  status: '/status',
  terms: '/terms',
  privacy: '/privacy',
  dashboard: '/dashboard',
  guild: (guildId: string, tab = 'general') =>
    `/dashboard/${guildId}/${tab}` as const,
  ticket: (ticketId: string) => `/tickets/${ticketId}` as const,
  purge: (purgeId: string) => `/purge/${purgeId}` as const,
  avatars: (userId: string) => `/avatars/${userId}` as const,
} as const

/** Build `/api/guilds/:guildId/...` paths. */
export function apiGuild(guildId: string, ...segments: string[]): string {
  const tail = segments.filter(Boolean).join('/')
  return tail ? `/api/guilds/${guildId}/${tail}` : `/api/guilds/${guildId}`
}

export const api = {
  auth: {
    me: '/api/auth/me',
    login: '/api/auth/login',
    logout: '/api/auth/logout',
  },
  guilds: '/api/guilds',
  guildsTop: '/api/guilds/top',
  guildLeaderboard: (guildId: string) => apiGuild(guildId, 'leaderboard'),
  cluster: {
    health: '/api/cluster/health',
    status: '/api/cluster/status',
    commands: '/api/cluster/commands',
  },
  stats: {
    topCommands: '/api/stats/top-commands',
  },
} as const

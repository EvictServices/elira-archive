import redis from '@/lib/redis'

/** Base URL for the bot/cluster HTTP API (no trailing slash). */
export const CLUSTER_API_BASE =
  (typeof process !== 'undefined' &&
    process.env.CLUSTER_API_URL &&
    String(process.env.CLUSTER_API_URL).replace(/\/$/, '')) ||
  'http://127.0.0.1:8000'

const CLUSTER_API = CLUSTER_API_BASE

function safeParse<T>(text: string): T {
  const safe = text.replace(/"(id|guild_id|owner_id)":\s*(\d{15,})/g, '"$1":"$2"')
  return JSON.parse(safe) as T
}

export async function clusterGet<T>(path: string): Promise<T> {
  const res = await fetch(`${CLUSTER_API}${path}`, {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  })
  if (!res.ok) {
    throw new Error(`Cluster API ${path} failed: ${res.status}`)
  }
  const text = await res.text()
  return safeParse<T>(text)
}

export async function clusterPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${CLUSTER_API}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(body),
    cache: 'no-store',
  })
  if (!res.ok) {
    throw new Error(`Cluster API ${path} failed: ${res.status}`)
  }
  const text = await res.text()
  return safeParse<T>(text)
}

export interface MutualGuild {
  id: string
  name: string
  icon_url: string | null
  member_count: number
}

export async function fetchMutualGuilds(userId: string): Promise<MutualGuild[]> {
  return clusterGet<MutualGuild[]>(`/user/${userId}/mutuals`)
}

export interface GuildData {
  guild_id: string
  name: string
  icon_url: string | null
  banner_url: string | null
  owner_id: string
  member_count: number
  boost_count: number
  boost_level: number
  role_count: number
  channel_count: number
  emoji_count: number
  [key: string]: unknown
}

export async function fetchGuild(guildId: string): Promise<GuildData> {
  return clusterGet<GuildData>(`/guild/find?idx=${guildId}`)
}

export interface GuildChannel {
  id: string
  name: string
  type: number | string
  position: number
  parent_id: string | null
}

export async function fetchGuildChannels(guildId: string): Promise<GuildChannel[]> {
  const cacheKey = `dashboard:channels:${guildId}`
  const cached = await redis.get(cacheKey)
  if (cached) {
    return JSON.parse(cached) as GuildChannel[]
  }

  const channels = await clusterGet<GuildChannel[]>(`/guild/${guildId}/channels`)
  await redis.set(cacheKey, JSON.stringify(channels), 'EX', 120)
  return channels
}

export interface GuildRole {
  id: string
  name: string
  color: number
  position: number
  hoist: boolean
  managed: boolean
  mentionable: boolean
  permissions: string
  is_default: boolean
  is_bot_managed: boolean
  is_premium_subscriber: boolean
  is_integration: boolean
  icon_url: string | null
  unicode_emoji: string | null
  member_count: number
}

export async function fetchGuildRoles(guildId: string): Promise<GuildRole[]> {
  const cacheKey = `dashboard:roles:${guildId}`
  const cached = await redis.get(cacheKey)
  if (cached) {
    return JSON.parse(cached) as GuildRole[]
  }

  const roles = await clusterGet<GuildRole[]>(`/guild/${guildId}/roles`)
  await redis.set(cacheKey, JSON.stringify(roles), 'EX', 120)
  return roles
}

export interface GuildMember {
  guild_id: string
  user_id: string
  is_owner: boolean
  top_role_position: number
  role_ids: string[]
  permissions: string
}

export async function fetchGuildMember(
  guildId: string,
  userId: string
): Promise<GuildMember | null> {
  const cacheKey = `dashboard:member:${guildId}:${userId}`
  const cached = await redis.get(cacheKey)
  if (cached) {
    return JSON.parse(cached) as GuildMember
  }

  try {
    const member = await clusterGet<GuildMember>(`/guild/${guildId}/member/${userId}`)
    await redis.set(cacheKey, JSON.stringify(member), 'EX', 30)
    return member
  } catch {
    return null
  }
}

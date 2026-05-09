import redis from '@/lib/redis'

const CLUSTER_API = 'http://localhost:8000'

function safeParse<T>(text: string): T {
  const safe = text.replace(
    /"(id|guild_id|owner_id|user_id)":\s*(\d{15,})/g,
    '"$1":"$2"'
  )
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

/** Elara IPC uses `category_id`; dashboard code expects `parent_id`. */
function optionalSnowflake(v: unknown): string | null {
  if (v === null || v === undefined) return null
  if (typeof v === 'bigint') return String(v)
  if (typeof v === 'number' && Number.isFinite(v)) return String(Math.trunc(v))
  if (typeof v === 'string') {
    const t = v.trim()
    if (!t || t === 'null' || t === 'undefined') return null
    return t
  }
  return String(v).trim() || null
}

/**
 * Elara serializes `str(channel.type)` (discord.py). Normalize so TYPE_FILTERS in
 * settings routes match (`text`, `news`, numeric codes, etc.).
 */
function normalizeChannelTypeFromCluster(t: unknown): number | string {
  if (typeof t === 'number' && !Number.isNaN(t)) return t
  if (typeof t !== 'string') return String(t ?? '')
  const s = t.trim()
  const enumStrip = /^ChannelType\.(\w+)$/i.exec(s)
  if (enumStrip) return enumStrip[1].toLowerCase()
  const n = parseInt(s, 10)
  if (!Number.isNaN(n) && String(n) === s) return n
  return s
}

function normalizeGuildChannelsFromCluster(raw: unknown): GuildChannel[] {
  if (!Array.isArray(raw)) return []
  const out: GuildChannel[] = []
  for (const row of raw) {
    if (!row || typeof row !== 'object') continue
    const o = row as Record<string, unknown>
    const id = optionalSnowflake(o.id)
    if (!id) continue
    const parent_id =
      optionalSnowflake(o.parent_id) ??
      optionalSnowflake(o.parentId) ??
      optionalSnowflake(o.category_id) ??
      optionalSnowflake(o.categoryId)
    out.push({
      id,
      name: typeof o.name === 'string' ? o.name : String(o.name ?? ''),
      type: normalizeChannelTypeFromCluster(o.type),
      position: Number(o.position) || 0,
      parent_id,
    })
  }
  return out
}

export async function fetchGuildChannels(guildId: string): Promise<GuildChannel[]> {
  const cacheKey = `dashboard:channels:v2:${guildId}`
  const cached = await redis.get(cacheKey)
  if (cached) {
    return JSON.parse(cached) as GuildChannel[]
  }

  const raw = await clusterGet<unknown>(`/guild/${guildId}/channels`)
  const channels = normalizeGuildChannelsFromCluster(raw)
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

export interface VoicemasterDeleteResult {
  ok?: boolean
  channel_id?: string
  error?: string
}

export async function deleteVoicemasterChannel(
  guildId: string,
  channelId: string
): Promise<VoicemasterDeleteResult> {
  return clusterPost<VoicemasterDeleteResult>(
    `/guild/${guildId}/voicemaster/channels/${channelId}/delete`,
    {}
  )
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

/** Resolved via cluster bulk user lookup (bot cache). */
export interface ResolvedDiscordUser {
  user_id: string
  username: string
  display_name: string | null
  avatar: string | null
}

export async function fetchResolvedUsers(
  userIds: string[]
): Promise<ResolvedDiscordUser[]> {
  const unique = [...new Set(userIds)].slice(0, 100)
  if (unique.length === 0) return []

  const raw = await clusterPost<
    Array<{
      user_id: number | string
      username: string
      display_name?: string | null
      avatar?: string | null
    }>
  >('/users/find', { user_ids: unique })

  return raw.map((u) => ({
    user_id: String(u.user_id),
    username: u.username,
    display_name: u.display_name ?? null,
    avatar: u.avatar ?? null,
  }))
}

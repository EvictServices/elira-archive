import redis from '@/lib/redis'

/** Base URL for the bot/cluster HTTP API (no trailing slash). */
export const CLUSTER_API_BASE =
  (typeof process !== 'undefined' &&
    process.env.CLUSTER_API_URL &&
    String(process.env.CLUSTER_API_URL).replace(/\/$/, '')) ||
  'http://127.0.0.1:8000'

const CLUSTER_API = CLUSTER_API_BASE

function safeParse<T>(text: string): T {
  /** Quote large numeric snowflakes so JSON.parse does not lose precision (parent_id, etc.). */
  const safe = text.replace(
    /"(id|guild_id|owner_id|parent_id|parentId|channel_id|category_id)":\s*(\d{15,})/g,
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
  /** Discord vanity slug. Cluster JSON uses `vanity_code`; `fetchGuild` copies it here. */
  vanity_url_code?: string | null
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
  const raw = await clusterGet<GuildData & { vanity_code?: string | null }>(`/guild/find?idx=${guildId}`)
  const fromUrl = raw.vanity_url_code
  const fromCluster = raw.vanity_code
  const vanity =
    (typeof fromUrl === 'string' && fromUrl.trim() !== '' && fromUrl) ||
    (typeof fromCluster === 'string' && fromCluster.trim() !== '' && fromCluster) ||
    null
  return { ...raw, vanity_url_code: vanity }
}

export interface GuildChannel {
  id: string
  name: string
  type: number | string
  position: number
  parent_id: string | null
  member_count?: number
  connected_member_ids?: string[]
}

function normalizeSnowflakeInput(v: unknown): string {
  if (v === null || v === undefined) return ''
  if (typeof v === 'bigint') return String(v)
  if (typeof v === 'number' && Number.isFinite(v)) return String(Math.trunc(v))
  if (typeof v === 'string') {
    const t = v.trim()
    if (!t || t === 'null' || t === 'undefined') return ''
    return t
  }
  return String(v).trim()
}

/**
 * Cluster/API may use camelCase (`parentId`) or omit `parent_id`; dashboard UI expects `parent_id`.
 * Mirrors client parsing in SystemMessagesSettings (`parentIdFromChannelRow`).
 */
export function normalizeGuildChannel(raw: GuildChannel | Record<string, unknown>): GuildChannel {
  const o = raw as Record<string, unknown>
  const pickParent = (v: unknown): string | null => {
    if (v === undefined || v === null) return null
    if (typeof v === 'object' && v !== null && 'id' in v) {
      const s = normalizeSnowflakeInput((v as { id: unknown }).id)
      return s || null
    }
    const s = normalizeSnowflakeInput(v)
    return s || null
  }
  const parent_id =
    pickParent(o.parent_id) ??
    pickParent(o.parentId) ??
    pickParent(o.category_id) ??
    pickParent(o.categoryId) ??
    pickParent(o.parent)

  const idRaw = normalizeSnowflakeInput(o.id)
  const id = idRaw || String(o.id ?? '')

  const member_count =
    typeof o.member_count === 'number' && !Number.isNaN(o.member_count)
      ? o.member_count
      : undefined
  let connected_member_ids: string[] | undefined
  const rawIds = o.connected_member_ids
  if (Array.isArray(rawIds)) {
    const ids = rawIds
      .map((x) => normalizeSnowflakeInput(x))
      .filter((x) => x.length > 0)
    if (ids.length > 0) connected_member_ids = ids
  }

  return {
    id,
    name: typeof o.name === 'string' ? o.name : String(o.name ?? ''),
    type: (o.type ?? 0) as number | string,
    position: typeof o.position === 'number' ? o.position : Number(o.position) || 0,
    parent_id,
    ...(member_count !== undefined ? { member_count } : {}),
    ...(connected_member_ids ? { connected_member_ids } : {}),
  }
}

export async function fetchGuildChannels(guildId: string): Promise<GuildChannel[]> {
  const cacheKey = `dashboard:channels:v4:${guildId}`
  const cached = await redis.get(cacheKey)
  if (cached) {
    const parsed = JSON.parse(cached) as GuildChannel[]
    return parsed.map(normalizeGuildChannel)
  }

  const channels = await clusterGet<GuildChannel[]>(`/guild/${guildId}/channels`)
  const normalized = channels.map(normalizeGuildChannel)
  await redis.set(cacheKey, JSON.stringify(normalized), 'EX', 120)
  return normalized
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

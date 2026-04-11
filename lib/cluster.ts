const CLUSTER_API = 'http://localhost:8000'

/**
 * Parse JSON text, converting large numeric IDs (snowflakes) to strings
 * to avoid JavaScript Number precision loss.
 */
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
  return clusterGet<GuildChannel[]>(`/guild/${guildId}/channels`)
}

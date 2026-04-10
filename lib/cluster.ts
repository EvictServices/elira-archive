const CLUSTER_API = 'http://localhost:8000'

export async function clusterGet<T>(path: string): Promise<T> {
  const res = await fetch(`${CLUSTER_API}${path}`, {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  })
  if (!res.ok) {
    throw new Error(`Cluster API ${path} failed: ${res.status}`)
  }
  return res.json() as Promise<T>
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
  return res.json() as Promise<T>
}

export interface MutualGuild {
  id: number
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

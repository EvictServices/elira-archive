import { fetchGuild } from '@/lib/cluster/client'
import { vanityJoinUrl } from '@/lib/discord/urls'
import redis from '@/lib/infra/redis'

export type TopGuild = {
  id: string
  name: string
  member_count: number
  icon_url: string | null
  vanity_code: string | null
  join_url: string | null
}

const CACHE_KEY = 'website:top_guilds:v2'
const CACHE_TTL_SEC = 120

function parseGuildList(raw: string): RawGuild[] {
  const safe = raw.replace(/"id":\s*(\d{15,})/g, '"id":"$1"')
  const list = JSON.parse(safe) as RawGuild[]
  return Array.isArray(list) ? list : []
}

async function clusterGuildKeys(): Promise<string[]> {
  const keys: string[] = []
  let cursor = '0'
  do {
    const [next, batch] = await redis.scan(cursor, 'MATCH', 'cluster:guilds:*', 'COUNT', 64)
    cursor = next
    keys.push(...batch)
  } while (cursor !== '0')
  return keys
}

type RawGuild = {
  id: number | string
  name: string
  member_count?: number
  icon_url?: string
}

export async function fetchTopGuilds(limit = 24): Promise<TopGuild[]> {
  const cached = await redis.get(CACHE_KEY)
  if (cached) {
    try {
      return JSON.parse(cached) as TopGuild[]
    } catch {
      await redis.del(CACHE_KEY)
    }
  }

  const keys = await clusterGuildKeys()
  const byId = new Map<string, TopGuild>()

  for (const key of keys) {
    const raw = await redis.get(key)
    if (!raw) continue
    let list: RawGuild[]
    try {
      list = parseGuildList(raw)
    } catch {
      continue
    }

    for (const g of list) {
      const id = String(g.id).trim()
      if (!id) continue
      const member_count = g.member_count ?? 0
      const prev = byId.get(id)
      if (prev && prev.member_count >= member_count) continue
      const icon = g.icon_url?.trim()
      byId.set(id, {
        id,
        name: g.name,
        member_count,
        icon_url: icon ? icon : null,
        vanity_code: null,
        join_url: null,
      })
    }
  }

  const top = [...byId.values()]
    .sort((a, b) => b.member_count - a.member_count)
    .slice(0, limit)

  const enriched = await Promise.all(
    top.map(async (guild) => {
      try {
        const full = await fetchGuild(guild.id)
        const code =
          (typeof full.vanity_url_code === 'string' && full.vanity_url_code.trim()) || null
        return {
          ...guild,
          vanity_code: code,
          join_url: code ? vanityJoinUrl(code) : null,
        }
      } catch {
        return guild
      }
    })
  )

  await redis.set(CACHE_KEY, JSON.stringify(enriched), 'EX', CACHE_TTL_SEC)
  return enriched
}

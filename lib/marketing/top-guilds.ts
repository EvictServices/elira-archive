import { unstable_cache } from 'next/cache'
import { CLUSTER_API_BASE } from '@/lib/cluster/config'
import { fetchGuild } from '@/lib/cluster/client'
import { vanityJoinUrl } from '@/lib/discord/urls'
import redis from '@/lib/infra/redis'
import { TOP_GUILDS_CACHE_TTL_SEC, type TopGuild } from '@/lib/marketing/top-guilds-shared'

export type { TopGuild } from '@/lib/marketing/top-guilds-shared'
export { TOP_GUILDS_CACHE_TTL_SEC as CACHE_TTL_SEC } from '@/lib/marketing/top-guilds-shared'

const CACHE_KEY = 'website:top_guilds:v2'
const CACHE_TTL_SEC = TOP_GUILDS_CACHE_TTL_SEC
const ENRICH_BATCH_SIZE = 4

type ClusterTopGuild = {
  id: string | number
  name: string
  member_count: number
  icon_url?: string | null
}

async function fetchTopGuildsFromCluster(limit: number): Promise<TopGuild[]> {
  const res = await fetch(`${CLUSTER_API_BASE}/guilds/top?limit=${limit}`, {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  })
  if (!res.ok) return []

  const data = (await res.json()) as ClusterTopGuild[]
  if (!Array.isArray(data)) return []

  return data.map((g) => {
    const id = String(g.id).trim()
    const icon = typeof g.icon_url === 'string' ? g.icon_url.trim() : ''
    return {
      id,
      name: g.name || 'Unknown',
      member_count: g.member_count ?? 0,
      icon_url: icon || null,
      vanity_code: null,
      join_url: null,
    }
  })
}

async function enrichGuildsBatch(guilds: TopGuild[]): Promise<TopGuild[]> {
  const out: TopGuild[] = []
  for (let i = 0; i < guilds.length; i += ENRICH_BATCH_SIZE) {
    const batch = guilds.slice(i, i + ENRICH_BATCH_SIZE)
    const enriched = await Promise.all(
      batch.map(async (guild) => {
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
      }),
    )
    out.push(...enriched)
  }
  return out
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

  const top = await fetchTopGuildsFromCluster(limit)
  if (!top.length) return []

  const enriched = await enrichGuildsBatch(top)

  await redis.set(CACHE_KEY, JSON.stringify(enriched), 'EX', CACHE_TTL_SEC)
  return enriched
}

/** Next.js data cache for the landing carousel (aligned with Redis TTL). */
export const getCachedTopGuilds = unstable_cache(
  async () => fetchTopGuilds(24),
  ['marketing-top-guilds-v3'],
  { revalidate: CACHE_TTL_SEC },
)

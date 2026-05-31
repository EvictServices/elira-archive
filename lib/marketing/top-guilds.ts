import { unstable_cache } from 'next/cache'
import { fetchGuild } from '@/lib/cluster/client'
import { vanityJoinUrl } from '@/lib/discord/urls'
import redis from '@/lib/infra/redis'
import { TOP_GUILDS_CACHE_TTL_SEC, type TopGuild } from '@/lib/marketing/top-guilds-shared'

export type { TopGuild } from '@/lib/marketing/top-guilds-shared'
export { TOP_GUILDS_CACHE_TTL_SEC as CACHE_TTL_SEC } from '@/lib/marketing/top-guilds-shared'

const CACHE_KEY = 'website:top_guilds:v2'
const CACHE_TTL_SEC = TOP_GUILDS_CACHE_TTL_SEC
/** Cap in-memory candidates while scanning shard keys (avoids huge Maps on cache miss). */
const SCAN_CANDIDATE_CAP = 80
const ENRICH_BATCH_SIZE = 4

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

function mergeCandidate(candidates: TopGuild[], entry: TopGuild) {
  const idx = candidates.findIndex((g) => g.id === entry.id)
  if (idx >= 0) {
    if (entry.member_count > candidates[idx].member_count) candidates[idx] = entry
    return
  }
  candidates.push(entry)
  if (candidates.length > SCAN_CANDIDATE_CAP) {
    candidates.sort((a, b) => b.member_count - a.member_count)
    candidates.length = SCAN_CANDIDATE_CAP
  }
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

  const keys = await clusterGuildKeys()
  const candidates: TopGuild[] = []

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
      const icon = g.icon_url?.trim()
      mergeCandidate(candidates, {
        id,
        name: g.name,
        member_count,
        icon_url: icon ? icon : null,
        vanity_code: null,
        join_url: null,
      })
    }
  }

  const top = candidates
    .sort((a, b) => b.member_count - a.member_count)
    .slice(0, limit)

  const enriched = await enrichGuildsBatch(top)

  await redis.set(CACHE_KEY, JSON.stringify(enriched), 'EX', CACHE_TTL_SEC)
  return enriched
}

/** Next.js data cache for the landing carousel (aligned with Redis TTL). */
export const getCachedTopGuilds = unstable_cache(
  async () => fetchTopGuilds(24),
  ['marketing-top-guilds-v2'],
  { revalidate: CACHE_TTL_SEC },
)

import { NextResponse } from 'next/server'
import http from 'http'

const SOURCE_URL = 'http://127.0.0.1:8001/guilds'
const UPSTREAM_TIMEOUT = 5000
const CACHE_TTL_MS = 5 * 60 * 1000

type GuildRecord = {
  id: string
  name: string
  icon?: string | null
  members: number
}

let cachedGuilds: GuildRecord[] = []
let cacheTs = 0

function toNumber(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : 0
  }
  return 0
}

function resolveMembers(raw: Record<string, unknown>): number {
  return (
    toNumber(raw.members) ||
    toNumber(raw.member_count) ||
    toNumber(raw.approximate_member_count) ||
    toNumber(raw.total_members) ||
    0
  )
}

function normalizeGuild(raw: unknown): GuildRecord | null {
  if (!raw || typeof raw !== 'object') return null
  const item = raw as Record<string, unknown>

  const idValue = item.id ?? item.guild_id
  const id = typeof idValue === 'string' || typeof idValue === 'number' ? String(idValue) : ''
  const name = typeof item.name === 'string' ? item.name : ''
  if (!id || !name) return null

  const iconCandidates = [item.icon_url, item.icon, item.iconURL, item.avatar]
  const icon = iconCandidates.find((v) => typeof v === 'string') as string | undefined

  return {
    id,
    name,
    icon: icon ?? null,
    members: resolveMembers(item),
  }
}

function parseGuilds(payload: unknown): GuildRecord[] {
  const source = Array.isArray(payload)
    ? payload
    : Array.isArray((payload as { guilds?: unknown[] })?.guilds)
      ? (payload as { guilds: unknown[] }).guilds
      : []

  return source
    .map(normalizeGuild)
    .filter((g): g is GuildRecord => Boolean(g))
    .sort((a, b) => b.members - a.members)
}

function getUpstreamGuilds(): Promise<GuildRecord[]> {
  return new Promise((resolve, reject) => {
    const req = http
      .get(SOURCE_URL, { headers: { Accept: 'application/json' }, timeout: UPSTREAM_TIMEOUT }, (upstream) => {
        let data = ''
        upstream.on('data', (chunk: Buffer) => {
          data += chunk
        })
        upstream.on('end', () => {
          try {
            const parsed = JSON.parse(data)
            resolve(parseGuilds(parsed))
          } catch {
            reject(new Error('parse error'))
          }
        })
      })
      .on('timeout', () => {
        req.destroy()
        reject(new Error('upstream timeout'))
      })
      .on('error', () => reject(new Error('upstream error')))
  })
}

export async function GET() {
  const now = Date.now()
  if (cacheTs && now - cacheTs < CACHE_TTL_MS) {
    return NextResponse.json(
      { guilds: cachedGuilds, cached: true, refreshedAt: cacheTs },
      { headers: { 'Cache-Control': 'public, max-age=300, s-maxage=300, stale-while-revalidate=120' } }
    )
  }

  try {
    const guilds = await getUpstreamGuilds()
    cachedGuilds = guilds
    cacheTs = Date.now()

    return NextResponse.json(
      { guilds, cached: false, refreshedAt: cacheTs },
      { headers: { 'Cache-Control': 'public, max-age=300, s-maxage=300, stale-while-revalidate=120' } }
    )
  } catch {
    if (cachedGuilds.length > 0) {
      return NextResponse.json(
        { guilds: cachedGuilds, cached: true, stale: true, refreshedAt: cacheTs },
        { headers: { 'Cache-Control': 'public, max-age=60, s-maxage=60, stale-while-revalidate=120' } }
      )
    }

    return NextResponse.json({ guilds: [], error: 'unavailable' }, { status: 502 })
  }
}

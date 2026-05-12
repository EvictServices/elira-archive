import pool from '@/lib/db'
import redis from '@/lib/redis'
import { CLUSTER_API_BASE, fetchGuildChannels, type GuildChannel } from '@/lib/cluster'
import { fetchUserInfoBatch } from '@/lib/fetchUsers'

function clusterJsonParse<T>(text: string): T {
  const safe = text.replace(/"(id|guild_id|owner_id)":\s*(\d{15,})/g, '"$1":"$2"')
  return JSON.parse(safe) as T
}

export const REGIONS = [
  'brazil',
  'hongkong',
  'india',
  'japan',
  'rotterdam',
  'russia',
  'singapore',
  'south-korea',
  'southafrica',
  'sydney',
  'us-central',
  'us-east',
  'us-south',
  'us-west',
] as const

export type Region = (typeof REGIONS)[number]

export const MIN_BITRATE_KBPS = 8
export const MAX_BITRATE_KBPS = 384

export interface VoicemasterConfiguration {
  guild_id: string
  category_id: string | null
  interface_id: string | null
  channel_id: string | null
  role_id: string | null
  region: Region | null
  bitrate: number | null
  interface_layout: string
}

export interface VoicemasterChannel {
  guild_id: string
  channel_id: string
  owner_id: string | null
}

function configCacheKey(guildId: string): string {
  return `voicemaster:config:${guildId}`
}

function channelCacheKey(channelId: string): string {
  return `voicemaster:channel:${channelId}`
}

async function invalidateConfigCache(guildId: string): Promise<void> {
  await redis.del(configCacheKey(guildId))
}

async function invalidateChannelCache(channelId: string): Promise<void> {
  await redis.del(channelCacheKey(channelId))
}

function rowToConfiguration(row: Record<string, unknown>): VoicemasterConfiguration {
  return {
    guild_id: String(row.guild_id),
    category_id: row.category_id == null ? null : String(row.category_id),
    interface_id: row.interface_id == null ? null : String(row.interface_id),
    channel_id: row.channel_id == null ? null : String(row.channel_id),
    role_id: row.role_id == null ? null : String(row.role_id),
    region: (row.region as Region | null) ?? null,
    bitrate: row.bitrate == null ? null : Number(row.bitrate),
    interface_layout: (row.interface_layout as string) ?? 'default',
  }
}

function rowToChannel(row: Record<string, unknown>): VoicemasterChannel {
  return {
    guild_id: String(row.guild_id),
    channel_id: String(row.channel_id),
    owner_id: row.owner_id == null ? null : String(row.owner_id),
  }
}

export async function getConfiguration(
  guildId: string
): Promise<VoicemasterConfiguration | null> {
  const res = await pool.query(
    `SELECT * FROM voicemaster.configuration WHERE guild_id = $1`,
    [guildId]
  )

  if (res.rows.length === 0) return null
  return rowToConfiguration(res.rows[0])
}

export async function createConfiguration(
  guildId: string,
  categoryId: string,
  interfaceId: string,
  channelId: string
): Promise<VoicemasterConfiguration> {
  const res = await pool.query(
    `INSERT INTO voicemaster.configuration (guild_id, category_id, interface_id, channel_id)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [guildId, categoryId, interfaceId, channelId]
  )

  await invalidateConfigCache(guildId)
  return rowToConfiguration(res.rows[0])
}

export interface DeletedConfiguration {
  category_id: string | null
  interface_id: string | null
  channel_id: string | null
}

export async function deleteConfiguration(
  guildId: string
): Promise<DeletedConfiguration | null> {
  const res = await pool.query(
    `DELETE FROM voicemaster.configuration
     WHERE guild_id = $1
     RETURNING category_id, interface_id, channel_id`,
    [guildId]
  )

  await invalidateConfigCache(guildId)

  if (res.rows.length === 0) return null
  const row = res.rows[0]
  return {
    category_id: row.category_id == null ? null : String(row.category_id),
    interface_id: row.interface_id == null ? null : String(row.interface_id),
    channel_id: row.channel_id == null ? null : String(row.channel_id),
  }
}

async function ensureConfigured(guildId: string): Promise<void> {
  const existing = await pool.query(
    `SELECT 1 FROM voicemaster.configuration WHERE guild_id = $1 LIMIT 1`,
    [guildId]
  )
  if (existing.rows.length === 0) {
    throw new Error('VoiceMaster is not configured for this server')
  }
}

export async function updateCategory(
  guildId: string,
  categoryId: string | null
): Promise<void> {
  await ensureConfigured(guildId)
  await pool.query(
    `UPDATE voicemaster.configuration SET category_id = $2 WHERE guild_id = $1`,
    [guildId, categoryId]
  )
  await invalidateConfigCache(guildId)
}

export async function updateChannel(
  guildId: string,
  channelId: string
): Promise<void> {
  await ensureConfigured(guildId)
  await pool.query(
    `UPDATE voicemaster.configuration SET channel_id = $2 WHERE guild_id = $1`,
    [guildId, channelId]
  )
  await invalidateConfigCache(guildId)
}

export async function updateRole(
  guildId: string,
  roleId: string | null
): Promise<void> {
  await ensureConfigured(guildId)
  await pool.query(
    `UPDATE voicemaster.configuration SET role_id = $2 WHERE guild_id = $1`,
    [guildId, roleId]
  )
  await invalidateConfigCache(guildId)
}

export async function updateRegion(
  guildId: string,
  region: Region | null
): Promise<void> {
  if (region !== null && !REGIONS.includes(region)) {
    throw new Error(`Region must be one of: ${REGIONS.join(', ')}`)
  }
  await ensureConfigured(guildId)
  await pool.query(
    `UPDATE voicemaster.configuration SET region = $2 WHERE guild_id = $1`,
    [guildId, region]
  )
  await invalidateConfigCache(guildId)
}

export async function updateBitrate(
  guildId: string,
  bitrateKbps: number | null
): Promise<void> {
  if (bitrateKbps !== null) {
    if (!Number.isFinite(bitrateKbps)) {
      throw new Error('Bitrate must be a number')
    }
    if (bitrateKbps < MIN_BITRATE_KBPS || bitrateKbps > MAX_BITRATE_KBPS) {
      throw new Error(
        `Bitrate must be between ${MIN_BITRATE_KBPS} and ${MAX_BITRATE_KBPS} kbps`
      )
    }
  }
  await ensureConfigured(guildId)
  await pool.query(
    `UPDATE voicemaster.configuration SET bitrate = $2 WHERE guild_id = $1`,
    [guildId, bitrateKbps == null ? null : bitrateKbps * 1000]
  )
  await invalidateConfigCache(guildId)
}

export async function getChannels(guildId: string): Promise<VoicemasterChannel[]> {
  const res = await pool.query(
    `SELECT guild_id, channel_id, owner_id
     FROM voicemaster.channels
     WHERE guild_id = $1
     ORDER BY channel_id`,
    [guildId]
  )
  return res.rows.map(rowToChannel)
}

export interface EnrichedVoicemasterChannel {
  guild_id: string
  channel_id: string
  owner_id: string | null
  name: string | null
  member_count: number | null
  bitrate: number | null
  user_limit: number | null
  exists: boolean
  owner_username: string | null
  owner_avatar: string | null
}

export async function getEnrichedChannels(
  guildId: string
): Promise<EnrichedVoicemasterChannel[]> {
  const base = await getChannels(guildId)
  let live: GuildChannel[] = []
  try {
    live = await fetchGuildChannels(guildId)
  } catch {
    live = []
  }
  const liveById = new Map(live.map((c) => [String(c.id), c]))

  const ownerIds = [
    ...new Set(
      base
        .map((r) => r.owner_id)
        .filter((id): id is string => typeof id === 'string' && id.trim() !== '')
    ),
  ]
  const userMap = await fetchUserInfoBatch(ownerIds)

  return base.map((row) => {
    const ch = liveById.get(row.channel_id) as
      | (GuildChannel & {
          member_count?: number
          bitrate?: number
          user_limit?: number
        })
      | undefined
    const oid = row.owner_id?.trim() ? row.owner_id : null
    const u = oid ? userMap.get(oid) : undefined
    return {
      guild_id: row.guild_id,
      channel_id: row.channel_id,
      owner_id: row.owner_id,
      name: ch?.name ?? null,
      member_count: ch?.member_count ?? null,
      bitrate: ch?.bitrate ?? null,
      user_limit: ch?.user_limit ?? null,
      exists: !!ch,
      owner_username: u?.username?.trim() || null,
      owner_avatar: u?.avatar?.trim() ? u.avatar.trim() : null,
    }
  })
}

export async function getAllChannels(): Promise<VoicemasterChannel[]> {
  const res = await pool.query(
    `SELECT guild_id, channel_id, owner_id FROM voicemaster.channels`
  )
  return res.rows.map(rowToChannel)
}

export async function getChannelOwner(channelId: string): Promise<string | null> {
  const res = await pool.query(
    `SELECT owner_id FROM voicemaster.channels WHERE channel_id = $1`,
    [channelId]
  )
  if (res.rows.length === 0 || res.rows[0].owner_id == null) return null
  return String(res.rows[0].owner_id)
}

export async function createChannel(
  guildId: string,
  channelId: string,
  ownerId: string
): Promise<void> {
  await pool.query(
    `INSERT INTO voicemaster.channels (guild_id, channel_id, owner_id)
     VALUES ($1, $2, $3)`,
    [guildId, channelId, ownerId]
  )
  await invalidateChannelCache(channelId)
}

export async function deleteChannel(channelId: string): Promise<string | null> {
  const res = await pool.query(
    `DELETE FROM voicemaster.channels
     WHERE channel_id = $1
     RETURNING owner_id`,
    [channelId]
  )
  await invalidateChannelCache(channelId)

  if (res.rows.length === 0 || res.rows[0].owner_id == null) return null
  return String(res.rows[0].owner_id)
}

export async function deleteChannels(channelIds: string[]): Promise<void> {
  if (channelIds.length === 0) return
  await pool.query(
    `DELETE FROM voicemaster.channels WHERE channel_id = ANY($1::bigint[])`,
    [channelIds]
  )
  for (const id of channelIds) {
    await invalidateChannelCache(id)
  }
}

export async function updateChannelOwner(
  channelId: string,
  ownerId: string
): Promise<void> {
  await pool.query(
    `UPDATE voicemaster.channels SET owner_id = $2 WHERE channel_id = $1`,
    [channelId, ownerId]
  )
  await invalidateChannelCache(channelId)
}

/** Bot/cluster: disconnect members and delete the Discord voice channel (VoiceMaster temp channel). */
export interface VoicemasterChannelDeleteResult {
  ok: boolean
  error?: string
  /** Bot-reported count of members disconnected from the voice channel. */
  disconnected_count?: number
  /** Bot-reported user IDs disconnected (when the cluster returns them). */
  disconnected_user_ids?: string[]
}

function normalizeDisconnectedUserIds(raw: unknown): string[] | undefined {
  if (!Array.isArray(raw)) return undefined
  const ids = raw.map((x) => String(x).trim()).filter(Boolean)
  return ids.length ? ids : undefined
}

function parseVoicemasterDeleteBody(
  text: string,
  resOk: boolean,
  httpStatus: number
): VoicemasterChannelDeleteResult | null {
  if (!text.trim()) return null
  try {
    const raw = clusterJsonParse<Record<string, unknown>>(text)
    const okFlag: boolean | undefined =
      typeof raw.ok === 'boolean'
        ? raw.ok
        : raw.success === true
          ? true
          : raw.status === 'ok'
            ? true
            : undefined
    if (okFlag === undefined && !resOk) {
      const msg =
        typeof raw.error === 'string'
          ? raw.error
          : typeof raw.message === 'string'
            ? raw.message
            : typeof raw.detail === 'string'
              ? raw.detail
              : `Cluster API failed (${httpStatus})`
      return { ok: false, error: msg }
    }
    if (okFlag === undefined) return null
    const alt =
      normalizeDisconnectedUserIds(raw.disconnected_user_ids) ??
      normalizeDisconnectedUserIds(raw.disconnected_users) ??
      normalizeDisconnectedUserIds(raw.user_ids)
    let count = raw.disconnected_count
    if (typeof count !== 'number' && alt) count = alt.length
    return {
      ok: okFlag,
      error: typeof raw.error === 'string' ? raw.error : undefined,
      disconnected_count: typeof count === 'number' ? count : undefined,
      disconnected_user_ids: alt,
    }
  } catch {
    if (!resOk) {
      return { ok: false, error: 'Invalid response from cluster' }
    }
    return null
  }
}

export async function deleteVoicemasterChannel(
  guildId: string,
  channelId: string
): Promise<VoicemasterChannelDeleteResult> {
  const body = JSON.stringify({ channel_id: channelId, guild_id: guildId })
  const primaryPath = `/guild/${guildId}/voicemaster/channel/delete`
  const fallbackPath = `/guild/${guildId}/voicemaster/delete_channel`

  async function tryPath(path: string): Promise<{ res: Response; text: string }> {
    const res = await fetch(`${CLUSTER_API_BASE}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body,
      cache: 'no-store',
    })
    const text = await res.text()
    return { res, text }
  }

  try {
    let { res, text } = await tryPath(primaryPath)
    if (res.status === 404) {
      ;({ res, text } = await tryPath(fallbackPath))
    }

    const parsed = parseVoicemasterDeleteBody(text, res.ok, res.status)
    if (parsed) return parsed

    if (!res.ok) {
      return {
        ok: false,
        error: `Cluster API failed (${res.status})`,
      }
    }
    return { ok: true }
  } catch (e) {
    return {
      ok: false,
      error:
        e instanceof Error ? e.message : 'Could not reach cluster (check CLUSTER_API_URL)',
    }
  }
}

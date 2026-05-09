import pool from '@/lib/db'
import redis from '@/lib/redis'

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

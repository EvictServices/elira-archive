import pool from '@/lib/db'
import redis from '@/lib/redis'
import { xxh32 } from '@/lib/hash'

export const EVENT_TYPES = [
  'MESSAGE',
  'MEMBER',
  'ROLE',
  'CHANNEL',
  'INVITE',
  'MODERATION',
  'VOICE',
  'EMOJI',
  'STICKER',
] as const

export type EventType = (typeof EVENT_TYPES)[number]

export interface LoggingChannel {
  channel_id: string
  events: string[]
}

export interface LoggingSettings {
  channels: LoggingChannel[]
  ignored: string[]
}

function cacheKey(guildId: string): string {
  return xxh32(`logging:${guildId}`)
}

function ignoredCacheKey(guildId: string): string {
  return xxh32(`logging_ignored:${guildId}`)
}

export async function getLoggingSettings(guildId: string): Promise<LoggingSettings> {
  const key = cacheKey(guildId)

  const cached = await redis.get(key)
  if (cached) {
    const data = typeof cached === 'string' ? JSON.parse(cached) : cached
    return data as LoggingSettings
  }

  const channelRes = await pool.query(
    'SELECT channel_id, events FROM logging WHERE guild_id = $1',
    [guildId]
  )

  const ignoredRes = await pool.query(
    'SELECT target_id FROM ignored_logging WHERE guild_id = $1',
    [guildId]
  )

  const settings: LoggingSettings = {
    channels: channelRes.rows.map((r) => ({
      channel_id: String(r.channel_id),
      events: r.events || [],
    })),
    ignored: ignoredRes.rows.map((r) => String(r.target_id)),
  }

  await redis.set(key, JSON.stringify(settings))
  return settings
}

async function invalidateCache(guildId: string) {
  await redis.del(cacheKey(guildId))
  // Invalidate bot's cashews cache keys
  const keys = await redis.keys(`logging:channels:${guildId}:*`)
  const listKey = `logging:list:${guildId}`
  const configKeys = await redis.keys(`logging:config:${guildId}:*`)
  const allKeys = [...keys, listKey, ...configKeys]
  if (allKeys.length > 0) {
    await redis.del(...allKeys)
  }
}

export async function setLoggingEvents(
  guildId: string,
  channelId: string,
  events: string[]
): Promise<void> {
  const invalid = events.filter((e) => !EVENT_TYPES.includes(e as EventType))
  if (invalid.length > 0) {
    throw new Error(`Invalid event types: ${invalid.join(', ')}`)
  }

  await pool.query(
    `INSERT INTO logging (guild_id, channel_id, events)
     VALUES ($1, $2, $3)
     ON CONFLICT (guild_id, channel_id) DO UPDATE SET events = EXCLUDED.events`,
    [guildId, channelId, events]
  )

  await invalidateCache(guildId)
}

export async function deleteLoggingChannel(
  guildId: string,
  channelId: string
): Promise<void> {
  await pool.query(
    'DELETE FROM logging WHERE guild_id = $1 AND channel_id = $2',
    [guildId, channelId]
  )

  await invalidateCache(guildId)
}

export async function addIgnored(
  guildId: string,
  targetId: string
): Promise<void> {
  await pool.query(
    `INSERT INTO ignored_logging (guild_id, target_id)
     VALUES ($1, $2) ON CONFLICT (guild_id, target_id) DO NOTHING`,
    [guildId, targetId]
  )

  await redis.del(ignoredCacheKey(guildId))
  await invalidateCache(guildId)
}

export async function removeIgnored(
  guildId: string,
  targetId: string
): Promise<void> {
  await pool.query(
    'DELETE FROM ignored_logging WHERE guild_id = $1 AND target_id = $2',
    [guildId, targetId]
  )

  await redis.del(ignoredCacheKey(guildId))
  await invalidateCache(guildId)
}

export async function setEventChannel(
  guildId: string,
  event: string,
  channelId: string | null
): Promise<void> {
  if (!EVENT_TYPES.includes(event as EventType)) {
    throw new Error(`Invalid event type: ${event}`)
  }

  const existing = await pool.query(
    'SELECT channel_id, events FROM logging WHERE guild_id = $1',
    [guildId]
  )

  for (const row of existing.rows) {
    const events: string[] = row.events || []
    if (events.includes(event)) {
      const remaining = events.filter((e: string) => e !== event)
      if (remaining.length === 0) {
        await pool.query(
          'DELETE FROM logging WHERE guild_id = $1 AND channel_id = $2',
          [guildId, row.channel_id]
        )
      } else {
        await pool.query(
          'UPDATE logging SET events = $3 WHERE guild_id = $1 AND channel_id = $2',
          [guildId, row.channel_id, remaining]
        )
      }
    }
  }

  if (channelId) {
    const target = existing.rows.find(
      (r) => String(r.channel_id) === channelId
    )
    if (target) {
      const events: string[] = target.events || []
      if (!events.includes(event)) {
        await pool.query(
          'UPDATE logging SET events = array_append(events, $3) WHERE guild_id = $1 AND channel_id = $2',
          [guildId, channelId, event]
        )
      }
    } else {
      await pool.query(
        'INSERT INTO logging (guild_id, channel_id, events) VALUES ($1, $2, $3)',
        [guildId, channelId, [event]]
      )
    }
  }

  await invalidateCache(guildId)
}

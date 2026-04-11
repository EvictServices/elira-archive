import pool from '@/lib/db'
import redis from '@/lib/redis'
import { xxh32 } from '@/lib/hash'

export interface AntinukeModule {
  threshold: number
  duration: number
  punishment: 'ban' | 'kick' | 'strip'
}

export interface AntinukeSettings {
  whitelist: string[]
  trusted_admins: string[]
  bot: boolean
  ban: AntinukeModule | null
  kick: AntinukeModule | null
  role: AntinukeModule | null
  channel: AntinukeModule | null
  webhook: AntinukeModule | null
  emoji: AntinukeModule | null
}

const MODULE_NAMES = ['ban', 'kick', 'role', 'channel', 'webhook', 'emoji'] as const
type ModuleName = (typeof MODULE_NAMES)[number]

function cacheKey(guildId: string): string {
  return xxh32(`antinuke:${guildId}`)
}

function parseModule(val: unknown): AntinukeModule | null {
  if (!val || typeof val !== 'object') return null
  const m = val as Record<string, unknown>
  return {
    threshold: Number(m.threshold) || 5,
    duration: Number(m.duration) || 60,
    punishment: (['ban', 'kick', 'strip'].includes(m.punishment as string)
      ? m.punishment
      : 'ban') as AntinukeModule['punishment'],
  }
}

function rowToSettings(row: Record<string, unknown>): AntinukeSettings {
  return {
    whitelist: ((row.whitelist as string[]) || []).map(String),
    trusted_admins: ((row.trusted_admins as string[]) || []).map(String),
    bot: Boolean(row.bot),
    ban: parseModule(row.ban),
    kick: parseModule(row.kick),
    role: parseModule(row.role),
    channel: parseModule(row.channel),
    webhook: parseModule(row.webhook),
    emoji: parseModule(row.emoji),
  }
}

function settingsToCache(settings: AntinukeSettings): string {
  return JSON.stringify({
    whitelist: settings.whitelist.map(Number),
    trusted_admins: settings.trusted_admins.map(Number),
    bot: settings.bot,
    ban: settings.ban,
    kick: settings.kick,
    role: settings.role,
    channel: settings.channel,
    webhook: settings.webhook,
    emoji: settings.emoji,
  })
}

export async function getAntinukeSettings(guildId: string): Promise<AntinukeSettings> {
  const key = cacheKey(guildId)

  const cached = await redis.get(key)
  if (cached) {
    const data = typeof cached === 'string' ? JSON.parse(cached) : cached
    return rowToSettings(data)
  }

  const res = await pool.query('SELECT * FROM antinuke WHERE guild_id = $1', [guildId])

  if (res.rows.length === 0) {
    const insert = await pool.query(
      'INSERT INTO antinuke (guild_id) VALUES ($1) RETURNING *',
      [guildId]
    )
    const settings = rowToSettings(insert.rows[0])
    await redis.set(key, settingsToCache(settings), 'EX', 300)
    return settings
  }

  const settings = rowToSettings(res.rows[0])
  await redis.set(key, settingsToCache(settings), 'EX', 300)
  return settings
}

export async function isAntinukeAdmin(guildId: string, userId: string): Promise<boolean> {
  const settings = await getAntinukeSettings(guildId)
  if (settings.trusted_admins.includes(userId)) return true

  try {
    const { fetchGuild } = await import('@/lib/cluster')
    const guild = await fetchGuild(guildId)
    if (guild.owner_id === userId) return true
  } catch {}

  return false
}

export async function updateAntinukeModule(
  guildId: string,
  moduleName: string,
  config: AntinukeModule | null
): Promise<void> {
  if (!MODULE_NAMES.includes(moduleName as ModuleName)) {
    throw new Error(`Invalid module: ${moduleName}`)
  }

  if (config) {
    if (config.threshold < 1 || config.threshold > 100) {
      throw new Error('Threshold must be between 1 and 100')
    }
    if (config.duration < 1 || config.duration > 86400) {
      throw new Error('Duration must be between 1 and 86400 seconds')
    }
    if (!['ban', 'kick', 'strip'].includes(config.punishment)) {
      throw new Error('Punishment must be ban, kick, or strip')
    }
  }

  await pool.query(
    `UPDATE antinuke SET ${moduleName} = $2 WHERE guild_id = $1`,
    [guildId, config ? JSON.stringify(config) : null]
  )

  const key = cacheKey(guildId)
  await redis.del(key)
}

export async function updateAntinukeBotToggle(
  guildId: string,
  toggle: boolean
): Promise<void> {
  await pool.query(
    'UPDATE antinuke SET bot = $2 WHERE guild_id = $1',
    [guildId, toggle]
  )

  const key = cacheKey(guildId)
  await redis.del(key)
}

export async function updateAntinukeWhitelist(
  guildId: string,
  ids: string[]
): Promise<void> {
  await pool.query(
    'UPDATE antinuke SET whitelist = $2 WHERE guild_id = $1',
    [guildId, ids.map(Number)]
  )

  const key = cacheKey(guildId)
  await redis.del(key)
}

export async function updateAntinukeTrustedAdmins(
  guildId: string,
  ids: string[]
): Promise<void> {
  await pool.query(
    'UPDATE antinuke SET trusted_admins = $2 WHERE guild_id = $1',
    [guildId, ids.map(Number)]
  )

  const key = cacheKey(guildId)
  await redis.del(key)
}

import pool from '@/lib/db'

export interface WelcomeMessageRow {
  channel_id: string
  template: string
}

const MAX_WELCOME_CHANNELS = 2

export async function listWelcomeMessages(guildId: string): Promise<WelcomeMessageRow[]> {
  const res = await pool.query(
    `SELECT channel_id::text, template FROM welcome_message WHERE guild_id = $1::bigint ORDER BY channel_id`,
    [guildId]
  )
  return res.rows.map((r) => ({
    channel_id: String(r.channel_id),
    template: String(r.template ?? ''),
  }))
}

export async function upsertWelcomeMessage(
  guildId: string,
  channelId: string,
  template: string,
  /** When moving an existing welcome to another channel, delete this row first. */
  fromChannelId?: string | null
): Promise<void> {
  const trimmed = template.trim()
  if (!trimmed) {
    throw new Error('Welcome message cannot be empty')
  }

  const from = fromChannelId?.trim() || null
  if (from && from !== channelId) {
    const beforeMove = await listWelcomeMessages(guildId)
    if (beforeMove.some((r) => r.channel_id === from)) {
      await deleteWelcomeMessage(guildId, from)
    }
  }

  const existing = await pool.query(
    `SELECT channel_id FROM welcome_message WHERE guild_id = $1::bigint`,
    [guildId]
  )
  const channels = new Set(existing.rows.map((r) => String(r.channel_id)))
  if (!channels.has(channelId) && channels.size >= MAX_WELCOME_CHANNELS) {
    throw new Error(`You can only have up to ${MAX_WELCOME_CHANNELS} welcome messages. Remove one first.`)
  }

  await pool.query(
    `INSERT INTO welcome_message (guild_id, channel_id, template)
     VALUES ($1::bigint, $2::bigint, $3)
     ON CONFLICT (guild_id, channel_id)
     DO UPDATE SET template = EXCLUDED.template`,
    [guildId, channelId, trimmed]
  )
}

export async function deleteWelcomeMessage(guildId: string, channelId: string): Promise<boolean> {
  const res = await pool.query(
    `DELETE FROM welcome_message WHERE guild_id = $1::bigint AND channel_id = $2::bigint`,
    [guildId, channelId]
  )
  return (res.rowCount ?? 0) > 0
}

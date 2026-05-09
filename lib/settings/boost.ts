import pool from '@/lib/db'

/** Matches elara `cfg/system/boost/etc/settings` (`boost_message`). */
export interface BoostMessageRow {
  channel_id: string
  template: string
  delete_after: number | null
}

const MAX_BOOST_CHANNELS = 2

export async function listBoostMessages(guildId: string): Promise<BoostMessageRow[]> {
  const res = await pool.query(
    `SELECT channel_id::text, template, delete_after
     FROM boost_message WHERE guild_id = $1::bigint ORDER BY channel_id`,
    [guildId]
  )
  return res.rows.map((r) => ({
    channel_id: String(r.channel_id),
    template: String(r.template ?? ''),
    delete_after: r.delete_after != null ? Number(r.delete_after) : null,
  }))
}

export async function upsertBoostMessage(
  guildId: string,
  channelId: string,
  template: string,
  fromChannelId?: string | null
): Promise<void> {
  const trimmed = template.trim()
  if (!trimmed) {
    throw new Error('Boost message cannot be empty')
  }

  const from = fromChannelId?.trim() || null
  if (from && from !== channelId) {
    const beforeMove = await listBoostMessages(guildId)
    if (beforeMove.some((r) => r.channel_id === from)) {
      await deleteBoostMessage(guildId, from)
    }
  }

  const existing = await pool.query(
    `SELECT channel_id FROM boost_message WHERE guild_id = $1::bigint`,
    [guildId]
  )
  const channels = new Set(existing.rows.map((r) => String(r.channel_id)))
  if (!channels.has(channelId) && channels.size >= MAX_BOOST_CHANNELS) {
    throw new Error(`You can only have up to ${MAX_BOOST_CHANNELS} boost messages. Remove one first.`)
  }

  await pool.query(
    `INSERT INTO boost_message (guild_id, channel_id, template)
     VALUES ($1::bigint, $2::bigint, $3)
     ON CONFLICT (guild_id, channel_id)
     DO UPDATE SET template = EXCLUDED.template`,
    [guildId, channelId, trimmed]
  )
}

export async function deleteBoostMessage(guildId: string, channelId: string): Promise<boolean> {
  const res = await pool.query(
    `DELETE FROM boost_message WHERE guild_id = $1::bigint AND channel_id = $2::bigint`,
    [guildId, channelId]
  )
  return (res.rowCount ?? 0) > 0
}

import pool from '@/lib/db'

/** Matches elara `cfg/system/goodbye/etc/settings` (`goodbye_message`). */
export interface GoodbyeMessageRow {
  channel_id: string
  template: string
  delete_after: number | null
}

const MAX_GOODBYE_CHANNELS = 2

export async function listGoodbyeMessages(guildId: string): Promise<GoodbyeMessageRow[]> {
  const res = await pool.query(
    `SELECT channel_id::text, template, delete_after
     FROM goodbye_message WHERE guild_id = $1::bigint ORDER BY channel_id`,
    [guildId]
  )
  return res.rows.map((r) => ({
    channel_id: String(r.channel_id),
    template: String(r.template ?? ''),
    delete_after: r.delete_after != null ? Number(r.delete_after) : null,
  }))
}

export async function upsertGoodbyeMessage(
  guildId: string,
  channelId: string,
  template: string,
  fromChannelId?: string | null
): Promise<void> {
  const trimmed = template.trim()
  if (!trimmed) {
    throw new Error('Leave message cannot be empty')
  }

  const from = fromChannelId?.trim() || null
  if (from && from !== channelId) {
    const beforeMove = await listGoodbyeMessages(guildId)
    if (beforeMove.some((r) => r.channel_id === from)) {
      await deleteGoodbyeMessage(guildId, from)
    }
  }

  const existing = await pool.query(
    `SELECT channel_id FROM goodbye_message WHERE guild_id = $1::bigint`,
    [guildId]
  )
  const channels = new Set(existing.rows.map((r) => String(r.channel_id)))
  if (!channels.has(channelId) && channels.size >= MAX_GOODBYE_CHANNELS) {
    throw new Error(`You can only have up to ${MAX_GOODBYE_CHANNELS} leave messages. Remove one first.`)
  }

  await pool.query(
    `INSERT INTO goodbye_message (guild_id, channel_id, template, delete_after)
     VALUES ($1::bigint, $2::bigint, $3, NULL)
     ON CONFLICT (guild_id, channel_id)
     DO UPDATE SET template = EXCLUDED.template`,
    [guildId, channelId, trimmed]
  )
}

export async function deleteGoodbyeMessage(guildId: string, channelId: string): Promise<boolean> {
  const res = await pool.query(
    `DELETE FROM goodbye_message WHERE guild_id = $1::bigint AND channel_id = $2::bigint`,
    [guildId, channelId]
  )
  return (res.rowCount ?? 0) > 0
}

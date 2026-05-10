import pool from '@/lib/db'

/** List columns match `get_goodbye_messages` in elara goodbye/etc/settings/__init__.py */
export interface GoodbyeMessageRow {
  channel_id: string
  template: string
}

const MAX_GOODBYE_CHANNELS = 2

export async function listGoodbyeMessages(guildId: string): Promise<GoodbyeMessageRow[]> {
  const res = await pool.query(
    `SELECT channel_id::text, template
     FROM goodbye_message WHERE guild_id = $1::bigint ORDER BY channel_id`,
    [guildId]
  )
  return res.rows.map((r) => ({
    channel_id: String(r.channel_id),
    template: String(r.template ?? ''),
  }))
}

async function resolveGoodbyeDeleteAfter(
  guildId: string,
  channelId: string,
  fromChannelId: string | null,
  explicit: number | null | undefined
): Promise<number | null> {
  if (explicit !== undefined) return explicit
  if (fromChannelId && fromChannelId !== channelId) return null
  const cur = await pool.query(
    `SELECT delete_after FROM goodbye_message WHERE guild_id = $1::bigint AND channel_id = $2::bigint`,
    [guildId, channelId]
  )
  const v = cur.rows[0]?.delete_after
  return v != null ? Number(v) : null
}

export async function upsertGoodbyeMessage(
  guildId: string,
  channelId: string,
  template: string,
  fromChannelId?: string | null,
  /** If omitted, keeps existing `delete_after` for this channel (same as re-saving without touching it). */
  deleteAfter?: number | null
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

  const deleteAfterValue = await resolveGoodbyeDeleteAfter(guildId, channelId, from, deleteAfter)

  // Same INSERT/ON CONFLICT as `Settings.set_goodbye_message` in goodbye/etc/settings/__init__.py
  await pool.query(
    `INSERT INTO goodbye_message (guild_id, channel_id, template, delete_after)
     VALUES ($1::bigint, $2::bigint, $3, $4)
     ON CONFLICT (guild_id, channel_id)
     DO UPDATE SET
       template = EXCLUDED.template,
       delete_after = EXCLUDED.delete_after`,
    [guildId, channelId, trimmed, deleteAfterValue]
  )
}

export async function deleteGoodbyeMessage(guildId: string, channelId: string): Promise<boolean> {
  const res = await pool.query(
    `DELETE FROM goodbye_message WHERE guild_id = $1::bigint AND channel_id = $2::bigint`,
    [guildId, channelId]
  )
  return (res.rowCount ?? 0) > 0
}

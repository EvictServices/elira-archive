import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { hasGuildAdmin } from '@/lib/discord'
import { CHANNEL_SNOWFLAKE, resolveScriptTemplateFromBody } from '@/lib/settings/script_message_template'
import { listGoodbyeMessages, upsertGoodbyeMessage, deleteGoodbyeMessage } from '@/lib/settings/goodbye'
import { recordDashboardAudit } from '@/lib/settings/dashboard_audit'

function parseOptionalDeleteAfter(body: Record<string, unknown>): number | null | undefined {
  if (!('delete_after' in body)) return undefined
  const v = body.delete_after
  if (v === null) return null
  if (typeof v === 'number' && Number.isFinite(v)) return Math.max(0, Math.trunc(v))
  if (typeof v === 'string' && v.trim()) {
    const n = parseInt(v, 10)
    if (!Number.isNaN(n)) return Math.max(0, n)
  }
  return undefined
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  if (!(await hasGuildAdmin(session.accessToken, id))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const messages = await listGoodbyeMessages(id)
    return NextResponse.json(
      { messages },
      { headers: { 'Cache-Control': 'private, max-age=5, stale-while-revalidate=30' } }
    )
  } catch {
    return NextResponse.json(
      { messages: [], unavailable: true },
      { headers: { 'Cache-Control': 'private, no-store' } }
    )
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  if (!(await hasGuildAdmin(session.accessToken, id))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const channelId = typeof body.channel_id === 'string' ? body.channel_id.trim() : ''
  if (!CHANNEL_SNOWFLAKE.test(channelId)) {
    return NextResponse.json({ error: 'Invalid channel_id' }, { status: 400 })
  }

  const fromRaw = typeof body.from_channel_id === 'string' ? body.from_channel_id.trim() : ''
  const fromChannelId = fromRaw && CHANNEL_SNOWFLAKE.test(fromRaw) ? fromRaw : null

  const resolved = resolveScriptTemplateFromBody(body)
  if ('error' in resolved) {
    return NextResponse.json({ error: resolved.error }, { status: 400 })
  }

  const deleteAfter = parseOptionalDeleteAfter(body)
  if (deleteAfter === undefined && 'delete_after' in body && body.delete_after !== undefined) {
    const v = body.delete_after
    if (v !== null && typeof v !== 'number' && typeof v !== 'string') {
      return NextResponse.json({ error: 'Invalid delete_after' }, { status: 400 })
    }
    if (typeof v === 'string' && v.trim() && Number.isNaN(parseInt(v, 10))) {
      return NextResponse.json({ error: 'Invalid delete_after' }, { status: 400 })
    }
  }

  try {
    await upsertGoodbyeMessage(id, channelId, resolved.template, fromChannelId, deleteAfter)
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 })
  }

  recordDashboardAudit(session, id, 'goodbye.upsert', {
    channel_id: channelId,
    ...(fromChannelId && fromChannelId !== channelId ? { from_channel_id: fromChannelId } : {}),
    ...(deleteAfter !== undefined ? { delete_after: deleteAfter } : {}),
  })
  const messages = await listGoodbyeMessages(id)
  return NextResponse.json({ messages })
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  if (!(await hasGuildAdmin(session.accessToken, id))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const channelId = typeof body.channel_id === 'string' ? body.channel_id.trim() : ''
  if (!CHANNEL_SNOWFLAKE.test(channelId)) {
    return NextResponse.json({ error: 'Invalid channel_id' }, { status: 400 })
  }

  const removed = await deleteGoodbyeMessage(id, channelId)
  if (!removed) {
    return NextResponse.json({ error: 'No leave message for that channel' }, { status: 404 })
  }

  recordDashboardAudit(session, id, 'goodbye.delete', { channel_id: channelId })
  const messages = await listGoodbyeMessages(id)
  return NextResponse.json({ messages })
}

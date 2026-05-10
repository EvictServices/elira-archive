import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { hasGuildAdmin } from '@/lib/discord'
import { CHANNEL_SNOWFLAKE, resolveScriptTemplateFromBody } from '@/lib/settings/script_message_template'
import {
  listWelcomeMessages,
  upsertWelcomeMessage,
  deleteWelcomeMessage,
} from '@/lib/settings/welcome'
import { recordDashboardAudit } from '@/lib/settings/dashboard_audit'

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
    const messages = await listWelcomeMessages(id)
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
  const template = resolved.template

  try {
    await upsertWelcomeMessage(id, channelId, template, fromChannelId)
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 })
  }

  recordDashboardAudit(session, id, 'welcome.upsert', {
    channel_id: channelId,
    ...(fromChannelId && fromChannelId !== channelId ? { from_channel_id: fromChannelId } : {}),
  })
  const messages = await listWelcomeMessages(id)
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

  const removed = await deleteWelcomeMessage(id, channelId)
  if (!removed) {
    return NextResponse.json({ error: 'No welcome message for that channel' }, { status: 404 })
  }

  recordDashboardAudit(session, id, 'welcome.delete', { channel_id: channelId })
  const messages = await listWelcomeMessages(id)
  return NextResponse.json({ messages })
}

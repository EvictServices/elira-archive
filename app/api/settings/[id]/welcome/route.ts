import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { hasGuildAdmin } from '@/lib/discord'
import {
  defaultEmbed,
  generateScript,
  type EmbedButton,
  type EmbedData,
  type EmbedField,
} from '@/app/(home)/embeds/lib/types'
import {
  listWelcomeMessages,
  upsertWelcomeMessage,
  deleteWelcomeMessage,
} from '@/lib/settings/welcome'
import { recordDashboardAudit } from '@/lib/settings/dashboard_audit'

const SNOWFLAKE = /^\d{15,22}$/

function normalizeEmbedInput(v: unknown): EmbedData | null {
  if (!v || typeof v !== 'object') return null
  const p = v as Record<string, unknown>
  const base = defaultEmbed()
  const author =
    p.author && typeof p.author === 'object' && !Array.isArray(p.author)
      ? { ...base.author, ...(p.author as Record<string, string>) }
      : base.author
  const footer =
    p.footer && typeof p.footer === 'object' && !Array.isArray(p.footer)
      ? { ...base.footer, ...(p.footer as Record<string, string>) }
      : base.footer
  return {
    ...base,
    content: typeof p.content === 'string' ? p.content : base.content,
    color: typeof p.color === 'string' ? p.color : base.color,
    title: typeof p.title === 'string' ? p.title : base.title,
    url: typeof p.url === 'string' ? p.url : base.url,
    description: typeof p.description === 'string' ? p.description : base.description,
    thumbnail: typeof p.thumbnail === 'string' ? p.thumbnail : base.thumbnail,
    image: typeof p.image === 'string' ? p.image : base.image,
    timestamp: typeof p.timestamp === 'boolean' ? p.timestamp : base.timestamp,
    author,
    footer,
    fields: Array.isArray(p.fields) ? (p.fields as EmbedField[]) : base.fields,
    buttons: Array.isArray(p.buttons) ? (p.buttons as EmbedButton[]) : base.buttons,
  }
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
  if (!SNOWFLAKE.test(channelId)) {
    return NextResponse.json({ error: 'Invalid channel_id' }, { status: 400 })
  }

  const fromRaw = typeof body.from_channel_id === 'string' ? body.from_channel_id.trim() : ''
  const fromChannelId = fromRaw && SNOWFLAKE.test(fromRaw) ? fromRaw : null

  let template: string
  if (typeof body.template === 'string' && body.template.trim()) {
    template = body.template.trim()
  } else {
    const embed = normalizeEmbedInput(body.embed)
    if (!embed) {
      return NextResponse.json({ error: 'Provide embed or template' }, { status: 400 })
    }
    template = generateScript(embed)
  }

  if (!template.trim()) {
    return NextResponse.json({ error: 'Welcome message cannot be empty' }, { status: 400 })
  }

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
  if (!SNOWFLAKE.test(channelId)) {
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

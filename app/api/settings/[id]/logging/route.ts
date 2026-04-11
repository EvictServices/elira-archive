import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import {
  getLoggingSettings,
  setLoggingEvents,
  setEventChannel,
  deleteLoggingChannel,
  addIgnored,
  removeIgnored,
  EVENT_TYPES,
  type EventType,
} from '@/lib/settings/logging'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const settings = await getLoggingSettings(id)
  return NextResponse.json(settings)
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
  const body = await req.json()

  // Set a single event's channel
  if (body.event && typeof body.event === 'string') {
    const channelId = body.channel_id ? String(body.channel_id) : null
    try {
      await setEventChannel(id, body.event, channelId)
    } catch (err) {
      return NextResponse.json(
        { error: (err as Error).message },
        { status: 400 }
      )
    }
    const updated = await getLoggingSettings(id)
    return NextResponse.json(updated)
  }

  // Update events for a channel
  if (body.channel_id && Array.isArray(body.events)) {
    const channelId = String(body.channel_id)
    const events = body.events as string[]
    const invalid = events.filter((e) => !EVENT_TYPES.includes(e as EventType))
    if (invalid.length > 0) {
      return NextResponse.json(
        { error: `Invalid event types: ${invalid.join(', ')}` },
        { status: 400 }
      )
    }
    try {
      await setLoggingEvents(id, channelId, events)
    } catch (err) {
      return NextResponse.json(
        { error: (err as Error).message },
        { status: 400 }
      )
    }
    const updated = await getLoggingSettings(id)
    return NextResponse.json(updated)
  }

  // Add ignored target
  if (body.action === 'add_ignored' && body.target_id) {
    await addIgnored(id, String(body.target_id))
    const updated = await getLoggingSettings(id)
    return NextResponse.json(updated)
  }

  // Remove ignored target
  if (body.action === 'remove_ignored' && body.target_id) {
    await removeIgnored(id, String(body.target_id))
    const updated = await getLoggingSettings(id)
    return NextResponse.json(updated)
  }

  return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
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
  const body = await req.json()

  if (!body.channel_id) {
    return NextResponse.json({ error: 'channel_id required' }, { status: 400 })
  }

  await deleteLoggingChannel(id, String(body.channel_id))
  const updated = await getLoggingSettings(id)
  return NextResponse.json(updated)
}

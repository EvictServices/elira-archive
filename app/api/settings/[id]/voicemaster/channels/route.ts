import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { hasGuildAdmin } from '@/lib/discord'
import {
  getChannels,
  deleteChannel,
  deleteChannels,
  updateChannelOwner,
} from '@/lib/settings/voicemaster'
import {
  fetchGuildChannels,
  deleteVoicemasterChannel,
  type GuildChannel,
} from '@/lib/cluster'

interface EnrichedChannel {
  guild_id: string
  channel_id: string
  owner_id: string | null
  name: string | null
  member_count: number | null
  bitrate: number | null
  user_limit: number | null
  exists: boolean
}

async function enrich(guildId: string, base: { channel_id: string; owner_id: string | null; guild_id: string }[]): Promise<EnrichedChannel[]> {
  let live: GuildChannel[] = []
  try {
    live = await fetchGuildChannels(guildId)
  } catch {
    live = []
  }
  const liveById = new Map(live.map((c) => [String(c.id), c]))

  return base.map((row) => {
    const ch = liveById.get(row.channel_id) as
      | (GuildChannel & {
          member_count?: number
          bitrate?: number
          user_limit?: number
        })
      | undefined
    return {
      guild_id: row.guild_id,
      channel_id: row.channel_id,
      owner_id: row.owner_id,
      name: ch?.name ?? null,
      member_count: ch?.member_count ?? null,
      bitrate: ch?.bitrate ?? null,
      user_limit: ch?.user_limit ?? null,
      exists: !!ch,
    }
  })
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

  const channels = await enrich(id, await getChannels(id))
  return NextResponse.json(
    { channels },
    { headers: { 'Cache-Control': 'private, max-age=5, stale-while-revalidate=30' } }
  )
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

  const body = await req.json().catch(() => null)
  const channelId = body?.channel_id ? String(body.channel_id) : null
  const ownerId = body?.owner_id ? String(body.owner_id) : null

  if (!channelId || !ownerId) {
    return NextResponse.json(
      { error: 'channel_id and owner_id are required' },
      { status: 400 }
    )
  }

  await updateChannelOwner(channelId, ownerId)
  const channels = await enrich(id, await getChannels(id))
  return NextResponse.json({ channels })
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

  const body = await req.json().catch(() => null)
  const mode = (body?.mode as string | undefined) ?? 'hard'

  if (Array.isArray(body?.channel_ids)) {
    const ids = body.channel_ids.map((cid: unknown) => String(cid))
    const failures: string[] = []
    if (mode === 'hard') {
      for (const cid of ids) {
        try {
          const result = await deleteVoicemasterChannel(id, cid)
          if (!result?.ok) failures.push(cid)
        } catch {
          failures.push(cid)
        }
      }
    } else {
      await deleteChannels(ids)
    }
    const channels = await enrich(id, await getChannels(id))
    return NextResponse.json({
      channels,
      ...(failures.length > 0 && {
        warning: `Couldn't reach the bot for ${failures.length} channel(s)`,
      }),
    })
  }

  const channelId = body?.channel_id ? String(body.channel_id) : null
  if (!channelId) {
    return NextResponse.json(
      { error: 'channel_id or channel_ids is required' },
      { status: 400 }
    )
  }

  if (mode === 'hard') {
    try {
      const result = await deleteVoicemasterChannel(id, channelId)
      if (!result?.ok) {
        return NextResponse.json(
          {
            error:
              result?.error ||
              "Couldn't reach the bot to disconnect members. Make sure the bot is online.",
          },
          { status: 502 }
        )
      }
    } catch (err) {
      return NextResponse.json(
        {
          error:
            (err as Error).message ||
            "Couldn't reach the bot to disconnect members.",
        },
        { status: 502 }
      )
    }
  } else {
    await deleteChannel(channelId)
  }

  const channels = await enrich(id, await getChannels(id))
  return NextResponse.json({ channels })
}

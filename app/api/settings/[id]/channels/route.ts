import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { hasGuildAdmin } from '@/lib/discord'
import { fetchGuildChannels, type GuildChannel } from '@/lib/cluster'
import {
  isDiscordCategoryChannel,
  isDiscordTextChannel,
  isDiscordVoiceChannel,
} from '@/lib/guild_channel_type'

const TYPE_FILTERS: Record<string, (c: GuildChannel) => boolean> = {
  text: isDiscordTextChannel,
  voice: isDiscordVoiceChannel,
  category: isDiscordCategoryChannel,
  all: () => true,
}

export async function GET(
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

  const typeParam = req.nextUrl.searchParams.get('type') ?? 'text'
  const filter = TYPE_FILTERS[typeParam] ?? TYPE_FILTERS.text

  try {
    const channels = await fetchGuildChannels(id)
    const filtered = channels
      .filter(filter)
      .sort((a, b) => a.position - b.position)
    return NextResponse.json(filtered, {
      headers: { 'Cache-Control': 'private, max-age=60, stale-while-revalidate=120' },
    })
  } catch {
    return NextResponse.json([])
  }
}

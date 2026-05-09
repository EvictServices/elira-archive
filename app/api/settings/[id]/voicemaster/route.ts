import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { hasGuildAdmin } from '@/lib/discord'
import {
  getConfiguration,
  createConfiguration,
  deleteConfiguration,
  updateCategory,
  updateChannel,
  updateRole,
  updateRegion,
  updateBitrate,
  REGIONS,
  type Region,
} from '@/lib/settings/voicemaster'

function asSnowflakeOrNull(value: unknown): string | null {
  if (value === null || value === undefined || value === '') return null
  return String(value)
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

  const configuration = await getConfiguration(id)
  return NextResponse.json(
    { configuration },
    { headers: { 'Cache-Control': 'private, max-age=5, stale-while-revalidate=30' } }
  )
}

export async function POST(
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
  const categoryId = asSnowflakeOrNull(body?.category_id)
  const interfaceId = asSnowflakeOrNull(body?.interface_id)
  const channelId = asSnowflakeOrNull(body?.channel_id)

  if (!categoryId || !interfaceId || !channelId) {
    return NextResponse.json(
      { error: 'category_id, interface_id, and channel_id are required' },
      { status: 400 }
    )
  }

  const existing = await getConfiguration(id)
  if (existing) {
    return NextResponse.json(
      { error: 'VoiceMaster is already configured for this server' },
      { status: 409 }
    )
  }

  try {
    const configuration = await createConfiguration(
      id,
      categoryId,
      interfaceId,
      channelId
    )
    return NextResponse.json({ configuration })
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 400 }
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

  const body = await req.json().catch(() => null)
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  try {
    if ('category_id' in body) {
      await updateCategory(id, asSnowflakeOrNull(body.category_id))
    }

    if ('channel_id' in body) {
      const channelId = asSnowflakeOrNull(body.channel_id)
      if (!channelId) {
        return NextResponse.json(
          { error: 'channel_id is required when updating the join-to-create channel' },
          { status: 400 }
        )
      }
      await updateChannel(id, channelId)
    }

    if ('role_id' in body) {
      await updateRole(id, asSnowflakeOrNull(body.role_id))
    }

    if ('region' in body) {
      const region = body.region
      if (region !== null && region !== undefined && region !== '') {
        if (typeof region !== 'string' || !REGIONS.includes(region as Region)) {
          return NextResponse.json(
            { error: `Region must be one of: ${REGIONS.join(', ')}` },
            { status: 400 }
          )
        }
        await updateRegion(id, region as Region)
      } else {
        await updateRegion(id, null)
      }
    }

    if ('bitrate' in body) {
      const bitrate = body.bitrate
      if (bitrate === null || bitrate === undefined || bitrate === '') {
        await updateBitrate(id, null)
      } else {
        const value = Number(bitrate)
        if (!Number.isFinite(value)) {
          return NextResponse.json({ error: 'Bitrate must be a number' }, { status: 400 })
        }
        await updateBitrate(id, value)
      }
    }
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 400 }
    )
  }

  const updated = await getConfiguration(id)
  return NextResponse.json({ configuration: updated })
}

export async function DELETE(
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

  const deleted = await deleteConfiguration(id)
  if (!deleted) {
    return NextResponse.json(
      { error: 'VoiceMaster is not configured for this server' },
      { status: 404 }
    )
  }

  return NextResponse.json({ deleted })
}

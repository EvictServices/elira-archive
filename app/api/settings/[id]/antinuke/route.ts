import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import {
  getAntinukeSettings,
  updateAntinukeModule,
  updateAntinukeBotToggle,
} from '@/lib/settings/antinuke'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const settings = await getAntinukeSettings(id)
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

  if (body.module && typeof body.module === 'string') {
    const config = body.config ?? null
    try {
      await updateAntinukeModule(id, body.module, config)
    } catch (err) {
      return NextResponse.json(
        { error: (err as Error).message },
        { status: 400 }
      )
    }
    const updated = await getAntinukeSettings(id)
    return NextResponse.json(updated)
  }

  if (typeof body.bot === 'boolean') {
    await updateAntinukeBotToggle(id, body.bot)
    const updated = await getAntinukeSettings(id)
    return NextResponse.json(updated)
  }

  return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
}

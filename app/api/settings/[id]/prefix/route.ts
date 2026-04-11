import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getGuildPrefix, updateGuildPrefix } from '@/lib/settings/prefix'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const prefix = await getGuildPrefix(id)
  return NextResponse.json({ prefix }, {
    headers: { 'Cache-Control': 'private, max-age=5, stale-while-revalidate=30' },
  })
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
  const prefix = body?.prefix

  if (typeof prefix !== 'string' || prefix.length < 1 || prefix.length > 7) {
    return NextResponse.json(
      { error: 'Prefix must be between 1 and 7 characters' },
      { status: 400 }
    )
  }

  await updateGuildPrefix(id, prefix)
  return NextResponse.json({ prefix })
}

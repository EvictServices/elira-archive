import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { hasGuildAdmin } from '@/lib/discord'
import { fetchGuildRoles } from '@/lib/cluster'

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
    const roles = await fetchGuildRoles(id)
    const filtered = roles
      .filter((r) => !r.is_default && !r.is_bot_managed && !r.is_premium_subscriber && !r.is_integration)
      .sort((a, b) => b.position - a.position)
    return NextResponse.json(filtered, {
      headers: { 'Cache-Control': 'private, max-age=60, stale-while-revalidate=120' },
    })
  } catch {
    return NextResponse.json([])
  }
}
